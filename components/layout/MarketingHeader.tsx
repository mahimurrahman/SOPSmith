import Link from "next/link";
import type { ReactNode } from "react";

import { Container } from "@/components/ui/Container";

type MarketingHeaderProps = {
  signedIn?: boolean;
  actions?: ReactNode;
};

export function MarketingHeader({ actions, signedIn = false }: MarketingHeaderProps) {
  return (
    <header className="sticky top-0 z-[100] w-full border-b border-white/5 obsidian-glass">
      <Container className="flex h-20 items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent shadow-[0_0_20px_rgba(60,131,246,0.4)]">
            <span className="mono-label !text-[0.8rem] font-bold text-accent-foreground">SS</span>
          </div>
          <span className="heading-display text-xl font-black uppercase tracking-tight text-foreground">
            SOPSmith
          </span>
        </div>

        <nav className="hidden items-center gap-10 lg:flex">
          <Link href="/" className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted hover:text-accent transition-colors">
            Infrastructure
          </Link>
          <Link
            href={signedIn ? "/dashboard" : "/login?next=%2Fdashboard"}
            className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted hover:text-accent transition-colors"
          >
            Library
          </Link>
          <Link
            href={signedIn ? "/dashboard/new" : "/login?next=%2Fdashboard%2Fnew"}
            className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted hover:text-accent transition-colors"
          >
            New SOP
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {actions}
        </div>
      </Container>
    </header>
  );
}
