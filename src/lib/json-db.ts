import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export type JsonMatch = {
  id: string;
  groupName: string | null;
  team1: string;
  team2: string;
  matchDate: string;
  scoreTeam1: number | null;
  scoreTeam2: number | null;
  result: "ONE" | "DRAW" | "TWO" | null;
  status: "upcoming" | "finished" | "cancelled";
  createdAt: string;
};

type JsonDatabase = {
  matches: JsonMatch[];
};

function getJsonDbPath() {
  if (process.env.JSON_DB_PATH) {
    return process.env.JSON_DB_PATH;
  }

  if (process.env.VERCEL) {
    return path.join(os.tmpdir(), "world-cup-2026-challenge-json-db.json");
  }

  return path.join(process.cwd(), "data", "json-db.json");
}

async function readJsonDatabase(): Promise<JsonDatabase> {
  const filePath = getJsonDbPath();

  try {
    const content = await readFile(filePath, "utf8");
    const parsed = JSON.parse(content) as Partial<JsonDatabase>;

    return {
      matches: Array.isArray(parsed.matches) ? parsed.matches : []
    };
  } catch {
    return { matches: [] };
  }
}

async function writeJsonDatabase(database: JsonDatabase) {
  const filePath = getJsonDbPath();
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(database, null, 2)}\n`, "utf8");
}

export async function getJsonMatches() {
  const database = await readJsonDatabase();

  return [...database.matches].sort((first, second) => {
    const firstDate = new Date(first.matchDate).getTime();
    const secondDate = new Date(second.matchDate).getTime();

    if (firstDate !== secondDate) {
      return firstDate - secondDate;
    }

    return (first.groupName ?? "").localeCompare(second.groupName ?? "");
  });
}

export async function createJsonMatch(input: {
  groupName?: string | null;
  team1: string;
  team2: string;
  matchDate: Date;
}) {
  const database = await readJsonDatabase();
  const now = new Date();
  const match: JsonMatch = {
    id: `json-match-${now.getTime()}`,
    groupName: input.groupName || null,
    team1: input.team1,
    team2: input.team2,
    matchDate: input.matchDate.toISOString(),
    scoreTeam1: null,
    scoreTeam2: null,
    result: null,
    status: "upcoming",
    createdAt: now.toISOString()
  };

  database.matches = [match, ...database.matches.filter((currentMatch) => currentMatch.id !== match.id)];
  await writeJsonDatabase(database);

  return match;
}
