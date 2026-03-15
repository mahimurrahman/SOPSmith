import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, SopInsert } from "@/lib/database.types";
import { getTextPreview } from "@/lib/format";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { getSopsUserMessage, logSopsError } from "./errors";
import type { CreatedSop, SopDetail, SopSummary } from "./types";

async function getClient(client?: SupabaseClient<Database>) {
  return client ?? createServerSupabaseClient();
}

export async function listUserSops(userId: string, client?: SupabaseClient<Database>) {
  const supabase = await getClient(client);
  const { data, error } = await supabase
    .from("sops")
    .select("id,title,created_at,content")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    logSopsError("list", error, { userId });
    throw new Error(getSopsUserMessage("list", error));
  }

  return ((data ?? []) as Array<{
    created_at: string;
    id: string;
    content: string;
    title: string;
  }>).map((sop) => ({
    created_at: sop.created_at,
    id: sop.id,
    preview: getTextPreview(sop.content),
    title: sop.title,
  })) as SopSummary[];
}

export async function getSopById(
  id: string,
  userId: string,
  client?: SupabaseClient<Database>,
) {
  const supabase = await getClient(client);
  const { data, error } = await supabase
    .from("sops")
    .select("id,title,content,raw_notes,created_at,updated_at")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    logSopsError("detail", error, { id, userId });
    throw new Error(getSopsUserMessage("detail", error));
  }

  return data as SopDetail | null;
}

export async function getOwnedSopReference(
  id: string,
  userId: string,
  client?: SupabaseClient<Database>,
) {
  const supabase = await getClient(client);
  const { data, error } = await supabase
    .from("sops")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    logSopsError("detail", error, { id, userId });
    throw new Error(getSopsUserMessage("detail", error));
  }

  return data as { id: string } | null;
}

export async function assertSopsCreateSchema(client?: SupabaseClient<Database>) {
  const supabase = await getClient(client);
  const { error } = await supabase.from("sops").select("id,raw_notes").limit(1);

  if (error) {
    logSopsError("schema", error);
    throw new Error(getSopsUserMessage("schema", error));
  }
}

export async function deleteSopRecord(id: string, userId: string, client?: SupabaseClient<Database>) {
  const supabase = await getClient(client);
  const { error } = await supabase.from("sops").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error("Unable to delete this SOP right now. Please try again.");
}

export async function createSopRecord(values: SopInsert, client?: SupabaseClient<Database>) {
  const supabase = await getClient(client);
  const { data, error } = await supabase.from("sops").insert(values).select("id").single();

  if (error) {
    logSopsError("create", error, { userId: values.user_id });
    throw new Error(getSopsUserMessage("create", error));
  }

  return data as CreatedSop;
}

export async function updateSopContent(
  id: string,
  content: string,
  userId: string,
  client?: SupabaseClient<Database>,
) {
  const supabase = await getClient(client);
  const { error } = await supabase
    .from("sops")
    .update({ content })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    logSopsError("update", error, { id, userId });
    throw new Error("Unable to update this SOP right now. Please try again.");
  }
}
