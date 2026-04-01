"use client";

import dynamic from "next/dynamic";
import type { FormEvent } from "react";
import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import { createSopAction } from "@/app/dashboard/actions";
import {
  MAX_ATTACHMENT_SIZE_BYTES,
  isAllowedAttachmentMimeType,
  sanitizeAttachmentFileName,
} from "@/lib/attachments/shared";
import { formatFileSize } from "@/lib/format";
import type { CreateSopActionState } from "@/lib/types";

import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { useToast } from "../ui/toast-provider";
import { cn } from "@/lib/cn";
import type { FileUploadItemView } from "./file-uploader";

const FileUploader = dynamic(
  () => import("./file-uploader").then((module) => module.FileUploader),
  {
    loading: () => (
      <div className="rounded-[1.5rem] border border-border bg-surface-muted px-5 py-6 text-sm text-muted">
        Loading file uploader...
      </div>
    ),
    ssr: false,
  },
);

const initialState: CreateSopActionState = {
  status: "idle",
};

const generationStages = [
  "Structuring notes...",
  "Generating SOP...",
  "Saving to library...",
] as const;

type UploadQueueItem = FileUploadItemView & {
  file: File;
};

export function CreateSopForm() {
  const router = useRouter();
  const { pushToast } = useToast();
  const [state, formAction] = useActionState(createSopAction, initialState);
  const [files, setFiles] = useState<UploadQueueItem[]>([]);
  const [createdSopId, setCreatedSopId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusMessage, setUploadStatusMessage] = useState(
    "Optional files will upload after the SOP draft is saved.",
  );
  const handledSopIdRef = useRef<string | null>(null);

  const runUploadFlow = useCallback(
    async (sopId: string, queuedFiles: UploadQueueItem[]) => {
      if (queuedFiles.length === 0) {
        router.push(`/dashboard/${sopId}`);
        return;
      }

      setIsUploading(true);
      setUploadStatusMessage(
        `Uploading ${queuedFiles.length} source file${queuedFiles.length === 1 ? "" : "s"}...`,
      );

      let uploadedCount = 0;
      let failedCount = 0;

      for (const file of queuedFiles) {
        setFiles((currentFiles) =>
          currentFiles.map((currentFile) =>
            currentFile.id === file.id
              ? {
                  ...currentFile,
                  errorMessage: undefined,
                  progress: 8,
                  status: "uploading",
                }
              : currentFile,
          ),
        );

        try {
          await uploadSingleAttachment(sopId, file, (progress) => {
            setFiles((currentFiles) =>
              currentFiles.map((currentFile) =>
                currentFile.id === file.id
                  ? {
                      ...currentFile,
                      progress,
                      status: "uploading",
                    }
                  : currentFile,
              ),
            );
          });

          uploadedCount += 1;
          setFiles((currentFiles) =>
            currentFiles.map((currentFile) =>
              currentFile.id === file.id
                ? {
                    ...currentFile,
                    errorMessage: undefined,
                    progress: 100,
                    status: "success",
                  }
                : currentFile,
            ),
          );
        } catch (error) {
          failedCount += 1;
          setFiles((currentFiles) =>
            currentFiles.map((currentFile) =>
              currentFile.id === file.id
                ? {
                    ...currentFile,
                    errorMessage:
                      error instanceof Error
                        ? error.message
                        : "This file could not be uploaded right now.",
                    progress: 100,
                    status: "error",
                  }
                : currentFile,
            ),
          );
        }

        setUploadStatusMessage(`${uploadedCount} uploaded, ${failedCount} needing attention.`);
      }

      setIsUploading(false);

      if (failedCount > 0) {
        pushToast({
          title: "Some files still need attention",
          description: "Your SOP was saved. You can retry the remaining file uploads below.",
          tone: "error",
        });
        return;
      }

      pushToast({
        title: "SOP and files saved",
        description: "The SOP and all selected attachments are ready.",
        tone: "success",
      });
      router.push(`/dashboard/${sopId}`);
    },
    [pushToast, router],
  );

  useEffect(() => {
    if (state.status !== "success" || !state.sopId) {
      return;
    }

    setCreatedSopId(state.sopId);

    if (handledSopIdRef.current === state.sopId) {
      return;
    }

    handledSopIdRef.current = state.sopId;

    const pendingUploads = files.filter((file) => file.status !== "success");

    if (pendingUploads.length === 0) {
      pushToast({
        title: "SOP saved",
        description: "Your SOP is ready in the library.",
        tone: "success",
      });
      router.push(`/dashboard/${state.sopId}`);
      return;
    }

    void runUploadFlow(state.sopId, pendingUploads);
  }, [files, pushToast, router, runUploadFlow, state.sopId, state.status]);

  function handleSelectFiles(fileList: FileList | null) {
    if (!fileList) {
      return;
    }

    const nextItems: UploadQueueItem[] = [];
    const errors: string[] = [];

    for (const file of Array.from(fileList)) {
      const validationMessage = getAttachmentValidationMessage(file);

      if (validationMessage) {
        errors.push(validationMessage);
        continue;
      }

      const duplicate = files.some(
        (existingFile) =>
          existingFile.file.name === file.name &&
          existingFile.file.size === file.size &&
          existingFile.file.lastModified === file.lastModified,
      );

      if (duplicate) {
        errors.push(`${sanitizeAttachmentFileName(file.name)} is already selected.`);
        continue;
      }

      nextItems.push({
        displayName: sanitizeAttachmentFileName(file.name),
        file,
        fileSize: file.size,
        fileType: file.type,
        id: crypto.randomUUID(),
        progress: 0,
        status: "idle",
      });
    }

    if (nextItems.length > 0) {
      setFiles((currentFiles) => [...currentFiles, ...nextItems]);
      setUploadStatusMessage(
        `${nextItems.length} new file${nextItems.length === 1 ? "" : "s"} ready to upload after generation.`,
      );
    }

    if (errors.length > 0) {
      pushToast({
        title: "Some files were skipped",
        description: errors.slice(0, 2).join(" "),
        tone: "error",
      });
    }
  }

  function handleRemoveFile(id: string) {
    setFiles((currentFiles) => currentFiles.filter((file) => file.id !== id));
  }

  const hasPendingUploads = files.some((file) => file.status !== "success");
  const failedUploads = files.filter((file) => file.status === "error");

  const hasFiles = files.length > 0;
  
  return (
    <form action={formAction} className="space-y-7" aria-label="Create SOP form">
      <input type="hidden" name="hasFiles" value={hasFiles ? "true" : "false"} />
      <CreateSopFormFields
        createdSopId={createdSopId}
        failedUploadsCount={failedUploads.length}
        files={files}
        hasPendingUploads={hasPendingUploads}
        isUploading={isUploading}
        onRemoveFile={handleRemoveFile}
        onRetryUploads={() => {
          if (!createdSopId) {
            return;
          }

          const remainingFiles = files.filter((file) => file.status !== "success");
          void runUploadFlow(createdSopId, remainingFiles);
        }}
        onSelectFiles={handleSelectFiles}
        onViewSop={() => {
          if (createdSopId) {
            router.push(`/dashboard/${createdSopId}`);
          }
        }}
        state={state}
        uploadStatusMessage={uploadStatusMessage}
        hasFiles={hasFiles}
      />
    </form>
  );
}

