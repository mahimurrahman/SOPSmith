"use client";

import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/cn";

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "inline-flex min-h-11 items-center gap-3 rounded-full border border-border bg-surface-muted px-4 py-2 text-sm font-medium text-foreground shadow-soft transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme`}
      aria-pressed={resolvedTheme === "dark"}
      title={`Current theme: ${resolvedTheme}`}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex h-2.5 w-2.5 rounded-full",
          resolvedTheme === "light" ? "bg-accent" : "bg-foreground",
        )}
      />
      <span>{resolvedTheme === "dark" ? "Dark" : "Light"} theme</span>
    </button>
  );
}
