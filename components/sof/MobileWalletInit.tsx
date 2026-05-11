"use client";

import { useEffect } from "react";

/**
 * On Android Chrome, register Solana Mobile Wallet Adapter as a
 * wallet-standard wallet so it surfaces through `autoDiscover()`
 * in the same connector list as Phantom / Solflare / Backpack
 * extensions. Tapping Connect then opens the user's installed
 * wallet via an OS intent and returns control to the browser tab
 * after sign-off.
 *
 * iOS Safari does NOT support MWA (an OS limitation, not a
 * missing implementation). For iOS we rely on the in-app browser
 * trampoline deeplinks rendered inside ConnectModal.
 *
 * Mounted once inside `Providers` so the wallet-standard registry
 * picks the MWA wallet up before the connect modal opens.
 */
export function MobileWalletInit() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const ua = navigator.userAgent;
    const isAndroid = /android/i.test(ua);
    if (!isAndroid) return;

    let cancelled = false;
    void import("@solana-mobile/wallet-standard-mobile")
      .then((mwa) => {
        if (cancelled) return;
        mwa.registerMwa({
          appIdentity: {
            name: "Sol Oil Factory",
            uri: window.location.origin,
            icon: "/logo.png",
          },
          authorizationCache: mwa.createDefaultAuthorizationCache(),
          chainSelector: mwa.createDefaultChainSelector(),
          chains: ["solana:devnet"],
          onWalletNotFound: mwa.createDefaultWalletNotFoundHandler(),
        });
      })
      .catch(() => {
        // Package failed to load — gracefully degrade. The trampoline
        // deeplinks in ConnectModal still give the user a path forward.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
