import { getDictionary, resolveLocale } from "@/lib/i18n";
import { requireAdmin } from "@/lib/auth";
import { logout } from "@/app/actions/auth";
import { Container } from "@/components/ui";
import { SectionNav } from "@/components/account/account-nav";

export const metadata = { title: "Admin", robots: { index: false } };

export default async function AdminLayout({ children, params }: LayoutProps<"/[lang]/admin">) {
  const lang = await resolveLocale(params);
  const user = await requireAdmin(lang);
  const t = await getDictionary(lang);
  const base = `/${lang}/admin`;
  const tabs = t.admin.tabs;

  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="text-sm text-ink-muted">{user.email}</p>
          <h1 className="mt-1 font-display text-h1 text-forest">{t.admin.title}</h1>
        </div>
        <form action={logout}>
          <input type="hidden" name="lang" value={lang} />
          <button type="submit" className="min-h-11 cursor-pointer text-sm font-medium text-ink-muted hover:text-danger hover:underline">
            {t.nav.logout}
          </button>
        </form>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[200px_1fr]">
        <SectionNav
          label={t.admin.title}
          items={[
            { href: base, label: tabs.dashboard, exact: true },
            { href: `${base}/posts`, label: tabs.posts },
            { href: `${base}/clients`, label: tabs.clients },
            { href: `${base}/messages`, label: tabs.messages },
          ]}
        />
        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  );
}
