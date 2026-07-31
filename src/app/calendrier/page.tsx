import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getActiveSeason } from "@/lib/stats";

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "À venir",
  LIVE: "En cours",
  FINAL: "Terminé",
  POSTPONED: "Reporté",
  CANCELLED: "Annulé",
};

export default async function CalendarPage() {
  const season = await getActiveSeason();
  if (!season) {
    return <p>Aucune saison active pour le moment.</p>;
  }

  const games = await prisma.game.findMany({
    where: { seasonId: season.id },
    include: { homeTeam: true, awayTeam: true },
    orderBy: { scheduledAt: "asc" },
  });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Calendrier</h1>
      <p className="mb-6 text-black/60 dark:text-white/60">{season.label}</p>

      <ul className="divide-y divide-black/10 dark:divide-white/10">
        {games.map((game) => (
          <li key={game.id} className="py-4">
            <Link href={`/matchs/${game.id}`} className="flex items-center justify-between hover:text-orange-500">
              <div>
                <p className="font-medium">
                  {game.homeTeam.name} vs {game.awayTeam.name}
                </p>
                <p className="text-sm text-black/60 dark:text-white/60">
                  {formatDateTime(game.scheduledAt)}
                  {game.venue && ` · ${game.venue}`}
                </p>
              </div>
              <div className="text-right text-sm">
                {game.status === "FINAL" ? (
                  <span className="font-semibold">
                    {game.homeScore} - {game.awayScore}
                  </span>
                ) : (
                  <span className="text-black/60 dark:text-white/60">{STATUS_LABELS[game.status]}</span>
                )}
              </div>
            </Link>
          </li>
        ))}
        {games.length === 0 && (
          <p className="py-4 text-black/60 dark:text-white/60">
            Aucun match programmé pour l’instant.
          </p>
        )}
      </ul>
    </div>
  );
}
