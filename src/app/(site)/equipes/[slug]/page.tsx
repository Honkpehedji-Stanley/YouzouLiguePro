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
      <div
        className="relative overflow-hidden px-4 py-8 text-white sm:px-10"
        style={{ backgroundColor: heroColor }}
      >
        {team.logoUrl && (
          <Image
            src={team.logoUrl}
            alt=""
            aria-hidden
            width={400}
            height={400}
            className="pointer-events-none absolute -right-10 top-1/2 h-[220%] w-auto -translate-y-1/2 object-contain opacity-15"
          />
        )}
        <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-4">
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
          {(team.instagramUrl || team.facebookUrl) && (
            <div className="flex shrink-0 items-center gap-3">
              {team.instagramUrl && (
                <a
                  href={team.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${team.name} sur Instagram`}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M12 2.2c3.2 0 3.58.01 4.85.07 1.17.05 1.97.24 2.43.4a4.9 4.9 0 0 1 1.77 1.15c.53.53.86 1.05 1.15 1.77.16.46.35 1.26.4 2.43.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.24 1.97-.4 2.43a4.9 4.9 0 0 1-1.15 1.77 4.9 4.9 0 0 1-1.77 1.15c-.46.16-1.26.35-2.43.4-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.97-.24-2.43-.4a4.9 4.9 0 0 1-1.77-1.15 4.9 4.9 0 0 1-1.15-1.77c-.16-.46-.35-1.26-.4-2.43C2.21 15.58 2.2 15.2 2.2 12s.01-3.58.07-4.85c.05-1.17.24-1.97.4-2.43a4.9 4.9 0 0 1 1.15-1.77A4.9 4.9 0 0 1 5.6 1.8c.46-.16 1.26-.35 2.43-.4C9.3 1.34 9.68 1.33 12 1.33Zm0 1.8c-3.15 0-3.5.01-4.73.07-.96.04-1.48.2-1.83.34-.46.18-.79.4-1.13.74-.34.34-.56.67-.74 1.13-.14.35-.3.87-.34 1.83-.06 1.23-.07 1.58-.07 4.73s.01 3.5.07 4.73c.04.96.2 1.48.34 1.83.18.46.4.79.74 1.13.34.34.67.56 1.13.74.35.14.87.3 1.83.34 1.23.06 1.58.07 4.73.07s3.5-.01 4.73-.07c.96-.04 1.48-.2 1.83-.34.46-.18.79-.4 1.13-.74.34-.34.56-.67.74-1.13.14-.35.3-.87.34-1.83.06-1.23.07-1.58.07-4.73s-.01-3.5-.07-4.73c-.04-.96-.2-1.48-.34-1.83a3.1 3.1 0 0 0-.74-1.13 3.1 3.1 0 0 0-1.13-.74c-.35-.14-.87-.3-1.83-.34-1.23-.06-1.58-.07-4.73-.07Zm0 4.06a4.94 4.94 0 1 1 0 9.88 4.94 4.94 0 0 1 0-9.88Zm0 1.8a3.14 3.14 0 1 0 0 6.28 3.14 3.14 0 0 0 0-6.28Zm5.14-1.99a1.15 1.15 0 1 1-2.3 0 1.15 1.15 0 0 1 2.3 0Z" />
                  </svg>
                </a>
              )}
              {team.facebookUrl && (
                <a
                  href={team.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${team.name} sur Facebook`}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M13.5 21.9v-8.1h2.72l.41-3.16h-3.13V8.65c0-.91.25-1.53 1.56-1.53h1.67V4.29c-.29-.04-1.28-.12-2.44-.12-2.41 0-4.06 1.47-4.06 4.17v2.32H7.5v3.16h2.73v8.1h3.27Z" />
                  </svg>
                </a>
              )}
            </div>
          )}
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
