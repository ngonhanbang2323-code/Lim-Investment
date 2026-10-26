// Sample market data. Deterministic: each (symbol, date) pair always produces the same bar,
// so history stays stable while a new session is appended every trading day.
import type { Bar, Exchange, Fundamentals, IndexSnapshot, Quote, Sector } from "./types";
import { universe } from "./universe";

const HISTORY_SESSIONS = 300;
const ANCHOR_DATE = "2026-01-02"; // date on which each stock trades at its basePrice

const BAND: Record<Exchange, number> = { HOSE: 0.07, HNX: 0.1, UPCOM: 0.15 };

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // Avalanche so near-identical seeds ("VCB|2026-10-26" vs "…27") give unrelated values.
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

function uniform(seed: string) {
  return (hash(seed) + 0.5) / 4294967296;
}

function normal(seed: string) {
  const u = uniform(seed + "#u");
  const v = uniform(seed + "#v");
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function between(seed: string, min: number, max: number) {
  return min + uniform(seed) * (max - min);
}

export function tickSize(price: number, exchange: Exchange) {
  if (exchange !== "HOSE") return 100;
  if (price < 10000) return 10;
  if (price < 50000) return 50;
  return 100;
}

const roundTick = (p: number, ex: Exchange) => Math.round(p / tickSize(p, ex)) * tickSize(p, ex);

export function priceLimits(reference: number, exchange: Exchange) {
  const band = BAND[exchange];
  const up = reference * (1 + band);
  const down = reference * (1 - band);
  return {
    ceiling: Math.floor(up / tickSize(up, exchange)) * tickSize(up, exchange),
    floor: Math.ceil(down / tickSize(down, exchange)) * tickSize(down, exchange),
  };
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

/** Most recent weekday in Vietnam time. */
function lastSessionDate(now = new Date()) {
  const vn = new Date(now.getTime() + 7 * 3600_000);
  const d = new Date(Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth(), vn.getUTCDate()));
  while (d.getUTCDay() === 0 || d.getUTCDay() === 6) d.setUTCDate(d.getUTCDate() - 1);
  return d;
}

function sessionDates(end: Date, count: number) {
  const dates: string[] = [];
  const d = new Date(end);
  while (dates.length < count) {
    if (d.getUTCDay() !== 0 && d.getUTCDay() !== 6) dates.unshift(isoDate(d));
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return dates;
}

const SECTOR_BETA: Record<Sector, number> = {
  banking: 1.1, securities: 1.5, insurance: 0.8, realEstate: 1.3, materials: 1.2, consumer: 0.6,
  retail: 1.0, technology: 0.9, energy: 0.8, utilities: 0.5, industrials: 1.1, transport: 0.9,
};

function marketReturn(date: string) {
  return 0.0004 + 0.009 * normal(`MKT|${date}`);
}

function buildSeries(symbol: string, dates: string[]) {
  const meta = universe.find((s) => s.symbol === symbol)!;
  const band = BAND[meta.exchange] - 0.003;
  const vol = between(`${symbol}|vol`, 0.011, 0.02);
  const beta = SECTOR_BETA[meta.sector];
  const baseVolume = between(`${symbol}|bv`, 0.6e6, 9e6);

  const returns = dates.map((date) => {
    const r = beta * marketReturn(date) + vol * normal(`${symbol}|${date}`);
    return Math.max(-band, Math.min(band, r));
  });

  // Log price, normalised so the stock sits at basePrice on the anchor date.
  const logs: number[] = [];
  returns.forEach((r, i) => logs.push((i ? logs[i - 1] : 0) + Math.log(1 + r)));
  const anchorIdx = dates.findIndex((d) => d >= ANCHOR_DATE);
  const offset = Math.log(meta.basePrice) - logs[anchorIdx >= 0 ? anchorIdx : 0];

  const bars: Bar[] = [];
  dates.forEach((time, i) => {
    const prev = i ? bars[i - 1].close : Math.exp(logs[0] + offset) / (1 + returns[0]);
    const prevRef = i ? prev : roundTick(prev, meta.exchange);
    const { ceiling, floor } = priceLimits(prevRef, meta.exchange);
    const clamp = (p: number) => Math.min(ceiling, Math.max(floor, roundTick(p, meta.exchange)));

    const close = clamp(Math.exp(logs[i] + offset));
    const open = clamp(prevRef * (1 + 0.004 * normal(`${symbol}|${time}|o`)));
    const wick = Math.abs(normal(`${symbol}|${time}|w`)) * vol * 0.6;
    const high = clamp(Math.max(open, close) * (1 + wick));
    const low = clamp(Math.min(open, close) * (1 - wick));
    const volume =
      Math.round(
        (baseVolume * Math.exp(0.35 * normal(`${symbol}|${time}|v`)) * (1 + (2 * Math.abs(returns[i])) / vol)) / 100
      ) * 100;
    bars.push({ time, open, high, low, close, volume });
  });
  return bars;
}

type Snapshot = {
  date: string;
  bars: Map<string, Bar[]>;
  quotes: Map<string, Quote>;
  fundamentals: Map<string, Fundamentals>;
  indices: IndexSnapshot[];
};

let snapshot: Snapshot | null = null;

const FUND_PROFILE: Record<Sector, { pe: [number, number]; pb: [number, number]; roe: [number, number]; de: [number, number]; div: [number, number] }> = {
  banking: { pe: [5.5, 12], pb: [0.9, 2.3], roe: [12, 24], de: [7, 11], div: [0, 3] },
  securities: { pe: [10, 22], pb: [1.1, 2.4], roe: [7, 16], de: [0.8, 2.2], div: [0, 4] },
  insurance: { pe: [12, 20], pb: [1.2, 2], roe: [7, 12], de: [3, 6], div: [1.5, 4] },
  realEstate: { pe: [9, 45], pb: [0.7, 2.6], roe: [2, 16], de: [0.5, 1.8], div: [0, 2] },
  materials: { pe: [8, 18], pb: [1, 2.8], roe: [8, 22], de: [0.4, 1.3], div: [0, 5] },
  consumer: { pe: [13, 24], pb: [2.5, 5.5], roe: [16, 30], de: [0.2, 0.9], div: [3, 7] },
  retail: { pe: [14, 35], pb: [2.2, 5], roe: [10, 24], de: [0.6, 1.6], div: [0.5, 3] },
  technology: { pe: [16, 26], pb: [3.5, 7], roe: [18, 30], de: [0.3, 0.9], div: [1, 3] },
  energy: { pe: [10, 18], pb: [1.2, 3], roe: [10, 20], de: [0.3, 1.2], div: [3, 8] },
  utilities: { pe: [9, 17], pb: [1, 2], roe: [9, 16], de: [0.4, 1.4], div: [3, 7] },
  industrials: { pe: [10, 24], pb: [1, 2.5], roe: [6, 15], de: [0.5, 1.6], div: [0.5, 4] },
  transport: { pe: [12, 28], pb: [1.5, 4], roe: [8, 22], de: [0.3, 1.5], div: [1, 4] },
};

function buildFundamentals(symbol: string, sector: Sector, price: number): Fundamentals {
  const p = FUND_PROFILE[sector];
  const r = (key: string, [a, b]: [number, number]) => between(`${symbol}|${key}`, a, b);
  const lossMaking = sector === "realEstate" && uniform(`${symbol}|loss`) < 0.15;
  const pe = lossMaking ? null : r("pe", p.pe);
  const roe = lossMaking ? -between(`${symbol}|nroe`, 1, 6) : r("roe", p.roe);
  const de = r("de", p.de);
  const shares = between(`${symbol}|shares`, 0.4e9, 6e9);
  return {
    marketCap: price * shares,
    pe,
    pb: r("pb", p.pb),
    eps: pe ? price / pe : -between(`${symbol}|neps`, 100, 900),
    roe,
    roa: roe / (1 + de),
    revenueGrowth: between(`${symbol}|rg`, -12, 32),
    profitGrowth: lossMaking ? between(`${symbol}|pg`, -80, -10) : between(`${symbol}|pg`, -25, 45),
    dividendYield: r("div", p.div),
    debtToEquity: de,
  };
}

const INDEX_BASE = { VNINDEX: 1280, VN30: 1360, HNXINDEX: 228, UPCOMINDEX: 96 } as const;

function buildIndex(code: IndexSnapshot["code"], members: string[], bars: Map<string, Bar[]>, dates: string[]): IndexSnapshot {
  const values: number[] = [];
  dates.forEach((_, i) => {
    if (i === 0) return values.push(1);
    const avg =
      members.reduce((s, sym) => {
        const b = bars.get(sym)!;
        return s + b[i].close / b[i - 1].close - 1;
      }, 0) / members.length;
    values.push(values[i - 1] * (1 + avg));
  });
  const anchorIdx = Math.max(0, dates.findIndex((d) => d >= ANCHOR_DATE));
  const scale = INDEX_BASE[code] / values[anchorIdx];
  const history = dates.map((time, i) => ({ time, value: Math.round(values[i] * scale * 100) / 100 }));
  const last = history[history.length - 1].value;
  const prev = history[history.length - 2].value;

  let advancers = 0, decliners = 0, unchanged = 0, volume = 0;
  for (const sym of members) {
    const b = bars.get(sym)!;
    const [y, t] = [b[b.length - 2], b[b.length - 1]];
    if (t.close > y.close) advancers++;
    else if (t.close < y.close) decliners++;
    else unchanged++;
    volume += t.volume;
  }
  return { code, value: last, change: last - prev, changePct: ((last - prev) / prev) * 100, volume, advancers, decliners, unchanged, history };
}

export function getSnapshot(): Snapshot {
  const end = lastSessionDate();
  const date = isoDate(end);
  if (snapshot?.date === date) return snapshot;

  const dates = sessionDates(end, HISTORY_SESSIONS);
  const bars = new Map<string, Bar[]>();
  const quotes = new Map<string, Quote>();
  const fundamentals = new Map<string, Fundamentals>();

  for (const s of universe) {
    const series = buildSeries(s.symbol, dates);
    bars.set(s.symbol, series);
    const [y, t] = [series[series.length - 2], series[series.length - 1]];
    const { ceiling, floor } = priceLimits(y.close, s.exchange);
    quotes.set(s.symbol, {
      symbol: s.symbol,
      reference: y.close,
      ceiling,
      floor,
      price: t.close,
      open: t.open,
      high: t.high,
      low: t.low,
      change: t.close - y.close,
      changePct: ((t.close - y.close) / y.close) * 100,
      volume: t.volume,
      value: t.volume * t.close,
    });
    fundamentals.set(s.symbol, buildFundamentals(s.symbol, s.sector, t.close));
  }

  const indices = [
    buildIndex("VNINDEX", universe.filter((s) => s.exchange === "HOSE").map((s) => s.symbol), bars, dates),
    buildIndex("VN30", universe.filter((s) => s.vn30).map((s) => s.symbol), bars, dates),
    buildIndex("HNXINDEX", universe.filter((s) => s.exchange === "HNX").map((s) => s.symbol), bars, dates),
    buildIndex("UPCOMINDEX", universe.filter((s) => s.exchange === "UPCOM").map((s) => s.symbol), bars, dates),
  ];

  snapshot = { date, bars, quotes, fundamentals, indices };
  return snapshot;
}
