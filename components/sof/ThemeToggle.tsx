"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

const OPTIONS = [
  { key: "light", Icon: Sun, label: "Light" },
  { key: "system", Icon: Monitor, label: "System" },
  { key: "dark", Icon: Moon, label: "Dark" },
] as const;

type ThemeKey = (typeof OPTIONS)[number]["key"];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const active: ThemeKey = mounted
    ? ((theme as ThemeKey | undefined) ?? "system")
    : "system";

  return (
    <div
      className="sof-theme-seg"
      role="radiogroup"
      aria-label="Theme"
      suppressHydrationWarning
    >
      {OPTIONS.map(({ key, Icon, label }) => {
        const on = active === key;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={label}
            title={label}
            className={cn("sof-theme-seg-opt", on && "on")}
            onClick={() => setTheme(key)}
            suppressHydrationWarning
          >
            <Icon size={14} strokeWidth={1.8} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
