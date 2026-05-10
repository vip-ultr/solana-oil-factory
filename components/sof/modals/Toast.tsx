"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ToastTier = 1 | 2 | 3 | 4 | 5 | 6;

interface ToastInput {
  tier: ToastTier;
  body: ReactNode;
  /** Override auto-dismiss (ms). 0 = no auto-dismiss. */
  duration?: number;
  /** Optional action button (e.g. "Retry"). */
  action?: { label: string; onClick: () => void };
  /** Optional icon override. Defaults to a tier-appropriate glyph. */
  icon?: ReactNode;
}

interface Toast extends ToastInput {
  id: string;
}

interface ToastContextValue {
  notify: (input: ToastInput) => string;
  dismiss: (id: string) => void;
}

const ToastCtx = createContext<ToastContextValue | null>(null);

const DEFAULTS: Record<ToastTier, { duration: number; icon: string }> = {
  1: { duration: 4000, icon: "·" }, // trivial
  2: { duration: 8000, icon: "✓" }, // action confirmation
  3: { duration: 10000, icon: "!" }, // error
  4: { duration: 0, icon: "i" }, // stakes alert (manual dismiss)
  5: { duration: 6000, icon: "↗" }, // live activity
  6: { duration: 5000, icon: "↺" }, // rate-limited
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback((input: ToastInput) => {
    counter.current += 1;
    const id = `toast-${counter.current}`;
    const toast: Toast = { ...input, id };
    setToasts((prev) => [...prev, toast]);

    const duration = input.duration ?? DEFAULTS[input.tier].duration;
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }
    return id;
  }, [dismiss]);

  return (
    <ToastCtx.Provider value={{ notify, dismiss }}>
      {children}
      <div className="sof-tt-region" role="region" aria-label="Notifications">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn("sof-tt")}
            data-tier={t.tier}
            role={t.tier === 3 ? "alert" : "status"}
            aria-live={t.tier === 3 ? "assertive" : "polite"}
          >
            <div className="sof-tt-icon" aria-hidden="true">
              {t.icon ?? DEFAULTS[t.tier].icon}
            </div>
            <div className="sof-tt-body">{t.body}</div>
            {t.action && (
              <button
                type="button"
                className="sof-tt-action"
                onClick={() => {
                  t.action?.onClick();
                  dismiss(t.id);
                }}
              >
                {t.action.label}
              </button>
            )}
            <button
              type="button"
              className="sof-tt-x"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

/** Demo: load this once on mount to surface the SOF service-degraded
 * pattern. Removed in production. */
export function useDemoToast() {
  const { notify } = useToast();
  useEffect(() => {
    // No-op — left as an extension point.
    void notify;
  }, [notify]);
}
