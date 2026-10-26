export const locales = ["vi", "en", "zh-TW"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "vi";
export const LOCALE_COOKIE = "lim_locale";

export const localeNames: Record<Locale, string> = {
  vi: "Tiếng Việt",
  en: "English",
  "zh-TW": "繁體中文",
};

// BCP 47 tags used for Intl number/date formatting.
export const intlLocale: Record<Locale, string> = {
  vi: "vi-VN",
  en: "en-US",
  "zh-TW": "zh-TW",
};

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function matchLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;
  const tags = acceptLanguage
    .split(",")
    .map((part) => part.split(";")[0].trim().toLowerCase())
    .filter(Boolean);
  for (const tag of tags) {
    if (tag.startsWith("vi")) return "vi";
    if (tag.startsWith("zh")) return "zh-TW";
    if (tag.startsWith("en")) return "en";
  }
  return defaultLocale;
}
