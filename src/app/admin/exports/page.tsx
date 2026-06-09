import { AdminShell } from "@/components/admin/AdminShell";
import { LocalCsvExportButtons } from "@/components/admin/LocalCsvExportButtons";

const exports = ["participants", "matches", "entries", "payments", "leaderboard", "winners", "compliance", "audit"];

export default function ExportsPage() {
  return (
    <AdminShell title="Exports CSV">
      <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="mb-3 text-sm text-slate-700">
          Use server CSV exports when PostgreSQL is connected. Use local CSV exports for the current JSON demo data
          visible in this browser.
        </p>
        <LocalCsvExportButtons />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {exports.map((type) => (
          <a key={type} className="rounded-lg border border-slate-200 bg-white p-4 font-bold capitalize text-night" href={`/api/admin/exports/${type}`}>
            {type} CSV
          </a>
        ))}
      </div>
    </AdminShell>
  );
}
