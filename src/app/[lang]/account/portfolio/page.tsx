import Link from "next/link";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { requireUser } from "@/lib/auth";
import { getPersonalPortfolio } from "@/lib/account";
import { listStocks } from "@/lib/market";
import { deleteHolding } from "@/app/actions/portfolio";
import { fmtNumber, fmtPct, fmtPrice, fmtVnd, priceTone, signTone, toneClass } from "@/lib/format";
import { HoldingForm } from "@/components/account/holding-form";
import { Trash } from "@/components/icons";

export default async function PortfolioPage({ params }: PageProps<"/[lang]/account/portfolio">) {
  const lang = await resolveLocale(params);
  const user = await requireUser(lang);
  const t = await getDictionary(lang);
  const p = t.account.portfolio;
  const pf = await getPersonalPortfolio(user.id);

  return (
    <div className="space-y-6">
      <p className="text-ink-muted">{p.lead}</p>
      <HoldingForm t={p} addLabel={`${t.common.add} / ${t.common.edit}`} symbols={listStocks().map((s) => s.symbol)} />

      {pf.holdings.length === 0 ? (
        <p className="py-8 text-center text-ink-muted">{p.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="tabular w-full min-w-[720px] text-sm">
            <thead className="border-b border-line bg-paper text-ink-muted">
              <tr>
                <th scope="col" className="px-3 py-2.5 text-left font-medium">{p.symbol}</th>
                <th scope="col" className="px-3 py-2.5 text-right font-medium">{p.quantity}</th>
                <th scope="col" className="px-3 py-2.5 text-right font-medium">{p.avgPrice}</th>
                <th scope="col" className="px-3 py-2.5 text-right font-medium">{p.marketPrice}</th>
                <th scope="col" className="px-3 py-2.5 text-right font-medium">{p.marketValue}</th>
                <th scope="col" className="px-3 py-2.5 text-right font-medium">{p.pnl}</th>
                <th scope="col" className="w-12 px-3 py-2.5"><span className="sr-only">{t.common.delete}</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {pf.holdings.map((h) => (
                <tr key={h.symbol}>
                  <th scope="row" className="px-3 py-2 text-left font-semibold">
                    <Link href={`/${lang}/market/${h.symbol}`} className="text-forest hover:underline">
                      {h.symbol}
                    </Link>
                  </th>
                  <td className="px-3 py-2 text-right">{fmtNumber(h.quantity, lang)}</td>
                  <td className="px-3 py-2 text-right">{fmtNumber(h.avgPrice, lang)}</td>
                  <td className={`px-3 py-2 text-right ${toneClass[priceTone(h.price, h.reference)]}`}>{fmtPrice(h.price, lang)}</td>
                  <td className="px-3 py-2 text-right">{fmtNumber(h.value, lang)}</td>
                  <td className={`px-3 py-2 text-right ${toneClass[signTone(h.pnl)]}`}>
                    {fmtNumber(h.pnl, lang)} <span className="text-xs">({fmtPct(h.pnlPct, lang, 1)})</span>
                  </td>
                  <td className="px-1 py-1 text-right">
                    <form action={deleteHolding}>
                      <input type="hidden" name="symbol" value={h.symbol} />
                      <button type="submit" aria-label={`${t.common.delete} ${h.symbol}`} className="inline-flex size-10 cursor-pointer items-center justify-center rounded-md text-ink-muted hover:bg-danger/10 hover:text-danger">
                        <Trash size={17} />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-line font-semibold">
              <tr>
                <th scope="row" className="px-3 py-2.5 text-left">{p.total}</th>
                <td colSpan={3} />
                <td className="px-3 py-2.5 text-right">{fmtVnd(pf.value, lang)}</td>
                <td className={`px-3 py-2.5 text-right ${toneClass[signTone(pf.pnl)]}`}>
                  {fmtNumber(pf.pnl, lang)} <span className="text-xs">({fmtPct(pf.pnlPct, lang, 1)})</span>
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
