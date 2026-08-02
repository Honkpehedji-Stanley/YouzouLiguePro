import { Category, Conference } from "@prisma/client";
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

export async function getStandings(
  seasonId: string,
  conference: Conference,
  category: Category
): Promise<StandingRow[]> {
  const teamSeasons = await prisma.teamSeason.findMany({
    where: { seasonId, conference, team: { category } },
    include: { team: true },
  });

  const rows = new Map<string, StandingRow>();
  for (const { team } of teamSeasons) {
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

  if (rows.size === 0) return [];

  const teamIds = Array.from(rows.keys());
  const games = await prisma.game.findMany({
    where: {
      seasonId,
      status: "FINAL",
      homeTeamId: { in: teamIds },
      awayTeamId: { in: teamIds },
    },
  });

  for (const game of games) {
    if (game.homeScore == null || game.awayScore == null) continue;
    const home = rows.get(game.homeTeamId);
    const away = rows.get(game.awayTeamId);
    if (!home || !away) continue;

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

export const LEADER_METRICS = ["points", "rebounds", "assists", "steals", "blocks"] as const;
export type LeaderMetric = (typeof LEADER_METRICS)[number];

export const LEADER_METRIC_LABELS: Record<LeaderMetric, string> = {
  points: "Points",
  rebounds: "Rebonds",
  assists: "Passes",
  steals: "Interceptions",
  blocks: "Contres",
};

export type LeaderRow = {
  player: {
    id: string;
    slug: string;
    firstName: string;
    lastName: string;
    photoUrl: string | null;
  };
  team: { id: string; slug: string; name: string } | null;
  value: number;
  gamesPlayed: number;
};

export async function getStatLeaders(
  seasonId: string,
  category: Category,
  metric: LeaderMetric,
  limit = 5
): Promise<LeaderRow[]> {
  const rows = await prisma.playerGameStat.findMany({
    where: { didNotPlay: false, game: { seasonId }, team: { category } },
    include: { player: true, team: true },
  });

  const byPlayer = new Map<
    string,
    { player: LeaderRow["player"]; team: LeaderRow["team"]; total: number; games: number }
  >();

  for (const row of rows) {
    const value =
      metric === "rebounds"
        ? row.reboundsOff + row.reboundsDef
        : row[metric as Exclude<LeaderMetric, "rebounds">];
    if (!byPlayer.has(row.playerId)) {
      byPlayer.set(row.playerId, { player: row.player, team: row.team, total: 0, games: 0 });
    }
    const entry = byPlayer.get(row.playerId)!;
    entry.total += value;
    entry.games += 1;
  }

  return Array.from(byPlayer.values())
    .map((entry) => ({
      player: entry.player,
      team: entry.team,
      gamesPlayed: entry.games,
      value: Math.round((entry.total / entry.games) * 10) / 10,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}
