"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface ProfileTab {
  value: string;
  label: string;
  /** Small count badge rendered next to the label — claims count, refinery count, etc. */
  count?: number | string;
  /** Server-rendered panel content. */
  panel: ReactNode;
}

interface Props {
  tabs: ProfileTab[];
  /** URL search-param key used to persist the active tab so deep-links share. */
  paramKey?: string;
  defaultValue?: string;
}

function readTabFromUrl(paramKey: string, valid: string[]): string | null {
  if (typeof window === "undefined") return null;
  const val = new URLSearchParams(window.location.search).get(paramKey);
  return val && valid.includes(val) ? val : null;
}

export function WalletProfileTabs({
  tabs,
  paramKey = "tab",
  defaultValue,
}: Props) {
  const fallback = defaultValue ?? tabs[0]?.value ?? "";
  const [active, setActive] = useState(fallback);

  // Hydrate active tab from URL after mount so SSR markup matches.
  useEffect(() => {
    const fromUrl = readTabFromUrl(
      paramKey,
      tabs.map((t) => t.value),
    );
    if (fromUrl && fromUrl !== active) setActive(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = useCallback(
    (next: string) => {
      setActive(next);
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      if (next === fallback) {
        params.delete(paramKey);
      } else {
        params.set(paramKey, next);
      }
      const qs = params.toString();
      const url = `${window.location.pathname}${qs ? `?${qs}` : ""}`;
      // Shallow update — avoids triggering a server re-fetch for a
      // force-dynamic page when the tab changes.
      window.history.replaceState({}, "", url);
    },
    [paramKey, fallback],
  );

  if (!active) return null;

  return (
    <Tabs.Root value={active} onValueChange={onChange} className="sof-wp-tabs">
      <Tabs.List className="sof-wp-tabs-list" aria-label="Profile sections">
        {tabs.map((t) => (
          <Tabs.Trigger
            key={t.value}
            value={t.value}
            className={cn("sof-wp-tab", active === t.value && "on")}
          >
            <span className="lab">{t.label}</span>
            {t.count !== undefined && (
              <span className="cnt">{t.count}</span>
            )}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {tabs.map((t) => (
        <Tabs.Content
          key={t.value}
          value={t.value}
          className="sof-wp-tabs-panel"
          tabIndex={-1}
        >
          {t.panel}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
