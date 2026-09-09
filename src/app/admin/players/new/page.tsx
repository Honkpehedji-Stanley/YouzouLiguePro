import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createPlayer } from "@/lib/actions/players";
import { AgeBirthDateFields } from "@/components/admin/AgeBirthDateFields";
import { NationalityAndHometownFields } from "@/components/admin/NationalityFields";
import { TeamAssignmentFields } from "@/components/admin/TeamAssignmentFields";
import { cardClass, inputClass, labelClass, primaryButtonClass, selectClass, sectionTitleClass } from "@/components/admin/formStyles";
import { SubmitButton } from "@/components/admin/SubmitButton";

const POSITIONS = ["PG", "SG", "SF", "PF", "C"] as const;

export default async function NewPlayerPage() {
  const [teams, seasons] = await Promise.all([
    prisma.team.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] }),
    prisma.season.findMany({ orderBy: { startDate: "desc" } }),
  ]);
  const activeSeason = seasons.find((s) => s.isActive) ?? seasons[0];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/admin/players" className="text-sm text-slate-400 hover:text-brand">
            ← Joueurs
          </Link>
          <h1 className="mt-1 text-2xl font-bold">Nouveau joueur</h1>
        </div>
      </div>

      <form action={createPlayer} className="flex flex-col gap-6">
        <section className={cardClass}>
          <h2 className={sectionTitleClass}>Identité</h2>
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <div className="w-1/2">
                <label className={labelClass} htmlFor="firstName">
                  Prénom(s)
                </label>
                <input id="firstName" name="firstName" required className={inputClass} />
              </div>
              <div className="w-1/2">
                <label className={labelClass} htmlFor="lastName">
                  Nom
                </label>
                <input id="lastName" name="lastName" required className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="photoUrl">
                URL de la photo
              </label>
              <input id="photoUrl" name="photoUrl" placeholder="/players/exemple.webp" className={inputClass} />
            </div>
          </div>
        </section>

        <section className={cardClass}>
          <h2 className={sectionTitleClass}>Profil physique</h2>
          <div className="flex flex-col gap-3">
            <AgeBirthDateFields defaultBirthDate="" defaultAge={null} />
            <div className="flex gap-3">
              <div className="w-1/2">
                <label className={labelClass} htmlFor="heightCm">
                  Taille (cm)
                </label>
                <input id="heightCm" name="heightCm" type="number" min={120} max={230} className={inputClass} />
              </div>
              <div className="w-1/2">
                <label className={labelClass} htmlFor="weightKg">
                  Poids (kg)
                </label>
                <input id="weightKg" name="weightKg" type="number" min={30} max={200} className={inputClass} />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-1/2">
                <label className={labelClass} htmlFor="position">
                  Poste principal
                </label>
                <select id="position" name="position" defaultValue="" className={selectClass}>
                  <option value="">—</option>
                  {POSITIONS.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-1/2">
                <label className={labelClass} htmlFor="secondaryPosition">
                  Poste secondaire
                </label>
                <select id="secondaryPosition" name="secondaryPosition" defaultValue="" className={selectClass}>
                  <option value="">—</option>
                  {POSITIONS.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="experienceYears">
                Années d&apos;expérience
              </label>
              <input
                id="experienceYears"
                name="experienceYears"
                type="number"
                min={0}
                max={30}
                className={`${inputClass} w-1/2`}
              />
            </div>
          </div>
        </section>

        <section className={cardClass}>
          <h2 className={sectionTitleClass}>Origine</h2>
          <NationalityAndHometownFields defaultNationality="" defaultNationality2="" defaultHometown="" />
        </section>

        <section className={cardClass}>
          <h2 className={sectionTitleClass}>Équipe</h2>
          <TeamAssignmentFields teams={teams} seasons={seasons} defaultSeasonId={activeSeason?.id} />
        </section>

        <section className={cardClass}>
          <h2 className={sectionTitleClass}>Présentation</h2>
          <textarea name="bio" rows={4} placeholder="Bio (optionnel)" className={inputClass} />
        </section>

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/players"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Annuler
          </Link>
          <SubmitButton className={primaryButtonClass} pendingText="Création…">
            Créer le joueur
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
