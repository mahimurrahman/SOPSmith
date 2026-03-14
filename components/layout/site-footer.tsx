import Link from "next/link";

import { cn } from "@/lib/cn";

type SiteFooterProps = {
  className?: string;
};

export function SiteFooter({ className }: SiteFooterProps) {
  return (
    <footer
      className={cn(
        "mt-10 flex flex-col gap-4 border-t border-border/80 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div>
        <p className="font-semibold text-foreground">SOPSmith</p>
        <p className="mt-1">Rough notes in. Practical SOPs out.</p>
      </div>

      <nav aria-label="Footer" className="flex flex-wrap items-center gap-4">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <Link href="/dashboard" className="hover:text-foreground">
          Library
        </Link>
        <Link href="/dashboard/new" className="hover:text-foreground">
          New SOP
        </Link>
      </nav>
    </footer>
  );
}
