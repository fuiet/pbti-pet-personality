import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "edge";

const PORTRAIT_BUCKET = process.env.PBTI_PORTRAIT_BUCKET || "pet-portraits";

export async function POST(request: Request) {
  try {
    const { action, recordId, petId } = await request.json();
    const supabase = await createSupabaseServerClient();
    const { data: userResult } = await supabase.auth.getUser();
    const user = userResult.user;

    if (!user) {
      return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
    }

    if (action === "report") {
      if (!recordId) return NextResponse.json({ error: "recordId is required." }, { status: 400 });

      const { data, error } = await supabase
        .from("personality_results")
        .delete()
        .eq("id", recordId)
        .eq("user_id", user.id)
        .select("id")
        .maybeSingle();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      if (!data) return NextResponse.json({ error: "Report not found or access denied." }, { status: 404 });
      return NextResponse.json({ deleted: "report", id: data.id });
    }

    if (action === "pet") {
      if (!petId) return NextResponse.json({ error: "petId is required." }, { status: 400 });

      const { data: pet, error: petError } = await supabase
        .from("pets")
        .select("id")
        .eq("id", petId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (petError) return NextResponse.json({ error: petError.message }, { status: 500 });
      if (!pet) return NextResponse.json({ error: "Pet not found or access denied." }, { status: 404 });

      const { data: portraitRows, error: portraitError } = await supabase
        .from("pet_portraits")
        .select("storage_path")
        .eq("pet_id", petId)
        .eq("user_id", user.id);

      if (portraitError && portraitError.code !== "42P01") {
        return NextResponse.json({ error: portraitError.message }, { status: 500 });
      }

      const { data: deletedPet, error: deleteError } = await supabase
        .from("pets")
        .delete()
        .eq("id", petId)
        .eq("user_id", user.id)
        .select("id")
        .maybeSingle();

      if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });
      if (!deletedPet) return NextResponse.json({ error: "Pet could not be deleted." }, { status: 404 });

      const storagePaths = (portraitRows || [])
        .map((row) => row.storage_path)
        .filter((path): path is string => Boolean(path));
      let storageWarning: string | undefined;

      if (storagePaths.length) {
        const { error: storageError } = await supabase.storage.from(PORTRAIT_BUCKET).remove(storagePaths);
        if (storageError) storageWarning = "The pet was deleted, but some portrait files may require storage cleanup.";
      }

      return NextResponse.json({ deleted: "pet", id: deletedPet.id, storageWarning });
    }

    return NextResponse.json({ error: "Unsupported delete action." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete this item." }, { status: 500 });
  }
}
