import type { PetRecord } from "@/lib/pbtiRecords";
import type { PetProfileInput } from "@/lib/pbtiRecords";
import type { Trait } from "@/lib/pbtiEngine";

const STORAGE_KEY = "pbti-guest-test-v1";
const validTraits = new Set<Trait>(["A", "I", "E", "S", "V", "C", "P", "G"]);

export interface GuestTestState {
  pet: PetRecord;
  photos: string[];
  answers: Trait[];
}

function isBrowser() {
  return typeof window !== "undefined";
}

function createGuestPet(profile: PetProfileInput): PetRecord {
  return {
    id: "guest",
    user_id: "guest",
    name: profile.name,
    species: profile.species,
    breed: profile.breed || null,
    age: profile.age || null,
    gender: profile.gender || null,
    photo_url: null,
    photo_urls: [],
    created_at: new Date().toISOString(),
  };
}

function isGuestPet(value: unknown): value is PetRecord {
  if (!value || typeof value !== "object") return false;
  const pet = value as Partial<PetRecord>;
  return pet.id === "guest" && pet.user_id === "guest" && typeof pet.name === "string" && (pet.species === "cat" || pet.species === "dog");
}

function parseState(value: string): GuestTestState | null {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object") return null;
    const candidate = parsed as Partial<GuestTestState>;
    if (!isGuestPet(candidate.pet)) return null;

    const photos = Array.isArray(candidate.photos)
      ? candidate.photos.filter((photo): photo is string => typeof photo === "string" && photo.startsWith("data:image/")).slice(0, 3)
      : [];
    const answers = Array.isArray(candidate.answers)
      ? candidate.answers.filter((answer): answer is Trait => typeof answer === "string" && validTraits.has(answer as Trait)).slice(0, 28)
      : [];

    return {
      pet: {
        ...candidate.pet,
        name: candidate.pet.name.slice(0, 80),
        breed: typeof candidate.pet.breed === "string" ? candidate.pet.breed.slice(0, 80) : null,
        age: typeof candidate.pet.age === "string" ? candidate.pet.age.slice(0, 40) : null,
        photo_url: photos[0] || null,
        photo_urls: photos,
      },
      photos,
      answers,
    };
  } catch {
    return null;
  }
}

export function readGuestTest() {
  if (!isBrowser()) return null;
  const saved = window.sessionStorage.getItem(STORAGE_KEY);
  return saved ? parseState(saved) : null;
}

export function writeGuestTest(state: GuestTestState) {
  if (!isBrowser()) return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function startGuestTest(profile: PetProfileInput) {
  const state: GuestTestState = { pet: createGuestPet(profile), photos: [], answers: [] };
  writeGuestTest(state);
  return state;
}

export function updateGuestPhotos(photos: string[]) {
  const state = readGuestTest();
  if (!state) return null;
  const nextPhotos = photos.filter(Boolean).slice(0, 3);
  const next = { ...state, photos: nextPhotos, pet: { ...state.pet, photo_url: nextPhotos[0] || null, photo_urls: nextPhotos } };
  writeGuestTest(next);
  return next;
}

export function updateGuestAnswers(answers: Trait[]) {
  const state = readGuestTest();
  if (!state) return null;
  const next = { ...state, answers: answers.filter((answer) => validTraits.has(answer)).slice(0, 28) };
  writeGuestTest(next);
  return next;
}

export function clearGuestTest() {
  if (isBrowser()) window.sessionStorage.removeItem(STORAGE_KEY);
}
