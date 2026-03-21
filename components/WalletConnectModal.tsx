"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useModal, useIsExtensionInstalled } from "@phantom/react-sdk";

const WALLETS = [
  {
    name: "Phantom",
    icon: "/phantom-icon.png",
    universalLink: "https://phantom.app/ul/browse/",
  },
  {
    name: "Solflare",
    icon: "/solflare-icon.png",
    universalLink: "https://solflare.com/ul/",
  },
  {
    name: "Backpack",
    icon: "/backpack-icon.png",
    universalLink: "https://backpack.app/ul/",
  },
];

function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Detects any injected Solana wallet provider.
 *
 * In-app wallet browsers (Jupiter, Phantom, Backpack, Solflare, etc.) inject
 * their provider at different paths and sometimes asynchronously:
 *  - window.solana             (most wallets)
 *  - window.phantom?.solana    (Phantom, Jupiter via Phantom adapter)
 *  - window.solflare           (Solflare)
 *  - window.backpack?.solana   (Backpack)
 *  - window.phantom            (Phantom extension)
 *
 * We also listen for the Wallet Standard "register" event, which is the
 * modern standard that wallets like Jupiter use.
 */
function hasInjectedWallet(): boolean {
  if (typeof window === "undefined") return false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;

  // Check direct top-level providers
  if (w.solana) return true;
  if (w.phantom?.solana) return true;
  if (w.solflare) return true;
  if (w.backpack?.solana) return true;
  if (w.coin98) return true;

  // Check Wallet Standard registrations
  // Wallets that follow the standard push into window.navigator.wallets
  if (
    w.navigator?.wallets?.length > 0 ||
    w.navigator?.wallets?.get?.()?.length > 0
  ) {
    return true;
  }

  return false;
}

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletConnectModal({
  isOpen,
  onClose,
}: WalletConnectModalProps) {
  const { open: openPhantomModal } = useModal();
  const { isInstalled, isLoading } = useIsExtensionInstalled();
  const [mobile, setMobile] = useState(false);
  const [injected, setInjected] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Detect mobile + poll for injected wallet (in-app browsers inject late)
  useEffect(() => {
    setMobile(isMobile());

    if (hasInjectedWallet()) {
      setInjected(true);
      return;
    }

    // Poll every 200ms for up to 3 seconds — covers slow in-app browser injection
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 200;
      if (hasInjectedWallet()) {
        setInjected(true);
        clearInterval(interval);
      } else if (elapsed >= 3000) {
        clearInterval(interval);
      }
    }, 200);
    pollRef.current = interval;

    // Also listen for the Wallet Standard register event
    const handleRegister = () => {
      setInjected(true);
      if (pollRef.current) clearInterval(pollRef.current);
    };
    window.addEventListener("wallet-standard:register", handleRegister);

    return () => {
      clearInterval(interval);
      window.removeEventListener("wallet-standard:register", handleRegister);
    };
  }, []);

  // When the modal opens: if a wallet IS available, delegate to the Phantom SDK modal
  useEffect(() => {
    if (!isOpen || isLoading) return;
    if (!mobile || injected || isInstalled) {
      openPhantomModal();
      onClose();
    }
  }, [isOpen, isLoading, mobile, injected, isInstalled, openPhantomModal, onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Only render the custom modal on mobile with no wallet detected
  if (!isOpen || !mobile || injected || isInstalled) return null;

  const currentUrl =
    typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="wcm-backdrop" onClick={handleBackdropClick}>
      <div className="wcm-modal">
        <div className="wcm-header">
          <h3 className="wcm-title">Connect a Wallet</h3>
          <button onClick={onClose} className="wcm-close" aria-label="Close">
            &times;
          </button>
        </div>

        <p className="wcm-desc">
          Select a wallet app to connect. You&apos;ll be redirected to the app.
        </p>

        <div className="wcm-list">
          {WALLETS.map(({ name, icon, universalLink }) => (
            <a
              key={name}
              href={`${universalLink}${encodeURIComponent(currentUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="wcm-wallet-btn"
            >
              <img
                src={icon}
                alt={name}
                className="wcm-wallet-icon"
                width={32}
                height={32}
              />
              <div className="wcm-wallet-info">
                <span className="wcm-wallet-name">{name}</span>
                <span className="wcm-wallet-action">Open App</span>
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
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </a>
          ))}
        </div>

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
