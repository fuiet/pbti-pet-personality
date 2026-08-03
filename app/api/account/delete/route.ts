import { createApiRequestTracker } from "@/lib/apiRequestMetrics";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "edge";

const PORTRAIT_BUCKET = process.env.PBTI_PORTRAIT_BUCKET || "pet-portraits";
const MAX_REQUEST_BYTES = 10_000;

export async function POST(request: Request) {
  const tracker = createApiRequestTracker({ request, route: "/api/account/delete" });
  const fail = (message: string, status: number) => {
    tracker.setError(message);
    return tracker.json({ error: message }, { status });
  };

  try {
    const declaredRequestLength = Number(request.headers.get("content-length") || 0);
    if (declaredRequestLength > MAX_REQUEST_BYTES) {
      return fail("The delete request is too large.", 413);
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
      return fail("Please sign in first.", 401);
    }

    tracker.setUserId(user.id);

    if (action === "report") {
      if (!recordId) return fail("recordId is required.", 400);

      const { data, error } = await supabase
        .from("personality_results")
        .delete()
        .eq("id", recordId)
        .eq("user_id", user.id)
        .select("id")
        .maybeSingle();

      if (error) return fail(error.message, 500);
      if (!data) return fail("The report was not found or you do not have access to it.", 404);

      return tracker.json({ deleted: "report", id: data.id });
    }

    if (action === "portrait") {
      if (!portraitId) return fail("portraitId is required.", 400);

      const { data: portrait, error: portraitError } = await supabase
        .from("pet_portraits")
        .select("id,storage_path")
        .eq("id", portraitId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (portraitError) {
        if (portraitError.code === "42P01") {
          return fail("Portrait storage is not configured yet.", 503);
        }
        return fail(portraitError.message, 500);
      }
      if (!portrait) return fail("The portrait was not found or you do not have access to it.", 404);

      const { data: deletedPortrait, error: deleteError } = await supabase
        .from("pet_portraits")
        .delete()
        .eq("id", portraitId)
        .eq("user_id", user.id)
        .select("id")
        .maybeSingle();

      if (deleteError) return fail(deleteError.message, 500);
      if (!deletedPortrait) return fail("Portrait deletion failed.", 404);

      let storageWarning: string | undefined;
      if (portrait.storage_path) {
        const { error: storageError } = await supabase.storage.from(PORTRAIT_BUCKET).remove([portrait.storage_path]);
        if (storageError) {
          storageWarning = "Portrait record deleted, but the storage file may need manual cleanup.";
        }
      }

      return tracker.json({ deleted: "portrait", id: deletedPortrait.id, storageWarning });
    }

    return fail("Unsupported delete action.", 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete this item.";
    tracker.setError(message);
    return tracker.json({ error: message }, { status: 500 });
  } finally {
    await tracker.flush();
  }
}
