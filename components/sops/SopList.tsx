import Link from "next/link";

import { SopCard } from "@/components/sops/SopCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { Grid } from "@/components/ui/Grid";
import { getButtonClasses } from "@/components/ui/Button";
import type { SopSummary } from "@/lib/sops/types";

type SopListProps = {
  sops: SopSummary[];
};

export function SopList({ sops }: SopListProps) {
  if (sops.length === 0) {
    return (
      <EmptyState
        title="Your library starts with a rough handoff."
        description="Paste the notes you already have, generate the first SOP, and keep the original files attached so the workflow stays trustworthy."
        actionHref="/dashboard/new"
        actionLabel="Create your first SOP"
      >
        <Card className="mx-auto mt-3 max-w-xl rounded-[1.5rem] px-5 py-4 text-left">
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
      </EmptyState>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm leading-6 text-muted">
          Open any SOP to review the final text, original notes, and attached source files.
        </p>
        <Link href="/dashboard/new" className={getButtonClasses({ size: "sm", variant: "secondary" })}>
          New SOP
        </Link>
      </div>

      <Grid className="md:grid-cols-2 xl:grid-cols-3" gap="md" role="list" aria-label="Saved SOPs">
        {sops.map((sop) => (
          <SopCard key={sop.id} sop={sop} />
        ))}
      </Grid>
    </div>
  );
}
