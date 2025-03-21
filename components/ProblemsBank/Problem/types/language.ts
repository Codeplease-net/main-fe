export type LanguageCode = "en" | "vi" | "zh-CN";

export interface Language {
  code: LanguageCode;
  name: string;
  icon: string;
  direction: "ltr" | "rtl";
}

export const SUPPORTED_LANGUAGES: Record<LanguageCode, Language> = {
  en: {
    code: "en",
    name: "English",
    icon: "🇬🇧",
    direction: "ltr",
  },
  vi: {
    code: "vi",
    name: "Vietnamese",
    icon: "🇻🇳",
    direction: "ltr",
  },
  "zh-CN": {
    code: "zh-CN",
    name: "Chinese",
    icon: "🇨🇳",
    direction: "ltr",
  },
};

export const DEFAULT_LANGUAGE: LanguageCode = "en";

export interface MultiLangContent<T> {
    en: T;
    vi: T;
    "zh-CN": T;
  }
  
// Usage example:
export interface TranslatedText extends MultiLangContent<string> {}

export const createEmptyMultiLangContent = <T>(defaultValue: T): MultiLangContent<T> => ({
  en: defaultValue,
  vi: defaultValue,
  "zh-CN": defaultValue,
});

export const isValidLanguage = (code: string): code is LanguageCode => {
  return code in SUPPORTED_LANGUAGES;
};