import type { SopFile } from "@/lib/database.types";

export type { SopFile, SopFileInsert, SopFileUpdate } from "@/lib/database.types";

export type AllowedAttachmentMimeType =
  | "application/pdf"
  | "application/msword"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "text/plain";

export type AttachmentUploadInput = {
  file: File;
  fileName: string;
  fileSize: number;
  fileType: AllowedAttachmentMimeType;
  extractedText?: string | null;
  storagePath: string;
};

export type SopFileSummary = {
  id: string;
  sopId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
};

export type SopFilesResponse = {
  attachments: SopFileSummary[];
};

export type SignedAttachmentUrlResponse = {
  expiresIn: number;
  signedUrl: string;
};

export function toSopFileSummary(file: Pick<
  SopFile,
  "id" | "sop_id" | "file_name" | "file_type" | "file_size" | "created_at"
>): SopFileSummary {
  return {
    createdAt: file.created_at,
    fileName: file.file_name,
    fileSize: file.file_size,
    fileType: file.file_type,
    id: file.id,
    sopId: file.sop_id,
  };
}
