"use client";

import { useTheme } from "next-themes";
import { cn } from "@/lib/cn";

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const currentTheme = resolvedTheme ?? "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
      className={cn(
        "inline-flex min-h-[42px] items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-foreground transition-all duration-150 hover:bg-[var(--surface-muted)] cursor-pointer",
        className,
      )}
      aria-label={`Switch to ${currentTheme === "dark" ? "light" : "dark"} theme`}
      aria-pressed={currentTheme === "dark"}
      title={`Current theme: ${currentTheme}`}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex h-2.5 w-2.5 rounded-full",
          currentTheme === "light" ? "bg-amber-500" : "bg-primary"
        )}
      />
      <span>{currentTheme === "dark" ? "Light Theme" : "Dark Theme"}</span>
    </button>
  );
}
