import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <section className="mx-auto min-h-[calc(100vh-65px)] max-w-xl px-4 py-12">
      <p className="text-sm font-semibold uppercase tracking-wide text-pitch">Admin Back Office</p>
      <h1 className="mt-2 text-3xl font-bold text-night">Login admin</h1>
      <p className="mt-3 text-sm text-slate-600">Secure access for operational controls and compliance review.</p>
      <AdminLoginForm />
    </section>
  );
}
