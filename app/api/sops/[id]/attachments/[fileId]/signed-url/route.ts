import { NextResponse, type NextRequest } from "next/server";

import {
  ATTACHMENT_SIGNED_URL_TTL_SECONDS,
  createAttachmentRouteError,
  createAttachmentSignedUrl,
  getAttachmentFailureMessage,
  getSopFileById,
  isAttachmentRouteError,
  logAttachmentsError,
  requireOwnedSopAttachmentAccess,
} from "@/lib/attachments";
import { uuidSchema } from "@/lib/validators";

export const runtime = "nodejs";

type SignedUrlRouteContext = {
  params: Promise<{
    fileId: string;
    id: string;
  }>;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function validateRouteUuid(value: string, resourceName: "SOP" | "attachment") {
  if (!uuidSchema.safeParse(value).success) {
    throw createAttachmentRouteError(
      `This ${resourceName.toLowerCase()} could not be found or belongs to a different account.`,
      404,
    );
  }

  return value;
}

export async function GET(
  _request: NextRequest,
  { params }: SignedUrlRouteContext,
) {
  const { fileId, id } = await params;

  try {
    const sopId = validateRouteUuid(id, "SOP");
    const attachmentId = validateRouteUuid(fileId, "attachment");
    const { supabase } = await requireOwnedSopAttachmentAccess(sopId);
    const attachment = await getSopFileById(sopId, attachmentId, supabase);

    if (!attachment) {
      throw createAttachmentRouteError(
        "This attachment could not be found or belongs to a different account.",
        404,
      );
    }

    const signedUrl = await createAttachmentSignedUrl(
      attachment.file_url,
      ATTACHMENT_SIGNED_URL_TTL_SECONDS,
      supabase,
    );

    return NextResponse.json({
      expiresIn: ATTACHMENT_SIGNED_URL_TTL_SECONDS,
      signedUrl,
    });
  } catch (error) {
    if (isAttachmentRouteError(error)) {
      return jsonError(error.message, error.status);
    }

    logAttachmentsError("signed-url", error, {
      fileId,
      sopId: id,
    });

    return jsonError(
      getAttachmentFailureMessage(error, "Unable to create a download link right now. Please try again."),
      500,
    );
  }
}
