import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="page-shell flex min-h-screen items-center justify-center px-6 py-10">
      <div className="surface-card w-full max-w-2xl rounded-[2rem] px-7 py-10">
        <div className="eyebrow">404</div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">
          This page does not exist in SOPSmith.
        </h1>
        <p className="mt-4 text-base leading-7 text-muted">
          Head back home, or return to your dashboard if you were looking for a saved SOP.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="primary-button text-center">
            Go home
          </Link>
          <Link href="/dashboard" className="secondary-button text-center">
            Open dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
