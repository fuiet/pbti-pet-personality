import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/auth";
import { generatePetReport, type PetReport, type ReportInput } from "@/lib/reportGenerator";
import { type PBTIResult, type Trait } from "@/lib/pbtiEngine";
import { type PetVisualProfile } from "@/lib/visualProfile";

export interface PetRecord {
  id: string;
  user_id: string;
  name: string;
  species: "cat" | "dog";
  breed: string | null;
  age: string | null;
  photo_url: string | null;
  created_at: string;
}

export interface ResultRecord {
  id: string;
  pbti_id: string;
  personality_type: string;
  scores: Record<string, number>;
  report: (PetReport & { answers?: Trait[] }) | null;
  is_premium: boolean;
  created_at: string;
  pet?: PetRecord | null;
  pet_id?: string;
}

interface RawResultRecord extends Omit<ResultRecord, "pet"> {
  pet?: PetRecord | PetRecord[] | null;
}

export interface PetProfileInput {
  name: string;
  species: "cat" | "dog";
  breed?: string;
  age?: string;
}
export interface PetVisualProfileRecord extends PetVisualProfile {
  id: string;
  pet_id: string;
  user_id: string;
  created_at: string;
}

interface RawVisualProfileRecord {
  id: string;
  pet_id: string;
  user_id: string;
  species: "cat" | "dog" | "unknown";
  breed_candidates: PetVisualProfile["breedCandidates"] | null;
  coat: PetVisualProfile["coat"] | null;
  face: PetVisualProfile["face"] | null;
  body_language: PetVisualProfile["bodyLanguage"] | null;
  visual_signals: PetVisualProfile["visualSignals"] | null;
  visual_tags: PetVisualProfile["visualTags"] | null;
  photo_quality: PetVisualProfile["photoQuality"] | null;
  raw_analysis: { model?: string; provider?: string; fallback?: boolean; raw?: { summary?: string; breedAssessment?: PetVisualProfile["breedAssessment"] } } | null;
  created_at: string;
}


const PET_COLUMNS_FULL = "id,user_id,name,species,breed,age,photo_url,created_at";
const PET_COLUMNS_NO_AGE = "id,user_id,name,species,breed,photo_url,created_at";
const PET_COLUMNS_MINIMAL = "id,user_id,name,species,breed,created_at";
const RESULT_COLUMNS_FULL =
  "id,pbti_id,personality_type,scores,report,is_premium,created_at, pet:pets(id,user_id,name,species,breed,age,photo_url,created_at)";
const RESULT_COLUMNS_NO_AGE =
  "id,pbti_id,personality_type,scores,report,is_premium,created_at, pet:pets(id,user_id,name,species,breed,photo_url,created_at)";
const RESULT_COLUMNS_MINIMAL =
  "id,pbti_id,personality_type,scores,report,is_premium,created_at, pet:pets(id,user_id,name,species,breed,created_at)";
const RESULT_COLUMNS_RECORD = "id,pbti_id,personality_type,scores,report,is_premium,created_at,pet_id";

function isPetSchemaColumnError(error: { message?: string } | null | undefined) {
  const message = error?.message?.toLowerCase() || "";
  const mentionsPetOptionalColumn = message.includes("age") || message.includes("photo_url");

  return (
    mentionsPetOptionalColumn &&
    (message.includes("schema cache") ||
      message.includes("could not find") ||
      message.includes("column") ||
      message.includes("invalid input syntax"))
  );
}

async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Please sign in to continue.");
  }

  return user;
}

function normalizePetRow(row: PetRecord): PetRecord {
  return {
    ...row,
    breed: row.breed ?? null,
    age: row.age ?? null,
    photo_url: row.photo_url ?? null,
  };
}

function normalizeResultRow(row: ResultRecord | RawResultRecord): ResultRecord {
  const pet = Array.isArray(row.pet) ? row.pet[0] ?? null : row.pet ?? null;

  return {
    ...row,
    report: row.report ?? null,
    pet: pet ? normalizePetRow(pet) : null,
  };
}

export async function createPetRecord(profile: PetProfileInput) {
  const user = await requireCurrentUser();
  const supabase = createSupabaseBrowserClient();
  const insertPayload = {
    user_id: user.id,
    name: profile.name,
    species: profile.species,
    breed: profile.breed?.trim() || null,
  };

  let response: any = await supabase
    .from("pets")
    .insert({
      ...insertPayload,
      age: profile.age?.trim() || null,
    })
    .select(PET_COLUMNS_MINIMAL)
    .single();

  if (response.error && isPetSchemaColumnError(response.error)) {
    response = await supabase
      .from("pets")
      .insert(insertPayload)
      .select(PET_COLUMNS_MINIMAL)
      .single();
  }

  if (response.error) {
    throw new Error(response.error.message);
  }

  return normalizePetRow(response.data as PetRecord);
}

