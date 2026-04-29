"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { restoreSopVersionAction } from "@/app/dashboard/actions";
import type { SopVersionSummary } from "@/lib/sops";
import { formatDateTime } from "@/lib/format";
import { useToast } from "@/components/ui/toast-provider";

type VersionHistoryProps = {
  sopId: string;
  versions: SopVersionSummary[];
};

export function VersionHistory({ sopId, versions }: VersionHistoryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { pushToast } = useToast();
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (versions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-foreground px-1">Version History</h3>

      <div className="space-y-3">
        {versions.map((version, index) => (
          <div
            key={version.id}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-4 space-y-3"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {index === 0 ? "Current version" : `Version ${versions.length - index}`}
                </p>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                  {formatDateTime(version.created_at)}
                </p>
              </div>
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  setError(null);
                  setActiveVersionId(version.id);
                  startTransition(async () => {
                    const result = await restoreSopVersionAction(sopId, version.id);
                    if (result?.error) {
                      setError(result.error);
                      setActiveVersionId(null);
                      return;
                    }

                    pushToast({
                      title: "Version restored",
                      description: "The selected SOP version is now the current version.",
                      tone: "success",
                    });

                    const next = new URLSearchParams(searchParams.toString());
                    next.set("updated", "restore");
                    next.set("tick", Date.now().toString());
                    router.replace(`${pathname}?${next.toString()}`);
                    router.refresh();
                    setActiveVersionId(null);
                  });
                }}
                className="px-3 py-2 text-[11px] font-bold uppercase tracking-wide rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
              >
                {activeVersionId === version.id ? "Restoring..." : "Restore"}
              </button>
            </div>

            <p className="text-xs leading-6 text-slate-500 dark:text-slate-400 line-clamp-3">
              {version.content}
            </p>
          </div>
        ))}
      </div>

      {error ? <p className="text-xs text-red-500 font-medium">{error}</p> : null}
    </div>
  );
}
