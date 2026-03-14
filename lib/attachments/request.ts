import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getAuthContext } from "@/lib/auth";
import type { Database } from "@/lib/database.types";
import { getOwnedSopReference } from "@/lib/sops";

import { createAttachmentRouteError } from "./errors";

export type OwnedSopAttachmentContext = {
  sopId: string;
  supabase: SupabaseClient<Database>;
  userId: string;
};

export async function requireOwnedSopAttachmentAccess(sopId: string) {
  const { supabase, user } = await getAuthContext();

  if (!user) {
    throw createAttachmentRouteError("Please sign in to manage attachments.", 401);
  }

  const sop = await getOwnedSopReference(sopId, user.id, supabase);

  if (!sop) {
    throw createAttachmentRouteError(
      "This SOP could not be found or belongs to a different account.",
      404,
    );
  }

  return {
    sopId: sop.id,
    supabase,
    userId: user.id,
  } satisfies OwnedSopAttachmentContext;
}
