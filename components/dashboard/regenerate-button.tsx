"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { regenerateSopAction } from "@/app/dashboard/actions";

type RegenerateButtonProps = {
  sopId: string;
};

export function RegenerateButton({ sopId }: RegenerateButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleRegenerate() {
    setError(null);
    startTransition(async () => {
      const result = await regenerateSopAction(sopId);
      if (result?.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => {
          setConfirming(true);
          setError(null);
        }}
        className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wide rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900/60 hover:border-primary/40 hover:text-primary transition-all duration-200"
      >
        <span className="material-symbols-outlined text-[16px]">autorenew</span>
        Regenerate SOP
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
        Re-generate this SOP from the original notes? The current content will be replaced.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={isPending}
          className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wide rounded-xl border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Regenerating…" : "Yes, regenerate"}
        </button>
        <button
          type="button"
          onClick={() => {
            setConfirming(false);
            setError(null);
          }}
          disabled={isPending}
          className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wide rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
      {error ? (
        <p className="text-xs text-red-500 font-medium">{error}</p>
      ) : null}
    </div>
  );
}
