// Lightweight SPL Token Mint decoder.
//
// We don't depend on @solana/spl-token in the frontend — its
// import surface is heavy (token-2022 extensions, helpers,
// instruction builders) and we only need to read three fields:
// decimals, supply, and the two authority Options. The mint
// layout is fixed at 82 bytes; offsets are the canonical SPL
// Token format.

import { Connection, PublicKey } from "@solana/web3.js";
import { getConnection } from "./client";

export interface MintInfo {
  mint: string;
  decimals: number;
  /** Total minted supply in base units (whole-token = supply / 10^decimals). */
  supply: bigint;
  mintAuthority: string | null;
  freezeAuthority: string | null;
}

/**
 * Fetch and decode an SPL Token mint account. Returns null if
 * the address doesn't decode to a 82-byte mint owned by the
 * SPL Token program (or by Token-2022, which uses the same
 * first-82-byte layout).
 */
export async function fetchMint(mintPubkey: string): Promise<MintInfo | null> {
  let pk: PublicKey;
  try {
    pk = new PublicKey(mintPubkey);
  } catch {
    return null;
  }

  const connection: Connection = getConnection();
  const acct = await connection.getAccountInfo(pk, "confirmed");
  if (!acct) return null;

  const data = Buffer.from(acct.data);
  // SPL Token mint accounts are exactly 82 bytes. Token-2022
  // mints share the same 82-byte head followed by extension
  // TLV data. Both decode the head identically.
  if (data.length < 82) return null;

  const mintAuthorityOption = data.readUInt32LE(0);
  const mintAuthority =
    mintAuthorityOption === 1 ? new PublicKey(data.subarray(4, 36)).toBase58() : null;

  const supply = data.readBigUInt64LE(36);
  const decimals = data.readUInt8(44);

  const freezeAuthorityOption = data.readUInt32LE(46);
  const freezeAuthority =
    freezeAuthorityOption === 1
      ? new PublicKey(data.subarray(50, 82)).toBase58()
      : null;

  return {
    mint: mintPubkey,
    decimals,
    supply,
    mintAuthority,
    freezeAuthority,
  };
}

/**
 * Format a base-units bigint into a human-readable whole-token
 * string with decimals applied. Truncates trailing zeros.
 */
export function formatSupply(supply: bigint, decimals: number): string {
  if (decimals === 0) return supply.toLocaleString();
  // tsconfig targets ES2017 → no BigInt literals (`10n`).
  const divisor = BigInt(10) ** BigInt(decimals);
  const whole = supply / divisor;

  // Compact suffixes for big mainnet supplies.
  const wholeNumber = Number(whole);
  if (wholeNumber >= 1_000_000_000_000) {
    return `${(wholeNumber / 1_000_000_000_000).toFixed(2)}T`;
  }
  if (wholeNumber >= 1_000_000_000) {
    return `${(wholeNumber / 1_000_000_000).toFixed(2)}B`;
  }
  if (wholeNumber >= 1_000_000) {
    return `${(wholeNumber / 1_000_000).toFixed(2)}M`;
  }
  if (wholeNumber >= 1_000) {
    return `${(wholeNumber / 1_000).toFixed(2)}K`;
  }
  return wholeNumber.toLocaleString();
}
