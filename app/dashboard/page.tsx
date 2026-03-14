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
    <>
      {/* Hero Header Section */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/60 rounded-2xl p-10 shadow-sm relative overflow-hidden mb-12">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white leading-[1.1] font-display">Process Repository</h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400 text-lg font-medium">Standardize operational excellence across your organization with verified SOPs and workflow governance.</p>
            <div className="mt-8 flex flex-wrap gap-12">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-1">Authenticated SOPs</p>
                <p className="text-4xl font-extrabold text-primary tabular-nums">{sops.length}</p>
              </div>
              <div className="w-px h-12 bg-slate-200 dark:bg-slate-800 self-end mb-1"></div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-1">In Review</p>
                <p className="text-4xl font-extrabold text-slate-900 dark:text-white tabular-nums">0</p>
              </div>
            </div>
          </div>
          <Link href="/dashboard/new" className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-7 py-3.5 rounded-xl font-bold transition-all shadow-xl shadow-primary/25 self-start md:self-center">
            <span className="material-symbols-outlined font-bold">add</span>
            New Protocol
          </Link>
        </div>
      </div>

      {sops.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 text-center">
          <div className="mx-auto max-w-2xl">
            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-primary text-3xl">note_stack_add</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-3 font-display">
              Your library starts with one rough set of notes.
            </h2>
            <p className="text-base leading-relaxed text-slate-500 dark:text-slate-400 mb-8">
              Start with the workflow you explain most often. SOPSmith will turn the notes
              into a structured SOP, save it automatically, and keep any supporting files
              attached to the final draft.
            </p>
            <Link href="/dashboard/new" className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md">
              Create your first SOP
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {sops.map((sop) => (
            <Link
              key={sop.id}
              href={`/dashboard/${sop.id}`}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-7 rounded-2xl hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-[24px]">hub</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-extrabold uppercase tracking-widest shrink-0">Authenticated</span>
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-tight font-display line-clamp-2">{sop.title}</h3>
                <p className="mt-3 text-slate-500 dark:text-slate-400 text-[14px] leading-relaxed line-clamp-2 font-medium">{sop.preview}</p>
              </div>
              
              <div className="mt-6 pt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[16px]">history</span>
                  {formatDate(sop.created_at)}
                </div>
                <div className="flex items-center justify-center gap-1 text-primary text-xs font-bold opacity-0 transition-opacity group-hover:opacity-100 uppercase tracking-widest">
                  Open
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
