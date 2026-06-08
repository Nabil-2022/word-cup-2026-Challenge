import { PageShell } from "@/components/PageShell";

export default function RulesPage() {
  return (
    <PageShell
      title="Official Rules"
      description="Winners are determined by prediction score and published tie-break rules. Participants must be 18+ and located in an allowed country."
    >
      <a className="rounded-lg bg-pitch px-5 py-4 font-bold text-white" href="/official-rules">
        View Official Rules
      </a>
    </PageShell>
  );
}
