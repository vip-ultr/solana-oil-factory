"use client";

import { useState } from "react";
import { ArrowRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Refinery } from "@/lib/mock-data";
import { formatTokens } from "@/lib/mock-data";

type DemoState = "a" | "b" | "c" | "d" | "e" | "f" | "p";

const STATE_ORDER: { key: DemoState; label: string }[] = [
  { key: "b", label: "B Eligible" },
  { key: "a", label: "A Disconnected" },
  { key: "c", label: "C Claimed" },
  { key: "d", label: "D Not eligible" },
  { key: "e", label: "E Proof unavailable" },
  { key: "f", label: "F Frozen" },
  { key: "p", label: "Pending snapshot" },
];

interface Props {
  refinery: Refinery;
  /** Demo helper: pre-set the state shown. Default "b". */
  initialState?: DemoState;
}

/**
 * Right-rail eligibility panel — the most visited surface on the
 * single refinery page. Renders 7 distinct states (A-F + P) per the
 * locked design. State is picked at the top via a small dev picker
 * that mirrors the HTML mockup; in production this picker is hidden
 * and state is derived from wallet + indexer.
 */
export function EligibilityPanel({ refinery, initialState = "b" }: Props) {
  const [state, setState] = useState<DemoState>(initialState);

  return (
    <div className="sof-rd-panel">
      <div className="sof-rd-state-picker" role="tablist" aria-label="Eligibility state demo">
        <span className="lab">DEMO STATES</span>
        {STATE_ORDER.map((s) => (
          <button
            key={s.key}
            type="button"
            role="tab"
            aria-selected={state === s.key}
            className={cn(state === s.key && "on")}
            onClick={() => setState(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>
      {renderState(state, refinery)}
    </div>
  );
}

function renderState(state: DemoState, r: Refinery) {
  switch (state) {
    case "a":
      return <StateA />;
    case "b":
      return <StateB r={r} />;
    case "c":
      return <StateC r={r} />;
    case "d":
      return <StateD r={r} />;
    case "e":
      return <StateE r={r} />;
    case "f":
      return <StateF r={r} />;
    case "p":
      return <StateP />;
  }
}

function StateA() {
  return (
    <div className="sof-rd-elig ng">
      <div className="label">
        <span className="dot" aria-hidden="true" />
        Eligibility check
      </div>
      <h4>Connect wallet to check claim</h4>
      <p>
        Eligibility is auto-detected from your on-chain balance at the most
        recent snapshot. No registration required.
      </p>
      <button type="button" className="cta">
        Connect wallet <ArrowRight size={14} />
      </button>
      <div className="footnote">
        We never ask you to sign a transaction at connect — only a free
        signature challenge.{" "}
        <a className="sof-rd-ext" style={{ color: "var(--accent)" }}>
          Why? <ExternalLink size={10} />
        </a>
      </div>
    </div>
  );
}

function StateB({ r }: { r: Refinery }) {
  // Mock snapshot index — derived from holders-claimed for stability
  // until the indexer wires in real snapshot data.
  const snapshotIndex = Math.max(1, Math.ceil(r.holdersClaimed / 350));
  return (
    <div className="sof-rd-elig ok">
      <div className="label">
        <span className="dot" aria-hidden="true" />
        You&apos;re eligible · Snapshot #{snapshotIndex}
      </div>
      <h4>Claim 148.8 {r.tokenSymbol}</h4>
      <p>
        Your wallet held {r.tokenSymbol} at the most recent snapshot, taken
        2 hours ago. Proof is ready.
      </p>
      <div className="kvg">
        <div>
          <span className="k">Snapshot</span>
          <span className="v">#{snapshotIndex} · 2h ago</span>
        </div>
        <div>
          <span className="k">Your balance</span>
          <span className="v">12,400 {r.tokenSymbol}</span>
        </div>
        <div>
          <span className="k">Pool share</span>
          <span className="v">
            0.99% <span style={{ color: "var(--text-tertiary)" }}>(cap: 5%)</span>
          </span>
        </div>
        <div>
          <span className="k">Network fee</span>
          <span className="v">~0.001 SOL</span>
        </div>
        <div>
          <span className="k">Claim fee</span>
          <span className="v">0.001 SOL</span>
        </div>
      </div>
      <div className="receive">
        <span className="k">You&apos;ll receive</span>
        <span className="v">148.8 {r.tokenSymbol}</span>
      </div>
      <button type="button" className="cta">
        Sign &amp; claim <ArrowRight size={14} />
      </button>
      <div className="footnote">
        Auto-detected from on-chain balance. One transaction, no approval.
        Reputation +ΔS on success.
      </div>
    </div>
  );
}

function StateC({ r }: { r: Refinery }) {
  return (
    <div className="sof-rd-elig ok">
      <div className="label">
        <span className="dot" aria-hidden="true" />
        Already claimed
      </div>
      <h4>You claimed 148.8 {r.tokenSymbol}</h4>
      <p>Claimed from snapshot #7 on May 9 at 14:32 UTC.</p>
      <div className="kvg">
        <div>
          <span className="k">Snapshot</span>
          <span className="v">#7</span>
        </div>
        <div>
          <span className="k">Amount</span>
          <span className="v">148.8 {r.tokenSymbol}</span>
        </div>
        <div>
          <span className="k">Reputation gained</span>
          <span className="v" style={{ color: "var(--success)" }}>
            +0.4
          </span>
        </div>
      </div>
      <a className="tx-link">
        View transaction · 4xK2…3hPq <ExternalLink size={11} />
      </a>
      <div className="footnote" style={{ marginTop: 18 }}>
        Next snapshot in{" "}
        <strong style={{ color: "var(--text-secondary)" }}>~50 min</strong>.
        Hold your {r.tokenSymbol} to remain eligible for the next cycle.
      </div>
    </div>
  );
}

function StateD({ r }: { r: Refinery }) {
  return (
    <div className="sof-rd-elig ng">
      <div className="label">
        <span className="dot" aria-hidden="true" />
        Not eligible · Snapshot #7
      </div>
      <h4>Your wallet doesn&apos;t hold {r.tokenSymbol}</h4>
      <p>
        You weren&apos;t holding {r.tokenSymbol} at snapshot #7 (taken 2h
        ago). Buy {r.tokenSymbol} and hold until the next snapshot to qualify
        for the next cycle.
      </p>
      <div className="kvg">
        <div>
          <span className="k">Next snapshot</span>
          <span className="v">in ~50 min</span>
        </div>
        <div>
          <span className="k">Cadence</span>
          <span className="v">Hourly</span>
        </div>
        <div>
          <span className="k">Min balance to qualify</span>
          <span className="v">Any &gt; 0</span>
        </div>
      </div>
      <button type="button" className="cta outline">
        Buy {r.tokenSymbol} on Jupiter <ArrowRight size={14} />
      </button>
      <div className="footnote">
        Refineries are open to anyone holding the underlying token. No
        allowlist, no application.
      </div>
    </div>
  );
}

function StateE({ r }: { r: Refinery }) {
  return (
    <div className="sof-rd-elig warn">
      <div className="label">
        <span className="dot" aria-hidden="true" />
        Eligible · proof unavailable
      </div>
      <h4>You appear eligible</h4>
      <p>
        Your wallet holds 12,400 {r.tokenSymbol} at the most recent snapshot.
        The claim service is temporarily unable to compute your merkle proof.
      </p>
      <div className="kvg">
        <div>
          <span className="k">Snapshot</span>
          <span className="v">#7</span>
        </div>
        <div>
          <span className="k">Your balance</span>
          <span className="v">
            {formatTokens(12_400)} {r.tokenSymbol}
          </span>
        </div>
        <div>
          <span className="k">Service</span>
          <span className="v" style={{ color: "var(--warning)" }}>
            Auto-retrying
          </span>
        </div>
      </div>
      <button type="button" className="cta outline">
        Refresh status <ArrowRight size={14} />
      </button>
      <div className="footnote">
        We&apos;ll automatically attempt your claim when service is restored.
        You can leave this page open or come back later.
      </div>
    </div>
  );
}

function StateF({ r }: { r: Refinery }) {
  return (
    <div className="sof-rd-elig err">
      <div className="label">
        <span className="dot" aria-hidden="true" />
        Account frozen
      </div>
      <h4>Your {r.tokenSymbol} token account is frozen</h4>
      <p>
        The freeze authority has frozen your token account. This is a
        token-level action by the {r.tokenName} team — contact them about
        thawing. You can still claim from this refinery once your account is
        unfrozen.
      </p>
      <div className="kvg">
        <div>
          <span className="k">Frozen by</span>
          <span className="v">Token freeze authority</span>
        </div>
        <div>
          <span className="k">Detected</span>
          <span className="v">Snapshot #6</span>
        </div>
      </div>
      <button type="button" className="cta outline">
        Read about freeze authority <ArrowRight size={14} />
      </button>
      <div className="footnote">
        Solana Oil Factory has no ability to thaw token accounts. This is a
        property of the token itself.
      </div>
    </div>
  );
}

function StateP() {
  return (
    <div className="sof-rd-elig warn">
      <div className="label">
        <span className="dot" aria-hidden="true" />
        Refinery active
      </div>
      <h4>Awaiting first snapshot</h4>
      <p>
        This refinery launched 3 minutes ago. The first snapshot is being
        computed — claims open as soon as it&apos;s ready (~1 more minute).
      </p>
      <div className="kvg">
        <div>
          <span className="k">Status</span>
          <span className="v" style={{ color: "var(--warning)" }}>
            Snapshot in progress
          </span>
        </div>
        <div>
          <span className="k">Claim window opens</span>
          <span className="v">~1 min</span>
        </div>
        <div>
          <span className="k">Cadence after</span>
          <span className="v">Hourly</span>
        </div>
      </div>
      <button type="button" className="cta outline" disabled>
        Snapshot in progress…
      </button>
      <div className="footnote">
        This panel auto-refreshes every 30s. You&apos;ll be notified when
        claims open.
      </div>
    </div>
  );
}
