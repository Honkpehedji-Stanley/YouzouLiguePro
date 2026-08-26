import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  updateTeam,
  deleteTeam,
  assignTeamToConference,
  removeTeamFromSeason,
} from "@/lib/actions/teams";
import { CONFERENCE_LABELS } from "@/lib/league";
import {
  cardClass,
  dangerLinkClass,
  inputClass,
  labelClass,
  primaryButtonClass,
  selectClass,
  sectionTitleClass,
} from "@/components/admin/formStyles";

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
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/teams" className="text-sm text-slate-400 hover:text-brand">
        ← Équipes
      </Link>
      <h1 className="mt-1 mb-6 text-2xl font-bold">{team.name}</h1>

      <div className="flex flex-col gap-6">
        <form id="team-edit-form" action={updateTeamWithId} className="flex flex-col gap-6">
          <section className={cardClass}>
            <h2 className={sectionTitleClass}>Informations</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className={labelClass} htmlFor="name">
                  Nom de l&apos;équipe
                </label>
                <input id="name" name="name" defaultValue={team.name} required className={inputClass} />
              </div>
              <div className="flex gap-3">
                <div className="w-1/2">
                  <label className={labelClass} htmlFor="category">
                    Catégorie
                  </label>
                  <select id="category" name="category" defaultValue={team.category} className={selectClass}>
                    <option value="HOMMES">Hommes</option>
                    <option value="DAMES">Dames</option>
                  </select>
                </div>
                <div className="w-1/2">
                  <label className={labelClass} htmlFor="shortName">
                    Nom court
                  </label>
                  <input id="shortName" name="shortName" defaultValue={team.shortName ?? ""} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass} htmlFor="city">
                  Ville
                </label>
                <input
                  id="city"
                  name="city"
                  defaultValue={team.city ?? ""}
                  placeholder="Optionnel, franchise sans ville possible"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="logoUrl">
                  URL du logo
                </label>
                <input id="logoUrl" name="logoUrl" defaultValue={team.logoUrl ?? ""} className={inputClass} />
              </div>
              <div className="flex gap-3">
                <div className="w-1/2">
                  <label className={labelClass} htmlFor="instagramUrl">
                    Instagram
                  </label>
                  <input
                    id="instagramUrl"
                    name="instagramUrl"
                    defaultValue={team.instagramUrl ?? ""}
                    placeholder="https://instagram.com/..."
                    className={inputClass}
                  />
                </div>
                <div className="w-1/2">
                  <label className={labelClass} htmlFor="facebookUrl">
                    Facebook
                  </label>
                  <input
                    id="facebookUrl"
                    name="facebookUrl"
                    defaultValue={team.facebookUrl ?? ""}
                    placeholder="https://facebook.com/..."
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </section>
        </form>

        <div className="flex items-center justify-between">
          <form action={deleteTeamWithId}>
            <button type="submit" className={dangerLinkClass}>
              Supprimer cette équipe
            </button>
          </form>
          <button type="submit" form="team-edit-form" className={primaryButtonClass}>
            Enregistrer
          </button>
        </div>

        <section className={cardClass}>
          <h2 className={sectionTitleClass}>Affectation à une conférence</h2>
          <form action={assignWithId} className="flex flex-wrap items-end gap-3">
            <div>
              <label className={labelClass} htmlFor="seasonId">
                Saison
              </label>
              <select id="seasonId" name="seasonId" required defaultValue={activeSeason?.id} className={selectClass}>
                {seasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="conference">
                Conférence
              </label>
              <select id="conference" name="conference" required defaultValue="" className={selectClass}>
                <option value="" disabled>
                  Conférence
                </option>
                <option value="SUD">Sud</option>
                <option value="NORD">Nord</option>
              </select>
            </div>
            <button type="submit" className={primaryButtonClass}>
              Affecter
            </button>
          </form>

          <h3 className="mt-6 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Historique</h3>
          <ul className="divide-y divide-slate-100">
            {team.seasons.map((ts) => {
              const removeWithIds = removeTeamFromSeason.bind(null, ts.id, team.id);
              return (
                <li key={ts.id} className="flex items-center justify-between py-2 text-sm text-slate-600">
                  <span>
                    {ts.season.label} · Conférence {CONFERENCE_LABELS[ts.conference]}
                  </span>
                  <form action={removeWithIds}>
                    <button type="submit" className={dangerLinkClass}>
                      Retirer
                    </button>
                  </form>
                </li>
              );
            })}
            {team.seasons.length === 0 && (
              <p className="py-2 text-sm text-slate-400">Pas encore affectée à une conférence.</p>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
