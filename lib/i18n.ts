export const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "zh-CN", label: "简体中文" },
] as const;

export type Language = (typeof LANGUAGE_OPTIONS)[number]["value"];

export const DEFAULT_LANGUAGE: Language = "en";

const messages = {
  en: {
    "language.label": "Language",
    "nav.home": "Home",
    "nav.method": "How it works",
    "nav.types": "Personality types",
    "nav.account": "My account",
    "auth.account": "Account",
    "auth.signIn": "Sign in",
    "auth.signOut": "Sign out",
    "auth.startFree": "Start free",
    "footer.copyright": "Copyright 2026 PBTI",
    "home.hero.title": "Discover who they really are",
    "home.hero.accent": "Research-informed, thoughtful, and fun",
    "home.hero.body": "PBTI turns everyday behavior into a clear personality profile through 28 questions, 12 shared pet types, a detailed report, and portrait-ready share cards.",
    "home.premium.label": "Premium free access",
    "home.premium.title": "Premium is free for 1 month",
    "home.premium.body": "Full reports, portrait posters, and multi-pet profiles are open during launch month.",
    "home.premium.cta": "Claim premium access",
    "home.cta.start": "Start the free test",
    "home.cta.types": "Explore the 12 personality types",
    "home.countdown.days": "Days",
    "home.countdown.hours": "Hours",
    "home.countdown.minutes": "Minutes",
    "home.countdown.seconds": "Seconds",
    "home.method.eyebrow": "PBTI method",
    "home.method.title": "How PBTI turns behavior into a useful report",
    "home.method.body": "PBTI is a behavior-based personality indicator. Owner-observed daily behavior determines the score; breed, age, and photo information only help personalize the reading experience.",
    "home.method.note": "Grounded in behavior research, not breed stereotypes. An educational guide, not a veterinary diagnosis.",
    "common.questions": "questions",
    "common.types": "types",
    "common.pages": "pages",
    "common.chapters": "chapters",
  },
  "zh-CN": {
    "language.label": "语言",
    "nav.home": "首页",
    "nav.method": "测试方法",
    "nav.types": "性格类型",
    "nav.account": "用户中心",
    "auth.account": "账户",
    "auth.signIn": "登录",
    "auth.signOut": "退出登录",
    "auth.startFree": "免费测试",
    "footer.copyright": "© 2026 PBTI",
    "home.hero.title": "读懂你的爱宠",
    "home.hero.accent": "发现它独一无二的性格",
    "home.hero.body": "从日常行为出发，用 28 道题梳理爱宠的性格倾向，匹配 12 种共同类型，并生成详细报告与专属写真分享卡。",
    "home.premium.label": "限时免费体验",
    "home.premium.title": "完整版权益免费开放 1 个月",
    "home.premium.body": "活动期间可免费查看完整报告、生成写真海报，并管理多只宠物档案。",
    "home.premium.cta": "立即免费体验",
    "home.cta.start": "开始免费测试",
    "home.cta.types": "查看 12 种性格类型",
    "home.countdown.days": "天",
    "home.countdown.hours": "小时",
    "home.countdown.minutes": "分钟",
    "home.countdown.seconds": "秒",
    "home.method.eyebrow": "PBTI 测试方法",
    "home.method.title": "从日常行为出发，读懂爱宠的性格",
    "home.method.body": "PBTI 以主人长期观察到的日常行为作为评分依据。品种、年龄和照片信息只用于丰富报告内容，不参与性格定型。",
    "home.method.note": "参考行为研究，不用品种刻板印象下结论。本测试仅用于了解与陪伴，不替代专业兽医诊断。",
    "common.questions": "道题",
    "common.types": "种类型",
    "common.pages": "页报告",
    "common.chapters": "章报告",
  },
} as const;

export type TranslationKey = keyof (typeof messages)["en"];

export function isAvailableLanguage(value: string): value is Language {
  return LANGUAGE_OPTIONS.some((option) => option.value === value);
}

export function translate(language: Language, key: TranslationKey) {
  return messages[language][key] || messages.en[key];
}
