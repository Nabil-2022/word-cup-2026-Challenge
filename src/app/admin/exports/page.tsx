import { AdminShell } from "@/components/admin/AdminShell";

const exports = ["participants", "matches", "entries", "payments", "leaderboard", "winners", "compliance", "audit"];

export default function ExportsPage() {
  return (
    <AdminShell title="Exports CSV">
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
