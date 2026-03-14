"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAuthContext } from "@/lib/auth";
import { generateSopContent } from "@/lib/groq";
import {
  assertSopsCreateSchema,
  createSopRecord,
  getCreateSopFailureMessage,
  type CreateSopStage,
} from "@/lib/sops";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { CreateSopActionState, CreateSopInput } from "@/lib/types";
import { createSopSchema } from "@/lib/validators";

function readFormValues(formData: FormData): CreateSopInput {
  const title = formData.get("title");
  const rawNotes = formData.get("rawNotes");

  return {
    title: typeof title === "string" ? title : "",
    rawNotes: typeof rawNotes === "string" ? rawNotes : "",
  };
}

export async function createSopAction(
  _previousState: CreateSopActionState,
  formData: FormData,
): Promise<CreateSopActionState> {
  const values = readFormValues(formData);
  const parsed = createSopSchema.safeParse(values);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;

    return {
      status: "error",
      message: "Please fix the fields below and try again.",
      fieldErrors: {
        title: errors.title?.[0],
        rawNotes: errors.rawNotes?.[0],
      },
      values,
    };
  }

  const input: CreateSopInput = parsed.data;
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
    await assertSopsCreateSchema(supabase);
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
