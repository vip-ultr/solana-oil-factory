"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const TABS = ["Operators", "$CRUDE earners"] as const;
type Tab = (typeof TABS)[number];

interface Props {
  operatorsView: ReactNode;
  crudeView: ReactNode;
}

/**
 * Client-side tab switcher that swaps between the operators
 * leaderboard (podium + ranked table) and the $CRUDE earners
 * leaderboard. Both rankings live on /leaderboard — the user
 * picks which board to look at without leaving the page.
 */
export function LeaderboardSwitcher({ operatorsView, crudeView }: Props) {
  const [tab, setTab] = useState<Tab>("Operators");

  return (
    <>
      <nav
        className="sof-lb-tabs"
        role="tablist"
        aria-label="Leaderboard kind"
      >
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

      {tab === "Operators" ? operatorsView : crudeView}
    </>
  );
}
