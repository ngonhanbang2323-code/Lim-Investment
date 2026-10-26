"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { listStocks } from "@/lib/market";

export type HoldingState = { error?: "unknownSymbol" | "invalid"; ok?: boolean };

const schema = z.object({
  symbol: z.string().trim().toUpperCase(),
  quantity: z.coerce.number().int().positive(),
  avgPrice: z.coerce.number().positive(),
});

export async function upsertHolding(_prev: HoldingState, form: FormData): Promise<HoldingState> {
  const user = await currentUser();
  if (!user) return { error: "invalid" };
  const parsed = schema.safeParse({
    symbol: form.get("symbol"),
    quantity: String(form.get("quantity") ?? "").replace(/[.,\s]/g, ""),
    avgPrice: String(form.get("avgPrice") ?? "").replace(/[.,\s]/g, ""),
  });
  if (!parsed.success) return { error: "invalid" };
  const { symbol, quantity, avgPrice } = parsed.data;
  if (!listStocks().some((s) => s.symbol === symbol)) return { error: "unknownSymbol" };
  await db.personalHolding.upsert({
    where: { userId_symbol: { userId: user.id, symbol } },
    create: { userId: user.id, symbol, quantity, avgPrice },
    update: { quantity, avgPrice },
  });
  revalidatePath("/[lang]/account", "layout");
  return { ok: true };
}

export async function deleteHolding(form: FormData) {
  const user = await currentUser();
  if (!user) return;
  await db.personalHolding.deleteMany({ where: { userId: user.id, symbol: String(form.get("symbol")) } });
  revalidatePath("/[lang]/account", "layout");
}
