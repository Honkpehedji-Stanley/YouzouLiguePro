import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getActiveSeason, getTeamSeasonAverages } from "@/lib/stats";
import { CATEGORY_LABELS, CONFERENCE_LABELS } from "@/lib/league";
import { PageContainer } from "@/components/PageContainer";
import { TeamRosterList } from "@/components/TeamRosterList";
import { TeamSeasonSelect } from "@/components/TeamSeasonSelect";

const DEFAULT_HERO_COLOR = "#118a43";

const TABS = [
  { key: "effectif", label: "Effectif" },
  { key: "staff", label: "Staff" },
  { key: "calendrier", label: "Calendrier" },
  { key: "statistiques", label: "Statistiques" },
  { key: "nouveautes", label: "Nouveautés" },
  { key: "historique", label: "Historique" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(date);
}

export default async function TeamDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ onglet?: string; saison?: string }>;
}) {
  const { slug } = await params;
  const { onglet, saison } = await searchParams;
  const team = await prisma.team.findUnique({ where: { slug } });
  if (!team) notFound();

  const activeSeason = await getActiveSeason();
  const tab: TabKey = (TABS.find((t) => t.key === onglet)?.key as TabKey) ?? "effectif";

  const teamSeasonEntries = await prisma.teamPlayerSeason.findMany({
    where: { teamId: team.id },
    distinct: ["seasonId"],
    include: { season: true },
    orderBy: { season: { startDate: "desc" } },
  });
  const availableSeasons = teamSeasonEntries.map((e) => e.season);
  const seasonList = availableSeasons.length > 0 ? availableSeasons : activeSeason ? [activeSeason] : [];

  const selectedSeason =
    seasonList.find((s) => s.id === saison) ??
    seasonList.find((s) => s.id === activeSeason?.id) ??
    seasonList[0] ??
    null;

  const [roster, staff, games, averages, teamSeason] = await Promise.all([
    selectedSeason
      ? prisma.teamPlayerSeason.findMany({
          where: { teamId: team.id, seasonId: selectedSeason.id, isActive: true },
          include: { player: true },
          orderBy: { jerseyNumber: "asc" },
        })
      : Promise.resolve([]),
    selectedSeason
      ? prisma.staffMember.findMany({
          where: { teamId: team.id, seasonId: selectedSeason.id, isActive: true },
          orderBy: [{ role: "asc" }, { lastName: "asc" }],
        })
      : Promise.resolve([]),
    selectedSeason
      ? prisma.game.findMany({
          where: {
            seasonId: selectedSeason.id,
            OR: [{ homeTeamId: team.id }, { awayTeamId: team.id }],
          },
          include: { homeTeam: true, awayTeam: true },
          orderBy: { scheduledAt: "asc" },
        })
      : Promise.resolve([]),
    selectedSeason ? getTeamSeasonAverages(team.id, selectedSeason.id) : null,
    selectedSeason
      ? prisma.teamSeason.findUnique({
          where: { teamId_seasonId: { teamId: team.id, seasonId: selectedSeason.id } },
        })
      : null,
  ]);

  const heroColor = team.primaryColor ?? DEFAULT_HERO_COLOR;
  const tabHref = (key: TabKey) =>
    `/equipes/${slug}?onglet=${key}${selectedSeason ? `&saison=${selectedSeason.id}` : ""}`;

  return (
    <div className="-mt-8">
      <div className="px-4 py-8 text-white sm:px-10" style={{ backgroundColor: heroColor }}>
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          {team.logoUrl && (
            <Image
              src={team.logoUrl}
              alt={team.name}
              width={64}
              height={64}
              className="rounded-md bg-white/10 object-cover"
            />
          )}
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-white/80">
              {CATEGORY_LABELS[team.category]}
              {teamSeason && ` · Conférence ${CONFERENCE_LABELS[teamSeason.conference]}`}
              {team.city && ` · ${team.city}`}
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{team.name}</h1>
          </div>
        </div>
      </div>

      <div className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-6xl gap-x-6 overflow-x-auto px-4 text-sm font-semibold">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={tabHref(t.key)}
              className={`-mb-px whitespace-nowrap border-b-2 pb-3 pt-3 transition ${
                tab === t.key ? "border-brand text-brand" : "border-transparent text-black/50 hover:text-black"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      <PageContainer>
        <div className="pt-8">
          {seasonList.length > 0 && ["effectif", "staff", "calendrier", "statistiques"].includes(tab) && (
            <div className="mb-6 flex items-center gap-2">
              <span className="text-sm text-black/50">Saison</span>
              <TeamSeasonSelect
                seasons={seasonList.map((s) => ({ id: s.id, label: s.label }))}
                value={selectedSeason?.id ?? ""}
                onglet={tab}
                slug={slug}
              />
            </div>
          )}

          {tab === "effectif" && (
            <section>
              <TeamRosterList
                roster={roster.map((entry) => ({
                  id: entry.id,
                  jerseyNumber: entry.jerseyNumber,
                  isCaptain: entry.isCaptain,
                  player: {
                    slug: entry.player.slug,
                    firstName: entry.player.firstName,
                    lastName: entry.player.lastName,
                    photoUrl: entry.player.photoUrl,
                    position: entry.player.position,
                    secondaryPosition: entry.player.secondaryPosition,
                  },
                }))}
              />
              {roster.length === 0 && (
                <p className="text-black/60">Effectif non renseigné pour cette saison.</p>
              )}
            </section>
          )}

          {tab === "staff" && (
            <section>
              <ul className="grid gap-2 sm:grid-cols-2">
                {staff.map((member) => (
                  <li
                    key={member.id}
                    className="flex items-center justify-between rounded-md border border-black/10 px-3 py-2"
                  >
                    <span className="font-medium">
                      {member.firstName} {member.lastName}
                    </span>
                    <span className="text-sm text-black/50">{member.role ?? "Staff"}</span>
                  </li>
                ))}
              </ul>
              {staff.length === 0 && (
                <p className="text-black/60">Staff non renseigné pour cette saison.</p>
              )}
            </section>
          )}

          {tab === "calendrier" && (
            <section>
              <ul className="divide-y divide-black/10">
                {games.map((game) => {
                  const opponent = game.homeTeamId === team.id ? game.awayTeam : game.homeTeam;
                  const isHome = game.homeTeamId === team.id;
                  return (
                    <li key={game.id} className="py-3">
                      <Link href={`/matchs/${game.id}`} className="flex items-center justify-between hover:text-brand">
                        <span>
                          {isHome ? "vs" : "@"} {opponent.name}
                        </span>
                        <span className="text-sm text-black/60">
                          {game.status === "FINAL"
                            ? `${game.homeScore} - ${game.awayScore}`
                            : formatDate(game.scheduledAt)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
                {games.length === 0 && (
                  <p className="py-3 text-black/60">Aucun match programmé pour cette saison.</p>
                )}
              </ul>
            </section>
          )}

          {tab === "statistiques" && (
            <section>
              {averages && averages.gamesPlayed > 0 ? (
                <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
                  {[
                    { label: "PTS", value: averages.points },
                    { label: "REB", value: averages.reboundsOff + averages.reboundsDef },
                    { label: "PD", value: averages.assists },
                    { label: "INT", value: averages.steals },
                    { label: "CT", value: averages.blocks },
                    { label: "BP", value: averages.turnovers },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-lg border border-black/10 p-3 text-center">
                      <p className="text-xl font-bold">{stat.value}</p>
                      <p className="text-xs text-black/60">{stat.label}/match</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-black/60">
                  Aucune statistique disponible pour cette saison — les matchs n&apos;ont pas encore été joués.
                </p>
              )}
            </section>
          )}

          {tab === "nouveautes" && (
            <div className="rounded-lg border border-dashed border-black/20 p-8 text-center text-black/60">
              <p className="font-medium">Aucune actualité pour l&apos;instant.</p>
              <p className="mt-1 text-sm">
                Les annonces de transferts, communiqués et faits marquants de {team.name} apparaîtront ici.
              </p>
            </div>
          )}

          {tab === "historique" && (
            <div className="rounded-lg border border-dashed border-black/20 p-8 text-center text-black/60">
              <p className="font-medium">Historique en cours de constitution.</p>
              <p className="mt-1 text-sm">
                Titres, saisons passées et records du club seront ajoutés au fil de la construction de la base de
                données de la ligue.
              </p>
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
