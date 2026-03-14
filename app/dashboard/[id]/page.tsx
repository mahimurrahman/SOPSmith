import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CopyButton } from "@/components/dashboard/copy-button";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
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

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-white/8 bg-white/4 px-6 py-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Link href="/dashboard" className="inline-flex text-sm font-medium text-muted hover:text-foreground">
              Back to library
            </Link>
            <div className="space-y-2">
              <div className="eyebrow">Saved SOP</div>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground">
                {sop.title}
              </h1>
              <p className="text-sm leading-6 text-muted">Created {formatDate(sop.created_at)}</p>
            </div>
          </div>

          <CopyButton content={sop.content} />
        </div>
      </div>

      <article className="surface-card rounded-[2rem] px-6 py-7">
        <pre className="whitespace-pre-wrap font-sans text-[15px] leading-8 text-foreground sm:text-base">
          {sop.content}
        </pre>
      </article>
    </section>
  );
}
