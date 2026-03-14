import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

export default function SopDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="eyebrow">Loading SOP</div>
        <p className="text-sm leading-6 text-muted">
          Opening the SOP content, metadata, and source files.
        </p>
      </div>
      <LoadingSkeleton className="h-44 rounded-[2rem]" />
      <LoadingSkeleton className="h-[34rem] rounded-[2rem]" />
      <LoadingSkeleton className="h-44 rounded-[2rem]" />
    </div>
  );
}
