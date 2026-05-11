"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Building2,
  Code2,
  Factory,
  HelpCircle,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  Star,
  User,
  Wallet,
  X,
} from "lucide-react";
import { useWalletConnection } from "@solana/react-hooks";
import { useSiws } from "@/components/sof/SiwsProvider";
import { ThemeToggle } from "@/components/sof/ThemeToggle";
import { cn } from "@/lib/cn";

type NavLink = {
  key: string;
  label: string;
  href: string;
  match?: "exact" | "prefix";
};

const NAV_PRIMARY: NavLink[] = [
  { key: "home", label: "Home", href: "/", match: "exact" },
  { key: "refineries", label: "Refineries", href: "/refineries", match: "prefix" },
  { key: "launch", label: "Launch refinery", href: "/refinery/launch", match: "prefix" },
];

const NAV_WALLET: NavLink[] = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard", match: "prefix" },
  { key: "profile", label: "Profile", href: "/wallet", match: "prefix" },
];

const NAV_LEARN: NavLink[] = [
  { key: "reputation", label: "Reputation", href: "/reputation", match: "prefix" },
  { key: "trust", label: "Trust & status", href: "/trust", match: "prefix" },
  { key: "developers", label: "Developers", href: "/developers", match: "prefix" },
  { key: "help", label: "Help", href: "/help", match: "prefix" },
];

function isActive(item: NavLink, pathname: string): boolean {
  if (item.match === "exact") return pathname === item.href;
  return pathname === item.href || pathname.startsWith(item.href + "/");
}

/**
 * Top sticky bar shown on viewports < 768px. Logo on the left,
 * hamburger on the right that opens the slide-in drawer.
 */
export function MobileTopBar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "/";

  // Close on route change so tapping a link inside the drawer
  // doesn't leave it open over the new page.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Esc closes the drawer.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <header className="sof-mobile-topbar" aria-label="Mobile header">
        <Link href="/" className="lg" aria-label="Solana Oil Factory home">
          <Image src="/logo.png" alt="" width={24} height={24} priority />
          <span>Sol Oil Factory</span>
        </Link>
        <button
          type="button"
          className="sof-mobile-burger"
          onClick={() => setOpen(true)}
          aria-label="Open navigation drawer"
          aria-expanded={open}
        >
          <Menu size={20} strokeWidth={1.8} />
        </button>
      </header>

      <MobileDrawer open={open} onClose={() => setOpen(false)} pathname={pathname} />
    </>
  );
}

function MobileDrawer({
  open,
  onClose,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
}) {
  return (
    <>
      <div
        className={cn("sof-mobile-scrim", open && "on")}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn("sof-mobile-drawer", open && "on")}
        aria-label="Mobile navigation"
        aria-hidden={!open}
      >
        <div className="hdr">
          <span className="brand">Solana Oil Factory</span>
          <button
            type="button"
            className="x"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={18} strokeWidth={1.8} />
          </button>
        </div>

        <DrawerGroup
          title="NAVIGATE"
          items={NAV_PRIMARY}
          pathname={pathname}
          onLink={onClose}
        />
        <DrawerGroup
          title="YOUR WALLET"
          items={NAV_WALLET}
          pathname={pathname}
          onLink={onClose}
        />
        <DrawerGroup
          title="LEARN"
          items={NAV_LEARN}
          pathname={pathname}
          onLink={onClose}
        />

        <div className="ft">
          <ConnectControl />
          <div className="row">
            <span className="net">Devnet</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
}

