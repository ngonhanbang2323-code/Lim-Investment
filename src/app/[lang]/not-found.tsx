import { lang as rootLang } from "next/root-params";
import { hasLocale, defaultLocale } from "@/lib/i18n-config";
import { getDictionary } from "@/lib/i18n";
import { ButtonLink, Container } from "@/components/ui";

export default async function NotFound() {
  const requested = (await rootLang()) ?? "";
  const lang = hasLocale(requested) ? requested : defaultLocale;
  const t = await getDictionary(lang);
  return (
    <Container className="py-28">
      <p className="tabular font-display text-6xl text-lim-light">404</p>
      <h1 className="mt-4 font-display text-h1 text-forest">{t.notFound.title}</h1>
      <p className="mt-3 text-ink-muted">{t.notFound.body}</p>
      <ButtonLink href={`/${lang}`} className="mt-8">
        {t.notFound.home}
      </ButtonLink>
    </Container>
  );
}
