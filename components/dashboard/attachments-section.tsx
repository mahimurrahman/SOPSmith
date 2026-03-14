"use client";

import { useState } from "react";

import type { SopFileSummary } from "@/lib/attachments/types";
import { getAttachmentKind, sanitizeAttachmentFileName } from "@/lib/attachments/shared";
import { cn } from "@/lib/cn";
import { formatDate, formatFileSize } from "@/lib/format";

import { useToast } from "../ui/toast-provider";

type AttachmentsSectionProps = {
  attachments: SopFileSummary[];
  sopId: string;
};

export function AttachmentsSection({ attachments, sopId }: AttachmentsSectionProps) {
  const { pushToast } = useToast();
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  async function handleDownload(file: SopFileSummary) {
    setActiveFileId(file.id);

    try {
      const response = await fetch(`/api/sops/${sopId}/attachments/${file.id}/signed-url`, {
        method: "GET",
      });

      if (!response.ok) {
        const fallbackMessage = "The download link could not be prepared right now.";
        let message = fallbackMessage;

        try {
          const payload = (await response.json()) as { error?: string };
          message = payload.error ?? fallbackMessage;
        } catch {
          message = fallbackMessage;
        }

        throw new Error(message);
      }

      const payload = (await response.json()) as { signedUrl: string };
      window.open(payload.signedUrl, "_blank", "noopener,noreferrer");
      pushToast({
        title: "Download ready",
        description: `${sanitizeAttachmentFileName(file.fileName)} opened in a new tab.`,
        tone: "success",
      });
    } catch (error) {
      pushToast({
        title: "Download unavailable",
        description:
          error instanceof Error
            ? error.message
            : "The file could not be downloaded right now. Please try again.",
        tone: "error",
      });
    } finally {
      setActiveFileId(null);
    }
  }

  if (attachments.length === 0) {
    return (
      <section className="space-y-3" aria-labelledby="attachments-heading">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p id="attachments-heading" className="text-lg font-semibold tracking-tight text-foreground">
              Attachments
            </p>
            <p className="mt-1 text-sm leading-6 text-muted">
              Source files for this SOP will appear here once uploaded.
            </p>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-dashed border-border bg-surface-muted px-5 py-6 text-sm leading-6 text-muted">
          No files are attached to this SOP yet.
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4" aria-labelledby="attachments-heading">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p id="attachments-heading" className="text-lg font-semibold tracking-tight text-foreground">
            Attachments
          </p>
          <p className="mt-1 text-sm leading-6 text-muted">
            Open the original source files with short-lived signed links.
          </p>
        </div>
        <div className="rounded-full border border-border bg-surface-muted px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          {attachments.length} file{attachments.length === 1 ? "" : "s"}
        </div>
      </div>

      <ul className="space-y-3" aria-label="SOP attachments">
        {attachments.map((file) => {
          const displayName = sanitizeAttachmentFileName(file.fileName);
          const kind = getAttachmentKind(file.fileType, displayName);

          return (
            <li key={file.id} className="surface-card rounded-[1.5rem] px-4 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xs font-black tracking-[0.2em]",
                        kind === "pdf" && "bg-rose-500/14 text-rose-200",
                        kind === "doc" && "bg-sky-500/14 text-sky-100",
                        kind === "text" && "bg-emerald-500/14 text-emerald-100",
                      )}
                    >
                      {kind === "pdf" ? "PDF" : kind === "doc" ? "DOC" : "TXT"}
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
                      <p className="mt-1 text-xs leading-5 text-muted">
                        {formatFileSize(file.fileSize)} - Added {formatDate(file.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownload(file)}
                  disabled={activeFileId === file.id}
                  className="secondary-button min-w-36"
                >
                  {activeFileId === file.id ? "Preparing..." : "Download"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
