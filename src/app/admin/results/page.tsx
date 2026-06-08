import { AdminShell } from "@/components/admin/AdminShell";
import { MatchForms } from "@/components/admin/MatchForms";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminResultsPage() {
  const matches = await prisma.match
    .findMany({ where: { status: "finished" }, take: 100, orderBy: { matchDate: "asc" } })
    .catch(() => []);

  return (
    <AdminShell title="Results">
      <MatchForms />
      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">Match</th><th>Score</th><th>Result</th><th>Status</th></tr></thead>
          <tbody>{matches.map((match) => <tr key={match.id} className="border-t border-slate-200"><td className="p-3">{match.team1} vs {match.team2}</td><td>{match.scoreTeam1} / {match.scoreTeam2}</td><td>{match.result}</td><td>{match.status}</td></tr>)}</tbody>
        </table>
      </div>
    </AdminShell>
  );
}
