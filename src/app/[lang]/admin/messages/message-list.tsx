import type { ContactMessage } from "@prisma/client";
import type { Locale } from "@/lib/i18n-config";
import type { Dictionary } from "@/dictionaries/vi";
import { toggleMessageHandled } from "@/app/actions/admin";
import { fmtDate } from "@/lib/format";

export function MessageList({ messages, lang, t }: { messages: ContactMessage[]; lang: Locale; t: Dictionary }) {
  if (messages.length === 0) return <p className="text-ink-muted">{t.admin.messages.empty}</p>;
  const topics = t.contact.topics as Record<string, string>;
  return (
    <ul className="space-y-3">
      {messages.map((m) => (
        <li key={m.id} className={`rounded-lg border bg-surface p-5 ${m.handled ? "border-line opacity-70" : "border-lim/40"}`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{m.name}</p>
              <p className="text-sm text-ink-muted">
                <a href={`mailto:${m.email}`} className="text-link hover:underline">
                  {m.email}
                </a>
                {m.phone && (
                  <>
                    {" · "}
                    <a href={`tel:${m.phone}`} className="text-link hover:underline">
                      {m.phone}
                    </a>
                  </>
                )}
                {" · "}
                {topics[m.topic] ?? m.topic} · {m.locale} · {fmtDate(m.createdAt, lang, { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </div>
            <form action={toggleMessageHandled}>
              <input type="hidden" name="id" value={m.id} />
              <button
                type="submit"
                className={`min-h-10 cursor-pointer rounded-md border px-3 text-sm font-medium ${
                  m.handled ? "border-line-strong text-ink-muted" : "border-forest text-forest hover:bg-forest-soft"
                }`}
              >
                {m.handled ? t.admin.messages.handled : t.admin.messages.markHandled}
              </button>
            </form>
          </div>
          <p className="mt-3 whitespace-pre-line text-ink">{m.message}</p>
        </li>
      ))}
    </ul>
  );
}
