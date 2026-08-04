import Image from "next/image";
import Link from "next/link";
import {
  getActiveSeason,
  getStatLeaders,
  LEADER_METRICS,
  LEADER_METRIC_LABELS,
  type LeaderRow,
} from "@/lib/stats";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/league";
import { PageContainer } from "@/components/PageContainer";

function LeaderBoard({
  metricLabel,
  rows,
}: {
  metricLabel: string;
  rows: LeaderRow[];
}) {
  return (
    <div>
      <h3 className="mb-2 border-b border-black/10 pb-2 text-sm font-bold uppercase tracking-wide text-black/70">
        {metricLabel}
      </h3>
      <ol className="divide-y divide-black/5">
        {rows.map((row, index) => (
          <li key={row.player.id} className="flex items-center gap-3 py-2">
            <span className="w-4 text-sm font-semibold text-black/40">{index + 1}</span>
            {row.player.photoUrl ? (
              <Image
                src={row.player.photoUrl}
                alt={`${row.player.firstName} ${row.player.lastName}`}
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-black/10" />
            )}
            <div className="min-w-0 flex-1">
              <Link
                href={`/joueurs/${row.player.slug}`}
                className="block truncate text-sm font-semibold hover:text-brand hover:underline"
              >
                {row.player.firstName} {row.player.lastName}
              </Link>
              {row.team && (
                <p className="truncate text-xs text-black/50">{row.team.name}</p>
              )}
            </div>
            <span className="text-lg font-bold">{row.value}</span>
          </li>
        ))}
        {rows.length === 0 && (
          <li className="py-3 text-sm text-black/60">Pas encore de statistiques.</li>
        )}
      </ol>
    </div>
  );
}

export default async function StatsPage() {
  const season = await getActiveSeason();
  if (!season) {
    return (
      <PageContainer>
        <p>Aucune saison active pour le moment.</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
    <div>
      <h1 className="mb-1 text-2xl font-bold">Statistiques</h1>
      <p className="mb-8 text-black/60">{season.label} · Moyennes par match</p>

      {CATEGORIES.map((category) => (
        <section key={category} className="mb-12">
          <h2 className="mb-5 border-b-2 border-brand pb-1 text-lg font-bold">
            {CATEGORY_LABELS[category]}
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {LEADER_METRICS.map((metric) => (
              <LeaderBoardSection
                key={metric}
                seasonId={season.id}
                category={category}
                metric={metric}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
    </PageContainer>
  );
}

async function LeaderBoardSection({
  seasonId,
  category,
  metric,
}: {
  seasonId: string;
  category: (typeof CATEGORIES)[number];
  metric: (typeof LEADER_METRICS)[number];
}) {
  const rows = await getStatLeaders(seasonId, category, metric, 5);
  return <LeaderBoard metricLabel={LEADER_METRIC_LABELS[metric]} rows={rows} />;
}
