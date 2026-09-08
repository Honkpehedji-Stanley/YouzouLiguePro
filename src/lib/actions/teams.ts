"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Category, Conference } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { requireAdmin } from "@/lib/authz";

function readTeamFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const categoryRaw = String(formData.get("category") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim() || null;
  const shortName = String(formData.get("shortName") ?? "").trim() || null;
  const logoUrl = String(formData.get("logoUrl") ?? "").trim() || null;
  const instagramUrl = String(formData.get("instagramUrl") ?? "").trim() || null;
  const facebookUrl = String(formData.get("facebookUrl") ?? "").trim() || null;
  if (!name) throw new Error("Le nom de l'équipe est requis.");
  if (categoryRaw !== "HOMMES" && categoryRaw !== "DAMES") {
    throw new Error("La catégorie (Hommes/Dames) est requise.");
  }
  return { name, category: categoryRaw as Category, city, shortName, logoUrl, instagramUrl, facebookUrl };
}

async function uniqueTeamSlug(name: string, category: Category, excludeId?: string) {
  const base = slugify(name);
  const candidates = [base, `${base}-${category.toLowerCase()}`];
  for (const candidate of candidates) {
    const existing = await prisma.team.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeId) return candidate;
  }
  let suffix = 2;
  while (true) {
    const candidate = `${base}-${category.toLowerCase()}-${suffix}`;
    const existing = await prisma.team.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeId) return candidate;
    suffix += 1;
  }
}

export async function createTeam(formData: FormData) {
  await requireAdmin();
  const fields = readTeamFields(formData);
  const slug = await uniqueTeamSlug(fields.name, fields.category);
  await prisma.team.create({ data: { ...fields, slug } });
  revalidatePath("/admin/teams");
  revalidatePath("/equipes");
}

export async function updateTeam(teamId: string, formData: FormData) {
  await requireAdmin();
  const fields = readTeamFields(formData);
  const slug = await uniqueTeamSlug(fields.name, fields.category, teamId);
  await prisma.team.update({
    where: { id: teamId },
    data: { ...fields, slug },
  });
  revalidatePath("/admin/teams");
  revalidatePath(`/admin/teams/${teamId}`);
  revalidatePath("/equipes");
}

export async function deleteTeam(teamId: string) {
  await requireAdmin();
  await prisma.team.delete({ where: { id: teamId } });
  revalidatePath("/admin/teams");
  redirect("/admin/teams");
}

export async function assignTeamToConference(teamId: string, formData: FormData) {
  await requireAdmin();
  const seasonId = String(formData.get("seasonId") ?? "");
  const conferenceRaw = String(formData.get("conference") ?? "");
  if (!seasonId || (conferenceRaw !== "SUD" && conferenceRaw !== "NORD")) {
    throw new Error("Saison et conférence sont requises.");
  }
  const conference = conferenceRaw as Conference;

  await prisma.teamSeason.upsert({
    where: { teamId_seasonId: { teamId, seasonId } },
    create: { teamId, seasonId, conference },
    update: { conference },
  });

  revalidatePath(`/admin/teams/${teamId}`);
  revalidatePath("/equipes");
  revalidatePath("/classement");
}

export async function removeTeamFromSeason(teamSeasonId: string, teamId: string) {
  await requireAdmin();
  await prisma.teamSeason.delete({ where: { id: teamSeasonId } });
  revalidatePath(`/admin/teams/${teamId}`);
  revalidatePath("/equipes");
  revalidatePath("/classement");
}
