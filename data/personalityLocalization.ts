const zhPersonalityCopy: Record<string, { name: string; title: string; traits: string[] }> = {
  IEVP: { name: "探索家", title: "勇敢的好奇心", traits: ["好奇", "爱冒险", "独立"] },
  ASVG: { name: "守护者", title: "可靠的家庭卫士", traits: ["忠诚", "守护", "稳定"] },
  ISCP: { name: "梦想家", title: "温柔的安静灵魂", traits: ["温柔", "安静", "享受舒适"] },
  IEVG: { name: "独行侠", title: "有主见的行动派", traits: ["大胆", "有主见", "活跃"] },
  IECG: { name: "学者", title: "善于观察的思考者", traits: ["聪明", "敏锐", "善思考"] },
  AEVG: { name: "领袖", title: "自信的表达者", traits: ["自信", "善表达", "果断"] },
  ASCP: { name: "陪伴者", title: "温暖的贴心伙伴", traits: ["亲昵", "亲人", "温暖"] },
  ASCG: { name: "治愈者", title: "带来安心的温柔力量", traits: ["体贴", "敏感", "信任"] },
  AEVP: { name: "小太阳", title: "点亮日常的开心果", traits: ["爱玩", "合群", "乐观"] },
  ISCG: { name: "哨兵", title: "安静而敏锐的观察者", traits: ["警觉", "耐心", "敏锐"] },
  AECP: { name: "玩乐家", title: "随时准备开玩的活力伙伴", traits: ["有趣", "爱互动", "调皮"] },
  ISVG: { name: "贵族", title: "从容优雅的独立灵魂", traits: ["优雅", "从容", "独立"] },
};

export function localizePersonality<T extends { code: string; name: string; title: string; traits: readonly string[] }>(personality: T, language: string) {
  if (language !== "zh-CN") return personality;
  const copy = zhPersonalityCopy[personality.code];
  return copy ? { ...personality, ...copy } : personality;
}
