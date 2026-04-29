"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getAuthContext } from "@/lib/auth";
import { runSopAgent, type SopAgentOutput } from "@/lib/agents/sop-agent";
import {
  extractTextFromSopAttachments,
  listSopFiles,
  removeAttachmentObjects,
} from "@/lib/attachments/repository";
import {
  addAgentRunStep,
  applyApproval,
  assertWithinPlanLimit,
  changeWorkspacePlan,
  createAgentRun,
  createGoogleMockAction,
  ensureWorkspaceContext,
  recordUsageEvent,
  runSopAuditAgent,
  runSopImprovementAgent,
  setGoogleMockConnection,
  updateAgentRunStatus,
} from "@/lib/platform";
import {
  assertSopsCreateSchema,
  createSopRecord,
  deleteSopRecord,
  formatSopToMarkdown,
  getCreateSopFailureMessage,
  restoreSopVersion,
  type CreateSopStage,
} from "@/lib/sops";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { CreateSopActionState, CreateSopInput } from "@/lib/types";

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
  let runId = "";
  let stage: CreateSopStage = "schema";

  try {
    const { workspace } = await ensureWorkspaceContext(user, supabase);
    await assertWithinPlanLimit(workspace.id, "sop", supabase);
    if (process.env.NODE_ENV !== "production") {
      await assertSopsCreateSchema(supabase);
    }

    try {
      const run = await createAgentRun(
        {
          agent_type: "sop_creation",
          status: "running",
          title: `Create SOP: ${input.title}`,
          user_id: user.id,
          workspace_id: workspace.id,
        },
        supabase,
      );
      runId = run.id;
      await addAgentRunStep(run.id, 1, "intake", "Validate title, notes, and optional files.", "Inputs accepted.", supabase);
    } catch (error) {
      console.error("[createSopAction:agent-run]", {
        message: error instanceof Error ? error.message : "Unable to create the agent run.",
        userId: user.id,
      });
    }

    stage = "generate";
    const agentOutput = await runSopAgent(input);
    if (runId) {
      await addAgentRunStep(runId, 2, "sop-agent", "Generate structured SOP JSON.", "Draft generated and validated.", supabase);
    }
    const content = formatSopToMarkdown(agentOutput);
    stage = "save";
    const sop = await createSopRecord(
      {
        content,
        raw_notes: input.rawNotes,
        structured_data: agentOutput,
        title: input.title,
        user_id: user.id,
        workspace_id: workspace.id,
      },
      supabase,
    );
    sopId = sop.id;
    if (runId) {
      await addAgentRunStep(runId, 3, "supabase", "Persist SOP and version history.", `Saved SOP ${sop.id}.`, supabase);
      await updateAgentRunStatus(runId, "completed", "SOP created and saved to the agency workspace.", supabase);
    }
    await recordUsageEvent(workspace.id, user.id, "sop_created", { sop_id: sop.id }, supabase);
    await recordUsageEvent(workspace.id, user.id, "agent_run", { agent_type: "sop_creation", sop_id: sop.id }, supabase);
  } catch (error) {
    if (runId) {
      await updateAgentRunStatus(
        runId,
        "failed",
        error instanceof Error ? error.message : "SOP creation failed.",
        supabase,
      );
    }
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
  revalidatePath("/dashboard/library");
  revalidatePath("/dashboard/command");
  revalidatePath("/dashboard/agents");
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
    const attachments = await listSopFiles(sopId, supabase);
    const attachmentPaths = attachments.map((attachment) => attachment.file_url);

    if (attachmentPaths.length > 0) {
      await removeAttachmentObjects(attachmentPaths, supabase);
    }

    await deleteSopRecord(sopId, user.id, supabase);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to delete this SOP." };
  }
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/library");
  revalidatePath("/dashboard/command");
  redirect("/dashboard/library");
}

