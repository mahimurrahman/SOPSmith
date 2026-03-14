import { getErrorLogDetails, getErrorMessage } from "@/lib/errors";

type AttachmentErrorLike = {
  code?: string;
  details?: string | null;
  hint?: string | null;
  message?: string;
};

const ATTACHMENTS_MIGRATION =
  "supabase/migrations/20260314223000_create_sop_files_and_attachments.sql";

export type AttachmentsAction =
  | "cleanup"
  | "create"
  | "detail"
  | "list"
  | "signed-url"
  | "upload";

export class AttachmentRouteError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "AttachmentRouteError";
  }
}

export function createAttachmentRouteError(message: string, status: number) {
  return new AttachmentRouteError(message, status);
}

export function isAttachmentRouteError(error: unknown): error is AttachmentRouteError {
  return error instanceof AttachmentRouteError;
}

export function getAttachmentsRepairMessage() {
  return `SOPSmith attachments are not fully configured. Run ${ATTACHMENTS_MIGRATION} in Supabase and retry.`;
}

export function getAttachmentsUserMessage(action: AttachmentsAction, error: AttachmentErrorLike) {
  const combined = [error.message, error.details, error.hint]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (
    error.code === "42P01" ||
    error.code === "42703" ||
    combined.includes("sop_files") ||
    combined.includes("bucket not found") ||
    (combined.includes("attachments") && combined.includes("bucket"))
  ) {
    return getAttachmentsRepairMessage();
  }

  if (
    error.code === "42501" ||
    combined.includes("permission denied") ||
    combined.includes("row-level security")
  ) {
    return `Your Supabase attachment policies are incomplete. Run ${ATTACHMENTS_MIGRATION} and retry.`;
  }

  switch (action) {
    case "create":
      return "Unable to save attachment metadata right now. Uploaded files were rolled back, so you can safely retry.";
    case "detail":
      return "Unable to load this attachment right now. Refresh the page and try again.";
    case "signed-url":
      return "Unable to create a download link right now. Please try again.";
    case "upload":
      return "Unable to upload attachment files right now. Please try again.";
    case "cleanup":
      return "Attachment cleanup did not finish cleanly after a failure.";
    case "list":
    default:
      return "Unable to load attachments right now. Refresh the page and try again.";
  }
}

export function getAttachmentFailureMessage(error: unknown, fallback: string) {
  return getErrorMessage(error, fallback);
}

export function logAttachmentsError(
  action: AttachmentsAction,
  error: unknown,
  extra?: Record<string, unknown>,
) {
  console.error(`[attachments:${action}]`, {
    ...getErrorLogDetails(error),
    ...extra,
  });
}
