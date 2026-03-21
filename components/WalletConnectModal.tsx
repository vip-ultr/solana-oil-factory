"use client";

import { useCallback, useEffect } from "react";
import { useWalletModalState } from "@solana/react-hooks";

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletConnectModal({
  isOpen,
  onClose,
}: WalletConnectModalProps) {
  const modal = useWalletModalState({ closeOnConnect: true });

  // Sync external isOpen prop → internal modal state
  useEffect(() => {
    if (isOpen && !modal.isOpen) modal.open();
    if (!isOpen && modal.isOpen) modal.close();
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close parent when modal closes (e.g. after connect)
  useEffect(() => {
    if (!modal.isOpen && isOpen) onClose();
  }, [modal.isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close parent when wallet connects
  useEffect(() => {
    if (modal.connected) onClose();
  }, [modal.connected]); // eslint-disable-line react-hooks/exhaustive-deps

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

  if (!isOpen) return null;

  // Wait for hydration — connectors aren't available during SSR
  if (!modal.isReady) {
    return (
      <div className="wcm-backdrop" onClick={handleBackdropClick}>
        <div className="wcm-modal">
          <div className="wcm-header">
            <h3 className="wcm-title">Connect a Wallet</h3>
            <button onClick={onClose} className="wcm-close" aria-label="Close">
              &times;
            </button>
          </div>
          <p className="wcm-desc">Detecting wallets...</p>
        </div>
      </div>
    );
  }

  const handleConnect = async (connectorId: string) => {
    try {
      await modal.connect(connectorId);
      onClose();
    } catch {
      // User rejected or connection failed — stay on modal
    }
  };

  return (
    <div className="wcm-backdrop" onClick={handleBackdropClick}>
      <div className="wcm-modal">
        <div className="wcm-header">
          <h3 className="wcm-title">Connect a Wallet</h3>
          <button onClick={onClose} className="wcm-close" aria-label="Close">
            &times;
          </button>
        </div>

        {modal.connectors.length === 0 ? (
          <>
            <p className="wcm-desc">
              No wallets detected. Install a Solana wallet to continue.
            </p>
            <div className="wcm-list">
              <a
                href="https://phantom.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="wcm-wallet-btn"
              >
                <img
                  src="/phantom-icon.png"
                  alt="Phantom"
                  className="wcm-wallet-icon"
                  width={32}
                  height={32}
                />
                <div className="wcm-wallet-info">
                  <span className="wcm-wallet-name">Phantom</span>
                  <span className="wcm-wallet-action">Get Wallet</span>
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
              <a
                href="https://solflare.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="wcm-wallet-btn"
              >
                <img
                  src="/solflare-icon.png"
                  alt="Solflare"
                  className="wcm-wallet-icon"
                  width={32}
                  height={32}
                />
                <div className="wcm-wallet-info">
                  <span className="wcm-wallet-name">Solflare</span>
                  <span className="wcm-wallet-action">Get Wallet</span>
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
            </div>
          </>
        ) : (
          <>
            <p className="wcm-desc">
              Select a wallet to connect.
            </p>
            <div className="wcm-list">
              {modal.connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => handleConnect(connector.id)}
                  className="wcm-wallet-btn"
                  disabled={modal.connecting}
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
                      {modal.connecting && modal.connectorId === connector.id
                        ? "Connecting..."
                        : "Connect"}
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
