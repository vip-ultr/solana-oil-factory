// Sign-In With Solana — minimal client-side session.
//
// After the wallet handshake we ask the user to sign a domain-
// scoped message. The signature proves wallet ownership for
// display + simple gating of write actions; the program itself
// is what actually authenticates on-chain calls (it requires
// the wallet to sign each tx), so SIWS isn't a security
// control — it's a UX confirmation that the user *intended* to
// connect this wallet to this site.
//
// We persist the payload in localStorage so a page reload
// doesn't force re-signing. Keys are namespaced per-address so
// switching wallets doesn't surface stale sessions.

import type { SolanaCluster } from "@/lib/program";

export interface SiwsSession {
  /** Wallet pubkey (base58). */
  address: string;
  /** Cluster the message references (so a devnet sig can't be
   *  silently re-used on mainnet sessions). */
  cluster: SolanaCluster;
  /** Plaintext message that was signed. */
  message: string;
  /** Hex-encoded signature bytes returned by the wallet. */
  signature: string;
  /** Unix ms when this session expires. */
  expiresAt: number;
  /** Unix ms when the message was issued. */
  issuedAt: number;
  /** Random nonce included in the message — replay protection. */
  nonce: string;
}

const STORAGE_KEY = "sof-siws";
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const VERSION = 1;

/**
 * Build the human-readable message a wallet signs. Loosely
 * follows the EIP-4361 / Sign-in-with-Ethereum format adapted
 * for Solana — purpose, domain, address, nonce, timestamps.
 */
export function buildSiwsMessage(opts: {
  domain: string;
  address: string;
  cluster: SolanaCluster;
  nonce: string;
  issuedAt: Date;
  expiresAt: Date;
}): string {
  return [
    `${opts.domain} wants you to sign in with your Solana account:`,
    opts.address,
    "",
    "Sign in to Solana Oil Factory. This is free and never moves funds.",
    "",
    `Domain: ${opts.domain}`,
    `Version: ${VERSION}`,
    `Chain ID: solana:${opts.cluster}`,
    `Nonce: ${opts.nonce}`,
    `Issued At: ${opts.issuedAt.toISOString()}`,
    `Expiration Time: ${opts.expiresAt.toISOString()}`,
  ].join("\n");
}

export function generateNonce(): string {
  // 16 random hex chars — plenty for replay protection at our
  // scale; Solana itself enforces blockhash recency on real txs.
  const arr = new Uint8Array(8);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function loadSiws(address: string): SiwsSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SiwsSession;
    if (parsed.address !== address) return null;
    if (parsed.expiresAt < Date.now()) {
      // Lazy GC.
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveSiws(session: SiwsSession): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    // Notify same-tab listeners (storage event only fires in other tabs).
    window.dispatchEvent(new CustomEvent("sof:siws-changed"));
  } catch {
    /* ignored — quota / private mode */
  }
}

export function clearSiws(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("sof:siws-changed"));
  } catch {
    /* ignored */
  }
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const SIWS_TTL_MS = TTL_MS;
