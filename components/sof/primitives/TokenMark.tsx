import { cn } from "@/lib/cn";
import type { TokenMarkVariant } from "@/lib/mock-data";

interface Props {
  variant: TokenMarkVariant;
  symbol: string;
  size?: number;
  className?: string;
  /** Resolved image URL (Metaplex / DAS / off-chain JSON). When
   *  present, takes precedence over the gradient + initial. */
  logoUrl?: string | null;
}

/**
 * Per-token gradient mark. Renders the symbol's first letter on a
 * gradient locked per token in globals.css (.sof-token-mark.bonk,
 * .jup, .wif, …). When a logoUrl is supplied (e.g. fetched from
 * the token's Metaplex metadata JSON), renders the image instead.
 */
export function TokenMark({
  variant,
  symbol,
  size = 36,
  className,
  logoUrl,
}: Props) {
  const variantClass = variant === "default" ? "" : variant;
  const initial = symbol.charAt(0);
  return (
    <span
      className={cn("sof-token-mark", variantClass, className)}
      style={{
        width: size,
        height: size,
        fontSize: size <= 28 ? 11 : size <= 36 ? 14 : 16,
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt=""
          width={size}
          height={size}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      ) : (
        initial
      )}
    </span>
  );
}
