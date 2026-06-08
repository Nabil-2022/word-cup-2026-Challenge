import { AdminShell } from "@/components/admin/AdminShell";
import { CountryPolicyForm } from "@/components/admin/CountryPolicyForm";
import { getCountryPolicy } from "@/lib/country-policy";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CompliancePage() {
  const [policy, complianceLogs, auditLogs] = await Promise.all([
    getCountryPolicy(),
    prisma.complianceLog
      .findMany({ take: 100, orderBy: { createdAt: "desc" }, include: { user: true } })
      .catch(() => []),
    prisma.auditLog
      .findMany({ take: 100, orderBy: { createdAt: "desc" }, include: { admin: true } })
      .catch(() => [])
  ]);

  return (
    <AdminShell title="Compliance">
      <CountryPolicyForm allowedCountries={policy.allowedCountries} blockedCountries={policy.blockedCountries} />
      <div className="my-4 flex gap-4"><a className="font-semibold text-pitch" href="/api/admin/exports/compliance">Export compliance CSV</a><a className="font-semibold text-pitch" href="/api/admin/exports/audit">Export audit CSV</a></div>
      <div className="grid gap-4 lg:grid-cols-2">
        <LogTable title="Compliance logs" rows={complianceLogs.map((log) => [log.createdAt.toISOString(), log.action, log.country ?? "-", log.user?.email ?? "-"])} />
        <LogTable title="Audit logs" rows={auditLogs.map((log) => [log.createdAt.toISOString(), log.action, log.entityType, log.admin?.email ?? "-"])} />
      </div>
    </AdminShell>
  );
}

function LogTable({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <h2 className="p-3 font-bold text-night">{title}</h2>
      <table className="w-full min-w-[560px] text-left text-sm">
        <tbody>{rows.map((row) => <tr key={row.join("-")} className="border-t border-slate-200">{row.map((cell) => <td key={cell} className="p-3">{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}
