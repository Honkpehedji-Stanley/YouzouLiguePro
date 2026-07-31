import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

function BoxScoreTable({
  teamName,
  rows,
}: {
  teamName: string;
  rows: {
    playerId: string;
    playerSlug: string;
    playerName: string;
    points: number;
    reboundsOff: number;
    reboundsDef: number;
    assists: number;
    steals: number;
    blocks: number;
    turnovers: number;
    fouls: number;
    minutes: number;
  }[];
}) {
  return (
    <div className="overflow-x-auto">
      <h2 className="mb-3 text-lg font-semibold">{teamName}</h2>
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b border-black/10 text-left dark:border-white/10">
            <th className="py-2 pr-3">Joueur</th>
            <th className="py-2 pr-3 text-right">Min</th>
            <th className="py-2 pr-3 text-right">Pts</th>
            <th className="py-2 pr-3 text-right">Reb</th>
            <th className="py-2 pr-3 text-right">Pd</th>
            <th className="py-2 pr-3 text-right">Int</th>
            <th className="py-2 pr-3 text-right">Ct</th>
            <th className="py-2 pr-3 text-right">BP</th>
            <th className="py-2 pr-3 text-right">F</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.playerId} className="border-b border-black/5 dark:border-white/5">
              <td className="py-2 pr-3">
                <Link href={`/joueurs/${row.playerSlug}`} className="hover:text-orange-500">
                  {row.playerName}
                </Link>
              </td>
              <td className="py-2 pr-3 text-right">{row.minutes}</td>
              <td className="py-2 pr-3 text-right font-semibold">{row.points}</td>
              <td className="py-2 pr-3 text-right">{row.reboundsOff + row.reboundsDef}</td>
              <td className="py-2 pr-3 text-right">{row.assists}</td>
              <td className="py-2 pr-3 text-right">{row.steals}</td>
              <td className="py-2 pr-3 text-right">{row.blocks}</td>
              <td className="py-2 pr-3 text-right">{row.turnovers}</td>
              <td className="py-2 pr-3 text-right">{row.fouls}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={9} className="py-4 text-black/60 dark:text-white/60">
                Aucune statistique enregistrée pour cette équipe.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const game = await prisma.game.findUnique({
    where: { id },
    include: {
      homeTeam: true,
      awayTeam: true,
      season: true,
      stats: { include: { player: true }, orderBy: { points: "desc" } },
    },
  });
  if (!game) notFound();

  const homeRows = game.stats
    .filter((s) => s.teamId === game.homeTeamId)
    .map((s) => ({
      playerId: s.playerId,
      playerSlug: s.player.slug,
      playerName: `${s.player.firstName} ${s.player.lastName}`,
      points: s.points,
      reboundsOff: s.reboundsOff,
      reboundsDef: s.reboundsDef,
      assists: s.assists,
      steals: s.steals,
      blocks: s.blocks,
      turnovers: s.turnovers,
      fouls: s.fouls,
      minutes: s.minutes,
    }));

  const awayRows = game.stats
    .filter((s) => s.teamId === game.awayTeamId)
    .map((s) => ({
      playerId: s.playerId,
      playerSlug: s.player.slug,
      playerName: `${s.player.firstName} ${s.player.lastName}`,
      points: s.points,
      reboundsOff: s.reboundsOff,
      reboundsDef: s.reboundsDef,
      assists: s.assists,
      steals: s.steals,
      blocks: s.blocks,
      turnovers: s.turnovers,
      fouls: s.fouls,
      minutes: s.minutes,
    }));

  return (
    <div>
      <p className="mb-1 text-black/60 dark:text-white/60">
        {game.season.label} · {formatDateTime(game.scheduledAt)}
        {game.venue && ` · ${game.venue}`}
      </p>
      <div className="mb-8 flex items-center justify-between rounded-lg border border-black/10 p-6 dark:border-white/10">
        <Link href={`/equipes/${game.homeTeam.slug}`} className="text-xl font-bold hover:text-orange-500">
          {game.homeTeam.name}
        </Link>
        <div className="text-3xl font-bold">
          {game.status === "FINAL" ? (
            <span>
              {game.homeScore} - {game.awayScore}
            </span>
          ) : (
            <span className="text-lg text-black/60 dark:text-white/60">vs</span>
          )}
        </div>
        <Link href={`/equipes/${game.awayTeam.slug}`} className="text-xl font-bold hover:text-orange-500">
          {game.awayTeam.name}
        </Link>
      </div>

      <div className="flex flex-col gap-10">
        <BoxScoreTable teamName={game.homeTeam.name} rows={homeRows} />
        <BoxScoreTable teamName={game.awayTeam.name} rows={awayRows} />
      </div>
    </div>
  );
}
