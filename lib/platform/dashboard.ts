import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Integration, SopHealthScore } from "@/lib/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { getAgentDashboard } from "./agents";
import { getBillingOverview } from "./workspace";
import { isMissingRelationError } from "./workspace";

type TypedClient = SupabaseClient<Database>;

async function getClient(client?: TypedClient) {
  return client ?? createServerSupabaseClient();
}

export async function getCommandCenterData(workspaceId: string, client?: TypedClient) {
  const supabase = await getClient(client);
  const [billing, agents, healthScores, integrations] = await Promise.all([
    getBillingOverview(workspaceId, supabase),
    getAgentDashboard(workspaceId, supabase),
    supabase.from("sop_health_scores").select("*").eq("workspace_id", workspaceId),
    supabase.from("integrations").select("*").eq("workspace_id", workspaceId),
  ]);

  if (
    isMissingRelationError(healthScores.error, "sop_health_scores") ||
    isMissingRelationError(integrations.error, "integrations")
  ) {
    return {
      agents,
      averageHealth: 0,
      billing,
      connectedIntegrations: 0,
      healthScores: [],
    };
  }

  const scores = (healthScores.data ?? []) as SopHealthScore[];
  const averageHealth =
    scores.length === 0 ? 0 : Math.round(scores.reduce((total, item) => total + item.score, 0) / scores.length);

  return {
    agents,
    averageHealth,
    billing,
    connectedIntegrations: ((integrations.data ?? []) as Integration[]).filter(
      (item) => item.status === "mock_connected",
    ).length,
    healthScores: scores,
  };
}
