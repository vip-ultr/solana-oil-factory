"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { useWalletConnection } from "@solana/react-hooks";

/* ── Solana-only connector filter ────────────────────────────────────── */
const SOLANA_WALLET_IDS = [
  "phantom", "solflare", "backpack", "coinbase", "coin98", "trust",
  "brave", "exodus", "glow", "slope", "torus", "math", "clover",
  "tokenpocket", "bitget", "okx",
];

function isSolanaConnector(c: { id: string; name: string }): boolean {
  const id = c.id.toLowerCase();
  const name = c.name.toLowerCase();
  if (["sui", "ethereum", "metamask", "rabby", "aptos"].some(
    (x) => id.includes(x) || name.includes(x)
  )) return false;
  // Allow MWA connector through
  if (id.includes("mobile wallet adapter") || name.includes("mobile wallet adapter")) return true;
  if (SOLANA_WALLET_IDS.some((w) => id.includes(w) || name.includes(w))) return true;
  if (id.startsWith("wallet-standard:")) return true;
  return true;
}

/* ── Mobile detection ────────────────────────────────────────────────── */
function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
}

/** Detect if we're inside a wallet's in-app browser (injected provider exists) */
function isInWalletBrowser(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as Record<string, unknown>;
  return !!(w.phantom as Record<string, unknown>)?.solana || !!w.solflare || !!w.backpack || !!w.solana;
}

/* ── Deep-link wallets for mobile ────────────────────────────────────── */
const MOBILE_WALLETS = [
  {
    name: "Phantom",
    icon: "https://raw.githubusercontent.com/nicovend/phantom-wallet-logo/main/phantom-icon-purple.png",
    getLink: (url: string) =>
      `https://phantom.app/ul/browse/${encodeURIComponent(url)}?ref=${encodeURIComponent(new URL(url).origin)}`,
  },
  {
    name: "Solflare",
    icon: "https://solflare.com/favicon.ico",
    getLink: (url: string) =>
      `https://solflare.com/ul/v1/browse/${encodeURIComponent(url)}`,
  },
  {
    name: "Backpack",
    icon: "https://backpack.app/favicon.ico",
    getLink: (url: string) =>
      `https://backpack.app/ul/browse/${encodeURIComponent(url)}`,
  },
];

