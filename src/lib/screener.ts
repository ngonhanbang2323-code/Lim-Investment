// Screener filters, encoded as URL search params so screens can be shared, bookmarked and saved.
import type { ScreenerRow } from "./market/types";

export type ScreenKind = "screener" | "fundamental" | "technical";

export type Criteria = {
  ex: string[]; // exchanges
  sec: string; // sector, "" = all
  ind: string; // detailed industry, "" = all
  vn30: boolean;
  capMin?: number; // VND bn
  capMax?: number;
  pMin?: number; // VND thousand
  pMax?: number;
  valMin?: number; // VND bn traded
  peMin?: number;
  peMax?: number;
  pePos: boolean;
  pbMax?: number;
  roeMin?: number;
  roaMin?: number;
  rgMin?: number;
  pgMin?: number;
  dyMin?: number;
  deMax?: number;
  ma20: boolean;
  ma50: boolean;
  ma200: boolean;
  gc: boolean;
  dc: boolean;
  rsi: "" | "os" | "n" | "ob";
  macd: "" | "up" | "down";
  vol?: number; // volume / 20-day average
  brk: boolean;
  near: boolean;
  sort: string;
  dir: "asc" | "desc";
};

const NUM_KEYS = ["capMin", "capMax", "pMin", "pMax", "valMin", "peMin", "peMax", "pbMax", "roeMin", "roaMin", "rgMin", "pgMin", "dyMin", "deMax", "vol"] as const;
const BOOL_KEYS = ["vn30", "pePos", "ma20", "ma50", "ma200", "gc", "dc", "brk", "near"] as const;

export const defaultSort: Record<ScreenKind, string> = { screener: "marketCap", fundamental: "roe", technical: "change1m" };

export function emptyCriteria(kind: ScreenKind): Criteria {
  return {
    ex: [], sec: "", ind: "", vn30: false, pePos: false, ma20: false, ma50: false, ma200: false, gc: false, dc: false,
    rsi: "", macd: "", brk: false, near: false, sort: defaultSort[kind], dir: "desc",
  };
}

export const presets: Record<ScreenKind, Record<string, Partial<Criteria>>> = {
  screener: {},
  fundamental: {
    value: { pePos: true, peMax: 10, pbMax: 1.5, sort: "pe", dir: "asc" },
    growth: { rgMin: 15, pgMin: 20, sort: "profitGrowth" },
    dividend: { dyMin: 4, sort: "dividendYield" },
    quality: { roeMin: 15, deMax: 1, sort: "roe" },
  },
  technical: {
    uptrend: { ma20: true, ma50: true, ma200: true, sort: "change3m" },
    oversold: { rsi: "os", sort: "rsi14", dir: "asc" },
    breakout: { near: true, vol: 1.5, sort: "change1m" },
    volume: { vol: 2, sort: "volumeRatio" },
  },
};

export function parseCriteria(kind: ScreenKind, params: URLSearchParams): Criteria {
  const preset = presets[kind][params.get("preset") ?? ""] ?? {};
  const c: Criteria = { ...emptyCriteria(kind), ...preset };
  const ex = params.get("ex");
  if (ex) c.ex = ex.split(",").filter((e) => ["HOSE", "HNX", "UPCOM"].includes(e));
  if (params.get("sec")) c.sec = params.get("sec")!;
  if (params.get("ind")) c.ind = params.get("ind")!;
  for (const k of NUM_KEYS) {
    const v = params.get(k);
    if (v != null && v !== "" && Number.isFinite(Number(v))) c[k] = Number(v);
  }
  for (const k of BOOL_KEYS) if (params.get(k) === "1") c[k] = true;
  const rsi = params.get("rsi");
  if (rsi === "os" || rsi === "n" || rsi === "ob") c.rsi = rsi;
  const macd = params.get("macd");
  if (macd === "up" || macd === "down") c.macd = macd;
  if (params.get("sort")) c.sort = params.get("sort")!;
  if (params.get("dir") === "asc" || params.get("dir") === "desc") c.dir = params.get("dir") as "asc" | "desc";
  return c;
}

