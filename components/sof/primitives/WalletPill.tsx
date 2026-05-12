"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";

interface Props {
  /** Display text — usually a truncated address like "Af5b…ci7H". */
  address: string;
  /** Full address copied to clipboard on click. Defaults to `address`. */
  fullAddress?: string;
  className?: string;
  /** Override identicon gradient. */
  identStyle?: React.CSSProperties;
}

export function WalletPill({
  address,
  fullAddress,
  className,
  identStyle,
}: Props) {
  const [copied, setCopied] = useState(false);
  const target = fullAddress ?? address;

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(target);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard API unavailable — silent.
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className={cn("sof-wallet-pill", copied && "copied", className)}
      title={copied ? "Copied!" : `Copy ${target}`}
      aria-label={
        copied ? "Address copied" : `Copy wallet address ${target}`
      }
    >
      <span className="ident" style={identStyle} aria-hidden="true" />
      <span className="addr">{address}</span>
      {copied ? (
        <Check size={11} strokeWidth={2.2} aria-hidden="true" />
      ) : (
        <Copy size={11} strokeWidth={1.8} aria-hidden="true" />
      )}
    </button>
  );
}
