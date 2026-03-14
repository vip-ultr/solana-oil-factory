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
  const gradId = `oil-grad-${uid}`;

  const totalHeight = 739;
  const oilHeight = (clampedFill / 100) * totalHeight * MAX_VISUAL_FILL;
  const oilY = totalHeight - oilHeight;

  return (
    <div className="barrel-wrapper">
      {/* viewBox gives the SVG its intrinsic 485:780 ratio — width:100% height:auto sizes all barrels identically */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 485 780"
        className="barrel-svg"
      >
        <defs>
          <clipPath id={clipId}>
            <path d="M244 14C189 16 17 11 17 60v586c0 50 100 89 225 89s225-39 225-89V60c0-49-153-44-223-46z" />
          </clipPath>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>
        </defs>

        {/* Floor shadow */}
        <ellipse cx="242" cy="755" rx="195" ry="18" fill="#000" fillOpacity="0.6" />

        {/* Barrel body — red */}
        <path
          fill="#c0392b"
          stroke="#7b241c"
          strokeWidth="3"
          d="M244 14C189 16 17 11 17 60v586c0 50 100 89 225 89s225-39 225-89V60c0-49-153-44-223-46z"
        />

        {/* Oil fill — clipped to barrel shape */}
        <rect
          x="0"
          y={oilY}
          width="485"
          height={oilHeight}
          fill={`url(#${gradId})`}
          clipPath={`url(#${clipId})`}
        />

        {/* Barrel band */}
        <path
          fill="none"
          stroke="#7b241c"
          strokeWidth="2"
          d="M17 132v511c0 43 100 78 225 78s225-35 225-78V132"
        />

        {/* Barrel rings */}
        <ellipse cx="242" cy="76"  rx="202" ry="54" fill="none" stroke="#7b241c" strokeWidth="14" />
        <ellipse cx="242" cy="268" rx="202" ry="54" fill="none" stroke="#7b241c" strokeWidth="14" />
        <ellipse cx="242" cy="470" rx="202" ry="54" fill="none" stroke="#7b241c" strokeWidth="14" />
        <ellipse cx="242" cy="664" rx="202" ry="54" fill="none" stroke="#7b241c" strokeWidth="14" />
      </svg>
      <p className="barrel-label">{clampedFill}% FULL</p>
    </div>
  );
}
