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
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-16 lg:gap-16">
        <div className="lg:col-span-8">
          <header className="mb-14">
            <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-6">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">calendar_today</span> 
                {formatDateTime(sop.created_at)}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
              <span className="flex items-center gap-1.5 text-primary">
                <span className="material-symbols-outlined text-[14px]">verified</span> 
                Active
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-8 font-display">
              {sop.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4">
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider rounded">SOP Document</span>
              <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded">High Priority</span>
              
              <div className="ml-auto shrink-0 flex items-center">
                 <CopyButton content={sop.content} />
              </div>
            </div>
          </header>
          
          <div className="space-y-16">
            <SopContent content={sop.content} title={sop.title} />
          </div>
        </div>

        <aside className="lg:col-span-4">
          <div className="sticky top-10 space-y-8">
            {sop.raw_notes.trim() ? (
              <Accordion
                className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
                contentClassName="px-5 pb-5 pt-0"
                summaryClassName="w-full p-5 flex items-center justify-between text-left group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                summary={
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400">history_edu</span> Historical Context
                  </span>
                }
              >
                <div className="whitespace-pre-wrap font-mono text-[12px] leading-relaxed font-medium text-slate-500 dark:text-slate-400 max-h-96 overflow-y-auto">
                  {sop.raw_notes}
                </div>
              </Accordion>
            ) : null}
            
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 px-1">Managed Assets</h3>
              <AttachmentsSection attachments={attachments} sopId={sop.id} />
            </div>

            <div className="p-8 bg-primary/5 rounded-2xl border border-primary/20 relative group overflow-hidden mt-8">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity"></div>
              <h4 className="font-extrabold text-primary text-sm mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">verified_user</span> Governance Audit
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 font-medium leading-relaxed">System-wide review log initialized. Ensure all operational checks align with global policies.</p>
              <button className="w-full py-3 bg-white dark:bg-slate-900 text-primary border border-primary/20 rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all duration-300 shadow-sm uppercase tracking-wide">
                View Compliance Form
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
