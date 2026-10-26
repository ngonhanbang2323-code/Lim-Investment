import type { Bar, Technicals } from "./types";

export function sma(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = [];
  let sum = 0;
  values.forEach((v, i) => {
    sum += v;
    if (i >= period) sum -= values[i - period];
    out.push(i >= period - 1 ? sum / period : null);
  });
  return out;
}

export function ema(values: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const out: number[] = [];
  values.forEach((v, i) => out.push(i === 0 ? v : v * k + out[i - 1] * (1 - k)));
  return out;
}

/** Wilder's RSI. */
export function rsi(values: number[], period = 14): number[] {
  const out: number[] = new Array(values.length).fill(50);
  let gain = 0;
  let loss = 0;
  for (let i = 1; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    const g = Math.max(diff, 0);
    const l = Math.max(-diff, 0);
    if (i <= period) {
      gain += g / period;
      loss += l / period;
    } else {
      gain = (gain * (period - 1) + g) / period;
      loss = (loss * (period - 1) + l) / period;
    }
    if (i >= period) out[i] = loss === 0 ? 100 : 100 - 100 / (1 + gain / loss);
  }
  return out;
}

export function macd(values: number[]) {
  const fast = ema(values, 12);
  const slow = ema(values, 26);
  const line = values.map((_, i) => fast[i] - slow[i]);
  const signal = ema(line, 9);
  return { line, signal };
}

function pctChange(closes: number[], sessionsAgo: number) {
  const past = closes[Math.max(0, closes.length - 1 - sessionsAgo)];
  return ((closes[closes.length - 1] - past) / past) * 100;
}

export function computeTechnicals(bars: Bar[]): Technicals {
  const closes = bars.map((b) => b.close);
  const n = closes.length;
  const ma20 = sma(closes, 20);
  const ma50 = sma(closes, 50);
  const ma200 = sma(closes, 200);
  const r = rsi(closes);
  const m = macd(closes);

  let macdCross: Technicals["macdCross"] = null;
  for (let i = n - 1; i >= n - 3; i--) {
    const above = m.line[i] > m.signal[i];
    const wasAbove = m.line[i - 1] > m.signal[i - 1];
    if (above !== wasAbove) {
      macdCross = above ? "up" : "down";
      break;
    }
  }

  let maCross: Technicals["maCross"] = null;
  for (let i = n - 1; i >= n - 10; i--) {
    const [a, b, pa, pb] = [ma50[i], ma200[i], ma50[i - 1], ma200[i - 1]];
    if (a == null || b == null || pa == null || pb == null) break;
    if (a > b !== pa > pb) {
      maCross = a > b ? "golden" : "death";
      break;
    }
  }

  const year = bars.slice(-250);
  const prevYear = bars.slice(-251, -1);
  const high52w = Math.max(...year.map((b) => b.high));
  const low52w = Math.min(...year.map((b) => b.low));
  const avgVol20 = bars.slice(-21, -1).reduce((s, b) => s + b.volume, 0) / 20;

  const last = closes[n - 1];
  const ma200Last = ma200[n - 1] ?? last;
  return {
    ma20: ma20[n - 1] ?? closes[n - 1],
    ma50: ma50[n - 1] ?? closes[n - 1],
    ma200: ma200Last,
    rsi14: r[n - 1],
    macd: m.line[n - 1],
    macdSignal: m.signal[n - 1],
    macdCross,
    maCross,
    volumeRatio: avgVol20 > 0 ? bars[n - 1].volume / avgVol20 : 1,
    high52w,
    low52w,
    breakout52w: closes[n - 1] > Math.max(...prevYear.map((b) => b.high)),
    vsMa200: (last / ma200Last - 1) * 100,
    vsHigh52w: (last / high52w - 1) * 100,
    change1w: pctChange(closes, 5),
    change1m: pctChange(closes, 21),
    change3m: pctChange(closes, 63),
  };
}
