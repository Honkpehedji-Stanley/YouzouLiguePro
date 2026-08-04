import { PrismaClient } from "@prisma/client";
import { slugify } from "../src/lib/slug";

const prisma = new PrismaClient();

type PlayerSeed = {
  firstName: string;
  lastName: string;
  teamSlug: string;
  isCaptain?: boolean;
  heightCm?: number;
  bio?: string;
};

const PLAYERS: PlayerSeed[] = [
  // Energie BBC
  {
    firstName: "Ayaovi Jean-Louis",
    lastName: "Zoglo",
    teamSlug: "energie-bbc",
    isCaptain: true,
    heightCm: 198,
    bio: "Capitaine d'Energie BBC. Originaire de Cotonou (Littoral, Bénin).",
  },
  { firstName: "Zimé Nassif Mora", lastName: "Lafia", teamSlug: "energie-bbc" },
  { firstName: "Cosby", lastName: "Koudoyor", teamSlug: "energie-bbc" },
  { firstName: "Nour Seydou", lastName: "Diallo", teamSlug: "energie-bbc" },
  { firstName: "Gédéon Jules", lastName: "Dohoungbo", teamSlug: "energie-bbc" },
  { firstName: "Mahutin Ronel Meryl", lastName: "Houngbonon", teamSlug: "energie-bbc" },
  { firstName: "Tawadioun", lastName: "Baboni Mama", teamSlug: "energie-bbc" },
  { firstName: "Jean Bosco", lastName: "Ouikoun", teamSlug: "energie-bbc" },
  { firstName: "Nouroudine Agnila Bisola", lastName: "Sadissou", teamSlug: "energie-bbc" },
  { firstName: "Fawaz", lastName: "Alassane", teamSlug: "energie-bbc" },
  { firstName: "Morayo Godwill Silvinay", lastName: "Sanny", teamSlug: "energie-bbc" },
  { firstName: "Gaoussou", lastName: "Konte", teamSlug: "energie-bbc" },
  { firstName: "Claude Arnaud", lastName: "Sognon", teamSlug: "energie-bbc" },
  { firstName: "Ghikel", lastName: "Sagbohan", teamSlug: "energie-bbc" },
  { firstName: "Armel Frédéric Yao", lastName: "Zotchi", teamSlug: "energie-bbc" },
  { firstName: "Chahid", lastName: "Gomez", teamSlug: "energie-bbc" },

  // ASPAC BBC
  { firstName: "Fadil", lastName: "Alassane", teamSlug: "aspac-bbc" },
  { firstName: "Fadil", lastName: "Baré", teamSlug: "aspac-bbc" },
  { firstName: "Abdoul", lastName: "Tamba", teamSlug: "aspac-bbc" },
  { firstName: "Roland L'Heureux", lastName: "Adjado", teamSlug: "aspac-bbc" },
  { firstName: "Edmond", lastName: "Behanzin", teamSlug: "aspac-bbc" },
  { firstName: "Adébayo", lastName: "Alabodé", teamSlug: "aspac-bbc" },
  { firstName: "Bernard Emmanuel", lastName: "Lougbegnon", teamSlug: "aspac-bbc" },
  { firstName: "Michel", lastName: "Oriakhi", teamSlug: "aspac-bbc" },
  { firstName: "Koami Pierre", lastName: "Ezion", teamSlug: "aspac-bbc" },
  { firstName: "Emmanuel Josue Perry", lastName: "Houenouvi", teamSlug: "aspac-bbc" },
  { firstName: "Mouhamed Saoban Akanho", lastName: "Akadiri", teamSlug: "aspac-bbc" },
  { firstName: "Ikenna", lastName: "Okpaluba", teamSlug: "aspac-bbc" },
  { firstName: "Samad", lastName: "Zakary", teamSlug: "aspac-bbc" },
  { firstName: "Anthelme Oscar", lastName: "Bio", teamSlug: "aspac-bbc" },

  // Elan Coton BBC
  { firstName: "Monra Salim", lastName: "Kora Sero", teamSlug: "elan-coton-bbc" },
  { firstName: "Taofic", lastName: "Andebi", teamSlug: "elan-coton-bbc" },
  { firstName: "Omonyélé", lastName: "Odou", teamSlug: "elan-coton-bbc" },
  { firstName: "Kévin", lastName: "Adjanohoun", teamSlug: "elan-coton-bbc" },
  { firstName: "Del-Pierro Sénan Jéocast", lastName: "Houngbo", teamSlug: "elan-coton-bbc" },
  { firstName: "Favour", lastName: "Aboje", teamSlug: "elan-coton-bbc" },
  { firstName: "Onel Ulrich", lastName: "Bio", teamSlug: "elan-coton-bbc" },
  { firstName: "Enock Godwin", lastName: "Freitas", teamSlug: "elan-coton-bbc" },
  { firstName: "Abdou Rachide", lastName: "Sané", teamSlug: "elan-coton-bbc" },
  { firstName: "Romeo Calheb", lastName: "Dahassouno", teamSlug: "elan-coton-bbc" },
  { firstName: "Sedjro Elvis Sylvanus", lastName: "Godonou", teamSlug: "elan-coton-bbc" },
  { firstName: "Saïd Abiodoun", lastName: "Alimi", teamSlug: "elan-coton-bbc" },
  { firstName: "Kareem", lastName: "Ademola", teamSlug: "elan-coton-bbc" },
  { firstName: "Kokou Elavagnon", lastName: "Balo", teamSlug: "elan-coton-bbc" },
  { firstName: "Abdou Matinou", lastName: "Bouraïma", teamSlug: "elan-coton-bbc" },
  { firstName: "Khaleb", lastName: "Bouraima", teamSlug: "elan-coton-bbc" },

  // Renaissance BBC
  { firstName: "Ange Fortune", lastName: "De Campos", teamSlug: "renaissance-bbc" },
  { firstName: "Crépin Marin", lastName: "Kouye", teamSlug: "renaissance-bbc" },
  { firstName: "Abdou Ibrahim", lastName: "Moubarack", teamSlug: "renaissance-bbc" },
  { firstName: "Smith Semako", lastName: "Hounkpe", teamSlug: "renaissance-bbc" },
  { firstName: "Shalom Enam", lastName: "Ahouanou", teamSlug: "renaissance-bbc" },
  { firstName: "Kabirou Moussa", lastName: "Abakar", teamSlug: "renaissance-bbc" },
  { firstName: "Bignon Eustache Rodrigue", lastName: "Agbo-Sekpe", teamSlug: "renaissance-bbc" },
  { firstName: "Nathael", lastName: "Fabiyi", teamSlug: "renaissance-bbc" },
  { firstName: "Milano Josué", lastName: "Akplogan", teamSlug: "renaissance-bbc" },
  { firstName: "Aldiouma", lastName: "Keita", teamSlug: "renaissance-bbc" },
  { firstName: "Kenneth", lastName: "Agossou", teamSlug: "renaissance-bbc" },
  { firstName: "Eugène M'baapakê", lastName: "M'Po", teamSlug: "renaissance-bbc" },
];

