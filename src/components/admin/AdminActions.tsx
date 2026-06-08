"use client";

import { useState } from "react";

export function AdminActions() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function runAction(url: string) {
    setIsLoading(true);
    setMessage("");

    const response = await fetch(url, { method: "POST" });
    const data = await response.json();
    setMessage(response.ok ? JSON.stringify(data) : data.error ?? "Action failed.");
    setIsLoading(false);
  }

  return (
    <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2">
      <button className="rounded-lg bg-pitch px-4 py-3 font-bold text-white disabled:bg-slate-300" disabled={isLoading} type="button" onClick={() => runAction("/api/admin/scoring/recalculate")}>
        Run Scoring Engine
      </button>
      <button className="rounded-lg bg-night px-4 py-3 font-bold text-white disabled:bg-slate-300" disabled={isLoading} type="button" onClick={() => runAction("/api/admin/leaderboard/generate")}>
        Generate Leaderboard
      </button>
      {message ? <p className="sm:col-span-2 text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}
