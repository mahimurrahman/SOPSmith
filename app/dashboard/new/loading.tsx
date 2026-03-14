import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

export default function NewSopLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="eyebrow">Loading new SOP</div>
        <p className="text-sm leading-6 text-muted">
          Preparing the guided form, note prompts, and upload area.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <LoadingSkeleton className="h-[34rem] rounded-[2rem]" />
        <LoadingSkeleton className="h-[42rem] rounded-[2rem]" />
      </div>
    </div>
  );
}
