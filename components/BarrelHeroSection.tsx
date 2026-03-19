"use client";

import { useState } from "react";
import BarrelGrid from "./BarrelGrid";

interface BarrelHeroSectionProps {
  fillPercentages: number[];
  totalBarrels: number;
}

export default function BarrelHeroSection({ fillPercentages, totalBarrels }: BarrelHeroSectionProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <section className="barrel-hero-section">
      <div className="barrel-hero-header">
        <h2 className="barrel-hero-title">Oil Barrels</h2>
        <div className="barrel-hero-rule" />
        <button
          className="barrel-hero-toggle"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand barrels" : "Collapse barrels"}
        >
          <span className="barrel-hero-toggle-label">{collapsed ? "Show" : "Hide"}</span>
          <svg
            className={`barrel-hero-chevron${collapsed ? " barrel-hero-chevron--collapsed" : ""}`}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      </div>

      <div className={`barrel-hero-body${collapsed ? " barrel-hero-body--collapsed" : ""}`}>
        <div className="barrel-hero-body-inner">
          <BarrelGrid fillPercentages={fillPercentages} totalBarrels={totalBarrels} />
        </div>
      </div>
    </section>
  );
}
