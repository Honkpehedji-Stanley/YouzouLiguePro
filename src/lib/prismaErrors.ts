import { Prisma } from "@prisma/client";

// Traduit les erreurs Prisma les plus courantes en messages compréhensibles pour
// l'admin, au lieu de laisser remonter la stack trace brute jusqu'à l'écran d'erreur.
export function toFriendlyDeleteError(error: unknown, whatIsBeingDeleted: string): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2003") {
      throw new Error(
        `Impossible de supprimer ${whatIsBeingDeleted} : des matchs ou des statistiques y sont encore rattachés.`
      );
    }
    if (error.code === "P2025") {
      throw new Error(`${whatIsBeingDeleted} a déjà été supprimé·e.`);
    }
  }
  throw error;
}
