import type { Metadata } from "next";

import { CreateSopForm } from "@/components/dashboard/create-sop-form";

export const metadata: Metadata = {
  title: "New SOP",
  description: "Create a practical SOP from rough operational notes.",
};

export default function NewSopPage() {
  return (
    <>
      <div className="flex items-center gap-2 mb-8">
        <span className="mono-label text-muted-foreground">Library</span>
        <span className="material-symbols-outlined text-xs text-muted-foreground">chevron_right</span>
        <span className="mono-label text-foreground">New SOP</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
        {/* Left Column: Guidance Panel */}
        <aside className="w-full lg:w-[32%] space-y-8">
          <div className="space-y-5">
            <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-primary">Tips for good notes</h3>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">edit_note</span>
                <div>
                  <p className="text-[15px] font-semibold">Write how you'd explain it</p>
                  <p className="text-sm text-muted leading-relaxed mt-1">Imagine you're walking a teammate through the process for the first time.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">checklist</span>
                <div>
                  <p className="text-[15px] font-semibold">Include the small steps</p>
                  <p className="text-sm text-muted leading-relaxed mt-1">The details people forget — which tool to open, who to notify, what to check — make the best SOPs.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">build</span>
                <div>
                  <p className="text-[15px] font-semibold">Mention tools and inputs</p>
                  <p className="text-sm text-muted leading-relaxed mt-1">Name the apps, documents, or contacts needed. SOPSmith will pull them into separate sections.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            <span className="mono-label text-primary mb-2 block">Quick tip</span>
            <p className="text-sm text-muted leading-relaxed italic">"Start with the workflow you explain most often. Rough bullets are fine — SOPSmith will structure them."</p>
          </div>
        </aside>

        {/* Right Column: Form Area */}
        <section className="flex-1 space-y-10">
          <div className="space-y-3">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight font-display">Turn your notes into a procedure.</h1>
            <p className="text-muted text-lg">Paste your rough notes and SOPSmith will generate a structured SOP.</p>
          </div>

          <CreateSopForm />
        </section>
      </div>
    </>
  );
}
