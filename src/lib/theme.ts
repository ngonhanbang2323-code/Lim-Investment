// Light/dark theme. The choice lives in a cookie so the server can render <html data-theme>
// directly (no flash); with no cookie the page follows the OS through prefers-color-scheme.
// Client-side helpers; constants shared with the server live in theme-config.ts.
import { useSyncExternalStore } from "react";
import { THEME_COOKIE, type Theme } from "./theme-config";

/** The theme actually on screen, whether chosen or inherited from the OS. */
export function effectiveTheme(): Theme {
  return getComputedStyle(document.documentElement).colorScheme === "dark" ? "dark" : "light";
}

export function setTheme(theme: Theme) {
  const root = document.documentElement;
  // Switch every colour at once instead of letting hover transitions fade each element separately.
  root.classList.add("theme-switching");
  root.dataset.theme = theme;
  void getComputedStyle(root).color; // apply the new colours while transitions are off
  root.classList.remove("theme-switching");
  document.cookie = `${THEME_COOKIE}=${theme};path=/;max-age=31536000;samesite=lax`;
}

function subscribe(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  media.addEventListener("change", onChange);
  return () => {
    observer.disconnect();
    media.removeEventListener("change", onChange);
  };
}

/** Re-renders when the effective theme changes; "light" during server rendering. */
export function useEffectiveTheme(): Theme {
  return useSyncExternalStore(subscribe, effectiveTheme, () => "light");
}

/** Read a design token (e.g. "--c-forest") from the current theme, for canvas charts. */
export function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
