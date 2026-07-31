import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateTeam, deleteTeam } from "@/lib/actions/teams";

export default async function AdminTeamEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const team = await prisma.team.findUnique({ where: { id } });
  if (!team) notFound();

  const updateTeamWithId = updateTeam.bind(null, team.id);
  const deleteTeamWithId = deleteTeam.bind(null, team.id);

  return (
    <div className="max-w-md">
      <h1 className="mb-4 text-xl font-bold">Modifier {team.name}</h1>
      <form action={updateTeamWithId} className="flex flex-col gap-3">
        <label className="text-sm font-medium">
          Nom de l’équipe
          <input
            name="name"
            defaultValue={team.name}
            required
            className="mt-1 w-full rounded-md border border-black/20 px-3 py-2 dark:border-white/20 dark:bg-black"
          />
        </label>
        <label className="text-sm font-medium">
          Nom court
          <input
            name="shortName"
            defaultValue={team.shortName ?? ""}
            className="mt-1 w-full rounded-md border border-black/20 px-3 py-2 dark:border-white/20 dark:bg-black"
          />
        </label>
        <label className="text-sm font-medium">
          Ville
          <input
            name="city"
            defaultValue={team.city ?? ""}
            className="mt-1 w-full rounded-md border border-black/20 px-3 py-2 dark:border-white/20 dark:bg-black"
          />
        </label>
        <label className="text-sm font-medium">
          URL du logo
          <input
            name="logoUrl"
            defaultValue={team.logoUrl ?? ""}
            className="mt-1 w-full rounded-md border border-black/20 px-3 py-2 dark:border-white/20 dark:bg-black"
          />
        </label>
        <button
          type="submit"
          className="mt-2 rounded-md bg-orange-500 px-4 py-2 font-semibold text-white hover:bg-orange-600"
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
  );
}
