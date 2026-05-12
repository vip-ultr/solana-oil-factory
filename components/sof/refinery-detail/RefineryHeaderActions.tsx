"use client";

import { useState } from "react";
import { Check, Copy, Share2, Star } from "lucide-react";
import { toggleWatched } from "@/lib/watchlist";
import { useWatched } from "@/lib/use-watched";
import { shareUrl } from "@/lib/share";

interface CopyMintButtonProps {
  /** Truncated label (e.g. "AbC…dEf") shown to the user. */
  label: string;
  /** Full base58 mint pubkey copied to the clipboard. */
  fullMint: string;
}

/**
 * Header pill that shows a truncated mint + a copy icon. Clicking
 * anywhere on the pill copies the full mint and flashes a check
 * mark for ~1.5s. Lives client-side so the server detail page
 * stays a server component.
 */
export function CopyMintButton({ label, fullMint }: CopyMintButtonProps) {
  const [copied, setCopied] = useState(false);
  async function handle() {
    try {
      await navigator.clipboard.writeText(fullMint);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard denied — leave silently, no UX disaster */
    }
  }
  return (
    <button
      type="button"
      className="sof-rd-copy-mint"
      onClick={handle}
      aria-label={copied ? "Mint address copied" : `Copy mint ${label}`}
    >
      {label}
      {copied ? (
        <Check aria-hidden="true" strokeWidth={2} />
      ) : (
        <Copy aria-hidden="true" strokeWidth={2} />
      )}
    </button>
  );
}

interface ShareButtonProps {
  title: string;
  text: string;
}

export function ShareButton({ title, text }: ShareButtonProps) {
  const [hint, setHint] = useState<string | null>(null);
  async function handle() {
    const url =
      typeof window !== "undefined" ? window.location.href : "";
    const result = await shareUrl(url, title, text);
    if (result === "shared") return;
    setHint(result === "copied" ? "Link copied" : "Share failed");
    setTimeout(() => setHint(null), 1500);
  }
  return (
    <button
      type="button"
      className="sof-rd-share"
      onClick={handle}
      title={hint ?? "Share refinery"}
      aria-label="Share refinery"
    >
      <Share2 size={14} strokeWidth={1.6} />
    </button>
  );
}

interface WatchButtonProps {
  kind: "refinery" | "wallet";
  /** Unique id (refinery PDA / wallet pubkey) to track. */
  id: string;
  /** Optional aria-label override. */
  label?: string;
}

export function WatchButton({ kind, id, label }: WatchButtonProps) {
  const on = useWatched(kind, id);
  function handle() {
    toggleWatched(kind, id);
  }
  const description = on ? "Remove from watchlist" : "Add to watchlist";
  return (
    <button
      type="button"
      className="sof-rd-share"
      onClick={handle}
      title={description}
      aria-label={label ?? description}
      aria-pressed={on}
    >
      <Star
        size={14}
        strokeWidth={1.6}
        fill={on ? "currentColor" : "none"}
        color={on ? "var(--accent)" : undefined}
      />
    </button>
  );
}

interface ScrollToButtonProps {
  /** DOM id of the element to scroll into view. */
  targetId: string;
  className?: string;
  children: React.ReactNode;
}

export function ScrollToButton({
  targetId,
  className,
  children,
}: ScrollToButtonProps) {
  function handle() {
    if (typeof document === "undefined") return;
    const el = document.getElementById(targetId);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  return (
    <button type="button" className={className} onClick={handle}>
      {children}
    </button>
  );
}
