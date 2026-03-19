"use client";

import Barrel from "./Barrel";

interface BarrelGridProps {
  fillPercentages: number[];
  totalBarrels: number;
}

export default function BarrelGrid({ fillPercentages, totalBarrels }: BarrelGridProps) {
  if (fillPercentages.length === 0) return null;

  const extraBarrels = totalBarrels > 10 ? totalBarrels - 10 : 0;
  const lastIndex = fillPercentages.length - 1;

  return (
    <div className="barrel-grid">
      {fillPercentages.map((fill, i) => {
        if (i === lastIndex && extraBarrels > 0) {
          return (
            <div key={i} className="barrel-last-slot">
              <Barrel fillPercent={fill} />
              <div className="barrel-overflow-overlay">
                <span className="barrel-overflow-count">+{extraBarrels}</span>
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
