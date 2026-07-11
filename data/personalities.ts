export interface Personality {
  code: string;
  name: string;
  title: string;
  emoji: string;
  description: string;
  traits: string[];
  advice: string[];
}

export interface PersonalityShowcaseItem {
  name: string;
  blurb: string;
}

export const defaultPersonalityCode = "AECG";

export const personalityShowcase: PersonalityShowcaseItem[] = [
  { name: "Explorer", blurb: "Curious and quick to investigate." },
  { name: "Guardian", blurb: "Steady, loyal, and protective." },
  { name: "Dreamer", blurb: "Gentle, calm, and comfort-loving." },
  { name: "Maverick", blurb: "Independent and bold in new spaces." },
  { name: "Scholar", blurb: "Observant, thoughtful, and clever." },
  { name: "Leader", blurb: "Confident, expressive, and self-assured." },
  { name: "Companion", blurb: "Warm, attached, and people-oriented." },
  { name: "Healer", blurb: "Soft-hearted and emotionally grounding." },
  { name: "Sunny", blurb: "Bright, social, and joyfully energetic." },
  { name: "Sentinel", blurb: "Watchful, patient, and alert." },
  { name: "Player", blurb: "Interactive, mischievous, and fun-loving." },
  { name: "Noble", blurb: "Calm, poised, and quietly confident." },
];

export const personalities: Record<string, Personality> = {
  AEVP: {
    code: "AEVP",
    name: "Sunny",
    title: "Bright Companion",
    emoji: "SU",
    description: "A joyful pet who fills the home with upbeat energy, clear affection, and playful enthusiasm.",
    traits: ["Playful", "Social", "Energetic"],
    advice: ["Provide active play every day", "Use praise and shared routines to build connection"],
  },
  AEVG: {
    code: "AEVG",
    name: "Explorer",
    title: "Free Spirit",
    emoji: "EX",
    description: "A brave and curious companion who loves discovering new things and checking every corner first.",
    traits: ["Curious", "Brave", "Independent"],
    advice: ["Offer safe exploration opportunities", "Respect their need for variety and choice"],
  },
  AECP: {
    code: "AECP",
    name: "Player",
    title: "Joyful Teammate",
    emoji: "PL",
    description: "A lively, engaging pet that turns everyday moments into games and shared attention into fun.",
    traits: ["Curious", "Gentle", "Interactive"],
    advice: ["Use short, rewarding games", "Keep enrichment varied and easy to join"],
  },
  AECG: {
    code: "AECG",
    name: "Guardian",
    title: "Steady Protector",
    emoji: "GU",
    description: "Quiet outside, deeply connected inside. This pet shows love through trust, loyalty, and steady presence.",
    traits: ["Calm", "Loyal", "Sensitive"],
    advice: ["Respect personal space", "Keep routines stable and predictable"],
  },
  ASEP: {
    code: "ASEP",
    name: "Companion",
    title: "Comfort Explorer",
    emoji: "CO",
    description: "A close-hearted pet who enjoys familiar bonds and gentle adventures taken at a comfortable pace.",
    traits: ["Careful", "Curious", "Balanced"],
    advice: ["Create safe exploration areas", "Introduce novelty in small steps"],
  },
  ASEG: {
    code: "ASEG",
    name: "Healer",
    title: "Trusted Friend",
    emoji: "HE",
    description: "A dependable, soothing presence who brings calm and comfort simply by staying near the family.",
    traits: ["Reliable", "Loyal", "Stable"],
    advice: ["Maintain routines", "Build trust through consistent signals"],
  },
  ASCP: {
    code: "ASCP",
    name: "Dreamer",
    title: "Soft Soul",
    emoji: "DR",
    description: "A peaceful pet who enjoys comfort, quiet companionship, and a gentle rhythm to daily life.",
    traits: ["Relaxed", "Gentle", "Comfort-seeking"],
    advice: ["Provide cozy resting spaces", "Keep affection calm and predictable"],
  },
  ASCG: {
    code: "ASCG",
    name: "Sentinel",
    title: "Calm Observer",
    emoji: "SE",
    description: "A watchful pet who values harmony, notices subtle change, and keeps a quiet eye on the home.",
    traits: ["Peaceful", "Observant", "Patient"],
    advice: ["Keep environments calm", "Avoid forcing fast social interactions"],
  },
  IEVP: {
    code: "IEVP",
    name: "Maverick",
    title: "Active Scout",
    emoji: "MA",
    description: "Independent but curious, this pet loves testing limits, chasing novelty, and making its own path.",
    traits: ["Explorer", "Active", "Self-directed"],
    advice: ["Offer new experiences", "Rotate toys and enrichment regularly"],
  },
  IEVG: {
    code: "IEVG",
    name: "Leader",
    title: "Bold Individual",
    emoji: "LE",
    description: "A confident, self-assured pet with strong curiosity and a clear sense of what it wants.",
    traits: ["Bold", "Independent", "Curious"],
    advice: ["Give freedom and challenges", "Use boundaries that still allow choice"],
  },
  IECP: {
    code: "IECP",
    name: "Scholar",
    title: "Thoughtful Observer",
    emoji: "SC",
    description: "A thoughtful observer who likes understanding the world before joining in and often notices what others miss.",
    traits: ["Smart", "Quiet", "Analytical"],
    advice: ["Allow observation time", "Use puzzle play and quiet enrichment"],
  },
  IECG: {
    code: "IECG",
    name: "Noble",
    title: "Calm Presence",
    emoji: "NO",
    description: "A composed, independent pet with strong personal boundaries and a dignified, grounded presence.",
    traits: ["Confident", "Calm", "Independent"],
    advice: ["Respect independence", "Offer affection without pressure"],
  },
  ISEP: {
    code: "ISEP",
    name: "Explorer",
    title: "Slow Explorer",
    emoji: "EX",
    description: "A curious pet who explores on its own terms and prefers having control over when to engage.",
    traits: ["Curious", "Independent", "Measured"],
    advice: ["Encourage exploration", "Let them approach new things gradually"],
  },
  ISEG: {
    code: "ISEG",
    name: "Guardian",
    title: "Quiet Protector",
    emoji: "GU",
    description: "A strong and reliable personality who protects quietly, values order, and stays deeply anchored to home.",
    traits: ["Strong", "Reliable", "Watchful"],
    advice: ["Respect boundaries", "Keep household routines consistent"],
  },
  ISCP: {
    code: "ISCP",
    name: "Dreamer",
    title: "Peaceful Companion",
    emoji: "DR",
    description: "A relaxed pet who enjoys peaceful moments, familiar spaces, and gentle, low-pressure connection.",
    traits: ["Calm", "Gentle", "Easygoing"],
    advice: ["Create comfortable spaces", "Use low-stress enrichment"],
  },
  ISCG: {
    code: "ISCG",
    name: "Sentinel",
    title: "Deep Observer",
    emoji: "SE",
    description: "A deeply observant pet with quiet confidence, strong intuition, and a patient way of reading the room.",
    traits: ["Mysterious", "Observant", "Steady"],
    advice: ["Be patient and understanding", "Let trust build through repeated calm moments"],
  },
};

export function resolvePersonality(code: string): Personality {
  return personalities[code] || personalities[defaultPersonalityCode];
}
