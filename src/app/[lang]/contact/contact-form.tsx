"use client";

import { useActionState } from "react";
import type { Dictionary } from "@/dictionaries/vi";
import { Field, buttonStyles, inputStyles } from "@/components/ui";
import { submitContact, type ContactState } from "./actions";

type Props = { t: Dictionary["contact"]; optional: string; lang: string; initialTopic?: string };

export function ContactForm({ t, optional, lang, initialTopic }: Props) {
  const [state, action, pending] = useActionState<ContactState, FormData>(submitContact, { ok: false });

  if (state.ok) {
    return (
      <div role="status" className="rounded-lg border border-forest/30 bg-forest-soft p-6 text-forest">
        <p className="text-lg font-semibold">{t.success}</p>
      </div>
    );
  }

  const v = state.values ?? {};
  const e = state.errors ?? {};
  const invalid = (k: keyof typeof e) => (e[k] ? { "aria-invalid": true, "aria-describedby": `${k}-error` } : {});

  return (
    <form action={action} noValidate className="grid gap-5">
      <input type="hidden" name="locale" value={lang} />
      {/* Honeypot, hidden from people and assistive tech. */}
      <div aria-hidden="true" className="hidden">
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.name} htmlFor="name" error={e.name ? t.errors.name : undefined}>
          <input id="name" name="name" autoComplete="name" required defaultValue={v.name} className={inputStyles} {...invalid("name")} />
        </Field>
        <Field label={t.phone} htmlFor="phone" optionalLabel={optional}>
          <input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" defaultValue={v.phone} className={inputStyles} />
        </Field>
      </div>
      <Field label={t.email} htmlFor="email" error={e.email ? t.errors.email : undefined}>
        <input id="email" name="email" type="email" autoComplete="email" required defaultValue={v.email} className={inputStyles} {...invalid("email")} />
      </Field>
      <Field label={t.topic} htmlFor="topic">
        <select id="topic" name="topic" defaultValue={v.topic ?? initialTopic ?? "managed"} className={inputStyles}>
          {Object.entries(t.topics).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t.message} htmlFor="message" hint={t.messageHint} error={e.message ? t.errors.message : undefined}>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          defaultValue={v.message}
          aria-describedby={e.message ? "message-error" : "message-hint"}
          aria-invalid={e.message ? true : undefined}
          className={inputStyles}
        />
      </Field>
      {e.generic && (
        <p role="alert" className="text-sm text-danger">
          {t.errors.generic}
        </p>
      )}
      <div>
        <button type="submit" disabled={pending} className={buttonStyles.primary}>
          {pending ? t.sending : t.submit}
        </button>
      </div>
    </form>
  );
}
