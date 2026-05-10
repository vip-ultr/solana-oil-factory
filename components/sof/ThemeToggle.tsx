"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted ? resolvedTheme === "dark" : true;
  const next = isDark ? "light" : "dark";
  const label = mounted ? (isDark ? "Dark" : "Light") : "Theme";

  return (
    <button
      type="button"
      className="sof-theme-toggle"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} theme`}
      suppressHydrationWarning
    >
      {isDark ? <Moon strokeWidth={1.6} /> : <Sun strokeWidth={1.6} />}
      <span suppressHydrationWarning>{label}</span>
    </button>
  );
}

/** Persistent FAB in the top-right corner. T key also toggles. */
export function ThemeFab() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "t" && e.key !== "T") return;
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const tag = t.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || t.isContentEditable) return;
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
    }
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [resolvedTheme, setTheme]);

  const isDark = mounted ? resolvedTheme === "dark" : true;
  const label = mounted ? (isDark ? "Dark" : "Light") : "Theme";

  return (
    <button
      type="button"
      className="sof-theme-fab"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      suppressHydrationWarning
    >
      {isDark ? <Moon strokeWidth={1.6} /> : <Sun strokeWidth={1.6} />}
      <span suppressHydrationWarning>{label}</span>
      <span className="kbd">T</span>
    </button>
  );
}
