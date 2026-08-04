import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getActiveSeason } from "@/lib/stats";
import { PageContainer } from "@/components/PageContainer";

export default async function FreeAgentsPage() {
  const season = await getActiveSeason();

  const freeAgents = await prisma.player.findMany({
    where: season
      ? { rosterEntries: { none: { seasonId: season.id, isActive: true } } }
      : {},
    include: {
      rosterEntries: {
        include: { team: true, season: true },
        orderBy: { joinedAt: "desc" },
        take: 1,
      },
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return (
    <PageContainer>
    <div>
      <h1 className="mb-1 text-2xl font-bold">Agents libres</h1>
      <p className="mb-8 text-black/60">
        Joueurs sans contrat pour la saison {season?.label ?? "en cours"}.
      </p>

      <ul className="divide-y divide-black/10">
        {freeAgents.map((player) => {
          const lastEntry = player.rosterEntries[0];
          return (
            <li key={player.id} className="flex items-center justify-between py-3">
              <Link
                href={`/joueurs/${player.slug}`}
                className="font-semibold hover:text-brand hover:underline"
              >
                {player.firstName} {player.lastName}
                {player.position && (
                  <span className="ml-2 text-sm font-normal text-black/50">
                    {player.position}
                  </span>
                )}
              </Link>
              <span className="text-sm text-black/50">
                {lastEntry
                  ? `Dernière équipe : ${lastEntry.team.name} (${lastEntry.season.label})`
                  : "Aucune équipe précédente"}
              </span>
            </li>
          );
        })}
        {freeAgents.length === 0 && (
          <li className="py-3 text-black/60">Aucun agent libre pour l’instant.</li>
        )}
      </ul>
    </div>
    </PageContainer>
  );
}
