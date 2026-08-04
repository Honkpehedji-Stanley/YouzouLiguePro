import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getActiveSeason, getPlayerSeasonAverages } from "@/lib/stats";
import { getDisplayAge, formatBirthDate } from "@/lib/playerDisplay";
import { PageContainer } from "@/components/PageContainer";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { PlayerTabs, type RecentGameRow } from "@/components/PlayerTabs";
import type { GameStatRow } from "@/lib/statSplits";

const DEFAULT_HERO_COLOR = "#118a43";

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const player = await prisma.player.findUnique({
    where: { slug },
    include: {
      rosterEntries: {
        include: { team: true, season: true },
        orderBy: { joinedAt: "desc" },
      },
    },
  });
  if (!player) notFound();

  const season = await getActiveSeason();
  const currentEntry = season
    ? player.rosterEntries.find((e) => e.seasonId === season.id && e.isActive)
    : undefined;

  const [seasonAverages, allGameStats, teammates] = await Promise.all([
    season ? getPlayerSeasonAverages(player.id, season.id) : null,
    prisma.playerGameStat.findMany({
      where: { playerId: player.id },
      include: {
        game: { include: { season: true, homeTeam: true, awayTeam: true } },
        team: true,
      },
      orderBy: { game: { scheduledAt: "desc" } },
    }),
    currentEntry
      ? prisma.teamPlayerSeason.findMany({
          where: {
            teamId: currentEntry.teamId,
            seasonId: currentEntry.seasonId,
            isActive: true,
            playerId: { not: player.id },
          },
          include: { player: true },
          take: 6,
        })
      : Promise.resolve([]),
  ]);

  const heroColor = currentEntry?.team.primaryColor ?? DEFAULT_HERO_COLOR;
  const age = getDisplayAge(player);
  const position = player.position
    ? `${player.position}${player.secondaryPosition ? `/${player.secondaryPosition}` : ""}`
    : null;

  const recentGames: RecentGameRow[] = allGameStats.slice(0, 5).map((stat) => {
    const opponent = stat.teamId === stat.game.homeTeamId ? stat.game.awayTeam : stat.game.homeTeam;
    const isHome = stat.teamId === stat.game.homeTeamId;
    let result: RecentGameRow["result"] = null;
    if (stat.game.status === "FINAL" && stat.game.homeScore != null && stat.game.awayScore != null) {
      const ownScore = isHome ? stat.game.homeScore : stat.game.awayScore;
      const oppScore = isHome ? stat.game.awayScore : stat.game.homeScore;
      result = ownScore > oppScore ? "V" : "D";
    }
    return {
      gameId: stat.gameId,
      dateLabel: new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(stat.game.scheduledAt),
      opponentName: opponent.name,
      opponentSlug: opponent.slug,
      isHome,
      result,
      minutes: stat.minutes,
      points: stat.points,
      rebounds: stat.reboundsOff + stat.reboundsDef,
      assists: stat.assists,
    };
  });

  const splitsRows: GameStatRow[] = allGameStats.map((stat) => ({
    gameId: stat.gameId,
    seasonId: stat.game.seasonId,
    seasonLabel: stat.game.season.label,
    phase: stat.game.phase,
    teamName: stat.team.name,
    minutes: stat.minutes,
    points: stat.points,
    fgMade: stat.fgMade,
    fgAttempted: stat.fgAttempted,
    threeMade: stat.threeMade,
    threeAttempted: stat.threeAttempted,
    ftMade: stat.ftMade,
    ftAttempted: stat.ftAttempted,
    reboundsOff: stat.reboundsOff,
    reboundsDef: stat.reboundsDef,
    assists: stat.assists,
    turnovers: stat.turnovers,
    steals: stat.steals,
    blocks: stat.blocks,
    fouls: stat.fouls,
    didNotPlay: stat.didNotPlay,
  }));

  const fallbackSeasons = Array.from(
    new Map(
      player.rosterEntries.map((e) => [
        e.seasonId,
        { seasonId: e.seasonId, seasonLabel: e.season.label, teamName: e.team.name },
      ])
    ).values()
  );

  const cells = [
    {
      label: "PTS/MATCH",
      value: seasonAverages && seasonAverages.gamesPlayed > 0 ? seasonAverages.points : null,
    },
    {
      label: "REB/MATCH",
      value:
        seasonAverages && seasonAverages.gamesPlayed > 0
          ? seasonAverages.reboundsOff + seasonAverages.reboundsDef
          : null,
    },
    {
      label: "PD/MATCH",
      value: seasonAverages && seasonAverages.gamesPlayed > 0 ? seasonAverages.assists : null,
    },
    { label: "Taille", value: player.heightCm ? `${player.heightCm} cm` : null },
    { label: "Poids", value: player.weightKg ? `${player.weightKg} kg` : null },
    { label: "Nationalité", value: player.nationality },
    { label: "Ville natale", value: player.hometown },
    { label: "Âge", value: age ? `${age} ans` : null },
    { label: "Date de naissance", value: player.birthDate ? formatBirthDate(player.birthDate) : null },
    {
      label: "Expérience",
      value:
        player.experienceYears != null
          ? `${player.experienceYears} an${player.experienceYears > 1 ? "s" : ""}`
          : null,
    },
  ];

  return (
    <div className="-mt-8">
      <div
        className="relative overflow-hidden px-4 py-8 text-white sm:px-10"
        style={{ backgroundColor: heroColor }}
      >
        {currentEntry?.team.logoUrl && (
          <Image
            src={currentEntry.team.logoUrl}
            alt=""
            aria-hidden
            width={400}
            height={400}
            className="pointer-events-none absolute -right-10 top-1/2 h-[220%] w-auto -translate-y-1/2 object-contain opacity-15"
          />
        )}
        <div className="relative mx-auto flex max-w-6xl items-center gap-6">
          <PlayerAvatar
            photoUrl={player.photoUrl}
            name={`${player.firstName} ${player.lastName}`}
            size={96}
            variant="hero"
            className="ring-2 ring-white/30"
          />
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-white/80">
              {currentEntry ? (
                <>
                  {currentEntry.team.name}
                  {currentEntry.jerseyNumber != null && ` · #${currentEntry.jerseyNumber}`}
                  {position && ` · ${position}`}
                </>
              ) : (
                "Agent libre"
              )}
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {player.firstName} {player.lastName}
              {currentEntry?.isCaptain && (
                <span className="ml-2 align-middle text-base font-semibold text-white/80">
                  (C)
                </span>
              )}
            </h1>
          </div>
        </div>
      </div>

      <div className="bg-black text-white">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-10">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4 lg:grid-cols-5">
            {cells.map((cell) => (
              <div key={cell.label}>
                <p className="text-[10px] font-medium uppercase tracking-wide text-white/50">
                  {cell.label}
                </p>
                <p className="text-lg font-bold">{cell.value ?? "—"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PageContainer>
        <div className="flex flex-col gap-10 py-8">
          <PlayerTabs
            bio={player.bio}
            recentGames={recentGames}
            splitsRows={splitsRows}
            fallbackSeasons={fallbackSeasons}
          />

          {teammates.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Coéquipiers</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {teammates.map((entry) => (
                  <Link
                    key={entry.id}
                    href={`/joueurs/${entry.player.slug}`}
                    className="flex items-center gap-2 rounded-md border border-black/10 px-3 py-2 hover:border-brand"
                  >
                    <PlayerAvatar
                      photoUrl={entry.player.photoUrl}
                      name={`${entry.player.firstName} ${entry.player.lastName}`}
                      size={32}
                    />
                    <span>
                      {entry.player.firstName} {entry.player.lastName}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