type CreateSopFormFieldsProps = {
  createdSopId: string | null;
  failedUploadsCount: number;
  files: UploadQueueItem[];
  hasPendingUploads: boolean;
  isUploading: boolean;
  onRemoveFile: (id: string) => void;
  onRetryUploads: () => void;
  onSelectFiles: (files: FileList | null) => void;
  onViewSop: () => void;
  state: CreateSopActionState;
  uploadStatusMessage: string;
  hasFiles: boolean;
};

function CreateSopFormFields({
  createdSopId,
  failedUploadsCount,
  files,
  hasPendingUploads,
  isUploading,
  onRemoveFile,
  onRetryUploads,
  onSelectFiles,
  onViewSop,
  state,
  uploadStatusMessage,
  hasFiles,
}: CreateSopFormFieldsProps) {
  const { pending } = useFormStatus();
  const values = state.values ?? {
    rawNotes: "",
    title: "",
  };

  const clientStatusMessage = getClientStatusMessage({
    createdSopId,
    failedUploadsCount,
    fileCount: files.length,
    hasPendingUploads,
    isUploading,
    pending,
    uploadStatusMessage,
  });

  return (
    <fieldset
      className="space-y-8 disabled:opacity-80"
      disabled={pending || isUploading}
      aria-busy={pending || isUploading}
    >
      <label className="block space-y-3">
        <span className="mono-label text-slate-500 dark:text-slate-400 block">Procedure Title</span>
        <Input
          required
          name="title"
          defaultValue={values.title}
          minLength={5}
          maxLength={120}
          placeholder="e.g., Client onboarding handoff"
          className={cn("w-full glass-input px-5 py-4 rounded-xl bg-white/50 dark:bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-700", state.fieldErrors?.title && "border-rose-400 focus:border-rose-400 focus:shadow-none")}
          aria-invalid={Boolean(state.fieldErrors?.title)}
          aria-describedby={state.fieldErrors?.title ? "title-error" : "title-help"}
          aria-required="true"
          onInput={clearCustomValidity}
          onInvalid={setTitleValidationMessage}
        />
        {state.fieldErrors?.title ? (
          <p id="title-error" className="text-sm text-rose-500 dark:text-rose-400" role="alert">
            {state.fieldErrors.title}
          </p>
        ) : (
          <p id="title-help" className="text-[11px] text-slate-500 uppercase tracking-wide">
            Use the actual process name your team would search for later.
          </p>
        )}
      </label>

      <label className="block space-y-3">
        <div className="flex items-center justify-between">
          <span className="mono-label text-slate-500 dark:text-slate-400">Operational Raw Data</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-600 font-mono">SUPPORT REQUIRED</span>
        </div>
        <Textarea
          required={!hasFiles}
          name="rawNotes"
          defaultValue={values.rawNotes}
          minLength={hasFiles ? undefined : 20}
          maxLength={6000}
          rows={12}
          placeholder="Input workflow fragments, meeting transcripts, or rough instructional steps..."
          className={cn("w-full glass-input px-5 py-4 rounded-xl bg-white/50 dark:bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-700 resize-y font-sans leading-relaxed", state.fieldErrors?.rawNotes && "border-rose-400 focus:border-rose-400 focus:shadow-none")}
          aria-invalid={Boolean(state.fieldErrors?.rawNotes)}
          aria-describedby={state.fieldErrors?.rawNotes ? "raw-notes-error" : "raw-notes-help"}
          aria-required="true"
          onInput={clearCustomValidity}
          onInvalid={(e) => {
            if (!hasFiles) {
              setRawNotesValidationMessage(e);
            }
          }}
        />
        {state.fieldErrors?.rawNotes ? (
          <p id="raw-notes-error" className="text-sm text-rose-500 dark:text-rose-400" role="alert">
            {state.fieldErrors.rawNotes}
          </p>
        ) : (
          <p id="raw-notes-help" className="text-[11px] text-slate-500 uppercase tracking-wide">
            Aim for coverage, not polish. Messy bullets are fine if the operational details are there.
          </p>
        )}
      </label>

      <FileUploader
        disabled={pending || isUploading}
        items={files}
        onRemove={onRemoveFile}
        onSelectFiles={onSelectFiles}
      />

      {state.status === "error" && state.message ? (
        <Card
          aria-live="polite"
          role="alert"
          className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm leading-6 text-rose-200"
        >
          {state.message}
        </Card>
      ) : null}

      <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
        {clientStatusMessage}
      </div>

      <div className="flex flex-col gap-5 border-t border-border pt-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl space-y-2">
          <GenerationStatusText
            createdSopId={createdSopId}
            failedUploadsCount={failedUploadsCount}
            fileCount={files.length}
            hasPendingUploads={hasPendingUploads}
            isUploading={isUploading}
            pending={pending}
            uploadStatusMessage={uploadStatusMessage}
          />
          {createdSopId && failedUploadsCount > 0 ? (
            <p className="text-xs leading-6 text-muted">
              Your SOP is already saved. Retry the remaining uploads or open the saved SOP now.
            </p>
          ) : null}
        </div>

        <FormActions
          createdSopId={createdSopId}
          failedUploadsCount={failedUploadsCount}
          hasPendingUploads={hasPendingUploads}
          isUploading={isUploading}
          onRetryUploads={onRetryUploads}
          onViewSop={onViewSop}
        />
      </div>
    </fieldset>
  );
}

