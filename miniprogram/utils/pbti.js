const { resolvePersonality } = require("./personalities");

const dimensionDefinitions = [
  { key: "attachment", leftTrait: "A", rightTrait: "I", label: "Attachment vs Independence" },
  { key: "exploration", leftTrait: "E", rightTrait: "S", label: "Exploration vs Stability" },
  { key: "vitality", leftTrait: "V", rightTrait: "C", label: "Vitality vs Composure" },
  { key: "playfulness", leftTrait: "P", rightTrait: "G", label: "Playfulness vs Guardianship" },
];

const personalityPrototypes = [
  { code: "IEVP", vector: { attachment: 48, exploration: 88, vitality: 62, playfulness: 72 } },
  { code: "ASVG", vector: { attachment: 72, exploration: 34, vitality: 42, playfulness: 18 } },
  { code: "ISCP", vector: { attachment: 44, exploration: 28, vitality: 24, playfulness: 46 } },
  { code: "IEVG", vector: { attachment: 24, exploration: 82, vitality: 68, playfulness: 58 } },
  { code: "IECG", vector: { attachment: 36, exploration: 42, vitality: 30, playfulness: 36 } },
  { code: "AEVG", vector: { attachment: 58, exploration: 70, vitality: 76, playfulness: 24 } },
  { code: "ASCP", vector: { attachment: 90, exploration: 42, vitality: 48, playfulness: 62 } },
  { code: "ASCG", vector: { attachment: 78, exploration: 30, vitality: 26, playfulness: 34 } },
  { code: "AEVP", vector: { attachment: 86, exploration: 70, vitality: 86, playfulness: 78 } },
  { code: "ISCG", vector: { attachment: 46, exploration: 24, vitality: 34, playfulness: 12 } },
  { code: "AECP", vector: { attachment: 64, exploration: 66, vitality: 82, playfulness: 90 } },
  { code: "ISVG", vector: { attachment: 22, exploration: 38, vitality: 22, playfulness: 20 } },
];

function emptyTraitScores() {
  return { A: 0, I: 0, E: 0, S: 0, V: 0, C: 0, P: 0, G: 0 };
}

function percentage(left, right) {
  const total = left + right;
  if (!total) return 50;
  return Math.round((left / total) * 100);
}

function distance(vector, prototype) {
  const squared = dimensionDefinitions.reduce((sum, dimension) => {
    const diff = vector[dimension.key] - prototype.vector[dimension.key];
    return sum + diff * diff;
  }, 0);

  return Math.sqrt(squared / dimensionDefinitions.length);
}

function calculatePBTI(answers) {
  const traitScores = emptyTraitScores();

  answers.forEach((answer) => {
    if (traitScores[answer] !== undefined) {
      traitScores[answer] += 1;
    }
  });

  const dimensions = dimensionDefinitions.map((dimension) => {
    const value = percentage(traitScores[dimension.leftTrait], traitScores[dimension.rightTrait]);
    return {
      key: dimension.key,
      label: dimension.label,
      value,
    };
  });

  const dimensionScores = dimensions.reduce((acc, dimension) => {
    acc[dimension.key] = dimension.value;
    return acc;
  }, {});

  const ranked = personalityPrototypes
    .map((prototype) => ({ prototype, distance: distance(dimensionScores, prototype) }))
    .sort((a, b) => a.distance - b.distance);

  const best = ranked[0] ? ranked[0].prototype : personalityPrototypes[1];
  const personality = resolvePersonality(best.code);

  return {
    code: personality.code,
    personality,
    traitScores,
    dimensions,
    dimensionScores,
    fitScore: Math.max(0, Math.min(100, Math.round(100 - ranked[0].distance))),
  };
}

module.exports = {
  calculatePBTI,
};
