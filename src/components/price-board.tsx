"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n-config";
import type { Dictionary } from "@/dictionaries/vi";
import { fmtBillion, fmtNumber, fmtPct, fmtPrice, fmtSigned, priceTone, toneClass } from "@/lib/format";
import type { Exchange, Quote, StockMeta } from "@/lib/market/types";
import { ArrowUpDown } from "./icons";

export type BoardRow = StockMeta & Quote;
type SortKey = "symbol" | "price" | "changePct" | "volume" | "value";
type Filter = "ALL" | "VN30" | Exchange;
type Sort = { key: SortKey; dir: 1 | -1 };

function SortHeader({ k, sort, onSort, children, align = "right" }: { k: SortKey; sort: Sort; onSort: (k: SortKey) => void; children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th scope="col" aria-sort={sort.key === k ? (sort.dir === 1 ? "ascending" : "descending") : "none"} className={`px-3 py-2.5 font-medium ${align === "left" ? "text-left" : "text-right"}`}>
      <button type="button" onClick={() => onSort(k)} className={`inline-flex cursor-pointer items-center gap-1 hover:text-ink ${sort.key === k ? "text-ink" : ""}`}>
        {children}
        <ArrowUpDown size={13} className="opacity-60" />
      </button>
    </th>
  );
}

export function PriceBoard({ rows, lang, t }: { rows: BoardRow[]; lang: Locale; t: Dictionary["market"] & { search: string; noResults: string } }) {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>({ key: "value", dir: -1 });
  const onSort = (k: SortKey) => setSort((s) => ({ key: k, dir: s.key === k ? ((-s.dir) as 1 | -1) : k === "symbol" ? 1 : -1 }));

  const visible = useMemo(() => {
    const q = query.trim().toUpperCase();
    return rows
      .filter((r) => (filter === "ALL" ? true : filter === "VN30" ? r.vn30 : r.exchange === filter))
      .filter((r) => !q || r.symbol.includes(q))
      .sort((a, b) => {
        const av = a[sort.key];
        const bv = b[sort.key];
        return (typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number)) * sort.dir;
      });
  }, [rows, filter, query, sort]);

  const tabs: [Filter, string][] = [
    ["ALL", t.allExchanges],
    ["VN30", t.vn30Only],
    ["HOSE", "HOSE"],
    ["HNX", "HNX"],
    ["UPCOM", "UPCoM"],
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label={t.board} className="flex flex-wrap gap-1">
          {tabs.map(([key, label]) => (
            <button
              key={key}
              role="tab"
              aria-selected={filter === key}
              onClick={() => setFilter(key)}
              className="min-h-10 cursor-pointer rounded-md px-3 text-sm font-medium text-ink-muted hover:bg-forest-soft aria-selected:bg-forest aria-selected:text-white"
            >
              {label}
            </button>
          ))}
        </div>
        <label className="relative">
          <span className="sr-only">{t.search}</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search}
            className="min-h-10 w-44 rounded-md border border-line-strong bg-surface px-3 text-sm uppercase placeholder:normal-case focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
          />
        </label>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="tabular w-full min-w-[860px] text-sm">
          <thead className="border-b border-line bg-paper text-ink-muted">
            <tr>
              <SortHeader sort={sort} onSort={onSort} k="symbol" align="left">
                {t.columns.symbol}
              </SortHeader>
              <th scope="col" className="px-3 py-2.5 text-right font-medium text-tone-ref">{t.columns.reference}</th>
              <th scope="col" className="px-3 py-2.5 text-right font-medium text-tone-ceil">{t.columns.ceiling}</th>
              <th scope="col" className="px-3 py-2.5 text-right font-medium text-tone-floor">{t.columns.floor}</th>
              <SortHeader sort={sort} onSort={onSort} k="price">{t.columns.price}</SortHeader>
              <th scope="col" className="px-3 py-2.5 text-right font-medium">{t.columns.change}</th>
              <SortHeader sort={sort} onSort={onSort} k="changePct">{t.columns.changePct}</SortHeader>
              <th scope="col" className="px-3 py-2.5 text-right font-medium">{t.columns.high}</th>
              <th scope="col" className="px-3 py-2.5 text-right font-medium">{t.columns.low}</th>
              <SortHeader sort={sort} onSort={onSort} k="volume">{t.columns.volume}</SortHeader>
              <SortHeader sort={sort} onSort={onSort} k="value">{t.columns.value}</SortHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visible.map((r) => {
              const tone = toneClass[priceTone(r.price, r.reference, r.ceiling, r.floor)];
              const tc = (p: number) => toneClass[priceTone(p, r.reference, r.ceiling, r.floor)];
              return (
                <tr key={r.symbol} className="hover:bg-forest-soft/50">
                  <th scope="row" className="sticky left-0 bg-surface px-3 py-2 text-left font-normal">
                    <Link href={`/${lang}/market/${r.symbol}`} className={`font-semibold hover:underline ${tone}`}>
                      {r.symbol}
                    </Link>
                    <span className="ml-2 text-xs text-ink-muted">{r.exchange === "UPCOM" ? "UPCoM" : r.exchange}</span>
                  </th>
                  <td className="px-3 py-2 text-right text-tone-ref">{fmtPrice(r.reference, lang)}</td>
                  <td className="px-3 py-2 text-right text-tone-ceil">{fmtPrice(r.ceiling, lang)}</td>
                  <td className="px-3 py-2 text-right text-tone-floor">{fmtPrice(r.floor, lang)}</td>
                  <td className={`px-3 py-2 text-right font-semibold ${tone}`}>{fmtPrice(r.price, lang)}</td>
                  <td className={`px-3 py-2 text-right ${tone}`}>{fmtSigned(r.change / 1000, lang)}</td>
                  <td className={`px-3 py-2 text-right ${tone}`}>{fmtPct(r.changePct, lang)}</td>
                  <td className={`px-3 py-2 text-right ${tc(r.high)}`}>{fmtPrice(r.high, lang)}</td>
                  <td className={`px-3 py-2 text-right ${tc(r.low)}`}>{fmtPrice(r.low, lang)}</td>
                  <td className="px-3 py-2 text-right">{fmtNumber(r.volume, lang)}</td>
                  <td className="px-3 py-2 text-right">{fmtBillion(r.value, lang, 1)}</td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr>
                <td colSpan={11} className="px-3 py-10 text-center text-ink-muted">
                  {t.noResults}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-ink-muted">{t.legend}</p>
    </div>
  );
}
