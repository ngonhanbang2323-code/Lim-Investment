import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { currentUser } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";
import { GrowthRings } from "@/components/growth-rings";

export async function generateMetadata({ params }: PageProps<"/[lang]/register">): Promise<Metadata> {
  const t = await getDictionary(await resolveLocale(params));
  return { title: t.auth.registerTitle, robots: { index: false } };
}

export default async function Page({ params, searchParams }: PageProps<"/[lang]/register">) {
  const lang = await resolveLocale(params);
  const user = await currentUser();
  if (user) redirect(user.role === "ADMIN" ? `/${lang}/admin` : `/${lang}/account`);
  const t = await getDictionary(lang);
  const next = (await searchParams).next;
  return (
    <div className="relative overflow-hidden">
      <GrowthRings className="pointer-events-none absolute -left-40 top-10 hidden w-[560px] text-forest/10 lg:block" />
      <div className="relative mx-auto max-w-md px-4 py-16 sm:py-24">
        <h1 className="font-display text-h1 text-forest">{t.auth.registerTitle}</h1>
        <p className="mt-3 text-ink-muted">{t.auth.registerLead}</p>
        <div className="mt-8 rounded-lg border border-line bg-surface p-6 sm:p-8">
          <AuthForm mode="register" lang={lang} next={typeof next === "string" ? next : undefined} t={t.auth} />
        </div>
      </div>
    </div>
  );
}
