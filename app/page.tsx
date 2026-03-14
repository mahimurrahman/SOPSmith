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
    <div className="relative flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800/50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20 flex">
                <span className="material-symbols-outlined text-white text-2xl leading-none">auto_fix_high</span>
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">SOPSmith</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-10">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors cursor-pointer">Platform</span>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors cursor-pointer">Solutions</span>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors cursor-pointer">Pricing</span>
          </nav>
          <div className="flex items-center gap-6">
            {!user ? (
              <Link href="/login" className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">
                Log In
              </Link>
            ) : null}
            <Link href={primaryHref} className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/25">
              {primaryLabel}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[700px] bg-primary/5 blur-[120px] rounded-full -z-10"></div>
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="flex flex-col gap-8">
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-[0.15em] w-fit">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  Engineered for Scale
                </div>
                <h1 className="text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] text-slate-900 dark:text-white font-display" style={{ textWrap: "balance" } as React.CSSProperties}>
                  Transform chaotic workflows into <span className="text-primary italic">institutional wealth.</span>
                </h1>
                <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl font-light">
                  SOPSmith turns scattered process knowledge into high-performance playbooks. The operating system for teams that value precision over guesswork.
                </p>
                <div className="flex flex-wrap gap-5">
                  <Link href={primaryHref} className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all shadow-2xl shadow-primary/30 flex items-center gap-3">
                    Start Building SOPs
                    <span className="material-symbols-outlined text-xl">arrow_right_alt</span>
                  </Link>
                  <button className="border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-900 dark:text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all">
                    Watch Product Tour
                  </button>
                </div>
                <div className="flex items-center gap-5 pt-4">
                  <div className="flex -space-x-3.5">
                    <div className="h-11 w-11 rounded-full border-2 border-background-dark bg-slate-300"></div>
                    <div className="h-11 w-11 rounded-full border-2 border-background-dark bg-slate-400"></div>
                    <div className="h-11 w-11 rounded-full border-2 border-background-dark bg-slate-500"></div>
                  </div>
                  <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Trusted by 2,400+ Operations Leaders</p>
                </div>
              </div>

              {/* Product Preview Mockup */}
              <div className="relative group lg:mt-0 mt-8">
                <div className="absolute -inset-6 bg-gradient-to-tr from-primary/30 to-blue-400/10 rounded-[3rem] blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
                <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)]">
                  <div className="h-12 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center px-5 gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                  </div>
                  <div className="p-8">
                    <div className="flex flex-col gap-6">
                      <div className="h-7 w-64 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                      <div className="flex gap-6">
                        <div className="flex-1 space-y-4">
                          <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-md"></div>
                          <div className="h-4 w-5/6 bg-slate-100 dark:bg-slate-800 rounded-md"></div>
                          <div className="h-4 w-4/6 bg-slate-100 dark:bg-slate-800 rounded-md"></div>
                        </div>
                        <div className="w-28 h-28 bg-primary/5 rounded-2xl flex items-center justify-center border border-primary/10">
                          <span className="material-symbols-outlined text-primary text-4xl">inventory_2</span>
                        </div>
                      </div>
                      <div className="mt-4 border border-primary/20 rounded-xl p-5 bg-primary/[0.02]">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="h-9 w-9 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md">1</div>
                          <div className="h-4 w-40 bg-primary/10 rounded-full"></div>
                        </div>
                        <div className="space-y-3">
                          <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded opacity-60"></div>
                          <div className="h-2.5 w-3/4 bg-slate-100 dark:bg-slate-800 rounded opacity-60"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-28 bg-white/50 dark:bg-slate-900/30 border-y border-slate-200 dark:border-slate-800/50">
          <div className="container mx-auto px-6">
            <div className="flex flex-col items-center text-center mb-20">
              <span className="text-primary font-bold tracking-[0.2em] text-[10px] uppercase mb-4">Core Infrastructure</span>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6 font-display">Engineered for Operational Excellence</h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-lg font-light leading-relaxed">Systematize your business with enterprise-grade tools designed for clarity, accountability, and rapid deployment.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: "account_tree", title: "Workflow Logic", text: "Complex conditional branching that guides your team through every possible scenario without confusion." },
                { icon: "history_edu", title: "Audit Trails", text: "Automatic version control and compliance logs for every procedural change, ensuring full accountability." },
                { icon: "hub", title: "Knowledge Graph", text: "Map dependencies between processes to understand how a single change ripples through your operations." },
                { icon: "terminal", title: "API Integration", text: "Trigger SOPs based on external events from your CRM, ERP, or communication stacks automatically." },
              ].map((f) => (
                <div key={f.title} className="group bg-white dark:bg-background-dark p-10 rounded-[2rem] border border-slate-200 dark:border-slate-800/60 hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5">
                  <div className="w-14 h-14 bg-slate-50 dark:bg-slate-900/50 rounded-2xl flex items-center justify-center mb-8 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm">
                    <span className="material-symbols-outlined text-2xl leading-none">{f.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4 font-display tracking-tight text-slate-900 dark:text-white">{f.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Example Output Section */}
        <section className="py-28 overflow-hidden bg-slate-50 dark:bg-slate-950/20">
          <div className="container mx-auto px-6">
            <div className="flex flex-col items-center text-center mb-16">
              <span className="text-primary font-bold tracking-[0.2em] text-[10px] uppercase mb-4">The Conversion Engine</span>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6 font-display">Structure from Serendipity</h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-lg font-light leading-relaxed">Our proprietary AI extracts logical steps from your roughest drafts, creating clean, actionable blueprints.</p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 items-stretch max-w-6xl mx-auto">
              <div className="relative flex flex-col h-full group">
                <div className="absolute -top-4 left-8 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest z-10 border border-slate-200 dark:border-slate-700">INPUT: UNSTRUCTURED DATA</div>
                <div className="flex-1 bg-white dark:bg-slate-900/30 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-10 font-mono text-[13px] text-slate-400 italic leading-loose">
                  <p className="mb-5 text-slate-300">// Raw intake from Sales-to-Ops handoff</p>
                  <p className="mb-5">Okay so for the Acme corp project, make sure we actually have the deposit first. Steve usually checks the Quickbooks, but sometimes they send a wire directly. If it's over $10k, we need the CFO to sign off on the resource allocation too. Once that's done, spin up the Jira project - use the standard Kanban board but add the 'Security' lane.</p>
                  <p>Wait, before all that, send the 'Project Kickoff' questionnaire. It's the Typeform link in the shared drive under /Assets/Templates.</p>
                </div>
              </div>

              <div className="relative flex flex-col h-full">
                <div className="absolute -top-4 left-8 bg-primary text-white px-5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest z-10 shadow-xl shadow-primary/30">OUTPUT: VALIDATED PROCEDURE</div>
                <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)]">
                  <h3 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-6 font-display tracking-tight">Enterprise Client Onboarding</h3>
                  <div className="space-y-8">
                    {[
                      { num: "01", title: "Financial Verification", text: "Confirm deposit status via Quickbooks or Direct Wire. For transactions exceeding $10,000, secure Resource Allocation approval from the CFO." },
                      { num: "02", title: "Environment Provisioning", text: "Initialize Jira Kanban instance using the Standard template. Manually append 'Security Compliance' swimlane to the workflow." }
                    ].map((step) => (
                      <div key={step.num} className="flex gap-6">
                        <div className="shrink-0 w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/10">{step.num}</div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1.5 font-display tracking-tight">{step.title}</h4>
                          <p className="text-sm text-slate-500 font-light leading-relaxed">{step.text}</p>
                        </div>
                      </div>
                    ))}
                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                      <span className="material-symbols-outlined text-xl text-primary leading-none">data_object</span>
                      <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Auto-Linked: Onboarding-Questionnaire.json</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="bg-primary rounded-[3rem] p-8 md:p-16 text-center text-white shadow-[0_40px_100px_-20px_rgba(60,131,246,0.5)] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-white/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 p-24 bg-blue-400/20 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2"></div>
              
              <h2 className="text-3xl md:text-5xl font-extrabold mb-8 relative z-10 font-display tracking-tight max-w-3xl mx-auto leading-tight" style={{ textWrap: "balance" } as React.CSSProperties}>
                Standardize your success. Stop building on sand.
              </h2>
              <p className="text-white/80 text-lg md:text-xl mb-12 max-w-2xl mx-auto relative z-10 font-light">
                Deploy SOPSmith across your organization today. Build a company that runs itself, even when you aren't in the room.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-5 relative z-10">
                <Link href={primaryHref} className="bg-white text-primary hover:bg-slate-50 px-10 py-5 rounded-2xl text-lg font-extrabold transition-all shadow-xl shadow-black/10 inline-flex items-center justify-center">
                  Build Your Workspace
                </Link>
                <button className="bg-primary/20 hover:bg-primary/30 text-white border border-white/20 px-10 py-5 rounded-2xl text-lg font-extrabold transition-all backdrop-blur-sm">
                  Speak to an Architect
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
