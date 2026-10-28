// Sector strength map, by detailed industry. For each session, every stock is ranked against the
// whole universe by its price change over the horizon; industries are then ranked 0–100 by the
// mean rank of their members. 100 = the strongest industry that session, 0 = the weakest.
import type { Bar, Industry, StockMeta } from "./types";

export const horizons = { short: 5, medium: 20, long: 60 } as const;
export type Horizon = keyof typeof horizons;

export type SectorStrength = {
  dates: string[]; // sessions with a score, oldest first
  rows: { industry: Industry; count: number; scores: Record<Horizon, number[]> }[];
};

function percentileRanks(values: number[]) {
  const order = values.map((v, i) => [v, i] as const).sort((a, b) => a[0] - b[0]);
  const ranks = new Array<number>(values.length);
  // Ties share the average position so equal moves get equal ranks.
  for (let i = 0; i < order.length; ) {
    let j = i;
    while (j + 1 < order.length && order[j + 1][0] === order[i][0]) j++;
    const pct = order.length > 1 ? (((i + j) / 2) / (order.length - 1)) * 100 : 50;
    for (let k = i; k <= j; k++) ranks[order[k][1]] = pct;
    i = j + 1;
  }
  return ranks;
}

export function computeSectorStrength(stocks: StockMeta[], bars: Map<string, Bar[]>): SectorStrength {
  const series = stocks.map((s) => bars.get(s.symbol)!);
  const sessions = series[0].map((b) => b.time);
  const longest = Math.max(...Object.values(horizons));
  const dates = sessions.slice(longest);

  const industries = [...new Set(stocks.map((s) => s.industry))];
  const members = new Map(industries.map((ind) => [ind, stocks.flatMap((s, i) => (s.industry === ind ? [i] : []))]));
  const rows = industries.map((industry) => ({
    industry,
    count: members.get(industry)!.length,
    scores: { short: [] as number[], medium: [] as number[], long: [] as number[] },
  }));

  for (let d = longest; d < sessions.length; d++) {
    for (const [h, lookback] of Object.entries(horizons) as [Horizon, number][]) {
      const stockRanks = percentileRanks(series.map((b) => b[d].close / b[d - lookback].close - 1));
      const industryMeans = rows.map((row) => {
        const idx = members.get(row.industry)!;
        return idx.reduce((sum, i) => sum + stockRanks[i], 0) / idx.length;
      });
      percentileRanks(industryMeans).forEach((score, i) => rows[i].scores[h].push(Math.round(score)));
    }
  }
  return { dates, rows };
}
