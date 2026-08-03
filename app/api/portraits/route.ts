import { defaultPersonalityCode, personalities } from "@/data/personalities";
import { createApiRequestTracker } from "@/lib/apiRequestMetrics";
import { buildPortraitPrompt, PORTRAIT_PROMPT_VERSION, PORTRAIT_STYLES, type PortraitStyle } from "@/lib/portraitPrompts";
import { buildTemplateStyleId, findPortraitStudioTemplate } from "@/lib/portraitStudioTemplates";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeVisualProfile } from "@/lib/visualProfile";

export const runtime = "edge";

const IMAGE_MODEL = process.env.QWEN_IMAGE_MODEL || "wan2.7-image";
const IMAGE_ENDPOINT = process.env.QWEN_IMAGE_ENDPOINT || "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation";
const PORTRAIT_BUCKET = process.env.PBTI_PORTRAIT_BUCKET || "pet-portraits";
const MAX_REQUEST_BYTES = 6_000_000;
const MAX_INLINE_IMAGE_LENGTH = 1_200_000;
const MAX_GENERATED_IMAGE_BYTES = 20_000_000;
const MAX_PROMPT_LENGTH = 1_000;
const MAX_NAME_LENGTH = 80;
const PORTRAIT_BASE_SELECT = "id,pet_id,style_id,style_name,image_url,storage_path,created_at";
const PORTRAIT_SELECT = `${PORTRAIT_BASE_SELECT},subject_name,subject_species`;
const IMAGE_SIZE_BY_STYLE: Record<string, string> = {
  "white-sketch-avatar": "2048*2048",
  "vertical-campaign": "1632*2048",
  "landscape-campaign": "2048*1360",
};
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type Species = "cat" | "dog";
type JsonRecord = Record<string, unknown>;
type StoredPet = {
  id: string;
  name: string;
  species: string;
  gender: string | null;
  photo_url: string | null;
  photo_urls: unknown;
};

function asRecord(value: unknown): JsonRecord | null {
  return typeof value === "object" && value !== null ? value as JsonRecord : null;
}

function imageSizeForStyle(styleId: string) {
  return IMAGE_SIZE_BY_STYLE[styleId.split("--")[0]] || "2K";
}

function isMissingPortraitTable(error: { message?: string; code?: string } | null | undefined) {
  const message = error?.message?.toLowerCase() || "";
  return error?.code === "42P01" || message.includes("pet_portraits") || message.includes("schema cache");
}

function isMissingStudioColumns(error: { message?: string } | null | undefined) {
  const message = error?.message?.toLowerCase() || "";
  return (message.includes("subject_name") || message.includes("subject_species") || message.includes("pet_id"))
    && (message.includes("schema cache") || message.includes("column") || message.includes("not-null"));
}

function isMissingVisualProfileTable(error: { message?: string; code?: string } | null | undefined) {
  const message = error?.message?.toLowerCase() || "";
  return error?.code === "42P01" || message.includes("pet_visual_profiles") || message.includes("schema cache");
}

function extractImageUrl(value: unknown) {
  const root = asRecord(value);
  const output = asRecord(root?.output);
  const choices = Array.isArray(output?.choices) ? output.choices : [];
  const firstChoice = asRecord(choices[0]);
  const message = asRecord(firstChoice?.message);
  const content = Array.isArray(message?.content) ? message.content : [];

  for (const item of content) {
    const entry = asRecord(item);
    if (typeof entry?.image === "string") return entry.image;
  }

  return typeof output?.image === "string" ? output.image : null;
}

function isAllowedRemoteImageUrl(value: string) {
  if (value.length > 2_048) return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:" && (
      url.hostname.endsWith(".supabase.co")
      || url.hostname.endsWith(".aliyuncs.com")
    );
  } catch {
    return false;
  }
}

function isAllowedInputImage(value: string) {
  if (/^data:image\/(?:jpeg|png|webp);base64,/i.test(value)) {
    return value.length <= MAX_INLINE_IMAGE_LENGTH;
  }
  return isAllowedRemoteImageUrl(value);
}

function normalizeImageReferences(value: unknown) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new Error("Image references must be provided as a list.");

  const images = value.slice(0, 3);
  if (images.some((item) => typeof item !== "string" || !isAllowedInputImage(item))) {
    throw new Error("Use JPEG, PNG, or WEBP uploads no larger than the supported limit.");
  }
  return images as string[];
}

function normalizeSpecies(value: unknown): Species | null {
  return value === "cat" || value === "dog" ? value : null;
}

function normalizeText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function extensionForContentType(contentType: string) {
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  return "jpg";
}

async function readJsonResponse(response: Response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text.slice(0, 300) };
  }
}

