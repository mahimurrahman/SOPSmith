import type { Metadata } from "next";
import Link from "next/link";

import { SopLibrary } from "@/components/dashboard/sop-library";
import { requireUser } from "@/lib/auth";
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-display">Your Library</h1>
          <p className="mt-1 text-muted text-sm">
            {sops.length} {sops.length === 1 ? "SOP" : "SOPs"} saved
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm self-start sm:self-center"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New SOP
        </Link>
      </div>

      {sops.length === 0 ? (
        <div className="border border-dashed border-[var(--border)] rounded-2xl p-14 text-center">
          <div className="mx-auto max-w-md">
            <span className="material-symbols-outlined text-muted text-4xl mb-4 block">note_stack_add</span>
            <h2 className="text-xl font-bold tracking-tight font-display mb-2">
              Your library starts with one rough set of notes.
            </h2>
            <p className="text-sm text-muted leading-relaxed mb-6">
              Start with the workflow you explain most often. SOPSmith will turn the
              notes into a structured SOP and save it here.
            </p>
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all"
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
