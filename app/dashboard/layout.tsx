import { signOutAction } from "@/app/dashboard/actions";
import { AppShell } from "@/components/layout/AppShell";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { requireUser } from "@/lib/auth";
import { ensureWorkspaceContext } from "@/lib/platform";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { supabase, user } = await requireUser();
  const { workspace } = await ensureWorkspaceContext(user, supabase);

  return (
    <AppShell
      subtitle={workspace.name}
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
