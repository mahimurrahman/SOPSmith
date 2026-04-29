import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/auth";
import { ensureWorkspaceContext, formatLimit, getCommandCenterData } from "@/lib/platform";

export const metadata: Metadata = {
  title: "Command Center",
  description: "Agency ops overview for SOPSmith.",
};

function meter(value: number, limit: number | null) {
  if (limit === null) return 12;
  return Math.min(100, Math.round((value / Math.max(1, limit)) * 100));
}

export default async function CommandCenterPage() {
  const { supabase, user } = await requireUser();
  const { workspace } = await ensureWorkspaceContext(user, supabase);
  const data = await getCommandCenterData(workspace.id, supabase);
  const pendingApprovals = data.agents.approvals.filter((approval) => approval.status === "pending").length;
  const recentRuns = data.agents.runs.slice(0, 5);

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-primary">SOP Summit</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight font-display">Agency Ops Command Center</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Run SOP audits, manage approvals, monitor billing usage, and prepare Google actions without sending
            external data.
          </p>
        </div>
        <Link href="/dashboard/new" className="rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white">
          Create SOP
        </Link>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["SOPs", `${data.billing.usage.sopCount} / ${formatLimit(data.billing.activePlan.sop_limit)}`],
          ["Agent runs", `${data.billing.usage.agentRunCount} / ${formatLimit(data.billing.activePlan.agent_run_limit)}`],
          ["Avg. health", data.averageHealth ? `${data.averageHealth}%` : "No audits yet"],
          ["Approvals", `${pendingApprovals} pending`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <p className="text-xs font-mono uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
            <p className="mt-3 text-3xl font-black tracking-tight">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 xl:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Agent Activity</h2>
              <p className="text-sm text-muted">Latest autonomous work with approval-first status.</p>
            </div>
            <Link href="/dashboard/agents" className="text-sm font-bold text-primary">
              View all
            </Link>
          </div>
          <div className="mt-6 divide-y divide-[var(--border)]">
            {recentRuns.length === 0 ? (
              <p className="py-8 text-sm text-muted">No agent runs yet. Run an audit from any SOP detail page.</p>
            ) : (
              recentRuns.map((run) => (
                <div key={run.id} className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <p className="font-semibold">{run.title}</p>
                    <p className="text-xs uppercase tracking-wide text-muted">{run.agent_type.replace(/_/g, " ")}</p>
                  </div>
                  <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-bold uppercase">
                    {run.status.replace(/_/g, " ")}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="text-xl font-bold">Mock Billing</h2>
          <p className="mt-1 text-sm text-muted">Plan enforcement is real. Payment collection is disabled.</p>
          <div className="mt-6 space-y-5">
            <div>
              <div className="mb-2 flex justify-between text-xs font-bold uppercase">
                <span>SOP limit</span>
                <span>{meter(data.billing.usage.sopCount, data.billing.activePlan.sop_limit)}%</span>
              </div>
              <div className="h-2 rounded-full bg-black/10 dark:bg-white/10">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${meter(data.billing.usage.sopCount, data.billing.activePlan.sop_limit)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-2 flex justify-between text-xs font-bold uppercase">
                <span>Agent runs</span>
                <span>{meter(data.billing.usage.agentRunCount, data.billing.activePlan.agent_run_limit)}%</span>
              </div>
              <div className="h-2 rounded-full bg-black/10 dark:bg-white/10">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{
                    width: `${meter(data.billing.usage.agentRunCount, data.billing.activePlan.agent_run_limit)}%`,
                  }}
                />
              </div>
            </div>
            <Link href="/dashboard/billing" className="inline-flex text-sm font-bold text-primary">
              Manage plan
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
