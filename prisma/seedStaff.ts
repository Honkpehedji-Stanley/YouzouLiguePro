import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type StaffSeed = {
  firstName: string;
  lastName: string;
  role?: string;
  teamSlug: string;
};

const STAFF: StaffSeed[] = [
  // Avrankou Omnisports BBC
  { firstName: "Gafarou", lastName: "Adjado", teamSlug: "avrankou-omnisports" },
  { firstName: "Aziz", lastName: "Adechian", teamSlug: "avrankou-omnisports" },
  { firstName: "Yéssoufou", lastName: "Adjado", teamSlug: "avrankou-omnisports" },
  { firstName: "Jean-Paul", lastName: "Houindji", teamSlug: "avrankou-omnisports" },
];

async function main() {
  const season = await prisma.season.findFirst({ where: { isActive: true } });
  if (!season) {
    throw new Error("Aucune saison active : lancez d'abord `npm run db:seed`.");
  }

  for (const staff of STAFF) {
    const team = await prisma.team.findUnique({ where: { slug: staff.teamSlug } });
    if (!team) {
      console.warn(`Équipe introuvable pour le slug "${staff.teamSlug}", staff ignoré.`);
      continue;
    }

    const existing = await prisma.staffMember.findFirst({
      where: {
        firstName: staff.firstName,
        lastName: staff.lastName,
        teamId: team.id,
        seasonId: season.id,
      },
    });

    if (!existing) {
      await prisma.staffMember.create({
        data: {
          firstName: staff.firstName,
          lastName: staff.lastName,
          role: staff.role ?? null,
          teamId: team.id,
          seasonId: season.id,
        },
      });
    }

    console.log(`OK: ${staff.firstName} ${staff.lastName} -> ${team.name}`);
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
