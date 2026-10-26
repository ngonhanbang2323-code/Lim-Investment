import Link from "next/link";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteScreenForm } from "@/app/actions/screens";
import { fmtDate } from "@/lib/format";
import { Trash } from "@/components/icons";

export default async function ScreensPage({ params }: PageProps<"/[lang]/account/screens">) {
  const lang = await resolveLocale(params);
  const user = await requireUser(lang);
  const t = await getDictionary(lang);
  const screens = await db.savedScreen.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  const kindLabel = { screener: t.nav.screener, fundamental: t.nav.fundamental, technical: t.nav.technical } as Record<string, string>;

  if (screens.length === 0) return <p className="py-8 text-center text-ink-muted">{t.account.screens.empty}</p>;

  return (
    <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
      {screens.map((s) => (
        <li key={s.id} className="flex items-center gap-3 px-4 py-3">
          <Link href={`/${lang}/tools/${s.kind}${s.query ? `?${s.query}` : ""}`} className="min-w-0 flex-1 hover:text-forest">
            <span className="block font-medium">{s.name}</span>
            <span className="block text-sm text-ink-muted">
              {kindLabel[s.kind]} · {fmtDate(s.createdAt, lang)}
            </span>
          </Link>
          <form action={deleteScreenForm}>
            <input type="hidden" name="id" value={s.id} />
            <button type="submit" aria-label={`${t.common.delete} ${s.name}`} className="inline-flex size-10 cursor-pointer items-center justify-center rounded-md text-ink-muted hover:bg-danger/10 hover:text-danger">
              <Trash size={17} />
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}
