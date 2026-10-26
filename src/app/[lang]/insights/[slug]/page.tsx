import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { getPost, listPosts, readingMinutes } from "@/lib/posts";
import { fmtDate, interpolate } from "@/lib/format";
import { Container } from "@/components/ui";
import { PostCard } from "@/components/post-card";
import { ChevronRight } from "@/components/icons";

export async function generateMetadata({ params }: PageProps<"/[lang]/insights/[slug]">): Promise<Metadata> {
  const lang = await resolveLocale(params);
  const post = await getPost((await params).slug, lang);
  if (!post) return {};
  return { title: post.title, description: post.excerpt, openGraph: { type: "article", title: post.title, description: post.excerpt } };
}

/** Plain-text article body: blank lines separate paragraphs, "## " starts a subheading. */
function Body({ text }: { text: string }) {
  return (
    <div className="prose-lim text-lg leading-[1.75] text-ink">
      {text
        .split(/\n\s*\n/)
        .map((block) => block.trim())
        .filter(Boolean)
        .map((block, i) =>
          block.startsWith("## ") ? <h2 key={i}>{block.slice(3)}</h2> : <p key={i}>{block}</p>
        )}
    </div>
  );
}

export default async function PostPage({ params }: PageProps<"/[lang]/insights/[slug]">) {
  const lang = await resolveLocale(params);
  const post = await getPost((await params).slug, lang);
  if (!post) notFound();
  const t = await getDictionary(lang);
  const related = await listPosts(lang, { limit: 3, excludeId: post.id });
  const category = t.insights.categories[post.category as keyof typeof t.insights.categories] ?? post.category;

  return (
    <>
      <article>
        <Container className="py-12 sm:py-16">
          <div className="mx-auto max-w-3xl">
          <nav aria-label="Breadcrumb" className="text-sm text-ink-muted">
            <Link href={`/${lang}/insights`} className="hover:text-forest hover:underline">
              {t.insights.title}
            </Link>
            <ChevronRight size={14} className="mx-1 inline" />
            <Link href={`/${lang}/insights?cat=${post.category}`} className="hover:text-forest hover:underline">
              {category}
            </Link>
          </nav>
          <h1 className="mt-6 font-display text-h1 text-forest" lang={post.locale}>
            {post.title}
          </h1>
          <p className="mt-4 text-sm text-ink-muted">
            {post.author?.name && <span>{post.author.name} · </span>}
            <time dateTime={post.publishedAt.toISOString()}>{fmtDate(post.publishedAt, lang, { dateStyle: "long" })}</time>
            <span> · {interpolate(t.insights.minutes, { n: readingMinutes(post.body) })}</span>
          </p>
          <p className="mt-8 border-l-2 border-lim pl-5 text-xl leading-relaxed text-ink-muted" lang={post.locale}>
            {post.excerpt}
          </p>
          <div className="mt-8" lang={post.locale}>
            <Body text={post.body} />
          </div>
          <p className="mt-12 border-t border-line pt-6 text-sm text-ink-muted">{t.footer.disclaimer}</p>
          </div>
        </Container>
      </article>
      {related.length > 0 && (
        <section className="border-t border-line">
          <Container className="py-16">
            <h2 className="font-display text-h2 text-forest">{t.insights.related}</h2>
            <div className="mt-10 grid gap-10 md:grid-cols-3">
              {related.map((p) => (
                <PostCard key={p.id} post={p} lang={lang} t={t} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
