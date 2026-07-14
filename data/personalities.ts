export interface Personality {
  code: string;
  name: string;
  title: string;
  emoji: string;
  description: string;
  traits: string[];
  advice: string[];
  modelCue: string;
}

export interface PersonalityShowcaseItem {
  name: string;
  blurb: string;
}

export const defaultPersonalityCode = "ASVG";

const twelvePersonalities: Record<string, Personality> = {
  EXPLORER: {
    code: "IEVP",
    name: "Explorer",
    title: "Curious Pathfinder",
    emoji: "EX",
    description: "A novelty-seeking pet that learns the world by investigating new spaces, sounds, scents, and routines.",
    traits: ["Curious", "Adventurous", "Alert"],
    advice: ["Offer safe novelty through rotating toys, scent games, and new walking or play routes.", "Let exploration happen with an easy escape path so curiosity stays confident."],
    modelCue: "High Exploration with moderate Playfulness.",
  },
  GUARDIAN: {
    code: "ASVG",
    name: "Guardian",
    title: "Steady Protector",
    emoji: "GU",
    description: "A bonded and steady pet that reads the home carefully and shows care through presence, routine, and watchfulness.",
    traits: ["Loyal", "Stable", "Protective"],
    advice: ["Keep daily routines predictable, especially around guests, meals, and rest.", "Reward calm checking-in behavior instead of forcing fast social contact."],
    modelCue: "High Attachment, high Stability, and high Guardianship.",
  },
  DREAMER: {
    code: "ISCP",
    name: "Dreamer",
    title: "Soft Comfort Seeker",
    emoji: "DR",
    description: "A gentle, low-pressure pet that prefers comfort, quiet rhythm, and emotionally safe spaces.",
    traits: ["Gentle", "Comfort-loving", "Calm"],
    advice: ["Create cozy rest zones and protect quiet recovery time.", "Use soft invitations for affection and avoid sudden environmental pressure."],
    modelCue: "High Composure with lower novelty-seeking.",
  },
  MAVERICK: {
    code: "IEVG",
    name: "Maverick",
    title: "Independent Scout",
    emoji: "MA",
    description: "An independent and bold pet that prefers choice, freedom, and self-directed discovery.",
    traits: ["Independent", "Bold", "Self-directed"],
    advice: ["Use choice-based routines and enrichment that lets your pet opt in.", "Set clear boundaries while preserving room for autonomy."],
    modelCue: "High Exploration and Independence.",
  },
  SCHOLAR: {
    code: "IECG",
    name: "Scholar",
    title: "Thoughtful Observer",
    emoji: "SC",
    description: "A measured pet that studies before acting, notices subtle patterns, and benefits from puzzle-like enrichment.",
    traits: ["Observant", "Analytical", "Patient"],
    advice: ["Offer puzzle feeders, quiet training games, and time to observe new situations.", "Do not rush decisions; let curiosity build through repeated safe exposure."],
    modelCue: "High Composure with careful, moderate Stability.",
  },
  LEADER: {
    code: "AEVG",
    name: "Leader",
    title: "Confident Director",
    emoji: "LE",
    description: "A confident and expressive pet that takes up space, communicates clearly, and likes knowing the rules of the room.",
    traits: ["Confident", "Expressive", "Decisive"],
    advice: ["Channel confidence into structured games, training cues, and cooperative tasks.", "Use consistent rules with calm reinforcement rather than confrontation."],
    modelCue: "High Vitality with confident Exploration and lower Playfulness than Player.",
  },
  COMPANION: {
    code: "ASCP",
    name: "Companion",
    title: "Warm Everyday Partner",
    emoji: "CO",
    description: "A strongly bonded pet that values shared routines, closeness, and frequent everyday connection.",
    traits: ["Affectionate", "People-oriented", "Warm"],
    advice: ["Build daily rituals for greetings, rest, play, and calm contact.", "Give reassurance during transitions so attachment remains secure."],
    modelCue: "Very high Attachment with balanced emotional expression.",
  },
  HEALER: {
    code: "ASCG",
    name: "Healer",
    title: "Gentle Grounding Presence",
    emoji: "HE",
    description: "A soothing, sensitive pet that brings calm through trust, soft signals, and steady emotional presence.",
    traits: ["Soothing", "Sensitive", "Trusting"],
    advice: ["Protect predictable quiet time and reward small signs of confidence.", "Use gentle cues, slow introductions, and consistent reassurance."],
    modelCue: "High Attachment and Composure.",
  },
  SUNNY: {
    code: "AEVP",
    name: "Sunny",
    title: "Joyful Social Spark",
    emoji: "SU",
    description: "A bright, expressive pet that seeks connection, play, and positive attention in everyday life.",
    traits: ["Social", "Upbeat", "Energetic"],
    advice: ["Plan regular interactive play and praise-based routines.", "Give constructive outlets before excitement turns into over-arousal."],
    modelCue: "High Attachment, Exploration, Vitality, and Playfulness.",
  },
  SENTINEL: {
    code: "ISCG",
    name: "Sentinel",
    title: "Watchful Pattern Keeper",
    emoji: "SE",
    description: "A careful and watchful pet that tracks environmental change, routines, and household signals.",
    traits: ["Watchful", "Patient", "Aware"],
    advice: ["Let your pet observe before joining new social situations.", "Keep household cues steady and avoid overwhelming novelty."],
    modelCue: "High Stability and Guardianship with controlled expression.",
  },
  PLAYER: {
    code: "AECP",
    name: "Player",
    title: "Interactive Game Maker",
    emoji: "PL",
    description: "A high-energy, playful pet that turns attention, movement, and novelty into games.",
    traits: ["Playful", "Interactive", "Mischievous"],
    advice: ["Use short training games, toy rotation, and reward-based challenges.", "Balance high-energy play with predictable decompression time."],
    modelCue: "Very high Playfulness and Vitality.",
  },
  NOBLE: {
    code: "ISVG",
    name: "Noble",
    title: "Composed Independent Spirit",
    emoji: "NO",
    description: "A poised pet with clear boundaries, quiet confidence, and a preference for respectful connection.",
    traits: ["Composed", "Independent", "Graceful"],
    advice: ["Offer affection as an invitation and respect when your pet chooses distance.", "Use calm routines and low-pressure enrichment to preserve trust."],
    modelCue: "High Independence and Composure.",
  },
};

