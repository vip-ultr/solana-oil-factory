import { cn } from "@/lib/cn";
import type { TokenMarkVariant } from "@/lib/mock-data";

interface Props {
  variant: TokenMarkVariant;
  symbol: string;
  size?: number;
  className?: string;
}

/**
 * Per-token gradient mark. Renders the symbol's first letter (or two for
 * very short symbols) on a gradient that's locked per token in globals.css
 * (.sof-token-mark.bonk, .jup, .wif, .pop, .pyth, .jto, .mother, .mew, .ray,
 * .orca, .mnde, .giga). Falls back to the default amber gradient.
 */
export function TokenMark({ variant, symbol, size = 36, className }: Props) {
  const variantClass = variant === "default" ? "" : variant;
  const initial = symbol.length <= 4 ? symbol.charAt(0) : symbol.charAt(0);
  return (
    <span
      className={cn("sof-token-mark", variantClass, className)}
      style={{
        width: size,
        height: size,
        fontSize: size <= 28 ? 11 : size <= 36 ? 14 : 16,
      }}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}
