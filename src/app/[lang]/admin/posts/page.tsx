import Link from "next/link";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { fmtDate } from "@/lib/format";
import { ButtonLink } from "@/components/ui";

export default async function AdminPosts({ params }: PageProps<"/[lang]/admin/posts">) {
  const lang = await resolveLocale(params);
  await requireAdmin(lang);
  const t = await getDictionary(lang);
  const posts = await db.post.findMany({ orderBy: { publishedAt: "desc" }, include: { translations: { select: { locale: true, title: true } } } });
  const categories = t.insights.categories as Record<string, string>;

  return (
    <div className="space-y-5">
      <ButtonLink href={`/${lang}/admin/posts/new`}>{t.admin.posts.new}</ButtonLink>
      <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
        {posts.map((p) => {
          const title = p.translations.find((tr) => tr.locale === lang)?.title ?? p.translations.find((tr) => tr.locale === "vi")?.title ?? p.slug;
          return (
            <li key={p.id}>
              <Link href={`/${lang}/admin/posts/${p.id}`} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-forest-soft/50">
                <span className="min-w-0">
                  <span className="block font-medium">{title}</span>
                  <span className="block text-sm text-ink-muted">
                    {categories[p.category]} · {fmtDate(p.publishedAt, lang)} · {p.translations.map((tr) => tr.locale).join(", ")}
                  </span>
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${p.published ? "bg-forest-soft text-forest" : "bg-paper text-ink-muted ring-1 ring-line"}`}
                >
                  {p.published ? t.admin.posts.published : t.admin.posts.draft}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
