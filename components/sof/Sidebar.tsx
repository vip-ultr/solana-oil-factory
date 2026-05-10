"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Building2,
  BarChart3,
  Factory,
  LayoutDashboard,
  User,
  Star,
  Shield,
  Code2,
  HelpCircle,
  Wallet,
  Flame,
  LogOut,
} from "lucide-react";
import { useWalletConnection } from "@solana/react-hooks";
import { cn } from "@/lib/cn";
import type { ComponentType, SVGProps } from "react";

type NavItem = {
  key: string;
  label: string;
  href: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Match logic: exact href OR starts-with-href when sub. */
  match?: "exact" | "prefix";
};

const NAV_PRIMARY: NavItem[] = [
  { key: "home", label: "Home", href: "/", Icon: Home, match: "exact" },
  { key: "refineries", label: "Refineries", href: "/refineries", Icon: Building2, match: "prefix" },
  { key: "launchpad", label: "Launchpad refining", href: "/launchpad", Icon: Flame, match: "prefix" },
  { key: "leaderboard", label: "Leaderboard", href: "/leaderboard", Icon: BarChart3, match: "prefix" },
  { key: "launch", label: "Launch refinery", href: "/refinery/launch", Icon: Factory, match: "prefix" },
];

const NAV_SECONDARY: NavItem[] = [
  { key: "dashboard", label: "My dashboard", href: "/dashboard", Icon: LayoutDashboard, match: "prefix" },
  { key: "profile", label: "Profile", href: "/wallet", Icon: User, match: "prefix" },
  { key: "reputation", label: "Reputation", href: "/reputation", Icon: Star, match: "prefix" },
  { key: "trust", label: "Trust & status", href: "/trust", Icon: Shield, match: "prefix" },
  { key: "developers", label: "Developers", href: "/developers", Icon: Code2, match: "prefix" },
  { key: "help", label: "Help", href: "/help", Icon: HelpCircle, match: "prefix" },
];

function isActive(item: NavItem, pathname: string): boolean {
  if (item.match === "exact") return pathname === item.href;
  return pathname === item.href || pathname.startsWith(item.href + "/");
}

function NavGroup({ items, pathname }: { items: NavItem[]; pathname: string }) {
  return (
    <nav className="sof-nav-group">
      {items.map((item) => {
        const active = isActive(item, pathname);
        return (
          <Link
            key={item.key}
            href={item.href}
            className={cn("sof-nav-item", active && "active")}
            aria-current={active ? "page" : undefined}
          >
            <item.Icon strokeWidth={1.6} aria-hidden="true" />
            <span className="label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const pathname = usePathname() ?? "/";

  return (
    <aside className="sof-sidebar" aria-label="Primary navigation">
      <Link href="/" className="logo" aria-label="Solana Oil Factory home">
        <Image src="/logo.png" alt="" width={28} height={28} priority />
        <span className="word">
          Solana
          <br />
          Oil Factory
        </span>
      </Link>

      <NavGroup items={NAV_PRIMARY} pathname={pathname} />
      <NavGroup items={NAV_SECONDARY} pathname={pathname} />

      <div className="sof-sidebar-footer">
        <div className="sof-sb-foot-row" title="Solana Devnet">
          <span className="ic">
            <span className="net-led" aria-hidden="true" />
          </span>
          <span className="net-text">
            <span className="k">NETWORK</span>
            <span className="v">Devnet</span>
          </span>
        </div>
        <ConnectControl />
      </div>
    </aside>
  );
}

function ConnectControl() {
  const { connected, wallet, disconnect, isReady } = useWalletConnection();
  const address = wallet?.account?.address?.toString();

  if (!connected || !address) {
    return (
      <button
        type="button"
        className="sof-connect-btn"
        onClick={() => dispatchEvent(new CustomEvent("sof:open-connect"))}
        disabled={!isReady}
      >
        <span className="ic">
          <Wallet strokeWidth={1.8} aria-hidden="true" />
        </span>
        <span className="label">Connect wallet</span>
      </button>
    );
  }

  const truncated = `${address.slice(0, 4)}…${address.slice(-4)}`;
  return (
    <Link
      href={`/wallet/${address}`}
      title={address}
      className="sof-connect-btn sof-connect-btn-connected"
    >
      <span className="ic">
        <Wallet strokeWidth={1.8} aria-hidden="true" />
      </span>
      <span className="label font-mono">{truncated}</span>
      <button
        type="button"
        className="sof-disconnect"
        onClick={(e) => {
          // Stop the click from navigating to the wallet page.
          e.preventDefault();
          e.stopPropagation();
          void disconnect();
        }}
        title="Disconnect"
        aria-label="Disconnect wallet"
      >
        <LogOut size={14} strokeWidth={1.8} aria-hidden="true" />
      </button>
    </Link>
  );
}
