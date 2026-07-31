import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@youzonliguepro.bj";
  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const password = process.env.SEED_ADMIN_PASSWORD ?? randomBytes(9).toString("base64url");
    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.adminUser.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: "Super Admin",
        role: "SUPER_ADMIN",
      },
    });

    console.log("Compte admin créé :");
    console.log(`  Email    : ${adminEmail}`);
    console.log(`  Mot de passe : ${password}`);
    console.log("Notez ce mot de passe, il ne sera plus jamais affiché.");
  } else {
    console.log(`Compte admin déjà existant pour ${adminEmail}, aucune action.`);
  }

  const existingSeason = await prisma.season.findFirst({
    where: { isActive: true },
  });

  if (!existingSeason) {
    const season = await prisma.season.create({
      data: {
        label: "2025-2026",
        startDate: new Date("2025-10-01"),
        endDate: new Date("2026-06-30"),
        isActive: true,
      },
    });
    console.log(`Saison créée et activée : ${season.label}`);
  } else {
    console.log(`Une saison active existe déjà : ${existingSeason.label}`);
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
