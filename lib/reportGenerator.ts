import { dimensionDefinitions, researchBasis, type DimensionKey } from "@/lib/pbtiEngine";
import type { PetVisualProfile } from "@/lib/visualProfile";

export interface ReportInput {
  language?: "en" | "zh-CN";
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
  basis?: string;
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
  if (input.language === "zh-CN") {
    const name = input.petName;
    const scoreText = (score: number | undefined, high: string, low: string) => {
      if (score === undefined) return `${high}与${low}之间较为均衡`;
      if (score >= 68) return `明显偏向${high}`;
      if (score >= 56) return `较偏向${high}`;
      if (score <= 32) return `明显偏向${low}`;
      if (score <= 44) return `较偏向${low}`;
      return `在${high}与${low}之间较为均衡`;
    };
    const attachment = scoreText(input.dimensionScores?.attachment, "亲近陪伴", "自主空间");
    const exploration = scoreText(input.dimensionScores?.exploration, "探索新鲜事物", "熟悉稳定的节奏");
    const vitality = scoreText(input.dimensionScores?.vitality, "积极外放", "冷静克制");
    const playfulness = scoreText(input.dimensionScores?.playfulness, "玩耍互动", "观察与守护");
    const speciesLabel = input.species === "dog" ? "狗狗" : "猫咪";
    const attachmentIdentity = (input.dimensionScores?.attachment ?? 50) >= 55 ? "亲人、重视陪伴" : (input.dimensionScores?.attachment ?? 50) <= 45 ? "独立、有自己的节奏" : "既亲近又懂得享受独处";
    const explorationIdentity = (input.dimensionScores?.exploration ?? 50) >= 55 ? "好奇心强、乐于探索" : (input.dimensionScores?.exploration ?? 50) <= 45 ? "谨慎稳重、偏爱熟悉环境" : "对新鲜事物保持适度好奇";
    const vitalityIdentity = (input.dimensionScores?.vitality ?? 50) >= 55 ? "精力充沛，情绪表达直接" : (input.dimensionScores?.vitality ?? 50) <= 45 ? "沉稳安静，习惯先观察再行动" : "活跃与安静之间切换自然";
    const playIdentity = (input.dimensionScores?.playfulness ?? 50) >= 55 ? "也很享受游戏和共同互动" : (input.dimensionScores?.playfulness ?? 50) <= 45 ? "更擅长专注观察和守护熟悉的人与环境" : "既愿意玩耍，也能保持专注";
    const scoreBasis = (keys: Array<[string, number | undefined]>) => `测试依据：${keys.map(([label, value]) => `${label} ${value ?? 50}%`).join(" + ")}`;
    return {
      summary: `${name} 是一只${attachmentIdentity}，同时${explorationIdentity}的${speciesLabel}。它${vitalityIdentity}，${playIdentity}，是一位很有自己想法的${input.personalityName}。`,
      dimensionNarrative: [
        `亲近方式：${attachment}。`, `适应变化：${exploration}。`, `情绪表达：${vitality}。`, `玩心与守护：${playfulness}。`,
      ],
      loveLanguage: [
        { title: "它表达信任的方式", body: `${name}${attachment}。主动靠近、安心待在身边、邀请互动，或在独处后再次回来，都可能是它表达信任的方式。请关注长期重复出现的选择，而不是某一次特别黏人或疏远。` },
        { title: "它喜欢怎样被关注", body: `${name}${exploration}，同时${vitality}。互动时观察身体是否放松、是否愿意继续；当它转头、僵住、离开、躲藏或过度兴奋时，应及时降低互动强度。` },
        { title: "建立专属的爱意词典", body: "迎接你、在附近休息、保持舒服的跟随距离、邀请玩耍、缓慢眨眼或安静依偎，都可能是爱意。把它反复选择的触摸方式、休息位置、声音、游戏和生活仪式记录下来。" },
      ],
      relationship: [
        { title: "用可预期的生活建立安全感", body: `让 ${name} 能够大致预判吃饭、散步或如厕、玩耍和休息的时间。稳定不等于一成不变，而是让变化发生得清楚、温和，并留出恢复空间。` },
        { title: "尊重选择，也尊重拒绝", body: "用邀请代替强迫，为互动保留退出通道，并奖励它主动靠近与配合。尊重暂停不会削弱感情，反而会让爱宠知道自己的表达是安全且有效的。" },
        { title: "把配合变成共同练习", body: `${name}${playfulness}。采用短而容易成功的互动，在受挫或过度兴奋前结束；不要因害怕、犹豫或压力信号惩罚它。突然变化往往是在传递环境、舒适度或健康方面的信息。` },
      ],
      appearance: input.visualProfile
        ? `${input.visualProfile.summary} 品种判断仅依据照片中的可见特征，不能作为血统、来源、健康或真实行为的证明。`
        : "目前没有可用的外观鉴定信息；性格结果仍以行为测试为主要依据。",
      recommendations: [
        { title: "安排亲近与独处空间", detail: `${name}${attachment}。把主动亲近当作信任信号，也为它保留能够随时退出互动的安静位置。`, basis: scoreBasis([["亲近方式", input.dimensionScores?.attachment]]) },
        { title: "建立可持续的日常节奏", detail: `${name}${exploration}。一次只调整一项生活安排，并给它足够时间适应。`, basis: scoreBasis([["适应变化", input.dimensionScores?.exploration]]) },
        { title: "让活动强度匹配它的能量", detail: `${name}${vitality}，同时${playfulness}。选择难度适中的互动，在兴趣下降前结束，并轮换熟悉的活动。`, basis: scoreBasis([["情绪表达", input.dimensionScores?.vitality], ["玩心与守护", input.dimensionScores?.playfulness]]) },
        { title: "用可预测的方式回应需求", detail: "把进食、活动、休息和互动安排成容易理解的节奏；用奖励和清晰提示引导行为，不因犹豫、害怕或压力信号惩罚它。", basis: scoreBasis([["亲近方式", input.dimensionScores?.attachment], ["适应变化", input.dimensionScores?.exploration]]) },
        { title: "观察长期变化并及时求助", detail: "持续关注食欲、睡眠、行动、排泄、梳理、叫声和社交变化。若身体或行为突然改变、持续异常或影响生活，请尽快联系专业兽医。", basis: "依据：28 道日常行为观察仅反映性格倾向；健康异常不属于 PBTI 判断范围" },
      ],
      visualAnalysis: input.visualProfile || null,
      fitIndex: input.fitScore !== undefined ? `原型匹配指数：${input.fitScore}/100。该数值表示与 PBTI 原型的相似程度，不是统计置信度或医学诊断。` : undefined,
      modelVersion: input.modelVersion,
    };
  }
  const speciesLabel = input.species === "dog" ? "dog" : "cat";
  const attachment = behavioralPreference(input.dimensionScores?.attachment, "close social connection", "choice and personal space");
  const exploration = behavioralPreference(input.dimensionScores?.exploration, "novelty and discovery", "familiarity and predictable routines");
  const vitality = behavioralPreference(input.dimensionScores?.vitality, "active engagement", "calm, measured interaction");
  const playfulness = behavioralPreference(input.dimensionScores?.playfulness, "playful participation", "watchful and purposeful engagement");
  const attachmentIdentity = (input.dimensionScores?.attachment ?? 50) >= 55 ? "affectionate and connection-oriented" : (input.dimensionScores?.attachment ?? 50) <= 45 ? "independent and comfortable setting its own pace" : "comfortable with both closeness and personal space";
  const explorationIdentity = (input.dimensionScores?.exploration ?? 50) >= 55 ? "curious and eager to explore" : (input.dimensionScores?.exploration ?? 50) <= 45 ? "steady and happiest with familiar surroundings" : "thoughtfully curious about new experiences";
  const dimensionNarrative = dimensionDefinitions.map((dimension) => {
    const value = input.dimensionScores?.[dimension.key];
    return `${dimension.label}: ${describeScore(value, dimension.leftLabel, dimension.rightLabel)}. Evidence layer: ${dimension.evidence}`;
  });
  const scoreBasis = (keys: Array<[string, number | undefined]>) => `Assessment basis: ${keys.map(([label, value]) => `${label} ${value ?? 50}%`).join(" + ")}`;

