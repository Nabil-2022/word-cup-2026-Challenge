"use client";

import { useState } from "react";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submitLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      setMessage("Invalid admin credentials.");
      setIsLoading(false);
      return;
    }

    window.location.href = "/admin";
  }

  return (
    <form className="mx-auto mt-8 grid max-w-sm gap-4 rounded-lg border border-slate-200 bg-white p-5" onSubmit={submitLogin}>
      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        Email
        <input className="rounded-lg border border-slate-300 px-4 py-3" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        Password
        <input className="rounded-lg border border-slate-300 px-4 py-3" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
      </label>
      {message ? <p className="text-sm text-red-700">{message}</p> : null}
      <button className="rounded-lg bg-pitch px-5 py-3 font-bold text-white disabled:bg-slate-300" disabled={isLoading} type="submit">
        {isLoading ? "Signing in..." : "Login"}
      </button>
    </form>
  );
}
