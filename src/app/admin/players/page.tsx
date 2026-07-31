import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createPlayer } from "@/lib/actions/players";

const POSITIONS = ["PG", "SG", "SF", "PF", "C"] as const;

export default async function AdminPlayersPage() {
  const players = await prisma.player.findMany({
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <h1 className="mb-4 text-xl font-bold">Joueurs</h1>
        <ul className="divide-y divide-black/10 dark:divide-white/10">
          {players.map((player) => (
            <li key={player.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">
                  {player.firstName} {player.lastName}
                </p>
                {player.position && (
                  <p className="text-sm text-black/60 dark:text-white/60">
                    {player.position}
                  </p>
                )}
              </div>
              <Link
                href={`/admin/players/${player.id}`}
                className="text-sm text-orange-500 underline"
              >
                Modifier
              </Link>
            </li>
          ))}
          {players.length === 0 && (
            <p className="py-3 text-sm text-black/60 dark:text-white/60">
              Aucun joueur pour l’instant.
            </p>
          )}
        </ul>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Ajouter un joueur</h2>
        <form action={createPlayer} className="flex flex-col gap-3">
          <div className="flex gap-3">
            <input
              name="firstName"
              placeholder="Prénom"
              required
              className="w-1/2 rounded-md border border-black/20 px-3 py-2 dark:border-white/20 dark:bg-black"
            />
            <input
              name="lastName"
              placeholder="Nom"
              required
              className="w-1/2 rounded-md border border-black/20 px-3 py-2 dark:border-white/20 dark:bg-black"
            />
          </div>
          <div className="flex gap-3">
            <input
              name="birthDate"
              type="date"
              className="w-1/2 rounded-md border border-black/20 px-3 py-2 dark:border-white/20 dark:bg-black"
            />
            <input
              name="heightCm"
              type="number"
              placeholder="Taille (cm)"
              className="w-1/2 rounded-md border border-black/20 px-3 py-2 dark:border-white/20 dark:bg-black"
            />
          </div>
          <select
            name="position"
            defaultValue=""
            className="rounded-md border border-black/20 px-3 py-2 dark:border-white/20 dark:bg-black"
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
            placeholder="URL de la photo (optionnel)"
            className="rounded-md border border-black/20 px-3 py-2 dark:border-white/20 dark:bg-black"
          />
          <textarea
            name="bio"
            placeholder="Bio (optionnel)"
            rows={3}
            className="rounded-md border border-black/20 px-3 py-2 dark:border-white/20 dark:bg-black"
          />
          <button
            type="submit"
            className="mt-2 rounded-md bg-orange-500 px-4 py-2 font-semibold text-white hover:bg-orange-600"
          >
            Créer
          </button>
        </form>
      </div>
    </div>
  );
}