export async function getPetRecord(petId: string) {
  const user = await requireCurrentUser();
  const supabase = createSupabaseBrowserClient();

  let response: any = await supabase
    .from("pets")
    .select(PET_COLUMNS_FULL)
    .eq("id", petId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (response.error && isPetSchemaColumnError(response.error)) {
    response = await supabase
      .from("pets")
      .select(PET_COLUMNS_NO_AGE)
      .eq("id", petId)
      .eq("user_id", user.id)
      .maybeSingle();
  }

  if (response.error && isPetSchemaColumnError(response.error)) {
    response = await supabase
      .from("pets")
      .select(PET_COLUMNS_MINIMAL)
      .eq("id", petId)
      .eq("user_id", user.id)
      .maybeSingle();
  }

  if (response.error) {
    throw new Error(response.error.message);
  }

  return response.data ? normalizePetRow(response.data as PetRecord) : null;
}

export async function getLatestPetRecord() {
  const user = await requireCurrentUser();
  const supabase = createSupabaseBrowserClient();

  let response: any = await supabase
    .from("pets")
    .select(PET_COLUMNS_FULL)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (response.error && isPetSchemaColumnError(response.error)) {
    response = await supabase
      .from("pets")
      .select(PET_COLUMNS_NO_AGE)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
  }

  if (response.error && isPetSchemaColumnError(response.error)) {
    response = await supabase
      .from("pets")
      .select(PET_COLUMNS_MINIMAL)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
  }

  if (response.error) {
    throw new Error(response.error.message);
  }

  return response.data ? normalizePetRow(response.data as PetRecord) : null;
}

export async function updatePetPhoto(petId: string, photoUrl: string | null) {
  const user = await requireCurrentUser();
  const supabase = createSupabaseBrowserClient();

  const { error } = await supabase
    .from("pets")
    .update({ photo_url: photoUrl })
    .eq("id", petId)
    .eq("user_id", user.id);

  if (error && isPetSchemaColumnError(error)) {
    return;
  }

  if (error) {
    throw new Error(error.message);
  }
}

function isMissingVisualProfilesTable(error: { message?: string; code?: string } | null | undefined) {
  const message = error?.message?.toLowerCase() || "";
  return error?.code === "42P01" || message.includes("pet_visual_profiles") || message.includes("schema cache");
}

function normalizeVisualProfileRow(row: RawVisualProfileRecord): PetVisualProfileRecord {
  return {
    id: row.id,
    pet_id: row.pet_id,
    user_id: row.user_id,
    created_at: row.created_at,
    modelVersion: "PBTI Visual Model v1",
    providerModel: row.raw_analysis?.model || "qwen-vl-plus",
    species: row.species || "unknown",
    breedCandidates: row.breed_candidates || [],
    breedAssessment: row.raw_analysis?.raw?.breedAssessment || {
      primaryBreed: row.breed_candidates?.[0]?.breed || "mixed / unclear",
      variety: "unclear",
      mixedLikelihood: "unclear",
      mixedNotes: "Breed and mix assessment is based on visible appearance only.",
    },
    coat: row.coat || { color: "unclear", length: "unclear", pattern: "unclear", texture: "unclear" },
    face: row.face || { eyeExpression: "unclear", earPosition: "unclear", muzzleShape: "unclear", faceDirection: "unclear" },
    bodyLanguage: row.body_language || { posture: "unclear", energyCue: "unclear", relaxation: "unclear" },
    visualSignals: row.visual_signals || {
      eyeFocus: "unclear",
      posture: "unclear",
      faceDirection: "unclear",
      expressionIntensity: "unclear",
      coatCondition: "unclear",
      movementCue: "unclear",
      bodyRelaxation: "unclear",
    },
    visualTags: row.visual_tags || [],
    photoQuality: row.photo_quality || { score: 50, issues: [] },
    summary: row.raw_analysis?.raw?.summary || "Visual identification is ready.",
    disclaimer: "Visual analysis describes visible traits only. Personality results require the behavior assessment.",
  };
}

export async function getLatestVisualProfileForPet(petId: string) {
  const user = await requireCurrentUser();
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("pet_visual_profiles")
    .select("id,pet_id,user_id,species,breed_candidates,coat,face,body_language,visual_signals,visual_tags,photo_quality,raw_analysis,created_at")
    .eq("pet_id", petId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isMissingVisualProfilesTable(error)) return null;
    throw new Error(error.message);
  }

  return data ? normalizeVisualProfileRow(data as RawVisualProfileRecord) : null;
}
function makeRecordId() {
  return `PBTI-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

export async function savePersonalityResult(
  pet: PetRecord,
  result: PBTIResult,
  answers: Trait[]
) {
  const user = await requireCurrentUser();
  const supabase = createSupabaseBrowserClient();

  const reportInput: ReportInput = {
    petName: pet.name,
    pbtiType: result.code,
    personalityName: result.personality.name,
    traits: result.personality.traits,
    advice: result.personality.advice,
    dimensionScores: result.dimensionScores,
    fitScore: result.fitScore,
    modelVersion: result.modelVersion,
    modelCue: result.personality.modelCue,
  };

  const report = {
    ...generatePetReport(reportInput),
    answers,
  };

  const { data, error } = await supabase
    .from("personality_results")
    .insert({
      pet_id: pet.id,
      pbti_id: makeRecordId(),
      personality_type: result.code,
      scores: result.scores,
      report,
      is_premium: false,
    })
    .select(RESULT_COLUMNS_RECORD)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return normalizeResultRow(data as RawResultRecord);
}

export async function getResultByRecordId(recordId: string) {
  const user = await requireCurrentUser();
  const supabase = createSupabaseBrowserClient();

  let response: any = await supabase
    .from("personality_results")
    .select(RESULT_COLUMNS_FULL)
    .eq("pbti_id", recordId)
    .maybeSingle();

  if (response.error && isPetSchemaColumnError(response.error)) {
    response = await supabase
      .from("personality_results")
      .select(RESULT_COLUMNS_NO_AGE)
      .eq("pbti_id", recordId)
      .maybeSingle();
  }

  if (response.error && isPetSchemaColumnError(response.error)) {
    response = await supabase
      .from("personality_results")
      .select(RESULT_COLUMNS_MINIMAL)
      .eq("pbti_id", recordId)
      .maybeSingle();
  }

  if (response.error) {
    response = await supabase
      .from("personality_results")
      .select(RESULT_COLUMNS_RECORD)
      .eq("pbti_id", recordId)
      .maybeSingle();
  }

  if (response.error) {
    throw new Error(response.error.message);
  }

  const record = response.data ? normalizeResultRow(response.data as RawResultRecord) : null;

  if (record && !record.pet && record.pet_id) {
    record.pet = await getPetRecord(record.pet_id);
  }

  if (!record?.pet || record.pet.user_id !== user.id) {
    return null;
  }

  return record;
}

export async function getLatestResultForCurrentUser() {
  const user = await requireCurrentUser();
  const supabase = createSupabaseBrowserClient();

  const { data: pets, error: petError } = await supabase
    .from("pets")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (petError) {
    throw new Error(petError.message);
  }

  const petIds = (pets || []).map((pet) => pet.id);

  if (petIds.length === 0) {
    return null;
  }

  let response: any = await supabase
    .from("personality_results")
    .select(RESULT_COLUMNS_FULL)
    .in("pet_id", petIds)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (response.error && isPetSchemaColumnError(response.error)) {
    response = await supabase
      .from("personality_results")
      .select(RESULT_COLUMNS_NO_AGE)
      .in("pet_id", petIds)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
  }

  if (response.error && isPetSchemaColumnError(response.error)) {
    response = await supabase
      .from("personality_results")
      .select(RESULT_COLUMNS_MINIMAL)
      .in("pet_id", petIds)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
  }

  if (response.error) {
    response = await supabase
      .from("personality_results")
      .select(RESULT_COLUMNS_RECORD)
      .in("pet_id", petIds)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
  }

  if (response.error) {
    throw new Error(response.error.message);
  }

  const record = response.data ? normalizeResultRow(response.data as RawResultRecord) : null;

  if (record && !record.pet && record.pet_id) {
    record.pet = await getPetRecord(record.pet_id);
  }

  if (!record?.pet || record.pet.user_id !== user.id) {
    return null;
  }

  return record;
}

export async function listCurrentUserResults() {
  const user = await requireCurrentUser();
  const supabase = createSupabaseBrowserClient();

  const { data: pets, error: petError } = await supabase
    .from("pets")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (petError) {
    throw new Error(petError.message);
  }

  const petIds = (pets || []).map((pet) => pet.id);

  if (petIds.length === 0) {
    return [];
  }

  let response: any = await supabase
    .from("personality_results")
    .select(RESULT_COLUMNS_FULL)
    .in("pet_id", petIds)
    .order("created_at", { ascending: false });

  if (response.error && isPetSchemaColumnError(response.error)) {
    response = await supabase
      .from("personality_results")
      .select(RESULT_COLUMNS_NO_AGE)
      .in("pet_id", petIds)
      .order("created_at", { ascending: false });
  }

  if (response.error && isPetSchemaColumnError(response.error)) {
    response = await supabase
      .from("personality_results")
      .select(RESULT_COLUMNS_MINIMAL)
      .in("pet_id", petIds)
      .order("created_at", { ascending: false });
  }

  if (response.error) {
    throw new Error(response.error.message);
  }

  return ((response.data || []) as RawResultRecord[])
    .map(normalizeResultRow)
    .filter((record) => record.pet?.user_id === user.id);
}
