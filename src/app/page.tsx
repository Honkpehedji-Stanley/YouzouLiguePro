import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getActiveSeason, getStandings } from "@/lib/stats";

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function HomePage() {
  const season = await getActiveSeason();

  const [upcomingGames, recentResults, standings] = await Promise.all([
    season
      ? prisma.game.findMany({
          where: { seasonId: season.id, status: "SCHEDULED" },
          include: { homeTeam: true, awayTeam: true },
          orderBy: { scheduledAt: "asc" },
          take: 5,
        })
      : Promise.resolve([]),
    season
      ? prisma.game.findMany({
          where: { seasonId: season.id, status: "FINAL" },
          include: { homeTeam: true, awayTeam: true },
          orderBy: { scheduledAt: "desc" },
          take: 5,
        })
      : Promise.resolve([]),
    season ? getStandings(season.id) : [],
  ]);

  return (
    <div className="flex flex-col gap-12">
      <section className="rounded-xl border border-black/10 bg-brand/5 p-8">
        <h1 className="text-3xl font-bold sm:text-4xl">
          Bienvenue sur Youzou Ligue Pro
        </h1>
        <p className="mt-3 max-w-2xl text-black/70">
          Le hub des fans de la ligue professionnelle béninoise de basketball :
          équipes, joueurs, calendrier, statistiques et classement, saison
          après saison.
        </p>
        {season && (
          <p className="mt-4 text-sm font-medium text-brand">
            Saison en cours : {season.label}
          </p>
        )}
      </section>

      <div className="grid gap-10 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Derniers résultats</h2>
          <ul className="divide-y divide-black/10">
            {recentResults.map((game) => (
              <li key={game.id} className="py-3">
                <Link href={`/matchs/${game.id}`} className="flex items-center justify-between hover:text-brand">
                  <span>
                    {game.homeTeam.name} vs {game.awayTeam.name}
                  </span>
                  <span className="font-semibold">
                    {game.homeScore} - {game.awayScore}
                  </span>
                </Link>
              </li>
            ))}
            {recentResults.length === 0 && (
              <p className="py-3 text-black/60">
                Aucun résultat pour l’instant.
              </p>
            )}
          </ul>

          <h2 className="mb-4 mt-8 text-lg font-semibold">Prochains matchs</h2>
          <ul className="divide-y divide-black/10">
            {upcomingGames.map((game) => (
              <li key={game.id} className="py-3">
                <Link href={`/matchs/${game.id}`} className="flex items-center justify-between hover:text-brand">
                  <span>
                    {game.homeTeam.name} vs {game.awayTeam.name}
                  </span>
                  <span className="text-sm text-black/60">
                    {formatDateTime(game.scheduledAt)}
                  </span>
                </Link>
              </li>
            ))}
            {upcomingGames.length === 0 && (
              <p className="py-3 text-black/60">
                Aucun match programmé pour l’instant.
              </p>
            )}
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">Classement</h2>
          <ol className="flex flex-col gap-2">
            {standings.slice(0, 5).map((row, index) => (
              <li key={row.teamId} className="flex items-center justify-between text-sm">
                <span>
                  {index + 1}. {row.team.name}
                </span>
                <span className="text-black/60">
                  {row.wins}-{row.losses}
                </span>
              </li>
            ))}
            {standings.length === 0 && (
              <p className="text-black/60">Pas encore de classement.</p>
            )}
          </ol>
          <Link href="/classement" className="mt-4 inline-block text-sm text-brand underline">
            Voir le classement complet
          </Link>
        </section>
      </div>
    </div>
  );
}
