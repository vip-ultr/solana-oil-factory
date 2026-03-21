"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWalletConnection } from "@solana/react-hooks";
import { useTheme } from "next-themes";
import WalletConnectModal from "./WalletConnectModal";

export default function Navbar() {
  const pathname = usePathname();
  const { connected, disconnect, wallet, isReady } = useWalletConnection();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);

  const openConnectModal = useCallback(() => setShowConnectModal(true), []);
  const closeConnectModal = useCallback(() => setShowConnectModal(false), []);

  const solanaAddress = wallet?.account?.address?.toString() ?? null;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (connected) setShowConnectModal(false);
  }, [connected]);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const navLinks = [
    { label: "Refinery", href: "/" },
    { label: "Leaderboard", href: "/leaderboard" },
  ];

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          {/* ── Left: Logo ── */}
          <Link href="/" className="navbar-brand">
            <img src="/logo.png" alt="Solana Oil Factory" className="navbar-logo" />
            <span className="navbar-brand-text">Solana Oil Factory</span>
          </Link>

          {/* ── Center: Nav links (desktop only) ── */}
          <div className="navbar-links">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`navbar-link${pathname === link.href ? " navbar-link--active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={connected && solanaAddress ? `/wallet/${solanaAddress}` : "/profile"}
              className={`navbar-link${pathname.startsWith("/wallet/") || pathname === "/profile" ? " navbar-link--active" : ""}`}
            >
              Profile
            </Link>
          </div>

          {/* ── Right: Actions (desktop + mobile) ── */}
          <div className="navbar-actions">
            {mounted && (
              <button
                onClick={toggleTheme}
                className="navbar-theme-btn"
                aria-label="Toggle theme"
                title={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {resolvedTheme === "dark" ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>
            )}

            {connected && solanaAddress ? (
              <div className="navbar-wallet-chip">
                <span className="navbar-wallet-dot" />
                <span className="navbar-wallet-addr">
                  {solanaAddress.slice(0, 4)}...{solanaAddress.slice(-4)}
                </span>
                <button
                  onClick={() => disconnect()}
                  className="navbar-wallet-disconnect"
                  aria-label="Disconnect wallet"
                  title="Disconnect"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button onClick={openConnectModal} className="navbar-connect-btn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="12" rx="3" />
                  <path d="M16 12h.01" />
                </svg>
                <span>Connect</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── Mobile bottom nav ── */}
      <nav className="bottom-nav" aria-label="Mobile navigation">
        <Link
          href="/"
          className={`bottom-nav-item${pathname === "/" ? " bottom-nav-item--active" : ""}`}
        >
          {/* Refinery / flame icon */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C8 7 6 10 6 13a6 6 0 0 0 12 0c0-3-2-6-6-11z" />
            <path d="M12 12c-1 2-0.5 4 1 4s2.5-2 1-4" />
          </svg>
          <span>Refinery</span>
        </Link>

        <Link
          href="/leaderboard"
          className={`bottom-nav-item${pathname === "/leaderboard" ? " bottom-nav-item--active" : ""}`}
        >
          {/* Trophy icon */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4a2 2 0 0 1-2-2V5h4" />
            <path d="M18 9h2a2 2 0 0 0 2-2V5h-4" />
            <path d="M6 4h12v6a6 6 0 0 1-12 0V4z" />
            <path d="M12 16v4" />
            <path d="M8 20h8" />
          </svg>
          <span>Leaderboard</span>
        </Link>

        <Link
          href={connected && solanaAddress ? `/wallet/${solanaAddress}` : "/profile"}
          className={`bottom-nav-item${pathname.startsWith("/wallet/") || pathname === "/profile" ? " bottom-nav-item--active" : ""}`}
        >
          {/* Profile icon — always shown */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
          <span>Profile</span>
        </Link>
      </nav>

      <WalletConnectModal isOpen={showConnectModal} onClose={closeConnectModal} />
    </>
  );
}
