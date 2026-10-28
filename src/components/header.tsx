"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { localeNames, locales, type Locale } from "@/lib/i18n-config";
import type { Dictionary } from "@/dictionaries/vi";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { ChevronDown, CloseIcon, Globe, MenuIcon, UserIcon } from "./icons";

type NavT = Dictionary["nav"];
type Props = { lang: Locale; t: NavT; cta: string; user: { name: string; role: string } | null };

type Group = { id: string; label: string; items: { href: string; label: string; hint?: string }[] };
type NavEntry = { href: string; label: string } | Group;

function useNav(lang: Locale, t: NavT): NavEntry[] {
  const p = (path: string) => `/${lang}${path}`;
  return [
    {
      id: "about",
      label: t.about,
      items: [
        { href: p("/about"), label: t.aboutUs },
        { href: p("/services"), label: t.services },
        { href: p("/team"), label: t.team },
      ],
    },
    { href: p("/market"), label: t.market },
    {
      id: "tools",
      label: t.tools,
      items: [
        { href: p("/tools/screener"), label: t.screener, hint: t.screenerHint },
        { href: p("/tools/fundamental"), label: t.fundamental, hint: t.fundamentalHint },
        { href: p("/tools/technical"), label: t.technical, hint: t.technicalHint },
      ],
    },
    { href: p("/insights"), label: t.insights },
    { href: p("/contact"), label: t.contact },
  ];
}

const isGroup = (e: NavEntry): e is Group => "items" in e;

