import { ExternalLink } from "lucide-react";
import { WalletPill } from "@/components/sof/primitives";
import { MOCK_ACTIVITY, formatTokens, formatRelativeTime } from "@/lib/mock-data";
import type { ActivityEvent } from "@/lib/mock-data";

function verbFor(kind: ActivityEvent["kind"]): string {
  switch (kind) {
    case "claim":
      return "claimed";
    case "claimFiltered":
      return "claim filtered";
    case "topUp":
      return "topped up";
    case "pause":
      return "paused refinery";
    case "windowExtended":
      return "window extended";
    case "launched":
      return "launched";
    case "snapshotTaken":
      return "snapshot";
    case "epochAdvanced":
      return "epoch advanced";
    case "closed":
      return "closed refinery";
  }
}

function Row({ event }: { event: ActivityEvent }) {
  return (
    <div className="sof-tk-row">
      <WalletPill address={event.wallet} />
      <span className="verb">{verbFor(event.kind)}</span>
      {event.amount !== undefined && (
        <span className="amt">{formatTokens(event.amount)}</span>
      )}
      {(event.tokenSymbol || event.refinerySymbol) && (
        <span className="tok">{event.tokenSymbol ?? event.refinerySymbol}</span>
      )}
      {event.detail && (
        <span className="ago">· {event.detail}</span>
      )}
      <span className="ago">· {formatRelativeTime(event.agoSeconds)}</span>
      <ExternalLink
        size={11}
        strokeWidth={1.8}
        style={{ color: "var(--text-tertiary)" }}
        aria-hidden="true"
      />
    </div>
  );
}

export function ActivityTicker() {
  // Doubled for seamless loop.
  const doubled = [...MOCK_ACTIVITY, ...MOCK_ACTIVITY];
  return (
    <div className="sof-ticker" aria-label="Live activity feed">
      <div className="sof-ticker-label">
        <span className="live" aria-hidden="true" />
        <span>LIVE · ACTIVITY</span>
      </div>
      <div className="sof-ticker-viewport">
        <div className="sof-ticker-track">
          {doubled.map((e, i) => (
            <Row key={`${e.id}-${i}`} event={e} />
          ))}
        </div>
      </div>
    </div>
  );
}
