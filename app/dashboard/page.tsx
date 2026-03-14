import type { Metadata } from "next";
import Link from "next/link";

import { getButtonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Grid } from "@/components/ui/Grid";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { listUserSops } from "@/lib/sops";

export const metadata: Metadata = {
  title: "Library",
  description: "View and manage your saved SOP library.",
};

export default async function DashboardPage() {
  const { supabase, user } = await requireUser();
  const sops = await listUserSops(user.id, supabase);

  return (
    <section className="space-y-6">
      <Card className="rounded-[2rem] px-6 py-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="eyebrow">SOP library</div>
            <h1 className="max-w-3xl text-h1 font-semibold tracking-tight text-foreground">
              Keep every operating procedure close, searchable, and ready to reuse.
            </h1>
            <p className="section-copy">
              Open any SOP in one click, review the original notes or attached files, and
              copy the final procedure anywhere you need it.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-full border border-border bg-surface-muted px-4 py-2 text-sm text-muted">
              {sops.length} {sops.length === 1 ? "saved SOP" : "saved SOPs"}
            </div>
            <Link href="/dashboard/new" className={getButtonClasses({})}>
              Create a new SOP
            </Link>
          </div>
        </div>
      </Card>

      {sops.length === 0 ? (
        <Card as="section" className="rounded-[2rem] px-6 py-12 text-center">
          <div className="mx-auto max-w-2xl">
            <div className="eyebrow">No SOPs yet</div>
            <h2 className="mt-4 text-h2 font-semibold tracking-tight text-foreground">
              Your library starts with one rough set of notes.
            </h2>
            <p className="mt-4 text-base leading-7 text-muted">
              Start with the workflow you explain most often. SOPSmith will turn the notes
              into a structured SOP, save it automatically, and keep any supporting files
              attached to the final draft.
            </p>
            <Card className="mt-6 rounded-[1.5rem] px-5 py-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Example note snippet
              </p>
              <pre className="mt-3 whitespace-pre-wrap font-mono text-xs leading-6 text-muted">
                kickoff after contract is signed
                owner = ops lead
                use hubspot + drive
                create workspace, assign delivery owner, send kickoff options
                check links and client contact before closing setup
              </pre>
            </Card>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/dashboard/new" className={getButtonClasses({})}>
                Create your first SOP
              </Link>
              <div className={getButtonClasses({ className: "cursor-default", variant: "secondary" })}>
                Rough notes are enough to start
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Grid gap="sm" role="list" aria-label="Saved SOPs">
          {sops.map((sop) => (
            <Link
              key={sop.id}
              href={`/dashboard/${sop.id}`}
              aria-label={`Open SOP ${sop.title}`}
              className="surface-card group rounded-[1.5rem] px-5 py-4 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-2">
                  <h2 className="truncate text-lg font-semibold tracking-tight text-foreground">
                    {sop.title}
                  </h2>
                  <p className="truncate text-sm leading-6 text-muted">{sop.preview}</p>
                </div>

                <div className="shrink-0 text-sm text-muted sm:text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                    Created
                  </p>
                  <p className="mt-1 text-sm text-foreground/85">
                    {formatDate(sop.created_at)}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-accent opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    Open SOP
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </Grid>
      )}
    </section>
  );
}
