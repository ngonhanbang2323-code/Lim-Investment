"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { listStocks } from "@/lib/market";

function normalise(symbol: string) {
  const s = symbol.trim().toUpperCase();
  return listStocks().some((x) => x.symbol === s) ? s : null;
}

export async function addToWatchlist(symbol: string) {
  const user = await currentUser();
  const s = normalise(symbol);
  if (!user || !s) return { ok: false as const };
  await db.watchlistItem.upsert({
    where: { userId_symbol: { userId: user.id, symbol: s } },
    create: { userId: user.id, symbol: s },
    update: {},
  });
  revalidatePath("/[lang]/account", "layout");
  return { ok: true as const };
}

export async function removeFromWatchlist(symbol: string) {
  const user = await currentUser();
  if (!user) return { ok: false as const };
  await db.watchlistItem.deleteMany({ where: { userId: user.id, symbol: symbol.toUpperCase() } });
  revalidatePath("/[lang]/account", "layout");
  return { ok: true as const };
}

// Form-friendly variants for the account pages.
export async function addToWatchlistForm(form: FormData) {
  await addToWatchlist(String(form.get("symbol") ?? ""));
}

export async function removeFromWatchlistForm(form: FormData) {
  await removeFromWatchlist(String(form.get("symbol") ?? ""));
}
