import { NextResponse } from "next/server";
import { personalities, defaultPersonalityCode } from "@/data/personalities";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildPortraitPrompt, PORTRAIT_PROMPT_VERSION, PORTRAIT_STYLES, type PortraitStyle } from "@/lib/portraitPrompts";
import { normalizeVisualProfile } from "@/lib/visualProfile";
import { buildTemplateStyleId, findPortraitStudioTemplate } from "@/lib/portraitStudioTemplates";

export const runtime = "edge";

const IMAGE_MODEL = process.env.QWEN_IMAGE_MODEL || "wan2.7-image";
const IMAGE_ENDPOINT = process.env.QWEN_IMAGE_ENDPOINT || "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation";
const PORTRAIT_BUCKET = process.env.PBTI_PORTRAIT_BUCKET || "pet-portraits";
// DashScope image-to-image generation accepts up to 2K. Keep this fixed so a
// stale 4K environment override cannot make portrait generation fail.
const IMAGE_SIZE_BY_STYLE: Record<string, string> = {
  "white-sketch-avatar": "2048*2048",
  "vertical-campaign": "1632*2048",
  "landscape-campaign": "2048*1360",
};

function imageSizeForStyle(styleId: string) {
  return IMAGE_SIZE_BY_STYLE[styleId.split("--")[0]] || "2K";
}

function isMissingPortraitTable(error: { message?: string; code?: string } | null | undefined) {
  const message = error?.message?.toLowerCase() || "";
  return error?.code === "42P01" || message.includes("pet_portraits") || message.includes("schema cache");
}

function extractImageUrl(data: any) {
  const content = data?.output?.choices?.[0]?.message?.content;
  if (Array.isArray(content)) {
    const image = content.find((item) => item?.type === "image" || item?.image);
    if (typeof image?.image === "string") return image.image;
  }
  return typeof data?.output?.image === "string" ? data.output.image : null;
}

function extensionForContentType(contentType: string) {
  if (contentType.includes("image/png")) return "png";
  if (contentType.includes("image/webp")) return "webp";
  if (contentType.includes("image/jpeg")) return "jpg";
  return "img";
}

async function savePortraitAsset(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  petId: string,
  style: PortraitStyle,
  prompt: string,
  imageUrl: string,
  model: string,
) {
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) throw new Error("The generated portrait could not be downloaded for permanent storage.");

  const bytes = await imageResponse.arrayBuffer();
  const contentType = imageResponse.headers.get("content-type") || "application/octet-stream";
  if (!contentType.toLowerCase().startsWith("image/") || bytes.byteLength === 0) {
    throw new Error("The image service returned an invalid portrait file.");
  }
  const storagePath = `${userId}/${petId}/${crypto.randomUUID()}.${extensionForContentType(contentType)}`;
  const upload = await supabase.storage.from(PORTRAIT_BUCKET).upload(storagePath, bytes, {
    contentType,
    cacheControl: "31536000",
    upsert: false,
  });
  if (upload.error) throw new Error(`Portrait storage failed: ${upload.error.message}`);

  const persistedUrl = supabase.storage.from(PORTRAIT_BUCKET).getPublicUrl(storagePath).data.publicUrl;

  const { data, error } = await supabase
    .from("pet_portraits")
    .insert({
      pet_id: petId,
      user_id: userId,
      style_id: style.id,
      style_name: style.name,
      image_url: persistedUrl,
      storage_path: storagePath,
      model,
      prompt,
    })
    .select("id,style_id,style_name,image_url,storage_path,created_at")
    .single();

  if (error?.code === "23505") {
    await supabase.storage.from(PORTRAIT_BUCKET).remove([storagePath]);
    const { data: existing } = await supabase
      .from("pet_portraits")
      .select("id,style_id,style_name,image_url,storage_path,created_at")
      .eq("pet_id", petId)
      .eq("user_id", userId)
      .eq("style_id", style.id)
      .maybeSingle();
    if (existing) return existing;
  }

  if (error) {
    await supabase.storage.from(PORTRAIT_BUCKET).remove([storagePath]);
    if (isMissingPortraitTable(error)) throw new Error("Portrait persistence is not configured.");
    throw new Error(error.message);
  }

  if (!data) {
    await supabase.storage.from(PORTRAIT_BUCKET).remove([storagePath]);
    throw new Error("The generated portrait could not be saved.");
  }

  return data;
}

async function createPortraitPetRecord(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  species: "cat" | "dog",
  petName?: string,
) {
  const trimmedName = typeof petName === "string" ? petName.trim() : "";
  const fallbackName = `${species === "dog" ? "Dog" : "Cat"} Portrait ${new Date().toISOString().slice(0, 16).replace("T", " ")}`;
  const { data, error } = await supabase
    .from("pets")
    .insert({
      user_id: userId,
      name: trimmedName || fallbackName,
      species,
      breed: null,
      age: null,
      gender: null,
    })
    .select("id,name,species")
    .single();

  if (error) {
    throw new Error(`Unable to prepare a pet profile for portrait generation: ${error.message}`);
  }

  return data as { id: string; name: string; species: "cat" | "dog" };
}

