"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { cn } from "@/lib/cn";

type ToastTone = "default" | "error" | "success";

type Toast = {
  description?: string;
  id: string;
  title: string;
  tone: ToastTone;
};

type ToastInput = Omit<Toast, "id">;

type ToastContextValue = {
  pushToast: (toast: ToastInput) => void;
};

const TOAST_DURATION_MS = 4200;

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback((toast: ToastInput) => {
    const id = crypto.randomUUID();
    setToasts((currentToasts) => [...currentToasts, { ...toast, id }]);
  }, []);

  useEffect(() => {
    if (toasts.length === 0) {
      return;
    }

    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        dismissToast(toast.id);
      }, TOAST_DURATION_MS),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [dismissToast, toasts]);

  const value = useMemo(
    () => ({
      pushToast,
    }),
    [pushToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-atomic="true"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-4 z-50 mx-auto flex max-w-md flex-col gap-3 px-4"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto rounded-[1.35rem] border px-4 py-3 shadow-panel backdrop-blur-md",
              toast.tone === "success" &&
                "border-emerald-500/30 bg-emerald-500/12 text-emerald-100",
              toast.tone === "error" && "border-rose-500/30 bg-rose-500/12 text-rose-100",
              toast.tone === "default" && "border-border bg-surface-strong text-foreground",
            )}
            role="status"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.description ? (
                  <p className="text-sm leading-6 text-current/85">{toast.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="rounded-full px-2 py-1 text-xs font-semibold text-current/80 hover:bg-black/10"
                aria-label="Dismiss notification"
              >
                Close
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider.");
  }

  return context;
}
