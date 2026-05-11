"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, X } from "lucide-react";
import { useWalletConnection } from "@solana/react-hooks";
import { useSiws } from "@/components/sof/SiwsProvider";

/**
 * Mobile detection — UA-based. We only use this to decide whether
 * to surface the in-app-browser deeplink fallback when no
 * wallet-standard connectors show up.
 */
function detectMobile(): { isMobile: boolean; isIos: boolean; isAndroid: boolean } {
  if (typeof navigator === "undefined") {
    return { isMobile: false, isIos: false, isAndroid: false };
  }
  const ua = navigator.userAgent;
  const isAndroid = /android/i.test(ua);
  const isIos = /iPhone|iPad|iPod/i.test(ua);
  return { isMobile: isAndroid || isIos, isIos, isAndroid };
}

/**
 * Trampoline deeplinks that open this URL inside the wallet's
 * built-in browser. Once the page reloads inside the wallet,
 * wallet-standard injects normally and the modal works as on
 * desktop. We deliberately skip the encrypted v1 connect protocol
 * — too heavy for a web dapp's one-time handshake.
 */
function walletBrowserDeeplinks(): { phantom: string; solflare: string } {
  if (typeof window === "undefined") {
    return { phantom: "https://phantom.app/", solflare: "https://solflare.com/" };
  }
  const here = window.location.href;
  const host = window.location.host;
  return {
    phantom: `https://phantom.app/ul/browse/${encodeURIComponent(here)}?ref=${encodeURIComponent(host)}`,
    solflare: `https://solflare.com/ul/v1/browse/${encodeURIComponent(here)}?ref=${encodeURIComponent(host)}`,
  };
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ConnectModal({ open, onClose }: Props) {
  const {
    connectors,
    connect,
    connected,
    connecting,
    isReady,
    error,
    currentConnector,
  } = useWalletConnection();
  const siws = useSiws();

  // Local UI state for the "you can install this one" rows that
  // aren't actually wallet-standard ready yet.
  const [picked, setPicked] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // Wait a short beat after open for wallet-standard registrations
  // to land (MWA on Android registers asynchronously). After the
  // grace period we treat "still zero ready connectors on mobile"
  // as the signal to offer the in-app-browser deeplinks.
  const env = useMemo(() => detectMobile(), []);
  const [grace, setGrace] = useState(true);
  useEffect(() => {
    if (!open) return;
    setGrace(true);
    const id = setTimeout(() => setGrace(false), 1200);
    return () => clearTimeout(id);
  }, [open]);

  const readyConnectorCount = connectors.filter((c) => c.ready).length;
  const showDeeplinkPane =
    env.isMobile && isReady && !grace && readyConnectorCount === 0;

  // Auto-close once the wallet is connected AND a SIWS payload
  // exists. We also auto-trigger the SIWS sign right after a
  // fresh handshake.
  useEffect(() => {
    if (!open) return;
    if (!connected) return;
    if (siws.authed) {
      onClose();
      return;
    }
    if (!siws.signing && !siws.error) {
      void siws.signIn();
    }
  }, [open, connected, siws, onClose]);

  // Modal lifecycle: lock body scroll, hook Esc, reset on open.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
      setPicked(null);
      setLocalError(null);
    }
    return () => {
      removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  async function handlePick(connectorId: string, name: string) {
    setPicked(connectorId);
    setLocalError(null);
    try {
      await connect(connectorId);
      // useEffect above closes the modal once `connected` flips.
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : `Could not connect to ${name}`,
      );
    }
  }

  // We're "signing" while the wallet handshake is in flight OR
  // while SIWS is asking for the message signature. The picker
  // re-shows on error so users can pick a different wallet.
  const showSigning =
    (connecting && !localError) ||
    (connected && !siws.authed && !localError && !siws.error) ||
    (picked !== null && currentConnector?.id !== picked && !localError);
  const errorMessage =
    localError ??
    siws.error ??
    (error instanceof Error ? error.message : null);
  const signingForSiws = connected && !siws.authed && !siws.error;

  // Connectors come from wallet-standard discovery — Phantom,
  // Solflare, Backpack etc. all show up automatically when their
  // browser extensions are installed. `ready` is false for
  // wallets the user hasn't installed yet; we still surface them
  // so they can be prompted to install.
  const sortedConnectors = [...connectors].sort((a, b) => {
    // Ready wallets first, then alphabetical.
    if (a.ready && !b.ready) return -1;
    if (b.ready && !a.ready) return 1;
    return a.name.localeCompare(b.name);
  });

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
        {showSigning ? (
          <SigningPhase
            connectorName={picked
              ? (sortedConnectors.find((c) => c.id === picked)?.name ?? "wallet")
              : "wallet"}
            errorMessage={errorMessage}
            stage={signingForSiws ? "siws" : "handshake"}
            onCancel={() => {
              setPicked(null);
              setLocalError(null);
            }}
            onClose={onClose}
          />
        ) : showDeeplinkPane ? (
          <DeeplinkPane onClose={onClose} isIos={env.isIos} />
        ) : (
          <PickPhase
            connectors={sortedConnectors}
            isReady={isReady && !grace}
            errorMessage={errorMessage}
            onPick={handlePick}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}

interface PickProps {
  connectors: ReturnType<typeof useWalletConnection>["connectors"];
  isReady: boolean;
  errorMessage: string | null;
  onPick: (connectorId: string, name: string) => void;
  onClose: () => void;
}

function PickPhase({
  connectors,
  isReady,
  errorMessage,
  onPick,
  onClose,
}: PickProps) {
  return (
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
        {!isReady ? (
          <div
            style={{
              padding: "20px 14px",
              fontSize: 12.5,
              color: "var(--text-tertiary)",
            }}
          >
            Detecting installed wallets…
          </div>
        ) : connectors.length === 0 ? (
          <div
            style={{
              padding: "20px 14px",
              fontSize: 12.5,
              color: "var(--text-tertiary)",
              lineHeight: 1.55,
            }}
          >
            No Solana wallets detected. Install{" "}
            <a
              href="https://phantom.app/"
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--accent)" }}
            >
              Phantom
            </a>
            ,{" "}
            <a
              href="https://solflare.com/"
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--accent)" }}
            >
              Solflare
            </a>
            , or{" "}
            <a
              href="https://backpack.app/"
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--accent)" }}
            >
              Backpack
            </a>{" "}
            and reload.
          </div>
        ) : (
          connectors.map((c) => {
            const ready = c.ready ?? true;
            return (
              <button
                key={c.id}
                type="button"
                className={`sof-mo-wallet-opt${ready ? " detected" : ""}`}
                onClick={() => ready && onPick(c.id, c.name)}
                disabled={!ready}
                aria-disabled={!ready}
              >
                {c.icon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.icon} alt="" width={28} height={28} />
                ) : (
                  <span className="more-ic" aria-hidden="true">
                    {c.name.slice(0, 1)}
                  </span>
                )}
                <span className="nm">{c.name}</span>
                <span className="det">{ready ? "DETECTED" : "Install ↗"}</span>
                <span className="arrow">→</span>
              </button>
            );
          })
        )}
      </div>

      {errorMessage && (
        <div
          role="alert"
          style={{
            margin: "0 16px 4px",
            padding: "10px 12px",
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "var(--error)",
            borderRadius: 6,
            fontSize: 12.5,
          }}
        >
          {errorMessage}
        </div>
      )}

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
            Just a wallet handshake to prove you own the address.
          </span>
        </div>
        <div style={{ marginTop: 8 }}>
          By connecting you agree to the{" "}
          <a href="/legal/terms">terms</a>. Programs are{" "}
          <a href="/trust">verified on-chain</a>.
        </div>
      </div>
    </>
  );
}

