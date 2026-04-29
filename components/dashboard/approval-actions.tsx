import { decideApprovalAction } from "@/app/dashboard/actions";
import { ActionButton } from "@/components/dashboard/action-button";

type ApprovalActionsProps = {
  approvalId: string;
  disabled?: boolean;
};

export function ApprovalActions({ approvalId, disabled = false }: ApprovalActionsProps) {
  async function approve() {
    "use server";
    if (!disabled) {
      await decideApprovalAction(approvalId, "approve");
    }
  }

  async function reject() {
    "use server";
    if (!disabled) {
      await decideApprovalAction(approvalId, "reject");
    }
  }

  if (disabled) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-3">
      <form action={approve}>
        <ActionButton pendingLabel="Approving...">Approve</ActionButton>
      </form>
      <form action={reject}>
        <ActionButton pendingLabel="Rejecting..." tone="danger">
          Reject
        </ActionButton>
      </form>
    </div>
  );
}
