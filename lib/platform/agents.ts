import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";

import type {
  Database,
  AgentApproval,
  AgentRun,
  AgentRunStep,
  Integration,
  IntegrationAction,
} from "@/lib/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { editSopWithAgent } from "@/lib/agents/sop-agent";
import { formatSopToMarkdown, getSopById, saveStructuredSop, type StructuredSop } from "@/lib/sops";

import { assertWithinPlanLimit, recordUsageEvent } from "./workspace";
import { calculateSopHealth } from "./health";
import { isMissingRelationError } from "./workspace";

type TypedClient = SupabaseClient<Database>;

async function getClient(client?: TypedClient) {
  return client ?? createServerSupabaseClient();
}

export async function createAgentRun(
  values: Database["public"]["Tables"]["agent_runs"]["Insert"],
  client?: TypedClient,
) {
  const supabase = await getClient(client);
  const { data, error } = await supabase.from("agent_runs").insert(values).select("*").single();
  if (error || !data) {
    throw new Error("Unable to create the agent run.");
  }
  return data as AgentRun;
}

export async function addAgentRunStep(
  runId: string,
  stepOrder: number,
  toolName: string,
  inputSummary: string,
  outputSummary: string,
  client?: TypedClient,
) {
  const supabase = await getClient(client);
  await supabase.from("agent_run_steps").insert({
    input_summary: inputSummary,
    output_summary: outputSummary,
    run_id: runId,
    status: "completed",
    step_order: stepOrder,
    tool_name: toolName,
  });
}

export async function updateAgentRunStatus(
  runId: string,
  status: Database["public"]["Tables"]["agent_runs"]["Update"]["status"],
  summary?: string,
  client?: TypedClient,
) {
  const supabase = await getClient(client);
  await supabase
    .from("agent_runs")
    .update({ status, summary, updated_at: new Date().toISOString() })
    .eq("id", runId);
}

export async function runSopAuditAgent(
  sopId: string,
  workspaceId: string,
  user: User,
  client?: TypedClient,
) {
  const supabase = await getClient(client);
  await assertWithinPlanLimit(workspaceId, "agent_run", supabase);

  const sop = await getSopById(sopId, user.id, supabase);
  if (!sop) {
    throw new Error("SOP not found.");
  }

  const run = await createAgentRun(
    {
      agent_type: "sop_audit",
      sop_id: sop.id,
      status: "running",
      title: `Audit: ${sop.title}`,
      user_id: user.id,
      workspace_id: workspaceId,
    },
    supabase,
  );

  await addAgentRunStep(run.id, 1, "health-score", "Read structured SOP sections.", "Calculated quality score.", supabase);

  const health = calculateSopHealth(sop);
  await supabase.from("sop_health_scores").upsert({
    issues: health.issues,
    last_audited_at: new Date().toISOString(),
    score: health.score,
    sop_id: sop.id,
    updated_at: new Date().toISOString(),
    workspace_id: workspaceId,
  });

  await addAgentRunStep(
    run.id,
    2,
    "approval-draft",
    "Convert audit issues into a human approval item.",
    health.issues.length > 0 ? "Created an improvement recommendation." : "No approval needed.",
    supabase,
  );

  if (health.issues.length > 0) {
    await supabase.from("agent_approvals").insert({
      approval_type: "sop_edit",
      preview: health.issues.map((issue) => `- ${issue.label}`).join("\n"),
      proposed_payload: {
        instruction:
          "Improve this SOP by adding clearer owner accountability, concrete steps, quality checks, and completion criteria.",
        mode: "improvement_request",
      },
      run_id: run.id,
      sop_id: sop.id,
      status: "pending",
      title: `Improve ${sop.title}`,
      workspace_id: workspaceId,
    });
    await updateAgentRunStatus(run.id, "waiting_approval", `Health score ${health.score}. Approval created.`, supabase);
  } else {
    await updateAgentRunStatus(run.id, "completed", `Health score ${health.score}. No changes needed.`, supabase);
  }

  await recordUsageEvent(workspaceId, user.id, "agent_run", { agent_type: "sop_audit", sop_id: sop.id }, supabase);
}

