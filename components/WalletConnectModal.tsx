"use client";

import { useState, useEffect, useCallback } from "react";
import { useModal, useIsExtensionInstalled } from "@phantom/react-sdk";

interface WalletOption {
  name: string;
  icon: string;
  extensionUrl: string;
  mobileUrl: string;
  universalLink: string;
}

const WALLETS: WalletOption[] = [
  {
    name: "Phantom",
    icon: "https://phantom.com/img/phantom-icon-purple.svg",
    extensionUrl: "https://chrome.google.com/webstore/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa",
    mobileUrl: "https://phantom.app/download",
    universalLink: "https://phantom.app/ul/browse/",
  },
  {
    name: "Solflare",
    icon: "https://solflare.com/favicon.svg",
    extensionUrl: "https://chrome.google.com/webstore/detail/solflare-wallet/bhhhlbepdkbapadjdcopmkaabnhkkfhm",
    mobileUrl: "https://solflare.com/download",
    universalLink: "https://solflare.com/ul/",
  },
  {
    name: "Backpack",
    icon: "https://backpack.app/favicon.ico",
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
          {WALLETS.map((wallet) => {
            const href = isMobile
              ? `${wallet.universalLink}${encodeURIComponent(currentUrl)}`
              : wallet.extensionUrl;

            return (
              <a
                key={wallet.name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="wcm-wallet-btn"
              >
                <img
                  src={wallet.icon}
                  alt={wallet.name}
                  className="wcm-wallet-icon"
                  width={32}
                  height={32}
                />
                <div className="wcm-wallet-info">
                  <span className="wcm-wallet-name">{wallet.name}</span>
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
