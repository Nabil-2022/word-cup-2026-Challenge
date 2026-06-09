import { AdminShell } from "@/components/admin/AdminShell";
import { LocalCsvExportButton } from "@/components/admin/LocalCsvExportButtons";
import { LocalJsonEntries } from "@/components/admin/LocalJsonEntries";
import { getJsonEntries } from "@/lib/json-db";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type AdminEntryRow = {
  id: string;
  status: string;
  completedMatches: number;
  totalMatches: number;
  score: number;
  rank: number | null;
  validatedAt: Date | string | null;
  user: {
    firstName: string;
    lastName: string;
  };
  predictions: Array<unknown>;
};

export default async function EntriesPage() {
  let entries: AdminEntryRow[] = await prisma.entry
    .findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      include: { user: true, predictions: true }
    })
    .catch(() => []);

  if (entries.length === 0) {
    const jsonEntries = await getJsonEntries();
    entries = jsonEntries.map((entry) => ({
      id: entry.id,
      status: entry.status,
      completedMatches: entry.completedMatches,
      totalMatches: entry.totalMatches,
      score: 0,
      rank: null,
      validatedAt: null,
      user: {
        firstName: entry.user.firstName,
        lastName: entry.user.lastName
      },
      predictions: entry.predictions
    }));
  }

  return (
    <AdminShell title="Entries / Prediction Grids">
      <div className="mb-4 flex flex-wrap gap-3"><a className="font-semibold text-pitch" href="/api/admin/exports/entries">Export server CSV</a><LocalCsvExportButton type="entries" /></div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">Participant</th><th>Status</th><th>Grid</th><th>Score</th><th>Rank</th><th>Validated</th></tr></thead>
          <tbody>
            <LocalJsonEntries />
            {entries.map((entry) => <tr key={entry.id} className="border-t border-slate-200"><td className="p-3 font-semibold">{entry.user.firstName} {entry.user.lastName}</td><td>{entry.status}</td><td>{entry.completedMatches}/{entry.totalMatches}</td><td>{entry.score}</td><td>{entry.rank ?? "-"}</td><td>{entry.validatedAt ? new Date(entry.validatedAt).toISOString() : "-"}</td></tr>)}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
