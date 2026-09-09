"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";
import { toFriendlyDeleteError } from "@/lib/prismaErrors";

export async function createGame(formData: FormData) {
  await requireAdmin();
  const seasonId = String(formData.get("seasonId") ?? "");
  const homeTeamId = String(formData.get("homeTeamId") ?? "");
  const awayTeamId = String(formData.get("awayTeamId") ?? "");
  const scheduledAtRaw = String(formData.get("scheduledAt") ?? "");
  const venue = String(formData.get("venue") ?? "").trim() || null;
  const phase = String(formData.get("phase") ?? "").trim() || null;

  if (!seasonId || !homeTeamId || !awayTeamId || !scheduledAtRaw) {
    throw new Error("Tous les champs (sauf le lieu) sont requis.");
  }
  if (homeTeamId === awayTeamId) {
    throw new Error("Les deux équipes doivent être différentes.");
  }

  await prisma.game.create({
    data: {
      seasonId,
      homeTeamId,
      awayTeamId,
      scheduledAt: new Date(scheduledAtRaw),
      venue,
      phase,
    },
  });

  revalidatePath("/admin/schedule");
  revalidatePath("/calendrier");
}

export async function deleteGame(gameId: string) {
  await requireAdmin();
  try {
    await prisma.game.delete({ where: { id: gameId } });
  } catch (error) {
    toFriendlyDeleteError(error, "ce match");
  }
  revalidatePath("/admin/schedule");
  revalidatePath("/calendrier");
  redirect("/admin/schedule");
}
