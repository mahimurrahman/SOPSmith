"use client";

import { useFormStatus } from "react-dom";

export function SignOutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full border border-border bg-surface-muted px-4 py-2 text-sm font-medium text-foreground shadow-soft disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Signing out..." : "Sign out"}
    </button>
  );
}
