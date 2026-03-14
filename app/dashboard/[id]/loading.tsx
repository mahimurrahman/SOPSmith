export default function SopDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="eyebrow">Loading SOP</div>
        <p className="text-sm leading-6 text-muted">
          Opening the SOP content and preparing the copy view.
        </p>
      </div>
      <div className="h-40 animate-pulse rounded-[2rem] skeleton-block" />
      <div className="h-[36rem] animate-pulse rounded-[2rem] skeleton-block" />
    </div>
  );
}
