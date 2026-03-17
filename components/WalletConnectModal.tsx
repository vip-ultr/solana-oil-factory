"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useModal, useIsExtensionInstalled } from "@phantom/react-sdk";

function PhantomIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" rx="28" fill="#AB9FF2"/>
      <path d="M110.584 64.906c0 24.17-19.593 43.764-43.764 43.764-7.896 0-15.3-2.087-21.698-5.742l-22.04 5.742 5.742-22.04C25.17 80.233 23.082 72.83 23.082 64.934c0-24.17 19.594-43.764 43.764-43.764S110.584 40.764 110.584 64.906z" fill="white"/>
      <ellipse cx="52" cy="62" rx="7" ry="9" fill="#AB9FF2"/>
      <ellipse cx="76" cy="62" rx="7" ry="9" fill="#AB9FF2"/>
      <ellipse cx="54" cy="60" rx="3" ry="3.5" fill="white"/>
      <ellipse cx="78" cy="60" rx="3" ry="3.5" fill="white"/>
    </svg>
  );
}

function SolflareIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" rx="28" fill="#FC6F35"/>
      <path d="M64 20 L78 54 L114 54 L86 74 L98 108 L64 88 L30 108 L42 74 L14 54 L50 54 Z" fill="white" opacity="0.95"/>
    </svg>
  );
}

function BackpackIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" rx="28" fill="#E33E3F"/>
      <rect x="38" y="50" width="52" height="48" rx="10" fill="white"/>
      <path d="M50 50 C50 36 78 36 78 50" stroke="white" strokeWidth="7" fill="none" strokeLinecap="round"/>
      <rect x="56" y="68" width="16" height="10" rx="3" fill="#E33E3F"/>
    </svg>
  );
}

interface WalletOption {
  name: string;
  Icon: () => React.ReactElement;
  extensionUrl: string;
  mobileUrl: string;
  universalLink: string;
}

const WALLETS: WalletOption[] = [
  {
    name: "Phantom",
    Icon: PhantomIcon,
    extensionUrl: "https://chrome.google.com/webstore/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa",
    mobileUrl: "https://phantom.app/download",
    universalLink: "https://phantom.app/ul/browse/",
  },
  {
    name: "Solflare",
    Icon: SolflareIcon,
    extensionUrl: "https://chrome.google.com/webstore/detail/solflare-wallet/bhhhlbepdkbapadjdcopmkaabnhkkfhm",
    mobileUrl: "https://solflare.com/download",
    universalLink: "https://solflare.com/ul/",
  },
  {
    name: "Backpack",
    Icon: BackpackIcon,
    extensionUrl: "https://chrome.google.com/webstore/detail/backpack/aflkmfhebedbjioipglgcbcmnbpgliof",
    mobileUrl: "https://backpack.app/download",
    universalLink: "https://backpack.app/ul/",
  },
];

function isMobileDevice(): boolean {
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
  const [isMobile, setIsMobile] = useState(false);
  const [walletInjected, setWalletInjected] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileDevice());
    setWalletInjected(hasInjectedWallet());
  }, []);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  if (!isOpen) return null;

  // If any wallet is detected (desktop extension or mobile browser with wallet), connect directly
  if (!isLoading && (isInstalled || walletInjected)) {
    openPhantomModal();
    onClose();
    return null;
  }

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

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
          {isMobile
            ? "Select a wallet app to connect. You'll be redirected to the app."
            : "Select a wallet to install, or use the search bar to look up any address."}
        </p>

        <div className="wcm-list">
          {WALLETS.map(({ name, Icon, extensionUrl, universalLink }) => {
            const href = isMobile
              ? `${universalLink}${encodeURIComponent(currentUrl)}`
              : extensionUrl;

            return (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="wcm-wallet-btn"
              >
                <span className="wcm-wallet-icon">
                  <Icon />
                </span>
                <div className="wcm-wallet-info">
                  <span className="wcm-wallet-name">{name}</span>
                  <span className="wcm-wallet-action">
                    {isMobile ? "Open App" : "Install Extension"}
                  </span>
                </div>
                <svg className="wcm-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </a>
            );
          })}
        </div>

        <div className="wcm-divider">
          <span>or</span>
        </div>

        <p className="wcm-alt-text">
          Use the <strong>search bar</strong> above to look up any Solana wallet address without connecting.
        </p>
      </div>
    </div>
  );
}
