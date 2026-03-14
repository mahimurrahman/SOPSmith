import { signOutAction } from "@/app/dashboard/actions";
import { AppShell } from "@/components/layout/AppShell";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = await requireUser();

  return (
    <AppShell
      subtitle={user.email ? user.email : "Signed in"}
      sidebarFooter={
        <form action={signOutAction} aria-label="Sign out">
          <SignOutButton />
        </form>
      }
    >
      {children}
    </AppShell>
  );
}
