"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

const TABS = ["Operators", "Holders", "Tokens", "All-time distributed"];
const PERIODS = ["24H", "7D", "30D", "ALL"];
const FILTERS = ["All", "Verified only", "CTO only"];

/**
 * Leaderboard tabs + toolbar (segmented period + verification
 * filter). Visual nav only — production version drives the table
 * data fetch off these controls.
 */
export function LeaderboardControls() {
  const [tab, setTab] = useState("Operators");
  const [period, setPeriod] = useState("7D");
  const [filter, setFilter] = useState("All");

  return (
    <>
      <nav className="sof-lb-tabs" role="tablist" aria-label="Leaderboard kind">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            className={cn("sof-lb-tab", tab === t && "on")}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </nav>

      <div className="sof-lb-toolbar">
        <div className="seg" role="radiogroup" aria-label="Time period">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              className={cn(period === p && "on")}
              onClick={() => setPeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="seg" role="radiogroup" aria-label="Verification filter">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              className={cn(filter === f && "on")}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="meta">Last updated 2 min ago · 1,047 operators ranked</span>
      </div>
    </>
  );
}
