import { prisma } from "@/lib/prisma";
import { getActiveSeason } from "@/lib/stats";
import { getDisplayAge } from "@/lib/playerDisplay";
import { PlayerRosterTable, type RosterRow } from "@/components/PlayerRosterTable";
import { PageContainer } from "@/components/PageContainer";

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

  const rows: RosterRow[] = players.map((player) => {
    const entry = player.rosterEntries[0];
    return {
      id: player.id,
      slug: player.slug,
      firstName: player.firstName,
      lastName: player.lastName,
      photoUrl: player.photoUrl,
      teamName: entry?.team.name ?? null,
      teamSlug: entry?.team.slug ?? null,
      teamColor: entry?.team.primaryColor ?? null,
      jerseyNumber: entry?.jerseyNumber ?? null,
      position: player.position,
      secondaryPosition: player.secondaryPosition,
      heightCm: player.heightCm,
      weightKg: player.weightKg,
      age: getDisplayAge(player),
      nationality: player.nationality,
    };
  });

  return (
    <PageContainer>
      <div>
        <h1 className="mb-1 text-2xl font-bold">Joueurs</h1>
        {season && <p className="mb-6 text-black/60">{season.label}</p>}
        <PlayerRosterTable rows={rows} />
      </div>
    </PageContainer>
  );
}
