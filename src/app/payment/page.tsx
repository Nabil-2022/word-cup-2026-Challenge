import { PageShell } from "@/components/PageShell";

export default function PaymentPage() {
  return (
    <PageShell
      title="Entry Fee Checkout"
      description="Checkout is available only after the prediction grid and participant details are complete."
    >
      <div className="mx-auto max-w-xl space-y-4 rounded-lg border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
        <p>Entry fee applies. Terms and eligibility conditions apply.</p>
        <p>
          This is a skill-based prediction competition. Winners are determined by prediction accuracy and tie-break
          rules.
        </p>
      </div>
    </PageShell>
  );
}
