import "server-only";

import { createAttachmentRouteError } from "./errors";
import {
  getAttachmentLabel,
  getSafeAttachmentName,
  isAllowedAttachmentMimeType,
  MAX_ATTACHMENT_SIZE_BYTES,
  MIME_TO_EXTENSION,
} from "./shared";
import type { AllowedAttachmentMimeType, AttachmentUploadInput } from "./types";

export { ATTACHMENT_SIGNED_URL_TTL_SECONDS, ATTACHMENTS_BUCKET, MAX_ATTACHMENT_SIZE_BYTES } from "./shared";

function buildAttachmentStoragePath(sopId: string, fileType: AllowedAttachmentMimeType) {
  return `${sopId}/${crypto.randomUUID()}.${MIME_TO_EXTENSION[fileType]}`;
}

export function readAttachmentFiles(formData: FormData) {
  const files = formData
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File);

  if (files.length === 0) {
    throw createAttachmentRouteError("Upload at least one file using the files form field.", 400);
  }

  return files;
}

export function validateAttachmentFiles(sopId: string, files: File[]) {
  return files.map((file) => validateAttachmentFile(sopId, file));
}

function validateAttachmentFile(sopId: string, file: File): AttachmentUploadInput {
  const label = getAttachmentLabel(file.name);

  if (!isAllowedAttachmentMimeType(file.type)) {
    throw createAttachmentRouteError(
      `${label} is not supported. Upload PDF, DOC, DOCX, or TXT files only.`,
      400,
    );
  }

  if (file.size <= 0) {
    throw createAttachmentRouteError(`${label} is empty and cannot be uploaded.`, 400);
  }

  if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
    throw createAttachmentRouteError(`${label} exceeds the 5 MB upload limit.`, 400);
  }

  return {
    file,
    fileName: getSafeAttachmentName(file.name, file.type),
    fileSize: file.size,
    fileType: file.type,
    storagePath: buildAttachmentStoragePath(sopId, file.type),
  };
}
