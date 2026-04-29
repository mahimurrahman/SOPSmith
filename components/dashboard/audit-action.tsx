import { runAuditAction } from "@/app/dashboard/actions";
import { ActionButton } from "@/components/dashboard/action-button";

export function AuditAction({ sopId }: { sopId: string }) {
  async function action() {
    "use server";
    await runAuditAction(sopId);
  }

  return (
    <form action={action}>
      <ActionButton pendingLabel="Auditing..." tone="secondary">
        Run agent audit
      </ActionButton>
    </form>
  );
}
