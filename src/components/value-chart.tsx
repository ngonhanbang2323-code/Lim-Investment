"use client";

import { useEffect, useRef } from "react";
import { AreaSeries, createChart, type UTCTimestamp } from "lightweight-charts";
import { cssVar, useEffectiveTheme } from "@/lib/theme";

/** Area chart for a value series such as NAV. Values are plotted in billions of VND. */
export function ValueChart({ points, label, locale }: { points: { time: string; value: number }[]; label: string; locale: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const theme = useEffectiveTheme();

  useEffect(() => {
    if (!ref.current || points.length === 0) return;
    const line = cssVar("--c-forest");
    const chart = createChart(ref.current, {
      autoSize: true,
      layout: { background: { color: "transparent" }, textColor: cssVar("--c-ink-muted"), fontFamily: "inherit", attributionLogo: false },
      grid: { vertLines: { visible: false }, horzLines: { color: cssVar("--c-grid") } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
      handleScroll: false,
      handleScale: false,
      localization: { locale, priceFormatter: (p: number) => p.toFixed(2) },
    });
    const series = chart.addSeries(AreaSeries, {
      lineColor: line,
      topColor: line + "38", // ~22% alpha
      bottomColor: line + "00",
      lineWidth: 2,
    });
    series.setData(points.map((p) => ({ time: (Date.parse(p.time) / 1000) as UTCTimestamp, value: p.value / 1e9 })));
    chart.timeScale().fitContent();
    return () => chart.remove();
  }, [points, locale, theme]);

  return <div ref={ref} role="img" aria-label={label} className="h-72 w-full" />;
}
