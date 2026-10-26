import type { Metadata } from "next";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { Container, PageHeader } from "@/components/ui";

export async function generateMetadata({ params }: PageProps<"/[lang]/team">): Promise<Metadata> {
  const t = await getDictionary(await resolveLocale(params));
  return { title: t.team.title, description: t.team.lead };
}

function initials(name: string) {
  const latin = name.replace(/[㐀-鿿]+/g, "").trim();
  const parts = latin.split(/\s+/);
  return (parts[0][0] + (parts.at(-1)?.[0] ?? "")).toUpperCase();
}

export default async function TeamPage({ params }: PageProps<"/[lang]/team">) {
  const lang = await resolveLocale(params);
  const t = await getDictionary(lang);
  return (
    <>
      <PageHeader title={t.team.title} lead={t.team.lead} />
      <Container className="py-16">
        <ul className="grid gap-x-10 gap-y-14 sm:grid-cols-2">
          {t.team.members.map((m) => (
            <li key={m.name} className="flex gap-5">
              {/* Replace with a portrait (public/team/*.jpg) once photos are available. */}
              <div
                aria-hidden="true"
                className="flex size-20 shrink-0 items-center justify-center rounded-full bg-forest-soft font-display text-2xl text-forest"
              >
                {initials(m.name)}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-ink">{m.name}</h2>
                <p className="text-lim">{m.role}</p>
                <p className="mt-3 text-ink-muted">{m.bio}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-14 text-sm text-ink-muted">{t.team.sampleNote}</p>
      </Container>
    </>
  );
}