async function savePortraitAsset(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  petId: string | null,
  subjectName: string,
  subjectSpecies: Species,
  style: PortraitStyle,
  prompt: string,
  imageUrl: string,
  model: string,
) {
  if (!isAllowedRemoteImageUrl(imageUrl)) {
    throw new Error("The image service returned an unsupported download location.");
  }

  const imageResponse = await fetch(imageUrl, {
    redirect: "error",
    signal: AbortSignal.timeout(30_000),
  });
  if (!imageResponse.ok) {
    throw new Error("The generated portrait could not be downloaded for permanent storage.");
  }

  const declaredLength = Number(imageResponse.headers.get("content-length") || 0);
  if (declaredLength > MAX_GENERATED_IMAGE_BYTES) {
    throw new Error("The generated portrait is too large to store.");
  }

  const contentType = (imageResponse.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
    throw new Error("The image service returned an unsupported file type.");
  }

  const bytes = await imageResponse.arrayBuffer();
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_GENERATED_IMAGE_BYTES) {
    throw new Error("The image service returned an invalid portrait file.");
  }

  const storageFolder = petId || "studio";
  const storagePath = `${userId}/${storageFolder}/${crypto.randomUUID()}.${extensionForContentType(contentType)}`;
  const upload = await supabase.storage.from(PORTRAIT_BUCKET).upload(storagePath, bytes, {
    contentType,
    cacheControl: "31536000",
    upsert: false,
  });
  if (upload.error) throw new Error(`Portrait storage failed: ${upload.error.message}`);

  const persistedUrl = supabase.storage.from(PORTRAIT_BUCKET).getPublicUrl(storagePath).data.publicUrl;
  const basePayload = {
    pet_id: petId,
    user_id: userId,
    style_id: style.id,
    style_name: style.name,
    image_url: persistedUrl,
    storage_path: storagePath,
    model,
    prompt,
  };
  let { data, error } = await supabase
    .from("pet_portraits")
    .insert({
      ...basePayload,
      subject_name: subjectName,
      subject_species: subjectSpecies,
    })
    .select(PORTRAIT_SELECT)
    .single();

  if (error && isMissingStudioColumns(error) && petId) {
    const fallback = await supabase
      .from("pet_portraits")
      .insert(basePayload)
      .select(PORTRAIT_BASE_SELECT)
      .single();
    data = fallback.data as typeof data;
    error = fallback.error;
  }

  if (error?.code === "23505" && petId) {
    await supabase.storage.from(PORTRAIT_BUCKET).remove([storagePath]);
    const { data: existing } = await supabase
      .from("pet_portraits")
      .select(PORTRAIT_BASE_SELECT)
      .eq("pet_id", petId)
      .eq("user_id", userId)
      .eq("style_id", style.id)
      .maybeSingle();
    if (existing) return existing;
  }

  if (error) {
    await supabase.storage.from(PORTRAIT_BUCKET).remove([storagePath]);
    if (isMissingStudioColumns(error)) {
      throw new Error("Portrait Studio storage needs the latest database migration.");
    }
    if (isMissingPortraitTable(error)) throw new Error("Portrait persistence is not configured.");
    throw new Error(error.message);
  }

  if (!data) {
    await supabase.storage.from(PORTRAIT_BUCKET).remove([storagePath]);
    throw new Error("The generated portrait could not be saved.");
  }

  return data;
}