interface SigningProps {
  connectorName: string;
  errorMessage: string | null;
  stage: "handshake" | "siws";
  onCancel: () => void;
  onClose: () => void;
}

function SigningPhase({
  connectorName,
  errorMessage,
  stage,
  onCancel,
  onClose,
}: SigningProps) {
  const headline =
    stage === "siws"
      ? `Sign to verify in ${connectorName}`
      : `Approve in ${connectorName}`;
  const subhead =
    stage === "siws"
      ? `${connectorName} will pop up asking you to sign a message. Free signature — no SOL moves, no transaction is broadcast.`
      : `Confirm the connect prompt in your ${connectorName} extension. This is free and never moves funds.`;
  const waiting = stage === "siws" ? "signature" : "approval";

  return (
    <>
      <div className="sof-mo-h">
        <div>
          <h3 id="sof-mo-title">
            {errorMessage ? "Connection failed" : headline}
          </h3>
          <p>
            {errorMessage
              ? "Pick a different wallet or try again. No SOL was moved."
              : subhead}
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
        {errorMessage ? (
          <>
            <h4 style={{ color: "var(--error)" }}>{errorMessage}</h4>
            <p>
              The wallet may have rejected the request. Disconnect and pick a
              different wallet to retry.
            </p>
          </>
        ) : (
          <>
            <div className="ring" aria-hidden="true" />
            <h4>Waiting for {connectorName} {waiting}…</h4>
            <p>
              {stage === "siws"
                ? "We're verifying that you control this wallet. The message includes only a domain, timestamp, and a random nonce — no funds are touched."
                : "You'll see a popup asking to connect. Click approve there to continue."}
            </p>
          </>
        )}
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
            <a onClick={onCancel} style={{ cursor: "pointer" }}>
              Cancel and retry →
            </a>
          </span>
        </div>
      </div>
    </>
  );
}

