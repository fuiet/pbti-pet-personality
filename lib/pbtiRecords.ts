import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/auth";
import { generatePetReport, type PetReport, type ReportInput } from "@/lib/reportGenerator";
import { type PBTIResult, type Trait } from "@/lib/pbtiEngine";

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
  scores: Record<Trait, number>;
  report: (PetReport & { answers?: Trait[] }) | null;
  is_premium: boolean;
  created_at: string;
  pet?: PetRecord | null;
  pet_id?: string;
}

export interface PetProfileInput {
  name: string;
  species: "cat" | "dog";
  breed?: string;
  age?: string;
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

function normalizeResultRow(row: ResultRecord): ResultRecord {
  return {
    ...row,
    report: row.report ?? null,
    pet: row.pet ? normalizePetRow(row.pet) : null,
  };
}

export async function createPetRecord(profile: PetProfileInput) {
  const user = await requireCurrentUser();
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("pets")
    .insert({
      user_id: user.id,
      name: profile.name,
      species: profile.species,
      breed: profile.breed?.trim() || null,
      age: profile.age?.trim() || null,
    })
    .select("id,user_id,name,species,breed,age,photo_url,created_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return normalizePetRow(data as PetRecord);
}

export async function getPetRecord(petId: string) {
  const user = await requireCurrentUser();
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("pets")
    .select("id,user_id,name,species,breed,age,photo_url,created_at")
    .eq("id", petId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? normalizePetRow(data as PetRecord) : null;
}

export async function getLatestPetRecord() {
  const user = await requireCurrentUser();
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("pets")
    .select("id,user_id,name,species,breed,age,photo_url,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? normalizePetRow(data as PetRecord) : null;
}

export async function updatePetPhoto(petId: string, photoUrl: string | null) {
  const user = await requireCurrentUser();
  const supabase = createSupabaseBrowserClient();

  const { error } = await supabase
    .from("pets")
    .update({ photo_url: photoUrl })
    .eq("id", petId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }
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
    .select("id,pbti_id,personality_type,scores,report,is_premium,created_at, pet:pets(id,user_id,name,species,breed,age,photo_url,created_at)")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return normalizeResultRow(data as ResultRecord);
}

export async function getResultByRecordId(recordId: string) {
  const user = await requireCurrentUser();
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("personality_results")
    .select("id,pbti_id,personality_type,scores,report,is_premium,created_at, pet:pets(id,user_id,name,species,breed,age,photo_url,created_at)")
    .eq("pbti_id", recordId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const record = data ? normalizeResultRow(data as ResultRecord) : null;

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

  const { data, error } = await supabase
    .from("personality_results")
    .select("id,pbti_id,personality_type,scores,report,is_premium,created_at, pet:pets(id,user_id,name,species,breed,age,photo_url,created_at)")
    .in("pet_id", petIds)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const record = data ? normalizeResultRow(data as ResultRecord) : null;

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

  const { data, error } = await supabase
    .from("personality_results")
    .select("id,pbti_id,personality_type,scores,report,is_premium,created_at, pet:pets(id,user_id,name,species,breed,age,photo_url,created_at)")
    .in("pet_id", petIds)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data || []) as ResultRecord[])
    .map(normalizeResultRow)
    .filter((record) => record.pet?.user_id === user.id);
}


