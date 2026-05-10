// JSON-file persistence for the indexer.
//
// Phase 2a is intentionally minimalist — events live in a single
// committed JSON file at lib/indexer/events.json. The indexer
// script (run-once or loop) updates the file, the user commits +
// pushes, the next Vercel deploy ships the data with the build.
// Frontend reads via `loadEvents()` from server components.
//
// Phase 2b will swap this for Supabase / Postgres without
// changing the consumer signatures.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import type { IndexedEvent, IndexerCursor, IndexerSnapshot } from "./types";

const DATA_PATH = join(process.cwd(), "lib", "indexer", "events.json");

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
  if (!existsSync(DATA_PATH)) return structuredClone(EMPTY);
  try {
    const raw = readFileSync(DATA_PATH, "utf8");
    return JSON.parse(raw) as IndexerSnapshot;
  } catch {
    return structuredClone(EMPTY);
  }
}

export function saveSnapshot(snapshot: IndexerSnapshot): void {
  if (!existsSync(dirname(DATA_PATH))) {
    mkdirSync(dirname(DATA_PATH), { recursive: true });
  }
  writeFileSync(
    DATA_PATH,
    JSON.stringify(snapshot, null, 2) + "\n",
    "utf8",
  );
}

/**
 * Read-side helpers for server components.
 *
 * The frontend uses these at request time. The file is bundled
 * into the Next.js server build so reads don't hit a network or
 * any filesystem outside the deploy artifact.
 */
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
