"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface Props {
  address: string;
  /** Compact mode renders just the icon (no label). */
  compact?: boolean;
}

export function WalletCopyButton({ address, compact }: Props) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard API unavailable — silent.
    }
  }

  return (
    <button
      type="button"
      className={`sof-w-copy-btn${copied ? " on" : ""}${compact ? " compact" : ""}`}
      onClick={onCopy}
      title={copied ? "Copied!" : "Copy full address"}
      aria-label={copied ? "Address copied" : `Copy wallet address ${address}`}
    >
      {copied ? (
        <Check size={13} strokeWidth={2.2} aria-hidden="true" />
      ) : (
        <Copy size={13} strokeWidth={1.8} aria-hidden="true" />
      )}
      {!compact && <span className="lab">{copied ? "Copied" : "Copy"}</span>}
    </button>
  );
}
