import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import type { Database, Invoice, Plan, Workspace, WorkspaceSubscription } from "@/lib/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { getFallbackPlan, PLAN_CATALOG } from "./plans";

type TypedClient = SupabaseClient<Database>;

function monthStart(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function monthEnd(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
}

function invoiceNumber(workspaceId: string, date = new Date()) {
  const ym = `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
  return `MOCK-${ym}-${workspaceId.slice(0, 8).toUpperCase()}`;
}

async function getClient(client?: TypedClient) {
  return client ?? createServerSupabaseClient();
}

export function isMissingRelationError(error: unknown, relation: string) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { code?: string; hint?: string | null; message?: string | null };
  const combined = [candidate.message, candidate.hint].filter(Boolean).join(" ").toLowerCase();
  return candidate.code === "PGRST205" && combined.includes(relation.toLowerCase());
}

function buildLegacyWorkspace(user: { email?: string | null; id: string }): Workspace {
  const now = new Date().toISOString();

  return {
    created_at: now,
    id: user.id,
    name: user.email ? `${user.email.split("@")[0]}'s Agency Ops` : "Agency Ops Workspace",
    owner_user_id: user.id,
    updated_at: now,
  };
}

function getMockPlanCookieName(workspaceId: string) {
  return `sopsmith_mock_plan_${workspaceId}`;
}

async function readMockPlanOverride(workspaceId: string) {
  const cookieStore = await cookies();
  return cookieStore.get(getMockPlanCookieName(workspaceId))?.value ?? null;
}

async function findWorkspaceForUser(supabase: TypedClient, userId: string) {
  const membership = await supabase
    .from("workspace_members")
    .select("workspace_id,role")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (isMissingRelationError(membership.error, "workspace_members")) {
    return null;
  }

  if (membership.data?.workspace_id) {
    const workspaceResult = await supabase
      .from("workspaces")
      .select("*")
      .eq("id", membership.data.workspace_id)
      .maybeSingle();

    if (isMissingRelationError(workspaceResult.error, "workspaces")) {
      return {
        role: membership.data.role ?? "owner",
        workspace: buildLegacyWorkspace({ id: userId }),
      };
    }

    if (workspaceResult.data) {
      return {
        role: membership.data.role ?? "owner",
        workspace: workspaceResult.data as Workspace,
      };
    }
  }

  const ownedWorkspace = await supabase
    .from("workspaces")
    .select("*")
    .eq("owner_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (isMissingRelationError(ownedWorkspace.error, "workspaces")) {
    return {
      role: "owner",
      workspace: buildLegacyWorkspace({ id: userId }),
    };
  }

  if (ownedWorkspace.data) {
    return {
      role: "owner",
      workspace: ownedWorkspace.data as Workspace,
    };
  }

  return null;
}

export async function getPlans(client?: TypedClient) {
  const supabase = await getClient(client);
  const { data, error } = await supabase.from("plans").select("*").order("monthly_price");
  if (error || !data?.length) {
    return PLAN_CATALOG;
  }
  return data as Plan[];
}

