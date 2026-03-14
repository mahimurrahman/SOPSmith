import Link from "next/link";

import { signOutAction } from "@/app/dashboard/actions";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = await requireUser();

  return (
    <div className="page-shell min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-6 sm:px-8 lg:px-10">
        <header className="surface-card flex flex-col gap-4 rounded-[1.75rem] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <Link href="/dashboard" className="text-xl font-semibold tracking-tight text-foreground">
              SOPSmith
            </Link>
            <p className="mt-1 text-sm text-muted">
              Signed in as {user.email ?? "your account"}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <DashboardNav />

            <form action={signOutAction}>
              <SignOutButton />
            </form>
          </div>
        </header>

        <main className="flex-1 py-8">{children}</main>
      </div>
    </div>
  );
}
