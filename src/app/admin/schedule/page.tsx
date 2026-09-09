import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createGame, deleteGame } from "@/lib/actions/games";
import { cardClass, inputClass, labelClass, primaryButtonClass, selectClass, sectionTitleClass } from "@/components/admin/formStyles";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { GameTeamSelects } from "@/components/admin/GameTeamSelects";

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

const STATUS_STYLES: Record<string, string> = {
  SCHEDULED: "bg-slate-100 text-slate-600",
  LIVE: "bg-red-100 text-red-600",
  FINAL: "bg-emerald-100 text-emerald-700",
  POSTPONED: "bg-amber-100 text-amber-700",
  CANCELLED: "bg-slate-100 text-slate-400",
};

export default async function AdminSchedulePage() {
  const [games, teams, seasons] = await Promise.all([
    prisma.game.findMany({
      include: { homeTeam: true, awayTeam: true, season: true },
      orderBy: { scheduledAt: "desc" },
      take: 50,
    }),
    prisma.team.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] }),
    prisma.season.findMany({ orderBy: { startDate: "desc" } }),
  ]);
  const activeSeason = seasons.find((s) => s.isActive) ?? seasons[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div>
        <h1 className="mb-4 text-2xl font-bold">Calendrier</h1>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <ul className="divide-y divide-slate-100">
            {games.map((game) => {
              const deleteGameWithId = deleteGame.bind(null, game.id);
              return (
                <li key={game.id} className="px-5 py-3 hover:bg-slate-50">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-800">
                      {game.homeTeam.name} vs {game.awayTeam.name}
                    </p>
                    <div className="flex shrink-0 items-center gap-3">
                      <Link href={`/admin/games/${game.id}/entry`} className="text-sm font-medium text-brand hover:underline">
                        Saisir le match
                      </Link>
                      <form action={deleteGameWithId}>
                        <ConfirmSubmitButton
                          confirmMessage={`Supprimer le match ${game.homeTeam.name} vs ${game.awayTeam.name} ? Les statistiques déjà saisies seront perdues.`}
                          pendingText="Suppression…"
                          className="text-sm font-medium text-red-600 hover:underline"
                        >
                          Supprimer
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                    <span>{formatDateTime(game.scheduledAt)} · {game.season.label}</span>
                    {game.phase && <span>· {game.phase}</span>}
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[game.status]}`}>
                      {STATUS_LABELS[game.status]}
                    </span>
                    {game.status === "FINAL" && (
                      <span className="font-semibold text-slate-700">
                        {game.homeScore} - {game.awayScore}
                      </span>
                    )}
                  </p>
                </li>
              );
            })}
            {games.length === 0 && (
              <li className="px-5 py-6 text-center text-sm text-slate-400">Aucun match programmé.</li>
            )}
          </ul>
        </div>
      </div>

      <div className={cardClass}>
        <h2 className={sectionTitleClass}>Programmer un match</h2>
        <form action={createGame} className="flex flex-col gap-3">
          <div>
            <label className={labelClass} htmlFor="seasonId">
              Saison
            </label>
            <select id="seasonId" name="seasonId" required defaultValue={activeSeason?.id} className={selectClass}>
              {seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.label}
                </option>
              ))}
            </select>
          </div>
          <GameTeamSelects teams={teams} />
          <div>
            <label className={labelClass} htmlFor="scheduledAt">
              Date et heure
            </label>
            <input id="scheduledAt" name="scheduledAt" type="datetime-local" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="venue">
              Lieu
            </label>
            <input id="venue" name="venue" placeholder="Optionnel" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="phase">
              Phase
            </label>
            <input
              id="phase"
              name="phase"
              list="phase-options"
              placeholder="Optionnel : Phase 1, Final 4…"
              className={inputClass}
            />
            <datalist id="phase-options">
              <option value="Phase 1" />
              <option value="Phase 2" />
              <option value="Phase 3" />
              <option value="Final 4" />
            </datalist>
          </div>
          <SubmitButton className={`${primaryButtonClass} mt-1`} pendingText="Programmation…">
            Programmer
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
