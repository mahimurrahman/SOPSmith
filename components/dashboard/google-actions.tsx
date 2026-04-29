import {
  createGoogleMockActionAction,
  setGoogleMockConnectionAction,
} from "@/app/dashboard/actions";
import { ActionButton } from "@/components/dashboard/action-button";

export function GoogleConnectionForm({ connected }: { connected: boolean }) {
  async function action() {
    "use server";
    await setGoogleMockConnectionAction(!connected);
  }

  return (
    <form action={action}>
      <ActionButton pendingLabel="Updating..." tone={connected ? "secondary" : "primary"}>
        {connected ? "Disconnect mock Google" : "Connect mock Google"}
      </ActionButton>
    </form>
  );
}

export function GoogleMockActionForm({
  actionType,
  disabled,
  label,
}: {
  actionType: "drive_export" | "docs_sync" | "gmail_draft";
  disabled?: boolean;
  label: string;
}) {
  async function action() {
    "use server";
    if (!disabled) {
      await createGoogleMockActionAction(actionType);
    }
  }

  return (
    <form action={action}>
      <ActionButton pendingLabel="Drafting..." tone="secondary">
        {disabled ? "Connect Google first" : label}
      </ActionButton>
    </form>
  );
}
