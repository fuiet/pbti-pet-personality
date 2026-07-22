import { NextResponse } from "next/server";
import { buildMiniProgramAuthError, resolveRequestUserId } from "@/lib/miniprogramSession";

export const runtime = "edge";

function isPetSchemaColumnError(error: { message?: string } | null | undefined) {
  const message = error?.message?.toLowerCase() || "";
  const mentionsPetOptionalColumn =
    message.includes("age") || message.includes("gender") || message.includes("photo_url") || message.includes("photo_urls");

  return (
    mentionsPetOptionalColumn &&
    (message.includes("schema cache") ||
      message.includes("could not find") ||
      message.includes("column") ||
      message.includes("invalid input syntax"))
  );
}

function isGenderSchemaColumnError(error: { message?: string } | null | undefined) {
  const message = error?.message?.toLowerCase() || "";
  return message.includes("gender") && (message.includes("schema cache") || message.includes("could not find") || message.includes("column"));
}

function normalizeGender(value: unknown) {
  if (value === "male" || value === "female") return value;
  if (value === "公") return "male";
  if (value === "母") return "female";
  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const species = body?.species === "cat" ? "cat" : body?.species === "dog" ? "dog" : "";
    const breed = typeof body?.breed === "string" ? body.breed.trim() : "";
    const age = typeof body?.age === "string" ? body.age.trim() : "";
    const gender = normalizeGender(body?.gender);

    if (!name) {
      return NextResponse.json({ error: "宠物名字不能为空。" }, { status: 400 });
    }

    if (!species) {
      return NextResponse.json({ error: "宠物类型必须是猫咪或狗狗。" }, { status: 400 });
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

    const insertPayload = {
      user_id: userId,
      name,
      species,
      breed: breed || null,
    };

    let response: any = await supabase
      .from("pets")
      .insert({
        ...insertPayload,
        age: age || null,
        gender,
      })
      .select("id,user_id,name,species,breed,age,gender,photo_url,photo_urls,created_at")
      .single();

    if (response.error && isGenderSchemaColumnError(response.error)) {
      response = await supabase
        .from("pets")
        .insert({
          ...insertPayload,
          age: age || null,
        })
        .select("id,user_id,name,species,breed,age,photo_url,photo_urls,created_at")
        .single();
    }

    if (response.error && isPetSchemaColumnError(response.error)) {
      response = await supabase
        .from("pets")
        .insert(insertPayload)
        .select("id,user_id,name,species,breed,created_at")
        .single();
    }

    if (response.error) {
      return NextResponse.json({ error: response.error.message }, { status: 500 });
    }

    return NextResponse.json({
      pet: {
        ...response.data,
        photo_url: response.data?.photo_url || null,
        photo_urls: Array.isArray(response.data?.photo_urls) ? response.data.photo_urls.filter(Boolean) : [],
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "创建宠物档案失败。" }, { status: 500 });
  }
}
