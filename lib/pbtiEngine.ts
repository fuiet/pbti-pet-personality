import { personalities, PersonalityCode } from "@/data/personalities";

export type Trait = "A" | "I" | "E" | "S" | "V" | "C" | "P" | "G";

export interface DimensionScores {
  attachment: number;
  exploration: number;
  vitality: number;
  playfulness: number;
}

export interface PBTIResult {
  type: PersonalityCode;
  personality: (typeof personalities)[PersonalityCode];
  scores: Record<Trait, number>;
  dimensions: DimensionScores;
}

type Profile = DimensionScores & { code: PersonalityCode };

const profiles: Profile[] = [
  { code: "AEVG", attachment: 0.2, exploration: 0.95, vitality: 0.55, playfulness: -0.35 },
  { code: "AECG", attachment: 0.8, exploration: 0.45, vitality: -0.45, playfulness: -0.85 },
  { code: "ASCP", attachment: 0.35, exploration: -0.8, vitality: -0.9, playfulness: 0.55 },
  { code: "IEVP", attachment: -0.9, exploration: 0.8, vitality: 0.75, playfulness: 0.65 },
  { code: "IECP", attachment: -0.55, exploration: 0.55, vitality: -0.7, playfulness: 0.55 },
  { code: "IEVG", attachment: -0.35, exploration: 0.8, vitality: 0.9, playfulness: -0.65 },
  { code: "ASEP", attachment: 0.95, exploration: -0.45, vitality: 0.25, playfulness: 0.65 },
  { code: "ASEG", attachment: 0.9, exploration: -0.7, vitality: -0.35, playfulness: -0.55 },
  { code: "AEVP", attachment: 0.9, exploration: 0.75, vitality: 0.95, playfulness: 0.9 },
  { code: "ASCG", attachment: 0.4, exploration: -0.9, vitality: -0.65, playfulness: -0.95 },
  { code: "AECP", attachment: 0.65, exploration: 0.55, vitality: -0.35, playfulness: 0.95 },
  { code: "IECG", attachment: -0.85, exploration: 0.35, vitality: -0.75, playfulness: -0.8 },
];

function balance(positive: number, negative: number) {
  const total = positive + negative;
  return total === 0 ? 0 : (positive - negative) / total;
}

function distance(a: DimensionScores, b: DimensionScores) {
  return (
    Math.pow(a.attachment - b.attachment, 2) +
    Math.pow(a.exploration - b.exploration, 2) +
    Math.pow(a.vitality - b.vitality, 2) +
    Math.pow(a.playfulness - b.playfulness, 2)
  );
}

export function calculatePBTI(answers: Trait[]): PBTIResult {
  const scores: Record<Trait, number> = { A: 0, I: 0, E: 0, S: 0, V: 0, C: 0, P: 0, G: 0 };

  answers.forEach((answer) => {
    if (answer in scores) scores[answer] += 1;
  });

  const dimensions: DimensionScores = {
    attachment: balance(scores.A, scores.I),
    exploration: balance(scores.E, scores.S),
    vitality: balance(scores.V, scores.C),
    playfulness: balance(scores.P, scores.G),
  };

  const winner = profiles.reduce((best, candidate) =>
    distance(dimensions, candidate) < distance(dimensions, best) ? candidate : best
  );

  return {
    type: winner.code,
    personality: personalities[winner.code],
    scores,
    dimensions,
  };
}

export function dimensionPercent(value: number) {
  return Math.round(((value + 1) / 2) * 100);
}
