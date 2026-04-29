import type { ReactNode } from "react";
import Link from "next/link";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { BackButton } from "@/components/ui/BackButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/cn";

type AppShellProps = {
  children: ReactNode;
  className?: string;
  sidebarFooter?: ReactNode;
  subtitle?: string;
};

export function AppShell({ children, className, sidebarFooter, subtitle }: AppShellProps) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background-light dark:bg-background-dark font-sans text-foreground">
      {/* Desktop Sidebar */}
      <AppSidebar footer={sidebarFooter} subtitle={subtitle} />

      {/* Mobile Top Navigation */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-[var(--border)] bg-background-light dark:bg-background-dark z-20 sticky top-0">
          <Link href="/dashboard/command" className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg flex shadow-md">
            <span className="material-symbols-outlined text-white text-[16px] leading-none">auto_fix_high</span>
          </div>
          <span className="text-xl font-bold tracking-tight font-display text-foreground">SOPSmith</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle className="scale-[0.85] origin-right" />
          <Link href="/dashboard/new" className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
             <span className="material-symbols-outlined text-[18px]">add</span>
          </Link>
        </div>
      </div>

      <main className={cn("flex-1 bg-background-light dark:bg-background-dark overflow-y-auto", className)}>
        <div className="p-4 sm:p-8 max-w-7xl mx-auto flex flex-col min-h-full relative">
          <div className="mb-6 flex items-center">
            <BackButton />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
