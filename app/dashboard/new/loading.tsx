export default function NewSopLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="eyebrow">Loading new SOP</div>
        <p className="text-sm leading-6 text-muted">
          Preparing the form and source-note guidance.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="h-80 animate-pulse rounded-[2rem] skeleton-block" />
        <div className="h-[32rem] animate-pulse rounded-[2rem] skeleton-block" />
      </div>
    </div>
  );
}
