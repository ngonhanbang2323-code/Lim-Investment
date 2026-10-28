import "server-only";
// Market data entry point for pages and tools. Only the sample provider exists today;
// a live provider (e.g. SSI FastConnect Data) should implement these same functions
// and be selected here through MARKET_PROVIDER — no page needs to change.
import { getSnapshot } from "./mock";
import { computeTechnicals } from "./indicators";
import { universe } from "./universe";
import { computeSectorStrength } from "./sector-strength";
import type { ScreenerRow, StockMeta } from "./types";

export const isSampleData = (process.env.MARKET_PROVIDER ?? "mock") === "mock";

export function listStocks(): StockMeta[] {
  return universe.map(({ basePrice: _, ...meta }) => meta);
}

export function getStock(symbol: string) {
  const meta = listStocks().find((s) => s.symbol === symbol.toUpperCase());
  if (!meta) return null;
  const snap = getSnapshot();
  const bars = snap.bars.get(meta.symbol)!;
  return {
    meta,
    quote: snap.quotes.get(meta.symbol)!,
    fundamentals: snap.fundamentals.get(meta.symbol)!,
    technicals: computeTechnicals(bars),
    bars,
  };
}

export function getQuotes(symbols?: string[]) {
  const snap = getSnapshot();
  const list = symbols ?? listStocks().map((s) => s.symbol);
  return list.flatMap((s) => {
    const q = snap.quotes.get(s);
    return q ? [q] : [];
  });
}

export function getIndices() {
  return getSnapshot().indices;
}

export function getSessionDate() {
  return getSnapshot().date;
}

export function getScreenerRows(): ScreenerRow[] {
  const snap = getSnapshot();
  return listStocks().map((meta) => ({
    ...meta,
    ...snap.quotes.get(meta.symbol)!,
    ...snap.fundamentals.get(meta.symbol)!,
    ...computeTechnicals(snap.bars.get(meta.symbol)!),
  }));
}

let strengthCache: { date: string; value: ReturnType<typeof computeSectorStrength> } | null = null;

/** Daily sector strength scores for every horizon (recomputed once per session). */
export function getSectorStrength() {
  const snap = getSnapshot();
  if (strengthCache?.date !== snap.date) {
    strengthCache = { date: snap.date, value: computeSectorStrength(listStocks(), snap.bars) };
  }
  return strengthCache.value;
}
