import { NextResponse } from "next/server";
import { buildMiniProgramAuthError, resolveRequestUserId } from "@/lib/miniprogramSession";

export const runtime = "edge";

function makeRecordId() {
  return `PBTI-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

function isResultReportSchemaError(error: { message?: string } | null | undefined) {
  const message = error?.message?.toLowerCase() || "";
  return message.includes("report") && (message.includes("schema cache") || message.includes("could not find") || message.includes("column"));
}

function isResultUserSchemaError(error: { message?: string } | null | undefined) {
  const message = error?.message?.toLowerCase() || "";
  return message.includes("user_id") && (message.includes("schema cache") || message.includes("could not find") || message.includes("column"));
}

function normalizeAnswers(value: unknown) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string" && item) : [];
}

function normalizeDimensions(value: unknown) {
  if (!Array.isArray(value)) return [50, 50, 50, 50];
  return value.slice(0, 4).map((item) => {
    const score = Number(item);
    if (Number.isFinite(score)) return Math.max(0, Math.min(100, score));
    return 50;
  });
}

function buildReportFromPayload(petName: string, personalityDesc: string, personalityName: string, personalityTitle: string, traits: string[], dimensions: number[], fit: number, answers: string[]) {
  return {
    summary: personalityDesc || `${petName} 的 PBTI 结果已生成。`,
    personalityName,
    personalityTitle,
    traits,
    dimensions,
    fit,
    answers,
    source: "miniprogram",
    generatedAt: new Date().toISOString(),
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const petId = typeof body?.petId === "string" ? body.petId.trim() : "";
    const code = typeof body?.code === "string" ? body.code.trim().toUpperCase() : "";
    const personalityName = typeof body?.personalityName === "string" ? body.personalityName.trim() : "";
    const personalityTitle = typeof body?.personalityTitle === "string" ? body.personalityTitle.trim() : "";
    const personalityDesc = typeof body?.personalityDesc === "string" ? body.personalityDesc.trim() : "";
    const traits = Array.isArray(body?.traits) ? body.traits.filter((item: unknown) => typeof item === "string" && item).slice(0, 6) : [];
    const fit = Math.max(0, Math.min(100, Number(body?.fit) || 0));
    const dimensions = normalizeDimensions(body?.dimensions);
    const answers = normalizeAnswers(body?.answers);

    if (!petId) {
      return NextResponse.json({ error: "petId 不能为空。" }, { status: 400 });
    }

    if (!code) {
      return NextResponse.json({ error: "性格编码不能为空。" }, { status: 400 });
    }

    const { supabase, userId, miniProgramSession } = await resolveRequestUserId(request);
    if (!userId) {
      if (miniProgramSession) {
        return NextResponse.json({
          ...buildMiniProgramAuthError(),
          sessionMode: miniProgramSession.mode,
        }, { status: 401 });
      }
      return NextResponse.json({ error: "请先完成登录。" }, { status: 401 });
    }

    const { data: pet, error: petError } = await supabase
      .from("pets")
      .select("id,user_id,name,species,breed,age,gender,photo_url,photo_urls,created_at")
      .eq("id", petId)
      .eq("user_id", userId)
      .maybeSingle();

    if (petError) {
      return NextResponse.json({ error: petError.message }, { status: 500 });
    }

    if (!pet) {
      return NextResponse.json({ error: "没有找到对应的宠物档案。" }, { status: 404 });
    }

    const pbtiId = makeRecordId();
    const report = buildReportFromPayload(pet.name, personalityDesc, personalityName, personalityTitle, traits, dimensions, fit, answers);

    const legacyInsertPayload = {
      pet_id: petId,
      pbti_id: pbtiId,
      personality_type: code,
      scores: {
        attachment: dimensions[0],
        exploration: dimensions[1],
        vitality: dimensions[2],
        playfulness: dimensions[3],
        fit,
        dimensions,
      },
    };

    const insertPayload = {
      ...legacyInsertPayload,
      user_id: userId,
    };

    let response: any = await supabase
      .from("personality_results")
      .insert({
        ...insertPayload,
        report,
      })
      .select("id,pbti_id,personality_type,scores,report,created_at,pet_id")
      .single();

    if (response.error && isResultReportSchemaError(response.error)) {
      response = await supabase
        .from("personality_results")
        .insert(insertPayload)
        .select("id,pbti_id,personality_type,scores,created_at,pet_id")
        .single();
    }

    if (response.error && isResultUserSchemaError(response.error)) {
      response = await supabase
        .from("personality_results")
        .insert({
          ...legacyInsertPayload,
          report,
        })
        .select("id,pbti_id,personality_type,scores,report,created_at,pet_id")
        .single();
    }

    if (response.error && isResultUserSchemaError(response.error) && isResultReportSchemaError(response.error)) {
      response = await supabase
        .from("personality_results")
        .insert(legacyInsertPayload)
        .select("id,pbti_id,personality_type,scores,created_at,pet_id")
        .single();
    }

    if (response.error) {
      return NextResponse.json({ error: response.error.message }, { status: 500 });
    }

    return NextResponse.json({
      record: {
        id: response.data.id,
        pbtiId: response.data.pbti_id,
        personalityType: response.data.personality_type,
        createdAt: response.data.created_at,
        petId: response.data.pet_id,
        pet,
        report: response.data.report || report,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "保存测试结果失败。" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { supabase, userId, miniProgramSession } = await resolveRequestUserId(request);
    if (!userId) {
      if (miniProgramSession) {
        return NextResponse.json({
          ...buildMiniProgramAuthError(),
          sessionMode: miniProgramSession.mode,
        }, { status: 401 });
      }
      return NextResponse.json({ error: "请先完成登录。" }, { status: 401 });
    }

    const { data: pets, error: petError } = await supabase
      .from("pets")
      .select("id,user_id,name,species,breed,age,gender,photo_url,photo_urls,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (petError) {
      return NextResponse.json({ error: petError.message }, { status: 500 });
    }

    const petIds = (pets || []).map((pet) => pet.id);
    if (!petIds.length) {
      return NextResponse.json({ records: [] });
    }

    let response: any = await supabase
      .from("personality_results")
      .select("id,pbti_id,personality_type,scores,report,created_at,pet_id")
      .in("pet_id", petIds)
      .order("created_at", { ascending: false });

    if (response.error && isResultReportSchemaError(response.error)) {
      response = await supabase
        .from("personality_results")
        .select("id,pbti_id,personality_type,scores,created_at,pet_id")
        .in("pet_id", petIds)
        .order("created_at", { ascending: false });
    }

    if (response.error) {
      return NextResponse.json({ error: response.error.message }, { status: 500 });
    }

    const petMap = new Map((pets || []).map((pet) => [pet.id, pet]));
    const records = (response.data || []).map((item: any) => ({
      id: item.id,
      pbtiId: item.pbti_id,
      personalityType: item.personality_type,
      scores: item.scores || {},
      report: item.report || null,
      createdAt: item.created_at,
      petId: item.pet_id,
      pet: petMap.get(item.pet_id) || null,
    }));

    return NextResponse.json({ records });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "读取历史结果失败。" }, { status: 500 });
  }
}
