"use client";

import { useEffect, useMemo, useState } from "react";
import { useWalletConnection } from "@solana/react-hooks";
import { PublicKey } from "@solana/web3.js";
import { ExternalLink, Loader2 } from "lucide-react";
import { useSiws } from "@/components/sof/SiwsProvider";
import {
  getClientProgram,
  sendTx,
  treasuryConfigPda,
  type ClientWallet,
} from "@/lib/onchain/writeClient";
import { explorerUrl } from "@/lib/program";

type Kind = "snapshot" | "pause" | "admin";

interface TreasuryView {
  admin: string;
  snapshotAuthority: string;
  pauseAuthority: string;
  feeReceiverSol: string;
}

const KIND_LABEL: Record<Kind, string> = {
  snapshot: "Snapshot authority",
  pause: "Pause authority",
  admin: "Admin (rotate this key with care)",
};

// Anchor enum variant lookup — matches the rotate_authority IDL.
const KIND_VARIANT: Record<Kind, unknown> = {
  snapshot: { snapshotAuthority: {} },
  pause: { pauseAuthority: {} },
  admin: { admin: {} },
};

export function AdminClient() {
  const { wallet, connected } = useWalletConnection();
  const { authed } = useSiws();
  const connectedAddress = wallet?.account?.address?.toString() ?? null;

  const [cfg, setCfg] = useState<TreasuryView | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [kind, setKind] = useState<Kind>("snapshot");
  const [newAuth, setNewAuth] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [sig, setSig] = useState<string | null>(null);

  const isAdmin = useMemo(() => {
    if (!cfg || !connectedAddress) return false;
    return cfg.admin === connectedAddress;
  }, [cfg, connectedAddress]);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/treasury")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then((data) => {
        if (cancelled) return;
        setCfg({
          admin: data.admin,
          snapshotAuthority: data.snapshotAuthority,
          pauseAuthority: data.pauseAuthority,
          feeReceiverSol: data.feeReceiverSol,
        });
      })
      .catch((e) => {
        if (cancelled) return;
        setLoadErr(typeof e === "string" ? e : "Could not load treasury config");
      });
    return () => {
      cancelled = true;
    };
  }, [sig]);

  async function handleRotate() {
    if (!wallet?.account || !wallet.signTransaction) return;
    setBusy(true);
    setErr(null);
    setSig(null);
    try {
      let newAuthPk: PublicKey;
      try {
        newAuthPk = new PublicKey(newAuth.trim());
      } catch {
        throw new Error("New authority is not a valid Solana pubkey");
      }
      if (newAuthPk.equals(PublicKey.default)) {
        throw new Error("New authority cannot be the all-zero pubkey");
      }
      const adapter: ClientWallet = {
        publicKey: new PublicKey(wallet.account.address.toString()),
        signTransaction: async (tx) =>
          (await wallet.signTransaction!(tx as never)) as never,
        connectorName: wallet.connector?.name,
      };
      const program = getClientProgram(adapter);
      const ix = await program.methods
        .rotateAuthority({
          which: KIND_VARIANT[kind] as never,
          newAuthority: newAuthPk,
        } as never)
        .accounts({
          admin: adapter.publicKey,
          treasuryConfig: treasuryConfigPda(),
        } as never)
        .instruction();
      const txSig = await sendTx(adapter, [ix]);
      setSig(txSig);
      setNewAuth("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="sof-admin-page"
      style={{ maxWidth: 720, margin: "0 auto" }}
    >
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em" }}>
          Admin
        </h1>
        <p style={{ color: "var(--text-tertiary)", marginTop: 6 }}>
          Rotate platform authorities. Restricted to the wallet recorded as{" "}
          <code>treasury_config.admin</code> on-chain.
        </p>
      </header>

      {loadErr && (
        <div
          style={{
            padding: "10px 12px",
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "var(--error)",
            borderRadius: 6,
            fontSize: 12.5,
            marginBottom: 16,
          }}
        >
          {loadErr}
        </div>
      )}

      {cfg && (
        <section
          style={{
            border: "1px solid var(--border-subtle)",
            borderRadius: 8,
            padding: 18,
            marginBottom: 24,
            background: "var(--bg-elevated)",
          }}
        >
          <h2 style={{ fontSize: 14, marginBottom: 12, color: "var(--text-secondary)" }}>
            Current authorities
          </h2>
          <KvRow k="admin" v={cfg.admin} highlight={isAdmin} />
          <KvRow k="snapshot_authority" v={cfg.snapshotAuthority} />
          <KvRow k="pause_authority" v={cfg.pauseAuthority} />
          <KvRow k="fee_receiver_sol" v={cfg.feeReceiverSol} />
        </section>
      )}

      {!connected ? (
        <Note kind="muted">Connect a wallet to continue.</Note>
      ) : !authed ? (
        <Note kind="muted">
          Sign the verify message in the sidebar to continue.
        </Note>
      ) : !cfg ? (
        <Note kind="muted">Loading treasury config…</Note>
      ) : !isAdmin ? (
        <Note kind="warn">
          This wallet ({connectedAddress?.slice(0, 6)}…{connectedAddress?.slice(-4)})
          is not the treasury admin. Switch to <code>{cfg.admin.slice(0, 6)}…{cfg.admin.slice(-4)}</code>{" "}
          to rotate authorities.
        </Note>
      ) : (
        <section
          style={{
            border: "1px solid var(--border-subtle)",
            borderRadius: 8,
            padding: 18,
            background: "var(--bg-elevated)",
          }}
        >
          <h2 style={{ fontSize: 14, marginBottom: 12, color: "var(--text-secondary)" }}>
            Rotate authority
          </h2>

          <label style={{ display: "block", marginBottom: 12 }}>
            <span style={{ display: "block", fontSize: 12, color: "var(--text-tertiary)", marginBottom: 6 }}>
              Which authority
            </span>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as Kind)}
              disabled={busy}
              style={{
                width: "100%",
                padding: "8px 10px",
                background: "var(--bg-input)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 6,
                fontSize: 13,
              }}
            >
              {(Object.keys(KIND_LABEL) as Kind[]).map((k) => (
                <option key={k} value={k}>
                  {KIND_LABEL[k]}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "block", marginBottom: 14 }}>
            <span style={{ display: "block", fontSize: 12, color: "var(--text-tertiary)", marginBottom: 6 }}>
              New authority pubkey
            </span>
            <input
              type="text"
              placeholder="e.g. 81uN…m9pE"
              value={newAuth}
              onChange={(e) => setNewAuth(e.target.value)}
              disabled={busy}
              spellCheck={false}
              style={{
                width: "100%",
                padding: "8px 10px",
                background: "var(--bg-input)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 6,
                fontSize: 13,
                fontFamily: "var(--font-mono, monospace)",
              }}
            />
          </label>

          <button
            type="button"
            className="sof-btn sof-btn-primary"
            disabled={busy || newAuth.trim().length < 32}
            onClick={handleRotate}
            style={{ width: "100%" }}
          >
            {busy ? (
              <>
                <Loader2 size={14} style={{ animation: "sof-spin 1s linear infinite" }} />
                Rotating…
              </>
            ) : (
              <>Sign &amp; rotate</>
            )}
          </button>

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
          {sig && (
            <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-tertiary)" }}>
              Rotated.{" "}
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
        </section>
      )}
    </div>
  );
}

function KvRow({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 10,
        padding: "6px 0",
        borderBottom: "1px solid var(--border-subtle)",
        fontSize: 12.5,
      }}
    >
      <span style={{ color: "var(--text-tertiary)" }}>{k}</span>
      <code
        style={{
          fontFamily: "var(--font-mono, monospace)",
          color: highlight ? "var(--accent)" : "var(--text-primary)",
        }}
      >
        {v}
      </code>
    </div>
  );
}

function Note({ kind, children }: { kind: "muted" | "warn"; children: React.ReactNode }) {
  const style: React.CSSProperties =
    kind === "warn"
      ? {
          padding: "12px 14px",
          background: "rgba(245,166,35,0.08)",
          border: "1px solid rgba(245,166,35,0.3)",
          color: "var(--warning)",
          borderRadius: 6,
          fontSize: 13,
          lineHeight: 1.55,
        }
      : {
          padding: "12px 14px",
          background: "var(--bg-input)",
          border: "1px solid var(--border-subtle)",
          color: "var(--text-tertiary)",
          borderRadius: 6,
          fontSize: 13,
          lineHeight: 1.55,
        };
  return <div style={style}>{children}</div>;
}
