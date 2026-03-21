"use client";

import { useEffect, useCallback, useState } from "react";
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
  // (the Solana autoDiscover primarily finds Solana wallets)
  if (id.startsWith("wallet-standard:")) {
    return true;
  }

  return true;
}

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletConnectModal({
  isOpen,
  onClose,
}: WalletConnectModalProps) {
  const { connectors, connect, connecting, isReady } = useWalletConnection();
  const [connectingId, setConnectingId] = useState<string | null>(null);

  // Filter to Solana-only wallets
  const solanaConnectors = connectors.filter(isSolanaConnector);

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

  const handleConnect = async (connectorId: string) => {
    setConnectingId(connectorId);
    try {
      await connect(connectorId);
      onClose();
    } catch {
      // User rejected or connection failed — stay on modal
    } finally {
      setConnectingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="wcm-backdrop" onClick={handleBackdropClick}>
      <div className="wcm-modal">
        <div className="wcm-header">
          <h3 className="wcm-title">Connect a Wallet</h3>
          <button onClick={onClose} className="wcm-close" aria-label="Close">
            &times;
          </button>
        </div>

        {/* Loading state — waiting for wallet discovery */}
        {!isReady && (
          <p className="wcm-desc">Detecting wallets...</p>
        )}

        {/* Discovered Solana wallets */}
        {isReady && solanaConnectors.length > 0 && (
          <>
            <p className="wcm-desc">Select a wallet to connect.</p>
            <div className="wcm-list">
              {solanaConnectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => handleConnect(connector.id)}
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
                    <span className="wcm-wallet-action">
                      {connectingId === connector.id ? "Connecting..." : "Connect"}
                    </span>
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
        {isReady && solanaConnectors.length === 0 && (
          <>
            <p className="wcm-desc">
              No Solana wallets detected. Install a wallet to continue.
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
