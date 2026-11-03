import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { intlLocale } from "@/lib/i18n-config";
import { getStock, dataSource, getSessionDate } from "@/lib/market";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { fmtBillion, fmtDate, fmtNumber, fmtPct, fmtPrice, fmtSigned, priceTone, signTone, toneClass } from "@/lib/format";
import { Container, DataBadge, dataNote } from "@/components/ui";
import { PriceChart } from "@/components/price-chart";
import { WatchButton } from "@/components/watch-button";
import { ChevronRight } from "@/components/icons";

export async function generateMetadata({ params }: PageProps<"/[lang]/market/[symbol]">): Promise<Metadata> {
  const { symbol } = await params;
  const stock = getStock(symbol);
  if (!stock) return {};
  const lang = await resolveLocale(params);
  return { title: `${stock.meta.symbol} — ${lang === "vi" ? stock.meta.nameVi : stock.meta.nameEn}` };
}

export default async function StockPage({ params }: PageProps<"/[lang]/market/[symbol]">) {
  const lang = await resolveLocale(params);
  const { symbol } = await params;
  const stock = getStock(symbol);
  if (!stock) notFound();
  const t = await getDictionary(lang);
  const user = await currentUser();
  const watching = user
    ? !!(await db.watchlistItem.findUnique({ where: { userId_symbol: { userId: user.id, symbol: stock.meta.symbol } } }))
    : false;

  const { meta, quote: q, fundamentals: f, technicals: ta } = stock;
  const tone = toneClass[priceTone(q.price, q.reference, q.ceiling, q.floor)];
  const m = t.metrics;
  const name = lang === "vi" ? meta.nameVi : meta.nameEn;
  const n = (v: number, d = 2) => fmtNumber(v, lang, d);
  const signed = (v: number) => <span className={toneClass[signTone(v)]}>{fmtPct(v, lang, 1)}</span>;

  const fundamentals: [string, React.ReactNode][] = [
    [m.marketCap, `${fmtBillion(f.marketCap, lang)} ${t.common.unit.bn}`],
    [m.pe, f.pe == null ? "—" : n(f.pe, 1)],
    [m.pb, n(f.pb)],
    [m.eps, fmtNumber(Math.round(f.eps), lang)],
    [m.roe, fmtPct(f.roe, lang, 1, false)],
    [m.roa, fmtPct(f.roa, lang, 1, false)],
    [m.revenueGrowth, signed(f.revenueGrowth)],
    [m.profitGrowth, signed(f.profitGrowth)],
    [m.dividendYield, fmtPct(f.dividendYield, lang, 1, false)],
    [m.debtToEquity, n(f.debtToEquity)],
  ];
  const technicals: [string, React.ReactNode][] = [
    [m.ma20, fmtPrice(ta.ma20, lang)],
    [m.ma50, fmtPrice(ta.ma50, lang)],
    [m.ma200, fmtPrice(ta.ma200, lang)],
    [m.rsi14, n(ta.rsi14, 1)],
    [m.macd, n(ta.macd / 1000)],
    [m.volumeRatio, `${n(ta.volumeRatio)}×`],
    [m.high52w, fmtPrice(ta.high52w, lang)],
    [m.low52w, fmtPrice(ta.low52w, lang)],
    [m.change1w, signed(ta.change1w)],
    [m.change1m, signed(ta.change1m)],
    [m.change3m, signed(ta.change3m)],
  ];

  return (
    <Container className="py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-muted">
        <Link href={`/${lang}/market`} className="hover:text-forest hover:underline">
          {t.market.title}
        </Link>
        <ChevronRight size={14} className="mx-1 inline" />
        <span aria-current="page">{meta.symbol}</span>
      </nav>

      <header className="mt-6 flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
        <div>
          <h1 className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="font-display text-h1 text-forest">{meta.symbol}</span>
            <span className="text-lg text-ink-muted">{name}</span>
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            {t.market.stock.exchange}: {meta.exchange === "UPCOM" ? "UPCoM" : meta.exchange} · {t.market.stock.sector}:{" "}
            {t.market.sectors[meta.sector]} · {t.market.stock.industry}: {t.market.industries[meta.industry]}
          </p>
          <div className="tabular mt-5 flex flex-wrap items-baseline gap-x-4">
            <span className={`text-4xl font-semibold ${tone}`}>{fmtPrice(q.price, lang)}</span>
            <span className={`text-lg font-medium ${tone}`}>
              {fmtSigned(q.change / 1000, lang)} ({fmtPct(q.changePct, lang)})
            </span>
          </div>
          <p className="mt-2 flex flex-wrap items-center gap-3 text-sm text-ink-muted">
            {t.common.session} {fmtDate(getSessionDate(), lang)}
            <DataBadge source={dataSource} text={t.common} lang={lang} />
          </p>
        </div>
        <WatchButton
          symbol={meta.symbol}
          initial={watching}
          signedIn={!!user}
          loginHref={`/${lang}/login?next=/${lang}/market/${meta.symbol}`}
          labels={{ add: t.market.stock.addWatchlist, added: t.market.stock.inWatchlist, login: t.market.stock.loginToWatch }}
        />
      </header>

      <dl className="tabular mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-line bg-line text-sm sm:grid-cols-6">
        {(
          [
            [t.market.columns.reference, fmtPrice(q.reference, lang), "text-tone-ref"],
            [t.market.columns.ceiling, fmtPrice(q.ceiling, lang), "text-tone-ceil"],
            [t.market.columns.floor, fmtPrice(q.floor, lang), "text-tone-floor"],
            [t.market.columns.open, fmtPrice(q.open, lang), toneClass[priceTone(q.open, q.reference, q.ceiling, q.floor)]],
            [t.market.columns.volume, fmtNumber(q.volume, lang), ""],
            [t.market.columns.value, `${fmtBillion(q.value, lang, 1)} ${t.common.unit.bn}`, ""],
          ] as const
        ).map(([label, value, cls]) => (
          <div key={label} className="bg-surface px-4 py-3">
            <dt className="text-ink-muted">{label}</dt>
            <dd className={`mt-0.5 font-semibold ${cls}`}>{value}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-10">
        <h2 className="mb-4 font-display text-h2 text-forest">{t.market.stock.chart}</h2>
        <PriceChart locale={intlLocale[lang]} bars={stock.bars} rangeLabels={t.market.stock.range} label={`${meta.symbol} — ${t.market.stock.chart}`} />
        <p className="mt-2 text-xs text-ink-muted">{dataSource.kind === "sample" ? t.common.sampleDataNote : t.common.illustrativeChart}</p>
      </section>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        {[
          [t.market.stock.fundamentals, fundamentals],
          [t.market.stock.technicals, technicals],
        ].map(([title, items]) => (
          <section key={title as string}>
            <h2 className="font-display text-h2 text-forest">{title as string}</h2>
            <dl className="tabular mt-5 divide-y divide-line border-y border-line">
              {(items as [string, React.ReactNode][]).map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 py-2.5">
                  <dt className="text-ink-muted">{label}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
      <p className="mt-8 text-xs text-ink-muted">{dataNote(dataSource, t.common)}</p>
      <p className="mt-2 text-xs text-ink-muted">{t.footer.disclaimer}</p>
    </Container>
  );
}
