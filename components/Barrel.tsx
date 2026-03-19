"use client";

import React from "react";
import Image from "next/image";

interface BarrelProps {
  fillPercent: number;
  hideGauge?: boolean;
}

const Barrel = React.memo(function Barrel({ fillPercent, hideGauge = false }: BarrelProps) {
  const clampedFill = Math.max(0, Math.min(100, fillPercent));
  const isHighFill = clampedFill > 90;

  return (
    <div className={`barrel-wrapper${isHighFill ? " high-fill" : ""}`}>
      <div className="barrel-visual">
        <Image
          src="/assets/barrel.png"
          alt="Oil barrel"
          width={485}
          height={780}
          className="barrel-img"
          priority
        />

        {/* Oil level gauge — right side */}
        {!hideGauge && (
          <div className="barrel-gauge">
            <div className="barrel-gauge-track">
              <span className="barrel-gauge-tick" style={{ bottom: "25%" }} />
              <span className="barrel-gauge-tick" style={{ bottom: "50%" }} />
              <span className="barrel-gauge-tick" style={{ bottom: "75%" }} />
              <div
                className={`barrel-gauge-fill${isHighFill ? " barrel-gauge-high" : ""}`}
                style={{ height: `${clampedFill}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <p className="barrel-label">
        <span className="barrel-label-value">{clampedFill}%</span> FULL
      </p>
    </div>
  );
});

export default Barrel;
