// Convert IndexedEvent → ActivityEvent (the UI shape consumed by
// the ticker, refinery-detail recent-claims panel, and dashboard
// activity tabs). Phase 2b: all functions are async.

import type { ActivityEvent } from "@/lib/mock-data";
import { tokenMetaFor, shortPubkey } from "@/lib/onchain/token-registry";
import { loadEvents, queryEvents } from "./store";
import type { EventName, IndexedEvent } from "./types";

/**
 * Build a refinery PDA → token symbol map from every
 * RefineryLaunched event ever seen.
 */
async function buildRefinerySymbolMap(): Promise<Map<string, string>> {
  const launches = await loadEvents({ eventName: "RefineryLaunched" });
  const map = new Map<string, string>();
  for (const e of launches) {
    const refinery = e.data.refinery as string;
    const mint     = e.data.token_mint as string;
    if (refinery && mint) map.set(refinery, tokenMetaFor(mint).symbol);
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

function uiKindFor(name: EventName): ActivityEvent["kind"] | null {
  switch (name) {
    case "ClaimMade":             return "claim";
    case "RefineryDeposit":       return "topUp";
    case "RefineryPauseToggled":
    case "PlatformPauseToggled":  return "pause";
    case "EpochAdvanced":         return "epochAdvanced";
    case "RefineryLaunched":      return "launched";
    case "SnapshotSubmitted":     return "snapshotTaken";
    case "RefineryClosed":        return "closed";
    default:                      return null;
  }
}

export interface ActivityFeedOptions {
  refinery?:  string;
  wallet?:    string;
  eventName?: EventName | EventName[];
  limit?:     number;
}

export async function buildActivityFeed(
  opts: ActivityFeedOptions = {},
): Promise<ActivityEvent[]> {
  const [symbolMap, filtered] = await Promise.all([
    buildRefinerySymbolMap(),
    queryEvents({
      refinery:  opts.refinery,
      wallet:    opts.wallet,
      eventName: opts.eventName,
      limit:     opts.limit ?? 50,
    }),
  ]);

  const now = Math.floor(Date.now() / 1000);
  const out: ActivityEvent[] = [];
  for (const e of filtered) {
    const kind = uiKindFor(e.eventName);
    if (!kind) continue;

    out.push({
      id:            `${e.signature}-${e.logIndex}`,
      kind,
      wallet:        e.wallet ? shortPubkey(e.wallet) : "—",
      amount:        amountFromEvent(e),
      tokenSymbol:   symbolForRefinery(e.refinery, symbolMap),
      refinerySymbol: symbolForRefinery(e.refinery, symbolMap),
      detail:        detailForEvent(e),
      agoSeconds:    e.blockTime ? Math.max(0, now - e.blockTime) : 0,
    });
  }
  return out;
}

function amountFromEvent(e: IndexedEvent): number | undefined {
  const raw =
    (e.data.amount_claimed as string | undefined) ??
    (e.data.amount         as string | undefined) ??
    (e.data.refund_amount  as string | undefined);
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

function detailForEvent(e: IndexedEvent): string | undefined {
  switch (e.eventName) {
    case "RefineryPauseToggled":
    case "PlatformPauseToggled":
      return e.data.now_paused ? "paused" : "unpaused";
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
