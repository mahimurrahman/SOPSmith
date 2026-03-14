import Link from "next/link";

export default function SopNotFound() {
  return (
    <div className="surface-card rounded-[2rem] px-6 py-10 text-center">
      <div className="eyebrow">SOP not found</div>
      <h1 className="heading-display mt-3 text-3xl font-semibold tracking-tight text-foreground">
        This SOP is missing or belongs to a different account.
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted">
        It may have been deleted, the link may be outdated, or you may be signed in with
        a different account.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/dashboard" className="primary-button">
          Return to library
        </Link>
        <Link href="/dashboard/new" className="secondary-button">
          Create a new SOP
        </Link>
      </div>
    </div>
  );
}
