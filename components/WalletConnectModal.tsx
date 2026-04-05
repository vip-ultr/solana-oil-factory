"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { useWalletConnection } from "@solana/react-hooks";
import { getWallets } from "@wallet-standard/app";
import type { Wallet } from "@wallet-standard/base";

/* ── Solana-only connector filter ────────────────────────────────────── */
const NON_SOLANA = ["sui", "ethereum", "metamask", "rabby", "aptos"];
const MWA_KEYWORD = "mobile wallet adapter";

function isSolanaConnector(c: { id: string; name: string }): boolean {
  const id = c.id.toLowerCase();
  const name = c.name.toLowerCase();
  if (NON_SOLANA.some((x) => id.includes(x) || name.includes(x))) return false;
  if (id.includes(MWA_KEYWORD) || name.includes(MWA_KEYWORD)) return false;
  return true;
}

function isSolanaWallet(wallet: Wallet): boolean {
  const name = wallet.name.toLowerCase();
  if (NON_SOLANA.some((x) => name.includes(x))) return false;
  if (name.includes(MWA_KEYWORD)) return false;
  // Check if wallet supports Solana chain
  return wallet.chains.some(
    (chain) =>
      chain.includes("solana") ||
      chain === "solana:mainnet" ||
      chain === "solana:devnet" ||
      chain === "solana:testnet"
  );
}

/* ── Environment detection ───────────────────────────────────────────── */
function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
}

function isInWalletBrowser(): boolean {
  if (typeof window === "undefined") return false;
  // Use Wallet Standard: any registered wallet means we're in a wallet browser
  const { get } = getWallets();
  return get().length > 0;
}

