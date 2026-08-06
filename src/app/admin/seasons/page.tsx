import { prisma } from "@/lib/prisma";
import { createSeason, setActiveSeason } from "@/lib/actions/seasons";
import { cardClass, inputClass, labelClass, primaryButtonClass, sectionTitleClass } from "@/components/admin/formStyles";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR").format(date);
}

export default async function AdminSeasonsPage() {
  const seasons = await prisma.season.findMany({
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div>
        <h1 className="mb-4 text-2xl font-bold">Saisons</h1>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <ul className="divide-y divide-slate-100">
            {seasons.map((season) => {
              const activateWithId = setActiveSeason.bind(null, season.id);
              return (
                <li key={season.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                  <div>
                    <p className="font-medium text-slate-800">
                      {season.label}{" "}
                      {season.isActive && (
                        <span className="ml-1 rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
                          active
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatDate(season.startDate)} – {formatDate(season.endDate)}
                    </p>
                  </div>
                  {!season.isActive && (
                    <form action={activateWithId}>
                      <button type="submit" className="text-sm font-medium text-brand hover:underline">
                        Activer
                      </button>
                    </form>
                  )}
                </li>
              );
            })}
            {seasons.length === 0 && (
              <li className="px-5 py-6 text-center text-sm text-slate-400">Aucune saison pour l&apos;instant.</li>
            )}
          </ul>
        </div>
      </div>

      <div className={cardClass}>
        <h2 className={sectionTitleClass}>Créer une saison</h2>
        <form action={createSeason} className="flex flex-col gap-3">
          <div>
            <label className={labelClass} htmlFor="label">
              Libellé
            </label>
            <input id="label" name="label" placeholder="ex: 2026-2027" required className={inputClass} />
          </div>
          <div className="flex gap-3">
            <div className="w-1/2">
              <label className={labelClass} htmlFor="startDate">
                Début
              </label>
              <input id="startDate" name="startDate" type="date" required className={inputClass} />
            </div>
            <div className="w-1/2">
              <label className={labelClass} htmlFor="endDate">
                Fin
              </label>
              <input id="endDate" name="endDate" type="date" required className={inputClass} />
            </div>
          </div>
          <button type="submit" className={`${primaryButtonClass} mt-1`}>
            Créer
          </button>
        </form>
      </div>
    </div>
  );
}
