import Link from "next/link";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getManagedAccount, getPersonalPortfolio } from "@/lib/account";
import { fmtPct, fmtVnd, signTone, toneClass } from "@/lib/format";
import { ChevronRight } from "@/components/icons";

export default async function AccountOverview({ params }: PageProps<"/[lang]/account">) {
  const lang = await resolveLocale(params);
  const user = await requireUser(lang);
  const t = await getDictionary(lang);
  const [managed, personal, watchCount, screenCount] = await Promise.all([
    getManagedAccount(user.id),
    getPersonalPortfolio(user.id),
    db.watchlistItem.count({ where: { userId: user.id } }),
    db.savedScreen.count({ where: { userId: user.id } }),
  ]);
  const base = `/${lang}/account`;
  const a = t.account;

  const tiles = [
    {
      href: `${base}/managed`,
      label: a.tabs.managed,
      value: managed ? fmtVnd(managed.nav, lang) : "—",
      sub:
        managed?.sinceInception != null ? (
          <span className={toneClass[signTone(managed.sinceInception)]}>
            {fmtPct(managed.sinceInception, lang, 1)} {a.managed.sinceInception.toLowerCase()}
          </span>
        ) : (
          a.managed.noneCta
        ),
    },
    {
      href: `${base}/portfolio`,
      label: a.tabs.portfolio,
      value: personal.holdings.length ? fmtVnd(personal.value, lang) : "—",
      sub: personal.holdings.length ? (
        <span className={toneClass[signTone(personal.pnl)]}>
          {a.portfolio.pnl} {fmtPct(personal.pnlPct, lang, 1)}
        </span>
      ) : (
        a.portfolio.empty
      ),
    },
    { href: `${base}/watchlist`, label: a.tabs.watchlist, value: String(watchCount), sub: null },
    { href: `${base}/screens`, label: a.tabs.screens, value: String(screenCount), sub: null },
  ];

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {tiles.map((tile) => (
        <li key={tile.href}>
          <Link href={tile.href} className="group flex h-full flex-col rounded-lg border border-line bg-surface p-5 transition-colors hover:border-forest">
            <span className="flex items-center justify-between text-sm font-medium text-ink-muted">
              {tile.label}
              <ChevronRight size={18} className="transition-transform group-hover:translate-x-0.5 group-hover:text-forest" />
            </span>
            <span className="tabular mt-2 text-2xl font-semibold text-ink">{tile.value}</span>
            {tile.sub && <span className="tabular mt-1 text-sm text-ink-muted">{tile.sub}</span>}
          </Link>
        </li>
      ))}
    </ul>
  );
}
