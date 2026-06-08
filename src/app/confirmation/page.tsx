import { ConfirmationStatus } from "@/components/ConfirmationStatus";
import { PageShell } from "@/components/PageShell";

export default function ConfirmationPage() {
  return (
    <PageShell
      title="Confirmation"
      description="Your grid is locked only after Stripe confirms a successful checkout through the webhook."
    >
      <ConfirmationStatus />
    </PageShell>
  );
}
