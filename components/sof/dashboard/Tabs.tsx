"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

const TABS = [
  { key: "operator", label: "Operator", badge: 2 },
  { key: "holder", label: "Holder", badge: 14 },
  { key: "developer", label: "Developer", badge: null as number | null },
];

/**
 * Dashboard tabs. Per the locked design, the page renders all 3
 * sections stacked — clicking a tab is visual only (operator default).
 * Production version will scroll-into-view the corresponding section.
 */
export function DashboardTabs() {
  const [active, setActive] = useState<string>("operator");

  return (
    <nav className="sof-dh-tabs" role="tablist" aria-label="Dashboard sections">
      {TABS.map((t) => (
        <button
          key={t.key}
          type="button"
          role="tab"
          aria-selected={active === t.key}
          className={cn("sof-dh-tab", active === t.key && "on")}
          onClick={() => setActive(t.key)}
        >
          {t.label}
          {t.badge !== null && <span className="badge">{t.badge}</span>}
        </button>
      ))}
    </nav>
  );
}
