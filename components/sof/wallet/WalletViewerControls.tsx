"use client";

import { Plus } from "lucide-react";
import { useWalletConnection } from "@solana/react-hooks";
import { ButtonLink } from "@/components/sof/primitives";
import {
  ShareButton,
  WatchButton,
} from "@/components/sof/refinery-detail/RefineryHeaderActions";

interface Props {
  address: string;
  truncated: string;
}

export function WalletViewerControls({ address, truncated }: Props) {
  const { wallet, connected } = useWalletConnection();
  const ownAddress = wallet?.account?.address?.toString() ?? null;
  const isOwner = connected && ownAddress === address;

  return (
    <>
      {!isOwner && (
        <WatchButton kind="wallet" id={address} label="Save wallet to watchlist" />
      )}
      <ShareButton
        title={`Wallet ${truncated}`}
        text="View this operator on Sol Oil Factory"
      />
      {isOwner && (
        <ButtonLink href="/refinery/launch" variant="primary">
          <Plus size={14} strokeWidth={2} aria-hidden="true" />
          Launch refinery
        </ButtonLink>
      )}
    </>
  );
}

export function WalletOwnerPill({ address }: { address: string }) {
  const { wallet, connected } = useWalletConnection();
  const ownAddress = wallet?.account?.address?.toString() ?? null;
  if (!connected || ownAddress !== address) return null;
  return <span className="sof-w-you-pill">Your wallet</span>;
}
