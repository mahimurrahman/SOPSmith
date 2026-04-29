import type { Metadata } from "next";

import { ApprovalActions } from "@/components/dashboard/approval-actions";
import { requireUser } from "@/lib/auth";
import { ensureWorkspaceContext, getAgentDashboard } from "@/lib/platform";

export const metadata: Metadata = {
  title: "Approvals",
  description: "Approve or reject agent-suggested work.",
};

export default async function ApprovalsPage() {
  const { supabase, user } = await requireUser();
  const { workspace } = await ensureWorkspaceContext(user, supabase);
  const data = await getAgentDashboard(workspace.id, supabase);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-black tracking-tight font-display">Approval Queue</h1>
        <p className="mt-3 text-sm text-muted">
          Agents can draft changes and Google actions, but the user stays in control.
        </p>
      </header>

      <section className="space-y-5">
        {data.approvals.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border)] p-10 text-center text-sm text-muted">
            No approvals yet. Run an SOP audit or create a Google mock action.
          </div>
        ) : (
          data.approvals.map((approval) => (
            <article key={approval.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-mono uppercase tracking-wide text-primary">
                    {approval.approval_type.replace(/_/g, " ")} · {approval.status}
                  </p>
                  <h2 className="mt-2 text-xl font-bold">{approval.title}</h2>
                </div>
                <ApprovalActions approvalId={approval.id} disabled={approval.status !== "pending"} />
              </div>
              <pre className="mt-5 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-[var(--surface-muted)] p-4 text-xs leading-6 text-muted">
                {approval.preview}
              </pre>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
