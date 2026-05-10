// Node-only writer for the indexer's JSON file. Imported only by
// scripts/indexer.cts — never by any server component or Vercel
// function. Keeping fs imports out of the regular `store.ts`
// surface means webpack won't try to bundle Node built-ins for
// the serverless / edge runtimes.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import type { IndexerSnapshot } from "./types";

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

/** Read the latest on-disk snapshot. Indexer-only — server
 *  components should use `loadSnapshot()` from `./store`. */
export function loadSnapshotFromDisk(): IndexerSnapshot {
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
