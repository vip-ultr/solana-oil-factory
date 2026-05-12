"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ShieldCheck, X } from "lucide-react";
import { useWalletConnection } from "@solana/react-hooks";
import { useSiws } from "@/components/sof/SiwsProvider";
import { cn } from "@/lib/cn";

const LAST_USED_KEY = "sof:last-connector";

function readLastUsed(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(LAST_USED_KEY);
  } catch {
    return null;
  }
}

function writeLastUsed(connectorId: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LAST_USED_KEY, connectorId);
  } catch {
    // localStorage unavailable — silent.
  }
}

function detectMobile(): { isMobile: boolean; isIos: boolean; isAndroid: boolean } {
  if (typeof navigator === "undefined") {
    return { isMobile: false, isIos: false, isAndroid: false };
  }
  const ua = navigator.userAgent;
  const isAndroid = /android/i.test(ua);
  const isIos = /iPhone|iPad|iPod/i.test(ua);
  return { isMobile: isAndroid || isIos, isIos, isAndroid };
}

const DEEPLINK_WALLETS = [
  {
    id: "phantom",
    name: "Phantom",
    icon: "/phantom-icon.png",
    url: (here: string, host: string) =>
      `https://phantom.app/ul/browse/${encodeURIComponent(here)}?ref=${encodeURIComponent(host)}`,
  },
  {
    id: "solflare",
    name: "Solflare",
    icon: "/solflare-icon.png",
    url: (here: string, host: string) =>
      `https://solflare.com/ul/v1/browse/${encodeURIComponent(here)}?ref=${encodeURIComponent(host)}`,
  },
  {
    id: "backpack",
    name: "Backpack",
    icon: "/backpack-icon.png",
    url: (here: string, _host: string) =>
      `https://backpack.app/browse/${encodeURIComponent(here)}`,
  },
];

function buildDeeplinks(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const here = window.location.href;
  const host = window.location.host;
  return Object.fromEntries(
    DEEPLINK_WALLETS.map((w) => [w.id, w.url(here, host)]),
  );
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

  const [picked, setPicked] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [lastUsed, setLastUsed] = useState<string | null>(null);

  useEffect(() => {
    if (open) setLastUsed(readLastUsed());
  }, [open]);

  // Grace period: wait for wallet-standard registrations to land
  // (MWA on Android registers asynchronously).
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

  // Auto-close once wallet is connected and SIWS is satisfied.
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
      writeLastUsed(connectorId);
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : `Could not connect to ${name}`,
      );
    }
  }

  const showSigning =
    (connecting && !localError) ||
    (connected && !siws.authed && !localError && !siws.error) ||
    (picked !== null && currentConnector?.id !== picked && !localError);
  const errorMessage =
    localError ??
    siws.error ??
    (error instanceof Error ? error.message : null);
  const signingForSiws = connected && !siws.authed && !siws.error;

  const sortedConnectors = [...connectors].sort((a, b) => {
    const aLast = a.ready && a.id === lastUsed;
    const bLast = b.ready && b.id === lastUsed;
    if (aLast && !bLast) return -1;
    if (bLast && !aLast) return 1;
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
          <DeeplinkPane onClose={onClose} />
        ) : (
          <PickPhase
            connectors={sortedConnectors}
            isReady={isReady}
            errorMessage={errorMessage}
            lastUsed={lastUsed}
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
  lastUsed: string | null;
  onPick: (connectorId: string, name: string) => void;
  onClose: () => void;
}

function PickPhase({
  connectors,
  isReady,
  errorMessage,
  lastUsed,
  onPick,
  onClose,
}: PickProps) {
  const installedCount = connectors.filter((c) => c.ready).length;

  return (
    <>
      <div className="sof-mo-h">
        <div className="sof-mo-h-title">
          <h3 id="sof-mo-title">Connect a wallet</h3>
          {installedCount > 0 && (
            <span className="sof-mo-h-count">{installedCount} detected</span>
          )}
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
        {connectors.length === 0 && !isReady ? (
          <div className="sof-mo-empty">Detecting installed wallets…</div>
        ) : connectors.length === 0 ? (
          // Desktop: no extension installed — show install links as wallet rows
          DEEPLINK_WALLETS.map((w) => (
            <a
              key={w.id}
              href={`https://${w.id === "phantom" ? "phantom.app" : w.id === "solflare" ? "solflare.com" : "backpack.app"}/download`}
              className="sof-mo-wallet-opt"
              target="_blank"
              rel="noreferrer"
            >
              <Image src={w.icon} alt="" width={30} height={30} unoptimized />
              <span className="nm">{w.name}</span>
              <span className="sof-mo-tag muted">Install</span>
            </a>
          ))
        ) : (
          connectors.map((c) => {
            const ready = c.ready ?? true;
            const isLastUsed = ready && c.id === lastUsed;
            const localIcon = DEEPLINK_WALLETS.find(
              (w) => w.name.toLowerCase() === c.name.toLowerCase(),
            )?.icon;
            return (
              <button
                key={c.id}
                type="button"
                className={cn(
                  "sof-mo-wallet-opt",
                  ready && "detected",
                  isLastUsed && "last-used",
                )}
                onClick={() => ready && onPick(c.id, c.name)}
                disabled={!ready}
                aria-disabled={!ready}
              >
                {localIcon ? (
                  <Image src={localIcon} alt="" width={30} height={30} unoptimized />
                ) : c.icon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.icon} alt="" width={30} height={30} />
                ) : (
                  <span className="more-ic" aria-hidden="true">
                    {c.name.slice(0, 1)}
                  </span>
                )}
                <span className="nm">{c.name}</span>
                {isLastUsed && <span className="sof-mo-tag">Last used</span>}
                {!ready && <span className="sof-mo-tag muted">Install</span>}
              </button>
            );
          })
        )}
      </div>

      {errorMessage && (
        <div role="alert" className="sof-mo-error">
          {errorMessage}
        </div>
      )}

      <div className="sof-mo-foot">
        <div className="sof-mo-foot-trust">
          <ShieldCheck size={13} strokeWidth={2} aria-hidden="true" />
          <span>Non-custodial · Free signature · No transaction</span>
        </div>
        <div className="sof-mo-foot-legal">
          By connecting you agree to the <a href="/legal/terms">terms</a>.
          Programs are <a href="/trust">verified on-chain</a>.
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

function DeeplinkPane({ onClose }: { onClose: () => void }) {
  const [links, setLinks] = useState<Record<string, string>>({});

  useEffect(() => {
    setLinks(buildDeeplinks());
  }, []);

  return (
    <>
      <div className="sof-mo-h">
        <div className="sof-mo-h-title">
          <h3 id="sof-mo-title">Connect a wallet</h3>
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
        {DEEPLINK_WALLETS.map((w) => (
          <a
            key={w.id}
            href={links[w.id] ?? "#"}
            className="sof-mo-wallet-opt detected"
            target="_blank"
            rel="noreferrer"
          >
            <Image src={w.icon} alt="" width={30} height={30} unoptimized />
            <span className="nm">{w.name}</span>
          </a>
        ))}
      </div>

      <div className="sof-mo-foot">
        <div className="sof-mo-foot-trust">
          <ShieldCheck size={13} strokeWidth={2} aria-hidden="true" />
          <span>Non-custodial · Free signature · No transaction</span>
        </div>
        <div className="sof-mo-foot-legal">
          By connecting you agree to the <a href="/legal/terms">terms</a>.
          Programs are <a href="/trust">verified on-chain</a>.
        </div>
      </div>
    </>
  );
}
