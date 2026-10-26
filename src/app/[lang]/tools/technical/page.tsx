import type { Metadata } from "next";
import { resolveLocale } from "@/lib/i18n";
import { ScreenerPage, screenerMetadata } from "@/components/screener/screener-page";

export async function generateMetadata({ params }: PageProps<"/[lang]/tools/technical">): Promise<Metadata> {
  return screenerMetadata(await resolveLocale(params), "technical");
}

export default async function Page({ params }: PageProps<"/[lang]/tools/technical">) {
  return <ScreenerPage lang={await resolveLocale(params)} kind="technical" />;
}
