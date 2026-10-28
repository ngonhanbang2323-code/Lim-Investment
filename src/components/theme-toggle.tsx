"use client";

import { effectiveTheme, setTheme } from "@/lib/theme";
import { Moon, Sun } from "./icons";

// Which icon shows is decided by CSS (.theme-when-*), so server and client markup match.
export function ThemeToggle({ label, className = "" }: { label: string; className?: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => setTheme(effectiveTheme() === "dark" ? "light" : "dark")}
      className={`flex size-11 cursor-pointer items-center justify-center rounded-md text-ink-muted hover:bg-forest-soft hover:text-ink ${className}`}
    >
      <Moon size={19} className="theme-when-light" />
      <Sun size={19} className="theme-when-dark" />
    </button>
  );
}
