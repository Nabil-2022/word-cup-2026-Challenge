import { ConfirmationStatus } from "@/components/ConfirmationStatus";
import { PageShell } from "@/components/PageShell";

export default function PaymentSuccessPage() {
  return (
    <PageShell
      title="Checkout Submitted"
      description="Entry fee applies. Terms and eligibility conditions apply."
    >
      <div className="mx-auto mb-4 max-w-xl rounded-lg border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
        This is a skill-based prediction competition. Winners are determined by prediction accuracy and tie-break
        rules.
      </div>
      <ConfirmationStatus />
    </PageShell>
  );
}
