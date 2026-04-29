import type { Metadata } from "next";
import Link from "next/link";

import { getOptionalUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "SOPSmith",
  description:
    "Turn rough process notes into clean SOPs your team can use the same day.",
};

export default async function HomePage() {
  const user = await getOptionalUser();
  const primaryHref = user ? "/dashboard" : "/login";
  const primaryLabel = user ? "Open your library" : "Start generating SOPs";

  return (
    <div className="relative flex min-h-screen flex-col bg-background-light dark:bg-background-dark text-foreground">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-lg">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight font-display text-foreground">SOPSmith</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/pricing"
              className="hidden text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              Pricing
            </Link>
            <Link
              href={primaryHref}
              className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all"
            >
              Open App
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section — Full Viewport */}
        <section className="relative min-h-[85vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/8 dark:bg-primary/5 rounded-full blur-[120px]" />
          </div>
          <div className="container mx-auto px-6 py-24 max-w-4xl">
            <div className="flex flex-col gap-8 items-center text-center">
              <h1
                className="text-6xl sm:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight font-display"
                style={{ textWrap: "balance" } as React.CSSProperties}
              >
                Turn rough notes<br />
                into <em className="text-primary">agentic SOPs</em><br />
                agencies can run.
              </h1>
              <p className="text-lg sm:text-xl text-muted max-w-xl leading-relaxed">
                Paste messy client delivery notes. SOPSmith shapes them into structured SOPs,
                audits quality, logs agent work, and keeps approvals under your control.
              </p>
              <Link
                href={primaryHref}
                className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl text-base font-bold transition-all shadow-lg shadow-primary/20 inline-flex items-center gap-3"
              >
                {primaryLabel}
                <span className="material-symbols-outlined text-lg">arrow_right_alt</span>
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works — 3 Columns */}
        <section className="py-28 border-y border-[var(--border)]">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="text-center mb-16">
              <span className="text-primary font-mono text-xs font-medium uppercase tracking-[0.2em] block mb-3">How it works</span>
              <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight">Three steps. One result.</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-12 md:gap-8">
              {[
                {
                  num: "01",
                  title: "Write your notes",
                  body: "Paste the bullets, reminders, and messy handoff steps you already have. No polished writing required.",
                },
                {
                  num: "02",
                  title: "Generate the SOP",
                  body: "SOPSmith structures your notes into a clean procedure with purpose, scope, steps, checks, and a checklist.",
                },
                {
                  num: "03",
                  title: "Use & share",
                  body: "Copy the SOP, download it as TXT or PDF, or share the link. Your team can follow it the same day.",
                },
              ].map((step) => (
                <div key={step.num} className="flex flex-col gap-4">
                  <span className="text-primary font-mono text-4xl font-bold opacity-30">{step.num}</span>
                  <h3 className="text-xl font-bold font-display tracking-tight">{step.title}</h3>
                  <p className="text-muted text-[15px] leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24">
          <div className="container mx-auto px-6 text-center max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight mb-6">
              Stop explaining the same process twice.
            </h2>
            <p className="text-muted text-lg mb-10 leading-relaxed">
              Write it once. Let SOPSmith turn it into something your team can use.
            </p>
            <Link
              href={primaryHref}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl text-base font-bold transition-all shadow-lg shadow-primary/20 inline-flex items-center gap-3"
            >
              {primaryLabel}
              <span className="material-symbols-outlined text-lg">arrow_right_alt</span>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <span className="text-sm font-display font-semibold text-muted-foreground">SOPSmith</span>
          <span className="text-xs text-muted-foreground">© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
