import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, SopFile, SopFileInsert } from "@/lib/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import {
  getAttachmentsUserMessage,
  logAttachmentsError,
  type AttachmentsAction,
} from "./errors";
import { ATTACHMENTS_BUCKET } from "./validation";

async function getClient(client?: SupabaseClient<Database>) {
  return client ?? createServerSupabaseClient();
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
  const { data, error } = await supabase
    .from("sop_files")
    .select("id,sop_id,file_name,file_type,file_size,created_at")
    .eq("sop_id", sopId)
    .order("created_at", { ascending: false });

  if (error) {
    logAttachmentsError("list", error, { sopId });
    throw new Error(getAttachmentsUserMessage("list", error));
  }

  return (data ?? []) as Array<
    Pick<SopFile, "created_at" | "file_name" | "file_size" | "file_type" | "id" | "sop_id">
  >;
}

export async function getSopFileById(
  sopId: string,
  fileId: string,
  client?: SupabaseClient<Database>,
) {
  const supabase = await getClient(client);
  const { data, error } = await supabase
    .from("sop_files")
    .select("id,sop_id,file_name,file_type,file_size,file_url,created_at")
    .eq("id", fileId)
    .eq("sop_id", sopId)
    .maybeSingle();

  if (error) {
    logAttachmentsError("detail", error, { fileId, sopId });
    throw new Error(getAttachmentsUserMessage("detail", error));
  }

  return data as Pick<
    SopFile,
    "created_at" | "file_name" | "file_size" | "file_type" | "file_url" | "id" | "sop_id"
  > | null;
}

export async function createSopFiles(values: SopFileInsert[], client?: SupabaseClient<Database>) {
  const supabase = await getClient(client);
  const { data, error } = await supabase
    .from("sop_files")
    .insert(values)
    .select("id,sop_id,file_name,file_type,file_size,file_url,created_at");

  if (error) {
    logAttachmentsError("create", error, { count: values.length, sopId: values[0]?.sop_id });
    throw new Error(getAttachmentsUserMessage("create", error));
  }

  return (data ?? []) as Array<
    Pick<SopFile, "created_at" | "file_name" | "file_size" | "file_type" | "file_url" | "id" | "sop_id">
  >;
}

export async function uploadAttachmentObject(
  storagePath: string,
  file: File,
  fileType: string,
  client?: SupabaseClient<Database>,
) {
  const supabase = await getClient(client);

  let body: Uint8Array;
  try {
    body = new Uint8Array(await file.arrayBuffer());
  } catch (readError) {
    return createStorageError(
      "upload",
      readError instanceof Error
        ? new Error(`Could not read file "${file.name}": ${readError.message}`)
        : new Error(`Could not read file "${file.name}".`),
    );
  }

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
    logAttachmentsError("cleanup", error, {
      bucket: ATTACHMENTS_BUCKET,
      paths,
    });
  }
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
