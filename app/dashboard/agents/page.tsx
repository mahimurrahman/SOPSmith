import type { Metadata } from "next";

import { requireUser } from "@/lib/auth";
import { ensureWorkspaceContext, getAgentDashboard } from "@/lib/platform";

export const metadata: Metadata = {
  title: "Agents",
  description: "Agent runs and execution logs.",
};

export default async function AgentsPage() {
  const { supabase, user } = await requireUser();
  const { workspace } = await ensureWorkspaceContext(user, supabase);
  const data = await getAgentDashboard(workspace.id, supabase);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-black tracking-tight font-display">Agents</h1>
        <p className="mt-3 text-sm text-muted">Every run has a status, tool steps, and an approval trail.</p>
      </header>

      <section className="grid gap-6 xl:grid-cols-2">
        {data.runs.map((run) => (
          <article key={run.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-bold">{run.title}</h2>
                <p className="mt-1 text-xs uppercase tracking-wide text-muted">{run.agent_type.replace(/_/g, " ")}</p>
              </div>
              <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-bold uppercase">
                {run.status.replace(/_/g, " ")}
              </span>
            </div>
            {run.summary ? <p className="mt-4 text-sm leading-6 text-muted">{run.summary}</p> : null}
            <div className="mt-5 space-y-2">
              {data.steps
                .filter((step) => step.run_id === run.id)
                .map((step) => (
                  <div key={step.id} className="rounded-lg bg-[var(--surface-muted)] p-3 text-xs">
                    <p className="font-bold">{step.tool_name}</p>
                    <p className="mt-1 text-muted">{step.output_summary}</p>
                  </div>
                ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
