"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  editSopChatAction,
  regenerateSopSectionAction,
} from "@/app/dashboard/actions";
import { useToast } from "@/components/ui/toast-provider";

type SopAgentPanelProps = {
  sopId: string;
};

function buildUpdatedUrl(
  pathname: string,
  searchParams: { toString(): string },
  updated: string,
) {
  const next = new URLSearchParams(searchParams.toString());
  next.set("updated", updated);
  next.set("tick", Date.now().toString());
  return `${pathname}?${next.toString()}`;
}

export function SopAgentPanel({ sopId }: SopAgentPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { pushToast } = useToast();
  const [instruction, setInstruction] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canSubmitEdit = useMemo(() => instruction.trim().length > 0, [instruction]);

  function handleRegenerateSteps() {
    setError(null);
    setSuccessMessage(null);
    setStatus("Generating...");

    startTransition(async () => {
      const result = await regenerateSopSectionAction(sopId, "steps");

      if (result?.error) {
        setError(result.error);
        setStatus(null);
        return;
      }

      setStatus("Validating...");
      setTimeout(() => {
        setStatus(null);
        setSuccessMessage("Steps update drafted for approval.");
      }, 300);

      pushToast({
        title: "Steps draft ready",
        description: "A proposed steps update was added to the approval queue.",
        tone: "success",
      });
      router.replace(buildUpdatedUrl(pathname, searchParams, result?.updatedSection ?? "steps"));
      router.refresh();
    });
  }

  function handleEdit() {
    if (!instruction.trim()) {
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setStatus("Generating...");

    startTransition(async () => {
      const result = await editSopChatAction(sopId, instruction.trim());

      if (result?.error) {
        setError(result.error);
        setStatus(null);
        return;
      }

      setStatus("Fixing...");
      setTimeout(() => {
        setStatus(null);
        setSuccessMessage("SOP edit drafted for approval.");
      }, 300);

      setInstruction("");
      pushToast({
        title: "SOP draft ready",
        description: "Your AI edit is waiting in the approval queue.",
        tone: "success",
      });
      router.replace(buildUpdatedUrl(pathname, searchParams, result?.updatedSection ?? "full"));
      router.refresh();
    });
  }

  return (
    <div className="p-6 rounded-xl border border-primary/20 bg-primary/5 space-y-4">
      <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-primary/70">AI Agent Tools</h3>

      <div className="space-y-3">
        <button
          type="button"
          onClick={handleRegenerateSteps}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wide rounded-xl border border-primary/30 text-primary bg-white hover:bg-primary/5 transition-all duration-200 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          {isPending ? "Working..." : "Draft Step Update"}
        </button>

        <div className="space-y-2">
          <input
            name="instruction"
            value={instruction}
            onChange={(event) => setInstruction(event.target.value)}
            placeholder="Improve step 3..."
            disabled={isPending}
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-60"
          />
          <button
            type="button"
            onClick={handleEdit}
            disabled={isPending || !canSubmitEdit}
            className="w-full py-2.5 text-xs font-bold uppercase tracking-wide rounded-xl bg-primary text-white hover:bg-primary/90 transition-all duration-200 disabled:opacity-50"
          >
            {isPending ? "Drafting..." : "Draft AI Edit"}
          </button>
        </div>

        <div className="pt-2 space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-muted-foreground">
            <span className={`w-2 h-2 rounded-full ${status ? "bg-amber-500 animate-pulse" : "bg-green-500"}`}></span>
            AI Status: {status ?? "Ready"}
          </div>
          {successMessage ? (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{successMessage}</p>
          ) : null}
          {error ? (
            <p className="text-xs text-red-500 font-medium">{error}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
