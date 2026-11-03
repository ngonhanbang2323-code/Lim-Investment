import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n-config";
import { getScreenerRows, getSessionDate, dataSource } from "@/lib/market";
import { currentUser } from "@/lib/auth";
import { fmtDate } from "@/lib/format";
import type { ScreenKind } from "@/lib/screener";
import { Container, PageHeader, DataBadge, dataNote } from "../ui";
import { Screener } from "./screener";

export async function ScreenerPage({ lang, kind }: { lang: Locale; kind: ScreenKind }) {
  const [t, user] = await Promise.all([getDictionary(lang), currentUser()]);
  const copy = t.tools[kind];
  return (
    <>
      <PageHeader title={copy.title} lead={copy.lead}>
        <p className="mt-4 flex flex-wrap items-center gap-3 text-sm text-ink-muted">
          {t.common.session} {fmtDate(getSessionDate(), lang, { dateStyle: "full" })}
          <DataBadge source={dataSource} text={t.common} lang={lang} />
        </p>
      </PageHeader>
      <Container className="py-10">
        <Screener
          kind={kind}
          rows={getScreenerRows()}
          lang={lang}
          signedIn={!!user}
          dataNote={dataNote(dataSource, t.common)}
          t={{ tools: t.tools, metrics: t.metrics, sectors: t.market.sectors, industries: t.market.industries, columns: t.market.columns, common: t.common }}
        />
      </Container>
    </>
  );
}

export async function screenerMetadata(lang: Locale, kind: ScreenKind) {
  const t = await getDictionary(lang);
  return { title: t.tools[kind].title, description: t.tools[kind].lead };
}