type FormActionsProps = {
  createdSopId: string | null;
  failedUploadsCount: number;
  hasPendingUploads: boolean;
  isUploading: boolean;
  onRetryUploads: () => void;
  onViewSop: () => void;
};

function FormActions({
  createdSopId,
  failedUploadsCount,
  hasPendingUploads,
  isUploading,
  onRetryUploads,
  onViewSop,
}: FormActionsProps) {
  if (createdSopId) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row">
        {hasPendingUploads ? (
          <Button
            type="button"
            onClick={onRetryUploads}
            disabled={isUploading}
            className="min-w-56"
          >
            {isUploading
              ? "Uploading files..."
              : failedUploadsCount > 0
                ? "Upload remaining files"
                : "Upload files"}
          </Button>
        ) : null}
        <Button
          type="button"
          onClick={onViewSop}
          variant="secondary"
          className="min-w-44"
        >
          Open saved SOP
        </Button>
      </div>
    );
  }

  return <GenerateSopButton />;
}

function GenerateSopButton() {
  const { pending } = useFormStatus();

  return (
    <div className="pt-6 w-full">
      <button
        type="submit"
        disabled={pending}
        aria-label={pending ? "Generating SOP, please wait" : "Generate SOP"}
        aria-busy={pending}
        className="w-full py-5 bg-primary hover:bg-primary/90 text-white rounded-xl font-extrabold text-[15px] tracking-wide shadow-[0_20px_40px_-15px_rgba(60,131,246,0.3)] transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none uppercase"
      >
        {pending ? <PendingGenerationStage /> : "Generate SOP"}
      </button>
    </div>
  );
}

