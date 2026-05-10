// Walks getSignaturesForAddress backwards in time for every
// wallet referenced in the indexer events JSON, finds each
// wallet's earliest tx, and writes the result to
// lib/indexer/wallet-tenure.json. The reputation R signal
// reads this when present (true wallet age) and falls back to
// the "first SOF event" proxy when not.
//
// Usage:
//   pnpm wallet-tenure         # one-shot
//
// Per-wallet cost: O(tx history pages, 1000 sigs each). Old
// wallets can take 30-60s each, so we cap at 30 pages
// (≈30k tx) and surface partials. The cap is safe because
// older-than-the-cap implies "very old" → max R uplift either
// way.

import {
  Connection,
  PublicKey,
  ConfirmedSignatureInfo,
} from "@solana/web3.js";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import bundledEvents from "../lib/indexer/events.json";
import type { IndexerSnapshot } from "../lib/indexer/types";

const RPC =
  process.env.SOLANA_RPC_URL ??
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ??
  "https://api.devnet.solana.com";

const TENURE_PATH = join(
  process.cwd(),
  "lib",
  "indexer",
  "wallet-tenure.json",
);

const PAGE_LIMIT = 1000;
const MAX_PAGES = 30; // ~30k tx ceiling

interface TenureEntry {
  /** Unix seconds of first known tx; null if walk hit the cap. */
  firstTxUnix: number | null;
  /** True if we capped before reaching the wallet's actual first tx. */
  partial: boolean;
  /** When this entry was last refreshed. */
  updatedAt: string;
}

interface TenureFile {
  wallets: Record<string, TenureEntry>;
}

function loadCache(): TenureFile {
  if (!existsSync(TENURE_PATH)) return { wallets: {} };
  try {
    return JSON.parse(readFileSync(TENURE_PATH, "utf8"));
  } catch {
    return { wallets: {} };
  }
}

function saveCache(file: TenureFile): void {
  if (!existsSync(dirname(TENURE_PATH))) {
    mkdirSync(dirname(TENURE_PATH), { recursive: true });
  }
  writeFileSync(TENURE_PATH, JSON.stringify(file, null, 2) + "\n", "utf8");
}

async function findFirstTx(
  connection: Connection,
  wallet: PublicKey,
): Promise<{ firstTxUnix: number | null; partial: boolean }> {
  let before: string | undefined = undefined;
  let earliestBlockTime: number | null = null;
  let pages = 0;

  while (pages < MAX_PAGES) {
    const page: ConfirmedSignatureInfo[] =
      await connection.getSignaturesForAddress(wallet, {
        before,
        limit: PAGE_LIMIT,
      });
    if (page.length === 0) break;

    for (const entry of page) {
      if (entry.blockTime !== null && entry.blockTime !== undefined) {
        if (
          earliestBlockTime === null ||
          entry.blockTime < earliestBlockTime
        ) {
          earliestBlockTime = entry.blockTime;
        }
      }
    }

    before = page[page.length - 1].signature;
    pages += 1;
    if (page.length < PAGE_LIMIT) break; // last page
  }

  return {
    firstTxUnix: earliestBlockTime,
    partial: pages >= MAX_PAGES,
  };
}

async function main() {
  console.log(`==> wallet-tenure starting`);
  console.log(`    rpc:   ${RPC}`);

  const snap = bundledEvents as unknown as IndexerSnapshot;
  const wallets = new Set<string>();
  for (const e of snap.events) {
    if (e.wallet) wallets.add(e.wallet);
  }
  console.log(`    distinct wallets in events: ${wallets.size}`);

  if (wallets.size === 0) {
    console.log(`==> nothing to do`);
    return;
  }

  const cache = loadCache();
  const connection = new Connection(RPC, "confirmed");
  let updated = 0;

  for (const wallet of wallets) {
    // Re-walk wallets that don't have an entry, or that hit
    // the page cap (might have more history now), or that
    // were last refreshed more than a week ago.
    const existing = cache.wallets[wallet];
    const oneWeekMs = 7 * 86_400_000;
    const stale =
      !existing ||
      existing.partial ||
      Date.now() - new Date(existing.updatedAt).getTime() > oneWeekMs;
    if (!stale) continue;

    try {
      const { firstTxUnix, partial } = await findFirstTx(
        connection,
        new PublicKey(wallet),
      );
      cache.wallets[wallet] = {
        firstTxUnix,
        partial,
        updatedAt: new Date().toISOString(),
      };
      updated += 1;
      const ageDays = firstTxUnix
        ? Math.floor((Date.now() / 1000 - firstTxUnix) / 86_400)
        : "—";
      console.log(
        `    ${wallet.slice(0, 4)}…${wallet.slice(-4)}  ${ageDays}d${partial ? " (partial)" : ""}`,
      );
      // Persist after every wallet so a crash doesn't lose work.
      saveCache(cache);
    } catch (err) {
      console.error(
        `    ${wallet.slice(0, 4)}…${wallet.slice(-4)}  failed: ${err}`,
      );
    }
  }

  console.log(`==> ${updated} wallet${updated === 1 ? "" : "s"} updated`);
}

main().catch((err) => {
  console.error("wallet-tenure crashed:", err);
  process.exit(1);
});
