import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AttachmentsSection } from "@/components/dashboard/attachments-section";
import { CopyButton } from "@/components/dashboard/copy-button";
import { SopContent } from "@/components/dashboard/sop-content";
import { Accordion } from "@/components/ui/Accordion";
import { Card } from "@/components/ui/Card";
import { getButtonClasses } from "@/components/ui/Button";
import { listSopFiles, toSopFileSummary } from "@/lib/attachments";
import { requireUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { getSopById } from "@/lib/sops";
import { uuidSchema } from "@/lib/validators";

type SopDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "SOP Detail",
  description: "Read and copy a saved SOP.",
};

export default async function SopDetailPage({ params }: SopDetailPageProps) {
  const { id } = await params;

  if (!uuidSchema.safeParse(id).success) {
    notFound();
  }

  const { supabase, user } = await requireUser();
  const sop = await getSopById(id, user.id, supabase);

  if (!sop) {
    notFound();
  }

  const attachments = (await listSopFiles(sop.id, supabase)).map(toSopFileSummary);

  return (
    <section className="space-y-6">
      <div className="sticky top-6 z-10">
        <Card className="rounded-[2rem] px-6 py-5">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/dashboard"
                  className={getButtonClasses({ size: "sm", variant: "ghost" })}
                >
                  Back to library
                </Link>
                <div className="eyebrow">Saved SOP</div>
              </div>

              <div className="space-y-2">
                <h1 className="max-w-4xl text-h1 font-semibold tracking-tight text-foreground">
                  {sop.title}
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-muted">
                  Structured plain-text SOP with preserved spacing, original notes, and any
                  attached source files.
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

      <Card as="article" className="rounded-[2rem] px-6 py-7 sm:px-7 sm:py-8">
        <div className="border-b border-border pb-4">
          <p className="text-sm font-semibold text-foreground">Generated SOP</p>
          <p className="mt-1 text-sm leading-6 text-muted">
            Plain text output with preserved spacing and section hierarchy for easier review.
          </p>
        </div>
        <div className="mt-6">
          <SopContent content={sop.content} title={sop.title} />
        </div>
      </Card>

      <Card className="rounded-[2rem] px-6 py-6">
        <AttachmentsSection attachments={attachments} sopId={sop.id} />
      </Card>

      {sop.raw_notes.trim() ? (
        <Accordion
          className="surface-card rounded-[2rem]"
          contentClassName="px-6 pb-5 pt-0"
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
