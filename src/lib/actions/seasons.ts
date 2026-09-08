"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

export async function createSeason(formData: FormData) {
  await requireAdmin();
  const label = String(formData.get("label") ?? "").trim();
  const startDateRaw = String(formData.get("startDate") ?? "").trim();
  const endDateRaw = String(formData.get("endDate") ?? "").trim();

  if (!label || !startDateRaw || !endDateRaw) {
    throw new Error("Le libellé et les dates de la saison sont requis.");
  }

  await prisma.season.create({
    data: {
      label,
      startDate: new Date(startDateRaw),
      endDate: new Date(endDateRaw),
    },
  });
  revalidatePath("/admin/seasons");
}

export async function setActiveSeason(seasonId: string) {
  await requireAdmin();
  await prisma.$transaction([
    prisma.season.updateMany({ data: { isActive: false } }),
    prisma.season.update({ where: { id: seasonId }, data: { isActive: true } }),
  ]);
  revalidatePath("/admin/seasons");
  revalidatePath("/admin/schedule");
  revalidatePath("/classement");
  revalidatePath("/calendrier");
}
