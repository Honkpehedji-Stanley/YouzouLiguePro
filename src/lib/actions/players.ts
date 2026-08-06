"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Position } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

function readPlayerFields(formData: FormData) {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const birthDateRaw = String(formData.get("birthDate") ?? "").trim();
  const ageRaw = String(formData.get("age") ?? "").trim();
  const heightCmRaw = String(formData.get("heightCm") ?? "").trim();
  const weightKgRaw = String(formData.get("weightKg") ?? "").trim();
  const nationality = String(formData.get("nationality") ?? "").trim() || null;
  const nationality2 = String(formData.get("nationality2") ?? "").trim() || null;
  const hometown = String(formData.get("hometown") ?? "").trim() || null;
  const experienceYearsRaw = String(formData.get("experienceYears") ?? "").trim();
  const positionRaw = String(formData.get("position") ?? "").trim();
  const secondaryPositionRaw = String(formData.get("secondaryPosition") ?? "").trim();
  const photoUrl = String(formData.get("photoUrl") ?? "").trim() || null;
  const bio = String(formData.get("bio") ?? "").trim() || null;

  if (!firstName || !lastName) {
    throw new Error("Le prénom et le nom sont requis.");
  }

  return {
    firstName,
    lastName,
    birthDate: birthDateRaw ? new Date(birthDateRaw) : null,
    age: ageRaw ? Number(ageRaw) : null,
    heightCm: heightCmRaw ? Number(heightCmRaw) : null,
    weightKg: weightKgRaw ? Number(weightKgRaw) : null,
    nationality,
    nationality2,
    hometown,
    experienceYears: experienceYearsRaw ? Number(experienceYearsRaw) : null,
    position: positionRaw ? (positionRaw as Position) : null,
    secondaryPosition: secondaryPositionRaw ? (secondaryPositionRaw as Position) : null,
    photoUrl,
    bio,
  };
}

