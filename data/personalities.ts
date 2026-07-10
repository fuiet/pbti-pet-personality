export type PersonalityId =
  | "explorer"
  | "guardian"
  | "dreamer"
  | "maverick"
  | "scholar"
  | "leader"
  | "companion"
  | "healer"
  | "sunny"
  | "sentinel"
  | "player"
  | "noble";

export interface Personality {
  id: PersonalityId;
  code: string;
  name: string;
  title: string;
  emoji: string;
  description: string;
  traits: string[];
  advice: string[];
  imageIndex: number;
}

export const defaultPersonalityId: PersonalityId = "companion";

export const personalityOrder: PersonalityId[] = [
  "explorer",
  "guardian",
  "dreamer",
  "maverick",
  "scholar",
  "leader",
  "companion",
  "healer",
  "sunny",
  "sentinel",
  "player",
  "noble",
];

export const personalities: Record<PersonalityId, Personality> = {
  explorer: { id: "explorer", code: "EXPLORER", name: "Explorer", title: "Curious Pathfinder", emoji: "EX", imageIndex: 1, description: "Curious, adaptable, and eager to investigate unfamiliar places, objects, and experiences.", traits: ["Curious", "Adventurous", "Adaptable"], advice: ["Offer safe novelty and changing enrichment", "Let exploration happen at a comfortable pace"] },
  guardian: { id: "guardian", code: "GUARDIAN", name: "Guardian", title: "Loyal Protector", emoji: "GU", imageIndex: 2, description: "Deeply loyal and attentive to the people, animals, and spaces that matter most.", traits: ["Loyal", "Protective", "Steady"], advice: ["Keep household rules consistent", "Reward calm watching and secure attachment"] },
  dreamer: { id: "dreamer", code: "DREAMER", name: "Dreamer", title: "Gentle Imaginative Soul", emoji: "DR", imageIndex: 3, description: "A soft, peaceful personality that values comfort, quiet routines, and low-pressure connection.", traits: ["Gentle", "Relaxed", "Sensitive"], advice: ["Create cozy retreat spaces", "Use calm affection and predictable routines"] },
  maverick: { id: "maverick", code: "MAVERICK", name: "Maverick", title: "Independent Adventurer", emoji: "MA", imageIndex: 4, description: "Independent, bold, and happiest when allowed to make choices and follow a self-directed path.", traits: ["Independent", "Bold", "Self-directed"], advice: ["Provide choices instead of pressure", "Use challenge-based enrichment and freedom within boundaries"] },
  scholar: { id: "scholar", code: "SCHOLAR", name: "Scholar", title: "Thoughtful Observer", emoji: "SC", imageIndex: 5, description: "Observant and analytical, preferring to understand a situation before deciding how to respond.", traits: ["Thoughtful", "Observant", "Clever"], advice: ["Use puzzles and problem-solving games", "Allow time to watch before joining new situations"] },
  leader: { id: "leader", code: "LEADER", name: "Leader", title: "Confident Decision Maker", emoji: "LE", imageIndex: 6, description: "Confident, expressive, and naturally inclined to influence the rhythm of the household.", traits: ["Confident", "Assertive", "Energetic"], advice: ["Set clear, fair boundaries", "Channel confidence into training and structured activity"] },
  companion: { id: "companion", code: "COMPANION", name: "Companion", title: "Warm Social Partner", emoji: "CO", imageIndex: 7, description: "Affectionate and people-oriented, finding security and happiness through shared daily life.", traits: ["Affectionate", "Social", "Reliable"], advice: ["Include them in everyday routines", "Balance closeness with healthy independent time"] },
  healer: { id: "healer", code: "HEALER", name: "Healer", title: "Calming Emotional Anchor", emoji: "HE", imageIndex: 8, description: "Sensitive to mood and atmosphere, offering a calm presence and gentle emotional connection.", traits: ["Caring", "Calm", "Empathetic"], advice: ["Protect them from chaotic overstimulation", "Use gentle touch and consistent emotional signals"] },
  sunny: { id: "sunny", code: "SUNNY", name: "Sunny", title: "Bright Joy Bringer", emoji: "SU", imageIndex: 9, description: "Open, cheerful, and expressive, bringing visible enthusiasm to people, play, and daily routines.", traits: ["Optimistic", "Social", "Expressive"], advice: ["Provide frequent positive interaction", "Use active play and praise to maintain engagement"] },
  sentinel: { id: "sentinel", code: "SENTINEL", name: "Sentinel", title: "Patient Watcher", emoji: "SE", imageIndex: 10, description: "Alert, measured, and highly aware of changes in people, sounds, spaces, and routines.", traits: ["Watchful", "Patient", "Cautious"], advice: ["Introduce change gradually", "Provide safe observation points and predictable cues"] },
  player: { id: "player", code: "PLAYER", name: "Player", title: "Interactive Fun Seeker", emoji: "PL", imageIndex: 11, description: "Playful, mischievous, and highly motivated by games, movement, and shared interaction.", traits: ["Playful", "Interactive", "Spontaneous"], advice: ["Rotate games to prevent boredom", "Use play as a reward and relationship tool"] },
  noble: { id: "noble", code: "NOBLE", name: "Noble", title: "Poised Independent Spirit", emoji: "NO", imageIndex: 12, description: "Composed, dignified, and quietly confident, with clear preferences and strong personal boundaries.", traits: ["Graceful", "Composed", "Independent"], advice: ["Respect personal boundaries", "Offer calm attention without demanding a response"] },
};

export function resolvePersonality(id: string): Personality {
  return personalities[id as PersonalityId] || personalities[defaultPersonalityId];
}

export function getPersonalityImage(id: PersonalityId, species: "cat" | "dog"): string {
  const personality = personalities[id];
  const index = String(personality.imageIndex).padStart(2, "0");
  return `/assets/personalities/${species}s/${index}-${id}-${species}.webp`;
}
