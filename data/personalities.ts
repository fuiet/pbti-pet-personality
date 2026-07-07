export interface Personality {
  code: string;
  name: string;
  title: string;
  emoji: string;
  description: string;
  traits: string[];
  advice: string[];
}

export const personalities: Record<string, Personality> = {
  AECG: {
    code: "AECG",
    name: "Gentle Guardian",
    title: "温柔守护者",
    emoji: "🌙",
    description:
      "Quiet outside, deeply connected inside. This pet shows love through trust and companionship.",
    traits: ["Calm", "Loyal", "Sensitive", "Observant"],
    advice: [
      "Respect personal space",
      "Keep routines stable",
      "Use gentle interaction"
    ]
  },
  AEVP: {
    code: "AEVP",
    name: "Little Sunshine",
    title: "小太阳",
    emoji: "☀️",
    description:
      "A joyful companion who brings energy and happiness to the family.",
    traits: ["Playful", "Social", "Energetic"],
    advice: [
      "Provide interactive games",
      "Spend quality time together"
    ]
  }
};
