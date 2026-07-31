import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminHomePage() {
  const [teamCount, playerCount, upcomingGames] = await Promise.all([
    prisma.team.count(),
    prisma.player.count(),
    prisma.game.count({ where: { status: "SCHEDULED" } }),
  ]);

  const cards = [
    { label: "Équipes", value: teamCount, href: "/admin/teams" },
    { label: "Joueurs", value: playerCount, href: "/admin/players" },
    { label: "Matchs à venir", value: upcomingGames, href: "/admin/schedule" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">Tableau de bord</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-lg border border-black/10 p-5 hover:border-orange-500 dark:border-white/10"
          >
            <p className="text-3xl font-bold">{card.value}</p>
            <p className="text-sm text-black/60 dark:text-white/60">{card.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
