import { PageShell } from "@/components/PageShell";

export default function LandingPage() {
  return (
    <PageShell
      title="World Cup 2026 Prediction Challenge"
      description="Build your match predictions, complete every required selection, and join the leaderboard after checkout."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <a className="rounded-lg bg-pitch px-5 py-4 font-semibold text-white" href="/participant">
          Start Challenge
        </a>
        <a className="rounded-lg border border-slate-300 bg-white px-5 py-4 font-semibold text-night" href="/rules">
          View Rules
        </a>
        <a className="rounded-lg border border-slate-300 bg-white px-5 py-4 font-semibold text-night" href="/leaderboard">
          Leaderboard
        </a>
      </div>
    </PageShell>
  );
}
