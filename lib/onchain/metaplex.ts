// Metaplex Token Metadata Program reader.
//
// Every named SPL token has a metadata PDA at
//   ["metadata", METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()]
// owned by the Metaplex Token Metadata Program. This is the
// same PDA that Phantom / Solflare / Solscan use to render
// names + symbols. Works on every cluster (devnet, mainnet,
// testnet) with no external API dependency.
//
// We only decode the on-chain "Data" struct — name, symbol,
// uri. Skips creators / collection / edition data.

import { Connection, PublicKey } from "@solana/web3.js";
import { getConnection } from "./client";

export const METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
);

export interface MetaplexMetadata {
  mint: string;
  name: string;
  symbol: string;
  uri: string;
}

function metadataPda(mint: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    METADATA_PROGRAM_ID,
  )[0];
}

/**
 * Layout (from mpl-token-metadata Metadata struct):
 *
 *   1   key (Metadata variant discriminator)
 *   32  update_authority
 *   32  mint
 *   --- Data ---
 *   4   name length (u32 LE)   ← always 32 (padded with \0)
 *   32  name bytes (UTF-8)
 *   4   symbol length (u32 LE) ← always 10 (padded with \0)
 *   10  symbol bytes (UTF-8)
 *   4   uri length (u32 LE)    ← always 200 (padded with \0)
 *   200 uri bytes (UTF-8)
 *   ... (seller_fee_basis_points + creators + flags after; ignored)
 */
function decodeMetadata(mint: string, data: Buffer): MetaplexMetadata | null {
  // Total fixed-prefix bytes = 1 + 32 + 32 + 4 + 32 + 4 + 10 + 4 + 200 = 319.
  if (data.length < 319) return null;
  let offset = 1 + 32 + 32; // skip key + update_authority + mint

  const readPaddedString = (maxLen: number): string => {
    const len = data.readUInt32LE(offset);
    offset += 4;
    const slice = data.subarray(offset, offset + maxLen);
    offset += maxLen;
    // Strip trailing \0 padding plus anything past `len` bytes.
    const effective = Math.min(len, maxLen);
    let out = "";
    for (let i = 0; i < effective; i++) {
      const byte = slice[i];
      if (byte === 0) break;
      out += String.fromCharCode(byte);
    }
    return out.trim();
  };

  try {
    const name = readPaddedString(32);
    const symbol = readPaddedString(10);
    const uri = readPaddedString(200);
    if (!name && !symbol) return null;
    return { mint, name, symbol, uri };
  } catch {
    return null;
  }
}

/**
 * Fetch the Metaplex metadata for a single mint. Returns null
 * when the mint has no metadata PDA published.
 */
export async function fetchMetadataForMint(
  mint: string,
): Promise<MetaplexMetadata | null> {
  let mintPk: PublicKey;
  try {
    mintPk = new PublicKey(mint);
  } catch {
    return null;
  }
  const conn: Connection = getConnection();
  const pda = metadataPda(mintPk);
  try {
    const acct = await conn.getAccountInfo(pda, "confirmed");
    if (!acct) return null;
    return decodeMetadata(mint, Buffer.from(acct.data));
  } catch {
    return null;
  }
}

/**
 * Batch variant — fetches every PDA in one getMultipleAccounts
 * round-trip. Returns a map keyed by mint pubkey for any that
 * resolved; mints without metadata are simply absent from the
 * result.
 */
export async function fetchMetadataForMints(
  mints: string[],
): Promise<Map<string, MetaplexMetadata>> {
  const out = new Map<string, MetaplexMetadata>();
  if (mints.length === 0) return out;

  const conn = getConnection();
  const pdas: PublicKey[] = [];
  const ordered: string[] = [];
  for (const m of mints) {
    try {
      const mintPk = new PublicKey(m);
      pdas.push(metadataPda(mintPk));
      ordered.push(m);
    } catch {
      // skip invalid mints
    }
  }
  if (pdas.length === 0) return out;

  // getMultipleAccounts is capped at 100 keys per request.
  const CHUNK = 100;
  for (let i = 0; i < pdas.length; i += CHUNK) {
    const chunk = pdas.slice(i, i + CHUNK);
    const labels = ordered.slice(i, i + CHUNK);
    try {
      const accts = await conn.getMultipleAccountsInfo(chunk, "confirmed");
      accts.forEach((a, idx) => {
        if (!a) return;
        const meta = decodeMetadata(labels[idx], Buffer.from(a.data));
        if (meta) out.set(labels[idx], meta);
      });
    } catch {
      // RPC blip — leave those mints unresolved.
    }
  }
  return out;
}
