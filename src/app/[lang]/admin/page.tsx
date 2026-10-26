import Link from "next/link";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { MessageList } from "./messages/message-list";

export default async function AdminDashboard({ params }: PageProps<"/[lang]/admin">) {
  const lang = await resolveLocale(params);
  await requireAdmin(lang);
  const t = await getDictionary(lang);
  const [clients, managed, posts, open, recent] = await Promise.all([
    db.user.count({ where: { role: "CLIENT" } }),
    db.managedAccount.count(),
    db.post.count({ where: { published: true } }),
    db.contactMessage.count({ where: { handled: false } }),
    db.contactMessage.findMany({ where: { handled: false }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);
  const base = `/${lang}/admin`;
  const stats = [
    [t.admin.stats.clients, clients, `${base}/clients`],
    [t.admin.stats.managed, managed, `${base}/clients`],
    [t.admin.stats.posts, posts, `${base}/posts`],
    [t.admin.stats.newMessages, open, `${base}/messages`],
  ] as const;

  return (
    <div className="space-y-10">
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value, href]) => (
          <li key={label}>
            <Link href={href} className="block rounded-lg border border-line bg-surface p-5 hover:border-forest">
              <span className="text-sm text-ink-muted">{label}</span>
              <span className="tabular mt-1 block font-display text-4xl text-forest">{value}</span>
            </Link>
          </li>
        ))}
      </ul>
      <section>
        <h2 className="mb-4 font-display text-h2 text-forest">{t.admin.tabs.messages}</h2>
        <MessageList messages={recent} lang={lang} t={t} />
      </section>
    </div>
  );
}
