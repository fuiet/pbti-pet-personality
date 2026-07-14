export type VisualTag = "Smart Fluff" | "Stubborn Fluff" | "Royal Fur" | "Chaos Bean" | "Soft Soul" | "Watchful Eyes";

export interface BreedCandidate {
  breed: string;
  confidence: number;
  note?: string;
}

export interface PetVisualSignals {
  eyeFocus: "soft" | "focused" | "watchful" | "unclear";
  posture: "relaxed" | "stable" | "upright" | "active" | "tense" | "unclear";
  faceDirection: "front-facing" | "side-facing" | "partially visible" | "unclear";
  expressionIntensity: "soft" | "moderate" | "strong" | "unclear";
  coatCondition: "neat" | "fluffy" | "textured" | "messy" | "unclear";
  movementCue: "low" | "moderate" | "high" | "unclear";
  bodyRelaxation: "relaxed" | "neutral" | "alert" | "tense" | "unclear";
}

export interface PetVisualProfile {
  modelVersion: "PBTI Visual Model v1";
  providerModel: string;
  species: "cat" | "dog" | "unknown";
  breedCandidates: BreedCandidate[];
  breedAssessment: {
    primaryBreed: string;
    variety: string;
    mixedLikelihood: "low" | "medium" | "high" | "unclear";
    mixedNotes: string;
  };
  coat: {
    color: string;
    length: string;
    pattern: string;
    texture: string;
  };
  face: {
    eyeExpression: string;
    earPosition: string;
    muzzleShape: string;
    faceDirection: string;
  };
  bodyLanguage: {
    posture: string;
    energyCue: string;
    relaxation: string;
  };
  visualSignals: PetVisualSignals;
  visualTags: VisualTag[];
  photoQuality: {
    score: number;
    issues: string[];
  };
  summary: string;
  disclaimer: string;
}

export interface RawVisualProfileInput {
  species?: string;
  breedCandidates?: BreedCandidate[];
  breedAssessment?: Partial<PetVisualProfile["breedAssessment"]>;
  coat?: Partial<PetVisualProfile["coat"]>;
  face?: Partial<PetVisualProfile["face"]>;
  bodyLanguage?: Partial<PetVisualProfile["bodyLanguage"]>;
  visualSignals?: Partial<PetVisualSignals>;
  photoQuality?: Partial<PetVisualProfile["photoQuality"]>;
  summary?: string;
}

const VISUAL_TAGS: VisualTag[] = ["Smart Fluff", "Stubborn Fluff", "Royal Fur", "Chaos Bean", "Soft Soul", "Watchful Eyes"];

function clampConfidence(value: number) {
  if (!Number.isFinite(value)) return 0.3;
  return Math.max(0, Math.min(1, value));
}

function normalizeSpecies(value?: string): PetVisualProfile["species"] {
  const species = value?.toLowerCase();
  if (species === "cat" || species === "dog") return species;
  return "unknown";
}

function normalizeSignal<T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export function deriveVisualTags(signals: PetVisualSignals, photoQualityScore: number): VisualTag[] {
  const tags = new Set<VisualTag>();

  if (signals.eyeFocus === "focused" && ["stable", "upright"].includes(signals.posture) && signals.faceDirection === "front-facing") {
    tags.add("Smart Fluff");
  }

  if (signals.expressionIntensity === "strong" && ["stable", "upright", "tense"].includes(signals.posture) && ["focused", "watchful"].includes(signals.eyeFocus)) {
    tags.add("Stubborn Fluff");
  }

  if (["upright", "stable"].includes(signals.posture) && ["neat", "fluffy"].includes(signals.coatCondition) && photoQualityScore >= 60) {
    tags.add("Royal Fur");
  }

  if (signals.movementCue === "high" || (signals.posture === "active" && signals.expressionIntensity === "strong")) {
    tags.add("Chaos Bean");
  }

  if (signals.eyeFocus === "soft" && signals.bodyRelaxation === "relaxed" && signals.expressionIntensity !== "strong") {
    tags.add("Soft Soul");
  }

  if (["focused", "watchful"].includes(signals.eyeFocus) && ["front-facing", "side-facing"].includes(signals.faceDirection)) {
    tags.add("Watchful Eyes");
  }

  if (tags.size === 0) {
    tags.add(signals.bodyRelaxation === "relaxed" ? "Soft Soul" : "Watchful Eyes");
  }

  return Array.from(tags).slice(0, 3);
}

