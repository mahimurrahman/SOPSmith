import Link from "next/link";

import { CopyButton } from "@/components/dashboard/copy-button";
import { SopContent } from "@/components/dashboard/sop-content";
import { AttachmentList } from "@/components/sops/AttachmentList";
import { Accordion } from "@/components/ui/Accordion";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatDateTime } from "@/lib/format";
import type { SopFileSummary } from "@/lib/attachments/types";
import type { SopDetail as SopDetailType } from "@/lib/sops/types";

type SopDetailProps = {
  attachments: SopFileSummary[];
  sop: SopDetailType;
};

export function SopDetail({ attachments, sop }: SopDetailProps) {
  return (
    <section className="space-y-6">
      <div className="sticky top-24 z-20">
        <Card className="rounded-[2rem] px-6 py-5">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/dashboard" className="secondary-button">
                  Back to library
                </Link>
                <Badge className="w-fit">Saved SOP</Badge>
              </div>

              <div className="space-y-2">
                <h1 className="heading-display max-w-4xl text-h1 font-semibold tracking-tight text-foreground">
                  {sop.title}
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-muted">
                  Structured plain-text SOP generated from your rough notes, with preserved spacing and source attachments kept alongside the final draft.
                </p>
              </div>

              <div className="flex flex-col gap-3 text-sm text-muted sm:flex-row sm:flex-wrap">
                <div className="rounded-full border border-border bg-surface-muted px-4 py-2">
                  Created {formatDateTime(sop.created_at)}
                </div>
                <div className="rounded-full border border-border bg-surface-muted px-4 py-2">
                  Updated {formatDateTime(sop.updated_at)}
                </div>
              </div>
            </div>

            <CopyButton content={sop.content} />
          </div>
        </Card>
      </div>

      <Card as="article" className="rounded-[2rem] px-6 py-7 sm:px-8 sm:py-8">
        <div className="border-b border-border pb-5">
          <Badge className="w-fit">Generated SOP</Badge>
          <p className="mt-3 text-sm leading-6 text-muted">
            The output stays in plain text so it is easy to review, copy, and reuse across your existing tools.
          </p>
        </div>
        <div className="mt-7">
          <SopContent content={sop.content} title={sop.title} />
        </div>
      </Card>

      <Card className="rounded-[2rem] px-6 py-6">
        <AttachmentList attachments={attachments} sopId={sop.id} />
      </Card>

      {sop.raw_notes.trim() ? (
        <Accordion
          className="surface-card rounded-[2rem]"
          contentClassName="px-6 pb-6 pt-0"
          summaryClassName="px-6 py-5 text-sm font-semibold"
          summary="Original notes"
        >
          <pre className="mt-4 whitespace-pre-wrap font-mono text-sm leading-7 text-muted">
            {sop.raw_notes}
          </pre>
        </Accordion>
      ) : null}
    </section>
  );
}
