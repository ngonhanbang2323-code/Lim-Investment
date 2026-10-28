"use client";

import { useEffect, useRef, useState } from "react";
import {
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  createChart,
  type IChartApi,
  type UTCTimestamp,
} from "lightweight-charts";

type Bar = { time: string; open: number; high: number; low: number; close: number; volume: number };
type Range = "3m" | "6m" | "1y" | "all";
const SESSIONS: Record<Range, number> = { "3m": 63, "6m": 126, "1y": 250, all: Infinity };

import { cssVar, useEffectiveTheme } from "@/lib/theme";

// Read from the design tokens so the canvas follows the light/dark theme.
function chartColors() {
  return { up: cssVar("--tone-up"), down: cssVar("--tone-down"), grid: cssVar("--c-grid"), text: cssVar("--c-ink-muted"), ma: cssVar("--c-lim") };
}

function toTime(day: string) {
  return (Date.parse(day + "T00:00:00Z") / 1000) as UTCTimestamp;
}

export function PriceChart({
  bars,
  rangeLabels,
  label,
  showVolume = true,
  priceDivisor = 1000,
  locale,
}: {
  bars: Bar[];
  rangeLabels: Record<Range, string>;
  label: string;
  showVolume?: boolean;
  priceDivisor?: number;
  locale: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [range, setRange] = useState<Range>("6m");
  const theme = useEffectiveTheme();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const COLORS = chartColors();
    const chart = createChart(el, {
      autoSize: true,
      layout: { background: { color: "transparent" }, textColor: COLORS.text, fontFamily: "inherit", attributionLogo: false },
      grid: { vertLines: { visible: false }, horzLines: { color: COLORS.grid } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
      crosshair: { mode: 0 },
      localization: { locale, priceFormatter: (p: number) => p.toFixed(2) },
    });
    chartRef.current = chart;

    const candles = chart.addSeries(CandlestickSeries, {
      upColor: COLORS.up,
      downColor: COLORS.down,
      wickUpColor: COLORS.up,
      wickDownColor: COLORS.down,
      borderVisible: false,
    });
    candles.setData(
      bars.map((b) => ({
        time: toTime(b.time),
        open: b.open / priceDivisor,
        high: b.high / priceDivisor,
        low: b.low / priceDivisor,
        close: b.close / priceDivisor,
      }))
    );

    // 20-session moving average.
    const ma = chart.addSeries(LineSeries, { color: COLORS.ma, lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
    ma.setData(
      bars.flatMap((b, i) => {
        if (i < 19) return [];
        const avg = bars.slice(i - 19, i + 1).reduce((s, x) => s + x.close, 0) / 20;
        return [{ time: toTime(b.time), value: avg / priceDivisor }];
      })
    );

    if (showVolume) {
      const vol = chart.addSeries(HistogramSeries, { priceScaleId: "vol", priceFormat: { type: "volume" }, lastValueVisible: false, priceLineVisible: false });
      chart.priceScale("vol").applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
      vol.setData(
        bars.map((b, i) => ({
          time: toTime(b.time),
          value: b.volume,
          color: (i && b.close < bars[i - 1].close ? COLORS.down : COLORS.up) + "59", // ~35% alpha
        }))
      );
    }
    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, [bars, showVolume, priceDivisor, locale, theme]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const n = Math.min(SESSIONS[range], bars.length);
    chart.timeScale().setVisibleRange({ from: toTime(bars[bars.length - n].time), to: toTime(bars[bars.length - 1].time) });
  }, [range, bars, theme]);

  return (
    <div>
      <div role="group" aria-label={label} className="mb-3 flex gap-1">
        {(Object.keys(SESSIONS) as Range[]).map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={range === r}
            onClick={() => setRange(r)}
            className="min-h-9 min-w-11 cursor-pointer rounded-md px-2.5 text-sm font-medium text-ink-muted hover:bg-forest-soft aria-pressed:bg-forest aria-pressed:text-on-forest"
          >
            {rangeLabels[r]}
          </button>
        ))}
      </div>
      <div ref={ref} className="h-[360px] w-full sm:h-[420px]" role="img" aria-label={label} />
    </div>
  );
}
