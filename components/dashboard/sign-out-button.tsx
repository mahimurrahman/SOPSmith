"use client";

import { useFormStatus } from "react-dom";

export function SignOutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] hover:bg-[var(--surface)] transition-all px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="material-symbols-outlined text-[18px]">logout</span>
      {pending ? "Signing out..." : "Sign out"}
    </button>
  );
}
