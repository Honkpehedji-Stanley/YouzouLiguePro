import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  getActiveSeason,
  getPlayerSeasonAverages,
  getPlayerCareerAverages,
} from "@/lib/stats";
import { getDisplayAge, formatBirthDate, initials } from "@/lib/playerDisplay";
import { PageContainer } from "@/components/PageContainer";

const DEFAULT_HERO_COLOR = "#118a43";

function StatBlock({
  label,
  averages,
}: {
  label: string;
  averages: Awaited<ReturnType<typeof getPlayerSeasonAverages>>;
}) {
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
          <div key={stat.l} className="rounded-lg border border-black/10 p-3 text-center">
            <p className="text-xl font-bold">{stat.v}</p>
            <p className="text-xs text-black/60">{stat.l}/match</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-sm text-black/60">
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
  const currentEntry = season
    ? player.rosterEntries.find((e) => e.seasonId === season.id && e.isActive)
    : undefined;

  const [seasonAverages, careerAverages, teammates] = await Promise.all([
    season ? getPlayerSeasonAverages(player.id, season.id) : null,
    getPlayerCareerAverages(player.id),
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

  const infoItems = [
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
  ].filter((item) => item.value);

  return (
    <div className="-mt-8">
      <div className="px-4 py-8 text-white sm:px-10" style={{ backgroundColor: heroColor }}>
        <div className="mx-auto flex max-w-6xl items-center gap-6">
          {currentEntry?.team.logoUrl && (
            <Image
              src={currentEntry.team.logoUrl}
              alt={currentEntry.team.name}
              width={56}
              height={56}
              className="rounded-md bg-white/10 object-cover"
            />
          )}
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-white/80">
              {currentEntry ? (
                <>
                  {currentEntry.team.name}
                  {currentEntry.jerseyNumber != null && ` · #${currentEntry.jerseyNumber}`}
                  {player.position && ` · ${player.position}`}
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
        <div className="mx-auto grid max-w-6xl grid-cols-3 gap-4 px-4 py-4 sm:px-10">
          {[
            {
              l: "PTS/MATCH",
              v: seasonAverages && seasonAverages.gamesPlayed > 0 ? seasonAverages.points : "—",
            },
            {
              l: "REB/MATCH",
              v:
                seasonAverages && seasonAverages.gamesPlayed > 0
                  ? seasonAverages.reboundsOff + seasonAverages.reboundsDef
                  : "—",
            },
            {
              l: "PD/MATCH",
              v: seasonAverages && seasonAverages.gamesPlayed > 0 ? seasonAverages.assists : "—",
            },
          ].map((stat) => (
            <div key={stat.l} className="text-center">
              <p className="text-2xl font-bold">{stat.v}</p>
              <p className="text-xs text-white/60">{stat.l}</p>
            </div>
          ))}
        </div>
        {infoItems.length > 0 && (
          <div className="mx-auto flex max-w-6xl flex-wrap gap-x-8 gap-y-2 border-t border-white/10 px-4 py-3 text-xs sm:px-10">
            {infoItems.map((item) => (
              <div key={item.label}>
                <span className="text-white/50">{item.label}: </span>
                <span className="font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <PageContainer>
        <div className="flex flex-col gap-10 py-8">
          {player.bio && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Biographie</h2>
              <p className="max-w-2xl text-black/80">{player.bio}</p>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-lg font-semibold">Statistiques</h2>
            <div className="flex flex-col gap-8">
              {seasonAverages && seasonAverages.gamesPlayed > 0 && (
                <StatBlock label={`Saison ${season?.label}`} averages={seasonAverages} />
              )}
              {careerAverages.gamesPlayed > 0 && (
                <StatBlock label="Carrière" averages={careerAverages} />
              )}
              {careerAverages.gamesPlayed === 0 && (
                <p className="text-black/60">Aucune statistique enregistrée pour l’instant.</p>
              )}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">Highlights</h2>
            <p className="text-black/60">Aucun highlight disponible pour l’instant.</p>
          </section>

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
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/10 text-xs font-bold text-black/60">
                      {initials(entry.player.firstName, entry.player.lastName)}
                    </span>
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
