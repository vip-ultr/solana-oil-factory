"use client";

import Barrel from "./Barrel";

interface BarrelGridProps {
  fillPercentages: number[];
  totalBarrels: number;
}

export default function BarrelGrid({ fillPercentages, totalBarrels }: BarrelGridProps) {
  if (fillPercentages.length === 0) return null;

  const extraBarrels = totalBarrels > 10 ? totalBarrels - 10 : 0;

  return (
    <div className="barrel-grid">
      {fillPercentages.map((fill, i) => (
        <Barrel key={i} fillPercent={fill} />
      ))}
      {extraBarrels > 0 && (
        <div className="barrel-overflow">
          <span className="barrel-overflow-count">+{extraBarrels}</span>
          <span className="barrel-overflow-label">more barrels</span>
        </div>
      )}
    </div>
  );
}
