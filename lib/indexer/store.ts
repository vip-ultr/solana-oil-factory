// Read-side persistence for the indexer.
//
// Phase 2a is intentionally minimalist — events live in a single
// committed JSON file at lib/indexer/events.json. The indexer
// script (run-once or loop) updates the file via fs writes; the
// frontend reads the bundled JSON import below — webpack inlines
// it into the Vercel deploy artifact, which works in every
// runtime including edge + serverless. Direct fs reads in serverless
// don't see non-code files, hence this split.
//
// The writer lives in `store.node.ts` and is only imported by
// `scripts/indexer.cts`. Phase 2b will swap both for a real DB.

import type { IndexedEvent, IndexerSnapshot } from "./types";
import bundled from "./events.json";

const EMPTY: IndexerSnapshot = {
  cursor: {
    programId: "2tPLLPQeLLNL4UDBbeagSUAABJcB3fHGTJaLGEzrx3rE",
    lastSignature: null,
    lastSlot: null,
    updatedAt: new Date(0).toISOString(),
  },
  events: [],
};

export function loadSnapshot(): IndexerSnapshot {
  return (bundled as unknown as IndexerSnapshot) ?? structuredClone(EMPTY);
}

export function loadEvents(): IndexedEvent[] {
  return loadSnapshot().events;
}

export interface EventQuery {
  refinery?: string;
  wallet?: string;
  eventName?: string | string[];
  limit?: number;
}

export function queryEvents(q: EventQuery = {}): IndexedEvent[] {
  const all = loadEvents();
  const limit = q.limit ?? 50;
  const names = Array.isArray(q.eventName)
    ? new Set(q.eventName)
    : q.eventName
      ? new Set([q.eventName])
      : null;

  let filtered = all;
  if (q.refinery) filtered = filtered.filter((e) => e.refinery === q.refinery);
  if (q.wallet) filtered = filtered.filter((e) => e.wallet === q.wallet);
  if (names) filtered = filtered.filter((e) => names.has(e.eventName));

  // Newest-first by slot then logIndex.
  filtered = [...filtered].sort((a, b) => {
    if (b.slot !== a.slot) return b.slot - a.slot;
    return b.logIndex - a.logIndex;
  });

  return filtered.slice(0, limit);
}
