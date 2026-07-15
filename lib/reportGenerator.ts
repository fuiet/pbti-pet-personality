import { dimensionDefinitions, researchBasis, type DimensionKey } from "@/lib/pbtiEngine";
import type { PetVisualProfile } from "@/lib/visualProfile";

export interface ReportInput {
  petName: string;
  species?: "cat" | "dog";
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
  loveLanguage: ReportSection[];
  relationship: ReportSection[];
  appearance: string;
  recommendations: ReportRecommendation[];
  methodology?: string;
  dimensionNarrative?: string[];
  fitIndex?: string;
  modelVersion?: string;
  researchBasis?: string[];
  modelBoundary?: string[];
  visualAnalysis?: PetVisualProfile | null;
}

export interface ReportSection {
  title: string;
  body: string;
}

export interface ReportRecommendation {
  title: string;
  detail: string;
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
    `Visible structure: ${profile.bodyLanguage.posture} posture, ${profile.bodyLanguage.energyCue} energy cues, and a ${profile.bodyLanguage.relaxation} presentation in the submitted views.`,
    "This identification is based only on visible features and should not be treated as proof of breed, ancestry, origin, health, or behavior.",
  ].join(" ");
}

function behavioralPreference(score: number | undefined, high: string, low: string) {
  if (score === undefined) return `a flexible balance between ${high} and ${low}`;
  if (score >= 68) return `a strong preference for ${high}`;
  if (score >= 56) return `a moderate preference for ${high}`;
  if (score <= 32) return `a strong preference for ${low}`;
  if (score <= 44) return `a moderate preference for ${low}`;
  return `a balanced need for both ${high} and ${low}`;
}

export function generatePetReport(input: ReportInput): PetReport {
  const speciesLabel = input.species === "dog" ? "dog" : "cat";
  const attachment = behavioralPreference(input.dimensionScores?.attachment, "close social connection", "choice and personal space");
  const exploration = behavioralPreference(input.dimensionScores?.exploration, "novelty and discovery", "familiarity and predictable routines");
  const vitality = behavioralPreference(input.dimensionScores?.vitality, "active engagement", "calm, measured interaction");
  const playfulness = behavioralPreference(input.dimensionScores?.playfulness, "playful participation", "watchful and purposeful engagement");
  const dimensionNarrative = dimensionDefinitions.map((dimension) => {
    const value = input.dimensionScores?.[dimension.key];
    return `${dimension.label}: ${describeScore(value, dimension.leftLabel, dimension.rightLabel)}. Evidence layer: ${dimension.evidence}`;
  });

  return {
    summary: `${input.petName} matches the ${input.personalityName} profile in the ${input.modelVersion || "PBTI Behavior Model"}. ${input.modelCue || "This profile is assigned from owner-observed behavior patterns rather than breed stereotypes."}`,
    loveLanguage: [
      {
        title: "How trust may appear",
        body: `${input.petName}'s ${input.personalityName} pattern suggests ${attachment}. Trust may show through small voluntary choices: approaching, remaining nearby, inviting contact, relaxing in your presence, or returning after taking space. Repeated patterns matter more than one unusually affectionate or distant moment.`,
      },
      {
        title: "The kind of attention that feels good",
        body: `Connection is likely to feel best when it respects ${exploration} and ${vitality}. Offer interaction at a pace ${input.petName} can accept. Continue when the body stays soft and engaged; reduce intensity when your pet turns away, freezes, leaves, hides, or becomes over-aroused.`,
      },
      {
        title: "A personal affection dictionary",
        body: `For this ${speciesLabel}, affection may include greetings, shared rest, following at a comfortable distance, play invitations, slow eye contact, leaning or settling nearby. Notice which touch preferences, resting places, voices, games, and daily rituals ${input.petName} chooses repeatedly, then make those safe choices easy to access.`,
      },
    ],
    relationship: [
      {
        title: "Build security through predictability",
        body: `A strong relationship with ${input.petName} begins with a readable daily rhythm. Keep meals, walks or toileting, play, rest, and quiet household transitions consistent enough that your pet can anticipate what happens next. Predictability reduces the need to stay on alert and makes genuine preferences easier to observe.`,
      },
      {
        title: "Use consent and choice",
        body: `Invite rather than corner, reward voluntary check-ins, and provide an easy way to disengage. This is especially valuable for a ${input.personalityName} profile described as ${input.traits.join(", ").toLowerCase()}. Respecting a pause does not weaken the bond; it teaches ${input.petName} that communication is effective and safe.`,
      },
      {
        title: "Turn cooperation into a shared skill",
        body: `Use short, successful interactions matched to ${playfulness}. Reward the behavior you want to see, stop before frustration or over-arousal, and avoid punishment for fear, hesitation, or stress signals. Treat sudden changes as information about environment, comfort, learning history, or wellbeing rather than stubbornness.`,
      },
    ],
    appearance: input.visualProfile
      ? visualAppearance(input.visualProfile)
      : input.appearance
        ? `${input.appearance.aura}. Expression: ${input.appearance.expression}. Eyes: ${input.appearance.eyes}.`
        : "No visual profile is available. The behavior assessment remains the primary scoring source.",
    recommendations: [
      ...input.advice.map((detail, index) => ({ title: index === 0 ? "Start with the environment" : "Support the core personality pattern", detail })),
      { title: "Create a sustainable daily rhythm", detail: `Balance ${exploration} with reliable rest and recovery time. Change one part of the routine at a time so ${input.petName} can adjust without losing a sense of safety.` },
      { title: "Match enrichment to energy", detail: `Choose activities that support ${vitality} and ${playfulness}. Keep sessions short enough to finish successfully, rotate familiar options, and reduce difficulty when interest or confidence drops.` },
      { title: "Protect a true retreat", detail: `Provide a quiet area where ${input.petName} can rest without being followed, handled, photographed, or disturbed. Make food, water, toileting, temperature, and sleeping arrangements appropriate for the species and individual.` },
      { title: "Observe trends, not isolated moments", detail: `Track appetite, sleep, mobility, toileting, grooming, vocalization, and social behavior over time. Context matters: note what happened before a behavior, how long it lasted, and what helped your pet recover.` },
      { title: "Know when to seek professional help", detail: `Contact a qualified veterinarian promptly for sudden or persistent physical or behavioral changes. For ongoing behavior concerns, use a credentialed, reward-based behavior professional working alongside veterinary care when appropriate.` },
    ],
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
