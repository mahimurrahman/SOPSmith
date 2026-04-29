import type { Metadata } from "next";
import Link from "next/link";

import { formatLimit, formatMoney, PLAN_CATALOG } from "@/lib/platform";

export const metadata: Metadata = {
  title: "Pricing",
  description: "SOPSmith mock billing plans for agency ops teams.",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-background-light px-6 py-16 text-foreground dark:bg-background-dark">
      <div className="mx-auto max-w-6xl space-y-12">
        <header className="max-w-3xl">
          <Link href="/" className="text-sm font-bold text-primary">
            SOPSmith
          </Link>
          <h1 className="mt-6 text-5xl font-black tracking-tight font-display">Pricing that is ready before Stripe is.</h1>
          <p className="mt-5 text-lg leading-8 text-muted">
            Use mock billing to sell demos, enforce real limits, and upgrade agency workspaces without collecting cards.
          </p>
        </header>

        <section className="grid gap-5 lg:grid-cols-4">
          {PLAN_CATALOG.map((plan) => (
            <div key={plan.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <h2 className="text-xl font-bold">{plan.name}</h2>
              <p className="mt-3 text-3xl font-black">
                {formatMoney(plan.monthly_price)}
                <span className="text-sm text-muted">/mo</span>
              </p>
              <ul className="mt-5 space-y-2 text-sm text-muted">
                <li>{formatLimit(plan.sop_limit)} SOPs</li>
                <li>{formatLimit(plan.agent_run_limit)} agent runs/month</li>
                <li>Approval-first agent execution</li>
              </ul>
            </div>
          ))}
        </section>

        <Link href="/login" className="inline-flex rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white">
          Open mock billing
        </Link>
      </div>
    </main>
  );
}
