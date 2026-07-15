import { NextResponse } from "next/server";
import { personalities, defaultPersonalityCode } from "@/data/personalities";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildPortraitPrompt, PORTRAIT_STYLES, type PortraitStyle } from "@/lib/portraitPrompts";
import { normalizeVisualProfile } from "@/lib/visualProfile";

export const runtime = "edge";

const IMAGE_MODEL = process.env.QWEN_IMAGE_MODEL || "wan2.7-image";
const IMAGE_ENDPOINT = process.env.QWEN_IMAGE_ENDPOINT || "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation";
const PORTRAIT_BUCKET = process.env.PBTI_PORTRAIT_BUCKET || "pet-portraits";
const IMAGE_SIZE = process.env.QWEN_IMAGE_SIZE || "4K";

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

async function savePortraitAsset(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  petId: string,
  style: PortraitStyle,
  prompt: string,
  imageUrl: string,
  model: string,
) {
  let persistedUrl = imageUrl;
  let storagePath: string | null = null;

  try {
    const imageResponse = await fetch(imageUrl);
    if (imageResponse.ok) {
      const bytes = await imageResponse.arrayBuffer();
      storagePath = `${userId}/${petId}/${crypto.randomUUID()}.png`;
      const upload = await supabase.storage.from(PORTRAIT_BUCKET).upload(storagePath, bytes, {
        contentType: imageResponse.headers.get("content-type") || "image/png",
        cacheControl: "31536000",
        upsert: false,
      });

      if (!upload.error) {
        persistedUrl = supabase.storage.from(PORTRAIT_BUCKET).getPublicUrl(storagePath).data.publicUrl;
      } else {
        storagePath = null;
      }
    }
  } catch {
    storagePath = null;
  }

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

  if (error && !isMissingPortraitTable(error)) throw new Error(error.message);

  return data || {
    id: crypto.randomUUID(),
    style_id: style.id,
    style_name: style.name,
    image_url: persistedUrl,
    storage_path: storagePath,
    created_at: new Date().toISOString(),
  };
}

export async function POST(request: Request) {
  try {
    const { petId, resultId, styleId } = await request.json();
    if (!petId) return NextResponse.json({ error: "petId is required." }, { status: 400 });

    const supabase = await createSupabaseServerClient();
    const { data: userResult } = await supabase.auth.getUser();
    const user = userResult.user;
    if (!user) return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });

    const { data: pet, error: petError } = await supabase.from("pets").select("*").eq("id", petId).eq("user_id", user.id).maybeSingle();
    if (petError) return NextResponse.json({ error: petError.message }, { status: 500 });
    if (!pet) return NextResponse.json({ error: "Pet profile was not found." }, { status: 404 });

    const species = pet.species === "dog" ? "dog" : pet.species === "cat" ? "cat" : null;
    if (!species) return NextResponse.json({ error: "A cat or dog profile is required." }, { status: 400 });

    const photos = Array.isArray(pet.photo_urls) ? pet.photo_urls.filter(Boolean).slice(0, 3) : [];
    if (!photos.length && typeof pet.photo_url === "string" && pet.photo_url) photos.push(pet.photo_url);
    if (!photos.length) return NextResponse.json({ error: "Upload at least one pet photo before generating portraits." }, { status: 400 });

    const { data: result } = resultId
      ? await supabase.from("personality_results").select("personality_type").eq("pbti_id", resultId).eq("user_id", user.id).maybeSingle()
      : { data: null };
    const personality = personalities[result?.personality_type as keyof typeof personalities] || personalities[defaultPersonalityCode];

    const { data: visualRow } = await supabase
      .from("pet_visual_profiles")
      .select("species,breed_candidates,coat,face,body_language,visual_signals,photo_quality,raw_analysis")
      .eq("pet_id", petId)
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

    const style = PORTRAIT_STYLES.find((item) => item.id === styleId) || PORTRAIT_STYLES[Math.floor(Math.random() * PORTRAIT_STYLES.length)];
    const prompt = buildPortraitPrompt(style, {
      petName: pet.name,
      species,
      pbtiCode: personality.code,
      personalityName: personality.name,
      visualProfile,
    });
    const apiKey = process.env.DASHSCOPE_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "DASHSCOPE_API_KEY is not configured for portrait generation." }, { status: 503 });

    const response = await fetch(IMAGE_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        input: { messages: [{ role: "user", content: [...photos.map((image: string) => ({ image })), { text: prompt }] }] },
        parameters: { size: IMAGE_SIZE, n: 1, watermark: false },
      }),
    });
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: data?.message || data?.error?.message || "Portrait generation failed." }, { status: 502 });

    const imageUrl = extractImageUrl(data);
    if (!imageUrl) return NextResponse.json({ error: "The image model returned no portrait." }, { status: 502 });

    const asset = await savePortraitAsset(supabase, user.id, petId, style, prompt, imageUrl, IMAGE_MODEL);
    return NextResponse.json({ portrait: asset, style: { id: style.id, name: style.name }, petName: pet.name });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to generate portrait." }, { status: 500 });
  }
}
