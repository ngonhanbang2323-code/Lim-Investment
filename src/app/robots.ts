import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const site = process.env.SITE_URL ?? "http://localhost:3000";
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/vi/account", "/en/account", "/zh-TW/account", "/vi/admin", "/en/admin", "/zh-TW/admin"] },
    sitemap: `${site}/sitemap.xml`,
  };
}
