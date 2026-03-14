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
import { useToast } from "../ui/toast-provider";
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

const messyNotesExample = `kickoff when sales marks deal closed
owner usually ops lead, delivery manager takes over after setup
need signed agreement, main client contact, shared drive folder, crm record
tools: hubspot, notion, slack, drive
start by checking contract + scope, if missing docs ask sales before moving
create project space + client folder, name it correctly
send intro email + kickoff options, cc delivery owner
output = ready-for-kickoff workspace with owner assigned and client contacted
quality check: right client name, links work, owner assigned, kickoff message sent
if client contact missing or scope unclear, pause and escalate internally`;

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

  return (
    <form action={formAction} className="space-y-7" aria-label="Create SOP form">
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
      className="space-y-7 disabled:opacity-80"
      disabled={pending || isUploading}
      aria-busy={pending || isUploading}
    >
      <div className="space-y-2">
        <div className="eyebrow">SOP details</div>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          Capture the workflow, then generate.
        </h2>
        <p className="text-sm leading-6 text-muted">
          You do not need polished writing. Focus on the real workflow, who owns it, what
          starts it, what tools are involved, and what a correct outcome looks like.
        </p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-foreground">What should this SOP be called?</span>
        <p className="text-sm leading-6 text-muted">
          Use the actual process name your team would search for later. Clear titles make
          the library much easier to scan and trust.
        </p>
        <input
          required
          name="title"
          defaultValue={values.title}
          minLength={5}
          maxLength={120}
          placeholder="Client onboarding handoff"
          className={`field-input ${state.fieldErrors?.title ? "border-rose-400 focus:border-rose-400 focus:shadow-none" : ""}`}
          aria-invalid={Boolean(state.fieldErrors?.title)}
          aria-describedby={state.fieldErrors?.title ? "title-error" : "title-help"}
          aria-required="true"
          onInput={clearCustomValidity}
          onInvalid={setTitleValidationMessage}
        />
        {state.fieldErrors?.title ? (
          <p id="title-error" className="text-sm text-rose-300" role="alert">
            {state.fieldErrors.title}
          </p>
        ) : (
          <p id="title-help" className="text-xs text-muted">
            Examples: Client onboarding handoff, Weekly reporting QA review, New hire laptop setup
          </p>
        )}
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-foreground">Paste the rough source notes</span>
        <p className="text-sm leading-6 text-muted">
          Include the trigger or start point, owner or role, key steps, tools, expected
          output, approvals or quality checks, and any edge cases that change the flow.
        </p>
        <textarea
          required
          name="rawNotes"
          defaultValue={values.rawNotes}
          minLength={60}
          maxLength={6000}
          rows={16}
          placeholder={messyNotesExample}
          className={`field-input resize-y ${state.fieldErrors?.rawNotes ? "border-rose-400 focus:border-rose-400 focus:shadow-none" : ""}`}
          aria-invalid={Boolean(state.fieldErrors?.rawNotes)}
          aria-describedby={state.fieldErrors?.rawNotes ? "raw-notes-error" : "raw-notes-help"}
          aria-required="true"
          onInput={clearCustomValidity}
          onInvalid={setRawNotesValidationMessage}
        />
        {state.fieldErrors?.rawNotes ? (
          <p id="raw-notes-error" className="text-sm text-rose-300" role="alert">
            {state.fieldErrors.rawNotes}
          </p>
        ) : (
          <p id="raw-notes-help" className="text-xs text-muted">
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
        <div
          aria-live="polite"
          role="alert"
          className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm leading-6 text-rose-200"
        >
          {state.message}
        </div>
      ) : null}

      <div className="sr-only" aria-live="polite">
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
    <Button type="submit" disabled={pending} className="min-w-52">
      {pending ? <PendingGenerationStage /> : "Generate SOP"}
    </Button>
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
    textarea.setCustomValidity("Add rough notes before generating the SOP.");
  } else if (textarea.validity.tooShort) {
    textarea.setCustomValidity(
      "Add a little more detail: include the trigger, steps, owner, tools, output, checks, or edge cases.",
    );
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
