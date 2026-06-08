import { AdminActions } from "@/components/admin/AdminActions";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminKpis } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const kpis = await getAdminKpis();
  const cards = [
    ["Total registered users", kpis.totalRegisteredUsers],
    ["Paid participants", kpis.paidParticipants],
    ["Total revenue", kpis.totalRevenue],
    ["Platform fees", kpis.platformFees],
    ["Prize budget", kpis.prizeBudget],
    ["Completed prediction grids", kpis.completedPredictionGrids],
    ["Top score", kpis.topScore],
    ["Blocked users", kpis.blockedUsers],
    ["Disputed payments", kpis.disputedPayments]
  ];

  return (
    <AdminShell title="Dashboard KPIs">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-night">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <AdminActions />
      </div>
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="font-bold text-night">Countries</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {kpis.countries.map((country) => (
            <span key={country.countryCode} className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
              {country.countryCode}: {country.users}
            </span>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
