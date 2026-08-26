import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getActiveSeason } from "@/lib/stats";
import { TeamsNavMenu, type NavTeam } from "@/components/TeamsNavMenu";

const NAV_LINKS = [
  { href: "/joueurs", label: "Joueurs" },
  { href: "/calendrier", label: "Calendrier" },
  { href: "/statistiques", label: "Statistiques" },
  { href: "/classement", label: "Classement" },
  { href: "/agents-libres", label: "Agents libres" },
];

async function getNavTeams(): Promise<NavTeam[]> {
  const season = await getActiveSeason();
  const teams = await prisma.team.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] });
  const teamSeasons = season
    ? await prisma.teamSeason.findMany({ where: { seasonId: season.id } })
    : [];
  const conferenceByTeamId = new Map(teamSeasons.map((ts) => [ts.teamId, ts.conference]));

  return teams.map((team) => ({
    slug: team.slug,
    name: team.name,
    logoUrl: team.logoUrl,
    category: team.category,
    conference: conferenceByTeamId.get(team.id) ?? null,
  }));
}

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navTeams = await getNavTeams();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-black/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.jpg"
              alt="Youzou Ligue Pro"
              width={40}
              height={40}
              className="rounded-md"
            />
            <span className="text-lg font-bold tracking-tight">
              <span className="text-brand">Youzou</span> Ligue Pro
            </span>
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-x-5 gap-y-1 text-sm font-medium">
            <TeamsNavMenu teams={navTeams} />
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-brand">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1 py-8">{children}</main>
      <footer className="border-t border-black/10 px-4 py-6 text-center text-sm text-black/60">
        Youzou Ligue Pro — Le basketball professionnel béninois.
      </footer>
    </div>
  );
}