export function serializeCriteria(kind: ScreenKind, c: Criteria) {
  const p = new URLSearchParams();
  if (c.ex.length) p.set("ex", c.ex.join(","));
  if (c.sec) p.set("sec", c.sec);
  if (c.ind) p.set("ind", c.ind);
  for (const k of NUM_KEYS) if (c[k] != null) p.set(k, String(c[k]));
  for (const k of BOOL_KEYS) if (c[k]) p.set(k, "1");
  if (c.rsi) p.set("rsi", c.rsi);
  if (c.macd) p.set("macd", c.macd);
  if (c.sort !== defaultSort[kind] || c.dir !== "desc") {
    p.set("sort", c.sort);
    p.set("dir", c.dir);
  }
  return p.toString();
}

const ge = (v: number | null, min?: number) => min == null || (v != null && v >= min);
const le = (v: number | null, max?: number) => max == null || (v != null && v <= max);

export function applyCriteria(rows: ScreenerRow[], c: Criteria) {
  const out = rows.filter((r) => {
    if (c.ex.length && !c.ex.includes(r.exchange)) return false;
    if (c.sec && r.sector !== c.sec) return false;
    if (c.ind && r.industry !== c.ind) return false;
    if (c.vn30 && !r.vn30) return false;
    if (!ge(r.marketCap / 1e9, c.capMin) || !le(r.marketCap / 1e9, c.capMax)) return false;
    if (!ge(r.price / 1000, c.pMin) || !le(r.price / 1000, c.pMax)) return false;
    if (!ge(r.value / 1e9, c.valMin)) return false;
    // Fundamentals
    if (c.pePos && (r.pe == null || r.pe <= 0)) return false;
    if (!ge(r.pe, c.peMin) || !le(r.pe, c.peMax)) return false;
    if (!le(r.pb, c.pbMax)) return false;
    if (!ge(r.roe, c.roeMin) || !ge(r.roa, c.roaMin)) return false;
    if (!ge(r.revenueGrowth, c.rgMin) || !ge(r.profitGrowth, c.pgMin)) return false;
    if (!ge(r.dividendYield, c.dyMin) || !le(r.debtToEquity, c.deMax)) return false;
    // Technicals
    if (c.ma20 && r.price <= r.ma20) return false;
    if (c.ma50 && r.price <= r.ma50) return false;
    if (c.ma200 && r.price <= r.ma200) return false;
    if (c.gc && !(r.ma50 > r.ma200)) return false;
    if (c.dc && !(r.ma50 < r.ma200)) return false;
    if (c.rsi === "os" && r.rsi14 >= 30) return false;
    if (c.rsi === "ob" && r.rsi14 <= 70) return false;
    if (c.rsi === "n" && (r.rsi14 < 30 || r.rsi14 > 70)) return false;
    if (c.macd === "up" && !(r.macd > r.macdSignal)) return false;
    if (c.macd === "down" && !(r.macd < r.macdSignal)) return false;
    if (!ge(r.volumeRatio, c.vol)) return false;
    if (c.brk && !r.breakout52w) return false;
    if (c.near && r.price < r.high52w * 0.95) return false;
    return true;
  });
  const key = c.sort as keyof ScreenerRow;
  const dir = c.dir === "asc" ? 1 : -1;
  return out.sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (typeof av === "string" && typeof bv === "string") return av.localeCompare(bv) * dir;
    // Missing values (e.g. P/E of loss-making companies) always sort last.
    if (av == null) return 1;
    if (bv == null) return -1;
    return ((av as number) - (bv as number)) * dir;
  });
}

export function activeCount(kind: ScreenKind, c: Criteria) {
  const base = emptyCriteria(kind);
  return Object.keys(c).filter((k) => {
    if (k === "sort" || k === "dir") return false;
    const a = c[k as keyof Criteria];
    const b = base[k as keyof Criteria];
    return Array.isArray(a) ? a.length > 0 : a !== b;
  }).length;
}
