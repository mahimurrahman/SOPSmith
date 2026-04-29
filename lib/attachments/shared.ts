import type { AllowedAttachmentMimeType } from "./types";

export const ATTACHMENTS_BUCKET = "attachments";
export const ATTACHMENT_SIGNED_URL_TTL_SECONDS = 60;
export const MAX_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024;
export const ATTACHMENTS_ACCEPT = ".pdf,.doc,.docx,.txt";

export const MIME_TO_EXTENSION: Record<AllowedAttachmentMimeType, string> = {
  "application/msword": "doc",
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "text/plain": "txt",
};

export const ALLOWED_ATTACHMENT_MIME_TYPES = Object.keys(
  MIME_TO_EXTENSION,
) as AllowedAttachmentMimeType[];

export type AttachmentKind = "doc" | "pdf" | "text";

export function isAllowedAttachmentMimeType(value: string): value is AllowedAttachmentMimeType {
  return Object.hasOwn(MIME_TO_EXTENSION, value);
}

export function sanitizeAttachmentFileName(fileName: string) {
  const trimmed = fileName.trim().replace(/\s+/g, " ");
  const normalized = trimmed.replace(/[^\w.\-() ]+/g, "");
  const collapsedDots = normalized.replace(/\.{2,}/g, ".");

  return collapsedDots || "attachment";
}

export function getAttachmentLabel(fileName: string, fallback = "This file") {
  return sanitizeAttachmentFileName(fileName) || fallback;
}

export function getSafeAttachmentName(fileName: string, fileType: AllowedAttachmentMimeType) {
  const sanitized = sanitizeAttachmentFileName(fileName);

  if (sanitized) {
    return sanitized;
  }

  return `attachment.${MIME_TO_EXTENSION[fileType]}`;
}

export function getAttachmentKind(fileType: string, fileName: string): AttachmentKind {
  if (fileType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf")) {
    return "pdf";
  }

  if (
    fileType === "application/msword" ||
    fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileName.toLowerCase().endsWith(".doc") ||
    fileName.toLowerCase().endsWith(".docx")
  ) {
    return "doc";
  }

  return "text";
}

