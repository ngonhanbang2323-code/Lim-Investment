"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { endSession, startSession } from "@/lib/auth";
import { hasLocale } from "@/lib/i18n-config";

// Compared against when the email is unknown, so response time doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync("lim-investment-dummy", 12);

export type AuthState = { error?: "invalid" | "exists" | "name" | "email" | "password"; email?: string; name?: string };

/** Only follow same-site relative paths after sign-in. */
function safeNext(next: unknown, lang: string, fallback: string) {
  return typeof next === "string" && next.startsWith(`/${lang}/`) && !next.startsWith("//") ? next : fallback;
}

function langOf(form: FormData) {
  const lang = String(form.get("lang") ?? "vi");
  return hasLocale(lang) ? lang : "vi";
}

export async function login(_prev: AuthState, form: FormData): Promise<AuthState> {
  const lang = langOf(form);
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const user = email ? await db.user.findUnique({ where: { email } }) : null;
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) return { error: "invalid", email };

  await startSession(user.id, user.role);
  redirect(safeNext(form.get("next"), lang, user.role === "ADMIN" ? `/${lang}/admin` : `/${lang}/account`));
}

const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(8).max(200),
});

export async function register(_prev: AuthState, form: FormData): Promise<AuthState> {
  const lang = langOf(form);
  const parsed = registerSchema.safeParse(Object.fromEntries(form));
  const echo = { email: String(form.get("email") ?? ""), name: String(form.get("name") ?? "") };
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    return { ...echo, error: field === "name" ? "name" : field === "email" ? "email" : "password" };
  }
  const { name, email, password } = parsed.data;
  if (await db.user.findUnique({ where: { email } })) return { ...echo, error: "exists" };

  const user = await db.user.create({
    data: { name, email, passwordHash: await bcrypt.hash(password, 12), locale: lang },
  });
  await startSession(user.id, user.role);
  redirect(safeNext(form.get("next"), lang, `/${lang}/account`));
}

export async function logout(form: FormData) {
  await endSession();
  redirect(`/${langOf(form)}`);
}
