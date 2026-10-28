import type { Metadata } from "next";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { getSectorStrength, getSessionDate, isSampleData } from "@/lib/market";
import { fmtDate } from "@/lib/format";
import { Container, PageHeader, SampleBadge } from "@/components/ui";
import { SectorStrengthMap } from "@/components/sector-strength-map";

export async function generateMetadata({ params }: PageProps<"/[lang]/tools/sector-strength">): Promise<Metadata> {
  const t = await getDictionary(await resolveLocale(params));
  return { title: t.tools.strength.title, description: t.tools.strength.lead };
}

export default async function SectorStrengthPage({ params }: PageProps<"/[lang]/tools/sector-strength">) {
  const lang = await resolveLocale(params);
  const t = await getDictionary(lang);
  const { dates, rows } = getSectorStrength();

  return (
    <>
      <PageHeader title={t.tools.strength.title} lead={t.tools.strength.lead}>
        <p className="mt-4 flex flex-wrap items-center gap-3 text-sm text-ink-muted">
          {t.common.session} {fmtDate(getSessionDate(), lang, { dateStyle: "full" })}
          {isSampleData && <SampleBadge label={t.common.sampleData} note={t.common.sampleDataNote} />}
        </p>
      </PageHeader>
      <Container className="py-10">
        <SectorStrengthMap
          dates={dates}
          rows={rows.map((r) => ({ ...r, label: t.market.sectors[r.sector] }))}
          lang={lang}
          t={t.tools.strength}
        />
        {isSampleData && <p className="mt-2 text-xs text-ink-muted">{t.common.sampleDataNote}</p>}
      </Container>
    </>
  );
}
