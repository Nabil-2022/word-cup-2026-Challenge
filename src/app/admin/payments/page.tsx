import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const payments = await prisma.payment
    .findMany({ take: 100, orderBy: { createdAt: "desc" }, include: { user: true } })
    .catch(() => []);

  return (
    <AdminShell title="Payments">
      <div className="mb-4"><a className="font-semibold text-pitch" href="/api/admin/exports/payments">Export CSV</a></div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">Participant</th><th>Amount</th><th>Fee</th><th>Prize budget</th><th>Status</th><th>Provider</th><th>Created</th></tr></thead>
          <tbody>{payments.map((payment) => <tr key={payment.id} className="border-t border-slate-200"><td className="p-3 font-semibold">{payment.user.firstName} {payment.user.lastName}</td><td>{payment.amount.toString()} {payment.currency}</td><td>{payment.platformFee.toString()}</td><td>{payment.prizeBudgetAmount.toString()}</td><td>{payment.status}</td><td>{payment.provider}</td><td>{payment.createdAt.toISOString()}</td></tr>)}</tbody>
        </table>
      </div>
    </AdminShell>
  );
}
