import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getActiveSeason } from "@/lib/stats";

export default async function PlayersPage() {
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
      <h1 className="mb-6 text-2xl font-bold">Joueurs</h1>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {players.map((player) => {
          const currentTeam = player.rosterEntries[0]?.team;
          return (
            <li key={player.id}>
              <Link
                href={`/joueurs/${player.slug}`}
                className="flex items-center justify-between rounded-md border border-black/10 px-3 py-2 hover:border-brand"
              >
                <span>
                  {player.firstName} {player.lastName}
                </span>
                <span className="text-sm text-black/60">
                  {currentTeam?.name ?? "Agent libre"}
                </span>
              </Link>
            </li>
          );
        })}
        {players.length === 0 && (
          <p className="text-black/60">
            Aucun joueur enregistré pour l’instant.
          </p>
        )}
      </ul>
    </div>
  );
}
