// Merkle tree compatible with the on-chain refinery program
// (programs/refinery/src/utils/merkle.rs):
//
//   leaf = sha256(0x00 || pubkey || balance_le_u64)
//   node = sha256(0x01 || min(left,right) || max(left,right))
//
// Domain-separated 0x00 / 0x01 prefixes prevent leaf-vs-node
// second-preimage attacks. Sorted-pair concatenation removes
// the need for the proof to carry left/right position bits.

import { PublicKey } from "@solana/web3.js";

const LEAF_PREFIX = new Uint8Array([0x00]);
const NODE_PREFIX = new Uint8Array([0x01]);

export interface SnapshotEntry {
  pubkey: string; // base58
  balance: bigint; // base units
}

async function sha256(...parts: Uint8Array[]): Promise<Uint8Array> {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const buf = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) {
    buf.set(p, offset);
    offset += p.length;
  }
  const out = await crypto.subtle.digest("SHA-256", buf as BufferSource);
  return new Uint8Array(out);
}

export async function leafHash(entry: SnapshotEntry): Promise<Uint8Array> {
  const balLe = new Uint8Array(8);
  // u64 LE write — DataView handles it portably.
  new DataView(balLe.buffer).setBigUint64(0, entry.balance, true);
  const pkBytes = new PublicKey(entry.pubkey).toBytes();
  return sha256(LEAF_PREFIX, pkBytes, balLe);
}

function compare(a: Uint8Array, b: Uint8Array): number {
  for (let i = 0; i < a.length && i < b.length; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return a.length - b.length;
}

async function combine(a: Uint8Array, b: Uint8Array): Promise<Uint8Array> {
  const [lo, hi] = compare(a, b) <= 0 ? [a, b] : [b, a];
  return sha256(NODE_PREFIX, lo, hi);
}

export interface MerkleTree {
  layers: Uint8Array[][];
  leaves: Uint8Array[];
  entries: SnapshotEntry[];
}

export async function buildMerkleTree(
  entries: SnapshotEntry[],
): Promise<MerkleTree> {
  if (entries.length === 0) {
    throw new Error("Cannot build a merkle tree from an empty entry list");
  }
  const leaves = await Promise.all(entries.map(leafHash));
  const layers: Uint8Array[][] = [leaves];
  let current = leaves;
  while (current.length > 1) {
    const next: Uint8Array[] = [];
    for (let i = 0; i < current.length; i += 2) {
      const left = current[i];
      const right = i + 1 < current.length ? current[i + 1] : current[i];
      next.push(await combine(left, right));
    }
    layers.push(next);
    current = next;
  }
  return { layers, leaves, entries };
}

export function merkleRoot(tree: MerkleTree): Uint8Array {
  return tree.layers[tree.layers.length - 1][0];
}

export function merkleProofFor(
  tree: MerkleTree,
  leafIndex: number,
): Uint8Array[] {
  const proof: Uint8Array[] = [];
  let idx = leafIndex;
  for (let level = 0; level < tree.layers.length - 1; level++) {
    const layer = tree.layers[level];
    const siblingIdx = idx % 2 === 0 ? idx + 1 : idx - 1;
    if (siblingIdx < layer.length) {
      proof.push(layer[siblingIdx]);
    }
    idx = Math.floor(idx / 2);
  }
  return proof;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
