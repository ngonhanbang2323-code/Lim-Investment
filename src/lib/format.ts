import { intlLocale, type Locale } from "./i18n-config";

const cache = new Map<string, Intl.NumberFormat>();
function nf(locale: Locale, opts: Intl.NumberFormatOptions) {
  const key = locale + JSON.stringify(opts);
  let f = cache.get(key);
  if (!f) cache.set(key, (f = new Intl.NumberFormat(intlLocale[locale], opts)));
  return f;
}

/** Board convention: prices in thousand VND with two decimals (60300 → 60.30). */
export function fmtPrice(vnd: number, locale: Locale) {
  return nf(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(vnd / 1000);
}

export function fmtNumber(value: number, locale: Locale, digits = 0) {
  return nf(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
}

export function fmtSigned(value: number, locale: Locale, digits = 2) {
  const s = fmtNumber(Math.abs(value), locale, digits);
  return value > 0 ? `+${s}` : value < 0 ? `−${s}` : s;
}

export function fmtPct(value: number, locale: Locale, digits = 2, signed = true) {
  return (signed ? fmtSigned(value, locale, digits) : fmtNumber(value, locale, digits)) + "%";
}

/** VND → billions (tỷ), e.g. for market cap and traded value. */
export function fmtBillion(vnd: number, locale: Locale, digits = 0) {
  return fmtNumber(vnd / 1e9, locale, digits);
}

export function fmtVnd(vnd: number, locale: Locale) {
  return fmtNumber(Math.round(vnd), locale) + (locale === "vi" ? " ₫" : " VND");
}

export function fmtVolume(shares: number, locale: Locale) {
  return nf(locale, { notation: "compact", maximumFractionDigits: 1 }).format(shares);
}

export function fmtDate(date: Date | string, locale: Locale, opts: Intl.DateTimeFormatOptions = { dateStyle: "medium" }) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(intlLocale[locale], { timeZone: "Asia/Ho_Chi_Minh", ...opts }).format(d);
}

export type PriceTone = "ceil" | "up" | "ref" | "down" | "floor";

/** Vietnamese price-board colouring relative to reference, ceiling and floor. */
export function priceTone(price: number, reference: number, ceiling?: number, floor?: number): PriceTone {
  if (ceiling != null && price >= ceiling) return "ceil";
  if (floor != null && price <= floor) return "floor";
  if (price > reference) return "up";
  if (price < reference) return "down";
  return "ref";
}

export const toneClass: Record<PriceTone, string> = {
  ceil: "text-tone-ceil",
  up: "text-tone-up",
  ref: "text-tone-ref",
  down: "text-tone-down",
  floor: "text-tone-floor",
};

export function signTone(value: number): PriceTone {
  return value > 0 ? "up" : value < 0 ? "down" : "ref";
}

export function interpolate(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(values[k] ?? ""));
}
