import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { listUserSops } from "@/lib/sops";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View and manage your saved SOP library.",
};

export default async function DashboardPage() {
  const { supabase, user } = await requireUser();
  const sops = await listUserSops(user.id, supabase);

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-white/8 bg-white/4 px-6 py-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="eyebrow">SOP library</div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground">
              Keep your operating procedures organized and ready to reuse.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted">
              Open any SOP in one click, copy the final text when you need it, and keep
              the most important processes close at hand.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-full border border-white/8 bg-white/4 px-4 py-2 text-sm text-muted">
              {sops.length} {sops.length === 1 ? "saved SOP" : "saved SOPs"}
            </div>
            <Link href="/dashboard/new" className="primary-button">
              Create a new SOP
            </Link>
          </div>
        </div>
      </div>

      {sops.length === 0 ? (
        <section className="surface-card rounded-[2rem] px-6 py-12 text-center">
          <div className="mx-auto max-w-2xl">
            <div className="eyebrow">No SOPs yet</div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
              Create your first SOP and start building your operating library.
            </h2>
            <p className="mt-4 text-base leading-7 text-muted">
              Start with a title and rough notes. SOPSmith will generate a structured SOP,
              save it automatically, and open it for review.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/dashboard/new" className="primary-button">
                Create your first SOP
              </Link>
              <div className="secondary-button cursor-default">Takes a few seconds</div>
            </div>
          </div>
        </section>
      ) : (
        <div className="grid gap-4">
          {sops.map((sop, index) => (
            <Link
              key={sop.id}
              href={`/dashboard/${sop.id}`}
              className="surface-card rounded-[1.75rem] px-5 py-5 hover:-translate-y-0.5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
                    SOP {String(index + 1).padStart(2, "0")}
                  </p>
                  <h2 className="text-xl font-semibold tracking-tight text-foreground">
                    {sop.title}
                  </h2>
                </div>

                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <span className="rounded-full border border-white/8 bg-white/4 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-muted">
                    {formatDate(sop.created_at)}
                  </span>
                  <span className="text-sm font-medium text-accent">Open SOP</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
