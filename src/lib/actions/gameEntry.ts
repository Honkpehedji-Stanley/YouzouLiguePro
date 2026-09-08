"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

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

type StatField = (typeof STAT_FIELDS)[number];
type StatRecord = Record<StatField, number>;

function emptyStatRecord(): StatRecord {
  const record = {} as StatRecord;
  for (const field of STAT_FIELDS) record[field] = 0;
  return record;
}

function parsePlayerStats(formData: FormData) {
  const players = new Map<string, StatRecord>();
  for (const [key, value] of formData.entries()) {
    const match = key.match(/^stat__(.+)__(.+)$/);
    if (!match) continue;
    const [, playerId, field] = match;
    if (!STAT_FIELDS.includes(field as StatField)) continue;
    if (!players.has(playerId)) players.set(playerId, emptyStatRecord());
    players.get(playerId)![field as StatField] = Number(value) || 0;
  }
  return players;
}

async function upsertStats(gameId: string, formData: FormData) {
  await requireAdmin();
  const game = await prisma.game.findUniqueOrThrow({ where: { id: gameId } });

  const rosterEntries = await prisma.teamPlayerSeason.findMany({
    where: {
      seasonId: game.seasonId,
      teamId: { in: [game.homeTeamId, game.awayTeamId] },
      isActive: true,
    },
  });
  const playerTeamMap = new Map(rosterEntries.map((r) => [r.playerId, r.teamId]));
  const playerStats = parsePlayerStats(formData);

  let homeTotal = 0;
  let awayTotal = 0;

  await prisma.$transaction(
    Array.from(playerStats.entries()).map(([playerId, stats]) => {
      const teamId = playerTeamMap.get(playerId);
      if (!teamId) {
        throw new Error("Un joueur saisi ne fait pas partie de l'effectif de ce match.");
      }
      if (teamId === game.homeTeamId) homeTotal += stats.points;
      else awayTotal += stats.points;

      const didNotPlay = stats.minutes === 0;

      return prisma.playerGameStat.upsert({
        where: { gameId_playerId: { gameId, playerId } },
        create: { gameId, playerId, teamId, ...stats, didNotPlay },
        update: { ...stats, didNotPlay },
      });
    })
  );

  return { game, homeTotal, awayTotal };
}

export async function saveDraftGameStats(gameId: string, formData: FormData) {
  const { game } = await upsertStats(gameId, formData);
  if (game.status === "SCHEDULED") {
    await prisma.game.update({ where: { id: gameId }, data: { status: "LIVE" } });
  }
  revalidatePath(`/admin/games/${gameId}/entry`);
}

export async function finalizeGameStats(gameId: string, formData: FormData) {
  const { homeTotal, awayTotal } = await upsertStats(gameId, formData);

  const homeOverrideRaw = String(formData.get("homeScoreOverride") ?? "").trim();
  const awayOverrideRaw = String(formData.get("awayScoreOverride") ?? "").trim();

  await prisma.game.update({
    where: { id: gameId },
    data: {
      status: "FINAL",
      homeScore: homeOverrideRaw ? Number(homeOverrideRaw) : homeTotal,
      awayScore: awayOverrideRaw ? Number(awayOverrideRaw) : awayTotal,
    },
  });

  revalidatePath(`/admin/games/${gameId}/entry`);
  revalidatePath("/admin/schedule");
  revalidatePath("/calendrier");
  revalidatePath("/classement");
  redirect("/admin/schedule");
}
