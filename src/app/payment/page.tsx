import { PageShell } from "@/components/PageShell";

type PaymentPageProps = {
  searchParams: Promise<{
    entryId?: string;
  }>;
};

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
  const { entryId } = await searchParams;

  return (
    <PageShell
      title="Entry Fee Checkout"
      description="Checkout is available only after the prediction grid and participant details are complete."
    >
      <div className="mx-auto max-w-xl space-y-4 rounded-lg border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
        {entryId ? (
          <div className="rounded-lg bg-slate-100 p-4">
            <p className="font-semibold text-night">Prediction grid saved.</p>
            <p className="font-mono text-xs">Entry reference: {entryId}</p>
          </div>
        ) : null}
        <p>Entry fee applies. Terms and eligibility conditions apply.</p>
        <p>
          This is a skill-based prediction competition. Winners are determined by prediction accuracy and official
          rules.
        </p>
        {entryId ? (
          <p>
            Stripe Checkout is not connected in the current demo environment. A production checkout requires valid
            Stripe settings and webhook configuration.
          </p>
        ) : null}
      </div>
    </PageShell>
  );
}
