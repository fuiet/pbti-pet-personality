import { dimensionDefinitions, researchBasis, type DimensionKey } from "@/lib/pbtiEngine";
import type { PetVisualProfile } from "@/lib/visualProfile";

export interface ReportInput {
  petName: string;
  pbtiType: string;
  personalityName: string;
  traits: string[];
  advice: string[];
  dimensionScores?: Partial<Record<DimensionKey, number>>;
  fitScore?: number;
  modelVersion?: string;
  modelCue?: string;
  visualProfile?: PetVisualProfile | null;
  appearance?: {
    expression: string;
    eyes: string;
    posture: string;
    aura: string;
  };
}

export interface PetReport {
  summary: string;
  loveLanguage: string;
  relationship: string;
  appearance: string;
  recommendations: string[];
  methodology?: string;
  dimensionNarrative?: string[];
  fitIndex?: string;
  modelVersion?: string;
  researchBasis?: string[];
  modelBoundary?: string[];
  visualAnalysis?: PetVisualProfile | null;
}

export const modelBoundary = [
  "The four behavior dimensions and twelve personality prototypes are custom PBTI definitions informed by published research; they are not a reproduction of Feline Five or C-BARQ.",
  "Prototype Fit Index is a similarity score against a hand-defined prototype, not a statistical probability, clinical confidence, or diagnosis.",
  "Photo analysis describes visible appearance only. It cannot establish ancestry, health, intelligence, aggression, or real personality from a photo.",
  "PBTI is an educational behavior indicator. Repeated daily observations and professional guidance should take priority when welfare or behavior concerns exist.",
];

function percentage(left: number | undefined, right: number | undefined) {
  const total = (left || 0) + (right || 0);
  if (!total) return 50;
  return Math.round(((left || 0) / total) * 100);
}

export function dimensionScoresFromTraitScores(scores: Record<string, number>): Record<DimensionKey, number> {
  return {
    attachment: typeof scores.attachment === "number" ? scores.attachment : percentage(scores.A, scores.I),
    exploration: typeof scores.exploration === "number" ? scores.exploration : percentage(scores.E, scores.S),
    vitality: typeof scores.vitality === "number" ? scores.vitality : percentage(scores.V, scores.C),
    playfulness: typeof scores.playfulness === "number" ? scores.playfulness : percentage(scores.P, scores.G),
  };
}

function describeScore(score: number | undefined, highLabel: string, lowLabel: string) {
  if (score === undefined) return `${highLabel} and ${lowLabel} are still being calibrated.`;
  if (score >= 68) return `leans strongly toward ${highLabel}`;
  if (score >= 56) return `leans moderately toward ${highLabel}`;
  if (score <= 32) return `leans strongly toward ${lowLabel}`;
  if (score <= 44) return `leans moderately toward ${lowLabel}`;
  return `sits near the middle between ${highLabel} and ${lowLabel}`;
}

function visualAppearance(profile: PetVisualProfile) {
  const breed = profile.breedAssessment.primaryBreed || "unclear";
  const variety = profile.breedAssessment.variety && profile.breedAssessment.variety !== "unclear"
    ? `, ${profile.breedAssessment.variety}`
    : "";
  const coat = [profile.coat.color, profile.coat.length, profile.coat.pattern, profile.coat.texture]
    .filter((value) => value && value !== "unclear")
    .join(", ") || "unclear";

  return [
    profile.summary,
    `Breed estimate: ${breed}${variety}. Mixed-breed likelihood: ${profile.breedAssessment.mixedLikelihood}. ${profile.breedAssessment.mixedNotes}`,
    `Visible coat: ${coat}. Face: ${profile.face.muzzleShape}; eyes ${profile.face.eyeExpression}; ears ${profile.face.earPosition}.`,
    `Body language in the submitted photo: ${profile.bodyLanguage.posture}, ${profile.bodyLanguage.energyCue} energy, ${profile.bodyLanguage.relaxation}.`,
    `Photo quality: ${profile.photoQuality.score}/100${profile.photoQuality.issues.length ? `; ${profile.photoQuality.issues.join(", ")}` : "."}`,
    profile.disclaimer,
  ].join(" ");
}

export function generatePetReport(input: ReportInput): PetReport {
  const dimensionNarrative = dimensionDefinitions.map((dimension) => {
    const value = input.dimensionScores?.[dimension.key];
    return `${dimension.label}: ${describeScore(value, dimension.leftLabel, dimension.rightLabel)}. Evidence layer: ${dimension.evidence}`;
  });

  return {
    summary: `${input.petName} matches the ${input.personalityName} profile in the ${input.modelVersion || "PBTI Behavior Model"}. ${input.modelCue || "This profile is assigned from owner-observed behavior patterns rather than breed stereotypes."}`,
    loveLanguage: `${input.petName} most clearly communicates trust through the behavioral signals behind this profile: ${input.traits.join(", ").toLowerCase()}. Watch repeated daily patterns rather than one-off moments.`,
    relationship: `Your best relationship strategy is to support the core pattern behind ${input.personalityName}: respect their needs, shape the environment gently, and use consistent routines so behavior becomes easier to read over time.`,
    appearance: input.visualProfile
      ? visualAppearance(input.visualProfile)
      : input.appearance
        ? `${input.appearance.aura}. Expression: ${input.appearance.expression}. Eyes: ${input.appearance.eyes}.`
        : "No visual profile is available. The behavior assessment remains the primary scoring source.",
    recommendations: input.advice,
    methodology: `${input.modelVersion || "PBTI Behavior Model"} converts owner-observed behavior into four custom dimensions: Attachment vs Independence, Exploration vs Stability, Vitality vs Composure, and Playfulness vs Guardianship. The item design is informed by cat personality research such as the Feline Five and dog behavior instruments such as C-BARQ, but PBTI does not reproduce those instruments or their norms.`,
    dimensionNarrative,
    fitIndex: input.fitScore !== undefined ? `Prototype Fit Index: ${input.fitScore}/100. This is a model similarity score, not statistical confidence.` : undefined,
    modelVersion: input.modelVersion,
    researchBasis,
    modelBoundary,
    visualAnalysis: input.visualProfile || null,
  };
}

export { researchBasis };