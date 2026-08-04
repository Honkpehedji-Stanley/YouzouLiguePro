import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { PageContainer } from "@/components/PageContainer";

const ADMIN_LINKS = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/teams", label: "Équipes" },
  { href: "/admin/players", label: "Joueurs" },
  { href: "/admin/players/bulk", label: "Saisie groupée" },
  { href: "/admin/seasons", label: "Saisons" },
  { href: "/admin/schedule", label: "Calendrier" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <PageContainer>
      {session && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-4">
          <nav className="flex flex-wrap gap-4 text-sm font-medium">
            {ADMIN_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-brand">
                {link.label}
              </Link>
            ))}
          </nav>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <span className="mr-3 text-sm text-black/60">
              {session.user.email}
            </span>
            <button type="submit" className="text-sm underline">
              Se déconnecter
            </button>
          </form>
        </div>
      )}
      {children}
    </PageContainer>
  );
}
