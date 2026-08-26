import { prisma } from "@/lib/prisma";
import { getActiveSeason } from "@/lib/stats";
import { getDisplayAge } from "@/lib/playerDisplay";
import { PlayersExplorer, type PlayerRow } from "@/components/PlayersExplorer";
import { PageContainer } from "@/components/PageContainer";

export default async function PlayersPage() {
  const season = await getActiveSeason();

  const [players, teams] = await Promise.all([
    prisma.player.findMany({
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      include: {
        rosterEntries: {
          include: { team: true, season: true },
          orderBy: { joinedAt: "desc" },
        },
      },
    }),
    prisma.team.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] }),
  ]);

  const rows: PlayerRow[] = players.map((player) => {
    const currentEntry = player.rosterEntries.find(
      (entry) => entry.seasonId === season?.id && entry.isActive
    );
    const lastEntry = player.rosterEntries[0];
    return {
      id: player.id,
      slug: player.slug,
      firstName: player.firstName,
      lastName: player.lastName,
      photoUrl: player.photoUrl,
      teamName: currentEntry?.team.name ?? null,
      teamSlug: currentEntry?.team.slug ?? null,
      teamColor: currentEntry?.team.primaryColor ?? null,
      jerseyNumber: currentEntry?.jerseyNumber ?? null,
      position: player.position,
      secondaryPosition: player.secondaryPosition,
      heightCm: player.heightCm,
      weightKg: player.weightKg,
      age: getDisplayAge(player),
      nationality: player.nationality,
      isCurrent: !!currentEntry,
      lastTeamName: lastEntry?.team.name ?? null,
      lastSeasonLabel: lastEntry?.season.label ?? null,
    };
  });

  return (
    <PageContainer>
      <div>
        <h1 className="mb-1 text-2xl font-bold">Joueurs</h1>
        <p className="mb-6 text-black/60">
          Effectifs, transactions, agents libres et récompenses de la ligue.
        </p>
        <PlayersExplorer
          rows={rows}
          teams={teams.map((t) => ({ slug: t.slug, name: t.name }))}
          seasonLabel={season?.label ?? null}
        />
      </div>
    </PageContainer>
  );
}
