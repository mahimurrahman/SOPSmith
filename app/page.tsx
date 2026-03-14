import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Accordion } from "@/components/ui/Accordion";
import { getButtonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Grid } from "@/components/ui/Grid";
import { getOptionalUser } from "@/lib/auth";

const featureCards = [
  {
    title: "From rough notes to usable SOPs",
    body: "Paste handoff bullets, reminders, and messy steps. SOPSmith shapes them into something a teammate can actually run.",
  },
  {
    title: "Structured for operations work",
    body: "Every SOP lands with purpose, scope, steps, checks, and a checklist so the output feels practical, not generic.",
  },
  {
    title: "A lightweight private library",
    body: "Save SOPs in one place, reopen them in seconds, and copy the final text anywhere your team already works.",
  },
];

const faqs = [
  {
    question: "Who is SOPSmith for?",
    answer:
      "SOPSmith is built for operators, agencies, and small teams that need clean process docs fast without setting up a heavyweight knowledge base.",
  },
  {
    question: "Do I need polished writing before generating?",
    answer:
      "No. Rough bullets, partial notes, and handoff details are enough. The app is designed to turn unfinished notes into a usable SOP draft.",
  },
  {
    question: "How are SOPs stored?",
    answer:
      "Each SOP is saved to your own Supabase-backed library and scoped to your signed-in account with row-level security.",
  },
  {
    question: "Can I add source files too?",
    answer:
      "Yes. You can attach PDFs, DOC or DOCX files, and TXT notes to each SOP so the original context stays with the final procedure.",
  },
  {
    question: "How long does generation take?",
    answer:
      "Most SOPs generate in a few seconds, depending on note length, current auth state, and model response time.",
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
  const primaryLabel = user ? "Open your library" : "Start generating SOPs";

  return (
    <main className="page-shell">
      <Container className="flex min-h-screen flex-col py-6">
        <SiteHeader
          signedIn={Boolean(user)}
          actions={
            <div className="flex flex-wrap items-center gap-3">
              {!user ? (
                <Link href="/login" className={getButtonClasses({ size: "sm", variant: "secondary" })}>
                  Sign in
                </Link>
              ) : null}
              <Link href={primaryHref} className={getButtonClasses({ size: "sm" })}>
                {primaryLabel}
              </Link>
            </div>
          }
        />

        <Grid className="flex-1 items-center py-14 lg:grid-cols-[1.02fr_0.98fr] lg:py-20" gap="lg">
          <div className="space-y-8">
            <div className="eyebrow">AI workflow for operators</div>

            <div className="space-y-5">
              <h1 className="max-w-3xl text-display font-semibold tracking-tight text-foreground">
                Turn rough process notes into SOPs your team can run the same day.
              </h1>
              <p className="section-copy text-lg sm:text-xl">
                SOPSmith is a focused SaaS for small teams, agencies, and operators who
                need structured procedures without building a heavy documentation stack.
              </p>
            </div>

            <div
              className="flex flex-col gap-3 sm:flex-row"
              role="group"
              aria-label="Primary calls to action"
            >
              <Link href={primaryHref} className={getButtonClasses({ size: "lg" })}>
                {primaryLabel}
              </Link>
              <Link href="#faq" className={getButtonClasses({ size: "lg", variant: "secondary" })}>
                Explore the workflow
              </Link>
            </div>

            <Grid className="sm:grid-cols-3">
              {featureCards.map((feature) => (
                <Card key={feature.title} className="rounded-[1.75rem] px-5 py-5">
                  <h2 className="text-base font-semibold tracking-tight text-foreground">
                    {feature.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted">{feature.body}</p>
                </Card>
              ))}
            </Grid>
          </div>

          <div className="space-y-5">
            <Card as="section" className="overflow-hidden rounded-[2rem]" tone="strong">
              <div className="border-b border-border bg-surface-muted px-6 py-4">
                <p className="text-sm font-medium text-muted">Product preview</p>
              </div>
              <div className="relative aspect-[12/9] overflow-hidden bg-surface-strong">
                <Image
                  src="/hero-sopsmith.svg"
                  alt="SOPSmith interface preview showing rough notes turning into a structured operating procedure."
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 44rem, 100vw"
                />
              </div>
            </Card>

            <Card as="section" className="overflow-hidden rounded-[2rem]" tone="strong">
              <div className="border-b border-border bg-surface-muted px-6 py-4">
                <p className="text-sm font-medium text-muted">Sample SOP output</p>
              </div>
              <div className="bg-surface-strong px-6 py-6">
                <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-sm leading-7 text-foreground">
                  {sampleSop}
                </pre>
              </div>
            </Card>
          </div>
        </Grid>

        <Grid className="border-t border-border py-12 sm:grid-cols-3">
          {[
            "Capture the title, rough notes, and source files you already have.",
            "Generate a structured SOP with practical steps and checks.",
            "Save it, reopen it, attach context, and copy it anywhere.",
          ].map((step, index) => (
            <Card key={step} className="rounded-[1.75rem] px-5 py-5">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
                Step {index + 1}
              </p>
              <p className="mt-3 text-base leading-7 text-foreground">{step}</p>
            </Card>
          ))}
        </Grid>

        <Grid id="faq" className="py-6 lg:grid-cols-[0.7fr_1.3fr] lg:py-10">
          <div className="space-y-4">
            <div className="eyebrow">FAQ</div>
            <h2 className="text-h2 font-semibold tracking-tight text-foreground">
              Straight answers for a lean SOP workflow.
            </h2>
            <p className="section-copy">
              SOPSmith stays intentionally focused: capture rough notes, generate a
              practical SOP, save it privately, and reuse it whenever the work repeats.
            </p>
          </div>

          <Grid>
            {faqs.map((item) => (
              <Accordion
                key={item.question}
                summary={<span className="text-base font-semibold tracking-tight">{item.question}</span>}
              >
                {item.answer}
              </Accordion>
            ))}
          </Grid>
        </Grid>

        <SiteFooter />
      </Container>
    </main>
  );
}
