import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  updatePlayer,
  deletePlayer,
  assignPlayerToTeam,
  releasePlayerFromTeam,
} from "@/lib/actions/players";

const POSITIONS = ["PG", "SG", "SF", "PF", "C"] as const;

export default async function AdminPlayerEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [player, teams, seasons] = await Promise.all([
    prisma.player.findUnique({
      where: { id },
      include: {
        rosterEntries: {
          include: { team: true, season: true },
          orderBy: { joinedAt: "desc" },
        },
      },
    }),
    prisma.team.findMany({ orderBy: { name: "asc" } }),
    prisma.season.findMany({ orderBy: { startDate: "desc" } }),
  ]);

  if (!player) notFound();

  const updatePlayerWithId = updatePlayer.bind(null, player.id);
  const deletePlayerWithId = deletePlayer.bind(null, player.id);
  const assignPlayerWithId = assignPlayerToTeam.bind(null, player.id);
  const activeSeason = seasons.find((s) => s.isActive) ?? seasons[0];
  const birthDateValue = player.birthDate
    ? player.birthDate.toISOString().slice(0, 10)
    : "";

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <div>
        <h1 className="mb-4 text-xl font-bold">
          Modifier {player.firstName} {player.lastName}
        </h1>
        <form action={updatePlayerWithId} className="flex flex-col gap-3">
          <div className="flex gap-3">
            <input
              name="firstName"
              defaultValue={player.firstName}
              required
              className="w-1/2 rounded-md border border-black/20 px-3 py-2"
            />
            <input
              name="lastName"
              defaultValue={player.lastName}
              required
              className="w-1/2 rounded-md border border-black/20 px-3 py-2"
            />
          </div>
          <div className="flex gap-3">
            <input
              name="birthDate"
              type="date"
              defaultValue={birthDateValue}
              className="w-1/2 rounded-md border border-black/20 px-3 py-2"
            />
            <input
              name="heightCm"
              type="number"
              defaultValue={player.heightCm ?? ""}
              placeholder="Taille (cm)"
              className="w-1/2 rounded-md border border-black/20 px-3 py-2"
            />
          </div>
          <select
            name="position"
            defaultValue={player.position ?? ""}
            className="rounded-md border border-black/20 px-3 py-2"
          >
            <option value="">Poste (optionnel)</option>
            {POSITIONS.map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </select>
          <input
            name="photoUrl"
            defaultValue={player.photoUrl ?? ""}
            placeholder="URL de la photo"
            className="rounded-md border border-black/20 px-3 py-2"
          />
          <textarea
            name="bio"
            defaultValue={player.bio ?? ""}
            rows={3}
            className="rounded-md border border-black/20 px-3 py-2"
          />
          <button
            type="submit"
            className="mt-2 rounded-md bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-dark"
          >
            Enregistrer
          </button>
        </form>
        <form action={deletePlayerWithId} className="mt-6">
          <button type="submit" className="text-sm text-red-600 underline">
            Supprimer ce joueur
          </button>
        </form>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Affectation à une équipe</h2>
        <form action={assignPlayerWithId} className="mb-6 flex flex-wrap gap-3">
          <select
            name="teamId"
            required
            className="rounded-md border border-black/20 px-3 py-2"
          >
            <option value="">Équipe</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
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
          <input
            name="jerseyNumber"
            type="number"
            placeholder="N°"
            className="w-20 rounded-md border border-black/20 px-3 py-2"
          />
          <button
            type="submit"
            className="rounded-md bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-dark"
          >
            Affecter
          </button>
        </form>

        <h3 className="mb-2 text-sm font-semibold text-black/60">
          Historique
        </h3>
        <ul className="divide-y divide-black/10">
          {player.rosterEntries.map((entry) => {
            const releaseWithIds = releasePlayerFromTeam.bind(
              null,
              entry.id,
              player.id
            );
            return (
              <li key={entry.id} className="flex items-center justify-between py-2 text-sm">
                <span>
                  {entry.team.name} — {entry.season.label}
                  {entry.jerseyNumber != null && ` (#${entry.jerseyNumber})`}
                  {!entry.isActive && " · inactif"}
                </span>
                {entry.isActive && (
                  <form action={releaseWithIds}>
                    <button type="submit" className="text-red-600 underline">
                      Libérer
                    </button>
                  </form>
                )}
              </li>
            );
          })}
          {player.rosterEntries.length === 0 && (
            <p className="py-2 text-sm text-black/60">
              Aucune affectation pour l’instant.
            </p>
          )}
        </ul>
      </div>
    </div>
  );
}
