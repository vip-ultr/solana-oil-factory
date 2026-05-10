import { cn } from "@/lib/cn";
import type { RefineryStatus } from "@/lib/mock-data";
import { statusLabel } from "@/lib/mock-data";

const TONE: Record<RefineryStatus, string> = {
  active: "active",
  closingSoon: "closing",
  operatorPaused: "paused",
  closed: "closed",
  pendingSnapshot: "pending",
};

interface Props {
  status: RefineryStatus;
  className?: string;
}

export function StatusPill({ status, className }: Props) {
  const tone = TONE[status];
  return (
    <span className={cn("sof-pill", tone, className)}>
      {tone !== "closed" && <span className="led" aria-hidden="true" />}
      {statusLabel(status)}
    </span>
  );
}
