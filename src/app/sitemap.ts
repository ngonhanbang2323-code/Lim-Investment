import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { locales } from "@/lib/i18n-config";
import { listStocks } from "@/lib/market";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.SITE_URL ?? "http://localhost:3000";
  const pages = ["", "/about", "/services", "/team", "/contact", "/market", "/insights", "/tools/screener", "/tools/fundamental", "/tools/technical"];
  const posts = await db.post.findMany({ where: { published: true, publishedAt: { lte: new Date() } }, select: { slug: true, updatedAt: true } });
  const paths = [
    ...pages.map((p) => ({ path: p, lastModified: undefined as Date | undefined })),
    ...posts.map((p) => ({ path: `/insights/${p.slug}`, lastModified: p.updatedAt })),
    ...listStocks().map((s) => ({ path: `/market/${s.symbol}`, lastModified: undefined })),
  ];
  return paths.map(({ path, lastModified }) => ({
    url: `${site}/vi${path}`,
    lastModified,
    alternates: { languages: Object.fromEntries(locales.map((l) => [l, `${site}/${l}${path}`])) },
  }));
}
