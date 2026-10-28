import Link from "next/link";
import type { Locale } from "@/lib/i18n-config";
import type { Dictionary } from "@/dictionaries/vi";
import { Logo } from "./logo";

export function Footer({ lang, t }: { lang: Locale; t: Dictionary }) {
  const p = (path: string) => `/${lang}${path}`;
  const columns = [
    {
      title: t.footer.company,
      links: [
        [p("/about"), t.nav.aboutUs],
        [p("/services"), t.nav.services],
        [p("/team"), t.nav.team],
        [p("/contact"), t.nav.contact],
      ],
    },
    {
      title: t.footer.resources,
      links: [
        [p("/market"), t.nav.market],
        [p("/tools/screener"), t.nav.screener],
        [p("/tools/fundamental"), t.nav.fundamental],
        [p("/tools/technical"), t.nav.technical],
        [p("/tools/sector-strength"), t.nav.strength],
        [p("/insights"), t.nav.insights],
      ],
    },
  ];

  return (
    <footer className="on-dark mt-24 bg-forest-deep text-white/85">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div className="max-w-sm">
          <Logo className="text-white" />
          <p className="mt-5 font-display text-xl leading-snug text-white">{t.footer.tagline}</p>
          <address className="mt-6 space-y-1 text-sm not-italic text-white/70">
            <p>{t.footer.address}</p>
            <p>{t.contact.phoneValue}</p>
            <p>{t.contact.emailValue}</p>
          </address>
        </div>
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="text-sm font-semibold text-lim-light">{col.title}</h2>
            <ul className="mt-4 space-y-1">
              {col.links.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="inline-flex min-h-10 items-center hover:text-white hover:underline">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl space-y-3 px-4 py-8 text-sm text-white/65 sm:px-6 lg:px-8">
          <p>
            <strong className="font-semibold text-white/85">{t.footer.disclaimerTitle}. </strong>
            {t.footer.disclaimer}
          </p>
          <p>{t.footer.license}</p>
          <p>
            © {new Date().getFullYear()} Lim Investment. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
