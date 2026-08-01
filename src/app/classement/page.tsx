import Link from "next/link";
import { getActiveSeason, getStandings } from "@/lib/stats";

export default async function StandingsPage() {
  const season = await getActiveSeason();
  if (!season) {
    return <p>Aucune saison active pour le moment.</p>;
  }

  const standings = await getStandings(season.id);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Classement</h1>
      <p className="mb-6 text-black/60">{season.label}</p>

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
        {standings.length === 0 && (
          <p className="py-6 text-black/60">
            Aucun match terminé pour l’instant cette saison.
          </p>
        )}
      </div>
    </div>
  );
}
