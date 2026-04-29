import { changePlanAction } from "@/app/dashboard/actions";
import { ActionButton } from "@/components/dashboard/action-button";

type PlanChangeFormProps = {
  active?: boolean;
  planId: string;
};

export function PlanChangeForm({ active = false, planId }: PlanChangeFormProps) {
  async function action() {
    "use server";
    await changePlanAction(planId);
  }

  return (
    <form action={action}>
      <ActionButton pendingLabel="Updating..." tone={active ? "secondary" : "primary"}>
        {active ? "Current plan" : "Switch mock plan"}
      </ActionButton>
    </form>
  );
}
