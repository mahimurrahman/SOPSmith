"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type ActionButtonProps = {
  children: ReactNode;
  pendingLabel?: string;
  tone?: "primary" | "secondary" | "danger";
};

export function ActionButton({ children, pendingLabel = "Working...", tone = "primary" }: ActionButtonProps) {
  const { pending } = useFormStatus();
  const toneClass =
    tone === "danger"
      ? "border-red-500/30 bg-red-500/10 text-red-600 hover:bg-red-500/15 dark:text-red-300"
      : tone === "secondary"
        ? "border-[var(--border)] bg-[var(--surface)] text-foreground hover:border-primary/40 hover:text-primary"
        : "border-primary bg-primary text-white hover:bg-primary/90";

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-bold transition disabled:opacity-55 ${toneClass}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
