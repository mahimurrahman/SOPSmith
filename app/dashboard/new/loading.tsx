export default function NewSopLoading() {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="h-80 animate-pulse rounded-[2rem] skeleton-block" />
      <div className="h-[32rem] animate-pulse rounded-[2rem] skeleton-block" />
    </div>
  );
}
