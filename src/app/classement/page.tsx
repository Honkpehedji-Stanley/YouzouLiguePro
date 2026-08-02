import Link from "next/link";
import { getActiveSeason, getStandings, type StandingRow } from "@/lib/stats";
import { CATEGORIES, CATEGORY_LABELS, CONFERENCES, CONFERENCE_LABELS } from "@/lib/league";

function StandingsTable({ standings }: { standings: StandingRow[] }) {
  if (standings.length === 0) {
    return (
      <p className="py-4 text-sm text-black/60">
        Aucun match terminé pour l’instant dans cette conférence.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-sm">
        <thead>
          <tr className="border-b border-black/10 text-left">
            <th className="py-2 pr-4">#</th>
            <th className="py-2 pr-4">Équipe</th>
            <th className="py-2 pr-4 text-right">V</th>
            <th className="py-2 pr-4 text-right">D</th>
            <th className="py-2 pr-4 text-right">%V</th>
            <th className="py-2 pr-4 text-right">Diff.</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row, index) => (
            <tr key={row.teamId} className="border-b border-black/5">
              <td className="py-2 pr-4">{index + 1}</td>
              <td className="py-2 pr-4">
                <Link href={`/equipes/${row.team.slug}`} className="hover:text-brand">
                  {row.team.name}
                </Link>
              </td>
              <td className="py-2 pr-4 text-right">{row.wins}</td>
              <td className="py-2 pr-4 text-right">{row.losses}</td>
              <td className="py-2 pr-4 text-right">{(row.winPct * 100).toFixed(0)}%</td>
              <td className="py-2 pr-4 text-right">
                {row.pointDiff > 0 ? `+${row.pointDiff}` : row.pointDiff}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function StandingsPage() {
  const season = await getActiveSeason();
  if (!season) {
    return <p>Aucune saison active pour le moment.</p>;
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Classement</h1>
      <p className="mb-8 text-black/60">{season.label}</p>

      {CATEGORIES.map((category) => (
        <section key={category} className="mb-10">
          <h2 className="mb-4 text-xl font-bold">{CATEGORY_LABELS[category]}</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {CONFERENCES.map((conference) => (
              <StandingsByConference
                key={conference}
                seasonId={season.id}
                conference={conference}
                category={category}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

async function StandingsByConference({
  seasonId,
  conference,
  category,
}: {
  seasonId: string;
  conference: (typeof CONFERENCES)[number];
  category: (typeof CATEGORIES)[number];
}) {
  const standings = await getStandings(seasonId, conference, category);
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-black/60">
        Conférence {CONFERENCE_LABELS[conference]}
      </h3>
      <StandingsTable standings={standings} />
    </div>
  );
}
