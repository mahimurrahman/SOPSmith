"use client";

import { ATTACHMENTS_ACCEPT, getAttachmentKind } from "@/lib/attachments/shared";
import { cn } from "@/lib/cn";
import { formatFileSize } from "@/lib/format";

export type FileUploadItemView = {
  displayName: string;
  errorMessage?: string;
  fileSize: number;
  fileType: string;
  id: string;
  progress: number;
  status: "error" | "idle" | "success" | "uploading";
};

type FileUploaderProps = {
  disabled?: boolean;
  items: FileUploadItemView[];
  onRemove: (id: string) => void;
  onSelectFiles: (files: FileList | null) => void;
};

export function FileUploader({
  disabled = false,
  items,
  onRemove,
  onSelectFiles,
}: FileUploaderProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">Optional source files</p>
            <p className="mt-1 text-sm leading-6 text-muted">
              Add PDFs, DOC or DOCX files, or TXT notes. Files upload after the SOP draft is
              saved.
            </p>
          </div>
          <label
            className={cn(
              "secondary-button cursor-pointer",
              disabled && "pointer-events-none opacity-60",
            )}
          >
            Add files
            <input
              type="file"
              multiple
              accept={ATTACHMENTS_ACCEPT}
              className="sr-only"
              disabled={disabled}
              onChange={(event) => {
                onSelectFiles(event.target.files);
                event.currentTarget.value = "";
              }}
            />
          </label>
        </div>

        <div className="muted-panel rounded-[1.35rem] px-4 py-3 text-xs leading-6 text-muted">
          Supported files: PDF, DOC, DOCX, and TXT up to 5 MB each.
        </div>
      </div>

      {items.length > 0 ? (
        <ul className="space-y-3" aria-label="Selected attachments">
          {items.map((item) => {
            const kind = getAttachmentKind(item.fileType, item.displayName);

            return (
              <li key={item.id} className="surface-card rounded-[1.5rem] px-4 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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

                      <div className="min-w-0 space-y-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {item.displayName}
                        </p>
                        <p className="text-xs text-muted">
                          {formatFileSize(item.fileSize)} -{" "}
                          {item.status === "idle"
                            ? "Ready to upload"
                            : item.status === "uploading"
                              ? "Uploading"
                              : item.status === "success"
                                ? "Uploaded"
                                : "Needs attention"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                        <div
                          className={cn(
                            "h-full rounded-full transition-[width] duration-200",
                            item.status === "success" && "bg-emerald-400",
                            item.status === "error" && "bg-rose-400",
                            item.status !== "success" &&
                              item.status !== "error" &&
                              "bg-accent",
                          )}
                          style={{
                            width: `${Math.max(
                              item.progress,
                              item.status === "success" ? 100 : 6,
                            )}%`,
                          }}
                        />
                      </div>

                      {item.errorMessage ? (
                        <p className="text-xs leading-5 text-rose-300">{item.errorMessage}</p>
                      ) : null}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    disabled={disabled || item.status === "uploading" || item.status === "success"}
                    className="rounded-full border border-border bg-surface-muted px-3 py-2 text-xs font-semibold text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={`Remove ${item.displayName}`}
                  >
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-border bg-surface-muted px-5 py-6 text-sm leading-6 text-muted">
          No files selected yet. Add source docs if you want the final SOP and the original
          context to stay together.
        </div>
      )}
    </div>
  );
}
