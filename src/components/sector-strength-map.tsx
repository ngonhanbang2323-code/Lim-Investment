"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n-config";
import type { Dictionary } from "@/dictionaries/vi";
import type { Horizon } from "@/lib/market/sector-strength";
import type { Sector } from "@/lib/market/types";
import { interpolate } from "@/lib/format";
import { buttonStyles, inputStyles } from "./ui";
import { External } from "./icons";

type Row = { sector: Sector; label: string; count: number; scores: Record<Horizon, number[]> };
type Props = { dates: string[]; rows: Row[]; lang: Locale; t: Dictionary["tools"]["strength"] };

// Score bands, weakest to strongest. Fills are the same in both themes; text stays dark on all of them.
const BANDS: { min: number; fill: string }[] = [
  { min: 0, fill: "#5d9df7" },
  { min: 10, fill: "#8dbcfa" },
  { min: 20, fill: "#f07470" },
  { min: 30, fill: "#f6a487" },
  { min: 40, fill: "#fbcfa0" },
  { min: 50, fill: "#fbe6a3" },
  { min: 60, fill: "#c5de90" },
  { min: 70, fill: "#6cbd6a" },
  { min: 81, fill: "#b7acfb" },
  { min: 90, fill: "#978af5" },
];
const fillFor = (score: number) => [...BANDS].reverse().find((b) => score >= b.min)!.fill;
const TREND_LOOKBACK = 5;

