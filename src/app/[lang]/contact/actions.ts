"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { hasLocale } from "@/lib/i18n-config";

const topics = ["managed", "advisory", "research", "planning", "other"] as const;

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(30).optional(),
  topic: z.enum(topics),
  message: z.string().trim().min(10).max(4000),
  locale: z.string(),
});

export type ContactState = {
  ok: boolean;
  errors?: Partial<Record<"name" | "email" | "message" | "generic", true>>;
  values?: Record<string, string>;
};

export async function submitContact(_prev: ContactState, form: FormData): Promise<ContactState> {
  const raw = Object.fromEntries(form) as Record<string, string>;
  // Honeypot: real visitors never see or fill this field.
  if (raw.website) return { ok: true };

  const parsed = schema.safeParse({ ...raw, phone: raw.phone || undefined });
  if (!parsed.success) {
    const errors: ContactState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === "name" || key === "email" || key === "message") errors[key] = true;
      else errors.generic = true;
    }
    return { ok: false, errors, values: raw };
  }

  try {
    const { locale, ...data } = parsed.data;
    await db.contactMessage.create({ data: { ...data, locale: hasLocale(locale) ? locale : "vi" } });
    return { ok: true };
  } catch (err) {
    console.error("contact form", err);
    return { ok: false, errors: { generic: true }, values: raw };
  }
}
