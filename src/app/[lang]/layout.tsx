import type { Metadata } from "next";
import { Be_Vietnam_Pro, Newsreader, Noto_Sans_TC, Noto_Serif_TC } from "next/font/google";
import "../globals.css";
import { locales } from "@/lib/i18n-config";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { currentUser } from "@/lib/auth";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const body = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});
const serif = Newsreader({
  subsets: ["latin", "vietnamese"],
  variable: "--font-serif",
  display: "swap",
});
// CJK faces are split by unicode-range, so they only download when Chinese text is on screen.
const cjkSans = Noto_Sans_TC({ weight: ["400", "500", "700"], variable: "--font-cjk-sans", preload: false, display: "swap" });
const cjkSerif = Noto_Serif_TC({ weight: ["500", "600"], variable: "--font-cjk-serif", preload: false, display: "swap" });

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const lang = await resolveLocale(params);
  const t = await getDictionary(lang);
  return {
    metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
    title: { default: t.meta.title, template: "%s · Lim Investment" },
    description: t.meta.description,
    alternates: {
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])),
    },
    openGraph: { siteName: "Lim Investment", locale: lang, type: "website" },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const lang = await resolveLocale(params);
  const [t, user] = await Promise.all([getDictionary(lang), currentUser()]);

  return (
    <html lang={lang} className={`${body.variable} ${serif.variable} ${cjkSans.variable} ${cjkSerif.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-surface focus:px-4 focus:py-2"
        >
          {t.nav.skip}
        </a>
        <Header lang={lang} t={t.nav} cta={t.common.bookConsultation} user={user ? { name: user.name, role: user.role } : null} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer lang={lang} t={t} />
      </body>
    </html>
  );
}
