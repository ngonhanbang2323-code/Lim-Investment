import Link from "next/link";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { intlLocale } from "@/lib/i18n-config";
import { requireUser } from "@/lib/auth";
import { getManagedAccount } from "@/lib/account";
import { fmtDate, fmtNumber, fmtPct, fmtPrice, fmtVnd, signTone, toneClass } from "@/lib/format";
import { ButtonLink } from "@/components/ui";
import { ValueChart } from "@/components/value-chart";
import { External } from "@/components/icons";

export default async function ManagedPage({ params }: PageProps<"/[lang]/account/managed">) {
  const lang = await resolveLocale(params);
  const user = await requireUser(lang);
  const t = await getDictionary(lang);
  const acc = await getManagedAccount(user.id);
  const a = t.account.managed;

  if (!acc) {
    return (
      <div className="rounded-lg border border-dashed border-line-strong p-10 text-center">
        <p className="text-ink-muted">{a.none}</p>
        <ButtonLink href={`/${lang}/services#managed`} className="mt-5">
          {a.noneCta}
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-display text-h2 text-forest">{acc.name}</h2>
        <dl className="tabular mt-5 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4">
          {[
            [a.nav, fmtVnd(acc.nav, lang)],
            [a.sinceInception, acc.sinceInception == null ? "—" : <span className={toneClass[signTone(acc.sinceInception)]}>{fmtPct(acc.sinceInception, lang, 1)}</span>],
            [a.strategy, acc.strategy],
            [a.inception, fmtDate(acc.inceptionDate, lang)],
          ].map(([label, value], i) => (
            <div key={i} className="bg-surface px-4 py-3">
              <dt className="text-sm text-ink-muted">{label}</dt>
              <dd className="mt-0.5 font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {acc.navs.length > 1 && (
        <section>
          <h3 className="mb-3 font-semibold">
            {a.nav} ({t.common.unit.bn})
          </h3>
          <ValueChart
            locale={intlLocale[lang]}
            label={a.nav}
            points={acc.navs.map((n) => ({ time: n.date.toISOString().slice(0, 10), value: n.nav }))}
          />
        </section>
      )}

      <section>
        <h3 className="mb-3 font-semibold">{a.holdings}</h3>
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="tabular w-full min-w-[640px] text-sm">
            <thead className="border-b border-line bg-paper text-ink-muted">
              <tr>
                <th scope="col" className="px-3 py-2.5 text-left font-medium">{t.account.portfolio.symbol}</th>
                <th scope="col" className="px-3 py-2.5 text-right font-medium">{t.account.portfolio.quantity}</th>
                <th scope="col" className="px-3 py-2.5 text-right font-medium">{t.account.portfolio.avgPrice}</th>
                <th scope="col" className="px-3 py-2.5 text-right font-medium">{t.account.portfolio.marketPrice}</th>
                <th scope="col" className="px-3 py-2.5 text-right font-medium">{t.account.portfolio.pnl}</th>
                <th scope="col" className="px-3 py-2.5 text-right font-medium">{a.weight}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {acc.holdings.map((h) => (
                <tr key={h.symbol}>
                  <th scope="row" className="px-3 py-2 text-left font-semibold">
                    <Link href={`/${lang}/market/${h.symbol}`} className="text-forest hover:underline">
                      {h.symbol}
                    </Link>
                  </th>
                  <td className="px-3 py-2 text-right">{fmtNumber(h.quantity, lang)}</td>
                  <td className="px-3 py-2 text-right">{fmtPrice(h.avgCost, lang)}</td>
                  <td className="px-3 py-2 text-right">{fmtPrice(h.price, lang)}</td>
                  <td className={`px-3 py-2 text-right ${toneClass[signTone(h.pnl)]}`}>{fmtPct(h.pnlPct, lang, 1)}</td>
                  <td className="px-3 py-2 text-right">{fmtPct(h.weight, lang, 1, false)}</td>
                </tr>
              ))}
              <tr>
                <th scope="row" className="px-3 py-2 text-left font-normal text-ink-muted">{a.cash}</th>
                <td colSpan={4} />
                <td className="px-3 py-2 text-right">{fmtPct(acc.total ? (acc.cash / acc.total) * 100 : 0, lang, 1, false)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-semibold">{a.reports}</h3>
        {acc.reports.length === 0 ? (
          <p className="text-ink-muted">{a.noReports}</p>
        ) : (
          <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
            {acc.reports.map((r) => (
              <li key={r.id}>
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center justify-between gap-4 px-4 py-3 hover:bg-forest-soft/50">
                  <span>
                    <span className="font-medium">{r.title}</span>
                    <span className="block text-sm text-ink-muted">{fmtDate(r.date, lang)}</span>
                  </span>
                  <External size={18} className="shrink-0 text-ink-muted" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
