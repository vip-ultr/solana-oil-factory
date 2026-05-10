import Link from "next/link";
import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode, AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "miniPrimary" | "miniGhost";
type Size = "default" | "mini";

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "sof-btn sof-btn-primary",
  secondary: "sof-btn sof-btn-secondary",
  miniPrimary: "sof-btn-mini primary",
  miniGhost: "sof-btn-mini ghost",
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
}

type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement>;
type LinkButtonProps = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = "primary", className, children, type, ...rest }, ref) {
    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={cn(VARIANT_CLASS[variant], className)}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

export function ButtonLink({
  variant = "primary",
  className,
  children,
  href,
  ...rest
}: LinkButtonProps) {
  const isExternal = href.startsWith("http") || href.startsWith("mailto:");
  if (isExternal) {
    return (
      <a
        href={href}
        className={cn(VARIANT_CLASS[variant], className)}
        rel="noreferrer"
        {...rest}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cn(VARIANT_CLASS[variant], className)} {...rest}>
      {children}
    </Link>
  );
}
