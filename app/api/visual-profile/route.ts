import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeVisualProfile, type RawVisualProfileInput } from "@/lib/visualProfile";

export const runtime = "edge";

const VISUAL_MODEL_PROVIDER = process.env.VISUAL_MODEL_PROVIDER || "qwen";
const QWEN_MODEL = process.env.QWEN_MODEL || "qwen-vl-plus";
const QWEN_BASE_URL = process.env.QWEN_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";

const visualProfilePrompt = (species: "cat" | "dog" | "unknown") => `Analyze this ${species} photo for PBTI Visual Model v1.

Return strict JSON only, with no markdown, no code fence, and exactly these top-level fields:
{
  "species": "cat" | "dog" | "unknown",
  "breedCandidates": [{ "breed": string, "confidence": number between 0 and 1, "note": string }],
  "breedAssessment": { "primaryBreed": string, "variety": string, "mixedLikelihood": "low" | "medium" | "high" | "unclear", "mixedNotes": string },
  "coat": { "color": string, "length": string, "pattern": string, "texture": string },
  "face": { "eyeExpression": string, "earPosition": string, "muzzleShape": string, "faceDirection": string },
  "bodyLanguage": { "posture": string, "energyCue": string, "relaxation": string },
  "visualSignals": {
    "eyeFocus": "soft" | "focused" | "watchful" | "unclear",
    "posture": "relaxed" | "stable" | "upright" | "active" | "tense" | "unclear",
    "faceDirection": "front-facing" | "side-facing" | "partially visible" | "unclear",
    "expressionIntensity": "soft" | "moderate" | "strong" | "unclear",
    "coatCondition": "neat" | "fluffy" | "textured" | "messy" | "unclear",
    "movementCue": "low" | "moderate" | "high" | "unclear",
    "bodyRelaxation": "relaxed" | "neutral" | "alert" | "tense" | "unclear"
  },
  "photoQuality": { "score": number from 0 to 100, "issues": string[] },
  "summary": string
}

Write the result like a concise pet appearance identification report. For example, if visually appropriate: "Your cat appears to be a British Shorthair silver shaded cat, with a rounded face, large clear eyes, a balanced body structure, and dense plush coat." Describe breed guess, whether the pet appears purebred or possibly mixed, coat color/pattern, face, eyes, body shape, posture, and photo quality.

Describe visible traits only. Do not diagnose health, emotion, intelligence, aggression, or real personality. Breed candidates and mixed-breed judgment must be cautious visual guesses. If the image is unclear, use "unclear" fields and list the quality issues.`;

function parseJsonObject(text: string) {
  const cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();

  try {
    return JSON.parse(cleaned) as RawVisualProfileInput;
  } catch {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1)) as RawVisualProfileInput;
    }
    throw new Error("Qwen-VL returned a response that was not valid JSON.");
  }
}

function extractQwenMessageText(data: any) {
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((item) => (typeof item === "string" ? item : item?.text || ""))
      .filter(Boolean)
      .join("\\n");
  }
  return "";
}

function makeFallbackProfile(species: "cat" | "dog" | "unknown") {
  return normalizeVisualProfile(
    {
      species,
      breedCandidates: [],
      coat: { color: "unclear", length: "unclear", pattern: "unclear", texture: "unclear" },
      face: { eyeExpression: "unclear", earPosition: "unclear", muzzleShape: "unclear", faceDirection: "unclear" },
      bodyLanguage: { posture: "unclear", energyCue: "unclear", relaxation: "unclear" },
      visualSignals: {
        eyeFocus: "unclear",
        posture: "unclear",
        faceDirection: "unclear",
        expressionIntensity: "unclear",
        coatCondition: "unclear",
        movementCue: "unclear",
        bodyRelaxation: "neutral",
      },
      photoQuality: { score: 50, issues: ["Qwen-VL visual analysis is not configured yet."] },
      summary: "Photo was saved, but live visual analysis requires DASHSCOPE_API_KEY in the deployment environment.",
    },
    QWEN_MODEL
  );
}

async function saveVisualProfile(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, userId: string, petId: string, profile: ReturnType<typeof normalizeVisualProfile>, rawAnalysis: unknown) {
  const { error } = await supabase.from("pet_visual_profiles").insert({
    pet_id: petId,
    user_id: userId,
    species: profile.species,
    breed_candidates: profile.breedCandidates,
    coat: profile.coat,
    face: profile.face,
    body_language: profile.bodyLanguage,
    visual_signals: profile.visualSignals,
    visual_tags: profile.visualTags,
    photo_quality: profile.photoQuality,
    raw_analysis: rawAnalysis,
  });

  return error?.message || null;
}

export async function POST(request: Request) {
  try {
    const { petId, imageUrl } = await request.json();

    if (!petId) {
      return NextResponse.json({ error: "petId is required." }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const { data: userResult, error: userError } = await supabase.auth.getUser();

    if (userError || !userResult.user) {
      return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
    }

    const { data: pet, error: petError } = await supabase
      .from("pets")
      .select("id,user_id,species,photo_url")
      .eq("id", petId)
      .eq("user_id", userResult.user.id)
      .maybeSingle();

    if (petError) {
      return NextResponse.json({ error: petError.message }, { status: 500 });
    }

    if (!pet) {
      return NextResponse.json({ error: "Pet profile was not found." }, { status: 404 });
    }

    if (VISUAL_MODEL_PROVIDER !== "qwen") {
      return NextResponse.json({ error: "Unsupported visual model provider. Set VISUAL_MODEL_PROVIDER=qwen." }, { status: 500 });
    }

const dashscopeKey = process.env.DASHSCOPE_API_KEY;
    const species = pet.species === "dog" ? "dog" : pet.species === "cat" ? "cat" : "unknown";
    const photoUrl = typeof imageUrl === "string" && imageUrl ? imageUrl : pet.photo_url;

    if (!photoUrl || typeof photoUrl !== "string") {
      return NextResponse.json({ error: "A pet photo is required before visual analysis." }, { status: 400 });
    }

    if (!dashscopeKey) {
      const profile = makeFallbackProfile(species);
      const saveError = await saveVisualProfile(supabase, userResult.user.id, petId, profile, { fallback: true });
      return NextResponse.json({ profile, fallback: true, saveError });
    }

    const response = await fetch(QWEN_BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${dashscopeKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: QWEN_MODEL,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: visualProfilePrompt(species) },
              { type: "image_url", image_url: { url: photoUrl } },
            ],
          },
        ],
        temperature: 0.2,
        max_tokens: 900,
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data?.error?.message || "Qwen-VL visual analysis failed." }, { status: 502 });
    }

    const outputText = extractQwenMessageText(data);
    const raw = parseJsonObject(outputText);
    const profile = normalizeVisualProfile(raw, QWEN_MODEL);
    const saveError = await saveVisualProfile(supabase, userResult.user.id, petId, profile, { provider: VISUAL_MODEL_PROVIDER, model: QWEN_MODEL, raw });

    return NextResponse.json({ profile, fallback: false, saveError });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to analyze pet photo." }, { status: 500 });
  }
}
