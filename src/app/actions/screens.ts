"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

const schema = z.object({
  name: z.string().trim().min(1).max(80),
  kind: z.enum(["screener", "fundamental", "technical"]),
  query: z.string().max(1000),
});

export async function saveScreen(input: { name: string; kind: string; query: string }) {
  const user = await currentUser();
  const parsed = schema.safeParse(input);
  if (!user || !parsed.success) return { ok: false as const };
  await db.savedScreen.create({ data: { ...parsed.data, userId: user.id } });
  revalidatePath("/[lang]/account", "layout");
  return { ok: true as const };
}

export async function deleteScreen(id: string) {
  const user = await currentUser();
  if (!user) return { ok: false as const };
  await db.savedScreen.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/[lang]/account", "layout");
  return { ok: true as const };
}

export async function deleteScreenForm(form: FormData) {
  await deleteScreen(String(form.get("id") ?? ""));
}
