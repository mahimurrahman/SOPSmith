import Link from "next/link";

export default function SopNotFound() {
  return (
    <div className="surface-card rounded-[2rem] px-6 py-10">
      <div className="eyebrow">SOP not found</div>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
        That SOP does not exist or you do not have access to it.
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
        Head back to your library to open another SOP or generate a new one.
      </p>
      <Link href="/dashboard" className="primary-button mt-6">
        Return to library
      </Link>
    </div>
  );
}
