import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { listStocks } from "@/lib/market";
import {
  addReport,
  deleteManagedHolding,
  deleteNav,
  deleteReport,
  saveManagedAccount,
  upsertManagedHolding,
  upsertNav,
} from "@/app/actions/admin";
import { fmtDate, fmtNumber } from "@/lib/format";
import { buttonStyles, inputStyles } from "@/components/ui";
import { Trash } from "@/components/icons";

const small = `${inputStyles} min-h-10 py-1.5 text-sm`;
const label = "grid gap-1.5 text-sm font-medium";

function DeleteRow({ action, userId, field, value, name }: { action: (f: FormData) => Promise<void>; userId: string; field: string; value: string; name: string }) {
  return (
    <form action={action}>
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name={field} value={value} />
      <button type="submit" aria-label={name} className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md text-ink-muted hover:bg-danger/10 hover:text-danger">
        <Trash size={16} />
      </button>
    </form>
  );
}

export default async function AdminClient({ params }: PageProps<"/[lang]/admin/clients/[id]">) {
  const lang = await resolveLocale(params);
  await requireAdmin(lang);
  const { id } = await params;
  const t = await getDictionary(lang);
  const c = t.admin.clients;
  const user = await db.user.findUnique({
    where: { id },
    include: {
      managed: { include: { holdings: { orderBy: { symbol: "asc" } }, navs: { orderBy: { date: "desc" } }, reports: { orderBy: { date: "desc" } } } },
    },
  });
  if (!user || user.role !== "CLIENT") notFound();
  const acc = user.managed;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-10">
      <div>
        <Link href={`/${lang}/admin/clients`} className="text-sm text-link hover:underline">
          ← {t.admin.tabs.clients}
        </Link>
        <h2 className="mt-3 font-display text-h2 text-forest">{user.name}</h2>
        <p className="text-ink-muted">
          {user.email} · {c.joined} {fmtDate(user.createdAt, lang)}
        </p>
      </div>

      <section className="rounded-lg border border-line bg-surface p-5">
        <h3 className="mb-4 font-semibold">{acc ? acc.name : c.createManaged}</h3>
        <form action={saveManagedAccount} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="userId" value={user.id} />
          <label className={label}>
            {c.accountName}
            <input name="name" required defaultValue={acc?.name} className={small} />
          </label>
          <label className={label}>
            {c.strategy}
            <input name="strategy" defaultValue={acc?.strategy} className={small} />
          </label>
          <label className={label}>
            {c.inception}
            <input name="inceptionDate" type="date" required defaultValue={acc?.inceptionDate.toISOString().slice(0, 10) ?? today} className={small} />
          </label>
          <label className={label}>
            {c.cash}
            <input name="cash" inputMode="numeric" defaultValue={acc ? String(acc.cash) : "0"} className={small} />
          </label>
          <label className={`${label} sm:col-span-2`}>
            {c.note}
            <textarea name="note" rows={2} defaultValue={acc?.note ?? ""} className={small} />
          </label>
          <div>
            <button type="submit" className={buttonStyles.primary}>
              {acc ? t.common.save : c.createManaged}
            </button>
          </div>
        </form>
      </section>

      {acc && (
        <>
          <section>
            <h3 className="mb-3 font-semibold">{c.holdings}</h3>
            <form action={upsertManagedHolding} className="mb-3 grid gap-3 rounded-lg border border-line bg-surface p-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
              <input type="hidden" name="userId" value={user.id} />
              <label className={label}>
                {t.account.portfolio.symbol}
                <input name="symbol" required list="admin-symbols" className={`${small} uppercase`} />
              </label>
              <datalist id="admin-symbols">
                {listStocks().map((s) => (
                  <option key={s.symbol} value={s.symbol} />
                ))}
              </datalist>
              <label className={label}>
                {t.account.portfolio.quantity}
                <input name="quantity" required inputMode="numeric" className={small} />
              </label>
              <label className={label}>
                {t.account.portfolio.avgPrice}
                <input name="avgCost" required inputMode="numeric" className={small} />
              </label>
              <button type="submit" className={`${buttonStyles.primary} min-h-10 text-sm`}>
                {c.addHolding}
              </button>
            </form>
            <ul className="tabular divide-y divide-line rounded-lg border border-line bg-surface text-sm">
              {acc.holdings.map((h) => (
                <li key={h.id} className="flex items-center gap-4 px-4 py-2">
                  <span className="w-14 font-semibold">{h.symbol}</span>
                  <span className="flex-1">
                    {fmtNumber(h.quantity, lang)} × {fmtNumber(h.avgCost, lang)}
                  </span>
                  <DeleteRow action={deleteManagedHolding} userId={user.id} field="symbol" value={h.symbol} name={`${t.common.delete} ${h.symbol}`} />
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="mb-3 font-semibold">{c.navs}</h3>
            <form action={upsertNav} className="mb-3 grid gap-3 rounded-lg border border-line bg-surface p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <input type="hidden" name="userId" value={user.id} />
              <label className={label}>
                {c.navDate}
                <input name="date" type="date" required defaultValue={today} className={small} />
              </label>
              <label className={label}>
                {c.navValue}
                <input name="nav" required inputMode="numeric" className={small} />
              </label>
              <button type="submit" className={`${buttonStyles.primary} min-h-10 text-sm`}>
                {c.addNav}
              </button>
            </form>
            <ul className="tabular max-h-80 divide-y divide-line overflow-y-auto rounded-lg border border-line bg-surface text-sm">
              {acc.navs.map((n) => (
                <li key={n.id} className="flex items-center gap-4 px-4 py-2">
                  <span className="w-32">{fmtDate(n.date, lang)}</span>
                  <span className="flex-1 text-right">{fmtNumber(n.nav, lang)}</span>
                  <DeleteRow action={deleteNav} userId={user.id} field="id" value={n.id} name={`${t.common.delete} ${fmtDate(n.date, lang)}`} />
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="mb-3 font-semibold">{c.reports}</h3>
            <form action={addReport} className="mb-3 grid gap-3 rounded-lg border border-line bg-surface p-4 sm:grid-cols-[1.2fr_1.5fr_0.8fr_auto] sm:items-end">
              <input type="hidden" name="userId" value={user.id} />
              <label className={label}>
                {c.reportTitle}
                <input name="title" required className={small} />
              </label>
              <label className={label}>
                {c.reportUrl}
                <input name="url" type="url" required placeholder="https://" className={small} />
              </label>
              <label className={label}>
                {c.navDate}
                <input name="date" type="date" defaultValue={today} className={small} />
              </label>
              <button type="submit" className={`${buttonStyles.primary} min-h-10 text-sm`}>
                {c.addReport}
              </button>
            </form>
            <ul className="divide-y divide-line rounded-lg border border-line bg-surface text-sm">
              {acc.reports.map((r) => (
                <li key={r.id} className="flex items-center gap-4 px-4 py-2">
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-link hover:underline">
                    {r.title}
                  </a>
                  <span className="text-ink-muted">{fmtDate(r.date, lang)}</span>
                  <DeleteRow action={deleteReport} userId={user.id} field="id" value={r.id} name={`${t.common.delete} ${r.title}`} />
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
