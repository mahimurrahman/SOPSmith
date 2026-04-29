import type { Metadata } from "next";

import { GoogleConnectionForm, GoogleMockActionForm } from "@/components/dashboard/google-actions";
import { requireUser } from "@/lib/auth";
import { ensureWorkspaceContext, getIntegrationDashboard } from "@/lib/platform";

export const metadata: Metadata = {
  title: "Integrations",
  description: "Mock-ready Google integrations for SOPSmith.",
};

export default async function IntegrationsPage() {
  const { supabase, user } = await requireUser();
  const { workspace } = await ensureWorkspaceContext(user, supabase);
  const data = await getIntegrationDashboard(workspace.id, supabase);
  const connected = data.integration?.status === "mock_connected";

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-black tracking-tight font-display">Integrations</h1>
        <p className="mt-3 text-sm text-muted">
          Google is mock-ready: actions create logs and approvals, but no external API is called.
        </p>
      </header>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-wide text-primary">Google Workspace</p>
            <h2 className="mt-2 text-2xl font-bold">{connected ? "Mock connected" : "Not connected"}</h2>
            <p className="mt-2 max-w-xl text-sm text-muted">
              Drive export, Docs sync, and Gmail drafts are simulated inside SOPSmith until real OAuth credentials are
              added.
            </p>
          </div>
          <GoogleConnectionForm connected={connected} />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <GoogleMockActionForm actionType="drive_export" disabled={!connected} label="Draft Drive export" />
          <GoogleMockActionForm actionType="docs_sync" disabled={!connected} label="Draft Docs sync" />
          <GoogleMockActionForm actionType="gmail_draft" disabled={!connected} label="Draft Gmail handoff" />
        </div>
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="text-xl font-bold">Action Log</h2>
        <div className="mt-5 divide-y divide-[var(--border)]">
          {data.actions.length === 0 ? (
            <p className="py-8 text-sm text-muted">No Google actions drafted yet.</p>
          ) : (
            data.actions.map((action) => (
              <div key={action.id} className="grid gap-2 py-4 text-sm md:grid-cols-4">
                <span className="font-bold">{action.action_type.replace(/_/g, " ")}</span>
                <span>{action.destination}</span>
                <span className="uppercase">{action.status}</span>
                <span className="text-muted">{new Date(action.created_at).toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
