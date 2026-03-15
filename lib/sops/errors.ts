import { getErrorLogDetails, getErrorMessage } from "@/lib/errors";

type SupabaseErrorLike = {
  code?: string;
  details?: string | null;
  hint?: string | null;
  message?: string;
};

export type SopsAction = "list" | "detail" | "create" | "schema" | "update" | "delete";
export type CreateSopStage = "auth" | "schema" | "generate" | "save";

export function getSchemaRepairMessage() {
  return "Your Supabase sops table is out of date. Run the repair SQL in supabase/migrations/20260314193000_repair_sops_schema.sql.";
}

export function getSopsUserMessage(action: SopsAction, error: SupabaseErrorLike) {
  const combined = [error.message, error.details, error.hint]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (error.code === "42703" || combined.includes("raw_notes") || combined.includes("updated_at")) {
    return getSchemaRepairMessage();
  }

  if (
    error.code === "42501" ||
    combined.includes("permission denied") ||
    combined.includes("row-level security")
  ) {
    return "Your Supabase sops table permissions or RLS policies are incomplete. Run the repair SQL in supabase/migrations/20260314193000_repair_sops_schema.sql.";
  }

  switch (action) {
    case "create":
      return "Unable to save your SOP right now. Your title and notes are still on the page, so you can try again.";
    case "detail":
      return "Unable to load this SOP right now. Return to your library and try again.";
    case "schema":
      return "SOPSmith could not verify the Supabase table schema.";
    case "list":
    default:
      return "Unable to load your SOP library right now. Refresh the page and try again.";
  }
}

export function getCreateSopFailureMessage(error: unknown, stage: CreateSopStage) {
  const message = getErrorMessage(error, "");

  if (message) {
    return message;
  }

  switch (stage) {
    case "auth":
      return "Your session expired. Sign in again, then retry from this page.";
    case "save":
      return "We generated your SOP but could not save it. Your title and notes are still here, so you can try again.";
    case "generate":
      return "We could not generate your SOP right now. Your title and notes are still here, so you can try again.";
    case "schema":
    default:
      return "We could not prepare SOP creation right now. Please try again.";
  }
}

export function logSopsError(action: SopsAction, error: unknown, extra?: Record<string, unknown>) {
  console.error(`[sops:${action}]`, {
    ...getErrorLogDetails(error),
    ...extra,
  });
}
