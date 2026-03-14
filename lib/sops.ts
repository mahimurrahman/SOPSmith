import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, SopInsert } from "@/lib/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type SopSummary = {
  id: string;
  title: string;
  created_at: string;
};

export type SopDetail = {
  id: string;
  title: string;
  content: string;
  created_at: string;
};

export type CreatedSop = {
  id: string;
};

type SupabaseErrorLike = {
  code?: string;
  details?: string | null;
  hint?: string | null;
  message?: string;
};

function getSchemaRepairMessage() {
  return "Your Supabase sops table is out of date. Run the repair SQL in supabase/migrations/20260314193000_repair_sops_schema.sql.";
}

function getSupabaseUserMessage(
  action: "list" | "detail" | "create" | "schema",
  error: SupabaseErrorLike,
) {
  const combined = [error.message, error.details, error.hint]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (
    error.code === "42703" ||
    combined.includes("raw_notes") ||
    combined.includes("updated_at")
  ) {
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
      return "Unable to save your SOP right now.";
    case "detail":
      return "Unable to load this SOP.";
    case "schema":
      return "SOPSmith could not verify the Supabase table schema.";
    case "list":
    default:
      return "Unable to load your SOP library.";
  }
}

function logSupabaseError(
  action: "list" | "detail" | "create" | "schema",
  error: SupabaseErrorLike,
  extra?: Record<string, unknown>,
) {
  console.error(`[sops:${action}]`, {
    code: error.code,
    details: error.details,
    hint: error.hint,
    message: error.message,
    ...extra,
  });
}

async function getClient(client?: SupabaseClient<Database>) {
  return client ?? createServerSupabaseClient();
}

export async function listUserSops(userId: string, client?: SupabaseClient<Database>) {
  const supabase = await getClient(client);
  const { data, error } = await supabase
    .from("sops")
    .select("id,title,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    logSupabaseError("list", error, { userId });
    throw new Error(getSupabaseUserMessage("list", error));
  }

  return (data ?? []) as SopSummary[];
}

export async function getSopById(
  id: string,
  userId: string,
  client?: SupabaseClient<Database>,
) {
  const supabase = await getClient(client);
  const { data, error } = await supabase
    .from("sops")
    .select("id,title,content,created_at")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    logSupabaseError("detail", error, { id, userId });
    throw new Error(getSupabaseUserMessage("detail", error));
  }

  return data as SopDetail | null;
}

export async function assertSopsCreateSchema(client?: SupabaseClient<Database>) {
  const supabase = await getClient(client);
  const { error } = await supabase.from("sops").select("id,raw_notes").limit(1);

  if (error) {
    logSupabaseError("schema", error);
    throw new Error(getSupabaseUserMessage("schema", error));
  }
}

export async function createSopRecord(values: SopInsert, client?: SupabaseClient<Database>) {
  const supabase = await getClient(client);
  const { data, error } = await supabase.from("sops").insert(values).select("id").single();

  if (error) {
    logSupabaseError("create", error, { userId: values.user_id });
    throw new Error(getSupabaseUserMessage("create", error));
  }

  return data as CreatedSop;
}
