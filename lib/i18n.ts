export const LANGUAGE_OPTIONS = [
  { value: "en", label: "English", available: true },
  { value: "zh", label: "中文", available: false },
  { value: "ja", label: "日本語", available: false },
] as const;

export type Language = (typeof LANGUAGE_OPTIONS)[number]["value"];

export function isAvailableLanguage(language: Language) {
  return LANGUAGE_OPTIONS.some((option) => option.value === language && option.available);
}
