export type PersonalityCode =
  | "AEVG"
  | "AECG"
  | "ASCP"
  | "IEVP"
  | "IECP"
  | "IEVG"
  | "ASEP"
  | "ASEG"
  | "AEVP"
  | "ASCG"
  | "AECP"
  | "IECG";

export interface Personality {
  code: PersonalityCode;
  slug: string;
  name: string;
  title: string;
  emoji: string;
  description: string;
  traits: string[];
  advice: string[];
}

export const personalityOrder: PersonalityCode[] = [
  "AEVG", "AECG", "ASCP", "IEVP", "IECP", "IEVG",
  "ASEP", "ASEG", "AEVP", "ASCG", "AECP", "IECG",
];

export const personalities: Record<PersonalityCode, Personality> = {
  AEVG: { code: "AEVG", slug: "explorer", name: "Explorer", title: "Curious Pathfinder", emoji: "🧭", description: "Curious, adaptable, and eager to investigate unfamiliar places, objects, and routines.", traits: ["Curious", "Adventurous", "Adaptable"], advice: ["Offer safe novelty and varied enrichment", "Let exploration happen at a comfortable pace"] },
  AECG: { code: "AECG", slug: "guardian", name: "Guardian", title: "Loyal Protector", emoji: "🛡️", description: "Deeply loyal, steady, and naturally attentive to the safety and rhythm of the household.", traits: ["Loyal", "Protective", "Steady"], advice: ["Keep household rules consistent", "Reward calm observation rather than over-alertness"] },
  ASCP: { code: "ASCP", slug: "dreamer", name: "Dreamer", title: "Gentle Imagination", emoji: "☁️", description: "Soft, comfort-loving, and happiest in peaceful spaces with predictable affection.", traits: ["Gentle", "Calm", "Sensitive"], advice: ["Provide quiet resting places", "Use low-pressure play and gentle transitions"] },
  IEVP: { code: "IEVP", slug: "maverick", name: "Maverick", title: "Independent Spirit", emoji: "⚡", description: "Boldly independent, self-directed, and happiest when given freedom to make choices.", traits: ["Independent", "Bold", "Self-directed"], advice: ["Offer choices instead of forcing interaction", "Use clear boundaries without limiting autonomy"] },
  IECP: { code: "IECP", slug: "scholar", name: "Scholar", title: "Thoughtful Observer", emoji: "📚", description: "Analytical, observant, and inclined to study a situation before deciding how to respond.", traits: ["Thoughtful", "Observant", "Clever"], advice: ["Use puzzle-based enrichment", "Allow time to observe before joining new activities"] },
  IEVG: { code: "IEVG", slug: "leader", name: "Leader", title: "Confident Director", emoji: "👑", description: "Confident, expressive, and naturally inclined to take initiative in social situations.", traits: ["Confident", "Decisive", "Expressive"], advice: ["Channel initiative through training and games", "Keep boundaries calm and consistent"] },
  ASEP: { code: "ASEP", slug: "companion", name: "Companion", title: "Faithful Friend", emoji: "🤝", description: "Affectionate, connected, and happiest when sharing everyday life closely with trusted people.", traits: ["Affectionate", "Social", "Devoted"], advice: ["Build shared routines", "Balance closeness with healthy independent time"] },
  ASEG: { code: "ASEG", slug: "healer", name: "Healer", title: "Calming Heart", emoji: "🌿", description: "Emotionally sensitive, soothing, and often drawn toward people who need quiet companionship.", traits: ["Empathetic", "Soothing", "Sensitive"], advice: ["Protect them from overstimulation", "Use calm touch and predictable emotional cues"] },
  AEVP: { code: "AEVP", slug: "sunny", name: "Sunny", title: "Joyful Spark", emoji: "☀️", description: "Bright, enthusiastic, and openly affectionate, bringing visible energy into the home.", traits: ["Optimistic", "Energetic", "Friendly"], advice: ["Provide daily active play", "Use social rewards and positive attention"] },
  ASCG: { code: "ASCG", slug: "sentinel", name: "Sentinel", title: "Watchful Keeper", emoji: "🔭", description: "Alert, patient, and highly aware of small changes in people, sounds, and surroundings.", traits: ["Watchful", "Patient", "Alert"], advice: ["Create predictable routines", "Introduce unfamiliar situations gradually"] },
  AECP: { code: "AECP", slug: "player", name: "Player", title: "Playful Entertainer", emoji: "🎾", description: "Interactive, mischievous, and motivated by games, movement, and shared excitement.", traits: ["Playful", "Interactive", "Mischievous"], advice: ["Rotate games and toys", "Use play as a reward and learning tool"] },
  IECG: { code: "IECG", slug: "noble", name: "Noble", title: "Graceful Presence", emoji: "💎", description: "Composed, dignified, and quietly confident, with clear preferences and personal boundaries.", traits: ["Graceful", "Composed", "Confident"], advice: ["Respect personal space", "Offer calm affection without pressure"] },
};

export const defaultPersonalityCode: PersonalityCode = "ASEP";

export function getPersonalityImage(code: PersonalityCode, species: "cat" | "dog" = "cat") {
  const personality = personalities[code];
  const index = String(personalityOrder.indexOf(code) + 1).padStart(2, "0");
  return `/assets/personalities/${species === "dog" ? "dogs" : "cats"}/${index}-${personality.slug}-${species}.webp`;
}
