import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ParticipantsPage() {
  const users = await prisma.user
    .findMany({ take: 100, orderBy: { createdAt: "desc" } })
    .catch(() => []);

  return (
    <AdminShell title="Participants">
      <div className="mb-4"><a className="font-semibold text-pitch" href="/api/admin/exports/participants">Export CSV</a></div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">Name</th><th>Email</th><th>Country</th><th>Eligibility</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>{users.map((user) => <tr key={user.id} className="border-t border-slate-200"><td className="p-3 font-semibold">{user.firstName} {user.lastName}</td><td>{user.email}</td><td>{user.countryCode}</td><td>{user.eligibilityStatus}</td><td>{user.status}</td><td>{user.createdAt.toISOString()}</td></tr>)}</tbody>
        </table>
      </div>
    </AdminShell>
  );
}
