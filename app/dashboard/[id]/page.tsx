import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AttachmentsSection } from "@/components/dashboard/attachments-section";
import { CopyButton } from "@/components/dashboard/copy-button";
import { DeleteSopButton } from "@/components/dashboard/delete-sop-button";
import { DownloadButtons } from "@/components/dashboard/download-buttons";
import { RegenerateButton } from "@/components/dashboard/regenerate-button";
import { SopContent } from "@/components/dashboard/sop-content";
import { Accordion } from "@/components/ui/Accordion";
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
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-12 lg:gap-16">
        <div className="lg:col-span-8">
          <header className="mb-12">
            <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-5">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                {formatDateTime(sop.created_at)}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6 font-display">
              {sop.title}
            </h1>

            <div className="flex items-center gap-3">
              <CopyButton content={sop.content} />
            </div>
          </header>

          <SopContent content={sop.content} title={sop.title} />
        </div>

        <aside className="lg:col-span-4">
          <div className="sticky top-10 space-y-8">
            {sop.raw_notes.trim() ? (
              <Accordion
                className="bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden"
                contentClassName="px-5 pb-5 pt-0"
                summaryClassName="w-full p-5 flex items-center justify-between text-left group transition-colors hover:bg-[var(--surface-muted)]"
                summary={
                  <span className="font-semibold flex items-center gap-3">
                    <span className="material-symbols-outlined text-muted">history_edu</span> Original Notes
                  </span>
                }
              >
                <div className="whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-muted max-h-96 overflow-y-auto">
                  {sop.raw_notes}
                </div>
              </Accordion>
            ) : null}

            <div className="space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-foreground px-1">Attachments</h3>
              <AttachmentsSection attachments={attachments} sopId={sop.id} />
            </div>

            <DownloadButtons sop={{ title: sop.title, content: sop.content }} />

            <RegenerateButton sopId={sop.id} />

            <DeleteSopButton sopId={sop.id} sopTitle={sop.title} />
          </div>
        </aside>
      </div>
    </div>
  );
}