export async function POST(request: Request) {
  const tracker = createApiRequestTracker({ request, route: "/api/portraits" });
  const fail = (message: string, status: number) => {
    tracker.setError(message);
    return tracker.json({ error: message }, { status });
  };

  try {
    const declaredRequestLength = Number(request.headers.get("content-length") || 0);
    if (declaredRequestLength > MAX_REQUEST_BYTES) {
      return fail("The upload request is too large.", 413);
    }

    const body = asRecord(await request.json());
    if (!body) return fail("A valid JSON request is required.", 400);

    const supabase = await createSupabaseServerClient();
    const { data: userResult, error: userError } = await supabase.auth.getUser();
    const userId = userResult.user?.id || "";
    if (userError || !userId) return fail("Please sign in to continue.", 401);
    tracker.setUserId(userId);

    const rawTemplateId = normalizeText(body.templateId, 120);
    const selectedTemplate = rawTemplateId ? findPortraitStudioTemplate(rawTemplateId) : null;
    if (rawTemplateId && !selectedTemplate) {
      return fail("The selected portrait template is not available.", 400);
    }

    const uploadedSubjectPhotos = normalizeImageReferences(body.subjectPhotos ?? body.petPhotos);
    const ownerPhotoList = normalizeImageReferences(body.ownerPhotos);
    const requestedPetId = normalizeText(body.petId, 100);
    const requestedResultId = normalizeText(body.resultId, 100);
    const customPrompt = normalizeText(body.customPrompt, MAX_PROMPT_LENGTH);
    const requestedStyleId = normalizeText(body.styleId, 180);

    let petId: string | null = requestedPetId || null;
    let subjectName = normalizeText(body.subjectName ?? body.petName, MAX_NAME_LENGTH);
    let species = normalizeSpecies(body.subjectSpecies ?? body.petSpecies);
    let gender: "male" | "female" | null = null;
    let photos = uploadedSubjectPhotos;

    if (petId) {
      const { data, error } = await supabase
        .from("pets")
        .select("id,name,species,gender,photo_url,photo_urls")
        .eq("id", petId)
        .eq("user_id", userId)
        .maybeSingle();
      const pet = data as StoredPet | null;

      if (error) return fail("Unable to load the report subject.", 500);
      if (!pet) return fail("The report subject was not found.", 404);

      species = normalizeSpecies(pet.species);
      subjectName = pet.name;
      gender = pet.gender === "male" || pet.gender === "female" ? pet.gender : null;
      const savedPhotos = normalizeImageReferences(pet.photo_urls);
      photos = savedPhotos.length ? savedPhotos : pet.photo_url && isAllowedInputImage(pet.photo_url) ? [pet.photo_url] : [];
    } else {
      if (!species) {
        return fail("Choose whether the uploaded subject is a cat or dog.", 400);
      }
      if (!photos.length) {
        return fail("Upload at least one subject photo before generating.", 400);
      }
      subjectName ||= `${species === "dog" ? "Dog" : "Cat"} Portrait`;
    }

    if (!species) return fail("A cat or dog subject is required.", 400);
    if (!photos.length) return fail("Upload at least one subject photo before generating.", 400);
    if (selectedTemplate?.mode === "duo" && ownerPhotoList.length === 0) {
      return fail("Upload at least one owner photo before generating a duo portrait.", 400);
    }

    const resolvedStyleId = selectedTemplate
      ? buildTemplateStyleId(selectedTemplate, PORTRAIT_PROMPT_VERSION)
      : requestedStyleId;
    if (resolvedStyleId && !/^[a-z0-9-]+(?:--[a-z0-9-]+)*$/i.test(resolvedStyleId)) {
      return fail("The selected portrait style is invalid.", 400);
    }

    if (resolvedStyleId && selectedTemplate?.mode !== "duo" && petId && uploadedSubjectPhotos.length === 0) {
      const { data: existing, error: existingError } = await supabase
        .from("pet_portraits")
        .select(PORTRAIT_BASE_SELECT)
        .eq("pet_id", petId)
        .eq("user_id", userId)
        .eq("style_id", resolvedStyleId)
        .maybeSingle();

      if (existingError && isMissingPortraitTable(existingError)) {
        return fail("Portrait persistence is not configured. Run the portrait migrations before generating.", 503);
      }
      if (existingError) return fail("Unable to check saved portraits.", 500);
      if (existing) {
        return tracker.json({
          portrait: existing,
          style: { id: existing.style_id, name: existing.style_name },
          subjectName,
          reused: true,
        });
      }
    }

    let personality = null;
    if (petId && requestedResultId) {
      const { data: result } = await supabase
        .from("personality_results")
        .select("personality_type")
        .eq("pbti_id", requestedResultId)
        .eq("user_id", userId)
        .maybeSingle();
      personality = result?.personality_type
        ? personalities[result.personality_type as keyof typeof personalities] || personalities[defaultPersonalityCode]
        : null;
    }

    let visualProfile = null;
    if (petId) {
      const { data: visualRow, error: visualError } = await supabase
        .from("pet_visual_profiles")
        .select("species,breed_candidates,coat,face,body_language,visual_signals,photo_quality,raw_analysis")
        .eq("pet_id", petId)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (visualError && !isMissingVisualProfileTable(visualError)) {
        return fail("Unable to load visual identity data.", 500);
      }
      if (visualRow) {
        visualProfile = normalizeVisualProfile({
          species: visualRow.species,
          breedCandidates: visualRow.breed_candidates,
          breedAssessment: visualRow.raw_analysis?.raw?.breedAssessment,
          coat: visualRow.coat,
          face: visualRow.face,
          bodyLanguage: visualRow.body_language,
          visualSignals: visualRow.visual_signals,
          photoQuality: visualRow.photo_quality,
          summary: visualRow.raw_analysis?.raw?.summary,
        });
      }
    }

    const baseStyleId = resolvedStyleId?.split("--")[0];
    const selectedBaseStyle = PORTRAIT_STYLES.find((item) => item.id === baseStyleId)
      || PORTRAIT_STYLES[Math.floor(Math.random() * PORTRAIT_STYLES.length)]
      || PORTRAIT_STYLES[0];
    if (!selectedBaseStyle) {
      return fail("No portrait styles are configured.", 503);
    }

    const coverPersonality = personality || personalities[defaultPersonalityCode];
    const style: PortraitStyle = resolvedStyleId?.startsWith("personality-cover-")
      ? {
          id: resolvedStyleId,
          name: `${coverPersonality.name} Signature Look`,
          category: "editorial",
          direction: "A premium full-height personality campaign portrait designed for the right side of a dark report cover. Keep the subject clearly visible from head through front body, use a saturated warm studio background with strong subject separation, and make the assigned personality wardrobe the visual centerpiece.",
        }
      : selectedTemplate
        ? {
            ...selectedBaseStyle,
            id: resolvedStyleId || selectedBaseStyle.id,
            name: selectedTemplate.title.en,
            direction: selectedTemplate.basePrompt,
          }
        : resolvedStyleId?.endsWith(`--${PORTRAIT_PROMPT_VERSION}`)
          ? { ...selectedBaseStyle, id: resolvedStyleId }
          : selectedBaseStyle;

    const prompt = buildPortraitPrompt(style, {
      petName: subjectName,
      species,
      gender,
      pbtiCode: personality?.code,
      personalityName: personality?.name,
      visualProfile,
      ownerIncluded: selectedTemplate?.mode === "duo",
      customPrompt,
    });

    const apiKey = process.env.DASHSCOPE_API_KEY;
    if (!apiKey) return fail("Portrait generation is not configured.", 503);

    const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const templateReferenceImage = selectedTemplate
      ? new URL(selectedTemplate.previewImage, siteOrigin).toString()
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
              ...photos.map((image) => ({ image })),
              ...ownerPhotoList.map((image) => ({ image })),
              { text: prompt },
            ],
          }],
        },
        parameters: { size: imageSizeForStyle(style.id), n: 1, watermark: false },
      }),
      signal: AbortSignal.timeout(120_000),
    });
    const responseData = await readJsonResponse(response);
    const responseRecord = asRecord(responseData);
    const responseError = asRecord(responseRecord?.error);
    if (!response.ok) {
      const message = typeof responseRecord?.message === "string"
        ? responseRecord.message
        : typeof responseError?.message === "string"
          ? responseError.message
          : "Portrait generation failed.";
      return fail(message, 502);
    }

    const imageUrl = extractImageUrl(responseData);
    if (!imageUrl) return fail("The image model returned no portrait.", 502);

    const asset = await savePortraitAsset(
      supabase,
      userId,
      petId,
      subjectName,
      species,
      style,
      prompt,
      imageUrl,
      IMAGE_MODEL,
    );
    return tracker.json({
      portrait: asset,
      style: { id: style.id, name: style.name },
      subjectName,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate portrait.";
    const status = message.includes("too large") ? 413 : 500;
    tracker.setError(message);
    return tracker.json({ error: message }, { status });
  } finally {
    await tracker.flush();
  }
}

