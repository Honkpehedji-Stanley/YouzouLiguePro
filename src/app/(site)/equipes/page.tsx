import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getActiveSeason } from "@/lib/stats";
import { CATEGORIES, CATEGORY_LABELS, CONFERENCES, CONFERENCE_LABELS } from "@/lib/league";
import { PageContainer } from "@/components/PageContainer";

export default async function TeamsPage() {
  const season = await getActiveSeason();

  const teamSeasons = season
    ? await prisma.teamSeason.findMany({
        where: { seasonId: season.id },
        include: { team: true },
      })
    : [];

  return (
    <PageContainer>
    <div>
      <h1 className="mb-1 text-2xl font-bold">Toutes les équipes</h1>
      {season && <p className="mb-8 text-black/60">{season.label}</p>}

      {CATEGORIES.map((category) => (
        <section key={category} className="mb-12">
          <h2 className="mb-5 border-b-2 border-brand pb-1 text-lg font-bold">
            {CATEGORY_LABELS[category]}
          </h2>
          <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {CONFERENCES.map((conference) => {
              const entries = teamSeasons.filter(
                (ts) => ts.team.category === category && ts.conference === conference
              );
              return (
                <div key={conference}>
                  <h3 className="mb-2 border-b border-black/10 pb-2 text-sm font-bold uppercase tracking-wide text-black/70">
                    Conférence {CONFERENCE_LABELS[conference]}
                  </h3>
                  <ul className="divide-y divide-black/5">
                    {entries.map(({ team }) => (
                      <li key={team.id} className="flex items-center gap-3 py-3">
                        {team.logoUrl ? (
                          <Image
                            src={team.logoUrl}
                            alt={team.name}
                            width={36}
                            height={36}
                            className="shrink-0 rounded object-cover"
                          />
                        ) : (
                          <div className="h-9 w-9 shrink-0 rounded bg-black/10" />
                        )}
                        <div>
                          <Link
                            href={`/equipes/${team.slug}`}
                            className="font-semibold hover:text-brand hover:underline"
                          >
                            {team.name}
                          </Link>
                          <div className="mt-0.5 flex gap-2 text-xs text-black/50">
                            <Link
                              href={`/equipes/${team.slug}?onglet=effectif`}
                              className="hover:text-brand hover:underline"
                            >
                              Effectif
                            </Link>
                            <span>·</span>
                            <Link
                              href={`/equipes/${team.slug}?onglet=calendrier`}
                              className="hover:text-brand hover:underline"
                            >
                              Calendrier
                            </Link>
                          </div>
                        </div>
                      </li>
                    ))}
                    {entries.length === 0 && (
                      <li className="py-3 text-sm text-black/60">
                        Aucune équipe pour l’instant.
                      </li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
    </PageContainer>
  );
}
