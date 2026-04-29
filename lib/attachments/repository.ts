import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, SopFile, SopFileInsert } from "@/lib/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import {
  getAttachmentsUserMessage,
  logAttachmentsError,
  type AttachmentsAction,
} from "./errors";
import { extractTextFromBytes } from "./extraction";
import { ATTACHMENTS_BUCKET } from "./validation";

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

function createStorageError(
  action: Extract<AttachmentsAction, "cleanup" | "signed-url" | "upload">,
  error: unknown,
): never {
  logAttachmentsError(action, error);
  throw new Error(
    getAttachmentsUserMessage(action, {
      message: error instanceof Error ? error.message : "Unknown storage error",
    }),
  );
}

export async function listSopFiles(sopId: string, client?: SupabaseClient<Database>) {
  const supabase = await getClient(client);
  let { data, error } = await supabase
    .from("sop_files")
    .select("id,sop_id,file_name,file_type,file_size,file_url,extracted_text,created_at")
    .eq("sop_id", sopId)
    .order("created_at", { ascending: false });

  if (error && isMissingColumnError(error, "extracted_text")) {
    const fallback = await supabase
      .from("sop_files")
      .select("id,sop_id,file_name,file_type,file_size,file_url,created_at")
      .eq("sop_id", sopId)
      .order("created_at", { ascending: false });

    data = (fallback.data ?? []).map((file) => ({ ...file, extracted_text: null })) as typeof data;
    error = fallback.error;
  }

  if (error) {
    logAttachmentsError("list", error, { sopId });
    throw new Error(getAttachmentsUserMessage("list", error));
  }

  return (data ?? []) as Array<
    Pick<SopFile, "created_at" | "extracted_text" | "file_name" | "file_size" | "file_type" | "file_url" | "id" | "sop_id">
  >;
}

export async function getSopFileById(
  sopId: string,
  fileId: string,
  client?: SupabaseClient<Database>,
) {
  const supabase = await getClient(client);
  let { data, error } = await supabase
    .from("sop_files")
    .select("id,sop_id,file_name,file_type,file_size,file_url,extracted_text,created_at")
    .eq("id", fileId)
    .eq("sop_id", sopId)
    .maybeSingle();

  if (error && isMissingColumnError(error, "extracted_text")) {
    const fallback = await supabase
      .from("sop_files")
      .select("id,sop_id,file_name,file_type,file_size,file_url,created_at")
      .eq("id", fileId)
      .eq("sop_id", sopId)
      .maybeSingle();

    data = fallback.data ? ({ ...fallback.data, extracted_text: null } as typeof data) : null;
    error = fallback.error;
  }

  if (error) {
    logAttachmentsError("detail", error, { fileId, sopId });
    throw new Error(getAttachmentsUserMessage("detail", error));
  }

  return data as Pick<
    SopFile,
    "created_at" | "extracted_text" | "file_name" | "file_size" | "file_type" | "file_url" | "id" | "sop_id"
  > | null;
}

export async function createSopFiles(values: SopFileInsert[], client?: SupabaseClient<Database>) {
  const supabase = await getClient(client);
  let { data, error } = await supabase
    .from("sop_files")
    .insert(values)
    .select("id,sop_id,file_name,file_type,file_size,file_url,extracted_text,created_at");

  if (error && isMissingColumnError(error, "extracted_text")) {
    const legacyValues = values.map(({ extracted_text: _extractedText, ...rest }) => rest);
    const fallback = await supabase
      .from("sop_files")
      .insert(legacyValues)
      .select("id,sop_id,file_name,file_type,file_size,file_url,created_at");

    data = (fallback.data ?? []).map((file) => ({ ...file, extracted_text: null })) as typeof data;
    error = fallback.error;
  }

  if (error) {
    logAttachmentsError("create", error, { count: values.length, sopId: values[0]?.sop_id });
    throw new Error(getAttachmentsUserMessage("create", error));
  }

  return (data ?? []) as Array<
    Pick<SopFile, "created_at" | "extracted_text" | "file_name" | "file_size" | "file_type" | "file_url" | "id" | "sop_id">
  >;
}

export async function uploadAttachmentObject(
  storagePath: string,
  file: File,
  fileType: string,
  client?: SupabaseClient<Database>,
) {
  const supabase = await getClient(client);
  const body = new Uint8Array(await file.arrayBuffer());
  const { error } = await supabase.storage.from(ATTACHMENTS_BUCKET).upload(storagePath, body, {
    contentType: fileType,
    upsert: false,
  });

  if (error) {
    createStorageError("upload", error);
  }
}

export async function removeAttachmentObjects(paths: string[], client?: SupabaseClient<Database>) {
  if (paths.length === 0) {
    return;
  }

  const supabase = await getClient(client);
  const { error } = await supabase.storage.from(ATTACHMENTS_BUCKET).remove(paths);

  if (error) {
    createStorageError("cleanup", error);
  }
}

export async function getAttachmentContent(storagePath: string, client?: SupabaseClient<Database>) {
  const supabase = await getClient(client);
  const { data, error } = await supabase.storage.from(ATTACHMENTS_BUCKET).download(storagePath);

  if (error) {
    console.error("[repository:getAttachmentContent]", error);
    return null;
  }

  return await data.text();
}

export async function extractTextFromSopAttachments(sopId: string, client?: SupabaseClient<Database>) {
  const files = await listSopFiles(sopId, client);
  let combinedText = "";

  for (const file of files) {
    let content = file.extracted_text;

    if (!content) {
      const downloaded = await getAttachmentBinary(file.file_url, client);
      if (downloaded) {
        content = extractTextFromBytes(downloaded.bytes, file.file_type, file.file_name) || null;
      }
    }

    if (content) {
      combinedText += `\n--- File: ${file.file_name} ---\n${content}\n`;
    }
  }

  return combinedText;
}

export async function getAttachmentBinary(storagePath: string, client?: SupabaseClient<Database>) {
  const supabase = await getClient(client);
  const { data, error } = await supabase.storage.from(ATTACHMENTS_BUCKET).download(storagePath);

  if (error) {
    console.error("[repository:getAttachmentBinary]", error);
    return null;
  }

  return {
    bytes: new Uint8Array(await data.arrayBuffer()),
  };
}

export async function createAttachmentSignedUrl(
  storagePath: string,
  expiresIn: number,
  client?: SupabaseClient<Database>,
) {
  const supabase = await getClient(client);
  const { data, error } = await supabase.storage
    .from(ATTACHMENTS_BUCKET)
    .createSignedUrl(storagePath, expiresIn);

  if (error) {
    createStorageError("signed-url", error);
  }

  const signedUrl = data?.signedUrl;

  if (!signedUrl) {
    createStorageError("signed-url", new Error("Signed URL data was missing from the storage response."));
  }

  return signedUrl;
}
