"use client";

import { useState, useEffect, useCallback } from "react";
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
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function hasInjectedWallet(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as Record<string, unknown>;
  return !!(w.phantom || w.solana || w.solflare || w.backpack);
}

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletConnectModal({ isOpen, onClose }: WalletConnectModalProps) {
  const { open: openPhantomModal } = useModal();
  const { isInstalled, isLoading } = useIsExtensionInstalled();
  const [mobile, setMobile] = useState(false);
  const [injected, setInjected] = useState(false);

  useEffect(() => {
    setMobile(isMobile());
    setInjected(hasInjectedWallet());
  }, []);

  useEffect(() => {
    if (!isOpen || isLoading) return;
    // Use Phantom SDK modal on desktop, or on mobile if a wallet is already injected
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
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Only render the custom modal on mobile with no wallet detected
  if (!isOpen || !mobile || injected || isInstalled) return null;

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="wcm-backdrop" onClick={handleBackdropClick}>
      <div className="wcm-modal">
        <div className="wcm-header">
          <h3 className="wcm-title">Connect a Wallet</h3>
          <button onClick={onClose} className="wcm-close" aria-label="Close">&times;</button>
        </div>

        <p className="wcm-desc">Select a wallet app to connect. You&apos;ll be redirected to the app.</p>

        <div className="wcm-list">
          {WALLETS.map(({ name, icon, universalLink }) => (
            <a
              key={name}
              href={`${universalLink}${encodeURIComponent(currentUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="wcm-wallet-btn"
            >
              <img src={icon} alt={name} className="wcm-wallet-icon" width={32} height={32} />
              <div className="wcm-wallet-info">
                <span className="wcm-wallet-name">{name}</span>
                <span className="wcm-wallet-action">Open App</span>
              </div>
              <svg className="wcm-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </a>
          ))}
        </div>

        <div className="wcm-divider"><span>or</span></div>

        <p className="wcm-alt-text">
          Use the <strong>search bar</strong> to look up any Solana wallet address without connecting.
        </p>
      </div>
    </div>
  );
}
