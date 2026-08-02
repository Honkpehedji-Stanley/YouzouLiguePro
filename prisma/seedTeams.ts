import { PrismaClient, Category, Conference } from "@prisma/client";

const prisma = new PrismaClient();

type TeamSeed = {
  name: string;
  slug: string;
  category: Category;
  conference: Conference;
  logoUrl: string;
};

const TEAMS: TeamSeed[] = [
  // Conférence Sud — Hommes
  { name: "Elan Coton BBC", slug: "elan-coton-bbc", category: "HOMMES", conference: "SUD", logoUrl: "/logos/elan-coton-bbc.jpg" },
  { name: "Energie BBC", slug: "energie-bbc", category: "HOMMES", conference: "SUD", logoUrl: "/logos/energie-bbc.jpg" },
  { name: "Renaissance BBC", slug: "renaissance-bbc", category: "HOMMES", conference: "SUD", logoUrl: "/logos/renaissance-bbc.jpg" },
  { name: "Avrankou Omnisports", slug: "avrankou-omnisports", category: "HOMMES", conference: "SUD", logoUrl: "/logos/avrankou-omnisports.jpeg" },
  { name: "ASPAC BBC", slug: "aspac-bbc", category: "HOMMES", conference: "SUD", logoUrl: "/logos/aspac-bbc.jpg" },
  { name: "AOL BBC", slug: "aol-bbc", category: "HOMMES", conference: "SUD", logoUrl: "/logos/aol-bbc.png" },

  // Conférence Nord — Hommes
  { name: "Aspal BBC", slug: "aspal-bbc", category: "HOMMES", conference: "NORD", logoUrl: "/logos/aspal-bbc.jpg" },
  { name: "US Guema BBC", slug: "us-guema-bbc", category: "HOMMES", conference: "NORD", logoUrl: "/logos/us-guema-bbc.jpg" },
  { name: "Bosco Star", slug: "bosco-star", category: "HOMMES", conference: "NORD", logoUrl: "/logos/bosco-star.jpg" },
  { name: "Loungou BBC", slug: "loungou-bbc", category: "HOMMES", conference: "NORD", logoUrl: "/logos/loungou-bbc.jpg" },
  { name: "Panthères BBC", slug: "pantheres-bbc", category: "HOMMES", conference: "NORD", logoUrl: "/logos/panthere-bbc.jpg" },
  { name: "Aspal Renouveau", slug: "aspal-renouveau", category: "HOMMES", conference: "NORD", logoUrl: "/logos/aspal-renouveau.jpeg" },

  // Conférence Sud — Dames (mêmes clubs que les hommes)
  { name: "Elan Coton BBC", slug: "elan-coton-bbc-dames", category: "DAMES", conference: "SUD", logoUrl: "/logos/elan-coton-bbc.jpg" },
  { name: "Energie BBC", slug: "energie-bbc-dames", category: "DAMES", conference: "SUD", logoUrl: "/logos/energie-bbc.jpg" },
  { name: "Renaissance BBC", slug: "renaissance-bbc-dames", category: "DAMES", conference: "SUD", logoUrl: "/logos/renaissance-bbc.jpg" },
  { name: "ASPAC BBC", slug: "aspac-bbc-dames", category: "DAMES", conference: "SUD", logoUrl: "/logos/aspac-bbc.jpg" },

  // Conférence Nord — Dames (clubs distincts des hommes)
  { name: "Associé de Ouaké BBC", slug: "associe-de-ouake-bbc", category: "DAMES", conference: "NORD", logoUrl: "/logos/associe-de-ouake.jpg" },
  { name: "Hoops Dreamers BBC", slug: "hoops-dreamers-bbc", category: "DAMES", conference: "NORD", logoUrl: "/logos/hoops-dreamers-bbc.jpg" },
  { name: "Cavalier BBC", slug: "cavalier-bbc", category: "DAMES", conference: "NORD", logoUrl: "/logos/cavalier-bbc.jpg" },
  { name: "Kobourou BBC", slug: "kobourou-bbc", category: "DAMES", conference: "NORD", logoUrl: "/logos/kobourou-bbc.jpg" },
];

async function main() {
  const season = await prisma.season.findFirst({ where: { isActive: true } });
  if (!season) {
    throw new Error("Aucune saison active : lancez d'abord `npm run db:seed`.");
  }

  for (const teamSeed of TEAMS) {
    const { conference, ...teamData } = teamSeed;

    const team = await prisma.team.upsert({
      where: { slug: teamData.slug },
      create: teamData,
      update: teamData,
    });

    await prisma.teamSeason.upsert({
      where: { teamId_seasonId: { teamId: team.id, seasonId: season.id } },
      create: { teamId: team.id, seasonId: season.id, conference },
      update: { conference },
    });

    console.log(`OK: ${team.name} (${team.category} / ${conference})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
