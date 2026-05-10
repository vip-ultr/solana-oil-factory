"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

const TABS = [
  { key: "claims", label: "Recent claims (47)" },
  { key: "refineries", label: "Refineries (2)" },
  { key: "snapshots", label: "Snapshots (28)" },
  { key: "reputation", label: "Reputation events" },
];

/**
 * Wallet profile tabs. Visual nav only — the page renders the
 * "claims" view by default; production swaps the panel body
 * based on active tab.
 */
export function WalletTabs() {
  const [active, setActive] = useState<string>("claims");
  return (
    <div className="sof-w-tabs" role="tablist" aria-label="Wallet sections">
      {TABS.map((t) => (
        <button
          key={t.key}
          type="button"
          role="tab"
          aria-selected={active === t.key}
          className={cn("sof-w-tab", active === t.key && "on")}
          onClick={() => setActive(t.key)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