export async function GET(request: Request) {
  const tracker = createApiRequestTracker({ request, route: "/api/portraits" });
  const fail = (message: string, status: number) => {
    tracker.setError(message);
    return tracker.json({ error: message }, { status });
  };

  try {
    const petId = new URL(request.url).searchParams.get("petId");
    if (!petId) return fail("petId is required.", 400);

    const supabase = await createSupabaseServerClient();
    const { data: userResult, error: userError } = await supabase.auth.getUser();
    const userId = userResult.user?.id || "";
    if (userError || !userId) return fail("Please sign in to continue.", 401);
    tracker.setUserId(userId);

    const { data: pet } = await supabase
      .from("pets")
      .select("id,name")
      .eq("id", petId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!pet) return fail("The report subject was not found.", 404);

    const { data, error } = await supabase
      .from("pet_portraits")
      .select(PORTRAIT_BASE_SELECT)
      .eq("pet_id", petId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(12);

    if (error && isMissingPortraitTable(error)) {
      return fail("Portrait persistence is not configured. Run the portrait migrations before opening reports.", 503);
    }
    if (error) return fail("Unable to load saved portraits.", 500);

    const durablePortraits = (data || []).filter((portrait) => Boolean(portrait.storage_path));
    const temporaryPortraitIds = (data || [])
      .filter((portrait) => !portrait.storage_path)
      .map((portrait) => portrait.id);
    if (temporaryPortraitIds.length) {
      await supabase.from("pet_portraits").delete().in("id", temporaryPortraitIds).eq("user_id", userId);
    }

    return tracker.json({ portraits: durablePortraits, subjectName: pet.name });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load portraits.";
    tracker.setError(message);
    return tracker.json({ error: message }, { status: 500 });
  } finally {
    await tracker.flush();
  }
}
