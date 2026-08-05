import type { NextAuthConfig } from "next-auth";

// Config "légère", sans provider ni dépendance Node (Prisma/bcrypt), pour rester
// sous la limite de taille des Edge Functions (middleware). Le provider Credentials
// complet est ajouté séparément dans src/lib/auth.ts, utilisé uniquement côté Node.
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
