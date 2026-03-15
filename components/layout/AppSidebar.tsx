"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/cn";

type AppSidebarProps = {
  footer?: ReactNode;
  subtitle?: string;
};

export function AppSidebar({ footer, subtitle }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 border-r border-[var(--border)] lg:flex flex-col bg-[var(--surface-strong)] shrink-0">
      <div className="p-6 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-md">
            <span className="material-symbols-outlined font-bold text-sm">auto_fix_high</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight font-display">SOPSmith</h1>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-2">
        <SidebarLink
          href="/dashboard"
          label="Library"
          icon="library_books"
          active={pathname === "/dashboard"}
        />
        <SidebarLink
          href="/dashboard/new"
          label="New SOP"
          icon="add_circle"
          active={pathname === "/dashboard/new"}
        />
      </nav>

      <div className="mt-auto p-4 border-t border-[var(--border)] space-y-4">
        <ThemeToggle className="w-full justify-center" />
        
        <div className="flex items-center gap-3 px-3 py-3 bg-[var(--surface-muted)] rounded-xl border border-[var(--border)]">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
            <span className="material-symbols-outlined text-primary text-sm">person</span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <p className="text-xs font-bold truncate" title={subtitle}>{subtitle || "Operator"}</p>
            <p className="text-[10px] font-mono text-muted uppercase tracking-wider mt-0.5">Workspace</p>
          </div>
        </div>
        
        {footer}
      </div>
    </aside>
  );
}

type SidebarLinkProps = {
  active?: boolean;
  href: string;
  label: string;
  icon: string;
};

function SidebarLink({ active = false, href, label, icon }: SidebarLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-[var(--surface-muted)] hover:text-foreground"
      )}
    >
      <span
        className={cn(
          "material-symbols-outlined text-[20px]",
          active && "font-variation-fill"
        )}
      >
        {icon}
      </span>
      <span className={cn("text-sm", active ? "font-bold" : "font-medium")}>
        {label}
      </span>
    </Link>
  );
}
