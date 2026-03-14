import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="eyebrow">Loading library</div>
        <p className="text-sm leading-6 text-muted">
          Pulling your saved SOPs and preparing the library.
        </p>
      </div>
      <LoadingSkeleton className="h-44 rounded-[2rem]" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <LoadingSkeleton key={index} className="h-56 rounded-[1.75rem]" />
        ))}
      </div>
    </div>
  );
}
