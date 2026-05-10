import { cn } from "@/lib/cn";

interface Props {
  address: string;          // truncated, e.g. "Hxk2…7gPZ"
  className?: string;
  /** Override jdenticon hue — defaults to amber gradient. */
  identStyle?: React.CSSProperties;
}

export function WalletPill({ address, className, identStyle }: Props) {
  return (
    <span className={cn("sof-wallet-pill", className)}>
      <span className="ident" style={identStyle} aria-hidden="true" />
      <span>{address}</span>
    </span>
  );
}
