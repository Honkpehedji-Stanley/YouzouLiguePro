import { prisma } from "@/lib/prisma";

export function getActiveSeason() {
  return prisma.season.findFirst({ where: { isActive: true } });
}

export type StandingRow = {
  teamId: string;
  team: { id: string; slug: string; name: string; logoUrl: string | null };
  wins: number;
  losses: number;
  gamesPlayed: number;
  winPct: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDiff: number;
};

export async function getStandings(seasonId: string): Promise<StandingRow[]> {
  const games = await prisma.game.findMany({
    where: { seasonId, status: "FINAL" },
    include: { homeTeam: true, awayTeam: true },
  });

  const rows = new Map<string, StandingRow>();

  const ensureRow = (team: { id: string; slug: string; name: string; logoUrl: string | null }) => {
    if (!rows.has(team.id)) {
      rows.set(team.id, {
        teamId: team.id,
        team,
        wins: 0,
        losses: 0,
        gamesPlayed: 0,
        winPct: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        pointDiff: 0,
      });
    }
    return rows.get(team.id)!;
  };

  for (const game of games) {
    if (game.homeScore == null || game.awayScore == null) continue;

    const home = ensureRow(game.homeTeam);
    const away = ensureRow(game.awayTeam);

    home.gamesPlayed += 1;
    away.gamesPlayed += 1;
    home.pointsFor += game.homeScore;
    home.pointsAgainst += game.awayScore;
    away.pointsFor += game.awayScore;
    away.pointsAgainst += game.homeScore;

    if (game.homeScore > game.awayScore) {
      home.wins += 1;
      away.losses += 1;
    } else if (game.awayScore > game.homeScore) {
      away.wins += 1;
      home.losses += 1;
    }
  }

  for (const row of rows.values()) {
    row.winPct = row.gamesPlayed > 0 ? row.wins / row.gamesPlayed : 0;
    row.pointDiff = row.pointsFor - row.pointsAgainst;
  }

  return Array.from(rows.values()).sort(
    (a, b) => b.winPct - a.winPct || b.wins - a.wins || b.pointDiff - a.pointDiff
  );
}

const STAT_FIELDS = [
  "minutes",
  "points",
  "reboundsOff",
  "reboundsDef",
  "assists",
  "steals",
  "blocks",
  "turnovers",
  "fouls",
  "fgMade",
  "fgAttempted",
  "threeMade",
  "threeAttempted",
  "ftMade",
  "ftAttempted",
] as const;

type StatTotals = Record<(typeof STAT_FIELDS)[number], number> & {
  gamesPlayed: number;
};

function emptyTotals(): StatTotals {
  const totals = { gamesPlayed: 0 } as StatTotals;
  for (const field of STAT_FIELDS) totals[field] = 0;
  return totals;
}

export type StatAverages = Record<(typeof STAT_FIELDS)[number], number> & {
  gamesPlayed: number;
};

function toAverages(totals: StatTotals): StatAverages {
  const averages = { gamesPlayed: totals.gamesPlayed } as StatAverages;
  for (const field of STAT_FIELDS) {
    averages[field] =
      totals.gamesPlayed > 0
        ? Math.round((totals[field] / totals.gamesPlayed) * 10) / 10
        : 0;
  }
  return averages;
}

export async function getPlayerSeasonAverages(
  playerId: string,
  seasonId: string
): Promise<StatAverages> {
  const rows = await prisma.playerGameStat.findMany({
    where: { playerId, didNotPlay: false, game: { seasonId } },
  });

  const totals = emptyTotals();
  for (const row of rows) {
    totals.gamesPlayed += 1;
    for (const field of STAT_FIELDS) totals[field] += row[field];
  }
  return toAverages(totals);
}

export async function getPlayerCareerAverages(
  playerId: string
): Promise<StatAverages> {
  const rows = await prisma.playerGameStat.findMany({
    where: { playerId, didNotPlay: false },
  });

  const totals = emptyTotals();
  for (const row of rows) {
    totals.gamesPlayed += 1;
    for (const field of STAT_FIELDS) totals[field] += row[field];
  }
  return toAverages(totals);
}

export async function getTeamSeasonAverages(
  teamId: string,
  seasonId: string
): Promise<StatAverages> {
  const rows = await prisma.playerGameStat.findMany({
    where: { teamId, didNotPlay: false, game: { seasonId } },
  });

  const gameIds = new Set(rows.map((r) => r.gameId));
  const totals = emptyTotals();
  totals.gamesPlayed = gameIds.size;
  for (const row of rows) {
    for (const field of STAT_FIELDS) totals[field] += row[field];
  }

  const averages = { gamesPlayed: totals.gamesPlayed } as StatAverages;
  for (const field of STAT_FIELDS) {
    averages[field] =
      totals.gamesPlayed > 0
        ? Math.round((totals[field] / totals.gamesPlayed) * 10) / 10
        : 0;
  }
  return averages;
}