/* ── Component ───────────────────────────────────────────────────────── */
interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletConnectModal({ isOpen, onClose }: WalletConnectModalProps) {
  const { connectors, connect, connecting, isReady, connected } = useWalletConnection();
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);
  const abortRef = useRef(false);

  // Filter to Solana-only discovered connectors (extensions / injected)
  const solanaConnectors = connectors.filter(isSolanaConnector);

  const mobile = typeof window !== "undefined" ? isMobile() : false;
  const inWalletBrowser = typeof window !== "undefined" ? isInWalletBrowser() : false;

  // On mobile (regular browser): always show deep-links so users can open in wallet browser
  // Hide deep-links if already inside a wallet browser (injected provider works directly)
  const showDeepLinks = mobile && !inWalletBrowser;
  // Show discovered connectors (extensions, injected providers, MWA) whenever available
  const showConnectors = solanaConnectors.length > 0;

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

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
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
      await connect(connector.id);
    } catch (err) {
      if (abortRef.current) return;
      const msg = err instanceof Error ? err.message : "Connection failed";
      if (msg.includes("reject") || msg.includes("cancel") || msg.includes("denied")) {
        setConnectError("Connection rejected. Please approve in your wallet.");
      } else {
        setConnectError(`Failed to connect to ${connector.name}. Try again.`);
      }
    } finally {
      if (!abortRef.current) setConnectingId(null);
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

  return (
    <div className="wcm-backdrop" onClick={handleBackdropClick}>
      <div className="wcm-modal">
        <div className="wcm-header">
          <h3 className="wcm-title">Connect a Wallet</h3>
          <button onClick={onClose} className="wcm-close" aria-label="Close">
            &times;
          </button>
        </div>

        {/* Error */}
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

        {/* ── Connecting state ── */}
        {isConnecting && connectingWallet && (
          <div className="wcm-connecting-state">
            {connectingWallet.icon && (
              <img src={connectingWallet.icon} alt="" className="wcm-connecting-icon" width={48} height={48} />
            )}
            <p className="wcm-connecting-text">
              Connecting to <strong>{connectingWallet.name}</strong>...
            </p>
            <p className="wcm-connecting-hint">Approve the connection in your wallet.</p>
            <div className="wcm-connecting-spinner" />
            <button onClick={handleCancel} className="wcm-cancel-btn">Cancel</button>
          </div>
        )}

        {/* ── Detecting wallets ── */}
        {!isReady && !isConnecting && !showDeepLinks && (
          <p className="wcm-desc">Detecting wallets...</p>
        )}

        {/* ══════════════════════════════════════════════════
           Discovered connectors (MWA, extensions, injected)
           ══════════════════════════════════════════════════ */}
        {isReady && showConnectors && !isConnecting && (
          <>
            <p className="wcm-desc">
              {inWalletBrowser
                ? "Tap to connect your wallet."
                : "Select a wallet to connect."}
            </p>
            <div className="wcm-list">
              {solanaConnectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => handleConnect(connector)}
                  className="wcm-wallet-btn"
                  disabled={connecting}
                >
                  {connector.icon ? (
                    <img src={connector.icon} alt={connector.name} className="wcm-wallet-icon" width={32} height={32} />
                  ) : (
                    <div className="wcm-wallet-icon-placeholder" />
                  )}
                  <div className="wcm-wallet-info">
                    <span className="wcm-wallet-name">{connector.name}</span>
                    <span className="wcm-wallet-action">Connect</span>
                  </div>
                  <svg className="wcm-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════
           MOBILE — Deep-link wallets (open in wallet browser)
           Shown alongside MWA / connectors as an alternative.
           ══════════════════════════════════════════════════ */}
        {showDeepLinks && !isConnecting && (
          <>
            {showConnectors && (
              <div className="wcm-section-label">Or open in wallet app</div>
            )}
            {!showConnectors && (
              <p className="wcm-desc">Open this app in your wallet to connect.</p>
            )}
            <div className="wcm-list">
              {MOBILE_WALLETS.map((w) => (
                <a
                  key={w.name}
                  href={w.getLink(window.location.href)}
                  rel="noopener noreferrer"
                  className="wcm-wallet-btn"
                >
                  <img src={w.icon} alt={w.name} className="wcm-wallet-icon" width={32} height={32} />
                  <div className="wcm-wallet-info">
                    <span className="wcm-wallet-name">{w.name}</span>
                    <span className="wcm-wallet-action">Open in {w.name}</span>
                  </div>
                  <svg className="wcm-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </a>
              ))}
            </div>
          </>
        )}

        {/* ── No wallets at all (desktop, no extensions) ── */}
        {isReady && !showConnectors && !showDeepLinks && !isConnecting && (
          <>
            <p className="wcm-desc">
              No Solana wallets detected. Install a wallet extension to continue.
            </p>
            <div className="wcm-list">
              <a href="https://phantom.app/" target="_blank" rel="noopener noreferrer" className="wcm-wallet-btn">
                <img src="/phantom-icon.png" alt="Phantom" className="wcm-wallet-icon" width={32} height={32} />
                <div className="wcm-wallet-info">
                  <span className="wcm-wallet-name">Phantom</span>
                  <span className="wcm-wallet-action">Get Wallet</span>
                </div>
                <svg className="wcm-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </a>
              <a href="https://solflare.com/" target="_blank" rel="noopener noreferrer" className="wcm-wallet-btn">
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

        <div className="wcm-divider"><span>or</span></div>

        <p className="wcm-alt-text">
          Use the <strong>search bar</strong> to look up any Solana wallet address without connecting.
        </p>
      </div>
    </div>
  );
}
