import type { ReactNode, CSSProperties } from "react";
import { cn } from "@/lib/cn";

interface Props {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** Mono uppercase muted label used as section / page eyebrows. */
export function Eyebrow({ children, className, style }: Props) {
  return (
    <span
      className={cn("font-mono", className)}
      style={{
        fontSize: 11,
        color: "var(--text-tertiary)",
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
