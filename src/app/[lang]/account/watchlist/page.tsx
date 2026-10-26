import Link from "next/link";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getQuotes, getScreenerRows, listStocks } from "@/lib/market";
import { addToWatchlistForm, removeFromWatchlistForm } from "@/app/actions/watchlist";
import { fmtNumber, fmtPct, fmtPrice, priceTone, signTone, toneClass } from "@/lib/format";
import { buttonStyles, inputStyles } from "@/components/ui";
import { Trash } from "@/components/icons";

export default async function WatchlistPage({ params }: PageProps<"/[lang]/account/watchlist">) {
  const lang = await resolveLocale(params);
  const user = await requireUser(lang);
  const t = await getDictionary(lang);
  const items = await db.watchlistItem.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } });
  const quotes = new Map(getQuotes(items.map((i) => i.symbol)).map((q) => [q.symbol, q]));
  const tech = new Map(getScreenerRows().map((r) => [r.symbol, r]));
  const c = t.market.columns;

  return (
    <div className="space-y-6">
      <form action={addToWatchlistForm} className="flex max-w-md gap-2">
        <label htmlFor="wl-symbol" className="sr-only">
          {t.account.portfolio.symbol}
        </label>
        <input id="wl-symbol" name="symbol" required list="wl-symbols" placeholder="FPT" className={`${inputStyles} uppercase`} />
        <datalist id="wl-symbols">
          {listStocks().map((s) => (
            <option key={s.symbol} value={s.symbol} />
          ))}
        </datalist>
        <button type="submit" className={`${buttonStyles.primary} shrink-0`}>
          {t.account.watchlist.add}
        </button>
      </form>

      {items.length === 0 ? (
        <p className="py-8 text-center text-ink-muted">{t.account.watchlist.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="tabular w-full min-w-[640px] text-sm">
            <thead className="border-b border-line bg-paper text-ink-muted">
              <tr>
                <th scope="col" className="px-3 py-2.5 text-left font-medium">{c.symbol}</th>
                <th scope="col" className="px-3 py-2.5 text-right font-medium">{c.price}</th>
                <th scope="col" className="px-3 py-2.5 text-right font-medium">{c.changePct}</th>
                <th scope="col" className="px-3 py-2.5 text-right font-medium">{t.metrics.change1m}</th>
                <th scope="col" className="px-3 py-2.5 text-right font-medium">{t.metrics.rsi14}</th>
                <th scope="col" className="px-3 py-2.5 text-right font-medium">{c.volume}</th>
                <th scope="col" className="w-12 px-3 py-2.5"><span className="sr-only">{t.common.delete}</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map(({ symbol }) => {
                const q = quotes.get(symbol);
                const r = tech.get(symbol);
                if (!q || !r) return null;
                const tone = toneClass[priceTone(q.price, q.reference, q.ceiling, q.floor)];
                return (
                  <tr key={symbol}>
                    <th scope="row" className="px-3 py-2 text-left">
                      <Link href={`/${lang}/market/${symbol}`} className={`font-semibold hover:underline ${tone}`}>
                        {symbol}
                      </Link>
                    </th>
                    <td className={`px-3 py-2 text-right font-semibold ${tone}`}>{fmtPrice(q.price, lang)}</td>
                    <td className={`px-3 py-2 text-right ${tone}`}>{fmtPct(q.changePct, lang)}</td>
                    <td className={`px-3 py-2 text-right ${toneClass[signTone(r.change1m)]}`}>{fmtPct(r.change1m, lang, 1)}</td>
                    <td className="px-3 py-2 text-right">{fmtNumber(r.rsi14, lang, 1)}</td>
                    <td className="px-3 py-2 text-right">{fmtNumber(q.volume, lang)}</td>
                    <td className="px-1 py-1 text-right">
                      <form action={removeFromWatchlistForm}>
                        <input type="hidden" name="symbol" value={symbol} />
                        <button type="submit" aria-label={`${t.common.delete} ${symbol}`} className="inline-flex size-10 cursor-pointer items-center justify-center rounded-md text-ink-muted hover:bg-danger/10 hover:text-danger">
                          <Trash size={17} />
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
