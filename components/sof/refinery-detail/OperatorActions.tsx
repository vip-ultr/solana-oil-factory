"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWalletConnection } from "@solana/react-hooks";
import { PublicKey } from "@solana/web3.js";
import { ExternalLink, Loader2 } from "lucide-react";
import { useSiws } from "@/components/sof/SiwsProvider";
import {
  BN,
  PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  escrowAuthorityPda,
  getAssociatedTokenAddress,
  getClientConnection,
  getClientProgram,
  refineryPda,
  sendTx,
  treasuryConfigPda,
  treasurySwapPda,
  type ClientWallet,
} from "@/lib/onchain/writeClient";
import { explorerUrl } from "@/lib/program";
import { buildMerkleTree, merkleRoot, bytesToHex } from "@/lib/onchain/merkle";
import { saveSnapshotCache } from "@/lib/onchain/snapshotCache";

interface Props {
  /** The refinery PDA. */
  refineryId: string;
  /** Operator pubkey (from the refinery account). */
  operator: string;
  /** Token mint pubkey (full base58). */
  tokenMint: string;
  /** From treasury_config. Used to gate snapshot UI. */
  snapshotAuthority: string | null;
  /** Current snapshot index — next submission is + 1. */
  currentSnapshotIndex: number;
  /** Refinery status (active / paused / closed). */
  status: string;
  /** Mint decimals — for the take-snapshot RPC scan. */
  decimals: number | null;
}

// Decode Anchor/program custom error hex codes into readable messages
// so users see "Not authorized" instead of "custom program error: 0x1770".
const PROGRAM_ERRORS: Record<number, string> = {
  6000: "Not authorized — your wallet is not the snapshot authority for this platform.",
  6001: "Platform is paused. Try again later.",
  6002: "Refinery is not active.",
  6016: "Epoch mismatch — please refresh the page and try again.",
  6019: "Snapshot must include at least one holder with a positive balance.",
  6025: "Numerical overflow — contact support.",
};

function decodeError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  const m = msg.match(/custom program error:\s*0x([0-9a-fA-F]+)/i);
  if (m) {
    const code = parseInt(m[1], 16);
    if (PROGRAM_ERRORS[code]) return PROGRAM_ERRORS[code];
  }
  return msg;
}

