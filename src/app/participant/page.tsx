import { PageShell } from "@/components/PageShell";
import { ChallengeTunnel } from "@/components/ChallengeTunnel";

export default function ParticipantFormPage() {
  return (
    <PageShell
      title="Start Your Entry"
      description="Confirm eligibility, complete every match prediction, answer the tie-break question, and continue to checkout."
    >
      <ChallengeTunnel />
    </PageShell>
  );
}