export async function ensureWorkspaceContext(user: User, client?: TypedClient) {
  const supabase = await getClient(client);

  const existingWorkspace = await findWorkspaceForUser(supabase, user.id);
  if (existingWorkspace) {
    return {
      role: existingWorkspace.role,
      subscription: null,
      supabase,
      workspace: existingWorkspace.workspace,
    };
  }

  let workspace: Workspace | null = null;
  const role = "owner";

  if (!workspace) {
    const name = user.email ? `${user.email.split("@")[0]}'s Agency Ops` : "Agency Ops Workspace";
    const created = await supabase.from("workspaces").insert({ name, owner_user_id: user.id });

    if (created.error) {
      if (isMissingRelationError(created.error, "workspaces")) {
        return {
          role,
          subscription: null,
          supabase,
          workspace: buildLegacyWorkspace(user),
        };
      }

      console.error("[workspace:create]", created.error);
      throw new Error("Unable to create your workspace right now.");
    }

    const createdWorkspace = await supabase
      .from("workspaces")
      .select("*")
      .eq("owner_user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (createdWorkspace.error) {
      if (isMissingRelationError(createdWorkspace.error, "workspaces")) {
        return {
          role,
          subscription: null,
          supabase,
          workspace: buildLegacyWorkspace(user),
        };
      }

      console.error("[workspace:lookup-after-create]", createdWorkspace.error);
      throw new Error("Unable to create your workspace right now.");
    }

    if (!createdWorkspace.data) {
      throw new Error("Unable to create your workspace right now.");
    }

    workspace = createdWorkspace.data as Workspace;

    const member = await supabase.from("workspace_members").insert({
      role: "owner",
      user_id: user.id,
      workspace_id: workspace.id,
    });

    if (member.error) {
      if (isMissingRelationError(member.error, "workspace_members")) {
        return {
          role,
          subscription: null,
          supabase,
          workspace: buildLegacyWorkspace(user),
        };
      }

      console.error("[workspace:member:create]", member.error);
      throw new Error("Unable to add you to the workspace.");
    }
  }

  await supabase.from("sops").update({ workspace_id: workspace.id }).eq("user_id", user.id).is("workspace_id", null);

  let subscription = await getWorkspaceSubscription(workspace.id, supabase);
  if (!subscription) {
    const createdSubscription = await supabase
      .from("workspace_subscriptions")
      .insert({
        plan_id: "free",
        workspace_id: workspace.id,
        current_period_start: monthStart().toISOString(),
        current_period_end: monthEnd().toISOString(),
      })
      .select("*")
      .single();

    if (createdSubscription.error || !createdSubscription.data) {
      if (createdSubscription.error && isMissingRelationError(createdSubscription.error, "workspace_subscriptions")) {
        return {
          role,
          subscription: null,
          supabase,
          workspace,
        };
      }

      throw new Error("Unable to create the mock billing subscription.");
    }

    subscription = createdSubscription.data as WorkspaceSubscription;
  }

  await ensureCurrentInvoice(workspace.id, subscription.plan_id, supabase);

  return {
    role,
    subscription,
    supabase,
    workspace,
  };
}

export async function getWorkspaceSubscription(workspaceId: string, client?: TypedClient) {
  const supabase = await getClient(client);
  const { data, error } = await supabase
    .from("workspace_subscriptions")
    .select("*")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (isMissingRelationError(error, "workspace_subscriptions")) {
    return null;
  }

  if (error) {
    throw new Error("Unable to load billing state.");
  }

  return data as WorkspaceSubscription | null;
}

export async function ensureCurrentInvoice(workspaceId: string, planId: string, client?: TypedClient) {
  const supabase = await getClient(client);
  const number = invoiceNumber(workspaceId);
  const { data } = await supabase
    .from("invoices")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("invoice_number", number)
    .maybeSingle();

  if (data) {
    return;
  }

  const plans = await getPlans(supabase);
  const plan = plans.find((candidate) => candidate.id === planId) ?? getFallbackPlan(planId);

  const { error } = await supabase.from("invoices").insert({
    amount_due: plan.monthly_price,
    invoice_number: number,
    period_end: monthEnd().toISOString(),
    period_start: monthStart().toISOString(),
    plan_id: plan.id,
    status: "paid",
    workspace_id: workspaceId,
  });

  if (error && isMissingRelationError(error, "invoices")) {
    return;
  }
}