  return {
    summary: `${input.petName} is ${attachmentIdentity} and ${explorationIdentity}. This distinctive combination makes this ${speciesLabel} a thoughtful ${input.personalityName} with a character all their own.`,
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
      { title: "Balance connection and personal space", detail: `${input.petName} shows ${attachment}. Invite contact, reward voluntary check-ins, and keep an easy retreat available.`, basis: scoreBasis([["Connection", input.dimensionScores?.attachment]]) },
      { title: "Create a sustainable daily rhythm", detail: `Balance ${exploration} with reliable rest and recovery time. Change one part of the routine at a time so ${input.petName} can adjust without losing a sense of safety.`, basis: scoreBasis([["Adaptability", input.dimensionScores?.exploration]]) },
      { title: "Match enrichment to energy", detail: `Choose activities that support ${vitality} and ${playfulness}. Keep sessions short enough to finish successfully, rotate familiar options, and reduce difficulty when interest or confidence drops.`, basis: scoreBasis([["Expression", input.dimensionScores?.vitality], ["Play style", input.dimensionScores?.playfulness]]) },
      { title: "Respond in a predictable way", detail: `Use clear cues and rewards around meals, activity, rest, and interaction. Do not punish hesitation, fear, or stress signals.`, basis: scoreBasis([["Connection", input.dimensionScores?.attachment], ["Adaptability", input.dimensionScores?.exploration]]) },
      { title: "Observe trends and seek help when needed", detail: `Track appetite, sleep, mobility, toileting, grooming, vocalization, and social behavior over time. Contact a qualified veterinarian promptly for sudden or persistent changes.`, basis: "Basis: the 28 owner-observed behavior items describe personality tendencies only; health changes are outside PBTI's scope" },
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
