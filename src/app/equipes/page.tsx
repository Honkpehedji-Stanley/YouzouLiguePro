import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function TeamsPage() {
  const teams = await prisma.team.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Équipes</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <Link
            key={team.id}
            href={`/equipes/${team.slug}`}
            className="rounded-lg border border-black/10 p-5 hover:border-orange-500 dark:border-white/10"
          >
            <p className="font-semibold">{team.name}</p>
            {team.city && (
              <p className="text-sm text-black/60 dark:text-white/60">{team.city}</p>
            )}
          </Link>
        ))}
        {teams.length === 0 && (
          <p className="text-black/60 dark:text-white/60">
            Aucune équipe enregistrée pour l’instant.
          </p>
        )}
      </div>
    </div>
  );
}
