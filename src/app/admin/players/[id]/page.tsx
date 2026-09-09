import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  updatePlayer,
  deletePlayer,
  assignPlayerToTeam,
  releasePlayerFromTeam,
} from "@/lib/actions/players";
import { AgeBirthDateFields } from "@/components/admin/AgeBirthDateFields";
import { NationalityAndHometownFields } from "@/components/admin/NationalityFields";
import { TeamAssignmentFields } from "@/components/admin/TeamAssignmentFields";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import {
  cardClass,
  dangerLinkClass,
  inputClass,
  labelClass,
  primaryButtonClass,
  selectClass,
  sectionTitleClass,
} from "@/components/admin/formStyles";

const POSITIONS = ["PG", "SG", "SF", "PF", "C"] as const;

export default async function AdminPlayerEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [player, teams, seasons] = await Promise.all([
    prisma.player.findUnique({
      where: { id },
      include: {
        rosterEntries: {
          include: { team: true, season: true },
          orderBy: { joinedAt: "desc" },
        },
      },
    }),
    prisma.team.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] }),
    prisma.season.findMany({ orderBy: { startDate: "desc" } }),
  ]);

  if (!player) notFound();

  const updatePlayerWithId = updatePlayer.bind(null, player.id);
  const deletePlayerWithId = deletePlayer.bind(null, player.id);
  const assignPlayerWithId = assignPlayerToTeam.bind(null, player.id);
  const activeSeason = seasons.find((s) => s.isActive) ?? seasons[0];
  const currentEntry = player.rosterEntries.find(
    (entry) => entry.seasonId === activeSeason?.id && entry.isActive
  );
  const birthDateValue = player.birthDate
    ? player.birthDate.toISOString().slice(0, 10)
    : "";

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/players" className="text-sm text-slate-400 hover:text-brand">
        ← Joueurs
      </Link>
      <h1 className="mt-1 mb-6 text-2xl font-bold">
        {player.firstName} {player.lastName}
      </h1>

      <div className="flex flex-col gap-6">
        <form action={updatePlayerWithId} className="flex flex-col gap-6">
          <section className={cardClass}>
            <h2 className={sectionTitleClass}>Identité</h2>
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <div className="w-1/2">
                  <label className={labelClass} htmlFor="firstName">
                    Prénom(s)
                  </label>
                  <input id="firstName" name="firstName" defaultValue={player.firstName} required className={inputClass} />
                </div>
                <div className="w-1/2">
                  <label className={labelClass} htmlFor="lastName">
                    Nom
                  </label>
                  <input id="lastName" name="lastName" defaultValue={player.lastName} required className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass} htmlFor="photoUrl">
                  URL de la photo
                </label>
                <input id="photoUrl" name="photoUrl" defaultValue={player.photoUrl ?? ""} className={inputClass} />
              </div>
            </div>
          </section>

          <section className={cardClass}>
            <h2 className={sectionTitleClass}>Profil physique</h2>
            <div className="flex flex-col gap-3">
              <AgeBirthDateFields defaultBirthDate={birthDateValue} defaultAge={player.age} />
              <div className="flex gap-3">
                <div className="w-1/2">
                  <label className={labelClass} htmlFor="heightCm">
                    Taille (cm)
                  </label>
                  <input
                    id="heightCm"
                    name="heightCm"
                    type="number"
                    min={120}
                    max={230}
                    defaultValue={player.heightCm ?? ""}
                    className={inputClass}
                  />
                </div>
                <div className="w-1/2">
                  <label className={labelClass} htmlFor="weightKg">
                    Poids (kg)
                  </label>
                  <input
                    id="weightKg"
                    name="weightKg"
                    type="number"
                    min={30}
                    max={200}
                    defaultValue={player.weightKg ?? ""}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-1/2">
                  <label className={labelClass} htmlFor="position">
                    Poste principal
                  </label>
                  <select id="position" name="position" defaultValue={player.position ?? ""} className={selectClass}>
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
                  <select
                    id="secondaryPosition"
                    name="secondaryPosition"
                    defaultValue={player.secondaryPosition ?? ""}
                    className={selectClass}
                  >
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
                  defaultValue={player.experienceYears ?? ""}
                  className={`${inputClass} w-1/2`}
                />
              </div>
            </div>
          </section>

          <section className={cardClass}>
            <h2 className={sectionTitleClass}>Origine</h2>
            <NationalityAndHometownFields
              defaultNationality={player.nationality ?? ""}
              defaultNationality2={player.nationality2 ?? ""}
              defaultHometown={player.hometown ?? ""}
            />
          </section>

          <section className={cardClass}>
            <h2 className={sectionTitleClass}>Présentation</h2>
            <textarea name="bio" rows={4} defaultValue={player.bio ?? ""} className={inputClass} />
          </section>

          <div className="flex justify-end">
            <SubmitButton className={primaryButtonClass}>Enregistrer</SubmitButton>
          </div>
        </form>

        <form action={deletePlayerWithId}>
          <ConfirmSubmitButton
            confirmMessage={`Supprimer définitivement ${player.firstName} ${player.lastName} ? Cette action est irréversible.`}
            className={dangerLinkClass}
          >
            Supprimer ce joueur
          </ConfirmSubmitButton>
        </form>

        <section className={cardClass}>
          <h2 className={sectionTitleClass}>Affectation à une équipe</h2>
          <form action={assignPlayerWithId} className="flex flex-col gap-4">
            <TeamAssignmentFields
              teams={teams}
              seasons={seasons}
              defaultTeamId={currentEntry?.teamId}
              defaultSeasonId={activeSeason?.id}
              defaultJerseyNumber={currentEntry?.jerseyNumber ?? undefined}
              defaultIsCaptain={currentEntry?.isCaptain}
            />
            <SubmitButton className={`${primaryButtonClass} self-start`} pendingText="Affectation…">
              Affecter
            </SubmitButton>
          </form>

          <h3 className="mt-6 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Historique</h3>
          <ul className="divide-y divide-slate-100">
            {player.rosterEntries.map((entry) => {
              const releaseWithIds = releasePlayerFromTeam.bind(null, entry.id, player.id);
              return (
                <li key={entry.id} className="flex items-center justify-between py-2 text-sm text-slate-600">
                  <span>
                    {entry.team.name} — {entry.season.label}
                    {entry.jerseyNumber != null && ` (#${entry.jerseyNumber})`}
                    {entry.isCaptain && " · Capitaine"}
                    {!entry.isActive && " · inactif"}
                  </span>
                  {entry.isActive && (
                    <form action={releaseWithIds}>
                      <ConfirmSubmitButton
                        confirmMessage={`Libérer ${player.firstName} ${player.lastName} de ${entry.team.name} ?`}
                        pendingText="Libération…"
                        className={dangerLinkClass}
                      >
                        Libérer
                      </ConfirmSubmitButton>
                    </form>
                  )}
                </li>
              );
            })}
            {player.rosterEntries.length === 0 && (
              <p className="py-2 text-sm text-slate-400">Aucune affectation pour l&apos;instant.</p>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
