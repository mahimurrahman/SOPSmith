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
    <Grid as="section" className="lg:grid-cols-[0.92fr_1.08fr]" gap="md">
      <Card className="space-y-5 rounded-[2rem] px-6 py-6">
        <div className="space-y-3">
          <div className="eyebrow">Generate SOP</div>
          <h1 className="text-h1 font-semibold tracking-tight text-foreground">
            Turn rough process notes and source files into a polished SOP draft.
          </h1>
          <p className="section-copy">
            Add a strong title and the rough notes you already have. The better your source
            notes capture the real workflow, the more usable the SOP will be on the first pass.
          </p>
        </div>

        <Card className="rounded-[1.5rem] px-5 py-5">
          <p className="text-sm font-semibold text-foreground">Include these details when you can</p>
          <ul className="mt-3 space-y-3 text-sm leading-6 text-muted">
            <li>The trigger or start point that kicks off the process</li>
            <li>The owner or role responsible for doing the work</li>
            <li>Key steps, tools used, and the expected output</li>
            <li>Approvals, quality checks, and what counts as done</li>
            <li>Edge cases, blockers, delays, or escalation paths</li>
          </ul>
        </Card>

        <Card className="rounded-[1.5rem] px-5 py-5">
          <p className="text-sm font-semibold text-foreground">Optional file uploads</p>
          <ul className="mt-3 space-y-3 text-sm leading-6 text-muted">
            <li>Attach PDFs, DOC or DOCX files, and TXT notes after the SOP draft is created</li>
            <li>Keep source material with the SOP so anyone opening it can trust the context</li>
            <li>Use uploads for handoff docs, QA checklists, brief notes, and working instructions</li>
          </ul>
        </Card>

        <Card tone="muted" className="rounded-[1.5rem] px-5 py-5 text-sm leading-6 text-muted">
          Keep the notes messy if you want. SOPSmith is designed to clean up real-world
          scraps like bullets, half sentences, handoff notes, and operational reminders.
        </Card>
      </Card>

      <Card className="rounded-[2rem] px-6 py-6">
        <CreateSopForm />
      </Card>
    </Grid>
  );
}
