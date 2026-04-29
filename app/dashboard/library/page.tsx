import type { Metadata } from "next";
import Link from "next/link";

import { SopLibrary } from "@/components/dashboard/sop-library";
import { requireUser } from "@/lib/auth";
import { ensureWorkspaceContext } from "@/lib/platform";
import { listUserSops } from "@/lib/sops";

export const metadata: Metadata = {
  title: "Library",
  description: "View and manage your saved SOP library.",
};

export default async function LibraryPage() {
  const { supabase, user } = await requireUser();
  const { workspace } = await ensureWorkspaceContext(user, supabase);
  const sops = await listUserSops(user.id, supabase, workspace.id);

  return (
    <>
      <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display sm:text-4xl">SOP Library</h1>
          <p className="mt-1 text-sm text-muted">
            {sops.length} {sops.length === 1 ? "SOP" : "SOPs"} saved for this agency workspace
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className="inline-flex items-center gap-2 self-start rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 sm:self-center"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New SOP
        </Link>
      </div>

      {sops.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] p-14 text-center">
          <div className="mx-auto max-w-md">
            <span className="material-symbols-outlined mb-4 block text-4xl text-muted">note_stack_add</span>
            <h2 className="mb-2 text-xl font-bold tracking-tight font-display">
              Your agency library starts with one repeatable delivery process.
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-muted">
              Start with the client handoff, onboarding, QA, or reporting process your team explains most often.
            </p>
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary/90"
            >
              Create your first SOP
            </Link>
          </div>
        </div>
      ) : (
        <SopLibrary sops={sops} />
      )}
    </>
  );
}
