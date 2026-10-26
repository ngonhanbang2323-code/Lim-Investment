"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { Dictionary } from "@/dictionaries/vi";
import { login, register, type AuthState } from "@/app/actions/auth";
import { Field, buttonStyles, inputStyles } from "./ui";

type Props = { mode: "login" | "register"; lang: string; next?: string; t: Dictionary["auth"] };

export function AuthForm({ mode, lang, next, t }: Props) {
  const [state, action, pending] = useActionState<AuthState, FormData>(mode === "login" ? login : register, {});
  const err = state.error;
  const fieldError = (f: "name" | "email" | "password") => (err === f ? t.errors[f] : undefined);

  return (
    <form action={action} className="grid gap-5" noValidate>
      <input type="hidden" name="lang" value={lang} />
      {next && <input type="hidden" name="next" value={next} />}
      {(err === "invalid" || err === "exists") && (
        <p role="alert" className="rounded-md border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {t.errors[err]}
        </p>
      )}
      {mode === "register" && (
        <Field label={t.name} htmlFor="name" error={fieldError("name")}>
          <input id="name" name="name" autoComplete="name" required defaultValue={state.name} aria-invalid={err === "name" || undefined} className={inputStyles} />
        </Field>
      )}
      <Field label={t.email} htmlFor="email" error={fieldError("email")}>
        <input id="email" name="email" type="email" autoComplete="email" required defaultValue={state.email} aria-invalid={err === "email" || undefined} className={inputStyles} />
      </Field>
      <Field label={t.password} htmlFor="password" hint={mode === "register" ? t.passwordHint : undefined} error={fieldError("password")}>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={mode === "register" ? 8 : undefined}
          aria-invalid={err === "password" || undefined}
          className={inputStyles}
        />
      </Field>
      <button type="submit" disabled={pending} className={`${buttonStyles.primary} w-full`}>
        {mode === "login" ? t.submitLogin : t.submitRegister}
      </button>
      <p className="text-center text-sm text-ink-muted">
        {mode === "login" ? t.noAccount : t.haveAccount}{" "}
        <Link href={`/${lang}/${mode === "login" ? "register" : "login"}${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-medium text-link hover:underline">
          {mode === "login" ? t.registerTitle : t.loginTitle}
        </Link>
      </p>
    </form>
  );
}
