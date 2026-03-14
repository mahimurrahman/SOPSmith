export default function AppLoading() {
  return (
    <main className="page-shell flex min-h-screen items-center justify-center px-6 py-10">
      <div className="surface-card w-full max-w-2xl rounded-[2rem] px-7 py-10 text-center">
        <div className="eyebrow">Loading SOPSmith</div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">
          Preparing your session and workspace.
        </h1>
        <p className="mt-4 text-base leading-7 text-muted">
          Loading auth state, route protection, and the SOP content this page depends on.
        </p>
        <div className="mt-6 h-24 animate-pulse rounded-[1.5rem] skeleton-block" />
      </div>
    </main>
  );
}