export async function changeWorkspacePlan(workspaceId: string, planId: string, client?: TypedClient) {
  const supabase = await getClient(client);
  const plans = await getPlans(supabase);
  const plan = plans.find((candidate) => candidate.id === planId);
  if (!plan) {
    throw new Error("That plan is not available.");
  }

  const { error } = await supabase
    .from("workspace_subscriptions")
    .update({
      current_period_end: monthEnd().toISOString(),
      current_period_start: monthStart().toISOString(),
      plan_id: plan.id,
      status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("workspace_id", workspaceId);

  if (error) {
    if (isMissingRelationError(error, "workspace_subscriptions")) {
      return;
    }

    throw new Error("Unable to update the mock plan.");
  }

  await ensureCurrentInvoice(workspaceId, plan.id, supabase);
}

export async function getWorkspaceUsage(workspaceId: string, client?: TypedClient) {
  const supabase = await getClient(client);
  const from = monthStart().toISOString();

  const [sops, agentRuns, events] = await Promise.all([
    supabase.from("sops").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId),
    supabase
      .from("usage_events")
      .select("quantity")
      .eq("workspace_id", workspaceId)
      .eq("event_type", "agent_run")
      .gte("created_at", from),
    supabase
      .from("usage_events")
      .select("*")
      .eq("workspace_id", workspaceId)
      .gte("created_at", from)
      .order("created_at", { ascending: false }),
  ]);

  if (
    isMissingRelationError(sops.error, "sops") ||
    isMissingRelationError(agentRuns.error, "usage_events") ||
    isMissingRelationError(events.error, "usage_events") ||
    sops.error?.code === "42703"
  ) {
    const legacySops = await supabase
      .from("sops")
      .select("id", { count: "exact", head: true })
      .eq("user_id", workspaceId);

    return {
      agentRunCount: 0,
      events: [],
      sopCount: legacySops.count ?? 0,
    };
  }

  const agentRunCount = (agentRuns.data ?? []).reduce((total, event) => total + (event.quantity ?? 1), 0);

  return {
    agentRunCount,
    events: events.data ?? [],
    sopCount: sops.count ?? 0,
  };
}

export async function recordUsageEvent(
  workspaceId: string,
  userId: string,
  eventType: Database["public"]["Tables"]["usage_events"]["Insert"]["event_type"],
  metadata: Database["public"]["Tables"]["usage_events"]["Insert"]["metadata"] = {},
  client?: TypedClient,
) {
  const supabase = await getClient(client);
  const { error } = await supabase.from("usage_events").insert({
    event_type: eventType,
    metadata,
    quantity: 1,
    user_id: userId,
    workspace_id: workspaceId,
  });

  if (isMissingRelationError(error, "usage_events")) {
    return;
  }
}

export async function getBillingOverview(workspaceId: string, client?: TypedClient) {
  const supabase = await getClient(client);
  const [plans, subscription, invoices, usage] = await Promise.all([
    getPlans(supabase),
    getWorkspaceSubscription(workspaceId, supabase),
    supabase.from("invoices").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }),
    getWorkspaceUsage(workspaceId, supabase),
  ]);

  const cookiePlanId = await readMockPlanOverride(workspaceId);
  const activePlanId = cookiePlanId ?? subscription?.plan_id;
  const activePlan = plans.find((plan) => plan.id === activePlanId) ?? getFallbackPlan(activePlanId);

  return {
    activePlan,
    invoices: (invoices.data ?? []) as Invoice[],
    plans,
    subscription,
    usage,
  };
}

export async function assertWithinPlanLimit(
  workspaceId: string,
  limitType: "sop" | "agent_run",
  client?: TypedClient,
) {
  const supabase = await getClient(client);
  const billing = await getBillingOverview(workspaceId, supabase);
  const limit = limitType === "sop" ? billing.activePlan.sop_limit : billing.activePlan.agent_run_limit;

  if (limit === null) {
    return;
  }

  const current = limitType === "sop" ? billing.usage.sopCount : billing.usage.agentRunCount;
  if (current >= limit) {
    throw new Error(
      `Your ${billing.activePlan.name} plan limit is reached. Upgrade the mock plan from Billing to continue.`,
    );
  }
}
