"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createSopAction } from "@/app/dashboard/actions";
import type { CreateSopActionState } from "@/lib/types";

const initialState: CreateSopActionState = {
  status: "idle",
};

export function CreateSopForm() {
  const [state, formAction] = useActionState(createSopAction, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <div className="eyebrow">SOP details</div>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          Add the source material and generate.
        </h2>
        <p className="text-sm leading-6 text-muted">
          The title names the saved SOP. The notes should capture the real workflow in
          rough form, not polished prose.
        </p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-foreground">SOP title</span>
        <p className="text-sm leading-6 text-muted">
          Keep it specific so the library is easy to scan later.
        </p>
        <input
          required
          name="title"
          placeholder="Weekly client reporting process"
          className={`field-input ${state.fieldErrors?.title ? "border-rose-400 focus:border-rose-400 focus:shadow-none" : ""}`}
          aria-invalid={Boolean(state.fieldErrors?.title)}
          aria-describedby={state.fieldErrors?.title ? "title-error" : "title-help"}
        />
        {state.fieldErrors?.title ? (
          <p id="title-error" className="text-sm text-rose-300">
            {state.fieldErrors.title}
          </p>
        ) : (
          <p id="title-help" className="text-xs text-muted">
            Example titles: Client onboarding handoff or Weekly reporting QA review
          </p>
        )}
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-foreground">Rough notes</span>
        <p className="text-sm leading-6 text-muted">
          Paste bullets, process fragments, handoff notes, responsibilities, tools, or
          exceptions. More concrete notes produce better SOPs.
        </p>
        <textarea
          required
          name="rawNotes"
          rows={16}
          placeholder="Paste rough notes, bullets, handoff steps, approvals, tools, required inputs, edge cases, or checklist items..."
          className={`field-input resize-y ${state.fieldErrors?.rawNotes ? "border-rose-400 focus:border-rose-400 focus:shadow-none" : ""}`}
          aria-invalid={Boolean(state.fieldErrors?.rawNotes)}
          aria-describedby={state.fieldErrors?.rawNotes ? "raw-notes-error" : "raw-notes-help"}
        />
        {state.fieldErrors?.rawNotes ? (
          <p id="raw-notes-error" className="text-sm text-rose-300">
            {state.fieldErrors.rawNotes}
          </p>
        ) : (
          <p id="raw-notes-help" className="text-xs text-muted">
            Include edge cases like delays, missing inputs, or approval blockers when they matter.
          </p>
        )}
      </label>

      {state.message ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm leading-6 text-rose-200">
          {state.message}
        </div>
      ) : null}

      <div className="flex flex-col gap-4 border-t border-white/8 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-sm leading-6 text-muted">
          SOPSmith will generate the SOP, save it to your library, and open the finished
          page automatically.
        </p>
        <GenerateSopButton />
      </div>
    </form>
  );
}

function GenerateSopButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="primary-button min-w-52 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Generating and saving..." : "Generate SOP"}
    </button>
  );
}
