import type { Metadata } from "next";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { getIndices, getQuotes, getSessionDate, dataSource, listStocks } from "@/lib/market";
import { fmtDate, fmtNumber, fmtPct, fmtSigned, signTone, toneClass } from "@/lib/format";
import { Container, PageHeader, DataBadge } from "@/components/ui";
import { Sparkline } from "@/components/sparkline";
import { PriceBoard, type BoardRow } from "@/components/price-board";

export async function generateMetadata({ params }: PageProps<"/[lang]/market">): Promise<Metadata> {
  const t = await getDictionary(await resolveLocale(params));
  return { title: t.market.title, description: t.market.lead };
}

export default async function MarketPage({ params }: PageProps<"/[lang]/market">) {
  const lang = await resolveLocale(params);
  const t = await getDictionary(lang);
  const indices = getIndices();
  const quotes = new Map(getQuotes().map((q) => [q.symbol, q]));
  const rows: BoardRow[] = listStocks().map((s) => ({ ...s, ...quotes.get(s.symbol)! }));

  return (
    <>
      <PageHeader title={t.market.title} lead={t.market.lead}>
        <p className="mt-4 flex flex-wrap items-center gap-3 text-sm text-ink-muted">
          {t.common.session} {fmtDate(getSessionDate(), lang, { dateStyle: "full" })}
          <DataBadge source={dataSource} text={t.common} lang={lang} />
        </p>
      </PageHeader>

      <Container className="py-12">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {indices.map((idx) => {
            const tone = toneClass[signTone(idx.change)];
            return (
              <li key={idx.code} className="rounded-lg border border-line bg-surface p-5">
                <h2 className="text-sm font-medium text-ink-muted">{t.market.indices[idx.code]}</h2>
                <p className="tabular mt-1 text-2xl font-semibold">{fmtNumber(idx.value, lang, 2)}</p>
                <p className={`tabular text-sm font-medium ${tone}`}>
                  {fmtSigned(idx.change, lang)} ({fmtPct(idx.changePct, lang)})
                </p>
                <Sparkline values={idx.history.slice(-120).map((h) => h.value)} width={240} height={48} className={`mt-3 w-full ${tone}`} />
                <dl className="tabular mt-3 flex justify-between text-xs text-ink-muted">
                  <div>
                    <dt className="sr-only">{t.market.breadth}</dt>
                    <dd>
                      <span className="text-tone-up">▲ {idx.advancers}</span> · <span className="text-tone-down">▼ {idx.decliners}</span> ·{" "}
                      <span className="text-tone-ref">■ {idx.unchanged}</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="sr-only">{t.market.columns.volume}</dt>
                    <dd>
                      {t.market.columns.volume} {fmtNumber(idx.volume / 1e6, lang, 1)}M
                    </dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>

        <section className="mt-14">
          <h2 className="mb-5 font-display text-h2 text-forest">{t.market.board}</h2>
          <PriceBoard rows={rows} lang={lang} t={{ ...t.market, search: t.common.search, noResults: t.common.noResults }} />
        </section>
      </Container>
    </>
  );
}
