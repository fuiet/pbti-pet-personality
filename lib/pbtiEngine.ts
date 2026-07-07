export type Trait = "A" | "I" | "E" | "S" | "V" | "C" | "P" | "G";

export interface PBTIResult {
  type: string;
  scores: Record<Trait, number>;
}

export function calculatePBTI(answers: Trait[]): PBTIResult {
  const scores: Record<Trait, number> = {
    A: 0,
    I: 0,
    E: 0,
    S: 0,
    V: 0,
    C: 0,
    P: 0,
    G: 0
  };

  answers.forEach((answer) => {
    scores[answer] += 1;
  });

  const type = [
    scores.A >= scores.I ? "A" : "I",
    scores.E >= scores.S ? "E" : "S",
    scores.V >= scores.C ? "V" : "C",
    scores.P >= scores.G ? "P" : "G"
  ].join("");

  return { type, scores };
}
