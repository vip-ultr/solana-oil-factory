"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePhantom, useDisconnect, AddressType } from "@phantom/react-sdk";
import { useTheme } from "next-themes";
import WalletConnectModal from "./WalletConnectModal";

export default function Navbar() {
  const pathname = usePathname();
  const { isConnected, addresses } = usePhantom();
  const { disconnect } = useDisconnect();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);

  const openConnectModal = useCallback(() => setShowConnectModal(true), []);
  const closeConnectModal = useCallback(() => setShowConnectModal(false), []);

  const solanaAddress =
    addresses.find((a) => a.addressType === AddressType.solana)?.address ?? null;

  // Avoid hydration mismatch for theme icon
  useEffect(() => setMounted(true), []);

  // Close mobile menu on route change
  useEffect(() => setMobileOpen(false), [pathname]);

  // Close connect modal when wallet connects
  useEffect(() => {
    if (isConnected) setShowConnectModal(false);
  }, [isConnected]);

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

          {/* ── Center: Nav links (desktop) ── */}
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
            {isConnected && solanaAddress && (
              <Link
                href={`/wallet/${solanaAddress}`}
                className={`navbar-link${pathname.startsWith("/wallet/") ? " navbar-link--active" : ""}`}
              >
                Profile
              </Link>
            )}
          </div>

          {/* ── Right: Actions (desktop) ── */}
          <div className="navbar-actions">
            {/* Theme toggle */}
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

            {/* Wallet */}
            {isConnected && solanaAddress ? (
              <div className="navbar-wallet-chip">
                <span className="navbar-wallet-dot" />
                <span className="navbar-wallet-addr">
                  {solanaAddress.slice(0, 4)}...{solanaAddress.slice(-4)}
                </span>
                <button
                  onClick={disconnect}
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

          {/* ── Mobile hamburger ── */}
          <button
            className="navbar-mobile-toggle"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>

        {/* ── Mobile dropdown ── */}
        {mobileOpen && (
          <div className="navbar-mobile-menu">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`navbar-mobile-link${pathname === link.href ? " navbar-mobile-link--active" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isConnected && solanaAddress && (
              <Link
                href={`/wallet/${solanaAddress}`}
                className={`navbar-mobile-link${pathname.startsWith("/wallet/") ? " navbar-mobile-link--active" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                Profile
              </Link>
            )}

            <div className="navbar-mobile-divider" />

            {/* Theme toggle (mobile) */}
            {mounted && (
              <button onClick={toggleTheme} className="navbar-mobile-theme">
                {resolvedTheme === "dark" ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                    Light Mode
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                    Dark Mode
                  </>
                )}
              </button>
            )}

            {/* Wallet (mobile) */}
            {isConnected && solanaAddress ? (
              <div className="navbar-mobile-wallet">
                <span className="navbar-wallet-dot" />
                <span className="navbar-wallet-addr">
                  {solanaAddress.slice(0, 4)}...{solanaAddress.slice(-4)}
                </span>
                <button
                  onClick={() => { disconnect(); setMobileOpen(false); }}
                  className="navbar-wallet-disconnect"
                  aria-label="Disconnect wallet"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button onClick={() => { openConnectModal(); setMobileOpen(false); }} className="navbar-connect-btn navbar-connect-btn--mobile">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="12" rx="3" />
                  <path d="M16 12h.01" />
                </svg>
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        )}
      </nav>

      <WalletConnectModal isOpen={showConnectModal} onClose={closeConnectModal} />
    </>
  );
}
