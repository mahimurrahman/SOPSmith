import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type AccordionProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  defaultOpen?: boolean;
  summary: ReactNode;
  summaryClassName?: string;
};

export function Accordion({
  children,
  className,
  contentClassName,
  defaultOpen = false,
  summary,
  summaryClassName,
}: AccordionProps) {
  return (
    <details
      className={cn("group rounded-panel border border-border bg-surface-muted", className)}
      open={defaultOpen}
    >
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-foreground marker:hidden focus-visible:outline-none",
          summaryClassName,
        )}
      >
        <span>{summary}</span>
        <span
          aria-hidden="true"
          className="text-base text-muted transition-transform duration-200 group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className={cn("px-5 pb-5 pt-0 text-sm leading-7 text-muted", contentClassName)}>
        {children}
      </div>
    </details>
  );
}
