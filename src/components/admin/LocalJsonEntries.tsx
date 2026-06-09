"use client";

import { useEffect, useState } from "react";

export type LocalJsonEntry = {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    countryCode: string;
    isAdult: boolean;
  };
  status: string;
  totalMatches: number;
  completedMatches: number;
  createdAt: string;
};

const localEntriesKey = "world-cup-json-entries";

function getLocalEntries() {
  const storedEntries = window.localStorage.getItem(localEntriesKey);

  if (!storedEntries) {
    return [];
  }

  try {
    return JSON.parse(storedEntries) as LocalJsonEntry[];
  } catch {
    window.localStorage.removeItem(localEntriesKey);
    return [];
  }
}

export function LocalJsonParticipants() {
  const [entries, setEntries] = useState<LocalJsonEntry[]>([]);

  useEffect(() => {
    setEntries(getLocalEntries());
  }, []);

  if (entries.length === 0) {
    return null;
  }

  const usersByEmail = new Map(entries.map((entry) => [entry.user.email, entry]));

  return (
    <>
      {[...usersByEmail.values()].map((entry) => (
        <tr key={entry.user.email} className="border-t border-slate-200 bg-emerald-50/40">
          <td className="p-3 font-semibold">
            {entry.user.firstName} {entry.user.lastName}
          </td>
          <td>{entry.user.email}</td>
          <td>{entry.user.countryCode}</td>
          <td>{entry.user.isAdult ? "eligible" : "underage"}</td>
          <td>{entry.status === "locked" ? "participant" : "registered"}</td>
          <td>{new Date(entry.createdAt).toISOString()}</td>
        </tr>
      ))}
    </>
  );
}

export function LocalJsonEntries() {
  const [entries, setEntries] = useState<LocalJsonEntry[]>([]);

  useEffect(() => {
    setEntries(getLocalEntries());
  }, []);

  if (entries.length === 0) {
    return null;
  }

  return (
    <>
      {entries.map((entry) => (
        <tr key={entry.id} className="border-t border-slate-200 bg-emerald-50/40">
          <td className="p-3 font-semibold">
            {entry.user.firstName} {entry.user.lastName}
          </td>
          <td>{entry.status}</td>
          <td>
            {entry.completedMatches}/{entry.totalMatches}
          </td>
          <td>0</td>
          <td>-</td>
          <td>-</td>
        </tr>
      ))}
    </>
  );
}

export function rememberLocalJsonEntry(entry: LocalJsonEntry) {
  const entries = getLocalEntries();
  const nextEntries = [entry, ...entries.filter((currentEntry) => currentEntry.id !== entry.id)];
  window.localStorage.setItem(localEntriesKey, JSON.stringify(nextEntries));
}
