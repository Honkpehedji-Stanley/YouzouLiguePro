import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createTeam } from "@/lib/actions/teams";
import { CATEGORY_LABELS } from "@/lib/league";
import { cardClass, inputClass, labelClass, primaryButtonClass, selectClass, sectionTitleClass } from "@/components/admin/formStyles";

export default async function AdminTeamsPage() {
  const teams = await prisma.team.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div>
        <h1 className="mb-4 text-2xl font-bold">Équipes</h1>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <ul className="divide-y divide-slate-100">
            {teams.map((team) => (
              <li key={team.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                <div>
                  <p className="font-medium text-slate-800">{team.name}</p>
                  <p className="text-sm text-slate-500">
                    {CATEGORY_LABELS[team.category]}
                    {team.city && ` · ${team.city}`}
                  </p>
                </div>
                <Link href={`/admin/teams/${team.id}`} className="text-sm font-medium text-brand hover:underline">
                  Modifier
                </Link>
              </li>
            ))}
            {teams.length === 0 && (
              <li className="px-5 py-6 text-center text-sm text-slate-400">Aucune équipe pour l&apos;instant.</li>
            )}
          </ul>
        </div>
      </div>

      <div className={cardClass}>
        <h2 className={sectionTitleClass}>Ajouter une équipe</h2>
        <form action={createTeam} className="flex flex-col gap-3">
          <div>
            <label className={labelClass} htmlFor="name">
              Nom de l&apos;équipe
            </label>
            <input id="name" name="name" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="category">
              Catégorie
            </label>
            <select id="category" name="category" required defaultValue="" className={selectClass}>
              <option value="" disabled>
                Catégorie
              </option>
              <option value="HOMMES">Hommes</option>
              <option value="DAMES">Dames</option>
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="shortName">
              Nom court
            </label>
            <input id="shortName" name="shortName" placeholder="ex: BBC" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="city">
              Ville
            </label>
            <input id="city" name="city" placeholder="Optionnel, franchise sans ville possible" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="logoUrl">
              URL du logo
            </label>
            <input id="logoUrl" name="logoUrl" className={inputClass} />
          </div>
          <div className="flex gap-3">
            <div className="w-1/2">
              <label className={labelClass} htmlFor="instagramUrl">
                Instagram
              </label>
              <input id="instagramUrl" name="instagramUrl" placeholder="https://instagram.com/..." className={inputClass} />
            </div>
            <div className="w-1/2">
              <label className={labelClass} htmlFor="facebookUrl">
                Facebook
              </label>
              <input id="facebookUrl" name="facebookUrl" placeholder="https://facebook.com/..." className={inputClass} />
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
