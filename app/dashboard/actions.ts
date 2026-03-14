"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { generateSopContent } from "@/lib/groq";
import { assertSopsCreateSchema, createSopRecord } from "@/lib/sops";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { CreateSopActionState, CreateSopInput } from "@/lib/types";
import { createSopSchema } from "@/lib/validators";

function readFormValues(formData: FormData) {
  return {
    title: typeof formData.get("title") === "string" ? formData.get("title")?.toString() : "",
    rawNotes:
      typeof formData.get("rawNotes") === "string" ? formData.get("rawNotes")?.toString() : "",
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
    };
  }

  const { supabase, user } = await requireUser();
  let sopId = "";

  try {
    await assertSopsCreateSchema(supabase);
    const input: CreateSopInput = parsed.data;
    const content = await generateSopContent(input);
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
      message:
        error instanceof Error
          ? error.message
          : "We could not generate your SOP right now. Please try again.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${sopId}`);
  redirect(`/dashboard/${sopId}`);
}

export async function signOutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/");
}
