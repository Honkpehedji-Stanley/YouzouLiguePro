import { prisma } from "@/lib/prisma";
import { getActiveSeason } from "@/lib/stats";
import { bulkUpdatePlayers } from "@/lib/actions/players";
import { NATIONALITIES } from "@/lib/geo";
import { primaryButtonClass } from "@/components/admin/formStyles";

const POSITIONS = ["PG", "SG", "SF", "PF", "C"] as const;
const fieldInputClass =
  "mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

export default async function BulkPlayerEditPage() {
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

  const groups = new Map<string, typeof players>();
  for (const player of players) {
    const teamName = player.rosterEntries[0]?.team.name ?? "Agents libres";
    if (!groups.has(teamName)) groups.set(teamName, []);
    groups.get(teamName)!.push(player);
  }
  const sortedGroups = Array.from(groups.entries()).sort(([a], [b]) =>
    a === "Agents libres" ? 1 : b === "Agents libres" ? -1 : a.localeCompare(b)
  );

  const birthDateValue = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold">Saisie groupée des joueurs</h1>
      <p className="mb-6 text-sm text-black/60">
        Remplis ce que tu sais pour chaque joueur, laisse le reste vide — un seul clic sur
        «&nbsp;Enregistrer&nbsp;» en bas sauvegarde tout d’un coup.
        {season && ` Saison : ${season.label}.`}
      </p>

      <datalist id="nationality-options">
        {NATIONALITIES.map((n) => (
          <option key={n.value} value={n.value} />
        ))}
      </datalist>

      <form action={bulkUpdatePlayers} className="flex flex-col gap-10">
        <button
          type="submit"
          className={`${primaryButtonClass} self-start`}
        >
          Enregistrer tout
        </button>

        {sortedGroups.map(([teamName, teamPlayers]) => (
          <section key={teamName}>
            <h2 className="mb-3 border-b-2 border-brand pb-1 text-lg font-bold">{teamName}</h2>
            <div className="flex flex-col gap-4">
              {teamPlayers.map((player) => {
                const entry = player.rosterEntries[0];
                return (
                  <fieldset
                    key={player.id}
                    className="rounded-lg border border-black/10 p-4"
                  >
                    <legend className="px-1 font-semibold">
                      {player.firstName} {player.lastName}
                    </legend>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
                      {entry && (
                        <label className="text-xs text-black/60">
                          N°
                          <input
                            name={`roster__${entry.id}__jerseyNumber`}
                            type="number"
                            defaultValue={entry.jerseyNumber ?? ""}
                            className={fieldInputClass}
                          />
                        </label>
                      )}
                      <label className="text-xs text-black/60">
                        Poste
                        <select
                          name={`player__${player.id}__position`}
                          defaultValue={player.position ?? ""}
                          className={fieldInputClass}
                        >
                          <option value="">—</option>
                          {POSITIONS.map((pos) => (
                            <option key={pos} value={pos}>
                              {pos}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="text-xs text-black/60">
                        Poste secondaire
                        <select
                          name={`player__${player.id}__secondaryPosition`}
                          defaultValue={player.secondaryPosition ?? ""}
                          className={fieldInputClass}
                        >
                          <option value="">—</option>
                          {POSITIONS.map((pos) => (
                            <option key={pos} value={pos}>
                              {pos}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="text-xs text-black/60">
                        Taille (cm)
                        <input
                          name={`player__${player.id}__heightCm`}
                          type="number"
                          defaultValue={player.heightCm ?? ""}
                          className={fieldInputClass}
                        />
                      </label>
                      <label className="text-xs text-black/60">
                        Poids (kg)
                        <input
                          name={`player__${player.id}__weightKg`}
                          type="number"
                          defaultValue={player.weightKg ?? ""}
                          className={fieldInputClass}
                        />
                      </label>
                      <label className="text-xs text-black/60">
                        Date de naissance
                        <input
                          name={`player__${player.id}__birthDate`}
                          type="date"
                          defaultValue={birthDateValue(player.birthDate)}
                          className={fieldInputClass}
                        />
                      </label>
                      <label className="text-xs text-black/60">
                        Âge (si date inconnue)
                        <input
                          name={`player__${player.id}__age`}
                          type="number"
                          defaultValue={player.age ?? ""}
                          className={fieldInputClass}
                        />
                      </label>
                      <label className="text-xs text-black/60">
                        Nationalité
                        <input
                          name={`player__${player.id}__nationality`}
                          defaultValue={player.nationality ?? ""}
                          list="nationality-options"
                          className={fieldInputClass}
                        />
                      </label>
                      <label className="text-xs text-black/60">
                        Ville natale
                        <input
                          name={`player__${player.id}__hometown`}
                          defaultValue={player.hometown ?? ""}
                          className={fieldInputClass}
                        />
                      </label>
                      <label className="text-xs text-black/60">
                        Expérience (ans)
                        <input
                          name={`player__${player.id}__experienceYears`}
                          type="number"
                          defaultValue={player.experienceYears ?? ""}
                          className={fieldInputClass}
                        />
                      </label>
                    </div>
                  </fieldset>
                );
              })}
            </div>
          </section>
        ))}

        <button
          type="submit"
          className={`${primaryButtonClass} self-start`}
        >
          Enregistrer tout
        </button>
      </form>
    </div>
  );
}
