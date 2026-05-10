// Refinery program indexer — Phase 2a.
//
// Walks getSignaturesForAddress(PROGRAM_ID), pulls every tx that
// hasn't been indexed yet, parses anchor `emit!` events from the
// log stream, and writes them to lib/indexer/events.json. Idempotent
// — re-runs only fetch new signatures past the cursor.
//
// Usage:
//   pnpm indexer            # run-once, exits when caught up
//   pnpm indexer -- --loop  # poll forever, sleeping between runs

import { Connection, PublicKey } from "@solana/web3.js";
import {
  loadSnapshotFromDisk as loadSnapshot,
  saveSnapshot,
} from "../lib/indexer/store.node";
import { decodeTransactionEvents } from "../lib/indexer/decoder";
import type { IndexedEvent } from "../lib/indexer/types";

const PROGRAM_ID_STR =
  process.env.NEXT_PUBLIC_REFINERY_PROGRAM_ID ??
  "2tPLLPQeLLNL4UDBbeagSUAABJcB3fHGTJaLGEzrx3rE";
const PROGRAM_ID = new PublicKey(PROGRAM_ID_STR);

const RPC =
  process.env.SOLANA_RPC_URL ??
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ??
  "https://api.devnet.solana.com";

const POLL_INTERVAL_MS = 10_000;
/** Per-page size for getSignaturesForAddress. RPC max is 1000. */
const PAGE_LIMIT = 100;
/** Tx fetch concurrency — keep low to stay under public-RPC limits. */
const TX_CONCURRENCY = 4;

interface RunOpts {
  loop: boolean;
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const opts: RunOpts = { loop: args.has("--loop") };

  console.log(`==> indexer starting`);
  console.log(`    program:   ${PROGRAM_ID_STR}`);
  console.log(`    rpc:       ${RPC}`);
  console.log(`    mode:      ${opts.loop ? "loop" : "run-once"}`);

  const connection = new Connection(RPC, "confirmed");

  do {
    try {
      const added = await runOnce(connection);
      console.log(
        `==> ${added.toString().padStart(3)} new event${added === 1 ? "" : "s"} indexed at ${new Date().toISOString()}`,
      );
    } catch (err) {
      console.error("==> run failed:", err);
    }
    if (opts.loop) {
      await sleep(POLL_INTERVAL_MS);
    }
  } while (opts.loop);
}

async function runOnce(connection: Connection): Promise<number> {
  const snap = loadSnapshot();
  const cursor = snap.cursor.lastSignature;

  // Walk signatures backwards in time (newest first), stopping
  // at the cursor. We reverse before processing so events end up
  // in chronological order in the JSON.
  const collected: Array<{ signature: string; slot: number }> = [];
  let before: string | undefined = undefined;

  while (true) {
    const page = await connection.getSignaturesForAddress(PROGRAM_ID, {
      before,
      limit: PAGE_LIMIT,
    });
    if (page.length === 0) break;

    for (const entry of page) {
      if (cursor && entry.signature === cursor) {
        // Hit the previous cursor — stop walking.
        return await processAndPersist(connection, snap, collected.reverse());
      }
      if (entry.err) continue;
      collected.push({ signature: entry.signature, slot: entry.slot });
    }

    before = page[page.length - 1].signature;

    // Safety cap — first-time backfill on a noisy program could
    // pull thousands of pages. Devnet refinery program has < 50
    // tx so this won't trip in practice.
    if (collected.length > 50_000) {
      console.warn("==> collected > 50k signatures, stopping pagination");
      break;
    }
  }

  return await processAndPersist(connection, snap, collected.reverse());
}

async function processAndPersist(
  connection: Connection,
  snap: ReturnType<typeof loadSnapshot>,
  newest: Array<{ signature: string; slot: number }>,
): Promise<number> {
  if (newest.length === 0) {
    snap.cursor.updatedAt = new Date().toISOString();
    saveSnapshot(snap);
    return 0;
  }

  const newEvents: IndexedEvent[] = [];
  let lastSig = snap.cursor.lastSignature;
  let lastSlot = snap.cursor.lastSlot ?? 0;

  // Bounded-concurrency tx fetch. Solana public RPC tolerates
  // ~10/s; we use 4 to leave headroom.
  for (let i = 0; i < newest.length; i += TX_CONCURRENCY) {
    const batch = newest.slice(i, i + TX_CONCURRENCY);
    const txs = await Promise.all(
      batch.map((s) =>
        connection.getTransaction(s.signature, {
          commitment: "confirmed",
          maxSupportedTransactionVersion: 0,
        }),
      ),
    );

    for (let j = 0; j < batch.length; j++) {
      const sig = batch[j];
      const tx = txs[j];
      if (!tx) continue;
      const logs = tx.meta?.logMessages ?? [];
      const events = decodeTransactionEvents(
        sig.signature,
        sig.slot,
        tx.blockTime ?? null,
        logs,
      );
      newEvents.push(...events);
      // Only advance the cursor when we actually decoded events —
      // otherwise a tx with no events or a decoder bug silently
      // skips the cursor past good data, breaking the next run.
      if (events.length > 0) {
        lastSig = sig.signature;
        lastSlot = sig.slot;
      }
    }
  }

  // Dedupe — re-runs that span the cursor boundary can re-collect
  // a tx already in the file. Key on (signature, logIndex).
  const seen = new Set<string>(
    snap.events.map((e) => `${e.signature}:${e.logIndex}`),
  );
  const fresh = newEvents.filter((e) => {
    const key = `${e.signature}:${e.logIndex}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  snap.events = [...snap.events, ...fresh];
  // Keep events sorted by (slot ASC, logIndex ASC).
  snap.events.sort((a, b) => {
    if (a.slot !== b.slot) return a.slot - b.slot;
    return a.logIndex - b.logIndex;
  });
  snap.cursor.lastSignature = lastSig;
  snap.cursor.lastSlot = lastSlot;
  snap.cursor.updatedAt = new Date().toISOString();
  saveSnapshot(snap);

  return fresh.length;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((err) => {
  console.error("indexer crashed:", err);
  process.exit(1);
});
