import { PrismaClient, Position } from "@prisma/client";
import { slugify } from "../src/lib/slug";

const prisma = new PrismaClient();

// Corrections de noms saisis initialement de travers.
type RenameSeed = { from: { firstName: string; lastName: string }; to: { firstName: string; lastName: string } };
const RENAMES: RenameSeed[] = [
  {
    from: { firstName: "Abdoul", lastName: "Tamba" },
    to: { firstName: "Abdul-Haady", lastName: "Tamba Seko" },
  },
];

// Couleurs de marque extraites des logos (voir conversation) + ajustement manuel Renaissance.
const TEAM_COLORS: Record<string, string> = {
  "elan-coton-bbc": "#00849c",
  "energie-bbc": "#d80000",
  "renaissance-bbc": "#e4572e",
  "avrankou-omnisports": "#00b454",
  "aspac-bbc": "#c04800",
  "aol-bbc": "#007830",
  "aspal-bbc": "#3c60b4",
  "us-guema-bbc": "#003c0c",
  "bosco-star": "#e45424",
  "loungou-bbc": "#181830",
  "pantheres-bbc": "#0c3060",
  "aspal-renouveau": "#0c30fc",
  "elan-coton-bbc-dames": "#00849c",
  "energie-bbc-dames": "#d80000",
  "renaissance-bbc-dames": "#e4572e",
  "aspac-bbc-dames": "#c04800",
  "associe-de-ouake-bbc": "#9c000c",
  "hoops-dreamers-bbc": "#3c4890",
  "cavalier-bbc": "#0c5400",
  "kobourou-bbc": "#f0a824",
};

type CaptainSeed = { firstName: string; lastName: string };
const CAPTAINS: CaptainSeed[] = [
  { firstName: "Ayaovi Jean-Louis", lastName: "Zoglo" },
  { firstName: "Adébayo", lastName: "Alabodé" },
  { firstName: "Abdou Rachide", lastName: "Sané" },
  { firstName: "Bignon Eustache Rodrigue", lastName: "Agbo-Sekpe" },
];

type PlayerDetailSeed = {
  firstName: string;
  lastName: string;
  jerseyNumber?: number;
  position?: Position;
  secondaryPosition?: Position;
  heightCm?: number;
  nationality?: string;
  hometown?: string;
  age?: number;
  birthDate?: string;
  bio?: string;
  photoFile?: string; // fichier dans public/players/
};

const PLAYER_DETAILS: PlayerDetailSeed[] = [
  {
    firstName: "Ayaovi Jean-Louis",
    lastName: "Zoglo",
    jerseyNumber: 14,
    position: "PF",
    heightCm: 198,
    nationality: "Béninois et Togolais",
    bio: "Capitaine d'Energie BBC. Originaire de Cotonou (Littoral, Bénin).",
  },
  {
    firstName: "Tawadioun",
    lastName: "Baboni Mama",
    jerseyNumber: 11,
    heightCm: 190,
    nationality: "Béninois",
    hometown: "Parakou, Borgou, Bénin",
    birthDate: "2000-01-27",
    photoFile: "tawadioun-baboni-mama.webp",
  },
  {
    firstName: "Cosby",
    lastName: "Koudoyor",
    jerseyNumber: 13,
    position: "C",
    secondaryPosition: "PF",
    age: 26,
    nationality: "Béninois",
    hometown: "Denu, Volta, Ghana",
  },
  {
    firstName: "Gédéon Jules",
    lastName: "Dohoungbo",
    jerseyNumber: 12,
    position: "PG",
    secondaryPosition: "SG",
    heightCm: 185,
    age: 23,
    nationality: "Béninois",
    hometown: "Cotonou, Littoral, Bénin",
  },
  {
    firstName: "Morayo Godwill Silvinay",
    lastName: "Sanny",
    position: "PG",
    secondaryPosition: "SG",
  },
];

async function uniquePlayerSlug(firstName: string, lastName: string, excludeId: string) {
  const base = slugify(`${firstName}-${lastName}`);
  let slug = base;
  let suffix = 2;
  while (true) {
    const existing = await prisma.player.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
}

async function main() {
  const season = await prisma.season.findFirstOrThrow({ where: { isActive: true } });

  for (const rename of RENAMES) {
    const player = await prisma.player.findFirst({
      where: { firstName: rename.from.firstName, lastName: rename.from.lastName },
    });
    if (!player) {
      console.warn(`Joueur introuvable pour renommage: ${rename.from.firstName} ${rename.from.lastName}`);
      continue;
    }
    const slug = await uniquePlayerSlug(rename.to.firstName, rename.to.lastName, player.id);
    await prisma.player.update({
      where: { id: player.id },
      data: { firstName: rename.to.firstName, lastName: rename.to.lastName, slug },
    });
    console.log(`Renommé: ${rename.from.firstName} ${rename.from.lastName} -> ${rename.to.firstName} ${rename.to.lastName}`);
  }

  for (const [slug, color] of Object.entries(TEAM_COLORS)) {
    await prisma.team.updateMany({ where: { slug }, data: { primaryColor: color } });
  }
  console.log(`Couleurs appliquées à ${Object.keys(TEAM_COLORS).length} équipes.`);

  await prisma.teamPlayerSeason.updateMany({
    where: { seasonId: season.id },
    data: { isCaptain: false },
  });

  for (const captain of CAPTAINS) {
    const player = await prisma.player.findFirst({
      where: { firstName: captain.firstName, lastName: captain.lastName },
    });
    if (!player) {
      console.warn(`Joueur introuvable pour capitanat: ${captain.firstName} ${captain.lastName}`);
      continue;
    }
    const entry = await prisma.teamPlayerSeason.findFirst({
      where: { playerId: player.id, seasonId: season.id, isActive: true },
    });
    if (!entry) {
      console.warn(`Pas d'affectation active pour: ${captain.firstName} ${captain.lastName}`);
      continue;
    }
    await prisma.teamPlayerSeason.update({ where: { id: entry.id }, data: { isCaptain: true } });
    console.log(`Capitaine: ${captain.firstName} ${captain.lastName}`);
  }

  for (const detail of PLAYER_DETAILS) {
    const player = await prisma.player.findFirst({
      where: { firstName: detail.firstName, lastName: detail.lastName },
    });
    if (!player) {
      console.warn(`Joueur introuvable: ${detail.firstName} ${detail.lastName}`);
      continue;
    }

    await prisma.player.update({
      where: { id: player.id },
      data: {
        position: detail.position,
        secondaryPosition: detail.secondaryPosition,
        heightCm: detail.heightCm,
        nationality: detail.nationality,
        hometown: detail.hometown,
        age: detail.age,
        birthDate: detail.birthDate ? new Date(detail.birthDate) : undefined,
        bio: detail.bio,
        photoUrl: detail.photoFile ? `/players/${detail.photoFile}` : undefined,
      },
    });

    if (detail.jerseyNumber != null) {
      const entry = await prisma.teamPlayerSeason.findFirst({
        where: { playerId: player.id, seasonId: season.id, isActive: true },
      });
      if (entry) {
        await prisma.teamPlayerSeason.update({
          where: { id: entry.id },
          data: { jerseyNumber: detail.jerseyNumber },
        });
      }
    }
    console.log(`Détails: ${detail.firstName} ${detail.lastName}`);
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