/* ── Deep-link wallets for mobile browsers ───────────────────────────── */
const MOBILE_WALLETS = [
  {
    name: "Phantom",
    icon: "/phantom-icon.png",
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

interface WalletItem {
  id: string;
  name: string;
  icon?: string;
  connectId?: string; // ID to use when calling connect()
}

export default function WalletConnectModal({ isOpen, onClose }: WalletConnectModalProps) {
  const { connectors, connect, connecting, isReady, connected } = useWalletConnection();
  const [allWallets, setAllWallets] = useState<WalletItem[]>([]);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);
  const abortRef = useRef(false);
  const autoConnectAttemptedRef = useRef(false);

  // Discover all available wallets using Wallet Standard API
  useEffect(() => {
    const discoverWallets = () => {
      try {
        const { get } = getWallets();
        const standardWallets = get();

        // Convert Wallet Standard wallets to connector format
        const walletsFromStandard = standardWallets
          .filter(isSolanaWallet)
          .map((wallet) => ({
            id: wallet.name.toLowerCase().replace(/\s+/g, "-"),
            name: wallet.name,
            icon: wallet.icon,
            connectId: wallet.name, // Use wallet name for connect call
          }));

        // Also include connectors from the hook (for compatibility)
        const connectorsList = connectors.filter(isSolanaConnector).map((c) => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
          connectId: c.id, // Use original ID from hook
        }));

        // Merge both sources, avoiding duplicates (prefer standard wallets)
        const merged: WalletItem[] = [];
        const seenNames = new Set<string>();

        // Add standard wallets first
        walletsFromStandard.forEach((w) => {
          merged.push(w);
          seenNames.add(w.name.toLowerCase());
        });

        // Add hook connectors that aren't already in standard wallets
        connectorsList.forEach((connector) => {
          if (!seenNames.has(connector.name.toLowerCase())) {
            merged.push(connector);
          }
        });

        setAllWallets(merged);
      } catch (err) {
        // Fallback to hook connectors if standard API fails
        const solanaConnectorsList = connectors
          .filter(isSolanaConnector)
          .map((c) => ({ id: c.id, name: c.name, icon: c.icon, connectId: c.id }));
        setAllWallets(solanaConnectorsList);
      }
    };

    if (isOpen) {
      discoverWallets();
    }
  }, [isOpen, connectors]);

  const solanaConnectors = allWallets;

  const mobile = typeof window !== "undefined" && isMobile();
  const inWalletBrowser = typeof window !== "undefined" && isInWalletBrowser();

  // Auto-close on successful connection
  useEffect(() => {
    if (connected && isOpen) {
      setConnectingId(null);
      setConnectError(null);
      onClose();
    }
  }, [connected, isOpen, onClose]);

  // Reset on modal close
  useEffect(() => {
    if (!isOpen) {
      setConnectingId(null);
      setConnectError(null);
      abortRef.current = false;
      autoConnectAttemptedRef.current = false;
    }
  }, [isOpen]);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isOpen, onClose]);

  // In wallet browsers, show injected connectors for user to select (no auto-connect)

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  const handleConnect = async (wallet: WalletItem) => {
    setConnectingId(wallet.id);
    setConnectError(null);
    abortRef.current = false;

    try {
      // Use connectId if available (for Wallet Standard), otherwise use id
      const idToConnect = wallet.connectId || wallet.id;
      await connect(idToConnect);
    } catch (err) {
      if (abortRef.current) return;
      const msg = err instanceof Error ? err.message : "Connection failed";
      if (msg.includes("reject") || msg.includes("cancel") || msg.includes("denied")) {
        setConnectError("Connection rejected. Please approve in your wallet.");
      } else {
        setConnectError(`Failed to connect to ${wallet.name}. Try again.`);
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

  /* ── Determine what to show ──
     Priority:
     1. Wallet browser (mobile or desktop) → auto-connect or show injected connectors
     2. Mobile regular browser             → show deep-links
     3. Desktop with extensions             → show discovered connectors
     4. Desktop no extensions               → show "Get Wallet" links
  */
  const showInjected = inWalletBrowser && solanaConnectors.length > 0;
  const showWalletBrowserLoading = inWalletBrowser && solanaConnectors.length === 0;
  const showDeepLinks = mobile && !inWalletBrowser;
  const showDesktopConnectors = !mobile && !inWalletBrowser && solanaConnectors.length > 0;
  const showGetWallet =
    !mobile && !inWalletBrowser && isReady && solanaConnectors.length === 0;

  return (
    <div className="wcm-backdrop" onClick={handleBackdropClick}>
      <div className="wcm-modal">
        <div className="wcm-header">
          <h3 className="wcm-title">Connect a Wallet</h3>
          <button onClick={onClose} className="wcm-close" aria-label="Close">
            &times;
          </button>
        </div>

        {/* Error banner */}
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

        {/* Connecting spinner */}
        {isConnecting && connectingWallet && (
          <div className="wcm-connecting-state">
            {connectingWallet.icon && (
              <img src={connectingWallet.icon} alt="" className="wcm-connecting-icon" width={48} height={48} />
            )}
            <p className="wcm-connecting-text">
              Connecting to <strong>{connectingWallet.name}</strong>…
            </p>
            <p className="wcm-connecting-hint">Approve the connection in your wallet.</p>
            <div className="wcm-connecting-spinner" />
            <button onClick={handleCancel} className="wcm-cancel-btn">Cancel</button>
          </div>
        )}

        {/* Detecting wallets */}
        {!isReady && !isConnecting && !showDeepLinks && !inWalletBrowser && (
          <p className="wcm-desc">Detecting wallets…</p>
        )}

        {/* ─── 1a. Inside wallet browser → injected connectors ─── */}
        {showInjected && !isConnecting && (
          <>
            <p className="wcm-desc">Tap to connect your wallet.</p>
            <WalletList connectors={solanaConnectors} onConnect={handleConnect} disabled={connecting} />
          </>
        )}

        {/* ─── 1b. Inside wallet browser but connectors not yet discovered ─── */}
        {showWalletBrowserLoading && !isConnecting && (
          <>
            <p className="wcm-desc">Detecting wallet…</p>
            <div className="wcm-connecting-spinner" />
          </>
        )}

        {/* ─── 2. Mobile regular browser → deep-links ─── */}
        {showDeepLinks && !isConnecting && (
          <>
            <p className="wcm-desc">Choose a wallet to connect.</p>
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

        {/* ─── 3. Desktop → discovered extension connectors ─── */}
        {showDesktopConnectors && !isConnecting && (
          <>
            <p className="wcm-desc">Select a wallet to connect.</p>
            <WalletList connectors={solanaConnectors} onConnect={handleConnect} disabled={connecting} />
          </>
        )}

        {/* ─── 4. Desktop, no extensions → get wallet ─── */}
        {showGetWallet && !isConnecting && (
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

/* ── Reusable wallet list (eliminates duplicate markup) ──────────────── */
function WalletList({
  connectors,
  onConnect,
  disabled,
}: {
  connectors: WalletItem[];
  onConnect: (wallet: WalletItem) => void;
  disabled: boolean;
}) {
  return (
    <div className="wcm-list">
      {connectors.map((connector) => (
        <button
          key={connector.id}
          onClick={() => onConnect(connector)}
          className="wcm-wallet-btn"
          disabled={disabled}
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
  );
}
