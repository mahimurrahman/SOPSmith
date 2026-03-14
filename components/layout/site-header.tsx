import Link from "next/link";
import type { ReactNode } from "react";

import { SiteNav } from "@/components/layout/site-nav";
import { getButtonClasses } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/cn";

type SiteHeaderProps = {
  actions?: ReactNode;
  className?: string;
  signedIn?: boolean;
  subtitle?: string;
};

export function SiteHeader({
  actions,
  className,
  signedIn = false,
  subtitle,
}: SiteHeaderProps) {
  return (
    <header className={cn("surface-card rounded-[2rem] px-5 py-4 sm:px-6", className)}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-5">
          <div>
            <Link href="/" className="inline-flex items-center gap-3 text-lg font-semibold tracking-tight text-foreground">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-sm font-black tracking-[0.2em] text-accent-foreground">
                SS
              </span>
              <span>SOPSmith</span>
            </Link>
            {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
          </div>

          <SiteNav authenticated={signedIn} />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ThemeToggle />
          {actions ?? (
            <Link
              href={signedIn ? "/dashboard" : "/login"}
              className={getButtonClasses({ size: "sm", variant: signedIn ? "secondary" : "primary" })}
            >
              {signedIn ? "Open library" : "Sign in"}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
