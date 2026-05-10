import { ShieldCheck, Users, ShieldOff } from "lucide-react";
import { cn } from "@/lib/cn";
import type { VerificationTier } from "@/lib/mock-data";

const LABEL: Record<VerificationTier, string> = {
  verifiedDeployer: "Verified deployer",
  verifiedCto: "Verified CTO",
  unverified: "Unverified",
};

const TONE: Record<VerificationTier, string> = {
  verifiedDeployer: "",
  verifiedCto: "cto",
  unverified: "unverified",
};

interface Props {
  tier: VerificationTier;
  /** Show only the icon (e.g. tight table cells). */
  iconOnly?: boolean;
  className?: string;
}

export function VerifiedBadge({ tier, iconOnly = false, className }: Props) {
  const Icon =
    tier === "verifiedDeployer"
      ? ShieldCheck
      : tier === "verifiedCto"
        ? Users
        : ShieldOff;

  return (
    <span
      className={cn("sof-verified", TONE[tier], className)}
      title={LABEL[tier]}
      aria-label={LABEL[tier]}
    >
      <Icon strokeWidth={1.8} aria-hidden="true" />
      {!iconOnly && <span>{LABEL[tier]}</span>}
    </span>
  );
}
