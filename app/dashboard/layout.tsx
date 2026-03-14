import Link from "next/link";

import { signOutAction } from "@/app/dashboard/actions";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Container } from "@/components/ui/Container";
import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = await requireUser();

  return (
    <div className="page-shell min-h-screen">
      <Container className="flex min-h-screen flex-col py-6">
        <SiteHeader
          signedIn
          subtitle={`Signed in as ${user.email ?? "your account"}`}
          actions={
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/dashboard/new" className="secondary-button">
                New SOP
              </Link>
              <form action={signOutAction} aria-label="Sign out">
                <SignOutButton />
              </form>
            </div>
          }
        />

        <main className="flex-1 py-8">{children}</main>
        <SiteFooter className="mt-0" />
      </Container>
    </div>
  );
}
