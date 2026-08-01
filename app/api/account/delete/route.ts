import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "edge";

const PORTRAIT_BUCKET = process.env.PBTI_PORTRAIT_BUCKET || "pet-portraits";
const MAX_REQUEST_BYTES = 10_000;

export async function POST(request: Request) {
  try {
    const declaredRequestLength = Number(request.headers.get("content-length") || 0);
    if (declaredRequestLength > MAX_REQUEST_BYTES) {
      return NextResponse.json({ error: "The delete request is too large." }, { status: 413 });
    }

    const body = await request.json() as {
      action?: unknown;
      recordId?: unknown;
      portraitId?: unknown;
    };
    const action = body.action;
    const recordId = typeof body.recordId === "string" ? body.recordId.trim() : "";
    const portraitId = typeof body.portraitId === "string" ? body.portraitId.trim() : "";
    const supabase = await createSupabaseServerClient();
    const { data: userResult } = await supabase.auth.getUser();
    const user = userResult.user;

    if (!user) {
      return NextResponse.json({ error: "请先登录。" }, { status: 401 });
    }

    if (action === "report") {
      if (!recordId) return NextResponse.json({ error: "recordId 不能为空。" }, { status: 400 });

      const { data, error } = await supabase
        .from("personality_results")
        .delete()
        .eq("id", recordId)
        .eq("user_id", user.id)
        .select("id")
        .maybeSingle();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      if (!data) return NextResponse.json({ error: "没有找到这份报告，或者你没有权限。" }, { status: 404 });
      return NextResponse.json({ deleted: "report", id: data.id });
    }

    if (action === "portrait") {
      if (!portraitId) return NextResponse.json({ error: "portraitId 不能为空。" }, { status: 400 });

      const { data: portrait, error: portraitError } = await supabase
        .from("pet_portraits")
        .select("id,storage_path")
        .eq("id", portraitId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (portraitError) {
        if (portraitError.code === "42P01") {
          return NextResponse.json({ error: "写真存储还未配置。" }, { status: 503 });
        }
        return NextResponse.json({ error: portraitError.message }, { status: 500 });
      }
      if (!portrait) return NextResponse.json({ error: "没有找到这张写真，或者你没有权限。" }, { status: 404 });

      const { data: deletedPortrait, error: deleteError } = await supabase
        .from("pet_portraits")
        .delete()
        .eq("id", portraitId)
        .eq("user_id", user.id)
        .select("id")
        .maybeSingle();

      if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });
      if (!deletedPortrait) return NextResponse.json({ error: "写真删除失败。" }, { status: 404 });

      let storageWarning: string | undefined;
      if (portrait.storage_path) {
        const { error: storageError } = await supabase.storage.from(PORTRAIT_BUCKET).remove([portrait.storage_path]);
        if (storageError) storageWarning = "写真记录已删除，但存储文件可能需要手动清理。";
      }

      return NextResponse.json({ deleted: "portrait", id: deletedPortrait.id, storageWarning });
    }

    return NextResponse.json({ error: "不支持的删除操作。" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "无法删除该项目。" }, { status: 500 });
  }
}
