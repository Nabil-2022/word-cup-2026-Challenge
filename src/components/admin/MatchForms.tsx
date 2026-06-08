"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SavedMatch = {
  id: string;
  groupName: string | null;
  team1: string;
  team2: string;
  matchDate: string;
  status: string;
};

const demoMatchesStorageKey = "world-cup-admin-demo-matches";

export function MatchForms() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [matchId, setMatchId] = useState("");
  const [scoreTeam1, setScoreTeam1] = useState("");
  const [scoreTeam2, setScoreTeam2] = useState("");
  const [savedMatches, setSavedMatches] = useState<SavedMatch[]>([]);

  useEffect(() => {
    const storedMatches = window.localStorage.getItem(demoMatchesStorageKey);

    if (!storedMatches) {
      return;
    }

    try {
      setSavedMatches(JSON.parse(storedMatches) as SavedMatch[]);
    } catch {
      window.localStorage.removeItem(demoMatchesStorageKey);
    }
  }, []);

  function rememberSavedMatch(match: SavedMatch) {
    setSavedMatches((current) => {
      const nextMatches = [match, ...current.filter((currentMatch) => currentMatch.id !== match.id)];
      window.localStorage.setItem(demoMatchesStorageKey, JSON.stringify(nextMatches));
      return nextMatches;
    });
  }

  async function createMatch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const target = event.currentTarget;
    const form = new FormData(target);

    try {
      const response = await fetch("/api/admin/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupName: form.get("groupName") || undefined,
          team1: form.get("team1"),
          team2: form.get("team2"),
          matchDate: form.get("matchDate")
        })
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error ?? "Unable to save match.");
        return;
      }

      rememberSavedMatch(data.match);
      target.reset();
      router.refresh();
      setMessage(data.demoMode ? "Match saved in demo mode." : "Match saved.");
    } catch {
      setMessage("Unable to save match.");
    }
  }

  async function saveScore() {
    const response = await fetch("/api/admin/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matchId,
        scoreTeam1: Number(scoreTeam1),
        scoreTeam2: Number(scoreTeam2),
        status: "finished"
      })
    });
    const data = await response.json();
    setMessage(response.ok ? `Score saved. Result: ${data.match.result}` : data.error ?? "Unable to save score.");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <form className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4" onSubmit={createMatch}>
        <h2 className="font-bold text-night">Create match</h2>
        <input className="rounded-lg border border-slate-300 px-4 py-3" name="groupName" placeholder="Group name" />
        <input className="rounded-lg border border-slate-300 px-4 py-3" name="team1" placeholder="Team 1" required />
        <input className="rounded-lg border border-slate-300 px-4 py-3" name="team2" placeholder="Team 2" required />
        <input className="rounded-lg border border-slate-300 px-4 py-3" name="matchDate" required type="datetime-local" />
        <button className="rounded-lg bg-pitch px-4 py-3 font-bold text-white" type="submit">Save Match</button>
      </form>
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="font-bold text-night">Official score</h2>
        <input className="rounded-lg border border-slate-300 px-4 py-3" placeholder="Match id" value={matchId} onChange={(event) => setMatchId(event.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <input className="rounded-lg border border-slate-300 px-4 py-3" min="0" placeholder="Team 1 score" type="number" value={scoreTeam1} onChange={(event) => setScoreTeam1(event.target.value)} />
          <input className="rounded-lg border border-slate-300 px-4 py-3" min="0" placeholder="Team 2 score" type="number" value={scoreTeam2} onChange={(event) => setScoreTeam2(event.target.value)} />
        </div>
        <button className="rounded-lg bg-night px-4 py-3 font-bold text-white" type="button" onClick={saveScore}>Save Score</button>
      </div>
      {message ? <p className="lg:col-span-2 text-sm text-slate-600">{message}</p> : null}
      {savedMatches.length ? (
        <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 font-bold text-night">Saved locally</h2>
          <div className="grid gap-2">
            {savedMatches.map((match) => (
              <div key={match.id} className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                <p className="font-semibold text-night">{match.team1} vs {match.team2}</p>
                <p>{match.groupName ?? "No group"} · {new Date(match.matchDate).toLocaleString()} · {match.status}</p>
                <p className="font-mono text-xs">{match.id}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