export function normalizeVisualProfile(raw: RawVisualProfileInput, providerModel = "gpt-5.4-mini"): PetVisualProfile {
  const visualSignals: PetVisualSignals = {
    eyeFocus: normalizeSignal(raw.visualSignals?.eyeFocus, ["soft", "focused", "watchful", "unclear"] as const, "unclear"),
    posture: normalizeSignal(raw.visualSignals?.posture, ["relaxed", "stable", "upright", "active", "tense", "unclear"] as const, "unclear"),
    faceDirection: normalizeSignal(raw.visualSignals?.faceDirection, ["front-facing", "side-facing", "partially visible", "unclear"] as const, "unclear"),
    expressionIntensity: normalizeSignal(raw.visualSignals?.expressionIntensity, ["soft", "moderate", "strong", "unclear"] as const, "unclear"),
    coatCondition: normalizeSignal(raw.visualSignals?.coatCondition, ["neat", "fluffy", "textured", "messy", "unclear"] as const, "unclear"),
    movementCue: normalizeSignal(raw.visualSignals?.movementCue, ["low", "moderate", "high", "unclear"] as const, "unclear"),
    bodyRelaxation: normalizeSignal(raw.visualSignals?.bodyRelaxation, ["relaxed", "neutral", "alert", "tense", "unclear"] as const, "unclear"),
  };
  const photoQualityScore = Math.max(0, Math.min(100, Math.round(raw.photoQuality?.score ?? 50)));

  return {
    modelVersion: "PBTI Visual Model v1",
    providerModel,
    species: normalizeSpecies(raw.species),
    breedCandidates: (raw.breedCandidates || [])
      .filter((candidate) => candidate?.breed)
      .slice(0, 3)
      .map((candidate) => ({ ...candidate, confidence: clampConfidence(candidate.confidence) })),
    breedAssessment: {
      primaryBreed: raw.breedAssessment?.primaryBreed || raw.breedCandidates?.[0]?.breed || "mixed / unclear",
      variety: raw.breedAssessment?.variety || "unclear",
      mixedLikelihood: normalizeSignal(raw.breedAssessment?.mixedLikelihood, ["low", "medium", "high", "unclear"] as const, "unclear"),
      mixedNotes: raw.breedAssessment?.mixedNotes || "Breed and mix assessment is based on visible appearance only.",
    },
    coat: {
      color: raw.coat?.color || "unclear",
      length: raw.coat?.length || "unclear",
      pattern: raw.coat?.pattern || "unclear",
      texture: raw.coat?.texture || "unclear",
    },
    face: {
      eyeExpression: raw.face?.eyeExpression || "unclear",
      earPosition: raw.face?.earPosition || "unclear",
      muzzleShape: raw.face?.muzzleShape || "unclear",
      faceDirection: raw.face?.faceDirection || visualSignals.faceDirection,
    },
    bodyLanguage: {
      posture: raw.bodyLanguage?.posture || visualSignals.posture,
      energyCue: raw.bodyLanguage?.energyCue || visualSignals.movementCue,
      relaxation: raw.bodyLanguage?.relaxation || visualSignals.bodyRelaxation,
    },
    visualSignals,
    visualTags: deriveVisualTags(visualSignals, photoQualityScore),
    photoQuality: {
      score: photoQualityScore,
      issues: raw.photoQuality?.issues || [],
    },
    summary: raw.summary || "Visible traits were analyzed for photo quality, coat, expression, and body language cues.",
    disclaimer: "Visual analysis describes visible traits only. Personality results require the behavior assessment.",
  };
}

export function isVisualTag(value: string): value is VisualTag {
  return VISUAL_TAGS.includes(value as VisualTag);
}
