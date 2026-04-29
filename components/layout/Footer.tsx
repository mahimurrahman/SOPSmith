import Link from "next/link";

import { cn } from "@/lib/cn";

type FooterProps = {
  className?: string;
};

export function Footer({ className }: FooterProps) {
  return (
    <footer
      className={cn(
        "mt-14 border-t border-white/5 py-12 text-sm text-muted",
        className,
      )}
    >
      <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <span className="mono-label !text-[0.75rem] font-bold">SS</span>
            </div>
            <span className="heading-display text-lg font-black tracking-tight text-foreground">
              SOPSmith
            </span>
          </div>
          <p className="max-w-sm text-sm leading-7 text-muted">
            The focused operating system for turning rough process knowledge into structured SOPs and attached source context.
          </p>
        </div>

        <div>
          <h5 className="mono-label mb-4 text-muted">Platform</h5>
          <ul className="space-y-3">
            <li>
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-foreground">
                Library
              </Link>
            </li>
            <li>
              <Link href="/dashboard/new" className="hover:text-foreground">
                New SOP
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h5 className="mono-label mb-4 text-muted">Workflow</h5>
          <ul className="space-y-3">
            <li>Magic link + Google auth</li>
            <li>Groq SOP generation</li>
            <li>PDF, DOC, DOCX, TXT attachments</li>
          </ul>
        </div>
      </div>

      <div className="mt-10 border-t border-white/5 pt-6 text-[11px] uppercase tracking-[0.2em] text-muted">
        © 2026 SOPSmith. Rough notes in. Practical SOPs out.
      </div>
    </footer>
  );
}
