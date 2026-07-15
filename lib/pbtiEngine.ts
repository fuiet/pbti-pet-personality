import { defaultPersonalityCode, resolvePersonality } from "@/data/personalities";

export type Trait = "A" | "I" | "E" | "S" | "V" | "C" | "P" | "G";
export type DimensionKey = "attachment" | "exploration" | "vitality" | "playfulness";

export interface DimensionScore {
  key: DimensionKey;
  label: string;
  leftTrait: Trait;
  rightTrait: Trait;
  leftLabel: string;
  rightLabel: string;
  value: number;
  evidence: string;
}

export interface PersonalityPrototype {
  code: string;
  name: string;
  vector: Record<DimensionKey, number>;
  rationale: string;
}

export interface PBTIResult {
  code: string;
  type: string;
  personality: ReturnType<typeof resolvePersonality>;
  scores: Record<Trait, number> & Record<string, number>;
  dimensionScores: Record<DimensionKey, number>;
  dimensions: DimensionScore[];
  fitScore: number;
  modelVersion: string;
  researchBasis: string[];
}

const MODEL_VERSION = "PBTI Behavior Model v2.0";

export const researchBasis = [
  "Feline Five research: owner-rated cat personality work identified Neuroticism, Extraversion, Dominance, Impulsiveness, and Agreeableness as reliable factors. PBTI uses this as conceptual background, not as a direct scoring copy.",
  "C-BARQ research: a validated owner/handler dog behavior instrument covering domains such as attachment and attention-seeking, fear, excitability, trainability, chasing, and energy. PBTI is not C-BARQ and does not use its population norms.",
  "PBTI evidence policy: repeated owner-observed behavior drives the personality result; photo analysis is a separate visible-trait layer and must not be used to infer real personality, health, or ancestry.",
];

export const dimensionDefinitions: Omit<DimensionScore, "value">[] = [
  {
    key: "attachment",
    label: "Attachment vs Independence",
    leftTrait: "A",
    rightTrait: "I",
    leftLabel: "Attachment",
    rightLabel: "Independence",
    evidence: "Social closeness, check-ins, resting proximity, and owner-directed attention.",
  },
  {
    key: "exploration",
    label: "Exploration vs Stability",
    leftTrait: "E",
    rightTrait: "S",
    leftLabel: "Exploration",
    rightLabel: "Stability",
    evidence: "Response to novelty, unfamiliar spaces, changed routines, and cautious recovery.",
  },
  {
    key: "vitality",
    label: "Vitality vs Composure",
    leftTrait: "V",
    rightTrait: "C",
    leftLabel: "Vitality",
    rightLabel: "Composure",
    evidence: "Emotional expression, excitement, activity bursts, and impulse control.",
  },
  {
    key: "playfulness",
    label: "Playfulness vs Guardianship",
    leftTrait: "P",
    rightTrait: "G",
    leftLabel: "Playfulness",
    rightLabel: "Guardianship",
    evidence: "Play initiation, watchfulness, home monitoring, and protective/territorial patterns.",
  },
];

export const personalityPrototypes: PersonalityPrototype[] = [
  { code: "IEVP", name: "Explorer", vector: { attachment: 48, exploration: 88, vitality: 62, playfulness: 72 }, rationale: "High novelty-seeking with playful investigation." },
  { code: "ASVG", name: "Guardian", vector: { attachment: 72, exploration: 34, vitality: 42, playfulness: 18 }, rationale: "Bonded, stable, and protective of familiar routines." },
  { code: "ISCP", name: "Dreamer", vector: { attachment: 44, exploration: 28, vitality: 24, playfulness: 46 }, rationale: "Calm, comfort-oriented, and low-pressure in social contact." },
  { code: "IEVG", name: "Maverick", vector: { attachment: 24, exploration: 82, vitality: 68, playfulness: 58 }, rationale: "Independent, bold, and self-directed in new situations." },
  { code: "IECG", name: "Scholar", vector: { attachment: 36, exploration: 42, vitality: 30, playfulness: 36 }, rationale: "Observant, measured, and cognitively engaged before acting." },
  { code: "AEVG", name: "Leader", vector: { attachment: 58, exploration: 70, vitality: 76, playfulness: 24 }, rationale: "Confident, expressive, and structured in social space." },
  { code: "ASCP", name: "Companion", vector: { attachment: 90, exploration: 42, vitality: 48, playfulness: 62 }, rationale: "Strong social bonding with warm, everyday participation." },
  { code: "ASCG", name: "Healer", vector: { attachment: 78, exploration: 30, vitality: 26, playfulness: 34 }, rationale: "Soothing attachment, low reactivity, and emotional steadiness." },
  { code: "AEVP", name: "Sunny", vector: { attachment: 86, exploration: 70, vitality: 86, playfulness: 78 }, rationale: "High social joy, high expressiveness, and easy play." },
  { code: "ISCG", name: "Sentinel", vector: { attachment: 46, exploration: 24, vitality: 34, playfulness: 12 }, rationale: "Watchful, routine-oriented, and careful with change." },
  { code: "AECP", name: "Player", vector: { attachment: 64, exploration: 66, vitality: 82, playfulness: 90 }, rationale: "Interactive, energetic, and strongly game-oriented." },
  { code: "ISVG", name: "Noble", vector: { attachment: 22, exploration: 38, vitality: 22, playfulness: 20 }, rationale: "Composed, independent, and dignified with clear boundaries." },
];

function emptyTraitScores(): Record<Trait, number> {
  return { A: 0, I: 0, E: 0, S: 0, V: 0, C: 0, P: 0, G: 0 };
}

function percentage(left: number, right: number) {
  const total = left + right;
  if (!total) return 50;
  return Math.round((left / total) * 100);
}

function prototypeDistance(vector: Record<DimensionKey, number>, prototype: PersonalityPrototype) {
  const squared = dimensionDefinitions.reduce((sum, dimension) => {
    const diff = vector[dimension.key] - prototype.vector[dimension.key];
    return sum + diff * diff;
  }, 0);

  return Math.sqrt(squared / dimensionDefinitions.length);
}

export function calculatePBTI(answers: Trait[]): PBTIResult {
  const traitScores = emptyTraitScores();

  answers.forEach((answer) => {
    traitScores[answer] += 1;
  });

  const dimensions = dimensionDefinitions.map((dimension) => ({
    ...dimension,
    value: percentage(traitScores[dimension.leftTrait], traitScores[dimension.rightTrait]),
  }));

  const dimensionScores = dimensions.reduce((acc, dimension) => {
    acc[dimension.key] = dimension.value;
    return acc;
  }, {} as Record<DimensionKey, number>);

  const ranked = personalityPrototypes
    .map((prototype) => ({ prototype, distance: prototypeDistance(dimensionScores, prototype) }))
    .sort((a, b) => a.distance - b.distance);

  const best = ranked[0]?.prototype || personalityPrototypes.find((prototype) => prototype.code === defaultPersonalityCode) || personalityPrototypes[0];
  const fitScore = Math.max(0, Math.min(100, Math.round(100 - (ranked[0]?.distance || 0))));
  const personality = resolvePersonality(best.code || defaultPersonalityCode);

  return {
    code: personality.code,
    type: personality.code,
    personality,
    scores: {
      ...traitScores,
      attachment: dimensionScores.attachment,
      exploration: dimensionScores.exploration,
      vitality: dimensionScores.vitality,
      playfulness: dimensionScores.playfulness,
      fit: fitScore,
    },
    dimensionScores,
    dimensions,
    fitScore,
    modelVersion: MODEL_VERSION,
    researchBasis,
  };
}
