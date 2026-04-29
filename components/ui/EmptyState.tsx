import Link from "next/link";
import type { ReactNode } from "react";

import { getButtonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

type EmptyStateProps = {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
  children?: ReactNode;
};

export function EmptyState({
  actionHref,
  actionLabel,
  children,
  className,
  description,
  title,
}: EmptyStateProps) {
  return (
    <Card className={cn("rounded-[2rem] px-6 py-10 text-center", className)}>
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.6rem] bg-accent/14 text-xl font-black tracking-[0.2em] text-accent">
          SS
        </div>
        <div className="space-y-3">
          <h2 className="heading-display text-h2 font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="mx-auto max-w-xl text-base leading-7 text-muted">{description}</p>
        </div>
        {children}
        {actionHref && actionLabel ? (
          <div className="pt-2">
            <Link href={actionHref} className={getButtonClasses({})}>
              {actionLabel}
            </Link>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
