import { dimensionDefinitions, researchBasis, type DimensionKey } from "@/lib/pbtiEngine";

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
  confidence?: string;
  modelVersion?: string;
}

function describeScore(score: number | undefined, highLabel: string, lowLabel: string) {
  if (score === undefined) return `${highLabel} and ${lowLabel} are still being calibrated.`;
  if (score >= 68) return `leans strongly toward ${highLabel}`;
  if (score >= 56) return `leans moderately toward ${highLabel}`;
  if (score <= 32) return `leans strongly toward ${lowLabel}`;
  if (score <= 44) return `leans moderately toward ${lowLabel}`;
  return `sits near the middle between ${highLabel} and ${lowLabel}`;
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
    appearance: input.appearance
      ? `${input.appearance.aura}. Expression: ${input.appearance.expression}. Eyes: ${input.appearance.eyes}.`
      : "Visual context personalizes the report and poster style, while the behavior assessment remains the primary scoring source.",
    recommendations: input.advice,
    methodology: `${input.modelVersion || "PBTI Behavior Model"} is based on four owner-observed behavior dimensions: Attachment vs Independence, Exploration vs Stability, Vitality vs Composure, and Playfulness vs Guardianship. The model is informed by cat personality research such as the Feline Five and dog behavior instruments such as C-BARQ and dog personality trait studies. It is an educational behavior indicator, not a veterinary or medical diagnosis.`,
    dimensionNarrative,
    confidence: input.fitScore !== undefined ? `Prototype match confidence: ${input.fitScore}%.` : undefined,
    modelVersion: input.modelVersion,
  };
}

export { researchBasis };
