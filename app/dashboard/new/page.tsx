import type { Metadata } from "next";

import { CreateSopForm } from "@/components/dashboard/create-sop-form";

export const metadata: Metadata = {
  title: "New SOP",
  description: "Create a practical SOP from rough operational notes.",
};

export default function NewSopPage() {
  return (
    <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
      <div className="space-y-5 rounded-[2rem] border border-white/8 bg-white/4 px-6 py-6">
        <div className="space-y-3">
          <div className="eyebrow">Generate SOP</div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">
            Turn rough process notes into a polished SOP draft.
          </h1>
          <p className="text-base leading-7 text-muted">
            Add a clear title and the raw notes you already have. Include tools, inputs,
            responsibilities, and edge cases if they matter to the workflow.
          </p>
        </div>

        <div className="surface-card rounded-[1.5rem] px-5 py-5">
          <p className="text-sm font-semibold text-foreground">Good source notes include</p>
          <ul className="mt-3 space-y-3 text-sm leading-6 text-muted">
            <li>Hand-off steps, approvals, and key ownership details</li>
            <li>Tools used, required inputs, and expected output</li>
            <li>Edge cases, delays, and quality checks that matter in practice</li>
          </ul>
        </div>

        <div className="muted-panel rounded-[1.5rem] px-5 py-5 text-sm leading-6 text-muted">
          Generation stays intentionally lightweight. You will get one structured SOP,
          it will save automatically, and then open in your library.
        </div>
      </div>

      <div className="surface-card rounded-[2rem] px-6 py-6">
        <CreateSopForm />
      </div>
    </section>
  );
}