export const personalityShowcase: PersonalityShowcaseItem[] = Object.values(twelvePersonalities).map((personality) => ({
  name: personality.name,
  blurb: personality.description,
}));

export const personalities: Record<string, Personality> = {
  ASVG: twelvePersonalities.GUARDIAN,
  ISCP: twelvePersonalities.DREAMER,
  IEVG: twelvePersonalities.MAVERICK,
  IECG: twelvePersonalities.SCHOLAR,
  AEVG: twelvePersonalities.LEADER,
  ASCP: twelvePersonalities.COMPANION,
  ASCG: twelvePersonalities.HEALER,
  AEVP: twelvePersonalities.SUNNY,
  ISCG: twelvePersonalities.SENTINEL,
  AECP: twelvePersonalities.PLAYER,
  ISVG: twelvePersonalities.NOBLE,
  IEVP: twelvePersonalities.EXPLORER,
  ...twelvePersonalities,
  AECG: twelvePersonalities.GUARDIAN,
  ASEP: twelvePersonalities.COMPANION,
  ASEG: twelvePersonalities.HEALER,
  IECP: twelvePersonalities.SCHOLAR,
  ISEP: twelvePersonalities.EXPLORER,
  ISEG: twelvePersonalities.GUARDIAN,
};

export function resolvePersonality(code: string): Personality {
  const normalized = code?.trim().toUpperCase();
  const byCode = personalities[normalized];

  if (byCode) return byCode;

  const byName = Object.values(twelvePersonalities).find((personality) => personality.name.toUpperCase() === normalized);
  return byName || personalities[defaultPersonalityCode];
}