async function uniquePlayerSlug(firstName: string, lastName: string) {
  const base = slugify(`${firstName}-${lastName}`);
  let slug = base;
  let suffix = 2;
  while (await prisma.player.findUnique({ where: { slug } })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

async function main() {
  const season = await prisma.season.findFirst({ where: { isActive: true } });
  if (!season) {
    throw new Error("Aucune saison active : lancez d'abord `npm run db:seed`.");
  }

  for (const seed of PLAYERS) {
    const team = await prisma.team.findUnique({ where: { slug: seed.teamSlug } });
    if (!team) {
      console.warn(`Équipe introuvable pour le slug "${seed.teamSlug}", joueur ignoré.`);
      continue;
    }

    let player = await prisma.player.findFirst({
      where: { firstName: seed.firstName, lastName: seed.lastName },
    });

    if (!player) {
      const slug = await uniquePlayerSlug(seed.firstName, seed.lastName);
      player = await prisma.player.create({
        data: {
          firstName: seed.firstName,
          lastName: seed.lastName,
          slug,
          heightCm: seed.heightCm,
          bio: seed.bio,
        },
      });
    }

    await prisma.teamPlayerSeason.upsert({
      where: { playerId_teamId_seasonId: { playerId: player.id, teamId: team.id, seasonId: season.id } },
      create: {
        playerId: player.id,
        teamId: team.id,
        seasonId: season.id,
        isCaptain: seed.isCaptain ?? false,
      },
      update: {
        isCaptain: seed.isCaptain ?? false,
        isActive: true,
        leftAt: null,
      },
    });

    console.log(`OK: ${seed.firstName} ${seed.lastName} -> ${team.name}`);
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
