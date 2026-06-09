import { PageShell } from "@/components/PageShell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const leaderboard = await prisma.leaderboard
    .findMany({
      take: 100,
      orderBy: [{ rank: "asc" }, { score: "desc" }, { tiebreakDistance: "asc" }, { updatedAt: "asc" }],
      include: {
        entry: {
          include: {
            user: { select: { firstName: true, lastName: true, countryCode: true } }
          }
        }
      }
    })
    .catch(() => []);

  return (
    <PageShell
      title="Leaderboard"
      description="Ranking is determined by prediction score and validation time."
    >
      <section className="mx-auto max-w-3xl">
        <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
          Score is calculated from correct match predictions. Earlier validation time is used only after score.
        </div>

        {leaderboard.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-700">
            The Leaderboard will appear after official results are scored.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="grid grid-cols-[56px_1fr_72px] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
              <span>Rank</span>
              <span>Participant</span>
              <span className="text-right">Score</span>
            </div>
            <div className="divide-y divide-slate-200">
              {leaderboard.map((row) => (
                <div key={row.id} className="grid grid-cols-[56px_1fr_72px] gap-3 px-4 py-4">
                  <div className="font-bold text-night">#{row.rank}</div>
                  <div>
                    <div className="font-semibold text-night">
                      {row.entry.user.firstName} {row.entry.user.lastName}
                    </div>
                    <div className="text-sm text-slate-500">{row.entry.user.countryCode}</div>
                  </div>
                  <div className="text-right font-bold text-pitch">
                    {row.score}/{row.entry.totalMatches}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </PageShell>
  );
}
