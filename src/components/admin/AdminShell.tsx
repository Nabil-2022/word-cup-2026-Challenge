import { requireAdminSession } from "@/lib/admin-auth";
import { LogoutButton } from "@/components/admin/LogoutButton";

const navItems = [
  ["Dashboard", "/admin"],
  ["Participants", "/admin/participants"],
  ["Matches", "/admin/matches"],
  ["Entries", "/admin/entries"],
  ["Payments", "/admin/payments"],
  ["Leaderboard", "/admin/leaderboard"],
  ["Results", "/admin/results"],
  ["Winners", "/admin/winners"],
  ["Compliance", "/admin/compliance"],
  ["Exports", "/admin/exports"]
];

export async function AdminShell({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  const admin = await requireAdminSession();

  return (
    <section className="mx-auto min-h-[calc(100vh-65px)] max-w-7xl px-4 py-6">
      <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-pitch">Admin Back Office</p>
          <h1 className="text-2xl font-bold text-night">{title}</h1>
          <p className="text-sm text-slate-500">
            {admin.name} - {admin.role}
          </p>
        </div>
        <LogoutButton />
      </div>
      <nav className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {navItems.map(([label, href]) => (
          <a
            key={href}
            className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-night"
            href={href}
          >
            {label}
          </a>
        ))}
      </nav>
      {children}
    </section>
  );
}
