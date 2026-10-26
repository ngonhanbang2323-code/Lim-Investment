import type { Metadata } from "next";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { Container, PageHeader } from "@/components/ui";
import { Clock, Mail, MapPin, Phone } from "@/components/icons";
import { ContactForm } from "./contact-form";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const t = await getDictionary(await resolveLocale(params));
  return { title: t.nav.contact, description: t.contact.lead };
}

export default async function ContactPage({ params, searchParams }: PageProps<"/[lang]/contact">) {
  const lang = await resolveLocale(params);
  const t = await getDictionary(lang);
  const topic = (await searchParams).topic;
  const office = [
    { icon: MapPin, text: t.footer.address },
    { icon: Phone, text: t.contact.phoneValue, href: `tel:${t.contact.phoneValue.replace(/[^\d+]/g, "")}` },
    { icon: Mail, text: t.contact.emailValue, href: `mailto:${t.contact.emailValue}` },
    { icon: Clock, text: t.contact.hours },
  ];

  return (
    <>
      <PageHeader title={t.contact.title} lead={t.contact.lead} />
      <Container className="grid gap-16 py-16 lg:grid-cols-[1.4fr_1fr]">
        <ContactForm t={t.contact} optional={t.common.optional} lang={lang} initialTopic={typeof topic === "string" ? topic : undefined} />
        <aside>
          <h2 className="font-display text-2xl text-forest">{t.contact.officeTitle}</h2>
          <ul className="mt-6 space-y-4">
            {office.map(({ icon: Icon, text, href }) => (
              <li key={text} className="flex gap-3">
                <Icon size={20} className="mt-0.5 shrink-0 text-lim" />
                {href ? (
                  <a href={href} className="text-ink hover:text-forest hover:underline">
                    {text}
                  </a>
                ) : (
                  <span className="text-ink">{text}</span>
                )}
              </li>
            ))}
          </ul>
        </aside>
      </Container>
    </>
  );
}
