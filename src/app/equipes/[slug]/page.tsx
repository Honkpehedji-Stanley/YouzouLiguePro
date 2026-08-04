import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getActiveSeason, getTeamSeasonAverages } from "@/lib/stats";
import { CATEGORY_LABELS, CONFERENCE_LABELS } from "@/lib/league";
import { PageContainer } from "@/components/PageContainer";

const DEFAULT_HERO_COLOR = "#118a43";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(date);
}

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const team = await prisma.team.findUnique({ where: { slug } });
  if (!team) notFound();

  const season = await getActiveSeason();

  const [roster, games, averages, teamSeason] = await Promise.all([
    season
      ? prisma.teamPlayerSeason.findMany({
          where: { teamId: team.id, seasonId: season.id, isActive: true },
          include: { player: true },
          orderBy: { jerseyNumber: "asc" },
        })
      : Promise.resolve([]),
    season
      ? prisma.game.findMany({
          where: {
            seasonId: season.id,
            OR: [{ homeTeamId: team.id }, { awayTeamId: team.id }],
          },
          include: { homeTeam: true, awayTeam: true },
          orderBy: { scheduledAt: "asc" },
        })
      : Promise.resolve([]),
    season ? getTeamSeasonAverages(team.id, season.id) : null,
    season
      ? prisma.teamSeason.findUnique({
          where: { teamId_seasonId: { teamId: team.id, seasonId: season.id } },
        })
      : null,
  ]);

  const heroColor = team.primaryColor ?? DEFAULT_HERO_COLOR;

  return (
    <div className="-mt-8">
      <div className="px-4 py-8 text-white sm:px-10" style={{ backgroundColor: heroColor }}>
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          {team.logoUrl && (
            <Image
              src={team.logoUrl}
              alt={team.name}
              width={64}
              height={64}
              className="rounded-md bg-white/10 object-cover"
            />
          )}
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-white/80">
              {CATEGORY_LABELS[team.category]}
              {teamSeason && ` · Conférence ${CONFERENCE_LABELS[teamSeason.conference]}`}
              {team.city && ` · ${team.city}`}
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{team.name}</h1>
          </div>
        </div>
      </div>

      <PageContainer>
        <div className="pt-8">
          {averages && averages.gamesPlayed > 0 && (
            <div className="mb-8 grid grid-cols-3 gap-4 sm:grid-cols-6">
              {[
                { label: "PTS", value: averages.points },
                { label: "REB", value: averages.reboundsOff + averages.reboundsDef },
                { label: "PD", value: averages.assists },
                { label: "INT", value: averages.steals },
                { label: "CT", value: averages.blocks },
                { label: "BP", value: averages.turnovers },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg border border-black/10 p-3 text-center">
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-black/60">{stat.label}/match</p>
                </div>
              ))}
            </div>
          )}

          <section id="effectif" className="mb-8 scroll-mt-20">
            <h2 className="mb-3 text-lg font-semibold">Effectif</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {roster.map((entry) => (
                <li key={entry.id}>
                  <Link
                    href={`/joueurs/${entry.player.slug}`}
                    className="flex items-center justify-between rounded-md border border-black/10 px-3 py-2 hover:border-brand"
                  >
                    <span>
                      {entry.player.firstName} {entry.player.lastName}
                      {entry.isCaptain && (
                        <span className="ml-1 text-xs font-semibold text-brand">(C)</span>
                      )}
                    </span>
                    <span className="text-sm text-black/60">
                      {entry.jerseyNumber != null && `#${entry.jerseyNumber}`}{" "}
                      {entry.player.position}
                    </span>
                  </Link>
                </li>
              ))}
              {roster.length === 0 && (
                <p className="text-black/60">
                  Effectif non renseigné pour la saison en cours.
                </p>
              )}
            </ul>
          </section>

          <section id="calendrier" className="scroll-mt-20">
            <h2 className="mb-3 text-lg font-semibold">Calendrier & résultats</h2>
            <ul className="divide-y divide-black/10">
              {games.map((game) => {
                const opponent = game.homeTeamId === team.id ? game.awayTeam : game.homeTeam;
                const isHome = game.homeTeamId === team.id;
                return (
                  <li key={game.id} className="py-3">
                    <Link href={`/matchs/${game.id}`} className="flex items-center justify-between hover:text-brand">
                      <span>
                        {isHome ? "vs" : "@"} {opponent.name}
                      </span>
                      <span className="text-sm text-black/60">
                        {game.status === "FINAL"
                          ? `${game.homeScore} - ${game.awayScore}`
                          : formatDate(game.scheduledAt)}
                      </span>
                    </Link>
                  </li>
                );
              })}
              {games.length === 0 && (
                <p className="py-3 text-black/60">
                  Aucun match programmé pour l’instant.
                </p>
              )}
            </ul>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
