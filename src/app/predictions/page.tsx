import { PageShell } from "@/components/PageShell";
import { ChallengeTunnel } from "@/components/ChallengeTunnel";

export default function PredictionGridPage() {
  return (
    <PageShell
      title="Prediction Grid"
      description="Complete every required World Cup 2026 prediction before checkout."
    >
      <ChallengeTunnel />
    </PageShell>
  );
}
