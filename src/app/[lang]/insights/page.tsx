import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { listPosts, postCategories } from "@/lib/posts";
import { Container, PageHeader } from "@/components/ui";
import { PostCard } from "@/components/post-card";

export async function generateMetadata({ params }: PageProps<"/[lang]/insights">): Promise<Metadata> {
  const t = await getDictionary(await resolveLocale(params));
  return { title: t.insights.title, description: t.insights.lead };
}

export default async function InsightsPage({ params, searchParams }: PageProps<"/[lang]/insights">) {
  const lang = await resolveLocale(params);
  const t = await getDictionary(lang);
  const cat = (await searchParams).cat;
  const category = typeof cat === "string" && (postCategories as readonly string[]).includes(cat) ? cat : undefined;
  const posts = await listPosts(lang, { category });
  const tabs = [["", t.insights.categories.all], ...postCategories.map((c) => [c, t.insights.categories[c]])];

  return (
    <>
      <PageHeader title={t.insights.title} lead={t.insights.lead} />
      <Container className="py-12">
        <nav aria-label={t.insights.title} className="flex flex-wrap gap-2">
          {tabs.map(([key, label]) => (
            <Link
              key={key}
              href={key ? `/${lang}/insights?cat=${key}` : `/${lang}/insights`}
              aria-current={(category ?? "") === key ? "page" : undefined}
              className="inline-flex min-h-10 items-center rounded-full border border-line-strong bg-surface px-4 text-sm hover:border-forest aria-[current=page]:border-forest aria-[current=page]:bg-forest aria-[current=page]:text-on-forest"
            >
              {label}
            </Link>
          ))}
        </nav>
        {posts.length === 0 ? (
          <p className="mt-16 text-ink-muted">{t.insights.empty}</p>
        ) : (
          <div className="mt-12 grid gap-x-10 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} lang={lang} t={t} />
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
