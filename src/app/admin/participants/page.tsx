import { AdminShell } from "@/components/admin/AdminShell";
import { LocalCsvExportButton } from "@/components/admin/LocalCsvExportButtons";
import { LocalJsonParticipants } from "@/components/admin/LocalJsonEntries";
import { getJsonEntries } from "@/lib/json-db";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type AdminParticipantRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  eligibilityStatus: string;
  status: string;
  createdAt: Date | string;
};

export default async function ParticipantsPage() {
  let users: AdminParticipantRow[] = await prisma.user
    .findMany({ take: 100, orderBy: { createdAt: "desc" } })
    .catch(() => []);

  if (users.length === 0) {
    const jsonEntries = await getJsonEntries();
    const usersByEmail = new Map(
      jsonEntries.map((entry) => [
        entry.user.email,
        {
          id: entry.user.email,
          firstName: entry.user.firstName,
          lastName: entry.user.lastName,
          email: entry.user.email,
          countryCode: entry.user.countryCode,
          eligibilityStatus: entry.user.isAdult ? "eligible" : "underage",
          status: entry.status === "locked" ? "participant" : "registered",
          createdAt: new Date(entry.createdAt)
        }
      ])
    );
    users = [...usersByEmail.values()];
  }

  return (
    <AdminShell title="Participants">
      <div className="mb-4 flex flex-wrap gap-3"><a className="font-semibold text-pitch" href="/api/admin/exports/participants">Export server CSV</a><LocalCsvExportButton type="participants" /></div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">Name</th><th>Email</th><th>Country</th><th>Eligibility</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>
            <LocalJsonParticipants />
            {users.map((user) => <tr key={user.id} className="border-t border-slate-200"><td className="p-3 font-semibold">{user.firstName} {user.lastName}</td><td>{user.email}</td><td>{user.countryCode}</td><td>{user.eligibilityStatus}</td><td>{user.status}</td><td>{new Date(user.createdAt).toISOString()}</td></tr>)}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
