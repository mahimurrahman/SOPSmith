import type { Metadata } from "next";

import { CreateSopForm } from "@/components/dashboard/create-sop-form";
import { Card } from "@/components/ui/Card";
import { Grid } from "@/components/ui/Grid";

export const metadata: Metadata = {
  title: "New SOP",
  description: "Create a practical SOP from rough operational notes.",
};

export default function NewSopPage() {
  return (
    <>
      <div className="flex items-center gap-2 mb-10">
        <span className="mono-label text-slate-500">Workspace</span>
        <span className="material-symbols-outlined text-xs text-slate-600">chevron_right</span>
        <span className="mono-label text-slate-900 dark:text-slate-200">New Procedure</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-20">
        {/* Left Column: Guidance Panel (32%) */}
        <aside className="w-full lg:w-[32%] space-y-10">
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary/80">Documentation Standards</h3>
            <ul className="space-y-8">
              <li className="flex gap-5">
                <span className="material-symbols-outlined text-primary text-[20px] mt-1">account_tree</span>
                <div>
                  <p className="text-[15px] font-bold text-slate-900 dark:text-slate-100">Functional Decomposition</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-1">Detail granular sub-tasks to ensure cross-departmental consistency.</p>
                </div>
              </li>
              <li className="flex gap-5">
                <span className="material-symbols-outlined text-primary text-[20px] mt-1">engineering</span>
                <div>
                  <p className="text-[15px] font-bold text-slate-900 dark:text-slate-100">Resource Allocation</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-1">Specify required software environment and access tiering.</p>
                </div>
              </li>
              <li className="flex gap-5">
                <span className="material-symbols-outlined text-primary text-[20px] mt-1">verified_user</span>
                <div>
                  <p className="text-[15px] font-bold text-slate-900 dark:text-slate-100">Compliance Gates</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-1">Embed mandatory validation steps to meet ISO standards.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/60 shadow-sm">
            <span className="mono-label text-primary mb-3 block">Operational Tip</span>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed italic">"Optimal SOPs prioritize 'How' over 'What'. Use imperative verbs to maintain instructional clarity across the workflow."</p>
          </div>
        </aside>

        {/* Right Column: Form Area (68%) */}
        <section className="flex-1 space-y-12">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">Synthesize Process</h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Capture unstructured operational intelligence and transform it into enterprise-grade documentation.</p>
          </div>

          <CreateSopForm />
        </section>
      </div>
    </>
  );
}
