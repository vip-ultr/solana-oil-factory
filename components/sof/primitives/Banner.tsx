"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "amber" | "red";

interface Props {
  tone: Tone;
  children: ReactNode;
  /** Optional inline link (use this instead of nesting an <a>). */
  link?: { label: string; href: string };
  /** When true, shows an X dismiss button that hides the banner for this session. */
  dismissible?: boolean;
  /** Custom storage key for per-session dismissal. */
  storageKey?: string;
}

export function Banner({ tone, children, link, dismissible, storageKey }: Props) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;

  return (
    <div
      className={cn("sof-banner", tone)}
      role={tone === "red" ? "alert" : "status"}
      aria-live={tone === "red" ? "assertive" : "polite"}
    >
      <span className="dot" aria-hidden="true" />
      <span>{children}</span>
      <span className="spacer" />
      {link && (
        <a className="link" href={link.href}>
          {link.label}
        </a>
      )}
      {dismissible && (
        <button
          type="button"
          className="x"
          aria-label="Dismiss notice"
          onClick={() => {
            setHidden(true);
            if (storageKey) {
              try {
                sessionStorage.setItem(storageKey, "dismissed");
              } catch {
                /* ignored */
              }
            }
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

/** Pre-wired service-degraded banner using mock indexer-lag stats. */
export function ServiceDegradedBanner({ lagSeconds }: { lagSeconds: number }) {
  if (lagSeconds < 5 * 60) return null;
  return (
    <Banner tone="amber" dismissible storageKey="sof-banner-degraded" link={{ label: "Details →", href: "/trust" }}>
      Some data may be delayed. Indexer is{" "}
      <strong className="font-mono" style={{ fontWeight: 500 }}>
        {Math.round(lagSeconds / 60)}m
      </strong>{" "}
      behind chain.
    </Banner>
  );
}

/** Persistent red banner for wrong-network state. */
export function WrongNetworkBanner({ onSwitch }: { onSwitch?: () => void }) {
  return (
    <div className="sof-banner red" role="alert" aria-live="assertive">
      <span className="dot" aria-hidden="true" />
      <span>
        Wrong network. Switch your wallet to <strong>Solana Devnet</strong> to continue.
      </span>
      <span className="spacer" />
      {onSwitch && (
        <button type="button" className="link" onClick={onSwitch}>
          Switch network
        </button>
      )}
    </div>
  );
}

/** Platform-wide pause banner — shown when treasury_config.paused is true. */
export function PlatformPauseBanner({ message }: { message?: string }) {
  return (
    <div className="sof-banner red" role="alert" aria-live="assertive">
      <span className="dot" aria-hidden="true" />
      <span>
        <strong>Solana Oil Factory is temporarily paused.</strong>{" "}
        {message ?? "Claims and launches are unavailable."}
      </span>
      <span className="spacer" />
      <a className="link" href="/trust">
        Read the announcement →
      </a>
    </div>
  );
}
