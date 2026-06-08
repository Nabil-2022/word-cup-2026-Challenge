"use client";

export function LogoutButton() {
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-night" type="button" onClick={logout}>
      Logout
    </button>
  );
}
