import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function WinnersPage() {
  const winners = await prisma.winner
    .findMany({ take: 100, orderBy: { rank: "asc" }, include: { user: true } })
    .catch(() => []);

  return (
    <AdminShell title="Winners">
      <div className="mb-4"><a className="font-semibold text-pitch" href="/api/admin/exports/winners">Export CSV</a></div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">Rank</th><th>Participant</th><th>Amount</th><th>Verification</th><th>Payment</th></tr></thead>
          <tbody>{winners.map((winner) => <tr key={winner.id} className="border-t border-slate-200"><td className="p-3 font-bold">#{winner.rank}</td><td>{winner.user.firstName} {winner.user.lastName}</td><td>{winner.amount.toString()}</td><td>{winner.verificationStatus}</td><td>{winner.paymentStatus}</td></tr>)}</tbody>
        </table>
      </div>
    </AdminShell>
  );
}
