import { getDictionary, resolveLocale } from "@/lib/i18n";
import { requireUser } from "@/lib/auth";
import { interpolate } from "@/lib/format";
import { logout } from "@/app/actions/auth";
import { Container } from "@/components/ui";
import { SectionNav } from "@/components/account/account-nav";

export const metadata = { robots: { index: false } };

export default async function AccountLayout({ children, params }: LayoutProps<"/[lang]/account">) {
  const lang = await resolveLocale(params);
  const user = await requireUser(lang);
  const t = await getDictionary(lang);
  const base = `/${lang}/account`;
  const tabs = t.account.tabs;

  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="text-sm text-ink-muted">{t.account.title}</p>
          <h1 className="mt-1 font-display text-h1 text-forest">{interpolate(t.account.hello, { name: user.name })}</h1>
        </div>
        <form action={logout}>
          <input type="hidden" name="lang" value={lang} />
          <button type="submit" className="min-h-11 cursor-pointer text-sm font-medium text-ink-muted hover:text-danger hover:underline">
            {t.nav.logout}
          </button>
        </form>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        <SectionNav
          label={t.account.title}
          items={[
            { href: base, label: tabs.overview, exact: true },
            { href: `${base}/managed`, label: tabs.managed },
            { href: `${base}/portfolio`, label: tabs.portfolio },
            { href: `${base}/watchlist`, label: tabs.watchlist },
            { href: `${base}/screens`, label: tabs.screens },
          ]}
        />
        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  );
}
