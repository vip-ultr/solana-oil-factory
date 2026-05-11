"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useWalletConnection } from "@solana/react-hooks";
import { PublicKey } from "@solana/web3.js";
import { ArrowRight, ExternalLink, Loader2 } from "lucide-react";
import { useSiws } from "@/components/sof/SiwsProvider";
import { openConnectModal } from "@/components/sof/modals/ChromeOverlay";
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

interface MintInfo {
  decimals: number;
  supply: bigint;
  mintAuthority: string | null;
  freezeAuthority: string | null;
}

type Cadence = "atLaunch" | "hourly" | "daily" | "weekly" | "perEpochOnly";
type EmptyStrategy = "proRata" | "fcfs";

const CADENCES: { value: Cadence; label: string }[] = [
  { value: "atLaunch", label: "Once at launch" },
  { value: "hourly", label: "Hourly" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "perEpochOnly", label: "Per-epoch only" },
];

export function LaunchWizard() {
  const router = useRouter();
  const { wallet, connected } = useWalletConnection();
  const { authed } = useSiws();

  const [mintInput, setMintInput] = useState("");
  const [mintInfo, setMintInfo] = useState<MintInfo | null>(null);
  const [mintErr, setMintErr] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);

  const [poolWhole, setPoolWhole] = useState("1000000");
  const [claimRateBasis, setClaimRateBasis] = useState("1000");
  const [perClaimCapBps, setPerClaimCapBps] = useState("500");
  const [cadence, setCadence] = useState<Cadence>("hourly");
  const [empty, setEmpty] = useState<EmptyStrategy>("proRata");
  const [windowDays, setWindowDays] = useState("7");
  const [freezeAck, setFreezeAck] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);

  // Resolve the mint whenever the user pastes a valid base58
  // pubkey. Debounced via a 300ms timer.
  useEffect(() => {
    setMintErr(null);
    setMintInfo(null);
    const candidate = mintInput.trim();
    if (!candidate) return;
    let pk: PublicKey;
    try {
      pk = new PublicKey(candidate);
    } catch {
      setMintErr("Not a valid Solana address");
      return;
    }
    let cancelled = false;
    setResolving(true);
    const t = setTimeout(async () => {
      try {
        const conn = getClientConnection();
        const acct = await conn.getAccountInfo(pk, "confirmed");
        if (cancelled) return;
        if (!acct) {
          setMintErr("Mint account not found on devnet");
          return;
        }
        const data = Buffer.from(acct.data);
        if (data.length < 82) {
          setMintErr("Account is not an SPL Token mint");
          return;
        }
        const mintAuthorityOption = data.readUInt32LE(0);
        const mintAuthority =
          mintAuthorityOption === 1
            ? new PublicKey(data.subarray(4, 36)).toBase58()
            : null;
        const supply = data.readBigUInt64LE(36);
        const decimals = data.readUInt8(44);
        const freezeAuthorityOption = data.readUInt32LE(46);
        const freezeAuthority =
          freezeAuthorityOption === 1
            ? new PublicKey(data.subarray(50, 82)).toBase58()
            : null;
        setMintInfo({ decimals, supply, mintAuthority, freezeAuthority });
      } catch (err) {
        if (!cancelled) {
          setMintErr(
            err instanceof Error ? err.message : "Failed to read mint account",
          );
        }
      } finally {
        if (!cancelled) setResolving(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [mintInput]);

  const operatorIsMintAuthority = useMemo(() => {
    if (!mintInfo || !wallet?.account?.address) return false;
    return mintInfo.mintAuthority === wallet.account.address.toString();
  }, [mintInfo, wallet]);

  const requiresFreezeAck = !!mintInfo?.freezeAuthority;

  // Explicit gate list so we can surface *which* check failed
  // when the launch button is grey. Order matters — we surface
  // the first-failing reason first.
  const blockReason = ((): string | null => {
    if (!connected) return "Connect a wallet first.";
    if (!authed) return "Sign the verify message before launching.";
    if (!mintInput.trim()) return "Paste a token mint address.";
    if (mintErr) return mintErr;
    if (!mintInfo) return "Reading mint account…";
    if (Number(poolWhole) <= 0) return "Pool size must be > 0.";
    if (Number(claimRateBasis) <= 0)
      return "Claim rate basis must be > 0.";
    const cap = Number(perClaimCapBps);
    if (!Number.isFinite(cap) || cap < 10 || cap > 10_000)
      return "Per-claim cap must be between 10 and 10000 bps (0.1% – 100%).";
    if (Number(windowDays) < 0) return "Claim window can't be negative.";
    if (requiresFreezeAck && !freezeAck)
      return "Acknowledge the freeze authority risk.";
    return null;
  })();
  const ready = !blockReason && !submitting;

  async function handleSubmit() {
    if (!wallet || !wallet.account || !mintInfo) return;
    setSubmitting(true);
    setSubmitErr(null);
    setSignature(null);

    try {
      // Adapt the WalletSession into the ClientWallet shape we
      // pass to sendTx + getClientProgram.
      const operatorPk = new PublicKey(wallet.account.address.toString());
      const adapter: ClientWallet = {
        publicKey: operatorPk,
        signTransaction: async (tx) => {
          if (!wallet.signTransaction) {
            throw new Error("Wallet does not support transaction signing");
          }
          // The wallet expects a SendableTransaction; @solana/web3.js
          // Transaction is structurally compatible. Cast through
          // unknown to satisfy the strict @solana/kit type.
          return (await wallet.signTransaction(tx as never)) as never;
        },
        connectorName: wallet.connector?.name,
      };

      const decimals = mintInfo.decimals;
      const baseUnits = BigInt(Math.floor(Number(poolWhole))) *
        BigInt(10) ** BigInt(decimals);
      const poolInitial = new BN(baseUnits.toString());
      const claimWindowSeconds = new BN(
        Math.max(0, Math.floor(Number(windowDays) * 86_400)),
      );

      const mintPk = new PublicKey(mintInput.trim());
      const refinery = refineryPda(mintPk, operatorPk);
      const escrowAuth = escrowAuthorityPda(refinery);
      const escrowAta = getAssociatedTokenAddress(mintPk, escrowAuth);
      const swapAta = getAssociatedTokenAddress(mintPk, treasurySwapPda());
      const operatorAta = getAssociatedTokenAddress(mintPk, operatorPk, false);

      const program = getClientProgram(adapter);

      const cfg = await program.account.treasuryConfig.fetch(
        treasuryConfigPda(),
      );

      const ix = await program.methods
        .initRefinery({
          poolInitial,
          claimRateBasis: new BN(Number(claimRateBasis)),
          perClaimCapBps: Number(perClaimCapBps),
          poolEmptyStrategy: { [empty]: {} } as never,
          snapshotStrategy: { [cadence]: {} } as never,
          claimWindowSeconds,
          freezeAcknowledged: freezeAck,
        })
        .accounts({
          operator: operatorPk,
          tokenMint: mintPk,
          operatorAta,
          treasuryConfig: treasuryConfigPda(),
          feeReceiverSol: cfg.feeReceiverSol,
          treasurySwapPda: treasurySwapPda(),
          treasurySwapAta: swapAta,
          refinery,
          escrowAuthority: escrowAuth,
          escrowAta,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        } as never)
        .instruction();

      const sig = await sendTx(adapter, [ix]);
      setSignature(sig);
      // Briefly let the confirmation settle, then redirect.
      setTimeout(() => router.push(`/refinery/${refinery.toBase58()}`), 500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setSubmitErr(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="sof-lw-grid">
      <div className="sof-lw-main">
        {/* STEP 1 — Token */}
        <div className="sof-lw-card current">
          <div className="sof-lw-card-head">
            <h3>1 · Choose token</h3>
            <span className="step-num">REQUIRED</span>
          </div>
          <div className="sof-lw-card-body">
            <div className="sof-lw-grp">
              <label className="sof-lw-lab">
                Token mint address{" "}
                <span className="hint">
                  SPL Token or Token-2022 · {mintInfo?.decimals ?? "?"} decimals
                </span>
              </label>
              <input
                className="sof-lw-input"
                value={mintInput}
                onChange={(e) => setMintInput(e.target.value)}
                placeholder="DezX… (paste any SPL mint pubkey)"
                spellCheck={false}
              />
              {resolving && (
                <div className="sof-lw-help">Reading mint account…</div>
              )}
              {mintErr && (
                <div className="sof-lw-help" style={{ color: "var(--error)" }}>
                  {mintErr}
                </div>
              )}
              {mintInfo && !mintErr && (
                <div className="sof-lw-checks" style={{ marginTop: 14 }}>
                  <div className="sof-lw-check-row">
                    <span
                      className={`ind ${operatorIsMintAuthority ? "ok" : "warn"}`}
                      aria-hidden="true"
                    />
                    Operator is the mint authority
                    <span
                      className={`v ${operatorIsMintAuthority ? "ok" : "warn"}`}
                    >
                      {operatorIsMintAuthority
                        ? "verified deployer"
                        : "CTO refinery"}
                    </span>
                  </div>
                  <div className="sof-lw-check-row">
                    <span
                      className={`ind ${mintInfo.mintAuthority ? "warn" : "ok"}`}
                      aria-hidden="true"
                    />
                    Mint authority
                    <span
                      className={`v ${mintInfo.mintAuthority ? "warn" : "ok"}`}
                    >
                      {mintInfo.mintAuthority ? "active" : "renounced"}
                    </span>
                  </div>
                  <div className="sof-lw-check-row">
                    <span
                      className={`ind ${mintInfo.freezeAuthority ? "warn" : "ok"}`}
                      aria-hidden="true"
                    />
                    Freeze authority
                    <span
                      className={`v ${mintInfo.freezeAuthority ? "warn" : "ok"}`}
                    >
                      {mintInfo.freezeAuthority ? "active" : "renounced"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* STEP 2 — Mechanics */}
        <div className="sof-lw-card">
          <div className="sof-lw-card-head">
            <h3>2 · Mechanics</h3>
            <span className="step-num">CLAIM RULES</span>
          </div>
          <div className="sof-lw-card-body">
            <div className="sof-lw-grp">
              <label className="sof-lw-lab">
                Claim rate basis{" "}
                <span className="hint">unitless reference; UI/SDK math derives off this</span>
              </label>
              <div className="sof-lw-row-2">
                <div className="sof-lw-input-wrap">
                  <input
                    className="sof-lw-input with-suffix"
                    value={claimRateBasis}
                    onChange={(e) =>
                      setClaimRateBasis(
                        e.target.value.replace(/[^0-9]/g, ""),
                      )
                    }
                  />
                  <span className="suffix">rate</span>
                </div>
                <div className="sof-lw-input-wrap">
                  <input
                    className="sof-lw-input with-suffix"
                    value={perClaimCapBps}
                    onChange={(e) =>
                      setPerClaimCapBps(
                        e.target.value.replace(/[^0-9]/g, ""),
                      )
                    }
                    placeholder="500"
                  />
                  <span className="suffix">bps cap</span>
                </div>
              </div>
              <div className="sof-lw-help">
                Per-claim cap in basis points (10–10000 = 0.1%–100%). Holders
                above the cap receive cap × pool_remaining.
              </div>
            </div>

            <div className="sof-lw-grp">
              <label className="sof-lw-lab">Snapshot cadence</label>
              <div
                className="sof-lw-seg"
                role="radiogroup"
                aria-label="Snapshot cadence"
              >
                {CADENCES.map((c) => (
                  <button
                    type="button"
                    key={c.value}
                    className={cadence === c.value ? "on" : undefined}
                    onClick={() => setCadence(c.value)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="sof-lw-grp">
              <label className="sof-lw-lab">Pool empty strategy</label>
              <div className="sof-lw-seg" role="radiogroup">
                <button
                  type="button"
                  className={empty === "proRata" ? "on" : undefined}
                  onClick={() => setEmpty("proRata")}
                >
                  Pro-rata
                </button>
                <button
                  type="button"
                  className={empty === "fcfs" ? "on" : undefined}
                  onClick={() => setEmpty("fcfs")}
                >
                  First-come-first-served
                </button>
              </div>
            </div>

            <div className="sof-lw-grp">
              <label className="sof-lw-lab">Claim window</label>
              <div className="sof-lw-row-2">
                <div className="sof-lw-input-wrap">
                  <input
                    className="sof-lw-input with-suffix"
                    value={windowDays}
                    onChange={(e) =>
                      setWindowDays(e.target.value.replace(/[^0-9]/g, ""))
                    }
                  />
                  <span className="suffix">
                    {windowDays === "0" ? "open-ended" : "days"}
                  </span>
                </div>
                <div
                  className="sof-lw-help"
                  style={{ alignSelf: "center", marginTop: 0 }}
                >
                  0 = open-ended (close manually).
                </div>
              </div>
            </div>

            {requiresFreezeAck && (
              <div className="sof-lw-grp">
                <label className="sof-lw-consent">
                  <input
                    type="checkbox"
                    checked={freezeAck}
                    onChange={(e) => setFreezeAck(e.target.checked)}
                  />
                  <span>
                    I acknowledge this token has an active freeze authority and
                    holders could be frozen mid-claim.
                  </span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* STEP 3 — Pool funding */}
        <div className="sof-lw-card">
          <div className="sof-lw-card-head">
            <h3>3 · Pool size</h3>
            <span className="step-num">FUNDED AT LAUNCH</span>
          </div>
          <div className="sof-lw-card-body">
            <div className="sof-lw-grp">
              <label className="sof-lw-lab">
                Initial pool{" "}
                <span className="hint">
                  whole tokens (decimals applied: ×10^{mintInfo?.decimals ?? "?"})
                </span>
              </label>
              <div className="sof-lw-input-wrap">
                <input
                  className="sof-lw-input with-suffix"
                  value={poolWhole}
                  onChange={(e) =>
                    setPoolWhole(e.target.value.replace(/[^0-9.]/g, ""))
                  }
                />
                <span className="suffix">tokens</span>
              </div>
              <div className="sof-lw-help">
                Plus a 1% deposit fee to the platform swap ATA. Make sure
                your wallet holds {poolWhole}+ {mintInfo ? "of this token" : "tokens"}.
              </div>
            </div>
          </div>
        </div>

        {/* STEP 4 — Sign */}
        <div className="sof-lw-card">
          <div className="sof-lw-card-head">
            <h3>4 · Sign &amp; launch</h3>
            <span className="step-num">FINAL</span>
          </div>
          <div className="sof-lw-card-body">
            {!connected ? (
              <button
                type="button"
                className="sof-btn sof-btn-primary"
                onClick={openConnectModal}
              >
                Connect wallet
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="sof-btn sof-btn-primary"
                  onClick={handleSubmit}
                  disabled={!ready}
                >
                  {submitting ? (
                    <>
                      <Loader2
                        size={14}
                        className="sof-spin"
                        style={{ animation: "sof-spin 1s linear infinite" }}
                      />
                      Launching…
                    </>
                  ) : (
                    <>
                      Sign &amp; launch refinery <ArrowRight size={14} />
                    </>
                  )}
                </button>
                {blockReason && (
                  <div
                    className="sof-lw-help"
                    style={{
                      marginTop: 10,
                      color: "var(--warning)",
                    }}
                  >
                    ⚠ {blockReason}
                  </div>
                )}
              </>
            )}
            {submitErr && (
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 12px",
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "var(--error)",
                  borderRadius: 6,
                  fontSize: 12.5,
                }}
              >
                {submitErr}
              </div>
            )}
            {signature && (
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 12px",
                  background: "rgba(34,197,94,0.08)",
                  border: "1px solid rgba(34,197,94,0.3)",
                  color: "var(--success)",
                  borderRadius: 6,
                  fontSize: 12.5,
                }}
              >
                Refinery launched.{" "}
                <a
                  href={explorerUrl(signature, "tx")}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "var(--accent)" }}
                >
                  View tx <ExternalLink size={11} />
                </a>{" "}
                · redirecting…
              </div>
            )}
          </div>
        </div>
      </div>

      <aside className="sof-lw-aside">
        <div className="sof-lw-card sof-lw-summary-card">
          <div className="head">
            <h4>Refinery preview</h4>
            <div className="nm">
              {mintInfo ? `${Number(poolWhole).toLocaleString()} tokens` : "—"}
            </div>
          </div>
          <div className="body">
            <div className="row">
              <span className="k">Decimals</span>
              <span className="v">{mintInfo?.decimals ?? "—"}</span>
            </div>
            <div className="row">
              <span className="k">Verified deployer</span>
              <span className="v">
                {operatorIsMintAuthority ? "yes" : "no (CTO)"}
              </span>
            </div>
            <div className="row">
              <span className="k">Cap</span>
              <span className="v">
                {Number(perClaimCapBps) / 100}%
              </span>
            </div>
            <div className="row">
              <span className="k">Cadence</span>
              <span className="v">{cadence}</span>
            </div>
            <div className="row">
              <span className="k">Window</span>
              <span className="v">
                {windowDays === "0" ? "open-ended" : `${windowDays}d`}
              </span>
            </div>
            <div className="row acc">
              <span className="k">Launch fee</span>
              <span className="v">0.1 SOL</span>
            </div>
          </div>
        </div>

        <div className="sof-lw-card sof-lw-help-card">
          <h5>What happens next</h5>
          <p style={{ margin: "0 0 8px" }}>
            After you sign, the program creates a PDA escrow, transfers your
            pool tokens + 1% fee, and the refinery becomes Active. Snapshots
            land via the platform&apos;s snapshot authority.
          </p>
          <p style={{ margin: 0 }}>
            You can deposit, withdraw (after window), or close the refinery
            from its detail page.
          </p>
        </div>
      </aside>
    </div>
  );
}
