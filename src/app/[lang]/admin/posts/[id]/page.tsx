import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { deletePost } from "@/app/actions/admin";
import { buttonStyles } from "@/components/ui";
import { ConfirmButton } from "@/components/confirm-button";
import { PostEditor } from "./post-editor";

export default async function EditPost({ params, searchParams }: PageProps<"/[lang]/admin/posts/[id]">) {
  const lang = await resolveLocale(params);
  await requireAdmin(lang);
  const { id } = await params;
  const t = await getDictionary(lang);
  const { all: _all, ...categories } = t.insights.categories;

  const post = id === "new" ? null : await db.post.findUnique({ where: { id }, include: { translations: true } });
  if (id !== "new" && !post) notFound();

  const initial = post
    ? { ...post, publishedAt: post.publishedAt.toISOString().slice(0, 10) }
    : { slug: "", category: "market", published: false, publishedAt: new Date().toISOString().slice(0, 10), translations: [] };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={`/${lang}/admin/posts`} className="text-sm text-link hover:underline">
          ← {t.admin.tabs.posts}
        </Link>
        {post && (
          <div className="flex gap-2">
            {post.published && (
              <Link href={`/${lang}/insights/${post.slug}`} className={buttonStyles.secondary} target="_blank">
                {t.common.readMore}
              </Link>
            )}
            <form action={deletePost}>
              <input type="hidden" name="id" value={post.id} />
              <input type="hidden" name="lang" value={lang} />
              <ConfirmButton message={t.admin.posts.deleteConfirm} className={buttonStyles.danger}>
                {t.common.delete}
              </ConfirmButton>
            </form>
          </div>
        )}
      </div>
      <PostEditor lang={lang} initial={initial} t={t} categories={categories} savedFlag={(await searchParams).saved === "1"} />
    </div>
  );
}
