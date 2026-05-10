"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ConnectModal } from "./ConnectModal";
import { CommandPalette } from "./CommandPalette";
import { ToastProvider } from "./Toast";

interface ChromeOverlayContextValue {
  openConnect: () => void;
  openPalette: () => void;
}

declare global {
  // eslint-disable-next-line no-var
  var __sofChromeOverlay: ChromeOverlayContextValue | undefined;
}

/**
 * Mounts the connect modal, command palette, and toast region
 * once at the layout root. Exposes openConnect()/openPalette() as
 * window-scoped helpers via a tiny global so non-React triggers
 * (the Sidebar's plain Connect button, the ⌘K key handler) can
 * fire them without prop-drilling.
 */
export function ChromeOverlay({ children }: { children: ReactNode }) {
  const [connectOpen, setConnectOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Expose openers globally so the Sidebar (server-rendered as a
  // simple button) can trigger them via document.dispatchEvent.
  useEffect(() => {
    globalThis.__sofChromeOverlay = {
      openConnect: () => setConnectOpen(true),
      openPalette: () => setPaletteOpen(true),
    };
    return () => {
      globalThis.__sofChromeOverlay = undefined;
    };
  }, []);

  // Listen for custom events from non-React triggers.
  useEffect(() => {
    function onConnect() {
      setConnectOpen(true);
    }
    function onPalette() {
      setPaletteOpen(true);
    }
    addEventListener("sof:open-connect", onConnect);
    addEventListener("sof:open-palette", onPalette);
    return () => {
      removeEventListener("sof:open-connect", onConnect);
      removeEventListener("sof:open-palette", onPalette);
    };
  }, []);

  // Global ⌘K / Ctrl+K to open the palette.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        const t = e.target as HTMLElement | null;
        const tag = t?.tagName.toLowerCase();
        if (tag === "input" || tag === "textarea" || t?.isContentEditable) return;
        e.preventDefault();
        setPaletteOpen(true);
      }
    }
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  return (
    <ToastProvider>
      {children}
      <ConnectModal open={connectOpen} onClose={() => setConnectOpen(false)} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </ToastProvider>
  );
}

/** Helper to dispatch the open-connect event from non-React code. */
export function openConnectModal() {
  dispatchEvent(new CustomEvent("sof:open-connect"));
}

/** Helper to dispatch the open-palette event from non-React code. */
export function openCommandPalette() {
  dispatchEvent(new CustomEvent("sof:open-palette"));
}
