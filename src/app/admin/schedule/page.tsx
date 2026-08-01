import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createGame } from "@/lib/actions/games";

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
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

export default async function AdminSchedulePage() {
  const [games, teams, seasons] = await Promise.all([
    prisma.game.findMany({
      include: { homeTeam: true, awayTeam: true, season: true },
      orderBy: { scheduledAt: "desc" },
      take: 50,
    }),
    prisma.team.findMany({ orderBy: { name: "asc" } }),
    prisma.season.findMany({ orderBy: { startDate: "desc" } }),
  ]);
  const activeSeason = seasons.find((s) => s.isActive) ?? seasons[0];

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <h1 className="mb-4 text-xl font-bold">Calendrier</h1>
        <ul className="divide-y divide-black/10">
          {games.map((game) => (
            <li key={game.id} className="py-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">
                  {game.homeTeam.name} vs {game.awayTeam.name}
                </p>
                <Link
                  href={`/admin/games/${game.id}/entry`}
                  className="text-sm text-brand underline"
                >
                  Saisir le match
                </Link>
              </div>
              <p className="text-sm text-black/60">
                {formatDateTime(game.scheduledAt)} · {game.season.label} ·{" "}
                {STATUS_LABELS[game.status]}
                {game.status === "FINAL" &&
                  ` · ${game.homeScore} - ${game.awayScore}`}
              </p>
            </li>
          ))}
          {games.length === 0 && (
            <p className="py-3 text-sm text-black/60">
              Aucun match programmé.
            </p>
          )}
        </ul>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Programmer un match</h2>
        <form action={createGame} className="flex flex-col gap-3">
          <select
            name="seasonId"
            required
            defaultValue={activeSeason?.id}
            className="rounded-md border border-black/20 px-3 py-2"
          >
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.label}
              </option>
            ))}
          </select>
          <select
            name="homeTeamId"
            required
            className="rounded-md border border-black/20 px-3 py-2"
          >
            <option value="">Équipe à domicile</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
          <select
            name="awayTeamId"
            required
            className="rounded-md border border-black/20 px-3 py-2"
          >
            <option value="">Équipe à l’extérieur</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
          <input
            name="scheduledAt"
            type="datetime-local"
            required
            className="rounded-md border border-black/20 px-3 py-2"
          />
          <input
            name="venue"
            placeholder="Lieu (optionnel)"
            className="rounded-md border border-black/20 px-3 py-2"
          />
          <button
            type="submit"
            className="mt-2 rounded-md bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-dark"
          >
            Programmer
          </button>
        </form>
      </div>
    </div>
  );
}
