"use client";

import { useId } from "react";

interface BarrelProps {
  fillPercent: number;
}

// Cap visual oil at 88% of barrel height so there's always headspace at the top
const MAX_VISUAL_FILL = 0.88;

export default function Barrel({ fillPercent }: BarrelProps) {
  const clampedFill = Math.max(0, Math.min(100, fillPercent));
  const uid = useId().replace(/:/g, "");
  const clipId = `barrel-clip-${uid}`;
  const metalGradId = `metal-grad-${uid}`;
  const oilGradId = `oil-grad-${uid}`;
  const shineGradId = `shine-grad-${uid}`;
  const noiseFilterId = `noise-${uid}`;
  const innerShadowId = `inner-shadow-${uid}`;

  const totalHeight = 739;
  const oilHeight = (clampedFill / 100) * totalHeight * MAX_VISUAL_FILL;
  const oilY = totalHeight - oilHeight;

  return (
    <div className={`barrel-wrapper${clampedFill > 90 ? " high-fill" : ""}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 485 780"
        className="barrel-svg"
      >
        <defs>
          {/* Barrel shape clip */}
          <clipPath id={clipId}>
            <path d="M244 14C189 16 17 11 17 60v586c0 50 100 89 225 89s225-39 225-89V60c0-49-153-44-223-46z" />
          </clipPath>

          {/* Metal body gradient — horizontal for cylindrical feel */}
          <linearGradient id={metalGradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2a2a2a" />
            <stop offset="15%" stopColor="#4a4a4a" />
            <stop offset="50%" stopColor="#3a3a3a" />
            <stop offset="85%" stopColor="#4a4a4a" />
            <stop offset="100%" stopColor="#1a1a1a" />
          </linearGradient>

          {/* Layered oil gradient — deep to surface */}
          <linearGradient id={oilGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3a3a3a" />
            <stop offset="30%" stopColor="#2a2a2a" />
            <stop offset="70%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </linearGradient>

          {/* Surface shine — white fade at oil top */}
          <linearGradient id={shineGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>

          {/* Noise texture filter */}
          <filter id={noiseFilterId} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise" />
            <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise" />
            <feBlend in="SourceGraphic" in2="grayNoise" mode="overlay" />
          </filter>

          {/* Inner shadow filter for barrel depth */}
          <filter id={innerShadowId} x="-10%" y="-10%" width="120%" height="120%">
            <feComponentTransfer in="SourceAlpha">
              <feFuncA type="table" tableValues="1 0" />
            </feComponentTransfer>
            <feGaussianBlur stdDeviation="12" />
            <feOffset dx="0" dy="4" result="shadow" />
            <feFlood floodColor="#000000" floodOpacity="0.5" result="color" />
            <feComposite in="color" in2="shadow" operator="in" result="insetShadow" />
            <feComposite in="SourceGraphic" in2="insetShadow" operator="over" />
          </filter>
        </defs>

        {/* Floor shadow */}
        <ellipse cx="242" cy="755" rx="195" ry="18" fill="#000" fillOpacity="0.6" />

        {/* Barrel body — metallic dark */}
        <path
          fill={`url(#${metalGradId})`}
          stroke="#1a1a1a"
          strokeWidth="3"
          filter={`url(#${innerShadowId})`}
          d="M244 14C189 16 17 11 17 60v586c0 50 100 89 225 89s225-39 225-89V60c0-49-153-44-223-46z"
        />

        {/* Noise texture overlay */}
        <rect
          x="0" y="0" width="485" height="780"
          clipPath={`url(#${clipId})`}
          filter={`url(#${noiseFilterId})`}
          fill="gray"
          opacity="0.04"
          style={{ pointerEvents: "none" }}
        />

        {/* Oil fill + shine — wrapped for oscillation animation */}
        <g className="oil-group">
          <rect
            className="oil-fill"
            x="0"
            y={oilY}
            width="485"
            height={oilHeight}
            fill={`url(#${oilGradId})`}
            clipPath={`url(#${clipId})`}
          />
          {clampedFill > 0 && (
            <rect
              className="oil-shine"
              x="17"
              y={oilY}
              width="451"
              height="30"
              fill={`url(#${shineGradId})`}
              clipPath={`url(#${clipId})`}
              opacity="0.6"
            />
          )}
        </g>

        {/* Barrel band */}
        <path
          fill="none"
          stroke="#333"
          strokeWidth="2"
          d="M17 132v511c0 43 100 78 225 78s225-35 225-78V132"
        />

        {/* Barrel rings */}
        <ellipse cx="242" cy="76"  rx="202" ry="54" fill="none" stroke="#444" strokeWidth="12" />
        <ellipse cx="242" cy="268" rx="202" ry="54" fill="none" stroke="#444" strokeWidth="12" />
        <ellipse cx="242" cy="470" rx="202" ry="54" fill="none" stroke="#444" strokeWidth="12" />
        <ellipse cx="242" cy="664" rx="202" ry="54" fill="none" stroke="#444" strokeWidth="12" />

        {/* Edge highlights for cylindrical depth */}
        <line x1="30" y1="70" x2="30" y2="720" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
        <line x1="455" y1="70" x2="455" y2="720" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
      </svg>
      <p className="barrel-label">{clampedFill}% FULL</p>
    </div>
  );
}
