import type { Metadata } from "next";

import { PlanChangeForm } from "@/components/dashboard/plan-change-form";
import { requireUser } from "@/lib/auth";
import { ensureWorkspaceContext, formatLimit, formatMoney, getBillingOverview } from "@/lib/platform";

export const metadata: Metadata = {
  title: "Billing",
  description: "Mock billing and usage limits for SOPSmith.",
};

export default async function BillingPage() {
  const { supabase, user } = await requireUser();
  const { workspace } = await ensureWorkspaceContext(user, supabase);
  const billing = await getBillingOverview(workspace.id, supabase);

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-black tracking-tight font-display">Billing</h1>
        <p className="mt-3 text-sm text-muted">
          Mock billing is active. Plans enforce limits, invoices are simulated, and no payment method is collected.
        </p>
      </header>

      <section className="grid gap-5 lg:grid-cols-4">
        {billing.plans.map((plan) => {
          const active = plan.id === billing.activePlan.id;
          return (
            <div
              key={plan.id}
              className={`rounded-xl border p-6 ${
                active ? "border-primary bg-primary/5" : "border-[var(--border)] bg-[var(--surface)]"
              }`}
            >
              <h2 className="text-xl font-bold">{plan.name}</h2>
              <p className="mt-3 text-3xl font-black">
                {formatMoney(plan.monthly_price)}
                <span className="text-sm font-medium text-muted">/mo</span>
              </p>
              <ul className="mt-5 space-y-2 text-sm text-muted">
                <li>{formatLimit(plan.sop_limit)} SOPs</li>
                <li>{formatLimit(plan.agent_run_limit)} agent runs/month</li>
                <li>Approval-first agent logs</li>
              </ul>
              <div className="mt-6">
                <PlanChangeForm active={active} planId={plan.id} />
              </div>
            </div>
          );
        })}
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="text-xl font-bold">Usage This Month</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-[var(--surface-muted)] p-5">
            <p className="text-xs font-mono uppercase tracking-wide text-muted">SOPs</p>
            <p className="mt-2 text-2xl font-black">
              {billing.usage.sopCount} / {formatLimit(billing.activePlan.sop_limit)}
            </p>
          </div>
          <div className="rounded-lg bg-[var(--surface-muted)] p-5">
            <p className="text-xs font-mono uppercase tracking-wide text-muted">Agent runs</p>
            <p className="mt-2 text-2xl font-black">
              {billing.usage.agentRunCount} / {formatLimit(billing.activePlan.agent_run_limit)}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="text-xl font-bold">Mock Invoices</h2>
        <div className="mt-5 divide-y divide-[var(--border)]">
          {billing.invoices.map((invoice) => (
            <div key={invoice.id} className="grid gap-3 py-4 text-sm md:grid-cols-4">
              <span className="font-mono">{invoice.invoice_number}</span>
              <span>{invoice.plan_id}</span>
              <span>{formatMoney(invoice.amount_due)}</span>
              <span className="font-bold uppercase text-emerald-600">{invoice.status}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
