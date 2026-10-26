import "server-only";
import { db } from "./db";
import type { Locale } from "./i18n-config";

export const postCategories = ["market", "company", "macro", "education"] as const;
export type PostCategory = (typeof postCategories)[number];

type WithTranslations = {
  translations: { locale: string; title: string; excerpt: string; body: string }[];
};

/** Pick the requested language, falling back to Vietnamese. */
function pick<T extends WithTranslations>(post: T, lang: Locale) {
  const tr = post.translations.find((t) => t.locale === lang) ?? post.translations.find((t) => t.locale === "vi");
  // Spread the translation's text only; its own id must not replace the post id.
  return tr ? { ...post, title: tr.title, excerpt: tr.excerpt, body: tr.body, locale: tr.locale } : null;
}

export function readingMinutes(body: string) {
  // CJK text has no spaces; count characters for it, words otherwise.
  const cjk = (body.match(/[㐀-鿿]/g) ?? []).length;
  const words = body.replace(/[㐀-鿿]/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220 + cjk / 450));
}

export async function listPosts(lang: Locale, opts: { category?: string; limit?: number; excludeId?: string } = {}) {
  const posts = await db.post.findMany({
    where: {
      published: true,
      publishedAt: { lte: new Date() },
      ...(opts.category ? { category: opts.category } : {}),
      ...(opts.excludeId ? { id: { not: opts.excludeId } } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: opts.limit,
    include: { translations: true },
  });
  return posts.flatMap((p) => {
    const t = pick(p, lang);
    return t ? [t] : [];
  });
}

export async function getPost(slug: string, lang: Locale) {
  const post = await db.post.findFirst({
    where: { slug, published: true, publishedAt: { lte: new Date() } },
    include: { translations: true, author: { select: { name: true } } },
  });
  return post ? pick(post, lang) : null;
}
