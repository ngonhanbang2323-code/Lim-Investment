// Server-safe theme constants, shared by the root layout and the client toggle.
export const THEME_COOKIE = "lim_theme";
export type Theme = "light" | "dark";

export function parseTheme(value: string | undefined): Theme | undefined {
  return value === "light" || value === "dark" ? value : undefined;
}
