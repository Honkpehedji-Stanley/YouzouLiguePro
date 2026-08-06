import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getActiveSeason } from "@/lib/stats";
import { computeAge } from "@/lib/age";
import { CATEGORY_LABELS } from "@/lib/league";
import { cardClass, sectionTitleClass } from "@/components/admin/formStyles";
import {
  AgeDistributionChart,
  DonutChart,
  NationalityBarChart,
  PlayersPerTeamChart,
} from "@/components/admin/charts/DashboardCharts";

const POSITION_LABELS: Record<string, string> = {
  PG: "Meneur (PG)",
  SG: "Arrière (SG)",
  SF: "Ailier (SF)",
  PF: "Ailier fort (PF)",
  C: "Pivot (C)",
};

export default async function AdminHomePage() {
  const season = await getActiveSeason();
  const seasonFilter = season?.id ?? "__no-active-season__";

  const [teams, players, upcomingGames, finalGames, activeRosterEntries] = await Promise.all([
    prisma.team.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
    prisma.player.findMany(),
    prisma.game.count({ where: { status: "SCHEDULED" } }),
    prisma.game.count({ where: { status: "FINAL" } }),
    prisma.teamPlayerSeason.findMany({
      where: { seasonId: seasonFilter, isActive: true },
      include: { team: true },
    }),
  ]);

  const rosteredPlayerIds = new Set(activeRosterEntries.map((e) => e.playerId));
  const freeAgentCount = players.length - rosteredPlayerIds.size;
  const captainCount = activeRosterEntries.filter((e) => e.isCaptain).length;

  const cards = [
    { label: "Équipes", value: teams.length, href: "/admin/teams" },
    { label: "Joueurs", value: players.length, href: "/admin/players" },
    { label: "Agents libres", value: freeAgentCount, href: "/agents-libres" },
    { label: "Capitaines désignés", value: captainCount, href: "/admin/players" },
    { label: "Matchs à venir", value: upcomingGames, href: "/admin/schedule" },
    { label: "Matchs joués", value: finalGames, href: "/admin/schedule" },
  ];

  // Effectif par équipe (profondeur de banc)
  const teamCounts = new Map<string, number>();
  for (const entry of activeRosterEntries) {
    teamCounts.set(entry.teamId, (teamCounts.get(entry.teamId) ?? 0) + 1);
  }
  const CATEGORY_SUFFIX: Record<string, string> = { HOMMES: "H", DAMES: "D" };
  const nameOccurrences = new Map<string, number>();
  for (const team of teams) nameOccurrences.set(team.name, (nameOccurrences.get(team.name) ?? 0) + 1);
  const playersPerTeam = teams
    .map((team) => ({
      team: nameOccurrences.get(team.name)! > 1 ? `${team.name} (${CATEGORY_SUFFIX[team.category]})` : team.name,
      count: teamCounts.get(team.id) ?? 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Répartition par catégorie (Hommes / Dames)
  const categoryCounts = new Map<string, number>();
  for (const team of teams) {
    const count = teamCounts.get(team.id) ?? 0;
    const label = CATEGORY_LABELS[team.category];
    categoryCounts.set(label, (categoryCounts.get(label) ?? 0) + count);
  }
  const playersByCategory = Array.from(categoryCounts.entries()).map(([name, value]) => ({ name, value }));

  // Répartition par poste
  const positionCounts = new Map<string, number>();
  for (const player of players) {
    if (!player.position) continue;
    const label = POSITION_LABELS[player.position] ?? player.position;
    positionCounts.set(label, (positionCounts.get(label) ?? 0) + 1);
  }
  const playersByPosition = Array.from(positionCounts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Pyramide des âges
  const buckets: { label: string; test: (age: number) => boolean }[] = [
    { label: "≤ 20 ans", test: (a) => a <= 20 },
    { label: "21-23 ans", test: (a) => a >= 21 && a <= 23 },
    { label: "24-26 ans", test: (a) => a >= 24 && a <= 26 },
    { label: "27-29 ans", test: (a) => a >= 27 && a <= 29 },
    { label: "30 ans et +", test: (a) => a >= 30 },
  ];
  const ageDistribution = buckets.map((b) => ({ bucket: b.label, count: 0 }));
  for (const player of players) {
    const age = player.birthDate ? computeAge(player.birthDate) : player.age;
    if (age == null) continue;
    const bucketIndex = buckets.findIndex((b) => b.test(age));
    if (bucketIndex >= 0) ageDistribution[bucketIndex].count += 1;
  }

  // Nationalités les plus représentées
  const nationalityCounts = new Map<string, number>();
  for (const player of players) {
    if (!player.nationality) continue;
    nationalityCounts.set(player.nationality, (nationalityCounts.get(player.nationality) ?? 0) + 1);
  }
  const topNationalities = Array.from(nationalityCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="mt-1 text-sm text-slate-500">
          {season ? `Saison active : ${season.label}` : "Aucune saison active"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand hover:shadow-md"
          >
            <p className="text-2xl font-bold text-slate-800">{card.value}</p>
            <p className="text-xs font-medium text-slate-500">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className={cardClass}>
          <h2 className={sectionTitleClass}>Effectif par équipe</h2>
          {playersPerTeam.length > 0 ? (
            <PlayersPerTeamChart data={playersPerTeam} />
          ) : (
            <p className="text-sm text-slate-400">Pas encore de données.</p>
          )}
        </div>

        <div className={cardClass}>
          <h2 className={sectionTitleClass}>Répartition Hommes / Dames</h2>
          {playersByCategory.some((c) => c.value > 0) ? (
            <DonutChart data={playersByCategory} />
          ) : (
            <p className="text-sm text-slate-400">Pas encore de données.</p>
          )}
        </div>

        <div className={cardClass}>
          <h2 className={sectionTitleClass}>Pyramide des âges</h2>
          {ageDistribution.some((b) => b.count > 0) ? (
            <AgeDistributionChart data={ageDistribution} />
          ) : (
            <p className="text-sm text-slate-400">Renseigne les dates de naissance pour voir ce graphique.</p>
          )}
        </div>

        <div className={cardClass}>
          <h2 className={sectionTitleClass}>Répartition par poste</h2>
          {playersByPosition.length > 0 ? (
            <DonutChart data={playersByPosition} />
          ) : (
            <p className="text-sm text-slate-400">Renseigne les postes pour voir ce graphique.</p>
          )}
        </div>

        <div className={`${cardClass} lg:col-span-2`}>
          <h2 className={sectionTitleClass}>Nationalités les plus représentées</h2>
          {topNationalities.length > 0 ? (
            <NationalityBarChart data={topNationalities} />
          ) : (
            <p className="text-sm text-slate-400">Renseigne les nationalités pour voir ce graphique.</p>
          )}
        </div>
      </div>
    </div>
  );
}