type GenerationStatusTextProps = {
  createdSopId: string | null;
  failedUploadsCount: number;
  fileCount: number;
  hasPendingUploads: boolean;
  isUploading: boolean;
  pending: boolean;
  uploadStatusMessage: string;
};

function GenerationStatusText({
  createdSopId,
  failedUploadsCount,
  fileCount,
  hasPendingUploads,
  isUploading,
  pending,
  uploadStatusMessage,
}: GenerationStatusTextProps) {
  if (pending) {
    return (
      <p aria-live="polite" className="text-sm leading-6 text-muted">
        <PendingGenerationStage /> Keep this tab open while SOPSmith builds the draft.
      </p>
    );
  }

  if (isUploading) {
    return (
      <p aria-live="polite" className="text-sm leading-6 text-muted">
        {uploadStatusMessage}
      </p>
    );
  }

  if (createdSopId && failedUploadsCount > 0) {
    return (
      <p aria-live="polite" className="text-sm leading-6 text-muted">
        {failedUploadsCount} file{failedUploadsCount === 1 ? "" : "s"} still need attention.
      </p>
    );
  }

  if (createdSopId && hasPendingUploads) {
    return (
      <p aria-live="polite" className="text-sm leading-6 text-muted">
        Your SOP is saved. Upload the remaining files or open the detail page now.
      </p>
    );
  }

  if (createdSopId && !hasPendingUploads) {
    return (
      <p aria-live="polite" className="text-sm leading-6 text-muted">
        Your SOP is saved and ready to open.
      </p>
    );
  }

  return (
    <p aria-live="polite" className="text-sm leading-6 text-muted">
      SOPSmith will structure the notes, generate the SOP, save it to your library, then
      upload {fileCount > 0 ? `${fileCount} selected file${fileCount === 1 ? "" : "s"}.` : "any selected files."}
    </p>
  );
}

function PendingGenerationStage() {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const firstTimeout = window.setTimeout(() => {
      setStageIndex(1);
    }, 1200);

    const secondTimeout = window.setTimeout(() => {
      setStageIndex(2);
    }, 3200);

    return () => {
      window.clearTimeout(firstTimeout);
      window.clearTimeout(secondTimeout);
    };
  }, []);

  return generationStages[stageIndex];
}

