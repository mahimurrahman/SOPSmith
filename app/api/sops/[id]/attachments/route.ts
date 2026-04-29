import { NextResponse, type NextRequest } from "next/server";

import {
  createAttachmentRouteError,
  createSopFiles,
  getAttachmentFailureMessage,
  isAttachmentRouteError,
  listSopFiles,
  logAttachmentsError,
  readAttachmentFiles,
  removeAttachmentObjects,
  requireOwnedSopAttachmentAccess,
  toSopFileSummary,
  uploadAttachmentObject,
  validateAttachmentFiles,
} from "@/lib/attachments";
import type { SopFileInsert } from "@/lib/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { uuidSchema } from "@/lib/validators";

export const runtime = "nodejs";

type AttachmentsRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function validateSopId(value: string) {
  if (!uuidSchema.safeParse(value).success) {
    throw createAttachmentRouteError(
      "This SOP could not be found or belongs to a different account.",
      404,
    );
  }

  return value;
}

export async function GET(
  _request: NextRequest,
  { params }: AttachmentsRouteContext,
) {
  const { id } = await params;

  try {
    const sopId = validateSopId(id);
    const { supabase } = await requireOwnedSopAttachmentAccess(sopId);
    const attachments = await listSopFiles(sopId, supabase);

    return NextResponse.json({
      attachments: attachments.map((attachment) => toSopFileSummary(attachment)),
    });
  } catch (error) {
    if (isAttachmentRouteError(error)) {
      return jsonError(error.message, error.status);
    }

    logAttachmentsError("list", error, { sopId: id });
    return jsonError(
      getAttachmentFailureMessage(error, "Unable to load attachments right now. Refresh the page and try again."),
      500,
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: AttachmentsRouteContext,
) {
  const { id } = await params;
  let supabase: SupabaseClient<Database> | null = null;
  const uploadedPaths: string[] = [];

  try {
    const sopId = validateSopId(id);
    const access = await requireOwnedSopAttachmentAccess(sopId);
    supabase = access.supabase;
    const contentType = request.headers.get("content-type") ?? "";

    if (!contentType.toLowerCase().includes("multipart/form-data")) {
      throw createAttachmentRouteError("Send attachment uploads as multipart/form-data.", 400);
    }

    let formData: FormData;

    try {
      formData = await request.formData();
    } catch {
      throw createAttachmentRouteError("The upload request body could not be read.", 400);
    }

    const files = readAttachmentFiles(formData);
    const uploads = await validateAttachmentFiles(sopId, files);

    for (const upload of uploads) {
      await uploadAttachmentObject(upload.storagePath, upload.file, upload.fileType, supabase);
      uploadedPaths.push(upload.storagePath);
    }

    const recordsToInsert: SopFileInsert[] = uploads.map((upload) => ({
      file_name: upload.fileName,
      file_size: upload.fileSize,
      file_type: upload.fileType,
      file_url: upload.storagePath,
      extracted_text: upload.extractedText ?? null,
      sop_id: sopId,
    }));
    const createdRows = await createSopFiles(recordsToInsert, supabase);
    const uploadOrder = new Map(uploads.map((upload, index) => [upload.storagePath, index]));
    const attachments = createdRows
      .sort((left, right) => {
        return (uploadOrder.get(left.file_url) ?? 0) - (uploadOrder.get(right.file_url) ?? 0);
      })
      .map((attachment) => toSopFileSummary(attachment));

    return NextResponse.json({ attachments }, { status: 201 });
  } catch (error) {
    if (supabase && uploadedPaths.length > 0) {
      try {
        await removeAttachmentObjects(uploadedPaths, supabase);
      } catch (cleanupError) {
        logAttachmentsError("cleanup", cleanupError, { sopId: id, uploadedPaths });
      }
    }

    if (isAttachmentRouteError(error)) {
      return jsonError(error.message, error.status);
    }

    logAttachmentsError("upload", error, {
      sopId: id,
      uploadedPaths,
    });

    return jsonError(
      getAttachmentFailureMessage(error, "Unable to upload attachment files right now. Please try again."),
      500,
    );
  }
}
