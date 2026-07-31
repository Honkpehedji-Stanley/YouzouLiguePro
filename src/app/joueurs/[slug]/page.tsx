import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  getActiveSeason,
  getPlayerSeasonAverages,
  getPlayerCareerAverages,
} from "@/lib/stats";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date);
}

function StatBlock({ label, averages }: { label: string; averages: Awaited<ReturnType<typeof getPlayerSeasonAverages>> }) {
  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">{label}</h2>
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
        {[
          { l: "PTS", v: averages.points },
          { l: "REB", v: averages.reboundsOff + averages.reboundsDef },
          { l: "PD", v: averages.assists },
          { l: "INT", v: averages.steals },
          { l: "CT", v: averages.blocks },
          { l: "BP", v: averages.turnovers },
        ].map((stat) => (
          <div key={stat.l} className="rounded-lg border border-black/10 p-3 text-center dark:border-white/10">
            <p className="text-xl font-bold">{stat.v}</p>
            <p className="text-xs text-black/60 dark:text-white/60">{stat.l}/match</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-sm text-black/60 dark:text-white/60">
        {averages.gamesPlayed} match{averages.gamesPlayed > 1 ? "s" : ""} joué
        {averages.gamesPlayed > 1 ? "s" : ""}
      </p>
    </div>
  );
}

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
  const currentTeamEntry = season
    ? player.rosterEntries.find((e) => e.seasonId === season.id && e.isActive)
    : undefined;

  const [seasonAverages, careerAverages] = await Promise.all([
    season ? getPlayerSeasonAverages(player.id, season.id) : null,
    getPlayerCareerAverages(player.id),
  ]);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">
        {player.firstName} {player.lastName}
      </h1>
      <p className="mb-6 text-black/60 dark:text-white/60">
        {currentTeamEntry ? (
          <>
            <Link href={`/equipes/${currentTeamEntry.team.slug}`} className="hover:text-orange-500">
              {currentTeamEntry.team.name}
            </Link>
            {currentTeamEntry.jerseyNumber != null && ` · #${currentTeamEntry.jerseyNumber}`}
          </>
        ) : (
          "Agent libre"
        )}
        {player.position && ` · ${player.position}`}
        {player.heightCm && ` · ${player.heightCm} cm`}
      </p>

      {player.bio && <p className="mb-8 max-w-2xl">{player.bio}</p>}

      {player.birthDate && (
        <p className="mb-8 text-sm text-black/60 dark:text-white/60">
          Né le {formatDate(player.birthDate)}
        </p>
      )}

      <div className="flex flex-col gap-10">
        {seasonAverages && seasonAverages.gamesPlayed > 0 && (
          <StatBlock label={`Saison ${season?.label}`} averages={seasonAverages} />
        )}
        {careerAverages.gamesPlayed > 0 && (
          <StatBlock label="Carrière" averages={careerAverages} />
        )}
        {careerAverages.gamesPlayed === 0 && (
          <p className="text-black/60 dark:text-white/60">
            Aucune statistique enregistrée pour l’instant.
          </p>
        )}
      </div>
    </div>
  );
}
