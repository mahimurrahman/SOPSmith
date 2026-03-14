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
    <aside className="hidden w-64 border-r border-slate-200 dark:border-slate-800/60 lg:flex flex-col bg-white dark:bg-background-dark shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined font-bold">bolt</span>
        </div>
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">SOPSmith</h1>
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

      <div className="mt-auto p-4 border-t border-slate-200 dark:border-slate-800/60 space-y-4">
        <ThemeToggle className="w-full justify-center" />
        
        <div className="flex items-center gap-3 px-3 py-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800/50">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
            <span className="material-symbols-outlined text-primary text-sm">person</span>
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate" title={subtitle}>{subtitle || "Operator"}</p>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Workspace Admin</p>
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
          ? "bg-primary/5 dark:bg-primary/10 text-primary"
          : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
      )}
    >
      <span
        className={cn(
          "material-symbols-outlined text-[22px]",
          active && "font-variation-fill"
        )}
      >
        {icon}
      </span>
      <span className={cn("text-sm", active ? "font-bold" : "font-semibold")}>
        {label}
      </span>
    </Link>
  );
}
