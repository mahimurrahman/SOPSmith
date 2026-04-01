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
    // Standard Next.js hydration guard — must run after mount to read resolved theme
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className={cn("inline-flex min-h-[42px] items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2 opacity-50 cursor-pointer", className)}>
        <span aria-hidden="true" className="inline-flex h-2.5 w-2.5 rounded-full bg-[var(--muted)]" />
        <span className="text-sm font-semibold">Loading...</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={cn(
        "inline-flex min-h-[42px] items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-foreground transition-all duration-150 hover:bg-[var(--surface-muted)] cursor-pointer",
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
          resolvedTheme === "light" ? "bg-amber-500" : "bg-primary"
        )}
      />
      <span>{resolvedTheme === "dark" ? "Light Theme" : "Dark Theme"}</span>
    </button>
  );
}
