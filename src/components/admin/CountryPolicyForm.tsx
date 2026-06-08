"use client";

import { useState } from "react";

export function CountryPolicyForm({
  allowedCountries,
  blockedCountries
}: {
  allowedCountries: string[];
  blockedCountries: string[];
}) {
  const [allowed, setAllowed] = useState(allowedCountries.join(","));
  const [blocked, setBlocked] = useState(blockedCountries.join(","));
  const [message, setMessage] = useState("");

  async function savePolicy() {
    const response = await fetch("/api/admin/countries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        allowedCountries: allowed.split(",").map((country) => country.trim()).filter(Boolean),
        blockedCountries: blocked.split(",").map((country) => country.trim()).filter(Boolean)
      })
    });
    const data = await response.json();
    setMessage(response.ok ? "Country policy saved." : data.error ?? "Unable to save country policy.");
  }

  return (
    <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        Allowed countries
        <input className="rounded-lg border border-slate-300 px-4 py-3" value={allowed} onChange={(event) => setAllowed(event.target.value.toUpperCase())} />
      </label>
      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        Blocked countries
        <input className="rounded-lg border border-slate-300 px-4 py-3" value={blocked} onChange={(event) => setBlocked(event.target.value.toUpperCase())} />
      </label>
      <button className="rounded-lg bg-pitch px-4 py-3 font-bold text-white" type="button" onClick={savePolicy}>
        Save Country Policy
      </button>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}
