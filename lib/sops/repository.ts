import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, SopInsert, SopVersion } from "@/lib/database.types";
import { getTextPreview } from "@/lib/format";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { getSopsUserMessage, logSopsError } from "./errors";
import { coerceStructuredSop } from "./structured";
import type { CreatedSop, SopDetail, SopSummary } from "./types";

async function getClient(client?: SupabaseClient<Database>) {
  return client ?? createServerSupabaseClient();
}

function isMissingColumnError(error: unknown, column: string) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { code?: string; message?: string | null };
  const message = candidate.message?.toLowerCase() ?? "";
  return candidate.code === "42703" && message.includes(column.toLowerCase());
}

function isMissingRelationError(error: unknown, relation: string) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { code?: string; message?: string | null; hint?: string | null };
  const combined = [candidate.message, candidate.hint].filter(Boolean).join(" ").toLowerCase();
  return candidate.code === "PGRST205" && combined.includes(relation.toLowerCase());
}

export async function listUserSops(userId: string, client?: SupabaseClient<Database>, workspaceId?: string) {
  const supabase = await getClient(client);
  let query = supabase
    .from("sops")
    .select("id,title,created_at,content")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (workspaceId) {
    query = query.eq("workspace_id", workspaceId);
  }

  const { data, error } = await query;

  if (error && (isMissingColumnError(error, "workspace_id") || isMissingRelationError(error, "sops"))) {
    const legacyQuery = supabase
      .from("sops")
      .select("id,title,created_at,content")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const legacyResult = await legacyQuery;

    if (legacyResult.error) {
      logSopsError("list", legacyResult.error, { userId, workspaceId, legacyFallback: true });
      throw new Error(getSopsUserMessage("list", legacyResult.error));
    }

    return ((legacyResult.data ?? []) as Array<{
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

  if (error) {
    logSopsError("list", error, { userId, workspaceId });
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
  let { data, error } = await supabase
    .from("sops")
    .select("id,title,content,raw_notes,structured_data,created_at,updated_at")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error && isMissingColumnError(error, "structured_data")) {
    const fallback = await supabase
      .from("sops")
      .select("id,title,content,raw_notes,created_at,updated_at")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    data = fallback.data as typeof data;
    error = fallback.error;
  }

  if (error) {
    logSopsError("detail", error, { id, userId });
    throw new Error(getSopsUserMessage("detail", error));
  }

  if (!data) {
    return null;
  }

  return {
    ...(data as Omit<SopDetail, "structured_data"> & { structured_data?: unknown }),
    structured_data: coerceStructuredSop((data as { structured_data?: unknown }).structured_data as never, data.content),
  } as SopDetail;
}

export async function getStructuredSop(
  id: string,
  userId: string,
  client?: SupabaseClient<Database>,
) {
  return getSopById(id, userId, client);
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
  let { error } = await supabase.from("sops").select("id,raw_notes,structured_data").limit(1);

  if (error && isMissingColumnError(error, "structured_data")) {
    const fallback = await supabase.from("sops").select("id,raw_notes").limit(1);
    error = fallback.error;
  }

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

export async function createSopVersion(
  sopId: string,
  content: string,
  structuredData: Database["public"]["Tables"]["sops"]["Row"]["structured_data"],
  client?: SupabaseClient<Database>,
) {
  const supabase = await getClient(client);
  let { error } = await supabase.from("sop_versions").insert({
    sop_id: sopId,
    content,
    structured_data: structuredData,
  });

  if (error && (isMissingColumnError(error, "structured_data") || isMissingRelationError(error, "sop_versions"))) {
    const fallback = await supabase.from("sop_versions").insert({
      sop_id: sopId,
      content,
    });
    error = fallback.error;
  }

  if (error && !isMissingRelationError(error, "sop_versions")) {
    console.error("[repository:createSopVersion]", error);
  }
}

export async function getSopVersions(
  sopId: string,
  userId: string,
  client?: SupabaseClient<Database>,
) {
  const supabase = await getClient(client);
  let { data, error } = await supabase
    .from("sop_versions")
    .select("id,sop_id,content,structured_data,created_at")
    .eq("sop_id", sopId)
    .order("created_at", { ascending: false });

  if (error && (isMissingColumnError(error, "structured_data") || isMissingRelationError(error, "sop_versions"))) {
    const fallback = await supabase
      .from("sop_versions")
      .select("id,sop_id,content,created_at")
      .eq("sop_id", sopId)
      .order("created_at", { ascending: false });

    data = fallback.data as typeof data;
    error = fallback.error;
  }

  if (error && isMissingRelationError(error, "sop_versions")) {
    return [];
  }

  if (error) {
    logSopsError("detail", error, { id: sopId, userId });
    throw new Error("Unable to load versions for this SOP.");
  }

  return ((data ?? []) as SopVersion[]).map((version) => ({
    ...version,
    structured_data: coerceStructuredSop(version.structured_data, version.content),
  }));
}

export async function createSopRecord(values: SopInsert, client?: SupabaseClient<Database>) {
  const supabase = await getClient(client);
  let { data, error } = await supabase.from("sops").insert(values).select("id").single();

  if (error && isMissingColumnError(error, "structured_data")) {
    const { structured_data: _structuredData, ...legacyValues } = values;
    const fallback = await supabase.from("sops").insert(legacyValues).select("id").single();
    data = fallback.data;
    error = fallback.error;
  }

  if (error) {
    logSopsError("create", error, { userId: values.user_id });
    throw new Error(getSopsUserMessage("create", error));
  }

  const sop = data as CreatedSop;
  await createSopVersion(sop.id, values.content, values.structured_data ?? {}, supabase);

  return sop;
}

export async function saveStructuredSop(
  id: string,
  title: string,
  content: string,
  structuredData: Database["public"]["Tables"]["sops"]["Row"]["structured_data"],
  userId: string,
  client?: SupabaseClient<Database>,
) {
  const supabase = await getClient(client);
  let { error } = await supabase
    .from("sops")
    .update({ content, structured_data: structuredData, title })
    .eq("id", id)
    .eq("user_id", userId);

  if (error && isMissingColumnError(error, "structured_data")) {
    const fallback = await supabase
      .from("sops")
      .update({ content, title })
      .eq("id", id)
      .eq("user_id", userId);
    error = fallback.error;
  }

  if (error) {
    logSopsError("update", error, { id, userId });
    throw new Error("Unable to update this SOP right now. Please try again.");
  }

  await createSopVersion(id, content, structuredData, supabase);
}

export async function restoreSopVersion(
  sopId: string,
  versionId: string,
  userId: string,
  client?: SupabaseClient<Database>,
) {
  const supabase = await getClient(client);
  let { data, error } = await supabase
    .from("sop_versions")
    .select("id,sop_id,content,structured_data")
    .eq("id", versionId)
    .eq("sop_id", sopId)
    .maybeSingle();

  if (error && isMissingColumnError(error, "structured_data")) {
    const fallback = await supabase
      .from("sop_versions")
      .select("id,sop_id,content")
      .eq("id", versionId)
      .eq("sop_id", sopId)
      .maybeSingle();

    data = fallback.data as typeof data;
    error = fallback.error;
  }

  if (error && isMissingRelationError(error, "sop_versions")) {
    return;
  }

  if (error) {
    logSopsError("detail", error, { sopId, userId, versionId });
    throw new Error("Unable to restore this version right now.");
  }

  if (!data) {
    throw new Error("That SOP version could not be found.");
  }

  const structured = coerceStructuredSop(
    data.structured_data as Database["public"]["Tables"]["sop_versions"]["Row"]["structured_data"],
    data.content,
  );

  await saveStructuredSop(sopId, structured.title, data.content, structured, userId, supabase);
}
