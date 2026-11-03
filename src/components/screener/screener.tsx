"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { Locale } from "@/lib/i18n-config";
import type { Dictionary } from "@/dictionaries/vi";
import type { ScreenerRow } from "@/lib/market/types";
import {
  activeCount,
  applyCriteria,
  emptyCriteria,
  parseCriteria,
  presets,
  serializeCriteria,
  type Criteria,
  type ScreenKind,
} from "@/lib/screener";
import { fmtBillion, fmtNumber, fmtPct, fmtPrice, interpolate, priceTone, signTone, toneClass } from "@/lib/format";
import { saveScreen } from "@/app/actions/screens";
import { ArrowUpDown, Filter } from "../icons";
import { buttonStyles, inputStyles } from "../ui";

export type ScreenerText = {
  tools: Dictionary["tools"];
  metrics: Dictionary["metrics"];
  sectors: Dictionary["market"]["sectors"];
  industries: Dictionary["market"]["industries"];
  columns: Dictionary["market"]["columns"];
  common: Dictionary["common"];
};

type Props = { kind: ScreenKind; rows: ScreenerRow[]; lang: Locale; t: ScreenerText; signedIn: boolean; dataNote: string };

type Column = { key: keyof ScreenerRow; label: string; render: (r: ScreenerRow) => React.ReactNode; align?: "left" };

