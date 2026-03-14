import Link from "next/link";
import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Container } from "@/components/ui/Container";
import { getButtonClasses } from "@/components/ui/Button";

type AppHeaderProps = {
  actions?: ReactNode;
  subtitle?: string;
};

export function AppHeader({ actions, subtitle }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 pt-4">
      <Container>
        <div className="glass-outline flex flex-col gap-4 rounded-[1.8rem] px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-8">
            <Link href="/dashboard" className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-sm font-black tracking-[0.2em] text-accent-foreground shadow-soft">
                SS
              </span>
              <div>
                <p className="heading-display text-lg font-semibold tracking-tight text-foreground">
                  SOPSmith
                </p>
                {subtitle ? <p className="text-xs text-muted">{subtitle}</p> : null}
              </div>
            </Link>

            <nav aria-label="Application" className="flex flex-wrap items-center gap-2">
              <Link href="/dashboard" className={getButtonClasses({ size: "sm", variant: "ghost" })}>
                Library
              </Link>
              <Link href="/dashboard/new" className={getButtonClasses({ size: "sm", variant: "ghost" })}>
                New SOP
              </Link>
            </nav>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ThemeToggle />
            {actions}
          </div>
        </div>
      </Container>
    </header>
  );
}
