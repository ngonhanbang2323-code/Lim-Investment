import "server-only";
import { db } from "./db";
import { getQuotes } from "./market";

function quoteMap(symbols: string[]) {
  return new Map(getQuotes(symbols).map((q) => [q.symbol, q]));
}

export async function getManagedAccount(userId: string) {
  const acc = await db.managedAccount.findUnique({
    where: { userId },
    include: { holdings: true, navs: { orderBy: { date: "asc" } }, reports: { orderBy: { date: "desc" } } },
  });
  if (!acc) return null;
  const quotes = quoteMap(acc.holdings.map((h) => h.symbol));
  const holdings = acc.holdings.map((h) => {
    const price = quotes.get(h.symbol)?.price ?? h.avgCost;
    const value = price * h.quantity;
    return { ...h, price, value, pnl: value - h.avgCost * h.quantity, pnlPct: (price / h.avgCost - 1) * 100 };
  });
  const invested = holdings.reduce((s, h) => s + h.value, 0);
  const total = invested + acc.cash;
  const first = acc.navs[0]?.nav;
  const last = acc.navs.at(-1)?.nav;
  return {
    ...acc,
    holdings: holdings
      .map((h) => ({ ...h, weight: total ? (h.value / total) * 100 : 0 }))
      .sort((a, b) => b.value - a.value),
    total,
    // The official NAV is the latest figure entered by Lim Investment; fall back to the live estimate.
    nav: last ?? total,
    sinceInception: first && last ? (last / first - 1) * 100 : null,
  };
}

export async function getPersonalPortfolio(userId: string) {
  const rows = await db.personalHolding.findMany({ where: { userId }, orderBy: { symbol: "asc" } });
  const quotes = quoteMap(rows.map((r) => r.symbol));
  const holdings = rows.map((r) => {
    const q = quotes.get(r.symbol);
    const price = q?.price ?? r.avgPrice;
    const value = price * r.quantity;
    const cost = r.avgPrice * r.quantity;
    return { ...r, price, reference: q?.reference ?? price, value, cost, pnl: value - cost, pnlPct: (price / r.avgPrice - 1) * 100 };
  });
  const value = holdings.reduce((s, h) => s + h.value, 0);
  const cost = holdings.reduce((s, h) => s + h.cost, 0);
  return { holdings, value, cost, pnl: value - cost, pnlPct: cost ? (value / cost - 1) * 100 : 0 };
}
