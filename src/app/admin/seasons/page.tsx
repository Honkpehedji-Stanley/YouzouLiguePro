import { prisma } from "@/lib/prisma";
import { createSeason, setActiveSeason } from "@/lib/actions/seasons";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR").format(date);
}

export default async function AdminSeasonsPage() {
  const seasons = await prisma.season.findMany({
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <h1 className="mb-4 text-xl font-bold">Saisons</h1>
        <ul className="divide-y divide-black/10">
          {seasons.map((season) => {
            const activateWithId = setActiveSeason.bind(null, season.id);
            return (
              <li key={season.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">
                    {season.label} {season.isActive && "· active"}
                  </p>
                  <p className="text-sm text-black/60">
                    {formatDate(season.startDate)} – {formatDate(season.endDate)}
                  </p>
                </div>
                {!season.isActive && (
                  <form action={activateWithId}>
                    <button type="submit" className="text-sm text-brand underline">
                      Activer
                    </button>
                  </form>
                )}
              </li>
            );
          })}
          {seasons.length === 0 && (
            <p className="py-3 text-sm text-black/60">
              Aucune saison pour l’instant.
            </p>
          )}
        </ul>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Créer une saison</h2>
        <form action={createSeason} className="flex flex-col gap-3">
          <input
            name="label"
            placeholder="Libellé (ex: 2026-2027)"
            required
            className="rounded-md border border-black/20 px-3 py-2"
          />
          <div className="flex gap-3">
            <input
              name="startDate"
              type="date"
              required
              className="w-1/2 rounded-md border border-black/20 px-3 py-2"
            />
            <input
              name="endDate"
              type="date"
              required
              className="w-1/2 rounded-md border border-black/20 px-3 py-2"
            />
          </div>
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
