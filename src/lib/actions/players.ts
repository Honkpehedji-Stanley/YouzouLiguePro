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
  const hometown = String(formData.get("hometown") ?? "").trim() || null;
  const experienceYearsRaw = String(formData.get("experienceYears") ?? "").trim();
  const positionRaw = String(formData.get("position") ?? "").trim();
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
    hometown,
    experienceYears: experienceYearsRaw ? Number(experienceYearsRaw) : null,
    position: positionRaw ? (positionRaw as Position) : null,
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

  await prisma.player.create({ data: { ...fields, slug } });
  revalidatePath("/admin/players");
  revalidatePath("/joueurs");
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
  if (!teamId || !seasonId) {
    throw new Error("Équipe et saison sont requises.");
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