export async function createPlayer(formData: FormData) {
  const fields = readPlayerFields(formData);
  const slugBase = slugify(`${fields.firstName}-${fields.lastName}`);
  let slug = slugBase;
  let suffix = 1;
  while (await prisma.player.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${slugBase}-${suffix}`;
  }

  const player = await prisma.player.create({ data: { ...fields, slug } });

  const teamId = String(formData.get("teamId") ?? "").trim();
  const seasonId = String(formData.get("seasonId") ?? "").trim();
  if (teamId && seasonId) {
    const jerseyNumberRaw = String(formData.get("jerseyNumber") ?? "").trim();
    await prisma.teamPlayerSeason.create({
      data: {
        playerId: player.id,
        teamId,
        seasonId,
        jerseyNumber: jerseyNumberRaw ? Number(jerseyNumberRaw) : null,
        isCaptain: formData.get("isCaptain") === "on",
      },
    });
  }

  revalidatePath("/admin/players");
  revalidatePath("/admin");
  revalidatePath("/joueurs");
  revalidatePath("/agents-libres");
  redirect("/admin/players");
}

export async function updatePlayer(playerId: string, formData: FormData) {
  const fields = readPlayerFields(formData);
  await prisma.player.update({ where: { id: playerId }, data: fields });
  revalidatePath("/admin/players");
  revalidatePath(`/admin/players/${playerId}`);
  revalidatePath("/joueurs");
}

export async function deletePlayer(playerId: string) {
  await prisma.player.delete({ where: { id: playerId } });
  revalidatePath("/admin/players");
  redirect("/admin/players");
}

export async function assignPlayerToTeam(playerId: string, formData: FormData) {
  const teamId = String(formData.get("teamId") ?? "");
  const seasonId = String(formData.get("seasonId") ?? "");
  const jerseyNumberRaw = String(formData.get("jerseyNumber") ?? "").trim();
  const isCaptain = formData.get("isCaptain") === "on";

  if (!teamId) {
    // "Agent libre" choisi : on libère le joueur de son équipe active pour cette saison.
    await prisma.teamPlayerSeason.updateMany({
      where: { playerId, seasonId: seasonId || undefined, isActive: true },
      data: { isActive: false, leftAt: new Date() },
    });
    revalidatePath(`/admin/players/${playerId}`);
    revalidatePath("/equipes");
    revalidatePath("/agents-libres");
    return;
  }
  if (!seasonId) {
    throw new Error("La saison est requise.");
  }

  await prisma.teamPlayerSeason.upsert({
    where: {
      playerId_teamId_seasonId: { playerId, teamId, seasonId },
    },
    create: {
      playerId,
      teamId,
      seasonId,
      jerseyNumber: jerseyNumberRaw ? Number(jerseyNumberRaw) : null,
      isCaptain,
    },
    update: {
      jerseyNumber: jerseyNumberRaw ? Number(jerseyNumberRaw) : null,
      isCaptain,
      isActive: true,
      leftAt: null,
    },
  });

  revalidatePath(`/admin/players/${playerId}`);
  revalidatePath("/equipes");
}

export async function releasePlayerFromTeam(rosterEntryId: string, playerId: string) {
  await prisma.teamPlayerSeason.update({
    where: { id: rosterEntryId },
    data: { isActive: false, leftAt: new Date() },
  });
  revalidatePath(`/admin/players/${playerId}`);
  revalidatePath("/equipes");
}

const BULK_PLAYER_FIELDS = [
  "heightCm",
  "weightKg",
  "birthDate",
  "age",
  "nationality",
  "hometown",
  "experienceYears",
  "position",
  "secondaryPosition",
] as const;

const BULK_ROSTER_FIELDS = ["jerseyNumber"] as const;

export async function bulkUpdatePlayers(formData: FormData) {
  const playerUpdates = new Map<string, Record<string, string>>();
  const rosterUpdates = new Map<string, Record<string, string>>();

  for (const [key, value] of formData.entries()) {
    const match = key.match(/^(player|roster)__(.+)__(.+)$/);
    if (!match) continue;
    const [, scope, id, field] = match;
    const raw = String(value).trim();

    if (scope === "player" && (BULK_PLAYER_FIELDS as readonly string[]).includes(field)) {
      if (!playerUpdates.has(id)) playerUpdates.set(id, {});
      playerUpdates.get(id)![field] = raw;
    }
    if (scope === "roster" && (BULK_ROSTER_FIELDS as readonly string[]).includes(field)) {
      if (!rosterUpdates.has(id)) rosterUpdates.set(id, {});
      rosterUpdates.get(id)![field] = raw;
    }
  }

  await prisma.$transaction([
    ...Array.from(playerUpdates.entries()).map(([playerId, fields]) =>
      prisma.player.update({
        where: { id: playerId },
        data: {
          heightCm: fields.heightCm !== undefined ? (fields.heightCm ? Number(fields.heightCm) : null) : undefined,
          weightKg: fields.weightKg !== undefined ? (fields.weightKg ? Number(fields.weightKg) : null) : undefined,
          birthDate: fields.birthDate !== undefined ? (fields.birthDate ? new Date(fields.birthDate) : null) : undefined,
          age: fields.age !== undefined ? (fields.age ? Number(fields.age) : null) : undefined,
          nationality: fields.nationality !== undefined ? (fields.nationality || null) : undefined,
          hometown: fields.hometown !== undefined ? (fields.hometown || null) : undefined,
          experienceYears:
            fields.experienceYears !== undefined
              ? fields.experienceYears
                ? Number(fields.experienceYears)
                : null
              : undefined,
          position: fields.position !== undefined ? (fields.position ? (fields.position as Position) : null) : undefined,
          secondaryPosition:
            fields.secondaryPosition !== undefined
              ? fields.secondaryPosition
                ? (fields.secondaryPosition as Position)
                : null
              : undefined,
        },
      })
    ),
    ...Array.from(rosterUpdates.entries()).map(([rosterEntryId, fields]) =>
      prisma.teamPlayerSeason.update({
        where: { id: rosterEntryId },
        data: {
          jerseyNumber:
            fields.jerseyNumber !== undefined
              ? fields.jerseyNumber
                ? Number(fields.jerseyNumber)
                : null
              : undefined,
        },
      })
    ),
  ]);

  revalidatePath("/admin/players");
  revalidatePath("/admin/players/bulk");
  revalidatePath("/joueurs");
}
