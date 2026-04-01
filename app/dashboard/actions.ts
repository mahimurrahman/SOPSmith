"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAuthContext } from "@/lib/auth";
import { generateSopContent } from "@/lib/groq";
import {
  assertSopsCreateSchema,
  createSopRecord,
  deleteSopRecord,
  getCreateSopFailureMessage,
  getSopById,
  updateSopContent,
  type CreateSopStage,
} from "@/lib/sops";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { CreateSopActionState, CreateSopInput } from "@/lib/types";
import { createSopSchema } from "@/lib/validators";

import { z } from "zod";

function readFormValues(formData: FormData): CreateSopInput & { hasFiles: boolean } {
  const title = formData.get("title");
  const rawNotes = formData.get("rawNotes");
  const hasFiles = formData.get("hasFiles") === "true";

  return {
    title: typeof title === "string" ? title : "",
    rawNotes: typeof rawNotes === "string" ? rawNotes : "",
    hasFiles,
  };
}

export async function createSopAction(
  _previousState: CreateSopActionState,
  formData: FormData,
): Promise<CreateSopActionState> {
  const values = readFormValues(formData);
  
  const titleSchema = z.string().trim().min(5, "Use a clearer SOP title with at least 5 characters.").max(120, "Keep the title under 120 characters so it stays easy to scan later.");
  const rawNotesSchema = values.hasFiles 
    ? z.string().trim().max(6000, "Keep the rough notes under 6,000 characters.")
    : z.string().trim().min(20, "Add at least a few notes for SOPSmith to work from.").max(6000, "Keep the rough notes under 6,000 characters.");

  const titleParsed = titleSchema.safeParse(values.title);
  const rawNotesParsed = rawNotesSchema.safeParse(values.rawNotes);

  if (!titleParsed.success || !rawNotesParsed.success) {
    return {
      status: "error",
      message: "Please fix the fields below and try again.",
      fieldErrors: {
        title: !titleParsed.success ? titleParsed.error.issues[0].message : undefined,
        rawNotes: !rawNotesParsed.success ? rawNotesParsed.error.issues[0].message : undefined,
      },
      values,
    };
  }

  const input: CreateSopInput = {
    title: titleParsed.data,
    rawNotes: rawNotesParsed.data || "The user has attached operational files. Please provide a structured, high-level preliminary SOP based purely on the provided title, which the user will refine later.",
  };
  const { supabase, user } = await getAuthContext();

  if (!user) {
    return {
      status: "error",
      message: getCreateSopFailureMessage(null, "auth"),
      values,
    };
  }

  let sopId = "";
  let stage: CreateSopStage = "schema";

  try {
    if (process.env.NODE_ENV !== "production") {
      await assertSopsCreateSchema(supabase);
    }
    stage = "generate";
    const content = await generateSopContent(input);
    stage = "save";
    const sop = await createSopRecord(
      {
        content,
        raw_notes: input.rawNotes,
        title: input.title,
        user_id: user.id,
      },
      supabase,
    );
    sopId = sop.id;
  } catch (error) {
    console.error("[createSopAction]", {
      message: error instanceof Error ? error.message : "Unknown create SOP error",
      stage,
      userId: user.id,
    });

    return {
      status: "error",
      message: getCreateSopFailureMessage(error, stage),
      values,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${sopId}`);

  return {
    status: "success",
    message: "SOP created successfully.",
    sopId,
    values,
  };
}

export async function signOutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function deleteSopAction(sopId: string): Promise<{ error?: string }> {
  const { supabase, user } = await getAuthContext();
  if (!user) return { error: "Your session expired. Sign in again." };
  try {
    await deleteSopRecord(sopId, user.id, supabase);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to delete this SOP." };
  }
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function regenerateSopAction(
  sopId: string,
): Promise<{ error?: string }> {
  const { supabase, user } = await getAuthContext();
  if (!user) return { error: "Your session expired. Sign in again." };

  try {
    const sop = await getSopById(sopId, user.id, supabase);
    if (!sop) return { error: "SOP not found." };

    const content = await generateSopContent({
      title: sop.title,
      rawNotes: sop.raw_notes,
    });

    await updateSopContent(sopId, content, user.id, supabase);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to regenerate this SOP.",
    };
  }

  revalidatePath(`/dashboard/${sopId}`);
  revalidatePath("/dashboard");
  return {};
}
