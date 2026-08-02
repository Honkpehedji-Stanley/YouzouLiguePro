import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createTeam } from "@/lib/actions/teams";
import { CATEGORY_LABELS } from "@/lib/league";

export default async function AdminTeamsPage() {
  const teams = await prisma.team.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <h1 className="mb-4 text-xl font-bold">Équipes</h1>
        <ul className="divide-y divide-black/10">
          {teams.map((team) => (
            <li key={team.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">{team.name}</p>
                <p className="text-sm text-black/60">
                  {CATEGORY_LABELS[team.category]}
                  {team.city && ` · ${team.city}`}
                </p>
              </div>
              <Link
                href={`/admin/teams/${team.id}`}
                className="text-sm text-brand underline"
              >
                Modifier
              </Link>
            </li>
          ))}
          {teams.length === 0 && (
            <p className="py-3 text-sm text-black/60">
              Aucune équipe pour l’instant.
            </p>
          )}
        </ul>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Ajouter une équipe</h2>
        <form action={createTeam} className="flex flex-col gap-3">
          <input
            name="name"
            placeholder="Nom de l’équipe"
            required
            className="rounded-md border border-black/20 px-3 py-2"
          />
          <select
            name="category"
            required
            defaultValue=""
            className="rounded-md border border-black/20 px-3 py-2"
          >
            <option value="" disabled>
              Catégorie
            </option>
            <option value="HOMMES">Hommes</option>
            <option value="DAMES">Dames</option>
          </select>
          <input
            name="shortName"
            placeholder="Nom court (ex: BBC)"
            className="rounded-md border border-black/20 px-3 py-2"
          />
          <input
            name="city"
            placeholder="Ville (optionnel, franchise sans ville possible)"
            className="rounded-md border border-black/20 px-3 py-2"
          />
          <input
            name="logoUrl"
            placeholder="URL du logo (optionnel)"
            className="rounded-md border border-black/20 px-3 py-2"
          />
          <button
            type="submit"
            className="mt-2 rounded-md bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-dark"
          >
            Créer
          </button>
        </form>
      </div>
    </div>
  );
}
