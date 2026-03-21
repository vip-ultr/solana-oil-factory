"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { useWalletConnection } from "@solana/react-hooks";

/* ── Known Solana wallet IDs (Wallet Standard format) ────────────────── */
const SOLANA_WALLET_IDS = [
  "phantom",
  "solflare",
  "backpack",
  "coinbase",
  "coin98",
  "trust",
  "brave",
  "exodus",
  "glow",
  "slope",
  "torus",
  "math",
  "clover",
  "tokenpocket",
  "bitget",
  "okx",
  "mobile wallet adapter",
];

/** Returns true if a connector is likely a Solana wallet */
function isSolanaConnector(connector: { id: string; name: string }): boolean {
  const id = connector.id.toLowerCase();
  const name = connector.name.toLowerCase();

  // Reject known non-Solana wallet patterns
  if (
    id.includes("sui") ||
    name.includes("sui") ||
    id.includes("ethereum") ||
    id.includes("metamask") ||
    id.includes("rabby") ||
    id.includes("aptos")
  ) {
    return false;
  }

  // Accept known Solana wallet names
  if (SOLANA_WALLET_IDS.some((w) => id.includes(w) || name.includes(w))) {
    return true;
  }

  // Accept wallet-standard connectors that weren't explicitly rejected
  if (id.startsWith("wallet-standard:")) {
    return true;
  }

  return true;
}

/** Timeout-wrapped promise */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Connection to ${label} timed out. Please try again.`));
    }, ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
}

/** Detect mobile */
function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
}

const CONNECTION_TIMEOUT = 60_000; // 60 seconds for MWA handshakes

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletConnectModal({
  isOpen,
  onClose,
}: WalletConnectModalProps) {
  const { connectors, connect, connecting, isReady, connected } = useWalletConnection();
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);
  const abortRef = useRef(false);

  // Filter to Solana-only wallets
  const solanaConnectors = connectors.filter(isSolanaConnector);

  // Auto-close when connection succeeds
  useEffect(() => {
    if (connected && isOpen) {
      setConnectingId(null);
      setConnectError(null);
      onClose();
    }
  }, [connected, isOpen, onClose]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setConnectingId(null);
      setConnectError(null);
      abortRef.current = false;
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  const handleConnect = async (connector: { id: string; name: string }) => {
    setConnectingId(connector.id);
    setConnectError(null);
    abortRef.current = false;

    try {
      await withTimeout(
        connect(connector.id),
        CONNECTION_TIMEOUT,
        connector.name
      );
      // Connection succeeded — auto-close handled by useEffect
    } catch (err) {
      if (abortRef.current) return; // User cancelled

      const msg = err instanceof Error ? err.message : "Connection failed";

      if (msg.includes("reject") || msg.includes("cancel") || msg.includes("denied")) {
        setConnectError("Connection rejected. Please approve in your wallet.");
      } else if (msg.includes("timed out")) {
        setConnectError(msg);
      } else {
        setConnectError(`Failed to connect to ${connector.name}. Please try again.`);
      }
    } finally {
      if (!abortRef.current) {
        setConnectingId(null);
      }
    }
  };

  const handleCancel = () => {
    abortRef.current = true;
    setConnectingId(null);
    setConnectError(null);
  };

  if (!isOpen) return null;

  const isConnecting = connectingId !== null;
  const connectingWallet = solanaConnectors.find((c) => c.id === connectingId);
  const mobile = isMobile();

  return (
    <div className="wcm-backdrop" onClick={handleBackdropClick}>
      <div className="wcm-modal">
        <div className="wcm-header">
          <h3 className="wcm-title">Connect a Wallet</h3>
          <button onClick={onClose} className="wcm-close" aria-label="Close">
            &times;
          </button>
        </div>

        {/* Error message */}
        {connectError && (
          <div className="wcm-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{connectError}</span>
          </div>
        )}

        {/* Connecting state — show which wallet and allow cancel */}
        {isConnecting && connectingWallet && (
          <div className="wcm-connecting-state">
            {connectingWallet.icon && (
              <img
                src={connectingWallet.icon}
                alt={connectingWallet.name}
                className="wcm-connecting-icon"
                width={48}
                height={48}
              />
            )}
            <p className="wcm-connecting-text">
              Connecting to <strong>{connectingWallet.name}</strong>...
            </p>
            <p className="wcm-connecting-hint">
              {mobile
                ? "Approve the connection in your wallet app."
                : "Check your wallet extension for approval."}
            </p>
            <div className="wcm-connecting-spinner" />
            <button onClick={handleCancel} className="wcm-cancel-btn">
              Cancel
            </button>
          </div>
        )}

        {/* Loading state — waiting for wallet discovery */}
        {!isReady && !isConnecting && (
          <p className="wcm-desc">Detecting wallets...</p>
        )}

        {/* Discovered Solana wallets */}
        {isReady && solanaConnectors.length > 0 && !isConnecting && (
          <>
            <p className="wcm-desc">Select a wallet to connect.</p>
            <div className="wcm-list">
              {solanaConnectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => handleConnect(connector)}
                  className="wcm-wallet-btn"
                  disabled={connecting}
                >
                  {connector.icon ? (
                    <img
                      src={connector.icon}
                      alt={connector.name}
                      className="wcm-wallet-icon"
                      width={32}
                      height={32}
                    />
                  ) : (
                    <div className="wcm-wallet-icon-placeholder" />
                  )}
                  <div className="wcm-wallet-info">
                    <span className="wcm-wallet-name">{connector.name}</span>
                    <span className="wcm-wallet-action">Connect</span>
                  </div>
                  <svg
                    className="wcm-arrow"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              ))}
            </div>
          </>
        )}

        {/* No wallets detected — install prompt */}
        {isReady && solanaConnectors.length === 0 && !isConnecting && (
          <>
            <p className="wcm-desc">
              No Solana wallets detected.{" "}
              {mobile
                ? "Install a Solana wallet app to continue."
                : "Install a wallet extension to continue."}
            </p>
            <div className="wcm-list">
              <a
                href="https://phantom.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="wcm-wallet-btn"
              >
                <img src="/phantom-icon.png" alt="Phantom" className="wcm-wallet-icon" width={32} height={32} />
                <div className="wcm-wallet-info">
                  <span className="wcm-wallet-name">Phantom</span>
                  <span className="wcm-wallet-action">Get Wallet</span>
                </div>
                <svg className="wcm-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </a>
              <a
                href="https://solflare.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="wcm-wallet-btn"
              >
                <img src="/solflare-icon.png" alt="Solflare" className="wcm-wallet-icon" width={32} height={32} />
                <div className="wcm-wallet-info">
                  <span className="wcm-wallet-name">Solflare</span>
                  <span className="wcm-wallet-action">Get Wallet</span>
                </div>
                <svg className="wcm-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </a>
            </div>
          </>
        )}

        <div className="wcm-divider">
          <span>or</span>
        </div>

        <p className="wcm-alt-text">
          Use the <strong>search bar</strong> to look up any Solana wallet
          address without connecting.
        </p>
      </div>
    </div>
  );
}
