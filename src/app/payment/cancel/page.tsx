import { PageShell } from "@/components/PageShell";

export default function PaymentCancelPage() {
  return (
    <PageShell
      title="Checkout Cancelled"
      description="Entry fee applies. Terms and eligibility conditions apply."
    >
      <div className="mx-auto max-w-xl space-y-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
          This is a skill-based prediction competition. Winners are determined by prediction accuracy and official rules.
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
          Checkout was not completed. Your entry remains pending until Stripe confirms a successful checkout through
          the secure webhook.
        </div>
        <a className="block rounded-lg bg-pitch px-5 py-4 text-center font-bold text-white" href="/participant">
          Return to Prediction Challenge
        </a>
      </div>
    </PageShell>
  );
}
