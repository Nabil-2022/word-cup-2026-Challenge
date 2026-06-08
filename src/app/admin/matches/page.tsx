import { AdminShell } from "@/components/admin/AdminShell";
import { MatchForms } from "@/components/admin/MatchForms";
import { getJsonMatches } from "@/lib/json-db";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type AdminMatchRow = {
  id: string;
  groupName: string | null;
  team1: string;
  team2: string;
  matchDate: Date | string;
  scoreTeam1: number | null;
  scoreTeam2: number | null;
  result: string | null;
  status: string;
};

export default async function MatchesPage() {
  let matches: AdminMatchRow[] = await prisma.match
    .findMany({ take: 120, orderBy: { matchDate: "asc" } })
    .catch(() => []);

  if (matches.length === 0) {
    matches = await getJsonMatches();
  }

  return (
    <AdminShell title="Matches">
      <MatchForms />
      <div className="my-4"><a className="font-semibold text-pitch" href="/api/admin/exports/matches">Export CSV</a></div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">ID</th><th>Group</th><th>Match</th><th>Date</th><th>Score</th><th>Result</th><th>Status</th></tr></thead>
          <tbody>{matches.map((match) => <tr key={match.id} className="border-t border-slate-200"><td className="p-3 font-mono text-xs">{match.id}</td><td>{match.groupName}</td><td>{match.team1} vs {match.team2}</td><td>{new Date(match.matchDate).toISOString()}</td><td>{match.scoreTeam1 ?? "-"} / {match.scoreTeam2 ?? "-"}</td><td>{match.result ?? "-"}</td><td>{match.status}</td></tr>)}</tbody>
        </table>
      </div>
    </AdminShell>
  );
}
