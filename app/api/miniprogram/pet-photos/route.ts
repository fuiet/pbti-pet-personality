import { NextResponse } from "next/server";
import { buildMiniProgramAuthError, resolveRequestUserId } from "@/lib/miniprogramSession";

export const runtime = "edge";

const PET_PHOTO_BUCKET = process.env.PBTI_PORTRAIT_BUCKET || "pet-portraits";

function extensionForContentType(contentType: string) {
  if (contentType.includes("image/png")) return "png";
  if (contentType.includes("image/webp")) return "webp";
  if (contentType.includes("image/jpeg")) return "jpg";
  return "img";
}

function parsePhotoUrls(value: unknown) {
  if (Array.isArray(value)) return value.filter((item) => typeof item === "string" && item);
  return [];
}

function isPetPhotoSchemaError(error: { message?: string } | null | undefined) {
  const message = error?.message?.toLowerCase() || "";
  return (
    (message.includes("photo_urls") || message.includes("photo_url")) &&
    (message.includes("schema cache") || message.includes("could not find") || message.includes("column"))
  );
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const petId = String(formData.get("petId") || "").trim();
    const index = Math.max(0, Math.min(2, Number(formData.get("index") || 0) || 0));

    if (!petId) {
      return NextResponse.json({ error: "petId is required." }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "An image file is required." }, { status: 400 });
    }

    const contentType = file.type || "application/octet-stream";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are supported." }, { status: 400 });
    }

    const { supabase, userId, miniProgramSession } = await resolveRequestUserId(request);
    if (!userId) {
      if (miniProgramSession) {
        return NextResponse.json({
          ...buildMiniProgramAuthError(),
          sessionMode: miniProgramSession.mode,
        }, { status: 401 });
      }
      return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
    }

    const { data: pet, error: petError } = await supabase
      .from("pets")
      .select("id,user_id,photo_url,photo_urls")
      .eq("id", petId)
      .eq("user_id", userId)
      .maybeSingle();

    if (petError) {
      return NextResponse.json({ error: petError.message }, { status: 500 });
    }

    if (!pet) {
      return NextResponse.json({ error: "Pet profile was not found." }, { status: 404 });
    }

    const bytes = await file.arrayBuffer();
    if (!bytes.byteLength) {
      return NextResponse.json({ error: "Uploaded image is empty." }, { status: 400 });
    }

    const storagePath = `${userId}/${petId}/pet-photos/${Date.now()}-${index}.${extensionForContentType(contentType)}`;
    const upload = await supabase.storage.from(PET_PHOTO_BUCKET).upload(storagePath, bytes, {
      contentType,
      cacheControl: "31536000",
      upsert: false,
    });

    if (upload.error) {
      return NextResponse.json({ error: `Photo upload failed: ${upload.error.message}` }, { status: 500 });
    }

    const publicUrl = supabase.storage.from(PET_PHOTO_BUCKET).getPublicUrl(storagePath).data.publicUrl;
    const nextPhotoUrls = parsePhotoUrls((pet as any).photo_urls);
    nextPhotoUrls[index] = publicUrl;
    const normalizedPhotoUrls = nextPhotoUrls.filter(Boolean).slice(0, 3);

    let updateError: { message?: string } | null = null;
    const primaryPhoto = normalizedPhotoUrls[0] || publicUrl;

    const updateWithList = await supabase
      .from("pets")
      .update({
        photo_url: primaryPhoto,
        photo_urls: normalizedPhotoUrls,
      })
      .eq("id", petId)
      .eq("user_id", userId);

    updateError = updateWithList.error;

    if (updateError && isPetPhotoSchemaError(updateError)) {
      const updateFallback = await supabase
        .from("pets")
        .update({ photo_url: primaryPhoto })
        .eq("id", petId)
        .eq("user_id", userId);
      updateError = updateFallback.error;
    }

    if (updateError) {
      await supabase.storage.from(PET_PHOTO_BUCKET).remove([storagePath]);
      return NextResponse.json({ error: updateError.message || "Unable to save pet photo URLs." }, { status: 500 });
    }

    return NextResponse.json({
      url: publicUrl,
      photoUrls: normalizedPhotoUrls.length ? normalizedPhotoUrls : [publicUrl],
      storagePath,
      bucket: PET_PHOTO_BUCKET,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to upload pet photo." }, { status: 500 });
  }
}
