// Refinery program indexer — Phase 2b.
//
// Walks getSignaturesForAddress(PROGRAM_ID), pulls every tx that
// hasn't been indexed yet, parses anchor `emit!` events from the
// log stream, and writes them to Supabase. Idempotent — re-runs
// only fetch new signatures past the stored cursor.
//
// Usage:
//   pnpm indexer            # run-once, exits when caught up
//   pnpm indexer -- --loop  # poll forever, sleeping between runs

import { Connection, PublicKey } from "@solana/web3.js";
import {
  loadCursor,
  saveCursor,
  insertEvents,
} from "../lib/indexer/store.node";
import { decodeTransactionEvents } from "../lib/indexer/decoder";
import type { IndexedEvent, IndexerCursor } from "../lib/indexer/types";

const PROGRAM_ID_STR =
  process.env.NEXT_PUBLIC_REFINERY_PROGRAM_ID ??
  "2tPLLPQeLLNL4UDBbeagSUAABJcB3fHGTJaLGEzrx3rE";
const PROGRAM_ID = new PublicKey(PROGRAM_ID_STR);

const RPC =
  process.env.SOLANA_RPC_URL ??
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ??
  "https://api.devnet.solana.com";

const POLL_INTERVAL_MS = 10_000;
const PAGE_LIMIT = 100;
const TX_CONCURRENCY = 4;

interface RunOpts {
  loop: boolean;
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const opts: RunOpts = { loop: args.has("--loop") };

  console.log(`==> indexer starting (phase 2b — Supabase)`);
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
  const cursor = await loadCursor();
  const lastSig = cursor.lastSignature;

  const collected: Array<{ signature: string; slot: number }> = [];
  let before: string | undefined = undefined;

  while (true) {
    const page = await connection.getSignaturesForAddress(PROGRAM_ID, {
      before,
      limit: PAGE_LIMIT,
    });
    if (page.length === 0) break;

    for (const entry of page) {
      if (lastSig && entry.signature === lastSig) {
        return await processAndPersist(connection, cursor, collected.reverse());
      }
      if (entry.err) continue;
      collected.push({ signature: entry.signature, slot: entry.slot });
    }

    before = page[page.length - 1].signature;

    if (collected.length > 50_000) {
      console.warn("==> collected > 50k signatures, stopping pagination");
      break;
    }
  }

  return await processAndPersist(connection, cursor, collected.reverse());
}

async function processAndPersist(
  connection: Connection,
  cursor: IndexerCursor,
  newest: Array<{ signature: string; slot: number }>,
): Promise<number> {
  if (newest.length === 0) {
    await saveCursor({ ...cursor, updatedAt: new Date().toISOString() });
    return 0;
  }

  const newEvents: IndexedEvent[] = [];
  let lastSig  = cursor.lastSignature;
  let lastSlot = cursor.lastSlot ?? 0;

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
      const tx  = txs[j];
      if (!tx) continue;
      const logs   = tx.meta?.logMessages ?? [];
      const events = decodeTransactionEvents(
        sig.signature,
        sig.slot,
        tx.blockTime ?? null,
        logs,
      );
      newEvents.push(...events);
      if (events.length > 0) {
        lastSig  = sig.signature;
        lastSlot = sig.slot;
      }
    }
  }

  // insertEvents deduplicates via ON CONFLICT DO NOTHING, so no
  // local seen-set is needed here. The DB is the source of truth.
  await insertEvents(newEvents);
  await saveCursor({
    programId:     cursor.programId,
    lastSignature: lastSig,
    lastSlot:      lastSlot,
    updatedAt:     new Date().toISOString(),
  });

  return newEvents.length;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((err) => {
  console.error("indexer crashed:", err);
  process.exit(1);
});
