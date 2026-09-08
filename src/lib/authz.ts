import "server-only";
import { auth } from "@/lib/auth";

// Next.js expose chaque Server Action comme un point d'entrée HTTP à part entière :
// le middleware protège la navigation vers /admin/*, mais une action ne doit jamais
// supposer qu'elle a été appelée depuis une page déjà protégée. Chaque mutation admin
// doit donc revérifier elle-même la session ici (défense en profondeur).
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Non autorisé : connexion administrateur requise.");
  }
  return session;
}
