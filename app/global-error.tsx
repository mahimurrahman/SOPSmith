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
      <body suppressHydrationWarning className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-200 antialiased font-sans">
        <main className="flex min-h-screen items-center justify-center p-6 bg-background-light dark:bg-background-dark">
          <section className="flex flex-col gap-6 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 overflow-hidden relative group max-w-2xl w-full text-center">
            <div className="flex justify-between items-center relative z-10 w-full mb-4">
              <h3 className="font-bold text-slate-400 dark:text-slate-500 uppercase text-[10px] tracking-[0.2em] mx-auto">
                System Exception
              </h3>
            </div>
            
            <div className="relative py-12 flex flex-col items-center justify-center">
              <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
                <div className="w-72 h-72 bg-red-500 blur-[120px] rounded-full"></div>
              </div>
              
              <div className="relative mb-6">
                <span className="text-[140px] font-black text-slate-100 dark:text-slate-800/40 leading-none select-none font-display">
                  ERROR
                </span>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/40 dark:bg-background-dark/60 backdrop-blur-md p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl">
                  <span className="material-symbols-outlined text-red-500 text-5xl">warning</span>
                </div>
              </div>
              
              <h4 className="text-3xl font-extrabold tracking-tight mb-2 text-slate-900 dark:text-white font-display">
                SOPSmith could not finish that request.
              </h4>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-4 text-lg">
                {message}
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mb-10 max-w-[400px]">
                If this keeps happening in production, recheck your Vercel env vars,
                Supabase auth URLs, and Groq credentials before retrying.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full">
                <button 
                  type="button" 
                  onClick={reset} 
                  className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-xl shadow-primary/25 text-sm w-full sm:w-auto"
                >
                  <span className="material-symbols-outlined text-lg">refresh</span>
                  Try again
                </button>
                <Link 
                  href="/" 
                  className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold py-3.5 px-8 rounded-xl transition-all text-sm w-full sm:w-auto"
                >
                  Go home
                </Link>
                <Link 
                  href="/login" 
                  className="flex items-center justify-center gap-2 text-primary font-bold hover:bg-primary/5 py-3.5 px-6 rounded-xl transition-colors text-sm w-full sm:w-auto"
                >
                  Open sign in
                </Link>
              </div>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
