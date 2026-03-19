"use client";

import { useState, useEffect } from "react";
import Barrel from "./Barrel";

interface BarrelGridProps {
  fillPercentages: number[];
  totalBarrels: number;
}

const MOBILE_CAP = 10;
const MOBILE_BREAKPOINT = 860;

export default function BarrelGrid({ fillPercentages, totalBarrels }: BarrelGridProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (fillPercentages.length === 0) return null;

  const displayed = isMobile ? fillPercentages.slice(0, MOBILE_CAP) : fillPercentages;
  const extraBarrels = totalBarrels > displayed.length ? totalBarrels - displayed.length : 0;
  const lastIndex = displayed.length - 1;

  return (
    <div className="barrel-grid">
      {displayed.map((fill, i) => {
        if (i === lastIndex && extraBarrels > 0) {
          return (
            <div key={i} className="barrel-last-slot">
              <Barrel fillPercent={fill} hideGauge />
              <div className="barrel-overflow-overlay">
                <div className="barrel-overflow-icon" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <span className="barrel-overflow-count">+{extraBarrels + 1}</span>
                <div className="barrel-overflow-divider" />
                <span className="barrel-overflow-label">more barrels</span>
              </div>
            </div>
          );
        }
        return <Barrel key={i} fillPercent={fill} />;
      })}
    </div>
  );
}
