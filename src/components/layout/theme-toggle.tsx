"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

type ThemeToggleProps = {
  lightOnDark?: boolean;
};

export function ThemeToggle({ lightOnDark = false }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const base = lightOnDark
    ? "inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/35 text-white transition hover:border-white hover:bg-white/10"
    : "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition hover:border-accent hover:text-accent";

  if (!mounted) {
    return <span className={base} aria-hidden />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={base}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5Z" />
        </svg>
      )}
    </button>
  );
}
