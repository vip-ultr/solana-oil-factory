"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const TABS = [
  { label: "Terms of service", href: "/legal/terms" },
  { label: "Privacy policy", href: "/legal/privacy" },
];

export default function LegalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="sof-lg-doc">
      <div className="sof-lg-tabs">
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={cn(pathname === t.href && "on")}
          >
            {t.label}
          </Link>
        ))}
        <a>Operator agreement</a>
        <a>Disclosure</a>
      </div>
      {children}
    </div>
  );
}
