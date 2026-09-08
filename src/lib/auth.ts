import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const admin = await prisma.adminUser.findUnique({ where: { email } });
        if (!admin) {
          // Toujours faire vérifier un hash (même factice) pour ne pas révéler,
          // via le temps de réponse, si l'email existe ou non dans la base.
          await bcrypt.compare(password, "$2a$12$invalidsaltinvalidsaltinuseXXXXXXXXXXXXXXXXXXXXXXXXX");
          return null;
        }

        const isLocked = admin.lockedUntil && admin.lockedUntil.getTime() > Date.now();
        if (isLocked) return null;

        const valid = await bcrypt.compare(password, admin.passwordHash);

        if (!valid) {
          const failedAttempts = admin.failedAttempts + 1;
          const LOCKOUT_THRESHOLD = 5;
          const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
          await prisma.adminUser.update({
            where: { id: admin.id },
            data: {
              failedAttempts,
              lockedUntil:
                failedAttempts >= LOCKOUT_THRESHOLD ? new Date(Date.now() + LOCKOUT_DURATION_MS) : admin.lockedUntil,
            },
          });
          return null;
        }

        if (admin.failedAttempts > 0 || admin.lockedUntil) {
          await prisma.adminUser.update({
            where: { id: admin.id },
            data: { failedAttempts: 0, lockedUntil: null },
          });
        }

        return {
          id: admin.id,
          email: admin.email,
          name: admin.name ?? admin.email,
          role: admin.role,
        };
      },
    }),
  ],
});
