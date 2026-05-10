// Convert IndexedEvent → ActivityEvent (the UI shape consumed by
// the ticker, refinery-detail recent-claims panel, and dashboard
// activity tabs). Lives separately from store.ts so the
// persistence layer stays UI-agnostic.

import type { ActivityEvent } from "@/lib/mock-data";
import { tokenMetaFor, shortPubkey } from "@/lib/onchain/token-registry";
import { loadEvents, queryEvents } from "./store";
import type { EventName, IndexedEvent } from "./types";

/**
 * Build a refinery PDA → token symbol map from every
 * RefineryLaunched event ever seen. The launch event carries
 * both refinery + token_mint, so this is the only event we have
 * to consult; the lookup is then O(1) per UI conversion.
 */
function buildRefinerySymbolMap(allEvents: IndexedEvent[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const e of allEvents) {
    if (e.eventName !== "RefineryLaunched") continue;
    const refinery = e.data.refinery as string;
    const mint = e.data.token_mint as string;
    if (refinery && mint) {
      map.set(refinery, tokenMetaFor(mint).symbol);
    }
  }
  return map;
}

function symbolForRefinery(
  refinery: string | null,
  map: Map<string, string>,
): string | undefined {
  if (!refinery) return undefined;
  return map.get(refinery) ?? shortPubkey(refinery);
}

/**
 * Map an event name to the ActivityEvent.kind enum the UI knows
 * how to label and decorate. Events that don't have a UI label
 * are filtered out by the caller.
 */
function uiKindFor(name: EventName): ActivityEvent["kind"] | null {
  switch (name) {
    case "ClaimMade":
      return "claim";
    case "RefineryDeposit":
      return "topUp";
    case "RefineryPauseToggled":
    case "PlatformPauseToggled":
      return "pause";
    case "EpochAdvanced":
      return "epochAdvanced";
    case "RefineryLaunched":
      return "launched";
    case "SnapshotSubmitted":
      return "snapshotTaken";
    case "RefineryClosed":
      return "closed";
    default:
      // TreasuryInitialized, OperatorWithdraw, AuthorityRotated,
      // VerifiedCtoAssigned — show none in the public ticker for
      // now. Add when there's a clear visual story.
      return null;
  }
}

export interface ActivityFeedOptions {
  refinery?: string;
  wallet?: string;
  eventName?: EventName | EventName[];
  limit?: number;
}

/**
 * Materialise an ordered list of ActivityEvent rows for any of
 * the existing surfaces (home ticker, refinery-detail recent
 * claims, wallet-history). Newest first.
 */
export function buildActivityFeed(
  opts: ActivityFeedOptions = {},
): ActivityEvent[] {
  const allEvents = loadEvents();
  const symbolMap = buildRefinerySymbolMap(allEvents);

  const filtered = queryEvents({
    refinery: opts.refinery,
    wallet: opts.wallet,
    eventName: opts.eventName,
    limit: opts.limit ?? 50,
  });

  const now = Math.floor(Date.now() / 1000);
  const out: ActivityEvent[] = [];
  for (const e of filtered) {
    const kind = uiKindFor(e.eventName);
    if (!kind) continue;

    const refinerySymbol = symbolForRefinery(e.refinery, symbolMap);
    const ago = e.blockTime ? Math.max(0, now - e.blockTime) : 0;

    out.push({
      id: `${e.signature}-${e.logIndex}`,
      kind,
      wallet: e.wallet ? shortPubkey(e.wallet) : "—",
      amount: amountFromEvent(e),
      tokenSymbol: refinerySymbol,
      refinerySymbol,
      detail: detailForEvent(e),
      agoSeconds: ago,
    });
  }
  return out;
}

function amountFromEvent(e: IndexedEvent): number | undefined {
  const raw =
    (e.data.amount_claimed as string | undefined) ??
    (e.data.amount as string | undefined) ??
    (e.data.refund_amount as string | undefined);
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

function detailForEvent(e: IndexedEvent): string | undefined {
  switch (e.eventName) {
    case "RefineryPauseToggled":
      return e.data.now_paused ? "paused" : "unpaused";
    case "PlatformPauseToggled":
      return e.data.now_paused ? "platform paused" : "platform unpaused";
    case "EpochAdvanced":
      return `→ epoch ${e.data.new_epoch}`;
    case "SnapshotSubmitted":
      return `#${e.data.snapshot_index}`;
    case "RefineryClosed":
      return "closed";
    default:
      return undefined;
  }
}
