import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { getOptionalUser } from "@/lib/auth";
import { sanitizeNextPath } from "@/lib/urls";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to SOPSmith with a secure magic link.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getOptionalUser();

  if (user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const notice = params.error
    ? {
        tone: "error" as const,
        message: params.error,
      }
    : undefined;

  return (
    <main className="page-shell flex min-h-screen items-center justify-center px-6 py-10">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <section className="space-y-6 rounded-[2rem] border border-white/8 bg-white/4 px-7 py-8">
          <Link href="/" className="inline-flex text-sm font-medium text-muted hover:text-foreground">
            Back to home
          </Link>

          <div className="space-y-3">
            <div className="eyebrow">Magic link sign in</div>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground">
              Sign in once, then keep your SOP library moving.
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted">
              Enter your email and SOPSmith will send a one-time sign-in link. Open
              the link on this device and you will land in your dashboard.
            </p>
          </div>

          <div className="surface-card rounded-3xl px-5 py-5">
            <p className="text-sm font-semibold text-foreground">How it works</p>
            <ol className="mt-3 space-y-3 text-sm leading-6 text-muted">
              <li>1. Enter the email tied to your SOP workspace.</li>
              <li>2. Open the magic link from your inbox.</li>
              <li>3. Land in your dashboard and start generating SOPs.</li>
            </ol>
          </div>

          <div className="muted-panel rounded-3xl px-5 py-5">
            <p className="text-sm font-semibold text-foreground">Inside the app</p>
            <ul className="mt-3 space-y-3 text-sm leading-6 text-muted">
              <li>Protected access to your saved SOPs</li>
              <li>Fast generation from rough notes</li>
              <li>One-click copy for use in docs or ops tools</li>
            </ul>
          </div>
        </section>

        <section className="surface-card rounded-[2rem] px-7 py-8">
          <LoginForm nextPath={sanitizeNextPath(params.next)} notice={notice} />
        </section>
      </div>
    </main>
  );
}
