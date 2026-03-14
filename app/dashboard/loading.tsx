export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="eyebrow">Loading library</div>
        <p className="text-sm leading-6 text-muted">
          Pulling your saved SOPs and preparing the dashboard.
        </p>
        <div className="h-40 animate-pulse rounded-[2rem] skeleton-block" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-[1.75rem] skeleton-block"
          />
        ))}
      </div>
    </div>
  );
}
