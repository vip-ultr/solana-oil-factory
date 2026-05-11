"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useWalletConnection } from "@solana/react-hooks";
import { SOLANA_CLUSTER } from "@/lib/program";
import {
  buildSiwsMessage,
  bytesToHex,
  clearSiws,
  generateNonce,
  loadSiws,
  saveSiws,
  SIWS_TTL_MS,
  type SiwsSession,
} from "@/lib/siws";

interface SiwsContextValue {
  /** True only when we have a fresh, address-matching SIWS payload. */
  authed: boolean;
  session: SiwsSession | null;
  /** Address from useWalletConnection — present even when unauthed. */
  address: string | null;
  /** Currently asking the wallet to sign. */
  signing: boolean;
  /** Last error from a sign attempt (Wallet rejected, no signMessage support, etc.). */
  error: string | null;
  /** Trigger a fresh sign-in. Resolves to true on success. */
  signIn: () => Promise<boolean>;
  /** Clear local SIWS payload (does not disconnect the wallet adapter). */
  signOut: () => void;
}

const SiwsCtx = createContext<SiwsContextValue | null>(null);

export function SiwsProvider({ children }: { children: ReactNode }) {
  const { wallet, connected, disconnect } = useWalletConnection();
  const address = wallet?.account?.address?.toString() ?? null;

  const [session, setSession] = useState<SiwsSession | null>(null);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load persisted session whenever the wallet address changes.
  useEffect(() => {
    if (!address) {
      setSession(null);
      return;
    }
    setSession(loadSiws(address));
  }, [address]);

  // Re-sync if another tab clears or sets the session.
  useEffect(() => {
    function onChange() {
      setSession(address ? loadSiws(address) : null);
    }
    window.addEventListener("sof:siws-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("sof:siws-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [address]);

  // If the wallet disconnects, drop any session bound to it.
  useEffect(() => {
    if (!connected) {
      setSession(null);
      setError(null);
    }
  }, [connected]);

  const signIn = useCallback(async (): Promise<boolean> => {
    if (!wallet || !address) {
      setError("Connect a wallet first.");
      return false;
    }
    if (typeof wallet.signMessage !== "function") {
      setError(
        "This wallet doesn't support message signing. Try Phantom, Solflare, or Backpack.",
      );
      return false;
    }

    setSigning(true);
    setError(null);
    try {
      const issuedAt = new Date();
      const expiresAt = new Date(issuedAt.getTime() + SIWS_TTL_MS);
      const nonce = generateNonce();
      const domain =
        typeof window !== "undefined" ? window.location.host : "solanaoilfactory.com";
      const message = buildSiwsMessage({
        domain,
        address,
        cluster: SOLANA_CLUSTER,
        nonce,
        issuedAt,
        expiresAt,
      });
      const sigBytes = await wallet.signMessage(
        new TextEncoder().encode(message),
      );

      const fresh: SiwsSession = {
        address,
        cluster: SOLANA_CLUSTER,
        message,
        signature: bytesToHex(sigBytes),
        issuedAt: issuedAt.getTime(),
        expiresAt: expiresAt.getTime(),
        nonce,
      };
      saveSiws(fresh);
      setSession(fresh);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Signature was rejected.";
      setError(msg);
      return false;
    } finally {
      setSigning(false);
    }
  }, [wallet, address]);

  const signOut = useCallback(() => {
    clearSiws();
    setSession(null);
    setError(null);
    void disconnect();
  }, [disconnect]);

  const authed = session !== null && session.address === address;

  const value = useMemo<SiwsContextValue>(
    () => ({ authed, session, address, signing, error, signIn, signOut }),
    [authed, session, address, signing, error, signIn, signOut],
  );

  return <SiwsCtx.Provider value={value}>{children}</SiwsCtx.Provider>;
}

export function useSiws(): SiwsContextValue {
  const ctx = useContext(SiwsCtx);
  if (!ctx) {
    throw new Error("useSiws must be used inside <SiwsProvider>");
  }
  return ctx;
}
