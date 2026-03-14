import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Grid } from "@/components/ui/Grid";
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
  description: "Sign in to SOPSmith with a secure magic link or Google.",
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
    <main className="page-shell">
      <Container className="flex min-h-screen flex-col py-6">
        <SiteHeader
          signedIn={false}
          actions={
            <Link href="/" className="secondary-button">
              Back to home
            </Link>
          }
        />

        <Grid className="flex-1 items-center py-12 lg:grid-cols-[0.92fr_1.08fr]" gap="lg">
          <Card as="section" className="space-y-6 rounded-[2rem] px-7 py-8">
            <Link
              href="/"
              className="inline-flex rounded-full px-2 py-2 text-sm font-medium text-muted hover:text-foreground"
            >
              Back to home
            </Link>

            <div className="space-y-3">
              <div className="eyebrow">Magic link sign in</div>
              <h1 className="text-h1 font-semibold tracking-tight text-foreground">
                Sign in once, then keep your SOP library moving.
              </h1>
              <p className="section-copy">
                Enter your email and SOPSmith will send a one-time sign-in link. Open
                the link on this device and you will land in your dashboard.
              </p>
            </div>

            <Card className="rounded-[1.75rem] px-5 py-5">
              <p className="text-sm font-semibold text-foreground">How it works</p>
              <ol className="mt-3 space-y-3 text-sm leading-6 text-muted">
                <li>1. Enter the email tied to your SOP workspace.</li>
                <li>2. Open the magic link from your inbox.</li>
                <li>3. Land in your dashboard and start generating SOPs.</li>
              </ol>
            </Card>

            <Card tone="muted" className="rounded-[1.75rem] px-5 py-5">
              <p className="text-sm font-semibold text-foreground">Inside the app</p>
              <ul className="mt-3 space-y-3 text-sm leading-6 text-muted">
                <li>Protected access to your saved SOPs</li>
                <li>Fast generation from rough notes</li>
                <li>One-click copy for use in docs or ops tools</li>
              </ul>
            </Card>
          </Card>

          <Card as="section" className="rounded-[2rem] px-7 py-8">
            <LoginForm nextPath={sanitizeNextPath(params.next)} notice={notice} />
          </Card>
        </Grid>

        <SiteFooter />
      </Container>
    </main>
  );
}
