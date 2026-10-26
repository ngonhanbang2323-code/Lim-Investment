import Link from "next/link";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { fmtDate } from "@/lib/format";

export default async function AdminClients({ params }: PageProps<"/[lang]/admin/clients">) {
  const lang = await resolveLocale(params);
  await requireAdmin(lang);
  const t = await getDictionary(lang);
  const c = t.admin.clients;
  const users = await db.user.findMany({
    where: { role: "CLIENT" },
    orderBy: { createdAt: "desc" },
    include: { managed: { select: { id: true } } },
  });

  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-surface">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="border-b border-line bg-paper text-ink-muted">
          <tr>
            <th scope="col" className="px-3 py-2.5 text-left font-medium">{c.name}</th>
            <th scope="col" className="px-3 py-2.5 text-left font-medium">{c.email}</th>
            <th scope="col" className="px-3 py-2.5 text-left font-medium">{c.joined}</th>
            <th scope="col" className="px-3 py-2.5 text-left font-medium">{c.managed}</th>
            <th scope="col" className="px-3 py-2.5"><span className="sr-only">{c.manage}</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {users.map((u) => (
            <tr key={u.id}>
              <th scope="row" className="px-3 py-2.5 text-left font-medium">{u.name}</th>
              <td className="px-3 py-2.5">{u.email}</td>
              <td className="px-3 py-2.5">{fmtDate(u.createdAt, lang)}</td>
              <td className="px-3 py-2.5">{u.managed ? "✓" : "—"}</td>
              <td className="px-3 py-2.5 text-right">
                <Link href={`/${lang}/admin/clients/${u.id}`} className="inline-flex min-h-10 items-center font-medium text-link hover:underline">
                  {c.manage}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
