import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/format";
import type { SopSummary } from "@/lib/sops/types";

type SopCardProps = {
  sop: SopSummary;
};

export function SopCard({ sop }: SopCardProps) {
  return (
    <Link
      href={`/dashboard/${sop.id}`}
      aria-label={`Open SOP ${sop.title}`}
      className="group block focus-visible:outline-none"
    >
      <Card className="h-full rounded-[1.75rem] px-5 py-5 transition-transform duration-200 group-hover:-translate-y-1 group-focus-visible:-translate-y-1">
        <div className="flex h-full flex-col justify-between gap-5">
          <div className="space-y-3">
            <Badge className="w-fit">Saved SOP</Badge>
            <div className="space-y-2">
              <h2 className="heading-display line-clamp-2 text-xl font-semibold tracking-tight text-foreground">
                {sop.title}
              </h2>
              <p className="line-clamp-2 text-sm leading-6 text-muted">{sop.preview}</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 text-sm">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                Created
              </p>
              <p className="mt-1 text-foreground/88">{formatDate(sop.created_at)}</p>
            </div>
            <span className="text-sm font-semibold text-accent transition-transform duration-200 group-hover:translate-x-1 group-focus-visible:translate-x-1">
              Open
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
