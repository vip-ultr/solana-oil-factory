// Client-side helpers for sending transactions via the
// connected wallet. The server-side getProgram() in client.ts
// is read-only (throwaway keypair); these helpers wrap an
// Anchor Program with the live wallet session and a real
// connection so .methods.X.rpc() routes signs through the
// browser wallet.

import { AnchorProvider, Program, BN } from "@coral-xyz/anchor";
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { getWallets } from "@wallet-standard/app";
import type { WalletWithFeatures } from "@wallet-standard/base";
import idl from "./refinery-idl.json";
import type { Refinery as RefineryIdl } from "./refinery-idl-types";
import {
  SOLANA_RPC_URL,
  REFINERY_PROGRAM_ID,
  SOLANA_CLUSTER,
} from "@/lib/program";

// PDA seeds — must mirror programs/refinery/src/constants.rs.
const SEED_TREASURY_CONFIG = Buffer.from("treasury_config");
const SEED_TREASURY_SWAP = Buffer.from("treasury_swap");
const SEED_REFINERY = Buffer.from("refinery");
const SEED_ESCROW = Buffer.from("escrow");

export const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
);
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
);

export const PROGRAM_ID = new PublicKey(REFINERY_PROGRAM_ID);

export interface ClientWallet {
  publicKey: PublicKey;
  signTransaction(tx: Transaction): Promise<Transaction>;
  signAllTransactions?(txs: Transaction[]): Promise<Transaction[]>;
  /**
   * Human-readable wallet name from the React-hooks session
   * (e.g. "Solflare", "Backpack"). Used to disambiguate when
   * multiple wallet-standard extensions report the same account
   * — without this we'd risk routing the signing prompt to a
   * different installed wallet than the one the user picked.
   */
  connectorName?: string;
}

export function getClientConnection(): Connection {
  return new Connection(SOLANA_RPC_URL, "confirmed");
}

/**
 * Build an Anchor Program bound to the user's connected wallet.
 * Used only to construct instructions (`.methods.X.instruction()`)
 * — actual sending goes through the wallet session below.
 */
export function getClientProgram(wallet: ClientWallet): Program<RefineryIdl> {
  const connection = getClientConnection();
  // AnchorProvider type wants signAllTransactions; default to a
  // sequential map when the wallet only exposes single-tx
  // signing.
  const adapter = {
    publicKey: wallet.publicKey,
    signTransaction: wallet.signTransaction.bind(wallet),
    signAllTransactions:
      wallet.signAllTransactions?.bind(wallet) ??
      (async (txs: Transaction[]) =>
        Promise.all(txs.map((t) => wallet.signTransaction(t)))),
  };
  const provider = new AnchorProvider(connection, adapter as never, {
    commitment: "confirmed",
    preflightCommitment: "confirmed",
  });
  return new Program<RefineryIdl>(idl as RefineryIdl, provider);
}

export function treasuryConfigPda(): PublicKey {
  return PublicKey.findProgramAddressSync([SEED_TREASURY_CONFIG], PROGRAM_ID)[0];
}

export function treasurySwapPda(): PublicKey {
  return PublicKey.findProgramAddressSync([SEED_TREASURY_SWAP], PROGRAM_ID)[0];
}

export function refineryPda(mint: PublicKey, operator: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [SEED_REFINERY, mint.toBuffer(), operator.toBuffer()],
    PROGRAM_ID,
  )[0];
}

export function escrowAuthorityPda(refinery: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [SEED_ESCROW, refinery.toBuffer()],
    PROGRAM_ID,
  )[0];
}

export function getAssociatedTokenAddress(
  mint: PublicKey,
  owner: PublicKey,
  allowOffCurve = true,
): PublicKey {
  if (!allowOffCurve && !PublicKey.isOnCurve(owner.toBuffer())) {
    throw new Error("Owner is off-curve; ATAs require allowOffCurve=true");
  }
  return PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  )[0];
}

/**
 * Find the wallet-standard Wallet object that owns `pubkey` and
 * supports the Solana sign+send feature. When `preferredName` is
 * passed (the name of the wallet the user picked in the connect
 * modal — e.g. "Solflare"), we match on name first so the signing
 * prompt routes to the wallet the user actually connected. Without
 * that filter, two extensions exposing the same account (common
 * when the user has imported the same seed into multiple wallets)
 * would race to handle the prompt, with the loser-by-iteration
 * silently winning.
 */