export function Header({ lang, t, cta, user }: Props) {
  const pathname = usePathname();
  const nav = useNav(lang, t);
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  // Close menus on navigation (adjusting state during render), outside click and Escape.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(null);
    setMobile(false);
  }
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        setMobile(false);
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);
  useEffect(() => {
    document.body.style.overflow = mobile ? "hidden" : "";
  }, [mobile]);

  const switchHref = (l: Locale) => pathname.replace(/^\/[^/]+/, `/${l}`);

  const accountHref = user?.role === "ADMIN" ? `/${lang}/admin` : `/${lang}/account`;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper">
      <div ref={barRef} className="mx-auto flex h-[72px] max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link href={`/${lang}`} className="text-forest" aria-label="Lim Investment">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden flex-1 justify-center xl:flex">
          <ul className="flex items-center gap-1">
            {nav.map((entry) =>
              isGroup(entry) ? (
                <li key={entry.id} className="relative">
                  <button
                    type="button"
                    aria-expanded={open === entry.id}
                    aria-controls={`menu-${entry.id}`}
                    onClick={() => setOpen(open === entry.id ? null : entry.id)}
                    className={`flex min-h-11 cursor-pointer items-center gap-1 whitespace-nowrap rounded-md px-3 text-[0.95rem] font-medium transition-colors hover:bg-forest-soft ${
                      entry.items.some((i) => isActive(i.href)) ? "text-forest" : "text-ink"
                    }`}
                  >
                    {entry.label}
                    <ChevronDown size={16} className={`transition-transform duration-200 ${open === entry.id ? "rotate-180" : ""}`} />
                  </button>
                  {open === entry.id && (
                    <ul
                      id={`menu-${entry.id}`}
                      className="absolute left-1/2 top-full mt-2 w-80 -translate-x-1/2 rounded-lg border border-line bg-surface p-2 shadow-[0_12px_32px_-12px_rgba(13,38,31,0.28)]"
                    >
                      {entry.items.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            aria-current={isActive(item.href) ? "page" : undefined}
                            className="block rounded-md px-3 py-2.5 hover:bg-forest-soft aria-[current=page]:bg-forest-soft"
                          >
                            <span className="block font-medium text-ink">{item.label}</span>
                            {item.hint && <span className="block text-sm text-ink-muted">{item.hint}</span>}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ) : (
                <li key={entry.href}>
                  <Link
                    href={entry.href}
                    aria-current={isActive(entry.href) ? "page" : undefined}
                    className="flex min-h-11 items-center whitespace-nowrap rounded-md px-3 text-[0.95rem] font-medium text-ink transition-colors hover:bg-forest-soft aria-[current=page]:text-forest aria-[current=page]:underline aria-[current=page]:decoration-lim-light aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-[10px]"
                  >
                    {entry.label}
                  </Link>
                </li>
              )
            )}
          </ul>
        </nav>

        <div className="ml-auto hidden items-center gap-2 xl:flex">
          <ThemeToggle label={t.theme} />
          <div className="relative">
            <button
              type="button"
              aria-expanded={open === "lang"}
              aria-label={t.language}
              onClick={() => setOpen(open === "lang" ? null : "lang")}
              className="flex min-h-11 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-ink-muted hover:bg-forest-soft hover:text-ink"
            >
              <Globe size={18} />
              {lang === "zh-TW" ? "繁中" : lang.toUpperCase()}
            </button>
            {open === "lang" && (
              <ul className="absolute right-0 top-full mt-2 w-44 rounded-lg border border-line bg-surface p-1.5 shadow-[0_12px_32px_-12px_rgba(13,38,31,0.28)]">
                {locales.map((l) => (
                  <li key={l}>
                    <Link
                      href={switchHref(l)}
                      lang={l}
                      aria-current={l === lang ? "true" : undefined}
                      className="block rounded-md px-3 py-2 text-sm hover:bg-forest-soft aria-[current=true]:font-semibold aria-[current=true]:text-forest"
                    >
                      {localeNames[l]}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Link
            href={user ? accountHref : `/${lang}/login`}
            className="flex min-h-11 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-ink hover:bg-forest-soft"
          >
            <UserIcon size={18} />
            {user ? (user.role === "ADMIN" ? t.admin : t.account) : t.login}
          </Link>
          <Link
            href={`/${lang}/contact`}
            className="ml-1 inline-flex min-h-11 items-center whitespace-nowrap rounded-md bg-forest px-4 text-sm font-semibold text-on-forest transition-colors hover:bg-forest-hover"
          >
            {cta}
          </Link>
        </div>

        <ThemeToggle label={t.theme} className="ml-auto xl:hidden" />
        <button
          type="button"
          className="flex size-11 cursor-pointer items-center justify-center rounded-md text-ink hover:bg-forest-soft xl:hidden"
          aria-label={mobile ? t.closeMenu : t.menu}
          aria-expanded={mobile}
          aria-controls="mobile-nav"
          onClick={() => setMobile((m) => !m)}
        >
          {mobile ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>

      {mobile && (
        <div id="mobile-nav" className="fixed inset-x-0 top-[72px] bottom-0 overflow-y-auto border-t border-line bg-paper px-4 pb-10 pt-4 xl:hidden">
          <nav aria-label="Main">
            <ul className="divide-y divide-line">
              {nav.map((entry) =>
                isGroup(entry) ? (
                  <li key={entry.id} className="py-3">
                    <p className="px-1 pb-1 text-sm font-semibold text-ink-muted">{entry.label}</p>
                    <ul>
                      {entry.items.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            aria-current={isActive(item.href) ? "page" : undefined}
                            className="flex min-h-12 items-center px-1 text-lg aria-[current=page]:font-semibold aria-[current=page]:text-forest"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                ) : (
                  <li key={entry.href}>
                    <Link
                      href={entry.href}
                      aria-current={isActive(entry.href) ? "page" : undefined}
                      className="flex min-h-14 items-center px-1 text-lg aria-[current=page]:font-semibold aria-[current=page]:text-forest"
                    >
                      {entry.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </nav>
          <div className="mt-6 grid gap-3">
            <Link href={`/${lang}/contact`} className="flex min-h-12 items-center justify-center rounded-md bg-forest font-semibold text-on-forest">
              {cta}
            </Link>
            <Link href={user ? accountHref : `/${lang}/login`} className="flex min-h-12 items-center justify-center gap-2 rounded-md border border-line-strong font-medium">
              <UserIcon size={18} />
              {user ? (user.role === "ADMIN" ? t.admin : t.account) : t.login}
            </Link>
          </div>
          <div className="mt-8">
            <p className="mb-2 text-sm font-semibold text-ink-muted">{t.language}</p>
            <div className="flex gap-2">
              {locales.map((l) => (
                <Link
                  key={l}
                  href={switchHref(l)}
                  lang={l}
                  aria-current={l === lang ? "true" : undefined}
                  className="flex min-h-11 flex-1 items-center justify-center rounded-md border border-line text-sm aria-[current=true]:border-forest aria-[current=true]:bg-forest-soft aria-[current=true]:font-semibold"
                >
                  {localeNames[l]}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
