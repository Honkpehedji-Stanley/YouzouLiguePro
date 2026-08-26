import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getActiveSeason } from "@/lib/stats";
import { PageContainer } from "@/components/PageContainer";
import { ScheduleExplorer, type GameRow } from "@/components/ScheduleExplorer";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date);
}

const TABS = [
  { key: "calendrier", label: "Calendrier" },
  { key: "dates-cles", label: "Dates clés" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ onglet?: string }>;
}) {
  const { onglet } = await searchParams;
  const tab: TabKey = (TABS.find((t) => t.key === onglet)?.key as TabKey) ?? "calendrier";

  const season = await getActiveSeason();
  if (!season) {
    return (
      <PageContainer>
        <p>Aucune saison active pour le moment.</p>
      </PageContainer>
    );
  }

  const [games, teams] = await Promise.all([
    prisma.game.findMany({
      where: { seasonId: season.id },
      include: { homeTeam: true, awayTeam: true },
      orderBy: { scheduledAt: "asc" },
    }),
    prisma.team.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] }),
  ]);

  const rows: GameRow[] = games.map((g) => ({
    id: g.id,
    scheduledAt: g.scheduledAt.toISOString(),
    venue: g.venue,
    phase: g.phase,
    status: g.status,
    homeScore: g.homeScore,
    awayScore: g.awayScore,
    homeTeam: { slug: g.homeTeam.slug, name: g.homeTeam.name },
    awayTeam: { slug: g.awayTeam.slug, name: g.awayTeam.name },
  }));

  const phaseRanges = new Map<string, { start: Date; end: Date }>();
  for (const g of games) {
    if (!g.phase) continue;
    const existing = phaseRanges.get(g.phase);
    if (!existing) {
      phaseRanges.set(g.phase, { start: g.scheduledAt, end: g.scheduledAt });
    } else {
      if (g.scheduledAt < existing.start) existing.start = g.scheduledAt;
      if (g.scheduledAt > existing.end) existing.end = g.scheduledAt;
    }
  }

  return (
    <PageContainer>
      <div>
        <h1 className="mb-1 text-2xl font-bold">Calendrier</h1>
        <p className="mb-6 text-black/60">Saison {season.label}</p>

        <div className="mb-6 flex gap-x-6 border-b border-black/10 text-sm font-semibold">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={`/calendrier?onglet=${t.key}`}
              className={`-mb-px border-b-2 pb-3 pt-1 transition ${
                tab === t.key ? "border-brand text-brand" : "border-transparent text-black/50 hover:text-black"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {tab === "calendrier" && <ScheduleExplorer games={rows} teams={teams.map((t) => ({ slug: t.slug, name: t.name }))} />}

        {tab === "dates-cles" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between rounded-md border border-black/10 px-4 py-3">
              <span className="font-medium">Début de saison</span>
              <span className="text-sm text-black/60">{formatDate(season.startDate)}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-black/10 px-4 py-3">
              <span className="font-medium">Fin de saison</span>
              <span className="text-sm text-black/60">{formatDate(season.endDate)}</span>
            </div>
            {Array.from(phaseRanges.entries()).map(([phase, range]) => (
              <div key={phase} className="flex items-center justify-between rounded-md border border-black/10 px-4 py-3">
                <span className="font-medium">{phase}</span>
                <span className="text-sm text-black/60">
                  {formatDate(range.start)}
                  {range.start.getTime() !== range.end.getTime() && ` – ${formatDate(range.end)}`}
                </span>
              </div>
            ))}
            {phaseRanges.size === 0 && (
              <p className="text-black/60">Les phases de la compétition seront précisées dès leur programmation.</p>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
