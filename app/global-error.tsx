"use client";

import Link from "next/link";
import { useEffect } from "react";

import { getDisplayErrorMessage } from "@/lib/errors";

export default function GlobalError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  const message = getDisplayErrorMessage(
    error,
    "SOPSmith hit an unexpected problem. Please refresh or try again in a moment.",
  );

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-background text-foreground antialiased">
        <main className="page-shell flex min-h-screen items-center justify-center px-6 py-10">
          <div className="surface-card w-full max-w-2xl rounded-[2rem] px-7 py-10">
            <div className="eyebrow">Unexpected error</div>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">
              SOPSmith could not finish that request.
            </h1>
            <p className="mt-4 text-base leading-7 text-muted">{message}</p>
            <p className="mt-3 text-sm leading-6 text-muted">
              If this keeps happening in production, recheck your Vercel env vars,
              Supabase auth URLs, and Groq credentials before retrying.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={reset} className="primary-button">
                Try again
              </button>
              <Link href="/" className="secondary-button">
                Go home
              </Link>
              <Link href="/login" className="secondary-button">
                Open sign in
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
