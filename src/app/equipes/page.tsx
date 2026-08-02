import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getActiveSeason } from "@/lib/stats";
import { CATEGORIES, CATEGORY_LABELS, CONFERENCES, CONFERENCE_LABELS } from "@/lib/league";

export default async function TeamsPage() {
  const season = await getActiveSeason();

  const teamSeasons = season
    ? await prisma.teamSeason.findMany({
        where: { seasonId: season.id },
        include: { team: true },
      })
    : [];

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Équipes</h1>
      {season && <p className="mb-6 text-black/60">{season.label}</p>}

      {CATEGORIES.map((category) => (
        <section key={category} className="mb-10">
          <h2 className="mb-4 text-xl font-bold">{CATEGORY_LABELS[category]}</h2>
          {CONFERENCES.map((conference) => {
            const entries = teamSeasons.filter(
              (ts) => ts.team.category === category && ts.conference === conference
            );
            return (
              <div key={conference} className="mb-6">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-black/60">
                  Conférence {CONFERENCE_LABELS[conference]}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {entries.map(({ team }) => (
                    <Link
                      key={team.id}
                      href={`/equipes/${team.slug}`}
                      className="flex items-center gap-3 rounded-lg border border-black/10 p-4 hover:border-brand"
                    >
                      {team.logoUrl ? (
                        <Image
                          src={team.logoUrl}
                          alt={team.name}
                          width={48}
                          height={48}
                          className="rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-md bg-black/10" />
                      )}
                      <div>
                        <p className="font-semibold">{team.name}</p>
                        {team.city && (
                          <p className="text-sm text-black/60">{team.city}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                  {entries.length === 0 && (
                    <p className="text-sm text-black/60">Aucune équipe pour l’instant.</p>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