export async function POST(request: Request) {
  try {
    const { petId, resultId, styleId, templateId, ownerPhotos, customPrompt, petPhotos, petSpecies, petName } = await request.json();

    const supabase = await createSupabaseServerClient();
    const { data: userResult } = await supabase.auth.getUser();
    const user = userResult.user;
    if (!user) return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });

    const uploadedPetPhotos = Array.isArray(petPhotos) ? petPhotos.filter((item) => typeof item === "string" && item).slice(0, 3) : [];
    let pet: any = null;
    let species: "cat" | "dog" | null = null;
    let photos: string[] = [];
    let resolvedPetId = typeof petId === "string" && petId ? petId : "";

    if (resolvedPetId) {
      const { data: petRow, error: petError } = await supabase.from("pets").select("*").eq("id", resolvedPetId).eq("user_id", user.id).maybeSingle();
      if (petError) return NextResponse.json({ error: petError.message }, { status: 500 });
      if (!petRow) return NextResponse.json({ error: "Pet profile was not found." }, { status: 404 });

      pet = petRow;
      species = pet.species === "dog" ? "dog" : pet.species === "cat" ? "cat" : null;
      photos = Array.isArray(pet.photo_urls) ? pet.photo_urls.filter(Boolean).slice(0, 3) : [];
      if (!photos.length && typeof pet.photo_url === "string" && pet.photo_url) photos.push(pet.photo_url);
    } else {
      species = petSpecies === "dog" ? "dog" : petSpecies === "cat" ? "cat" : null;
      photos = uploadedPetPhotos;
      if (!species) return NextResponse.json({ error: "petSpecies is required when generating from new uploads." }, { status: 400 });
      if (!photos.length) return NextResponse.json({ error: "Upload at least one pet photo before generating portraits." }, { status: 400 });

      const createdPet = await createPortraitPetRecord(supabase, user.id, species, typeof petName === "string" ? petName : "");
      resolvedPetId = createdPet.id;
      pet = {
        id: createdPet.id,
        name: createdPet.name,
        species: createdPet.species,
        breed: null,
        age: null,
        gender: null,
        photo_url: null,
        photo_urls: [],
      };
    }

    if (!species) return NextResponse.json({ error: "A cat or dog profile is required." }, { status: 400 });
    if (!photos.length) return NextResponse.json({ error: "Upload at least one pet photo before generating portraits." }, { status: 400 });

    const selectedTemplate = typeof templateId === "string" ? findPortraitStudioTemplate(templateId) : null;
    const resolvedStyleId = selectedTemplate ? buildTemplateStyleId(selectedTemplate, PORTRAIT_PROMPT_VERSION) : styleId;

    if (resolvedStyleId && selectedTemplate?.mode !== "duo" && resolvedPetId && uploadedPetPhotos.length === 0) {
      const { data: existing, error: existingError } = await supabase
        .from("pet_portraits")
        .select("id,style_id,style_name,image_url,storage_path,created_at")
        .eq("pet_id", resolvedPetId)
        .eq("user_id", user.id)
        .eq("style_id", resolvedStyleId)
        .maybeSingle();

      if (existingError && isMissingPortraitTable(existingError)) {
        return NextResponse.json({ error: "Portrait persistence is not configured. Run supabase/pet-portraits.sql before generating portraits." }, { status: 503 });
      }
      if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 });

      if (existing) {
        return NextResponse.json({ portrait: existing, style: { id: existing.style_id, name: existing.style_name }, petName: pet.name, reused: true });
      }
    }

    const { data: result } = resultId
      ? await supabase.from("personality_results").select("personality_type").eq("pbti_id", resultId).eq("user_id", user.id).maybeSingle()
      : { data: null };
    const personality = personalities[result?.personality_type as keyof typeof personalities] || personalities[defaultPersonalityCode];

    const { data: visualRow } = await supabase
      .from("pet_visual_profiles")
      .select("species,breed_candidates,coat,face,body_language,visual_signals,photo_quality,raw_analysis")
      .eq("pet_id", resolvedPetId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const visualProfile = visualRow
      ? normalizeVisualProfile({
          species: visualRow.species,
          breedCandidates: visualRow.breed_candidates,
          breedAssessment: visualRow.raw_analysis?.raw?.breedAssessment,
          coat: visualRow.coat,
          face: visualRow.face,
          bodyLanguage: visualRow.body_language,
          visualSignals: visualRow.visual_signals,
          photoQuality: visualRow.photo_quality,
          summary: visualRow.raw_analysis?.raw?.summary,
        })
      : null;

    const baseStyleId = typeof resolvedStyleId === "string" ? resolvedStyleId.split("--")[0] : undefined;
    const style: PortraitStyle = typeof resolvedStyleId === "string" && resolvedStyleId.startsWith("personality-cover-")
      ? {
          id: resolvedStyleId,
          name: `${personality.name} Signature Look`,
          category: "editorial",
          direction: "A premium full-height personality campaign portrait designed for the right side of a dark report cover. Keep the pet clearly visible from head through front body, use a saturated warm studio background with strong subject separation, and make the assigned personality wardrobe the visual centerpiece.",
        }
      : (() => {
          const selected = PORTRAIT_STYLES.find((item) => item.id === baseStyleId) || PORTRAIT_STYLES[Math.floor(Math.random() * PORTRAIT_STYLES.length)];
          if (selectedTemplate) {
            return {
              ...selected,
              id: resolvedStyleId,
              name: selectedTemplate.title.en,
              category: selected.category,
              direction: selectedTemplate.basePrompt,
            };
          }
          return resolvedStyleId?.endsWith(`--${PORTRAIT_PROMPT_VERSION}`) ? { ...selected, id: resolvedStyleId } : selected;
        })();
    const prompt = buildPortraitPrompt(style, {
      petName: pet.name,
      species,
      gender: pet.gender === "male" || pet.gender === "female" ? pet.gender : null,
      pbtiCode: personality.code,
      personalityName: personality.name,
      visualProfile,
      ownerIncluded: selectedTemplate?.mode === "duo",
      customPrompt: typeof customPrompt === "string" ? customPrompt : "",
    });
    const apiKey = process.env.DASHSCOPE_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "DASHSCOPE_API_KEY is not configured for portrait generation." }, { status: 503 });

    const ownerPhotoList = Array.isArray(ownerPhotos) ? ownerPhotos.filter((item) => typeof item === "string" && item).slice(0, 3) : [];
    if (selectedTemplate?.mode === "duo" && ownerPhotoList.length === 0) {
      return NextResponse.json({ error: "Upload at least one owner photo before generating a pet + owner portrait." }, { status: 400 });
    }

    const templateReferenceImage = selectedTemplate
      ? new URL(selectedTemplate.previewImage, request.url).toString()
      : null;

    const response = await fetch(IMAGE_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        input: {
          messages: [{
            role: "user",
            content: [
              ...(templateReferenceImage ? [{ image: templateReferenceImage }] : []),
              ...photos.map((image: string) => ({ image })),
              ...ownerPhotoList.map((image: string) => ({ image })),
              { text: prompt },
            ],
          }],
        },
        parameters: { size: imageSizeForStyle(style.id), n: 1, watermark: false },
      }),
    });
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: data?.message || data?.error?.message || "Portrait generation failed." }, { status: 502 });

    const imageUrl = extractImageUrl(data);
    if (!imageUrl) return NextResponse.json({ error: "The image model returned no portrait." }, { status: 502 });

    const asset = await savePortraitAsset(supabase, user.id, resolvedPetId, style, prompt, imageUrl, IMAGE_MODEL);
    return NextResponse.json({ portrait: asset, style: { id: style.id, name: style.name }, petName: pet.name });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to generate portrait." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const petId = new URL(request.url).searchParams.get("petId");
    if (!petId) return NextResponse.json({ error: "petId is required." }, { status: 400 });

    const supabase = await createSupabaseServerClient();
    const { data: userResult } = await supabase.auth.getUser();
    const user = userResult.user;
    if (!user) return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });

    const { data: pet } = await supabase.from("pets").select("id,name").eq("id", petId).eq("user_id", user.id).maybeSingle();
    if (!pet) return NextResponse.json({ error: "Pet profile was not found." }, { status: 404 });

    const { data, error } = await supabase
      .from("pet_portraits")
      .select("id,style_id,style_name,image_url,storage_path,created_at")
      .eq("pet_id", petId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(12);

    if (error && isMissingPortraitTable(error)) return NextResponse.json({ error: "Portrait persistence is not configured. Run supabase/pet-portraits.sql before opening reports." }, { status: 503 });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const durablePortraits = (data || []).filter((portrait) => Boolean(portrait.storage_path));
    const temporaryPortraitIds = (data || []).filter((portrait) => !portrait.storage_path).map((portrait) => portrait.id);
    if (temporaryPortraitIds.length) {
      await supabase.from("pet_portraits").delete().in("id", temporaryPortraitIds).eq("user_id", user.id);
    }

    return NextResponse.json({ portraits: durablePortraits, petName: pet.name });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load portraits." }, { status: 500 });
  }
}
