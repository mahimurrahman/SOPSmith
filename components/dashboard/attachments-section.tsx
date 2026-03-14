"use client";

import { useState } from "react";

import type { SopFileSummary } from "@/lib/attachments/types";
import { sanitizeAttachmentFileName } from "@/lib/attachments/shared";
import { formatDate, formatFileSize } from "@/lib/format";

import { useToast } from "../ui/toast-provider";
import { Card } from "../ui/Card";
import { FileTypeIcon } from "../ui/FileTypeIcon";

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
      <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 px-5 py-6 text-sm leading-6 text-slate-500 text-center">
        No files attached to this SOP yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {attachments.map((file) => {
        const displayName = sanitizeAttachmentFileName(file.fileName);
        
        // Pick an icon based on fileType
        let iconName = "draft";
        let iconColorClass = "text-slate-500 bg-slate-500/10";
        if (file.fileType.includes("pdf")) {
          iconName = "description";
          iconColorClass = "text-red-500 bg-red-500/10";
        } else if (file.fileType.includes("image")) {
          iconName = "image";
          iconColorClass = "text-blue-500 bg-blue-500/10";
        }

        return (
          <button
            type="button"
            key={file.id}
            onClick={() => handleDownload(file)}
            disabled={activeFileId === file.id}
            className="w-full text-left flex items-center justify-between p-4 bg-white dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary transition-all group cursor-pointer shadow-sm hover:shadow-md disabled:opacity-50"
          >
            <div className="flex items-center gap-4 overflow-hidden">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconColorClass}`}>
                <span className="material-symbols-outlined text-[20px]">{iconName}</span>
              </div>
              <div className="truncate">
                <p className="text-[13px] font-bold truncate text-slate-900 dark:text-white">
                  {displayName}
                </p>
                <p className="text-[10px] text-slate-500 uppercase font-extrabold tracking-tighter">
                  {formatFileSize(file.fileSize)} • Added {formatDate(file.createdAt)}
                </p>
              </div>
            </div>
            
            {activeFileId === file.id ? (
              <span className="text-xs font-semibold text-slate-400">Wait...</span>
            ) : (
              <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-[20px]">
                download
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
