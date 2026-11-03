// Real market data captured from Yuanta Việt Nam (via the YSVN MCP) into data/market-snapshot.json.
// The snapshot holds one session: quotes, technical indicators and index levels. Price history,
// fundamentals and the sector strength map are still generated, and are labelled as illustrative.
// To refresh: ask Claude to "cập nhật snapshot từ YSVN", then commit and redeploy.
import raw from "../../../data/market-snapshot.json";
import type { Bar, IndexSnapshot, Quote, Technicals } from "./types";

type QuoteRow = [number, number, number, number | null, number | null, number | null, number, number];
type TechRow = [number, number, number, number, number, number, number];
type IndexRow = [number, number, number, number, number, number, number];

const data = raw as unknown as {
  source: string;
  asOf: string;
  session: string;
  intraday: boolean;
  quotes: Record<string, QuoteRow>;
  technicals: Record<string, TechRow>;
  indices: Record<string, IndexRow>;
};

export const snapshotInfo = { source: data.source, asOf: data.asOf, session: data.session, intraday: data.intraday };

export function hasSnapshot() {
  return Object.keys(data.quotes).length > 0;
}

/**
 * Scale an illustrative series so its second-to-last close equals the real reference price,
 * then replace the last bar with the real session. Keeps charts continuous with real quotes.
 */
export function applyQuote(symbol: string, bars: Bar[]): Quote | null {
  const row = data.quotes[symbol];
  if (!row) return null;
  const [reference, ceiling, floor, last, high, low, volume, value] = row;
  const n = bars.length;
  const factor = reference / bars[n - 2].close;
  for (let i = 0; i < n - 1; i++) {
    const b = bars[i];
    bars[i] = { ...b, open: b.open * factor, high: b.high * factor, low: b.low * factor, close: b.close * factor };
  }
  bars[n - 2] = { ...bars[n - 2], close: reference };
  const price = last ?? reference;
  bars[n - 1] = {
    time: data.session,
    // The snapshot has no opening price; the reference stands in for it on the chart.
    open: reference,
    high: high ?? price,
    low: low ?? price,
    close: price,
    volume,
  };
  return {
    symbol,
    reference,
    ceiling,
    floor,
    price,
    open: reference,
    high: high ?? price,
    low: low ?? price,
    change: price - reference,
    changePct: ((price - reference) / reference) * 100,
    volume,
    value,
  };
}

/** Overlay real indicators on ones computed from the illustrative history. */
export function applyTechnicals(symbol: string, price: number, volume: number, t: Technicals): Technicals {
  const row = data.technicals[symbol];
  if (!row) return t;
  const [ma20, ma50, ma200, rsi14, macd, macdSignal, avgVolume20] = row;
  return {
    ...t,
    ma20,
    ma50,
    ma200,
    rsi14,
    macd,
    macdSignal,
    volumeRatio: avgVolume20 > 0 ? volume / avgVolume20 : t.volumeRatio,
    vsMa200: (price / ma200 - 1) * 100,
  };
}

/** Real level, change and breadth; the history is rescaled to end at the real values. */
export function applyIndex(idx: IndexSnapshot): IndexSnapshot {
  const row = data.indices[idx.code];
  if (!row) return idx;
  const [prior, current, volume, , advancers, decliners, unchanged] = row;
  const n = idx.history.length;
  const factor = prior / idx.history[n - 2].value;
  const history = idx.history.map((h, i) => ({
    time: i === n - 1 ? data.session : h.time,
    value: i === n - 1 ? current : i === n - 2 ? prior : Math.round(h.value * factor * 100) / 100,
  }));
  return {
    ...idx,
    value: current,
    change: current - prior,
    changePct: ((current - prior) / prior) * 100,
    volume,
    advancers,
    decliners,
    unchanged,
    history,
  };
}
