"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

function readTeamFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim() || null;
  const shortName = String(formData.get("shortName") ?? "").trim() || null;
  const logoUrl = String(formData.get("logoUrl") ?? "").trim() || null;
  if (!name) throw new Error("Le nom de l'équipe est requis.");
  return { name, city, shortName, logoUrl };
}

export async function createTeam(formData: FormData) {
  const fields = readTeamFields(formData);
  await prisma.team.create({ data: { ...fields, slug: slugify(fields.name) } });
  revalidatePath("/admin/teams");
  revalidatePath("/equipes");
}

export async function updateTeam(teamId: string, formData: FormData) {
  const fields = readTeamFields(formData);
  await prisma.team.update({
    where: { id: teamId },
    data: { ...fields, slug: slugify(fields.name) },
  });
  revalidatePath("/admin/teams");
  revalidatePath(`/admin/teams/${teamId}`);
  revalidatePath("/equipes");
}

export async function deleteTeam(teamId: string) {
  await prisma.team.delete({ where: { id: teamId } });
  revalidatePath("/admin/teams");
  redirect("/admin/teams");
}
