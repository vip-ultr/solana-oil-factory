// Anchor Program bound to the configured Solana RPC.
//
// Server-side only. Pages that need on-chain state import
// `getProgram()` from a server component (or a route handler) and
// call program.account.* / fetch helpers in this directory. We
// never instantiate the Program in the browser — RPC URLs are env
// vars, the IDL is large, and there's no signing flow that needs
// the Program from the client right now.

import { AnchorProvider, Program } from "@coral-xyz/anchor";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import idl from "./refinery-idl.json";
import type { Refinery as RefineryIdl } from "./refinery-idl-types";

import { REFINERY_PROGRAM_ID, SOLANA_RPC_URL } from "@/lib/program";

export const PROGRAM_ID = new PublicKey(REFINERY_PROGRAM_ID);

let _program: Program<RefineryIdl> | null = null;

/**
 * Lazy-initialised, process-cached Program instance. Read-only —
 * the wallet is a throwaway Keypair so any attempt to sign would
 * fail explicitly. Server-side fetches don't need a signer.
 */
export function getProgram(): Program<RefineryIdl> {
  if (_program) return _program;

  const connection = new Connection(SOLANA_RPC_URL, "confirmed");
  // The main-entry `Wallet` export doesn't survive webpack's
  // ESM/CJS dance ("Wallet is not a constructor" at runtime),
  // so we go straight to the CJS NodeWallet path.
  const wallet = new NodeWallet(Keypair.generate());
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  _program = new Program<RefineryIdl>(idl as RefineryIdl, provider);
  return _program;
}

export function getConnection(): Connection {
  return getProgram().provider.connection;
}

// PDA helpers — mirror programs/refinery/src/constants.rs.
const SEED_TREASURY_CONFIG = Buffer.from("treasury_config");
const SEED_TREASURY_SWAP = Buffer.from("treasury_swap");
const SEED_REFINERY = Buffer.from("refinery");
const SEED_ESCROW = Buffer.from("escrow");
const SEED_SNAPSHOT = Buffer.from("snapshot");
const SEED_CLAIM = Buffer.from("claim");

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

export function snapshotPda(refinery: PublicKey, snapshotIndex: number): PublicKey {
  const idxBuf = Buffer.alloc(4);
  idxBuf.writeUInt32LE(snapshotIndex, 0);
  return PublicKey.findProgramAddressSync(
    [SEED_SNAPSHOT, refinery.toBuffer(), idxBuf],
    PROGRAM_ID,
  )[0];
}

export function claimReceiptPda(
  refinery: PublicKey,
  holder: PublicKey,
  snapshotIndex: number,
): PublicKey {
  const idxBuf = Buffer.alloc(4);
  idxBuf.writeUInt32LE(snapshotIndex, 0);
  return PublicKey.findProgramAddressSync(
    [SEED_CLAIM, refinery.toBuffer(), holder.toBuffer(), idxBuf],
    PROGRAM_ID,
  )[0];
}
