"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className={cn("inline-flex min-h-11 items-center gap-3 rounded-full border border-border bg-surface-muted px-4 py-2 opacity-50 cursor-pointer", className)}>
        <span aria-hidden="true" className="inline-flex h-2.5 w-2.5 rounded-full bg-slate-500" />
        <span>Loading...</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={cn(
        "inline-flex min-h-11 items-center gap-3 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-5 py-2 text-sm font-bold text-slate-900 dark:text-white transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md cursor-pointer",
        className,
      )}
      aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme`}
      aria-pressed={resolvedTheme === "dark"}
      title={`Current theme: ${resolvedTheme}`}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex h-3 w-3 rounded-full shadow-inner",
          resolvedTheme === "light" ? "bg-amber-400" : "bg-primary shadow-primary/40",
        )}
      />
      <span>{resolvedTheme === "dark" ? "Dark Mode" : "Light Mode"}</span>
    </button>
  );
}
