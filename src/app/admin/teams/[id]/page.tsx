import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  updateTeam,
  deleteTeam,
  assignTeamToConference,
  removeTeamFromSeason,
} from "@/lib/actions/teams";
import { CONFERENCE_LABELS } from "@/lib/league";

export default async function AdminTeamEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [team, seasons] = await Promise.all([
    prisma.team.findUnique({
      where: { id },
      include: { seasons: { include: { season: true }, orderBy: { createdAt: "desc" } } },
    }),
    prisma.season.findMany({ orderBy: { startDate: "desc" } }),
  ]);
  if (!team) notFound();

  const updateTeamWithId = updateTeam.bind(null, team.id);
  const deleteTeamWithId = deleteTeam.bind(null, team.id);
  const assignWithId = assignTeamToConference.bind(null, team.id);
  const activeSeason = seasons.find((s) => s.isActive) ?? seasons[0];

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <div>
        <h1 className="mb-4 text-xl font-bold">Modifier {team.name}</h1>
        <form action={updateTeamWithId} className="flex flex-col gap-3">
          <label className="text-sm font-medium">
            Nom de l’équipe
            <input
              name="name"
              defaultValue={team.name}
              required
              className="mt-1 w-full rounded-md border border-black/20 px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium">
            Catégorie
            <select
              name="category"
              defaultValue={team.category}
              className="mt-1 w-full rounded-md border border-black/20 px-3 py-2"
            >
              <option value="HOMMES">Hommes</option>
              <option value="DAMES">Dames</option>
            </select>
          </label>
          <label className="text-sm font-medium">
            Nom court
            <input
              name="shortName"
              defaultValue={team.shortName ?? ""}
              className="mt-1 w-full rounded-md border border-black/20 px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium">
            Ville
            <input
              name="city"
              defaultValue={team.city ?? ""}
              placeholder="Optionnel, franchise sans ville possible"
              className="mt-1 w-full rounded-md border border-black/20 px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium">
            URL du logo
            <input
              name="logoUrl"
              defaultValue={team.logoUrl ?? ""}
              className="mt-1 w-full rounded-md border border-black/20 px-3 py-2"
            />
          </label>
          <button
            type="submit"
            className="mt-2 rounded-md bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-dark"
          >
            Enregistrer
          </button>
        </form>
        <form action={deleteTeamWithId} className="mt-6">
          <button type="submit" className="text-sm text-red-600 underline">
            Supprimer cette équipe
          </button>
        </form>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Affectation à une conférence</h2>
        <form action={assignWithId} className="mb-6 flex flex-wrap gap-3">
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
          <select
            name="conference"
            required
            defaultValue=""
            className="rounded-md border border-black/20 px-3 py-2"
          >
            <option value="" disabled>
              Conférence
            </option>
            <option value="SUD">Sud</option>
            <option value="NORD">Nord</option>
          </select>
          <button
            type="submit"
            className="rounded-md bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-dark"
          >
            Affecter
          </button>
        </form>

        <h3 className="mb-2 text-sm font-semibold text-black/60">Historique</h3>
        <ul className="divide-y divide-black/10">
          {team.seasons.map((ts) => {
            const removeWithIds = removeTeamFromSeason.bind(null, ts.id, team.id);
            return (
              <li key={ts.id} className="flex items-center justify-between py-2 text-sm">
                <span>
                  {ts.season.label} · Conférence {CONFERENCE_LABELS[ts.conference]}
                </span>
                <form action={removeWithIds}>
                  <button type="submit" className="text-red-600 underline">
                    Retirer
                  </button>
                </form>
              </li>
            );
          })}
          {team.seasons.length === 0 && (
            <p className="py-2 text-sm text-black/60">
              Pas encore affectée à une conférence.
            </p>
          )}
        </ul>
      </div>
    </div>
  );
}
