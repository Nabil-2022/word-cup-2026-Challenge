import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EntriesPage() {
  const entries = await prisma.entry
    .findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      include: { user: true, predictions: true }
    })
    .catch(() => []);

  return (
    <AdminShell title="Entries / Prediction Grids">
      <div className="mb-4"><a className="font-semibold text-pitch" href="/api/admin/exports/entries">Export CSV</a></div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">Participant</th><th>Status</th><th>Grid</th><th>Score</th><th>Rank</th><th>Tie-break</th><th>Validated</th></tr></thead>
          <tbody>{entries.map((entry) => <tr key={entry.id} className="border-t border-slate-200"><td className="p-3 font-semibold">{entry.user.firstName} {entry.user.lastName}</td><td>{entry.status}</td><td>{entry.completedMatches}/{entry.totalMatches}</td><td>{entry.score}</td><td>{entry.rank ?? "-"}</td><td>{entry.tiebreakAnswer ?? "-"} / {entry.tiebreakDistance ?? "-"}</td><td>{entry.validatedAt?.toISOString() ?? "-"}</td></tr>)}</tbody>
        </table>
      </div>
    </AdminShell>
  );
}
