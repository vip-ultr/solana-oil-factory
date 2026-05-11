"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useWalletConnection } from "@solana/react-hooks";
import { PublicKey } from "@solana/web3.js";
import { ExternalLink, Loader2 } from "lucide-react";
import { useSiws } from "@/components/sof/SiwsProvider";
import { openConnectModal } from "@/components/sof/modals/ChromeOverlay";
import {
  BN,
  PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  escrowAuthorityPda,
  getAssociatedTokenAddress,
  getClientProgram,
  sendTx,
  treasuryConfigPda,
  type ClientWallet,
} from "@/lib/onchain/writeClient";
import { explorerUrl } from "@/lib/program";
import { buildMerkleTree, merkleProofFor, leafHash, bytesToHex } from "@/lib/onchain/merkle";
import { loadSnapshotCache } from "@/lib/onchain/snapshotCache";

interface Props {
  refineryId: string;
  tokenMint: string;
  currentSnapshotIndex: number;
}

interface Eligibility {
  state: "idle" | "checking" | "eligible" | "not-eligible" | "no-snapshot";
  balance?: bigint;
  totalEligible?: bigint;
  estimatedClaim?: bigint;
}

const SEED_SNAPSHOT = Buffer.from("snapshot");
const SEED_CLAIM = Buffer.from("claim");

function snapshotPda(refinery: PublicKey, idx: number): PublicKey {
  const buf = Buffer.alloc(4);
  buf.writeUInt32LE(idx, 0);
  return PublicKey.findProgramAddressSync(
    [SEED_SNAPSHOT, refinery.toBuffer(), buf],
    PROGRAM_ID,
  )[0];
}

function claimReceiptPda(
  refinery: PublicKey,
  holder: PublicKey,
  idx: number,
): PublicKey {
  const buf = Buffer.alloc(4);
  buf.writeUInt32LE(idx, 0);
  return PublicKey.findProgramAddressSync(
    [SEED_CLAIM, refinery.toBuffer(), holder.toBuffer(), buf],
    PROGRAM_ID,
  )[0];
}

