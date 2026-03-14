"use client";

import Link from "next/link";
import { useEffect } from "react";

import { EmptyState } from "@/components/ui/EmptyState";
import { getDisplayErrorMessage } from "@/lib/errors";

export default function DashboardError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  const showRepairHint = error.message.includes("repair SQL");
  const message = getDisplayErrorMessage(
    error,
    "This dashboard section could not load. Please try again in a moment.",
  );

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <EmptyState
      title="This part of SOPSmith could not load."
      description={message}
      className="text-left"
    >
      {showRepairHint ? (
        <p className="mx-auto max-w-2xl text-sm leading-6 text-muted">
          Open the latest repair migration in the repo and run it in Supabase, then refresh this page.
        </p>
      ) : null}
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button type="button" onClick={reset} className="primary-button">
          Try again
        </button>
        <Link href="/dashboard" className="secondary-button">
          Return to library
        </Link>
      </div>
    </EmptyState>
  );
}
