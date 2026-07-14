import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeVisualProfile, type RawVisualProfileInput } from "@/lib/visualProfile";

export const runtime = "edge";

const OPENAI_MODEL = "gpt-5.4-mini";

const visualProfileSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    species: { type: "string", enum: ["cat", "dog", "unknown"] },
    breedCandidates: {
      type: "array",
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          breed: { type: "string" },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          note: { type: "string" },
        },
        required: ["breed", "confidence", "note"],
      },
    },
    coat: {
      type: "object",
      additionalProperties: false,
      properties: {
        color: { type: "string" },
        length: { type: "string" },
        pattern: { type: "string" },
        texture: { type: "string" },
      },
      required: ["color", "length", "pattern", "texture"],
    },
    face: {
      type: "object",
      additionalProperties: false,
      properties: {
        eyeExpression: { type: "string" },
        earPosition: { type: "string" },
        muzzleShape: { type: "string" },
        faceDirection: { type: "string" },
      },
      required: ["eyeExpression", "earPosition", "muzzleShape", "faceDirection"],
    },
    bodyLanguage: {
      type: "object",
      additionalProperties: false,
      properties: {
        posture: { type: "string" },
        energyCue: { type: "string" },
        relaxation: { type: "string" },
      },
      required: ["posture", "energyCue", "relaxation"],
    },
    visualSignals: {
      type: "object",
      additionalProperties: false,
      properties: {
        eyeFocus: { type: "string", enum: ["soft", "focused", "watchful", "unclear"] },
        posture: { type: "string", enum: ["relaxed", "stable", "upright", "active", "tense", "unclear"] },
        faceDirection: { type: "string", enum: ["front-facing", "side-facing", "partially visible", "unclear"] },
        expressionIntensity: { type: "string", enum: ["soft", "moderate", "strong", "unclear"] },
        coatCondition: { type: "string", enum: ["neat", "fluffy", "textured", "messy", "unclear"] },
        movementCue: { type: "string", enum: ["low", "moderate", "high", "unclear"] },
        bodyRelaxation: { type: "string", enum: ["relaxed", "neutral", "alert", "tense", "unclear"] },
      },
      required: ["eyeFocus", "posture", "faceDirection", "expressionIntensity", "coatCondition", "movementCue", "bodyRelaxation"],
    },
    photoQuality: {
      type: "object",
      additionalProperties: false,
      properties: {
        score: { type: "number", minimum: 0, maximum: 100 },
        issues: { type: "array", items: { type: "string" } },
      },
      required: ["score", "issues"],
    },
    summary: { type: "string" },
  },
  required: ["species", "breedCandidates", "coat", "face", "bodyLanguage", "visualSignals", "photoQuality", "summary"],
} as const;

function extractResponseText(data: any) {
  if (typeof data?.output_text === "string") return data.output_text;

  const chunks: string[] = [];
  for (const item of data?.output || []) {
    for (const content of item?.content || []) {
      if (typeof content?.text === "string") chunks.push(content.text);
    }
  }

  return chunks.join("\n");
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
      photoQuality: { score: 50, issues: ["OpenAI visual analysis is not configured yet."] },
      summary: "Photo was saved, but live visual analysis requires OPENAI_API_KEY in the deployment environment.",
    },
    OPENAI_MODEL
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

    if (!petId || !imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json({ error: "petId and imageUrl are required." }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const { data: userResult, error: userError } = await supabase.auth.getUser();

    if (userError || !userResult.user) {
      return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
    }

    const { data: pet, error: petError } = await supabase
      .from("pets")
      .select("id,user_id,species")
      .eq("id", petId)
      .eq("user_id", userResult.user.id)
      .maybeSingle();

    if (petError) {
      return NextResponse.json({ error: petError.message }, { status: 500 });
    }

    if (!pet) {
      return NextResponse.json({ error: "Pet profile was not found." }, { status: 404 });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    const species = pet.species === "dog" ? "dog" : pet.species === "cat" ? "cat" : "unknown";

    if (!openaiKey) {
      const profile = makeFallbackProfile(species);
      const saveError = await saveVisualProfile(supabase, userResult.user.id, petId, profile, { fallback: true });
      return NextResponse.json({ profile, fallback: true, saveError });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        max_output_tokens: 900,
        text: {
          format: {
            type: "json_schema",
            name: "pbti_visual_profile",
            schema: visualProfileSchema,
            strict: true,
          },
        },
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `Analyze this ${species} photo for PBTI Visual Model v1. Describe visible traits only. Do not diagnose health, emotion, intelligence, aggression, or real personality. Return only the requested JSON fields. Breed candidates must be cautious visual guesses.`,
              },
              {
                type: "input_image",
                image_url: imageUrl,
                detail: "low",
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data?.error?.message || "OpenAI visual analysis failed." }, { status: 502 });
    }

    const outputText = extractResponseText(data);
    const raw = JSON.parse(outputText) as RawVisualProfileInput;
    const profile = normalizeVisualProfile(raw, OPENAI_MODEL);
    const saveError = await saveVisualProfile(supabase, userResult.user.id, petId, profile, raw);

    return NextResponse.json({ profile, fallback: false, saveError });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to analyze pet photo." }, { status: 500 });
  }
}
