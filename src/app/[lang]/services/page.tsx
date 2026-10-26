import type { Metadata } from "next";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { ButtonLink, Container, PageHeader } from "@/components/ui";

export async function generateMetadata({ params }: PageProps<"/[lang]/services">): Promise<Metadata> {
  const t = await getDictionary(await resolveLocale(params));
  return { title: t.services.title, description: t.services.lead };
}

export default async function ServicesPage({ params }: PageProps<"/[lang]/services">) {
  const lang = await resolveLocale(params);
  const t = await getDictionary(lang);
  return (
    <>
      <PageHeader title={t.services.title} lead={t.services.lead} />

      <Container className="py-16">
        <div className="divide-y divide-line">
          {t.services.items.map((s) => (
            <section key={s.key} id={s.key} className="grid scroll-mt-24 gap-6 py-12 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
              <h2 className="font-display text-h2 text-forest">{s.title}</h2>
              <div>
                <p className="text-lg leading-relaxed text-ink">{s.body}</p>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {s.points.map((point) => (
                    <li key={point} className="rounded-full border border-line-strong bg-surface px-3.5 py-1.5 text-sm text-ink">
                      {point}
                    </li>
                  ))}
                </ul>
                <ButtonLink href={`/${lang}/contact?topic=${s.key}`} variant="secondary" className="mt-8">
                  {t.common.bookConsultation}
                </ButtonLink>
              </div>
            </section>
          ))}
        </div>
      </Container>

      {/* The process is a real sequence, so the steps are numbered. */}
      <section className="on-dark bg-forest-deep text-white">
        <Container className="py-20">
          <h2 className="font-display text-h2">{t.services.processTitle}</h2>
          <ol className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {t.services.process.map((step, i) => (
              <li key={step.title} className="relative border-t border-white/20 pt-6">
                <span className="tabular font-display text-4xl text-lim-light">{i + 1}</span>
                <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-white/75">{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>
    </>
  );
}
