import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NumberStepper } from "@/components/NumberStepper";
import { saveDraftGameStats, finalizeGameStats } from "@/lib/actions/gameEntry";

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function GameEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const game = await prisma.game.findUnique({
    where: { id },
    include: { homeTeam: true, awayTeam: true, season: true },
  });
  if (!game) notFound();

  const [rosterEntries, existingStats] = await Promise.all([
    prisma.teamPlayerSeason.findMany({
      where: {
        seasonId: game.seasonId,
        teamId: { in: [game.homeTeamId, game.awayTeamId] },
        isActive: true,
      },
      include: { player: true },
      orderBy: { jerseyNumber: "asc" },
    }),
    prisma.playerGameStat.findMany({ where: { gameId: game.id } }),
  ]);

  const statsByPlayerId = new Map(existingStats.map((s) => [s.playerId, s]));
  const homeRoster = rosterEntries.filter((r) => r.teamId === game.homeTeamId);
  const awayRoster = rosterEntries.filter((r) => r.teamId === game.awayTeamId);

  const saveDraft = saveDraftGameStats.bind(null, game.id);
  const finalize = finalizeGameStats.bind(null, game.id);

  const renderTeamSection = (
    teamName: string,
    roster: typeof rosterEntries
  ) => (
    <details open className="rounded-lg border border-black/10 dark:border-white/10">
      <summary className="cursor-pointer bg-black/5 px-4 py-3 font-semibold dark:bg-white/5">
        {teamName} ({roster.length} joueurs)
      </summary>
      <div className="divide-y divide-black/10 dark:divide-white/10">
        {roster.map((entry) => {
          const existing = statsByPlayerId.get(entry.playerId);
          const prefix = `stat__${entry.playerId}__`;
          return (
            <div key={entry.id} className="px-4 py-4">
              <p className="mb-3 font-medium">
                {entry.jerseyNumber != null && `#${entry.jerseyNumber} `}
                {entry.player.firstName} {entry.player.lastName}
              </p>
              <div className="flex flex-wrap gap-3">
                <NumberStepper name={`${prefix}points`} label="Pts" defaultValue={existing?.points} />
                <NumberStepper name={`${prefix}reboundsOff`} label="Reb.O" defaultValue={existing?.reboundsOff} />
                <NumberStepper name={`${prefix}reboundsDef`} label="Reb.D" defaultValue={existing?.reboundsDef} />
                <NumberStepper name={`${prefix}assists`} label="Pd" defaultValue={existing?.assists} />
                <NumberStepper name={`${prefix}steals`} label="Int" defaultValue={existing?.steals} />
                <NumberStepper name={`${prefix}blocks`} label="Ct" defaultValue={existing?.blocks} />
                <NumberStepper name={`${prefix}turnovers`} label="Ballons perdus" defaultValue={existing?.turnovers} />
                <NumberStepper name={`${prefix}fouls`} label="Fautes" defaultValue={existing?.fouls} />
                <NumberStepper name={`${prefix}minutes`} label="Min" defaultValue={existing?.minutes} />
              </div>
              <details className="mt-3">
                <summary className="cursor-pointer text-xs text-black/60 dark:text-white/60">
                  Détail des tirs
                </summary>
                <div className="mt-2 flex flex-wrap gap-3">
                  <NumberStepper name={`${prefix}fgMade`} label="2/3pts réussis" defaultValue={existing?.fgMade} />
                  <NumberStepper name={`${prefix}fgAttempted`} label="2/3pts tentés" defaultValue={existing?.fgAttempted} />
                  <NumberStepper name={`${prefix}threeMade`} label="3pts réussis" defaultValue={existing?.threeMade} />
                  <NumberStepper name={`${prefix}threeAttempted`} label="3pts tentés" defaultValue={existing?.threeAttempted} />
                  <NumberStepper name={`${prefix}ftMade`} label="LF réussis" defaultValue={existing?.ftMade} />
                  <NumberStepper name={`${prefix}ftAttempted`} label="LF tentés" defaultValue={existing?.ftAttempted} />
                </div>
              </details>
            </div>
          );
        })}
        {roster.length === 0 && (
          <p className="px-4 py-4 text-sm text-black/60 dark:text-white/60">
            Aucun joueur affecté à cette équipe pour cette saison. Affectez des
            joueurs depuis la page Joueurs avant de saisir ce match.
          </p>
        )}
      </div>
    </details>
  );

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold">
        {game.homeTeam.name} vs {game.awayTeam.name}
      </h1>
      <p className="mb-6 text-sm text-black/60 dark:text-white/60">
        {formatDateTime(game.scheduledAt)} · {game.season.label} ·{" "}
        {game.status === "FINAL" ? "Terminé" : game.status === "LIVE" ? "En cours" : "À venir"}
      </p>

      <form id="game-entry-form" className="flex flex-col gap-6">
        {renderTeamSection(game.homeTeam.name, homeRoster)}
        {renderTeamSection(game.awayTeam.name, awayRoster)}
      </form>

      <div className="mt-6 flex flex-wrap items-end gap-4 border-t border-black/10 pt-6 dark:border-white/10">
        <label className="text-sm">
          Score final {game.homeTeam.shortName ?? game.homeTeam.name} (optionnel, sinon calculé)
          <input
            form="game-entry-form"
            name="homeScoreOverride"
            type="number"
            min={0}
            defaultValue={game.homeScore ?? ""}
            className="mt-1 block w-28 rounded-md border border-black/20 px-3 py-2 dark:border-white/20 dark:bg-black"
          />
        </label>
        <label className="text-sm">
          Score final {game.awayTeam.shortName ?? game.awayTeam.name} (optionnel, sinon calculé)
          <input
            form="game-entry-form"
            name="awayScoreOverride"
            type="number"
            min={0}
            defaultValue={game.awayScore ?? ""}
            className="mt-1 block w-28 rounded-md border border-black/20 px-3 py-2 dark:border-white/20 dark:bg-black"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          form="game-entry-form"
          formAction={saveDraft}
          type="submit"
          className="rounded-md border border-orange-500 px-4 py-2 font-semibold text-orange-500 hover:bg-orange-500/10"
        >
          Enregistrer le brouillon
        </button>
        <button
          form="game-entry-form"
          formAction={finalize}
          type="submit"
          className="rounded-md bg-orange-500 px-4 py-2 font-semibold text-white hover:bg-orange-600"
        >
          Clôturer le match
        </button>
      </div>
    </div>
  );
}