export function SectorStrengthMap({ dates, rows, lang, t }: Props) {
  const [horizon, setHorizon] = useState<Horizon>("medium");
  const [start, setStart] = useState(dates[Math.max(0, dates.length - 30)]);
  const [end, setEnd] = useState(dates[dates.length - 1]);
  const [hide, setHide] = useState(false);

  const [from, to] = start <= end ? [start, end] : [end, start];
  const visible = useMemo(() => {
    const idx = dates.flatMap((d, i) => (d >= from && d <= to ? [i] : []));
    if (idx.length === 0) return { idx, rows: [] };
    const last = idx[idx.length - 1];
    const sorted = rows
      .map((r) => {
        const s = r.scores[horizon];
        const prev = s[Math.max(0, last - TREND_LOOKBACK)];
        return { ...r, values: idx.map((i) => s[i]), trend: Math.sign(s[last] - prev) };
      })
      .sort((a, b) => b.values[b.values.length - 1] - a.values[a.values.length - 1]);
    return { idx, rows: sorted };
  }, [dates, rows, horizon, from, to]);

  // Compact column header: dd/MM (MM/dd in English), from the ISO date so it never wraps oddly.
  const dayLabel = (iso: string) => (lang === "en" ? `${iso.slice(5, 7)}/${iso.slice(8, 10)}` : `${iso.slice(8, 10)}/${iso.slice(5, 7)}`);

  function downloadCsv() {
    const header = [t.no, t.sector, t.count, ...visible.idx.map((i) => dates[i])];
    const lines = visible.rows.map((r, n) => [n + 1, r.label, r.count, ...r.values]);
    const csv = [header, ...lines].map((cols) => cols.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\r\n");
    // BOM so Excel opens Vietnamese and Chinese text as UTF-8.
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `lim-sector-strength-${horizon}-${from}-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const stickyNo = "sm:sticky sm:left-0 sm:z-10";
  const stickySector = "sticky left-0 z-10 sm:left-12";
  const stickyCount = "sm:sticky sm:left-[17rem] sm:z-10";

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="grid gap-1.5 text-sm font-medium">
          {t.horizon}
          <select value={horizon} onChange={(e) => setHorizon(e.target.value as Horizon)} className={`${inputStyles} min-w-56`}>
            {(Object.keys(t.horizons) as Horizon[]).map((h) => (
              <option key={h} value={h}>
                {t.horizons[h]}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          {t.start}
          <input type="date" value={start} min={dates[0]} max={dates[dates.length - 1]} onChange={(e) => e.target.value && setStart(e.target.value)} className={inputStyles} />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          {t.end}
          <input type="date" value={end} min={dates[0]} max={dates[dates.length - 1]} onChange={(e) => e.target.value && setEnd(e.target.value)} className={inputStyles} />
        </label>
        <div className="flex gap-2 sm:ml-auto">
          <button type="button" aria-pressed={hide} onClick={() => setHide((h) => !h)} className={`${buttonStyles.secondary} aria-pressed:border-forest aria-pressed:text-forest`}>
            {t.hideValues}
          </button>
          <button type="button" onClick={downloadCsv} disabled={visible.rows.length === 0} className={buttonStyles.secondary}>
            {t.download}
          </button>
        </div>
      </div>

      {visible.rows.length === 0 ? (
        <p className="mt-10 text-ink-muted">{t.emptyRange}</p>
      ) : (
        <div className="mt-5 max-h-[75vh] overflow-auto rounded-lg border border-line bg-surface">
          <table className="tabular border-separate border-spacing-0 text-sm">
            <thead className="sticky top-0 z-20">
              <tr className="bg-forest text-on-forest">
                <th scope="col" className={`${stickyNo} w-12 min-w-12 bg-forest px-2 py-3 text-center font-semibold`}>
                  {t.no}
                </th>
                <th scope="col" className={`${stickySector} bg-forest px-3 py-3 text-left font-semibold`}>
                  {t.sector}
                </th>
                <th scope="col" title={t.countHint} className={`${stickyCount} w-16 min-w-16 border-r border-on-forest/20 bg-forest px-2 py-3 text-right font-semibold`}>
                  <abbr title={t.countHint} className="no-underline">
                    {t.count}
                  </abbr>
                </th>
                {visible.idx.map((i) => (
                  <th key={dates[i]} scope="col" className="min-w-12 whitespace-nowrap px-1 py-3 text-center text-xs font-semibold">
                    <time dateTime={dates[i]}>{dayLabel(dates[i])}</time>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.rows.map((r, n) => (
                <tr key={r.sector}>
                  <td className={`${stickyNo} border-b border-line bg-surface px-2 text-center text-ink-muted`}>{n + 1}</td>
                  <th scope="row" className={`${stickySector} border-b border-line bg-surface px-3 py-2 text-left font-medium`}>
                    <span className="flex w-36 items-center gap-1.5 sm:w-52 sm:gap-2">
                      {/* On phones the name itself is the link; the icon only shows from sm up. */}
                      <Link href={`/${lang}/tools/screener?sec=${r.sector}`} title={r.label}
                        aria-label={interpolate(t.openSector, { sector: r.label })} className="min-w-0 flex-1 truncate hover:text-forest hover:underline">
                        {r.label}
                      </Link>
                      <Trend value={r.trend} t={t.trend} />
                      <Link
                        href={`/${lang}/tools/screener?sec=${r.sector}`}
                        // Same target as the name link; kept as a visual cue only.
                        aria-hidden="true"
                        title={interpolate(t.openSector, { sector: r.label })}
                        tabIndex={-1}
                        className="hidden size-8 shrink-0 items-center justify-center rounded-md text-ink-muted hover:bg-forest-soft hover:text-forest sm:inline-flex"
                      >
                        <External size={16} />
                      </Link>
                    </span>
                  </th>
                  <td className={`${stickyCount} border-b border-r border-line bg-surface px-2 text-right`}>{r.count}</td>
                  {r.values.map((v, k) => (
                    <td
                      key={visible.idx[k]}
                      style={{ background: fillFor(v) }}
                      className="h-10 border-b border-l border-surface text-center font-medium text-[#10161a]"
                      title={`${r.label} · ${dayLabel(dates[visible.idx[k]])}: ${v}`}
                    >
                      <span className={hide ? "sr-only" : undefined}>{v}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-muted">
        <span className="font-medium">{t.legend}</span>
        <ol className="flex flex-wrap overflow-hidden rounded">
          {BANDS.map((b, i) => (
            <li key={b.min} style={{ background: b.fill }} className="tabular whitespace-nowrap px-2 py-1 font-medium text-[#10161a]">
              {b.min}
              {i === BANDS.length - 1 ? "–100" : `–${BANDS[i + 1].min - 1}`}
            </li>
          ))}
        </ol>
      </div>
      <p className="mt-3 max-w-3xl text-sm text-ink-muted">{t.method}</p>
    </div>
  );
}

function Trend({ value, t }: { value: number; t: Dictionary["tools"]["strength"]["trend"] }) {
  const [label, cls, glyph] =
    value > 0 ? [t.up, "text-tone-up", "▲"] : value < 0 ? [t.down, "text-tone-down", "▼"] : [t.flat, "text-tone-ref", "–"];
  return (
    <span title={label} className={`w-4 shrink-0 text-center text-xs ${cls}`}>
      <span aria-hidden="true">{glyph}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}