export function ClaimAction({
  refineryId,
  tokenMint,
  currentSnapshotIndex,
}: Props) {
  const { wallet, connected } = useWalletConnection();
  const { authed } = useSiws();
  const router = useRouter();

  const connectedAddress = wallet?.account?.address?.toString() ?? null;

  const [elig, setElig] = useState<Eligibility>({ state: "idle" });
  const [claiming, setClaiming] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [sig, setSig] = useState<string | null>(null);

  const cached = useMemo(() => {
    if (currentSnapshotIndex <= 0) return null;
    return loadSnapshotCache(refineryId, currentSnapshotIndex);
  }, [refineryId, currentSnapshotIndex]);

  // Recheck eligibility whenever the wallet or cached snapshot changes.
  useEffect(() => {
    if (!connectedAddress || !authed) {
      setElig({ state: "idle" });
      return;
    }
    if (currentSnapshotIndex <= 0) {
      setElig({ state: "no-snapshot" });
      return;
    }
    if (!cached) {
      setElig({ state: "no-snapshot" });
      return;
    }
    setElig({ state: "checking" });
    const entry = cached.entries.find((e) => e.pubkey === connectedAddress);
    if (!entry) {
      setElig({ state: "not-eligible" });
      return;
    }
    const balance = BigInt(entry.balance);
    const totalEligible = BigInt(cached.totalEligibleBalance);
    setElig({
      state: "eligible",
      balance,
      totalEligible,
    });
  }, [connectedAddress, authed, currentSnapshotIndex, cached]);

  if (!connected) {
    return (
      <button
        type="button"
        className="sof-btn sof-btn-primary"
        onClick={openConnectModal}
        style={{ width: "100%" }}
      >
        Connect wallet to check eligibility
      </button>
    );
  }
  if (!authed) {
    return (
      <button
        type="button"
        className="sof-btn sof-btn-secondary"
        disabled
        style={{ width: "100%" }}
      >
        Sign verify message in sidebar to continue
      </button>
    );
  }
  if (elig.state === "no-snapshot") {
    return (
      <div
        style={{
          padding: "12px 14px",
          background: "var(--bg-input)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 6,
          fontSize: 12.5,
          color: "var(--text-tertiary)",
          lineHeight: 1.5,
        }}
      >
        Claims open once snapshot #1 is published.{" "}
        {currentSnapshotIndex > 0 &&
          " A snapshot exists on-chain but the holder list isn't cached locally — ask the snapshot authority to re-publish from this device, or wait for the indexer to publish it (v1.1)."}
      </div>
    );
  }
  if (elig.state === "not-eligible") {
    return (
      <div
        style={{
          padding: "12px 14px",
          background: "var(--bg-input)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 6,
          fontSize: 12.5,
          color: "var(--text-tertiary)",
          lineHeight: 1.5,
        }}
      >
        This wallet wasn&apos;t holding the token at snapshot #
        {currentSnapshotIndex}. Hold tokens at the next snapshot to qualify.
      </div>
    );
  }
  if (elig.state !== "eligible" || !elig.balance || !elig.totalEligible) {
    return null;
  }

  const balance = elig.balance;
  const total = elig.totalEligible;

  async function handleClaim() {
    if (!wallet?.account || !wallet.signTransaction) return;
    if (!cached) return;
    setClaiming(true);
    setErr(null);
    setSig(null);
    try {
      const adapter: ClientWallet = {
        publicKey: new PublicKey(wallet.account.address.toString()),
        signTransaction: async (tx) =>
          (await wallet.signTransaction!(tx as never)) as never,
        connectorName: wallet.connector?.name,
      };
      const refinery = new PublicKey(refineryId);
      const mintPk = new PublicKey(tokenMint);
      const program = getClientProgram(adapter);

      // Re-build the tree client-side from the cached entries
      // and extract the proof for this wallet. We don't store
      // the tree itself — just the entry list — so re-derivation
      // is the source of truth.
      const tree = await buildMerkleTree(
        cached.entries.map((e) => ({
          pubkey: e.pubkey,
          balance: BigInt(e.balance),
        })),
      );
      const myIndex = cached.entries.findIndex(
        (e) => e.pubkey === adapter.publicKey.toBase58(),
      );
      if (myIndex < 0) throw new Error("Wallet not in cached snapshot");
      const myEntry = cached.entries[myIndex];
      const proofBytes = merkleProofFor(tree, myIndex);

      const treasuryConfigAddr = treasuryConfigPda();
      const cfg = await program.account.treasuryConfig.fetch(treasuryConfigAddr);

      const escrowAuth = escrowAuthorityPda(refinery);
      const escrowAta = getAssociatedTokenAddress(mintPk, escrowAuth);
      const holderAta = getAssociatedTokenAddress(mintPk, adapter.publicKey, false);
      const snapshotAddr = snapshotPda(refinery, currentSnapshotIndex);
      const claimReceipt = claimReceiptPda(
        refinery,
        adapter.publicKey,
        currentSnapshotIndex,
      );

      const ix = await program.methods
        .claim({
          snapshotIndex: currentSnapshotIndex,
          balanceAtSnapshot: new BN(myEntry.balance),
          merkleProof: proofBytes.map((p) => Array.from(p)) as never,
        })
        .accounts({
          holder: adapter.publicKey,
          tokenMint: mintPk,
          holderAta,
          treasuryConfig: treasuryConfigAddr,
          feeReceiverSol: cfg.feeReceiverSol,
          refinery,
          snapshot: snapshotAddr,
          escrowAta,
          escrowAuthority: escrowAuth,
          claimReceipt,
          tokenProgram: TOKEN_PROGRAM_ID,
        } as never)
        .instruction();

      const txSig = await sendTx(adapter, [ix]);
      setSig(txSig);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setClaiming(false);
    }
  }

  // Estimate: balance / total × pool_remaining (capped per
  // per_claim_cap). We don't have pool_remaining + cap here so
  // surface the share % as a proxy.
  const sharePct = total > BigInt(0)
    ? Number((balance * BigInt(10000)) / total) / 100
    : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        style={{
          padding: "10px 12px",
          background: "rgba(34,197,94,0.08)",
          border: "1px solid rgba(34,197,94,0.3)",
          borderRadius: 6,
          fontSize: 12.5,
          color: "var(--success)",
          lineHeight: 1.5,
        }}
      >
        Eligible at snapshot #{currentSnapshotIndex} · {sharePct.toFixed(2)}%
        share of total eligible balance
      </div>
      <button
        type="button"
        className="sof-btn sof-btn-primary"
        disabled={claiming}
        onClick={handleClaim}
        style={{ width: "100%" }}
      >
        {claiming ? (
          <>
            <Loader2 size={14} style={{ animation: "sof-spin 1s linear infinite" }} />
            Submitting claim…
          </>
        ) : (
          <>Sign &amp; claim</>
        )}
      </button>
      {err && (
        <div
          style={{
            padding: "10px 12px",
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "var(--error)",
            borderRadius: 6,
            fontSize: 12,
          }}
        >
          {err}
        </div>
      )}
      {sig && (
        <div style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>
          Claimed.{" "}
          <a
            href={explorerUrl(sig, "tx")}
            target="_blank"
            rel="noreferrer"
            style={{ color: "var(--accent)" }}
          >
            {sig.slice(0, 8)}…{sig.slice(-4)} <ExternalLink size={10} />
          </a>
        </div>
      )}
    </div>
  );
}
