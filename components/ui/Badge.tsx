import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  tone?: "accent" | "muted" | "success";
};

export function Badge({ children, className, tone = "muted", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
        tone === "accent" && "border-accent/25 bg-accent/12 text-accent-foreground",
        tone === "muted" && "border-border bg-surface-muted text-muted",
        tone === "success" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
