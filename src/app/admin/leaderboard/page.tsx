import { AdminActions } from "@/components/admin/AdminActions";
import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminLeaderboardPage() {
  const rows = await prisma.leaderboard
    .findMany({ take: 100, orderBy: { rank: "asc" }, include: { entry: { include: { user: true } } } })
    .catch(() => []);

  return (
    <AdminShell title="Leaderboard">
      <AdminActions />
      <div className="my-4"><a className="font-semibold text-pitch" href="/api/admin/exports/leaderboard">Export CSV</a></div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">Rank</th><th>Participant</th><th>Score</th><th>Tie-break distance</th><th>Updated</th></tr></thead>
          <tbody>{rows.map((row) => <tr key={row.id} className="border-t border-slate-200"><td className="p-3 font-bold">#{row.rank}</td><td>{row.entry.user.firstName} {row.entry.user.lastName}</td><td>{row.score}</td><td>{row.tiebreakDistance ?? "-"}</td><td>{row.updatedAt.toISOString()}</td></tr>)}</tbody>
        </table>
      </div>
    </AdminShell>
  );
}
