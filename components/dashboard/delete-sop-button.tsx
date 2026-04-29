"use client";

import { useState, useTransition } from "react";

import { deleteSopAction } from "@/app/dashboard/actions";

type DeleteSopButtonProps = {
  sopId: string;
  sopTitle: string;
};

export function DeleteSopButton({ sopId, sopTitle }: DeleteSopButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteSopAction(sopId);
      if (result?.error) {
        setError(result.error);
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
        className="w-full py-3 text-xs font-bold uppercase tracking-wide rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-transparent hover:border-red-400 hover:text-red-500 dark:hover:border-red-500 dark:hover:text-red-400 transition-all duration-200"
      >
        Delete SOP
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
        Delete <span className="font-bold text-slate-900 dark:text-white">{sopTitle}</span>? This cannot be undone.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wide rounded-xl border border-red-300 dark:border-red-500/40 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Deleting…" : "Yes, delete"}
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