export async function runSopImprovementAgent(
  sopId: string,
  workspaceId: string,
  user: User,
  instruction: string,
  client?: TypedClient,
) {
  const supabase = await getClient(client);
  await assertWithinPlanLimit(workspaceId, "agent_run", supabase);
  const sop = await getSopById(sopId, user.id, supabase);
  if (!sop) {
    throw new Error("SOP not found.");
  }

  const run = await createAgentRun(
    {
      agent_type: "sop_improvement",
      sop_id: sop.id,
      status: "running",
      title: `Improve: ${sop.title}`,
      user_id: user.id,
      workspace_id: workspaceId,
    },
    supabase,
  );

  await addAgentRunStep(run.id, 1, "sop-editor-agent", instruction, "Generated a proposed SOP revision.", supabase);
  const proposed = await editSopWithAgent(sop.structured_data, instruction);
  await addAgentRunStep(run.id, 2, "approval-gate", "Store proposed revision without applying it.", "Approval item created.", supabase);

  await supabase.from("agent_approvals").insert({
    approval_type: "sop_edit",
    preview: formatSopToMarkdown(proposed).slice(0, 1600),
    proposed_payload: {
      content: formatSopToMarkdown(proposed),
      structured_data: proposed,
    },
    run_id: run.id,
    sop_id: sop.id,
    status: "pending",
    title: `Approve AI revision: ${sop.title}`,
    workspace_id: workspaceId,
  });

  await updateAgentRunStatus(run.id, "waiting_approval", "Proposed revision is waiting for approval.", supabase);
  await recordUsageEvent(workspaceId, user.id, "agent_run", { agent_type: "sop_improvement", sop_id: sop.id }, supabase);
}

export async function getAgentDashboard(workspaceId: string, client?: TypedClient) {
  const supabase = await getClient(client);
  const [runs, approvals, steps] = await Promise.all([
    supabase.from("agent_runs").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(20),
    supabase.from("agent_approvals").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }),
    supabase.from("agent_run_steps").select("*").order("created_at", { ascending: false }).limit(60),
  ]);

  if (
    isMissingRelationError(runs.error, "agent_runs") ||
    isMissingRelationError(approvals.error, "agent_approvals") ||
    isMissingRelationError(steps.error, "agent_run_steps")
  ) {
    return {
      approvals: [],
      runs: [],
      steps: [],
    };
  }

  return {
    approvals: (approvals.data ?? []) as AgentApproval[],
    runs: (runs.data ?? []) as AgentRun[],
    steps: (steps.data ?? []) as AgentRunStep[],
  };
}

export async function applyApproval(
  approvalId: string,
  workspaceId: string,
  user: User,
  approve: boolean,
  client?: TypedClient,
) {
  const supabase = await getClient(client);
  const { data, error } = await supabase
    .from("agent_approvals")
    .select("*")
    .eq("id", approvalId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Approval item not found.");
  }

  const approval = data as AgentApproval;
  const decidedAt = new Date().toISOString();

  if (!approve) {
    await supabase
      .from("agent_approvals")
      .update({ decided_at: decidedAt, decided_by: user.id, status: "rejected" })
      .eq("id", approval.id);
    if (approval.run_id) await updateAgentRunStatus(approval.run_id, "cancelled", "Rejected by user.", supabase);
    return;
  }

  if (approval.approval_type === "sop_edit" && approval.sop_id) {
    const payload = approval.proposed_payload as {
      content?: string;
      structured_data?: StructuredSop;
      instruction?: string;
    };
    const sop = await getSopById(approval.sop_id, user.id, supabase);
    if (!sop) throw new Error("SOP not found.");

    let structured = payload.structured_data;
    if (!structured && payload.instruction) {
      structured = await editSopWithAgent(sop.structured_data, payload.instruction);
    }

    if (structured) {
      await saveStructuredSop(approval.sop_id, structured.title, formatSopToMarkdown(structured), structured, user.id, supabase);
      const health = calculateSopHealth({ created_at: sop.created_at, structured_data: structured });
      await supabase.from("sop_health_scores").upsert({
        issues: health.issues,
        last_audited_at: decidedAt,
        score: health.score,
        sop_id: approval.sop_id,
        updated_at: decidedAt,
        workspace_id: workspaceId,
      });
    }
  }

  if (approval.approval_type === "google_action") {
    const payload = approval.proposed_payload as { integration_action_id?: string };
    if (payload.integration_action_id) {
      await supabase
        .from("integration_actions")
        .update({ status: "completed" })
        .eq("id", payload.integration_action_id)
        .eq("workspace_id", workspaceId);
    }
  }

  await supabase
    .from("agent_approvals")
    .update({ decided_at: decidedAt, decided_by: user.id, status: "approved" })
    .eq("id", approval.id);

  if (approval.run_id) await updateAgentRunStatus(approval.run_id, "completed", "Approved by user.", supabase);
}