interface DeeplinkPaneProps {
  onClose: () => void;
  isIos: boolean;
}

/**
 * Mobile-web fallback when wallet-standard surfaces no connectors.
 * Phantom and Solflare have no way to inject into iOS Safari or
 * mobile Chrome; the workaround the rest of the ecosystem uses is
 * a "browse" deeplink that opens THIS page inside the wallet's
 * built-in browser. Once it reopens there, our normal connect flow
 * picks up the wallet-standard surface the wallet injects.
 */
function DeeplinkPane({ onClose, isIos }: DeeplinkPaneProps) {
  const links = walletBrowserDeeplinks();
  return (
    <>
      <div className="sof-mo-h">
        <div>
          <h3 id="sof-mo-title">Open in your wallet</h3>
          <p>
            {isIos
              ? "iOS Safari can't connect to a Solana wallet directly. Open this page inside Phantom or Solflare to continue."
              : "No installed wallet was found in this browser. Open this page in your wallet app and the connect prompt will appear."}
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
        <a
          href={links.phantom}
          className="sof-mo-wallet-opt detected"
          target="_blank"
          rel="noreferrer"
        >
          <span className="more-ic" aria-hidden="true">
            P
          </span>
          <span className="nm">Open in Phantom</span>
          <span className="det">DEEPLINK</span>
          <span className="arrow">
            <ArrowRight size={14} strokeWidth={2} />
          </span>
        </a>
        <a
          href={links.solflare}
          className="sof-mo-wallet-opt detected"
          target="_blank"
          rel="noreferrer"
        >
          <span className="more-ic" aria-hidden="true">
            S
          </span>
          <span className="nm">Open in Solflare</span>
          <span className="det">DEEPLINK</span>
          <span className="arrow">
            <ArrowRight size={14} strokeWidth={2} />
          </span>
        </a>
      </div>

      <div className="sof-mo-foot">
        <div
          className="row"
          style={{
            color: "var(--text-tertiary)",
            lineHeight: 1.55,
            fontSize: 12,
          }}
        >
          <span>
            Don&apos;t have a wallet yet? Install{" "}
            <a
              href="https://phantom.app/download"
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--accent)" }}
            >
              Phantom
            </a>{" "}
            or{" "}
            <a
              href="https://solflare.com/download"
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--accent)" }}
            >
              Solflare
            </a>{" "}
            and reload.
          </span>
        </div>
      </div>
    </>
  );
}
