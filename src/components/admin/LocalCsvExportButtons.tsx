"use client";

type LocalJsonEntry = {
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

type LocalMatch = {
  id: string;
  groupName: string | null;
  team1: string;
  team2: string;
  matchDate: string;
  status: string;
};

const localEntriesKey = "world-cup-json-entries";
const localMatchesKey = "world-cup-admin-demo-matches";

function parseStoredRows<T>(key: string) {
  const value = window.localStorage.getItem(key);

  if (!value) {
    return [];
  }

  try {
    return JSON.parse(value) as T[];
  } catch {
    return [];
  }
}

function toCsv(rows: Array<Record<string, unknown>>) {
  if (rows.length === 0) {
    return "message\n\"No local rows available\"\n";
  }

  const headers = Object.keys(rows[0]);
  const lines = rows.map((row) =>
    headers
      .map((header) => {
        const value = row[header];
        const text = typeof value === "object" && value !== null ? JSON.stringify(value) : String(value ?? "");
        return `"${text.replace(/"/g, '""')}"`;
      })
      .join(",")
  );

  return [headers.join(","), ...lines].join("\n");
}

function downloadCsv(filename: string, rows: Array<Record<string, unknown>>) {
  const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function getRows(type: string) {
  if (type === "participants") {
    const entries = parseStoredRows<LocalJsonEntry>(localEntriesKey);
    const usersByEmail = new Map(
      entries.map((entry) => [
        entry.user.email,
        {
          firstName: entry.user.firstName,
          lastName: entry.user.lastName,
          email: entry.user.email,
          countryCode: entry.user.countryCode,
          isAdult: entry.user.isAdult,
          status: entry.status,
          createdAt: entry.createdAt
        }
      ])
    );

    return [...usersByEmail.values()];
  }

  if (type === "entries") {
    return parseStoredRows<LocalJsonEntry>(localEntriesKey).map((entry) => ({
      id: entry.id,
      firstName: entry.user.firstName,
      lastName: entry.user.lastName,
      email: entry.user.email,
      countryCode: entry.user.countryCode,
      status: entry.status,
      completedMatches: entry.completedMatches,
      totalMatches: entry.totalMatches,
      createdAt: entry.createdAt
    }));
  }

  if (type === "matches") {
    return parseStoredRows<LocalMatch>(localMatchesKey).map((match) => ({
      id: match.id,
      groupName: match.groupName,
      team1: match.team1,
      team2: match.team2,
      matchDate: match.matchDate,
      status: match.status
    }));
  }

  return [];
}

export function LocalCsvExportButton({ type }: { type: string }) {
  return (
    <button
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-night"
      type="button"
      onClick={() => downloadCsv(`${type}-local.csv`, getRows(type))}
    >
      Export local {type} CSV
    </button>
  );
}

export function LocalCsvExportButtons() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {["participants", "entries", "matches"].map((type) => (
        <LocalCsvExportButton key={type} type={type} />
      ))}
    </div>
  );
}
