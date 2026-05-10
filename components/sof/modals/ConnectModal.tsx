"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

type Phase = "pick" | "signing";

interface Props {
  open: boolean;
  onClose: () => void;
}

const WALLETS = [
  { key: "phantom", name: "Phantom", icon: "/phantom-icon.png", det: "DETECTED", detected: true },
  { key: "solflare", name: "Solflare", icon: "/solflare-icon.png", det: "Install ↗", detected: false },
  { key: "backpack", name: "Backpack", icon: "/backpack-icon.png", det: "Install ↗", detected: false },
];

export function ConnectModal({ open, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>("pick");
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  // Reset phase when modal opens
  useEffect(() => {
    if (open) setPhase("pick");
  }, [open]);

  if (!open) return null;

  function handlePick(walletKey: string) {
    setPicked(walletKey);
    setPhase("signing");
    // Mock signing — in production this calls the wallet adapter.
    setTimeout(() => {
      // No-op for v1 mock; just leaves the spinner up.
    }, 0);
  }

  return (
    <div
      className="sof-mo-scrim"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sof-mo-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="sof-mo-modal">
        {phase === "pick" ? (
          <>
            <div className="sof-mo-h">
              <div>
                <h3 id="sof-mo-title">Connect wallet</h3>
                <p>
                  Choose a Solana wallet. We&apos;ll request a free signature
                  challenge — never an approval transaction.
                </p>
              </div>
              <button
                type="button"
                className="x"
                onClick={onClose}
                aria-label="Close connect modal"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <div className="sof-mo-wallets">
              {WALLETS.map((w) => (
                <button
                  key={w.key}
                  type="button"
                  className={`sof-mo-wallet-opt${w.detected ? " detected" : ""}`}
                  onClick={() => handlePick(w.key)}
                >
                  <Image src={w.icon} alt="" width={28} height={28} />
                  <span className="nm">{w.name}</span>
                  <span className="det">{w.det}</span>
                  <span className="arrow">→</span>
                </button>
              ))}
              <button type="button" className="sof-mo-wallet-opt">
                <span className="more-ic" aria-hidden="true">⋯</span>
                <span className="nm">More wallets</span>
                <span className="det">22 supported</span>
                <span className="arrow">→</span>
              </button>
            </div>
            <div className="sof-mo-foot">
              <div className="row">
                <Check strokeWidth={2} aria-hidden="true" />
                <span>
                  <b style={{ color: "var(--text-primary)" }}>Non-custodial.</b> We
                  never see or store your private key.
                </span>
              </div>
              <div className="row">
                <Check strokeWidth={2} aria-hidden="true" />
                <span>
                  <b style={{ color: "var(--text-primary)" }}>
                    No transaction at connect.
                  </b>{" "}
                  Just a free signature to prove you own the wallet.
                </span>
              </div>
              <div style={{ marginTop: 8 }}>
                By connecting you agree to the <a>terms</a>. Programs are{" "}
                <a>verified on-chain</a>.
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="sof-mo-h">
              <div>
                <h3 id="sof-mo-title">Sign to verify</h3>
                <p>
                  Approve the signature request in your{" "}
                  {WALLETS.find((w) => w.key === picked)?.name ?? "wallet"}.
                  This is free and never moves funds.
                </p>
              </div>
              <button
                type="button"
                className="x"
                onClick={onClose}
                aria-label="Cancel signing"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <div className="sof-mo-signing">
              <div className="ring" aria-hidden="true" />
              <h4>
                Waiting for{" "}
                {WALLETS.find((w) => w.key === picked)?.name ?? "your wallet"}…
              </h4>
              <p>
                You&apos;ll see a popup asking to sign a message. The request
                includes only a domain and timestamp.
              </p>
              <div className="wallet-prompt">
                Sign in with: <b>solanaoilfactory.com</b>
                <br />
                Wallet: <b>Hxk2…7gPZ</b>
                <br />
                Issued: <b>{new Date().toISOString()}</b>
                <br />
                Nonce: <b>f4xAKMdRq2…</b>
              </div>
            </div>
            <div className="sof-mo-foot">
              <div
                className="row"
                style={{
                  color: "var(--text-tertiary)",
                  justifyContent: "center",
                }}
              >
                <span>
                  Wallet not responding?{" "}
                  <a onClick={() => setPhase("pick")}>Cancel and retry →</a>
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