function findWalletStandardWallet(
  pubkey: PublicKey,
  preferredName?: string,
) {
  const target = pubkey.toBase58();
  const wallets = getWallets().get();
  function isUsable(w: (typeof wallets)[number]) {
    const features = (w as WalletWithFeatures<Record<string, unknown>>).features;
    return (
      !!features &&
      ("solana:signAndSendTransaction" in features ||
        "solana:signTransaction" in features)
    );
  }
  const matches = wallets.filter(
    (w) => w.accounts.some((a) => a.address === target) && isUsable(w),
  );
  if (matches.length === 0) return null;
  if (preferredName) {
    const named = matches.find(
      (w) => w.name.toLowerCase() === preferredName.toLowerCase(),
    );
    if (named) return named;
  }
  return matches[0];
}

/**
 * Send a Transaction through the user's wallet using wallet-
 * standard's solana:signAndSendTransaction (or signTransaction
 * + manual broadcast as a fallback). Returns the confirmed sig.
 */
export async function sendTx(
  wallet: ClientWallet,
  instructions: TransactionInstruction[],
  connection?: Connection,
): Promise<string> {
  const conn = connection ?? getClientConnection();
  const tx = new Transaction();
  tx.feePayer = wallet.publicKey;
  for (const ix of instructions) tx.add(ix);
  const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash(
    "confirmed",
  );
  tx.recentBlockhash = blockhash;

  const wsWallet = findWalletStandardWallet(
    wallet.publicKey,
    wallet.connectorName,
  );
  if (!wsWallet) {
    throw new Error(
      "Connected wallet doesn't expose Solana signing — try Phantom, Solflare, or Backpack.",
    );
  }

  const target = wallet.publicKey.toBase58();
  const account = wsWallet.accounts.find((a) => a.address === target)!;
  const chain = `solana:${SOLANA_CLUSTER}` as const;

  const wsFeatures = (
    wsWallet as WalletWithFeatures<Record<string, unknown>>
  ).features;

  // Compile the legacy tx and ship the raw bytes. The compiled
  // message has placeholder zero-byte signatures — wallets fill
  // them in when they sign.
  const serialized = tx.serialize({
    requireAllSignatures: false,
    verifySignatures: false,
  });
  const txBytes = new Uint8Array(serialized);

  // Prefer signAndSendTransaction (one round-trip); fall back to
  // signTransaction + sendRawTransaction.
  const signAndSend = wsFeatures["solana:signAndSendTransaction"] as
    | { signAndSendTransaction: (...inputs: unknown[]) => Promise<readonly { signature: Uint8Array }[]> }
    | undefined;
  if (signAndSend?.signAndSendTransaction) {
    const [output] = await signAndSend.signAndSendTransaction({
      account,
      transaction: txBytes,
      chain,
      options: { commitment: "confirmed" },
    });
    const signature = bs58Encode(output.signature);
    await conn.confirmTransaction(
      { signature, blockhash, lastValidBlockHeight },
      "confirmed",
    );
    return signature;
  }

  const signOnly = wsFeatures["solana:signTransaction"] as
    | { signTransaction: (...inputs: unknown[]) => Promise<readonly { signedTransaction: Uint8Array }[]> }
    | undefined;
  if (signOnly?.signTransaction) {
    const [output] = await signOnly.signTransaction({
      account,
      transaction: txBytes,
      chain,
    });
    const signature = await conn.sendRawTransaction(output.signedTransaction, {
      preflightCommitment: "confirmed",
    });
    await conn.confirmTransaction(
      { signature, blockhash, lastValidBlockHeight },
      "confirmed",
    );
    return signature;
  }

  throw new Error("Wallet does not expose a Solana signing feature.");
}

// Tiny base58 encoder so we don't drag in another lib for the
// signature → string conversion. Solana signatures are 64 bytes.
const BS58_ALPHABET =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function bs58Encode(bytes: Uint8Array): string {
  if (bytes.length === 0) return "";
  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) zeros++;
  // Convert bytes (big-endian) → base58 digits.
  const digits: number[] = [];
  for (let i = zeros; i < bytes.length; i++) {
    let carry = bytes[i];
    for (let j = 0; j < digits.length; j++) {
      const x = digits[j] * 256 + carry;
      digits[j] = x % 58;
      carry = Math.floor(x / 58);
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = Math.floor(carry / 58);
    }
  }
  let result = "";
  for (let i = 0; i < zeros; i++) result += BS58_ALPHABET[0];
  for (let i = digits.length - 1; i >= 0; i--) result += BS58_ALPHABET[digits[i]];
  return result;
}

export { BN };
