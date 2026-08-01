const personalities = {
  IEVP: {
    code: "IEVP",
    name: "Explorer",
    title: "Curious Pathfinder",
    description: "A novelty-seeking pet that learns the world through movement, scent, and safe discovery.",
    traits: ["Curious", "Adventurous", "Alert"],
  },
  ASVG: {
    code: "ASVG",
    name: "Guardian",
    title: "Steady Protector",
    description: "A bonded and dependable pet that values routine, closeness, and careful observation.",
    traits: ["Loyal", "Stable", "Protective"],
  },
  ISCP: {
    code: "ISCP",
    name: "Dreamer",
    title: "Soft Comfort Seeker",
    description: "A gentle pet that prefers quiet rhythm, soft contact, and emotionally safe spaces.",
    traits: ["Gentle", "Comfort-loving", "Calm"],
  },
  IEVG: {
    code: "IEVG",
    name: "Maverick",
    title: "Independent Scout",
    description: "A bold pet that prefers freedom, choice, and self-directed discovery.",
    traits: ["Independent", "Bold", "Self-directed"],
  },
  IECG: {
    code: "IECG",
    name: "Scholar",
    title: "Thoughtful Observer",
    description: "A measured pet that studies a room before acting and enjoys low-pressure challenges.",
    traits: ["Observant", "Analytical", "Patient"],
  },
  AEVG: {
    code: "AEVG",
    name: "Leader",
    title: "Confident Director",
    description: "A clear, expressive pet that likes structure and takes up space with confidence.",
    traits: ["Confident", "Expressive", "Decisive"],
  },
  ASCP: {
    code: "ASCP",
    name: "Companion",
    title: "Warm Everyday Partner",
    description: "A strongly bonded pet that values shared routines and frequent closeness.",
    traits: ["Affectionate", "People-oriented", "Warm"],
  },
  ASCG: {
    code: "ASCG",
    name: "Healer",
    title: "Gentle Grounding Presence",
    description: "A soothing pet that creates comfort through calm signals and steady trust.",
    traits: ["Soothing", "Sensitive", "Trusting"],
  },
  AEVP: {
    code: "AEVP",
    name: "Sunny",
    title: "Joyful Social Spark",
    description: "A bright, upbeat pet that seeks play, attention, and cheerful interaction.",
    traits: ["Social", "Upbeat", "Energetic"],
  },
  ISCG: {
    code: "ISCG",
    name: "Sentinel",
    title: "Watchful Pattern Keeper",
    description: "A careful pet that tracks routines, spaces, and subtle environmental change.",
    traits: ["Watchful", "Patient", "Aware"],
  },
  AECP: {
    code: "AECP",
    name: "Player",
    title: "Interactive Game Maker",
    description: "A lively pet that turns movement, attention, and novelty into games.",
    traits: ["Playful", "Interactive", "Mischievous"],
  },
  ISVG: {
    code: "ISVG",
    name: "Noble",
    title: "Composed Independent Spirit",
    description: "A poised pet with clear boundaries and calm, dignified energy.",
    traits: ["Composed", "Independent", "Graceful"],
  },
};

function resolvePersonality(code) {
  return personalities[code] || personalities.ASVG;
}

module.exports = {
  personalities,
  resolvePersonality,
};
