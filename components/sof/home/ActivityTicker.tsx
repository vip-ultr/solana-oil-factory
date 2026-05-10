import { ExternalLink } from "lucide-react";
import { WalletPill } from "@/components/sof/primitives";
import { formatTokens, formatRelativeTime } from "@/lib/mock-data";
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

interface Props {
  /** Events to scroll through. Empty (default) renders an
   *  "indexer pending" placeholder instead of fake activity —
   *  the live ticker needs an off-chain log indexer that v1
   *  doesn't ship with. */
  events?: ActivityEvent[];
}

export function ActivityTicker({ events = [] }: Props) {
  if (events.length === 0) {
    return (
      <div className="sof-ticker" aria-label="Live activity feed (empty)">
        <div className="sof-ticker-label">
          <span className="live" aria-hidden="true" />
          <span>LIVE · ACTIVITY</span>
        </div>
        <div className="sof-ticker-viewport">
          <div
            className="sof-ticker-track"
            style={{
              padding: "0 18px",
              color: "var(--text-tertiary)",
              fontSize: 12.5,
            }}
          >
            Live activity feed lights up once the off-chain log
            indexer is wired (v1.1). Refinery state is already
            on-chain — see the directory for live pools.
          </div>
        </div>
      </div>
    );
  }

  // Doubled for seamless loop.
  const doubled = [...events, ...events];
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