function DrawerGroup({
  title,
  items,
  pathname,
  onLink,
}: {
  title: string;
  items: NavLink[];
  pathname: string;
  onLink: () => void;
}) {
  return (
    <div className="grp">
      <span className="lab">{title}</span>
      {items.map((item) => {
        const active = isActive(item, pathname);
        const icon = ICON_FOR[item.key];
        return (
          <Link
            key={item.key}
            href={item.href}
            className={cn("itm", active && "on")}
            onClick={onLink}
            aria-current={active ? "page" : undefined}
          >
            {icon ? icon : null}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

const ICON_FOR: Record<string, React.ReactNode> = {
  home: <Home size={16} strokeWidth={1.6} aria-hidden="true" />,
  refineries: <Building2 size={16} strokeWidth={1.6} aria-hidden="true" />,
  launch: <Factory size={16} strokeWidth={1.6} aria-hidden="true" />,
  dashboard: <LayoutDashboard size={16} strokeWidth={1.6} aria-hidden="true" />,
  profile: <User size={16} strokeWidth={1.6} aria-hidden="true" />,
  reputation: <Star size={16} strokeWidth={1.6} aria-hidden="true" />,
  trust: <Shield size={16} strokeWidth={1.6} aria-hidden="true" />,
  developers: <Code2 size={16} strokeWidth={1.6} aria-hidden="true" />,
  help: <HelpCircle size={16} strokeWidth={1.6} aria-hidden="true" />,
};

function ConnectControl() {
  const { connected, isReady } = useWalletConnection();
  const { authed, address, signOut, signing, signIn } = useSiws();

  if (!connected || !address) {
    return (
      <button
        type="button"
        className="sof-mobile-connect"
        onClick={() => dispatchEvent(new CustomEvent("sof:open-connect"))}
        disabled={!isReady}
      >
        <Wallet size={14} strokeWidth={1.8} />
        Connect wallet
      </button>
    );
  }
  if (!authed) {
    return (
      <button
        type="button"
        className="sof-mobile-connect warn"
        onClick={() => void signIn()}
        disabled={signing}
      >
        <Wallet size={14} strokeWidth={1.8} />
        {signing ? "Signing…" : "Sign to verify"}
      </button>
    );
  }
  const truncated = `${address.slice(0, 4)}…${address.slice(-4)}`;
  return (
    <div className="sof-mobile-connect on">
      <Wallet size={14} strokeWidth={1.8} />
      <span className="font-mono" style={{ flex: 1 }}>
        {truncated}
      </span>
      <button
        type="button"
        className="lo"
        onClick={signOut}
        title="Disconnect"
        aria-label="Disconnect wallet"
      >
        <LogOut size={13} strokeWidth={1.8} />
      </button>
    </div>
  );
}

/**
 * Bottom tab bar shown on viewports < 768px. Four quick targets:
 * Home, Refineries, Launch, Dashboard. Sticky to viewport
 * bottom; the layout reserves 64px of bottom padding for it.
 */
export function MobileTabBar() {
  const pathname = usePathname() ?? "/";
  const tabs: { key: string; label: string; href: string; icon: React.ReactNode; match: "exact" | "prefix" }[] = [
    {
      key: "home",
      label: "Home",
      href: "/",
      icon: <Home size={18} strokeWidth={1.6} aria-hidden="true" />,
      match: "exact",
    },
    {
      key: "refineries",
      label: "Refineries",
      href: "/refineries",
      icon: <Building2 size={18} strokeWidth={1.6} aria-hidden="true" />,
      match: "prefix",
    },
    {
      key: "launch",
      label: "Launch",
      href: "/refinery/launch",
      icon: <Factory size={18} strokeWidth={1.6} aria-hidden="true" />,
      match: "prefix",
    },
    {
      key: "dashboard",
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard size={18} strokeWidth={1.6} aria-hidden="true" />,
      match: "prefix",
    },
  ];
  return (
    <nav className="sof-mobile-tabs" aria-label="Mobile tab bar">
      {tabs.map((t) => {
        const active =
          t.match === "exact"
            ? pathname === t.href
            : pathname === t.href || pathname.startsWith(t.href + "/");
        return (
          <Link
            key={t.key}
            href={t.href}
            className={cn("tab", active && "on")}
            aria-current={active ? "page" : undefined}
          >
            {t.icon}
            <span>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