export function OperatorActions({
  refineryId,
  operator,
  tokenMint,
  snapshotAuthority,
  currentSnapshotIndex,
  status,
  decimals,
}: Props) {
  const { wallet, connected } = useWalletConnection();
  const { authed } = useSiws();
  const router = useRouter();

  const connectedAddress = wallet?.account?.address?.toString() ?? null;
  const isOperator = connectedAddress === operator;
  const isSnapshotAuthority =
    !!snapshotAuthority && connectedAddress === snapshotAuthority;

  const [busy, setBusy] = useState<
    null | "deposit" | "withdraw" | "close" | "pause" | "snapshot"
  >(null);
  const [err, setErr] = useState<string | null>(null);
  const [lastSig, setLastSig] = useState<string | null>(null);

  // Don't render if connected wallet is neither operator nor
  // snapshot authority.
  if (!connected || !authed || (!isOperator && !isSnapshotAuthority)) {
    return null;
  }

  function adapter(): ClientWallet | null {
    if (!wallet?.account || !wallet.signTransaction) return null;
    return {
      publicKey: new PublicKey(wallet.account.address.toString()),
      signTransaction: async (tx) =>
        (await wallet.signTransaction!(tx as never)) as never,
      connectorName: wallet.connector?.name,
    };
  }

  async function withProgram<T>(
    label: typeof busy,
    fn: (
      ctx: { adapter: ClientWallet; refinery: PublicKey; mintPk: PublicKey },
    ) => Promise<T>,
  ): Promise<T | null> {
    setBusy(label);
    setErr(null);
    setLastSig(null);
    try {
      const ad = adapter();
      if (!ad) throw new Error("Wallet not ready");
      const refineryPk = new PublicKey(refineryId);
      const mintPk = new PublicKey(tokenMint);
      return await fn({ adapter: ad, refinery: refineryPk, mintPk });
    } catch (e) {
      setErr(decodeError(e));
      return null;
    } finally {
      setBusy(null);
    }
  }

  async function handleDeposit() {
    const amountStr = window.prompt(
      `How many whole tokens to deposit? (decimals: ${decimals ?? "?"})`,
      "100",
    );
    if (!amountStr) return;
    const whole = Number(amountStr);
    if (!Number.isFinite(whole) || whole <= 0) {
      setErr("Enter a positive number");
      return;
    }
    await withProgram("deposit", async ({ adapter, refinery, mintPk }) => {
      if (decimals === null) throw new Error("Mint decimals not loaded");
      const baseUnits =
        BigInt(Math.floor(whole)) * BigInt(10) ** BigInt(decimals);
      const amount = new BN(baseUnits.toString());
      const program = getClientProgram(adapter);
      const operatorAta = getAssociatedTokenAddress(mintPk, adapter.publicKey, false);
      const swapAta = getAssociatedTokenAddress(mintPk, treasurySwapPda());
      const escrowAuth = escrowAuthorityPda(refinery);
      const escrowAta = getAssociatedTokenAddress(mintPk, escrowAuth);

      const ix = await program.methods
        .deposit({ amount })
        .accounts({
          operator: adapter.publicKey,
          tokenMint: mintPk,
          operatorAta,
          treasuryConfig: treasuryConfigPda(),
          treasurySwapPda: treasurySwapPda(),
          treasurySwapAta: swapAta,
          refinery,
          escrowAta,
          tokenProgram: TOKEN_PROGRAM_ID,
        } as never)
        .instruction();

      const sig = await sendTx(adapter, [ix]);
      setLastSig(sig);
      router.refresh();
    });
  }

  async function handleClose() {
    if (!window.confirm("Close this refinery? Remaining tokens are returned to your wallet. This is permanent.")) return;
    await withProgram("close", async ({ adapter, refinery, mintPk }) => {
      const program = getClientProgram(adapter);
      const operatorAta = getAssociatedTokenAddress(mintPk, adapter.publicKey, false);
      const escrowAuth = escrowAuthorityPda(refinery);
      const escrowAta = getAssociatedTokenAddress(mintPk, escrowAuth);

      const ix = await program.methods
        .closeRefinery()
        .accounts({
          operator: adapter.publicKey,
          tokenMint: mintPk,
          operatorAta,
          refinery,
          escrowAta,
          escrowAuthority: escrowAuth,
          tokenProgram: TOKEN_PROGRAM_ID,
        } as never)
        .instruction();
      const sig = await sendTx(adapter, [ix]);
      setLastSig(sig);
      router.refresh();
    });
  }

  async function handlePauseToggle() {
    await withProgram("pause", async ({ adapter, refinery, mintPk }) => {
      const program = getClientProgram(adapter);
      const ix = await program.methods
        .toggleOperatorPause()
        .accounts({
          operator: adapter.publicKey,
          tokenMint: mintPk,
          refinery,
        } as never)
        .instruction();
      const sig = await sendTx(adapter, [ix]);
      setLastSig(sig);
      router.refresh();
    });
  }

  async function handleSubmitSnapshot() {
    // RPC scan of all token holders for this mint, build tree,
    // submit root + counts, cache the tree client-side so
    // claimers can build proofs.
    await withProgram("snapshot", async ({ adapter, refinery, mintPk }) => {
      if (decimals === null) throw new Error("Mint decimals not loaded");
      const conn = getClientConnection();
      const program = getClientProgram(adapter);

      // Fetch the live refinery account to get the current epoch.
      // Using the hardcoded 0 would cause EpochMismatch if update_rate
      // was ever called on this refinery.
      const refineryAccount = await program.account.refinery.fetch(refinery);
      const liveEpoch = (refineryAccount.epoch as number) ?? 0;
      const liveSnapshotIndex = (refineryAccount.currentSnapshotIndex as number) ?? 0;
      const newIndex = liveSnapshotIndex + 1;

      // Scan both Token program and Token-2022 program so refineries
      // that use T22 mints (no unsupported extensions) include all holders.
      const TOKEN_2022_PROGRAM_ID = new PublicKey(
        "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
      );
      const mintBase58 = mintPk.toBase58();
      const [t1Accounts, t22Accounts] = await Promise.all([
        conn.getProgramAccounts(TOKEN_PROGRAM_ID, {
          commitment: "confirmed",
          dataSlice: { offset: 0, length: 72 },
          filters: [
            { dataSize: 165 },
            { memcmp: { offset: 0, bytes: mintBase58 } },
          ],
        }),
        conn.getProgramAccounts(TOKEN_2022_PROGRAM_ID, {
          commitment: "confirmed",
          dataSlice: { offset: 0, length: 72 },
          filters: [{ memcmp: { offset: 0, bytes: mintBase58 } }],
        }),
      ]);
      const accounts = [...t1Accounts, ...t22Accounts];

      // Decode owner (offset 32, 32 bytes) + amount (offset 64, u64 LE).
      const entriesMap = new Map<string, bigint>();
      for (const acc of accounts) {
        const data = Buffer.from(acc.account.data);
        if (data.length < 72) continue;
        const ownerPk = new PublicKey(data.subarray(32, 64));
        const amount = data.readBigUInt64LE(64);
        if (amount === BigInt(0)) continue;
        const ownerStr = ownerPk.toBase58();
        entriesMap.set(ownerStr, (entriesMap.get(ownerStr) ?? BigInt(0)) + amount);
      }
      // Filter out the escrow ATA owner — that's the pool we're
      // distributing FROM. Operator stays in the holder list so
      // single-wallet local testing works (operator launches →
      // submits snapshot → claims their own pre-launch balance).
      const escrowAuth = escrowAuthorityPda(refinery);
      const ignore = new Set<string>([escrowAuth.toBase58()]);
      const entriesArr = [...entriesMap.entries()]
        .filter(([k]) => !ignore.has(k))
        .map(([pubkey, balance]) => ({ pubkey, balance }));

      if (entriesArr.length === 0) {
        throw new Error(
          "No eligible holders found for this mint. Make sure at least one wallet (other than the escrow) holds this token before submitting the snapshot.",
        );
      }

      const tree = await buildMerkleTree(entriesArr);
      const root = merkleRoot(tree);
      const totalEligibleBalance = entriesArr.reduce(
        (acc, e) => acc + e.balance,
        BigInt(0),
      );

      // Derive snapshot PDA using the live index from the chain,
      // matching the program's own seed derivation exactly.
      const idxBuf = Buffer.alloc(4);
      idxBuf.writeUInt32LE(newIndex, 0);
      const SEED_SNAPSHOT = Buffer.from("snapshot");
      const snapshotPdaAddr = PublicKey.findProgramAddressSync(
        [SEED_SNAPSHOT, refinery.toBuffer(), idxBuf],
        PROGRAM_ID,
      )[0];

      const ix = await program.methods
        .submitSnapshot({
          merkleRoot: Array.from(root) as never,
          totalEligibleBalance: new BN(totalEligibleBalance.toString()),
          holderCount: entriesArr.length,
          epoch: liveEpoch,
        })
        .accounts({
          snapshotAuthority: adapter.publicKey,
          treasuryConfig: treasuryConfigPda(),
          refinery,
          snapshot: snapshotPdaAddr,
        } as never)
        .instruction();

      const sig = await sendTx(adapter, [ix]);

      // Persist tree client-side so the same browser can build
      // claim proofs against it. Holders viewing on a different
      // browser won't have it — production needs an indexer.
      saveSnapshotCache({
        refinery: refineryId,
        snapshotIndex: newIndex,
        merkleRoot: bytesToHex(root),
        totalEligibleBalance: totalEligibleBalance.toString(),
        holderCount: entriesArr.length,
        entries: entriesArr.map((e) => ({
          pubkey: e.pubkey,
          balance: e.balance.toString(),
        })),
        takenAtUnix: Math.floor(Date.now() / 1000),
      });

      setLastSig(sig);
      router.refresh();
    });
  }

  const showOperator = isOperator && status !== "closed";
  // Allow the operator to also try to submit a snapshot. The
  // on-chain program checks the snapshot_authority itself — if
  // the operator isn't authorized, the tx will fail with a clear
  // error. For the typical devnet flow where operator and
  // snapshot authority are the same wallet, this lets the
  // operator publish the first snapshot without UI gating.
  const showSnapshot = (isSnapshotAuthority || isOperator) && status === "active";

  return (
    <div className="sof-rd-panel" style={{ padding: 18 }}>
      <div className="sof-rd-panel-head" style={{ marginBottom: 12 }}>
        <h3>Actions</h3>
        <span className="meta">
          {isOperator
            ? isSnapshotAuthority
              ? "Operator + snapshot authority"
              : "Operator"
            : "Snapshot authority"}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {showSnapshot && (
          <>
            <button
              type="button"
              className="sof-btn sof-btn-primary"
              disabled={busy !== null}
              onClick={handleSubmitSnapshot}
            >
              {busy === "snapshot" ? (
                <>
                  <Loader2 size={14} style={{ animation: "sof-spin 1s linear infinite" }} />
                  Building merkle tree…
                </>
              ) : (
                <>Submit snapshot #{currentSnapshotIndex + 1}</>
              )}
            </button>
            {!isSnapshotAuthority && snapshotAuthority && (
              <div
                style={{
                  fontSize: 11.5,
                  color: "var(--text-tertiary)",
                  lineHeight: 1.5,
                  padding: "8px 10px",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 6,
                }}
              >
                Heads up: the platform snapshot authority is{" "}
                <code style={{ fontSize: 11 }}>
                  {snapshotAuthority.slice(0, 6)}…{snapshotAuthority.slice(-4)}
                </code>
                . If your wallet isn&apos;t that, this submission will be
                rejected on-chain.
              </div>
            )}
          </>
        )}
        {showOperator && (
          <>
            <button
              type="button"
              className="sof-btn sof-btn-secondary"
              disabled={busy !== null}
              onClick={handleDeposit}
            >
              {busy === "deposit" ? "Depositing…" : "Top up pool"}
            </button>
            <button
              type="button"
              className="sof-btn sof-btn-secondary"
              disabled={busy !== null}
              onClick={handlePauseToggle}
            >
              {busy === "pause"
                ? "Toggling…"
                : status === "operatorPaused"
                  ? "Resume refinery"
                  : "Pause refinery"}
            </button>
            <button
              type="button"
              className="sof-btn"
              style={{
                color: "var(--error)",
                border: "1px solid rgba(239,68,68,0.3)",
              }}
              disabled={busy !== null}
              onClick={handleClose}
            >
              {busy === "close" ? "Closing…" : "Close refinery"}
            </button>
          </>
        )}
      </div>

      {err && (
        <div
          style={{
            marginTop: 12,
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
      {lastSig && (
        <div style={{ marginTop: 10, fontSize: 11.5, color: "var(--text-tertiary)" }}>
          tx{" "}
          <a
            href={explorerUrl(lastSig, "tx")}
            target="_blank"
            rel="noreferrer"
            style={{ color: "var(--accent)" }}
          >
            {lastSig.slice(0, 8)}…{lastSig.slice(-4)} <ExternalLink size={10} />
          </a>
        </div>
      )}
    </div>
  );
}
