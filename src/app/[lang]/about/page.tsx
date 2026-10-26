import type { Metadata } from "next";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { ButtonLink, Container, PageHeader } from "@/components/ui";
import { GrowthRings } from "@/components/growth-rings";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const t = await getDictionary(await resolveLocale(params));
  return { title: t.about.title, description: t.about.lead };
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const lang = await resolveLocale(params);
  const t = await getDictionary(lang);
  return (
    <>
      <PageHeader title={t.about.title} lead={t.about.lead} />
      <Container className="grid gap-16 py-20 lg:grid-cols-[1fr_1.2fr]">
        <div className="relative hidden lg:block">
          <GrowthRings className="sticky top-28 w-full max-w-md text-lim/70" />
        </div>
        <div>
          <h2 className="font-display text-h2 text-forest">{t.about.storyTitle}</h2>
          <div className="mt-5 space-y-5 text-lg leading-relaxed text-ink">
            {t.about.story.map((para) => (
              <p key={para}>{para}</p>
            ))}
          </div>

          <h2 className="mt-16 font-display text-h2 text-forest">{t.about.valuesTitle}</h2>
          <dl className="mt-6 divide-y divide-line border-y border-line">
            {t.about.values.map((v) => (
              <div key={v.title} className="grid gap-1 py-5 sm:grid-cols-[10rem_1fr] sm:gap-6">
                <dt className="font-semibold text-ink">{v.title}</dt>
                <dd className="text-ink-muted">{v.body}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-12 flex flex-wrap gap-3">
            <ButtonLink href={`/${lang}/services`}>{t.nav.services}</ButtonLink>
            <ButtonLink href={`/${lang}/team`} variant="secondary">
              {t.nav.team}
            </ButtonLink>
          </div>
        </div>
      </Container>
    </>
  );
}