export function Screener({ kind, rows, lang, t, signedIn, dataNote }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const [c, setC] = useState<Criteria>(() => parseCriteria(kind, new URLSearchParams(search.toString())));
  const [panelOpen, setPanelOpen] = useState(false);
  const tt = t.tools;

  // Keep the URL in sync (debounced) so the screen can be shared or saved.
  const query = serializeCriteria(kind, c);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const id = setTimeout(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }), 300);
    return () => clearTimeout(id);
  }, [query, pathname, router]);

  const results = useMemo(() => applyCriteria(rows, c), [rows, c]);
  const set = <K extends keyof Criteria>(key: K, value: Criteria[K]) => setC((prev) => ({ ...prev, [key]: value }));
  const num = (v: string) => (v === "" ? undefined : Number(v.replace(",", ".")));

  const n = (v: number, d = 1) => fmtNumber(v, lang, d);
  const pct = (v: number) => <span className={toneClass[signTone(v)]}>{fmtPct(v, lang, 1)}</span>;
  const m = t.metrics;
  const cols: Record<string, Column> = {
    price: { key: "price", label: t.columns.price, render: (r) => <span className={toneClass[priceTone(r.price, r.reference, r.ceiling, r.floor)]}>{fmtPrice(r.price, lang)}</span> },
    changePct: { key: "changePct", label: t.columns.changePct, render: (r) => pct(r.changePct) },
    marketCap: { key: "marketCap", label: `${m.marketCap} (${t.common.unit.bn})`, render: (r) => fmtBillion(r.marketCap, lang) },
    value: { key: "value", label: `${m.avgValue} (${t.common.unit.bn})`, render: (r) => fmtBillion(r.value, lang, 1) },
    pe: { key: "pe", label: m.pe, render: (r) => (r.pe == null ? "—" : n(r.pe)) },
    pb: { key: "pb", label: m.pb, render: (r) => n(r.pb, 2) },
    roe: { key: "roe", label: m.roe, render: (r) => fmtPct(r.roe, lang, 1, false) },
    roa: { key: "roa", label: m.roa, render: (r) => fmtPct(r.roa, lang, 1, false) },
    revenueGrowth: { key: "revenueGrowth", label: m.revenueGrowth, render: (r) => pct(r.revenueGrowth) },
    profitGrowth: { key: "profitGrowth", label: m.profitGrowth, render: (r) => pct(r.profitGrowth) },
    dividendYield: { key: "dividendYield", label: m.dividendYield, render: (r) => fmtPct(r.dividendYield, lang, 1, false) },
    debtToEquity: { key: "debtToEquity", label: m.debtToEquity, render: (r) => n(r.debtToEquity, 2) },
    change1w: { key: "change1w", label: m.change1w, render: (r) => pct(r.change1w) },
    change1m: { key: "change1m", label: m.change1m, render: (r) => pct(r.change1m) },
    change3m: { key: "change3m", label: m.change3m, render: (r) => pct(r.change3m) },
    rsi14: {
      key: "rsi14",
      label: m.rsi14,
      render: (r) => <span className={r.rsi14 < 30 ? "text-tone-floor" : r.rsi14 > 70 ? "text-tone-ceil" : ""}>{n(r.rsi14)}</span>,
    },
    volumeRatio: { key: "volumeRatio", label: m.volumeRatio, render: (r) => `${n(r.volumeRatio, 2)}×` },
    vsMa200: { key: "vsMa200", label: `% ${m.ma200}`, render: (r) => pct(r.vsMa200) },
    vsHigh52w: { key: "vsHigh52w", label: `% ${m.high52w}`, render: (r) => pct(r.vsHigh52w) },
  };
  const layout: Record<ScreenKind, string[]> = {
    screener: ["price", "changePct", "marketCap", "value", "pe", "roe", "change1m", "rsi14"],
    fundamental: ["price", "marketCap", "pe", "pb", "roe", "roa", "revenueGrowth", "profitGrowth", "dividendYield", "debtToEquity"],
    technical: ["price", "changePct", "change1w", "change1m", "change3m", "rsi14", "volumeRatio", "vsMa200", "vsHigh52w"],
  };
  const columns = layout[kind].map((k) => cols[k]);

  const sortBy = (key: string) =>
    setC((prev) => ({ ...prev, sort: key, dir: prev.sort === key ? (prev.dir === "asc" ? "desc" : "asc") : key === "symbol" ? "asc" : "desc" }));

  // Detailed industries, narrowed to the chosen sector.
  const industryOptions = Object.entries(t.industries).filter(([k]) => !c.sec || rows.some((r) => r.industry === k && r.sector === c.sec));

  const active = activeCount(kind, c);
  const presetNames = tt.presetList as Record<string, string>;

  const commonFilters = (
    <FilterGroup title={tt.filters}>
      <fieldset>
        <legend className="mb-2 text-sm font-medium">{tt.exchange}</legend>
        <div className="flex flex-wrap gap-1.5">
          {(["HOSE", "HNX", "UPCOM"] as const).map((ex) => {
            const on = c.ex.includes(ex);
            return (
              <button
                key={ex}
                type="button"
                aria-pressed={on}
                onClick={() => set("ex", on ? c.ex.filter((e) => e !== ex) : [...c.ex, ex])}
                className="min-h-9 cursor-pointer rounded-full border border-line-strong px-3 text-sm aria-pressed:border-forest aria-pressed:bg-forest aria-pressed:text-on-forest"
              >
                {ex === "UPCOM" ? "UPCoM" : ex}
              </button>
            );
          })}
        </div>
      </fieldset>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">{tt.sector}</span>
        <select value={c.sec} onChange={(e) => setC((p) => ({ ...p, sec: e.target.value, ind: "" }))} className={inputStyles}>
          <option value="">{tt.all}</option>
          {Object.entries(t.sectors).map(([k, label]) => (
            <option key={k} value={k}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">{tt.industry}</span>
        <select value={c.ind} onChange={(e) => set("ind", e.target.value)} className={inputStyles}>
          <option value="">{tt.all}</option>
          {industryOptions.map(([k, label]) => (
            <option key={k} value={k}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <Check label={tt.vn30} checked={c.vn30} onChange={(v) => set("vn30", v)} />
      <Range label={tt.marketCapBn} min={c.capMin} max={c.capMax} t={tt} onMin={(v) => set("capMin", num(v))} onMax={(v) => set("capMax", num(v))} />
      {kind === "screener" && (
        <>
          <Range label={tt.priceK} min={c.pMin} max={c.pMax} t={tt} onMin={(v) => set("pMin", num(v))} onMax={(v) => set("pMax", num(v))} />
          <Single label={`${tt.valueBn} ≥`} value={c.valMin} onChange={(v) => set("valMin", num(v))} />
        </>
      )}
    </FilterGroup>
  );

  const faFilters = (
    <FilterGroup title={t.tools.fundamental.title}>
      <Check label={tt.positivePe} checked={c.pePos} onChange={(v) => set("pePos", v)} />
      <Range label={m.pe} min={c.peMin} max={c.peMax} t={tt} onMin={(v) => set("peMin", num(v))} onMax={(v) => set("peMax", num(v))} />
      <Single label={`${m.pb} ≤`} value={c.pbMax} onChange={(v) => set("pbMax", num(v))} />
      <Single label={`${m.roe} (%) ≥`} value={c.roeMin} onChange={(v) => set("roeMin", num(v))} />
      <Single label={`${m.roa} (%) ≥`} value={c.roaMin} onChange={(v) => set("roaMin", num(v))} />
      <Single label={`${m.revenueGrowth} (%) ≥`} value={c.rgMin} onChange={(v) => set("rgMin", num(v))} />
      <Single label={`${m.profitGrowth} (%) ≥`} value={c.pgMin} onChange={(v) => set("pgMin", num(v))} />
      <Single label={`${m.dividendYield} (%) ≥`} value={c.dyMin} onChange={(v) => set("dyMin", num(v))} />
      <Single label={`${m.debtToEquity} ≤`} value={c.deMax} onChange={(v) => set("deMax", num(v))} />
    </FilterGroup>
  );

  const taFilters = (
    <FilterGroup title={t.tools.technical.title}>
      <fieldset className="space-y-2">
        <legend className="mb-1 text-sm font-medium">{tt.ta.trend}</legend>
        <Check label={tt.ta.aboveMa20} checked={c.ma20} onChange={(v) => set("ma20", v)} />
        <Check label={tt.ta.aboveMa50} checked={c.ma50} onChange={(v) => set("ma50", v)} />
        <Check label={tt.ta.aboveMa200} checked={c.ma200} onChange={(v) => set("ma200", v)} />
        <Check label={tt.ta.goldenCross} checked={c.gc} onChange={(v) => setC((p) => ({ ...p, gc: v, dc: v ? false : p.dc }))} />
        <Check label={tt.ta.deathCross} checked={c.dc} onChange={(v) => setC((p) => ({ ...p, dc: v, gc: v ? false : p.gc }))} />
      </fieldset>
      <fieldset className="space-y-2">
        <legend className="mb-1 text-sm font-medium">{tt.ta.momentum}</legend>
        <label className="block">
          <span className="mb-1.5 block text-sm">{tt.ta.rsi}</span>
          <select value={c.rsi} onChange={(e) => set("rsi", e.target.value as Criteria["rsi"])} className={inputStyles}>
            <option value="">{tt.all}</option>
            <option value="os">{tt.ta.rsiOversold}</option>
            <option value="n">{tt.ta.rsiNeutral}</option>
            <option value="ob">{tt.ta.rsiOverbought}</option>
          </select>
        </label>
        <Check label={tt.ta.macdUp} checked={c.macd === "up"} onChange={(v) => set("macd", v ? "up" : "")} />
        <Check label={tt.ta.macdDown} checked={c.macd === "down"} onChange={(v) => set("macd", v ? "down" : "")} />
      </fieldset>
      <fieldset className="space-y-2">
        <legend className="mb-1 text-sm font-medium">{tt.ta.volume}</legend>
        <select
          aria-label={tt.ta.volume}
          value={c.vol ?? ""}
          onChange={(e) => set("vol", num(e.target.value))}
          className={inputStyles}
        >
          <option value="">{tt.all}</option>
          {[1.5, 2, 3].map((x) => (
            <option key={x} value={x}>
              {interpolate(tt.ta.volumeSpike, { x: fmtNumber(x, lang, x % 1 ? 1 : 0) })}
            </option>
          ))}
        </select>
      </fieldset>
      <fieldset className="space-y-2">
        <legend className="mb-1 text-sm font-medium">{tt.ta.levels}</legend>
        <Check label={tt.ta.breakout} checked={c.brk} onChange={(v) => set("brk", v)} />
        <Check label={tt.ta.near52wHigh} checked={c.near} onChange={(v) => set("near", v)} />
      </fieldset>
    </FilterGroup>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
      <div>
        <button
          type="button"
          aria-expanded={panelOpen}
          aria-controls="screen-filters"
          onClick={() => setPanelOpen((o) => !o)}
          className={`${buttonStyles.secondary} w-full lg:hidden`}
        >
          <Filter size={18} /> {tt.showFilters}
          {active > 0 && <span className="rounded-full bg-forest px-2 text-xs text-on-forest">{active}</span>}
        </button>
        <div id="screen-filters" className={`${panelOpen ? "block" : "hidden"} mt-4 space-y-4 lg:mt-0 lg:block`}>
          {commonFilters}
          {(kind === "fundamental" || kind === "screener") && faFilters}
          {(kind === "technical" || kind === "screener") && taFilters}
          <button type="button" onClick={() => setC(emptyCriteria(kind))} disabled={active === 0} className={`${buttonStyles.secondary} w-full`}>
            {tt.reset}
          </button>
        </div>
      </div>

      <div className="min-w-0">
        {Object.keys(presets[kind]).length > 0 && (
          <div className="mb-5">
            <p className="mb-2 text-sm font-medium text-ink-muted">{tt.presets}</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(presets[kind]).map(([key, preset]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setC({ ...emptyCriteria(kind), ...preset })}
                  className="min-h-9 cursor-pointer rounded-full border border-line-strong bg-surface px-3.5 text-sm hover:border-forest hover:text-forest"
                >
                  {presetNames[key]}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p role="status" className="font-semibold">
            {interpolate(tt.results, { count: results.length })}
          </p>
          <SaveScreen kind={kind} query={query} signedIn={signedIn} lang={lang} t={tt} />
        </div>

        <div className="mt-3 overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="tabular w-full min-w-[760px] text-sm">
            <thead className="border-b border-line bg-paper text-ink-muted">
              <tr>
                <SortTh label={t.columns.symbol} k="symbol" c={c} onSort={sortBy} align="left" />
                {columns.map((col) => (
                  <SortTh key={col.key} label={col.label} k={col.key} c={c} onSort={sortBy} />
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {results.map((r) => (
                <tr key={r.symbol} className="hover:bg-forest-soft/50">
                  <th scope="row" className="sticky left-0 bg-surface px-3 py-2 text-left font-normal">
                    <Link href={`/${lang}/market/${r.symbol}`} className="font-semibold text-forest hover:underline">
                      {r.symbol}
                    </Link>
                    <span className="block max-w-[11rem] truncate text-xs text-ink-muted">{t.industries[r.industry]}</span>
                  </th>
                  {columns.map((col) => (
                    <td key={col.key} className="px-3 py-2 text-right">
                      {col.render(r)}
                    </td>
                  ))}
                </tr>
              ))}
              {results.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} className="px-3 py-12 text-center text-ink-muted">
                    {t.common.noResults}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-ink-muted">
          {tt.disclaimer} {dataNote}
        </p>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-lg border border-line bg-surface p-4">
      <h2 className="font-semibold text-forest">{title}</h2>
      {children}
    </section>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex min-h-9 cursor-pointer items-start gap-2.5 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-forest" />
      <span>{label}</span>
    </label>
  );
}

const numInput = `${inputStyles} min-h-10 py-1.5 text-sm`;

function Range({
  label,
  min,
  max,
  t,
  onMin,
  onMax,
}: {
  label: string;
  min?: number;
  max?: number;
  t: { min: string; max: string };
  onMin: (v: string) => void;
  onMax: (v: string) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium">{label}</legend>
      <div className="grid grid-cols-2 gap-2">
        <input type="number" inputMode="decimal" aria-label={`${label} ${t.min}`} placeholder={t.min} value={min ?? ""} onChange={(e) => onMin(e.target.value)} className={numInput} />
        <input type="number" inputMode="decimal" aria-label={`${label} ${t.max}`} placeholder={t.max} value={max ?? ""} onChange={(e) => onMax(e.target.value)} className={numInput} />
      </div>
    </fieldset>
  );
}

function Single({ label, value, onChange }: { label: string; value?: number; onChange: (v: string) => void }) {
  return (
    <label className="grid grid-cols-[1fr_6rem] items-center gap-3 text-sm">
      <span>{label}</span>
      <input type="number" inputMode="decimal" value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={numInput} />
    </label>
  );
}

function SortTh({ label, k, c, onSort, align }: { label: string; k: string; c: Criteria; onSort: (k: string) => void; align?: "left" }) {
  const active = c.sort === k;
  return (
    <th
      scope="col"
      aria-sort={active ? (c.dir === "asc" ? "ascending" : "descending") : "none"}
      className={`px-3 py-2.5 font-medium ${align === "left" ? "text-left" : "text-right"}`}
    >
      <button type="button" onClick={() => onSort(k)} className={`inline-flex cursor-pointer items-center gap-1 hover:text-ink ${active ? "text-ink" : ""}`}>
        {label}
        <ArrowUpDown size={13} className="shrink-0 opacity-60" />
      </button>
    </th>
  );
}

function SaveScreen({ kind, query, signedIn, lang, t }: { kind: ScreenKind; query: string; signedIn: boolean; lang: Locale; t: Dictionary["tools"] }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  if (!signedIn) {
    return (
      <Link href={`/${lang}/login`} className="text-sm font-medium text-link hover:underline">
        {t.loginToSave}
      </Link>
    );
  }
  if (done) return <p role="status" className="text-sm text-forest">{t.saved}</p>;
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="min-h-10 cursor-pointer text-sm font-medium text-link hover:underline">
        {t.saveScreen}
      </button>
    );
  }
  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await saveScreen({ name, kind, query });
          if (res.ok) setDone(true);
        });
      }}
    >
      <label className="sr-only" htmlFor="screen-name">
        {t.screenName}
      </label>
      <input id="screen-name" autoFocus required value={name} onChange={(e) => setName(e.target.value)} placeholder={t.screenName} className={`${numInput} w-44`} />
      <button type="submit" disabled={pending} className={`${buttonStyles.primary} min-h-10 px-4 text-sm`}>
        {t.saveScreen}
      </button>
    </form>
  );
}
