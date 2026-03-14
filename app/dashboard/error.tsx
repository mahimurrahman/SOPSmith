"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  const showRepairHint = error.message.includes("repair SQL");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="surface-card rounded-[2rem] px-6 py-10">
      <div className="eyebrow">Something went wrong</div>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
        This dashboard section could not load.
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
        {error.message || "Please try again in a moment."}
      </p>
      {showRepairHint ? (
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Open the latest repair migration in the repo and run it in Supabase, then
          refresh this page.
        </p>
      ) : null}
      <button
        type="button"
        onClick={reset}
        className="primary-button mt-6"
      >
        Try again
      </button>
    </div>
  );
}