export async function getGoogleIntegration(workspaceId: string, client?: TypedClient) {
  const supabase = await getClient(client);
  const { data, error } = await supabase
    .from("integrations")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("provider", "google")
    .maybeSingle();

  if (isMissingRelationError(error, "integrations")) {
    return null;
  }

  return data as Integration | null;
}

export async function setGoogleMockConnection(workspaceId: string, connected: boolean, client?: TypedClient) {
  const supabase = await getClient(client);
  const { error } = await supabase.from("integrations").upsert({
    config: connected
      ? {
          scopes: ["drive.file", "documents", "gmail.compose"],
          mode: "mock",
        }
      : {},
    provider: "google",
    status: connected ? "mock_connected" : "disconnected",
    updated_at: new Date().toISOString(),
    workspace_id: workspaceId,
  });

  if (isMissingRelationError(error, "integrations")) {
    return;
  }
}

export async function createGoogleMockAction(
  workspaceId: string,
  user: User,
  actionType: Database["public"]["Tables"]["integration_actions"]["Insert"]["action_type"],
  client?: TypedClient,
) {
  const supabase = await getClient(client);
  await assertWithinPlanLimit(workspaceId, "agent_run", supabase);
  const integration = await getGoogleIntegration(workspaceId, supabase);
  if (!integration || integration.status !== "mock_connected") {
    throw new Error("Connect the mock Google integration first.");
  }

  const labels = {
    docs_sync: "Sync SOP to Google Docs",
    drive_export: "Export SOP packet to Google Drive",
    gmail_draft: "Draft client handoff email in Gmail",
  };

  const run = await createAgentRun(
    {
      agent_type: "google_mock",
      status: "running",
      title: labels[actionType],
      user_id: user.id,
      workspace_id: workspaceId,
    },
    supabase,
  );

  await addAgentRunStep(run.id, 1, "google-mock", "Create a simulated Google action.", "Drafted action for approval.", supabase);

  const action = await supabase
    .from("integration_actions")
    .insert({
      action_type: actionType,
      destination:
        actionType === "gmail_draft"
          ? "Mock Gmail drafts"
          : actionType === "docs_sync"
            ? "Mock Google Docs"
            : "Mock Google Drive",
      integration_id: integration.id,
      payload: {
        note: "No external Google API was called. This is a sellable mock-ready action.",
        simulated_url: `https://workspace.google.com/mock/${actionType}/${run.id}`,
      },
      run_id: run.id,
      status: "draft",
      workspace_id: workspaceId,
    })
    .select("*")
    .single();

  if (action.error || !action.data) {
    throw new Error("Unable to create the mock Google action.");
  }

  const createdAction = action.data as IntegrationAction;
  await supabase.from("agent_approvals").insert({
    approval_type: "google_action",
    preview: `${labels[actionType]} will be marked completed inside SOPSmith only. No external data leaves this app.`,
    proposed_payload: { integration_action_id: createdAction.id },
    run_id: run.id,
    status: "pending",
    title: labels[actionType],
    workspace_id: workspaceId,
  });

  await updateAgentRunStatus(run.id, "waiting_approval", "Mock Google action is waiting for approval.", supabase);
  await recordUsageEvent(workspaceId, user.id, "agent_run", { agent_type: "google_mock", action_type: actionType }, supabase);
  await recordUsageEvent(workspaceId, user.id, "google_mock_action", { action_type: actionType }, supabase);
}

export async function getIntegrationDashboard(workspaceId: string, client?: TypedClient) {
  const supabase = await getClient(client);
  const [integration, actions] = await Promise.all([
    getGoogleIntegration(workspaceId, supabase),
    supabase
      .from("integration_actions")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  if (isMissingRelationError(actions.error, "integration_actions")) {
    return {
      actions: [],
      integration,
    };
  }

  return {
    actions: (actions.data ?? []) as IntegrationAction[],
    integration,
  };
}
