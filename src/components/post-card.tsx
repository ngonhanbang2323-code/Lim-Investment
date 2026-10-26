import Link from "next/link";
import type { Locale } from "@/lib/i18n-config";
import type { Dictionary } from "@/dictionaries/vi";
import { fmtDate, interpolate } from "@/lib/format";
import { readingMinutes } from "@/lib/posts";

type PostSummary = {
  slug: string;
  category: string;
  publishedAt: Date;
  title: string;
  excerpt: string;
  body: string;
};

export function PostCard({ post, lang, t }: { post: PostSummary; lang: Locale; t: Dictionary }) {
  const category = t.insights.categories[post.category as keyof typeof t.insights.categories] ?? post.category;
  return (
    <article className="group relative flex flex-col">
      <p className="text-sm text-ink-muted">
        <span className="font-medium text-lim">{category}</span>
        <span aria-hidden="true"> · </span>
        <time dateTime={post.publishedAt.toISOString()}>{fmtDate(post.publishedAt, lang)}</time>
      </p>
      <h3 className="mt-2 font-display text-2xl leading-snug text-ink group-hover:text-forest">
        <Link href={`/${lang}/insights/${post.slug}`} className="after:absolute after:inset-0">
          {post.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-3 text-ink-muted">{post.excerpt}</p>
      <p className="mt-3 text-sm text-ink-muted">{interpolate(t.insights.minutes, { n: readingMinutes(post.body) })}</p>
    </article>
  );
}
