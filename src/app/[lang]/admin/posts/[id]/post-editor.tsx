"use client";

import { useActionState, useState } from "react";
import { localeNames, locales, type Locale } from "@/lib/i18n-config";
import type { Dictionary } from "@/dictionaries/vi";
import { savePost, type PostState } from "@/app/actions/admin";
import { Field, buttonStyles, inputStyles } from "@/components/ui";

type Translation = { locale: string; title: string; excerpt: string; body: string };
type Initial = { id?: string; slug: string; category: string; published: boolean; publishedAt: string; translations: Translation[] };

export function PostEditor({ lang, initial, t, categories, savedFlag }: { lang: Locale; initial: Initial; t: Dictionary; categories: Record<string, string>; savedFlag: boolean }) {
  const [state, action, pending] = useActionState<PostState, FormData>(savePost, savedFlag ? { saved: true } : {});
  const [tab, setTab] = useState<Locale>("vi");
  const p = t.admin.posts;
  const tr = (l: string) => initial.translations.find((x) => x.locale === l);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="lang" value={lang} />
      {initial.id && <input type="hidden" name="id" value={initial.id} />}

      {state.saved && (
        <p role="status" className="rounded-md bg-forest-soft px-4 py-3 text-sm text-forest">
          {p.saved}
        </p>
      )}
      {state.error && (
        <p role="alert" className="rounded-md border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {state.error === "slugTaken" ? p.slugTaken : p.invalid}
        </p>
      )}

      <div className="grid gap-5 rounded-lg border border-line bg-surface p-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label={p.slug} htmlFor="slug" hint={p.slugHint}>
            <input id="slug" name="slug" required defaultValue={initial.slug} pattern="[a-z0-9]+(-[a-z0-9]+)*" className={inputStyles} />
          </Field>
        </div>
        <Field label={p.category} htmlFor="category">
          <select id="category" name="category" defaultValue={initial.category} className={inputStyles}>
            {Object.entries(categories).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={p.publishedAt} htmlFor="publishedAt">
          <input id="publishedAt" name="publishedAt" type="date" required defaultValue={initial.publishedAt} className={inputStyles} />
        </Field>
        <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm font-medium">
          <input type="checkbox" name="published" defaultChecked={initial.published} className="size-4 accent-forest" />
          {p.published}
        </label>
      </div>

      <div>
        <p className="mb-3 text-sm text-ink-muted">{p.translationHint}</p>
        <div role="tablist" className="flex gap-1 border-b border-line">
          {locales.map((l) => (
            <button
              key={l}
              type="button"
              role="tab"
              id={`tab-${l}`}
              aria-selected={tab === l}
              aria-controls={`panel-${l}`}
              onClick={() => setTab(l)}
              className="-mb-px min-h-11 cursor-pointer border-b-2 border-transparent px-4 text-sm font-medium text-ink-muted aria-selected:border-forest aria-selected:text-forest"
            >
              {localeNames[l]}
              {l === "vi" && " *"}
            </button>
          ))}
        </div>
        {/* All panels stay mounted so every language is submitted with the form. */}
        {locales.map((l) => (
          <div key={l} id={`panel-${l}`} role="tabpanel" aria-labelledby={`tab-${l}`} hidden={tab !== l} className="space-y-5 pt-5" lang={l}>
            <Field label={p.title} htmlFor={`title_${l}`}>
              <input id={`title_${l}`} name={`title_${l}`} defaultValue={tr(l)?.title} className={inputStyles} />
            </Field>
            <Field label={p.excerpt} htmlFor={`excerpt_${l}`}>
              <textarea id={`excerpt_${l}`} name={`excerpt_${l}`} rows={2} defaultValue={tr(l)?.excerpt} className={inputStyles} />
            </Field>
            <Field label={p.body} htmlFor={`body_${l}`} hint={p.bodyHint}>
              <textarea id={`body_${l}`} name={`body_${l}`} rows={18} defaultValue={tr(l)?.body} className={`${inputStyles} font-mono text-sm leading-relaxed`} />
            </Field>
          </div>
        ))}
      </div>

      <button type="submit" disabled={pending} className={buttonStyles.primary}>
        {pending ? t.common.saving : t.common.save}
      </button>
    </form>
  );
}