export async function regenerateSopAction(
  sopId: string,
): Promise<{ error?: string }> {
  const { supabase, user } = await getAuthContext();
  if (!user) return { error: "Your session expired. Sign in again." };

  try {
    const { workspace } = await ensureWorkspaceContext(user, supabase);
    // Basic RAG: extract attachment text
    const attachmentText = await extractTextFromSopAttachments(sopId, supabase);
    await runSopImprovementAgent(
      sopId,
      workspace.id,
      user,
      `Regenerate this SOP into a stronger agency delivery procedure.${attachmentText ? `\n\nUse this attachment context:\n${attachmentText}` : ""}`,
      supabase,
    );
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to regenerate this SOP.",
    };
  }

  revalidatePath(`/dashboard/${sopId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/approvals");
  revalidatePath("/dashboard/agents");
  return {};
}

export async function regenerateSopSectionAction(
  sopId: string,
  section: keyof SopAgentOutput,
  instruction?: string
): Promise<{ error?: string; updatedSection?: string }> {
  const { supabase, user } = await getAuthContext();
  if (!user) return { error: "Session expired." };

  try {
    const { workspace } = await ensureWorkspaceContext(user, supabase);
    await runSopImprovementAgent(
      sopId,
      workspace.id,
      user,
      `Regenerate only the ${String(section)} section. ${instruction ? `Instruction: ${instruction}` : ""}`,
      supabase,
    );
  } catch (error) {
    return { error: String(error) };
  }
  revalidatePath(`/dashboard/${sopId}`);
  revalidatePath("/dashboard/approvals");
  revalidatePath("/dashboard/agents");
  return { updatedSection: "approval" };
}

export async function editSopChatAction(
  sopId: string,
  instruction: string
): Promise<{ error?: string; updatedSection?: string }> {
  const { supabase, user } = await getAuthContext();
  if (!user) return { error: "Session expired." };

  try {
    const { workspace } = await ensureWorkspaceContext(user, supabase);
    const attachmentText = await extractTextFromSopAttachments(sopId, supabase);
    await runSopImprovementAgent(
      sopId,
      workspace.id,
      user,
      attachmentText ? `${instruction}\n\nUse this attachment context:\n${attachmentText}` : instruction,
      supabase,
    );
  } catch (error) {
    return { error: String(error) };
  }
  revalidatePath(`/dashboard/${sopId}`);
  revalidatePath("/dashboard/approvals");
  revalidatePath("/dashboard/agents");
  return { updatedSection: "approval" };
}

export async function restoreSopVersionAction(
  sopId: string,
  versionId: string,
): Promise<{ error?: string; updatedSection?: string }> {
  const { supabase, user } = await getAuthContext();
  if (!user) return { error: "Session expired." };

  try {
    await restoreSopVersion(sopId, versionId, user.id, supabase);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to restore this SOP version." };
  }

  revalidatePath(`/dashboard/${sopId}`);
  revalidatePath("/dashboard");
  return { updatedSection: "restore" };
}

export async function changePlanAction(planId: string): Promise<{ error?: string }> {
  const { supabase, user } = await getAuthContext();
  if (!user) return { error: "Session expired." };

  try {
    const { workspace } = await ensureWorkspaceContext(user, supabase);
    await changeWorkspacePlan(workspace.id, planId, supabase);
    const cookieStore = await cookies();
    cookieStore.set(`sopsmith_mock_plan_${workspace.id}`, planId, {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to change plan." };
  }

  revalidatePath("/dashboard/billing");
  revalidatePath("/dashboard/command");
  return {};
}

export async function runAuditAction(sopId: string): Promise<{ error?: string }> {
  const { supabase, user } = await getAuthContext();
  if (!user) return { error: "Session expired." };

  try {
    const { workspace } = await ensureWorkspaceContext(user, supabase);
    await runSopAuditAgent(sopId, workspace.id, user, supabase);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to run audit." };
  }

  revalidatePath(`/dashboard/${sopId}`);
  revalidatePath("/dashboard/agents");
  revalidatePath("/dashboard/approvals");
  revalidatePath("/dashboard/command");
  return {};
}

export async function decideApprovalAction(
  approvalId: string,
  decision: "approve" | "reject",
): Promise<{ error?: string }> {
  const { supabase, user } = await getAuthContext();
  if (!user) return { error: "Session expired." };

  try {
    const { workspace } = await ensureWorkspaceContext(user, supabase);
    await applyApproval(approvalId, workspace.id, user, decision === "approve", supabase);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to update approval." };
  }

  revalidatePath("/dashboard/approvals");
  revalidatePath("/dashboard/agents");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/command");
  return {};
}

export async function setGoogleMockConnectionAction(connected: boolean): Promise<{ error?: string }> {
  const { supabase, user } = await getAuthContext();
  if (!user) return { error: "Session expired." };

  try {
    const { workspace } = await ensureWorkspaceContext(user, supabase);
    await setGoogleMockConnection(workspace.id, connected, supabase);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to update Google mock connection." };
  }

  revalidatePath("/dashboard/integrations");
  revalidatePath("/dashboard/command");
  return {};
}

export async function createGoogleMockActionAction(
  actionType: "drive_export" | "docs_sync" | "gmail_draft",
): Promise<{ error?: string }> {
  const { supabase, user } = await getAuthContext();
  if (!user) return { error: "Session expired." };

  try {
    const { workspace } = await ensureWorkspaceContext(user, supabase);
    await createGoogleMockAction(workspace.id, user, actionType, supabase);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to create Google mock action." };
  }

  revalidatePath("/dashboard/integrations");
  revalidatePath("/dashboard/approvals");
  revalidatePath("/dashboard/agents");
  revalidatePath("/dashboard/command");
  return {};
}
