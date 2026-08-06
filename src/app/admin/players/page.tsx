import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getActiveSeason } from "@/lib/stats";
import { primaryButtonClass } from "@/components/admin/formStyles";

export default async function AdminPlayersPage() {
  const season = await getActiveSeason();

  const players = await prisma.player.findMany({
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    include: {
      rosterEntries: {
        where: { seasonId: season?.id ?? "__no-active-season__", isActive: true },
        include: { team: true },
      },
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Joueurs</h1>
          <p className="mt-1 text-sm text-slate-500">{players.length} joueurs enregistrés.</p>
        </div>
        <Link href="/admin/players/new" className={primaryButtonClass}>
          + Nouveau joueur
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3">Joueur</th>
              <th className="px-5 py-3">Équipe</th>
              <th className="px-5 py-3">N°</th>
              <th className="px-5 py-3">Poste</th>
              <th className="px-5 py-3">Nationalité</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {players.map((player) => {
              const entry = player.rosterEntries[0];
              return (
                <tr key={player.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">
                    {player.firstName} {player.lastName}
                    {entry?.isCaptain && <span className="ml-1.5 text-xs font-semibold text-brand">(C)</span>}
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {entry ? entry.team.name : <span className="text-slate-400">Agent libre</span>}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{entry?.jerseyNumber ?? "—"}</td>
                  <td className="px-5 py-3 text-slate-600">
                    {player.position ?? "—"}
                    {player.secondaryPosition && ` / ${player.secondaryPosition}`}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{player.nationality ?? "—"}</td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/admin/players/${player.id}`} className="text-sm font-medium text-brand hover:underline">
                      Modifier
                    </Link>
                  </td>
                </tr>
              );
            })}
            {players.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-sm text-slate-400">
                  Aucun joueur pour l&apos;instant.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
