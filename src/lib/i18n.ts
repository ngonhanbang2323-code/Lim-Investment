import "server-only";
import { notFound } from "next/navigation";
import { hasLocale, type Locale } from "./i18n-config";
import type { Dictionary } from "@/dictionaries/vi";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  vi: () => import("@/dictionaries/vi").then((m) => m.default),
  en: () => import("@/dictionaries/en").then((m) => m.default),
  "zh-TW": () => import("@/dictionaries/zh-TW").then((m) => m.default),
};

export async function getDictionary(lang: string) {
  if (!hasLocale(lang)) notFound();
  return dictionaries[lang]();
}

/** Resolve the locale from route params, 404 for unknown ones. */
export async function resolveLocale(params: Promise<{ lang: string }>): Promise<Locale> {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return lang;
}

export type { Dictionary };
