import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { saveDraftGameStats, finalizeGameStats } from "@/lib/actions/gameEntry";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { PlayerStatRow } from "@/components/admin/PlayerStatRow";
import { cardClass, inputClass, labelClass, primaryButtonClass } from "@/components/admin/formStyles";

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
};

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

  const renderTeamSection = (teamName: string, roster: typeof rosterEntries) => (
    <details open className={cardClass}>
      <summary className="-m-6 mb-0 cursor-pointer rounded-2xl px-6 py-4 font-semibold text-slate-800 open:rounded-b-none open:border-b open:border-slate-200">
        {teamName} <span className="font-normal text-slate-400">({roster.length} joueurs)</span>
      </summary>
      <div className="divide-y divide-slate-100">
        {roster.map((entry) => {
          const existing = statsByPlayerId.get(entry.playerId);
          const prefix = `stat__${entry.playerId}__`;
          const playerName = `${entry.jerseyNumber != null ? `#${entry.jerseyNumber} ` : ""}${entry.player.firstName} ${entry.player.lastName}`;
          return <PlayerStatRow key={entry.id} playerName={playerName} prefix={prefix} existing={existing} />;
        })}
        {roster.length === 0 && (
          <p className="py-4 text-sm text-slate-500">
            Aucun joueur affecté à cette équipe pour cette saison. Affectez des joueurs depuis la page Joueurs
            avant de saisir ce match.
          </p>
        )}
      </div>
    </details>
  );

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/schedule" className="text-sm text-slate-400 hover:text-brand">
        ← Calendrier
      </Link>
      <h1 className="mt-1 text-2xl font-bold">
        {game.homeTeam.name} vs {game.awayTeam.name}
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        {formatDateTime(game.scheduledAt)} · {game.season.label} · {STATUS_LABELS[game.status] ?? game.status}
      </p>

      <form className="flex flex-col gap-6">
        {renderTeamSection(game.homeTeam.name, homeRoster)}
        {renderTeamSection(game.awayTeam.name, awayRoster)}

        <section className={cardClass}>
          <div className="flex flex-wrap gap-4">
            <div className="w-40">
              <label className={labelClass} htmlFor="homeScoreOverride">
                Score final {game.homeTeam.shortName ?? game.homeTeam.name}
              </label>
              <input
                id="homeScoreOverride"
                name="homeScoreOverride"
                type="number"
                min={0}
                defaultValue={game.homeScore ?? ""}
                placeholder="Calculé auto."
                className={inputClass}
              />
            </div>
            <div className="w-40">
              <label className={labelClass} htmlFor="awayScoreOverride">
                Score final {game.awayTeam.shortName ?? game.awayTeam.name}
              </label>
              <input
                id="awayScoreOverride"
                name="awayScoreOverride"
                type="number"
                min={0}
                defaultValue={game.awayScore ?? ""}
                placeholder="Calculé auto."
                className={inputClass}
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Laisse ces champs vides pour calculer le score automatiquement à partir des points saisis ci-dessus.
          </p>
        </section>

        <div className="flex flex-wrap gap-3">
          <SubmitButton
            formAction={saveDraft}
            pendingText="Enregistrement du brouillon…"
            className="inline-flex items-center justify-center rounded-lg border border-brand px-5 py-2.5 text-sm font-semibold text-brand transition hover:bg-brand/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Enregistrer le brouillon
          </SubmitButton>
          <SubmitButton formAction={finalize} pendingText="Clôture du match…" className={primaryButtonClass}>
            Clôturer le match
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