function clearCustomValidity(
  event: FormEvent<HTMLInputElement | HTMLTextAreaElement>,
) {
  event.currentTarget.setCustomValidity("");
}

function setTitleValidationMessage(event: FormEvent<HTMLInputElement>) {
  const input = event.currentTarget;

  if (input.validity.valueMissing) {
    input.setCustomValidity("Add a clear SOP title before generating.");
  } else if (input.validity.tooShort) {
    input.setCustomValidity("Use at least 5 characters so the SOP is easy to identify later.");
  } else if (input.validity.tooLong) {
    input.setCustomValidity("Keep the title under 120 characters.");
  } else {
    input.setCustomValidity("");
  }
}

function setRawNotesValidationMessage(event: FormEvent<HTMLTextAreaElement>) {
  const textarea = event.currentTarget;

  if (textarea.validity.valueMissing) {
    textarea.setCustomValidity("Add some rough notes before generating an SOP.");
  } else if (textarea.validity.tooShort) {
    textarea.setCustomValidity("Add at least a few notes for SOPSmith to work from.");
  } else if (textarea.validity.tooLong) {
    textarea.setCustomValidity("Keep the rough notes under 6,000 characters.");
  } else {
    textarea.setCustomValidity("");
  }
}

function getAttachmentValidationMessage(file: File) {
  const sanitizedName = sanitizeAttachmentFileName(file.name);

  if (!isAllowedAttachmentMimeType(file.type)) {
    return `${sanitizedName} is not supported. Use PDF, DOC, DOCX, or TXT files only.`;
  }

  if (file.size <= 0) {
    return `${sanitizedName} is empty and cannot be uploaded.`;
  }

  if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
    return `${sanitizedName} exceeds the ${formatFileSize(MAX_ATTACHMENT_SIZE_BYTES)} upload limit.`;
  }

  return null;
}

function getClientStatusMessage({
  createdSopId,
  failedUploadsCount,
  fileCount,
  hasPendingUploads,
  isUploading,
  pending,
  uploadStatusMessage,
}: {
  createdSopId: string | null;
  failedUploadsCount: number;
  fileCount: number;
  hasPendingUploads: boolean;
  isUploading: boolean;
  pending: boolean;
  uploadStatusMessage: string;
}) {
  if (pending) {
    return "SOP generation is in progress.";
  }

  if (isUploading) {
    return uploadStatusMessage;
  }

  if (createdSopId && failedUploadsCount > 0) {
    return `${failedUploadsCount} uploads need attention. Retry or open the saved SOP.`;
  }

  if (createdSopId && hasPendingUploads) {
    return "The SOP is saved. Upload the remaining files or open the saved SOP.";
  }

  if (createdSopId && !hasPendingUploads) {
    return "SOP created and all file uploads are complete.";
  }

  if (fileCount > 0) {
    return `${fileCount} files selected and ready for upload after generation.`;
  }

  return "No source files selected.";
}

function uploadSingleAttachment(
  sopId: string,
  file: UploadQueueItem,
  onProgress: (progress: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/sops/${sopId}/attachments`);
    xhr.responseType = "json";
    xhr.timeout = 60000;

    xhr.upload.addEventListener("progress", (event) => {
      if (!event.lengthComputable) {
        return;
      }

      onProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)));
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
        return;
      }

      reject(new Error(getUploadErrorMessage(xhr)));
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Network error while uploading the selected file."));
    });

    xhr.addEventListener("timeout", () => {
      reject(new Error("The file upload timed out. Please check your connection and try again."));
    });

    const formData = new FormData();
    formData.append("files", file.file);
    xhr.send(formData);
  });
}

function getUploadErrorMessage(xhr: XMLHttpRequest) {
  const defaultMessage = "A file upload failed. Please retry it in a moment.";
  const response = xhr.response;

  if (response && typeof response === "object" && "error" in response) {
    const error = response.error;
    if (typeof error === "string" && error.trim()) {
      return error;
    }
  }

  if (typeof xhr.responseText === "string" && xhr.responseText) {
    try {
      const parsed = JSON.parse(xhr.responseText) as { error?: string };
      if (parsed.error?.trim()) {
        return parsed.error;
      }
    } catch {
      return defaultMessage;
    }
  }

  return defaultMessage;
}
