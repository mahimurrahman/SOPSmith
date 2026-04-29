import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type ToastProps = {
  description?: string;
  onDismiss: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  title: string;
  tone: "default" | "error" | "success";
};

export function Toast({ description, onDismiss, title, tone }: ToastProps) {
  return (
    <div
      className={cn(
        "pointer-events-auto rounded-[1.35rem] border px-4 py-3 shadow-panel backdrop-blur-md",
        tone === "success" && "border-emerald-500/30 bg-emerald-500/12 text-emerald-100",
        tone === "error" && "border-rose-500/30 bg-rose-500/12 text-rose-100",
        tone === "default" && "border-border bg-surface-strong text-foreground",
      )}
      role="status"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold">{title}</p>
          {description ? <p className="text-sm leading-6 text-current/85">{description}</p> : null}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-full px-2 py-1 text-xs font-semibold text-current/80 hover:bg-black/10"
          aria-label="Dismiss notification"
        >
          Close
        </button>
      </div>
    </div>
  );
}
