import type { Metadata } from "next";
import Link from "next/link";

import { getOptionalUser } from "@/lib/auth";

const featureCards = [
  {
    title: "Turn scraps into SOPs",
    body: "Paste rough notes, handoff bullets, or messy process fragments and shape them into something a teammate can run without guesswork.",
  },
  {
    title: "Keep every SOP usable",
    body: "Each SOP lands with a clear purpose, steps, checks, and checklist so work stays operational instead of theoretical.",
  },
  {
    title: "Build a lightweight library",
    body: "Save SOPs in one place, reopen them fast, and copy the final text anywhere your team already works.",
  },
];

const faqs = [
  {
    question: "Who is SOPSmith for?",
    answer:
      "SOPSmith is built for operators, agencies, and small teams that need clean process docs fast without setting up a heavy knowledge base.",
  },
  {
    question: "Do I need polished writing before generating?",
    answer:
      "No. Rough bullets, partial notes, and handoff details are enough. The app is designed to turn unfinished notes into a usable SOP draft.",
  },
  {
    question: "How are SOPs stored?",
    answer:
      "Each SOP is saved to your own Supabase-backed library and scoped to your signed-in account.",
  },
  {
    question: "Can I edit or export the SOP?",
    answer:
      "This MVP keeps things intentionally simple. You can open the SOP, copy the full text, and paste it into your docs or workflow tools.",
  },
  {
    question: "How long does generation take?",
    answer:
      "Most SOPs generate in a few seconds, depending on note length and current model response time.",
  },
];

const sampleSop = `# Client Onboarding Handoff

## Purpose
Move a newly signed client from sales to delivery with clear ownership and no missing setup.
Owner: Operations

## Scope
Use this after contract signature and before kickoff is booked.

## Tools Needed
- CRM
- Project tracker
- Shared inbox

## Inputs
- Signed agreement
- Client contacts
- Internal delivery owner

## Steps
1. Confirm the signed agreement and primary contacts (5-10 minutes).
2. Create the project workspace and assign the delivery owner.
3. Send kickoff options within one business day.

## Quality Checks
- Workspace includes the correct client name and owner.
- Kickoff options are sent to the right contact.

## Checklist
- [ ] Contract confirmed
- [ ] Workspace created
- [ ] Kickoff options sent

## Notes
If billing contacts are missing, pause kickoff scheduling and escalate internally.`;

export const metadata: Metadata = {
  title: "SOPSmith",
  description:
    "Turn rough process notes into clean SOPs your team can use the same day.",
};

export default async function HomePage() {
  const user = await getOptionalUser();
  const primaryHref = user ? "/dashboard" : "/login";
  const primaryLabel = user ? "Open your library" : "Start with a magic link";

  return (
    <main className="page-shell">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-6 sm:px-8 lg:px-10">
        <header className="surface-card flex items-center justify-between rounded-full px-4 py-3 sm:px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
            SOPSmith
          </Link>
          <nav className="flex items-center gap-3 text-sm text-muted">
            <Link href="/login" className="hover:text-foreground">
              Sign in
            </Link>
            <Link href={primaryHref} className="primary-button px-4 py-2 text-sm">
              {primaryLabel}
            </Link>
          </nav>
        </header>

        <section className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div className="space-y-8">
            <div className="eyebrow">Launch faster with clear operations</div>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
                Turn rough notes into clear SOPs before work slips through the cracks.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted sm:text-xl">
                SOPSmith helps lean teams convert scattered process notes into clean,
                practical SOPs with a repeatable structure, fast enough for day-to-day
                operations.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={primaryHref} className="primary-button">
                {primaryLabel}
              </Link>
              <Link href="#faq" className="secondary-button">
                Read the FAQ
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {featureCards.map((feature) => (
                <article key={feature.title} className="surface-card rounded-3xl px-5 py-5">
                  <h2 className="text-base font-semibold tracking-tight text-foreground">
                    {feature.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted">{feature.body}</p>
                </article>
              ))}
            </div>
          </div>

          <section className="surface-card overflow-hidden rounded-[2rem]">
            <div className="border-b border-white/8 bg-white/4 px-6 py-4">
              <p className="text-sm font-medium text-muted">Sample output preview</p>
            </div>
            <div className="bg-[rgba(7,12,18,0.78)] px-6 py-6">
              <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-sm leading-7 text-foreground">
                {sampleSop}
              </pre>
            </div>
          </section>
        </section>

        <section className="grid gap-5 border-t border-white/8 py-12 sm:grid-cols-3">
          {[
            "Capture the title and rough source notes.",
            "Generate a structured SOP in seconds.",
            "Save it, reopen it, and copy it anywhere.",
          ].map((step, index) => (
            <div key={step} className="surface-card rounded-3xl px-5 py-5">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
                Step {index + 1}
              </p>
              <p className="mt-3 text-base leading-7 text-foreground">{step}</p>
            </div>
          ))}
        </section>

        <section id="faq" className="grid gap-5 py-6 lg:grid-cols-[0.7fr_1.3fr] lg:py-10">
          <div className="space-y-4">
            <div className="eyebrow">FAQ</div>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Straight answers for a lean SOP workflow.
            </h2>
            <p className="max-w-xl text-base leading-7 text-muted">
              SOPSmith stays intentionally focused: generate, save, open, and copy the
              SOPs your team needs most.
            </p>
          </div>

          <div className="grid gap-4">
            {faqs.map((item) => (
              <article key={item.question} className="surface-card rounded-[1.75rem] px-5 py-5">
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  {item.question}
                </h3>
                <p className="mt-2 text-sm leading-7 text-muted">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="mt-8 flex flex-col gap-4 border-t border-white/8 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-foreground">SOPSmith</p>
            <p className="mt-1">Minimal SOP generation for operators who need clarity fast.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-foreground">
              Sign in
            </Link>
            <Link href={primaryHref} className="hover:text-foreground">
              Dashboard
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
