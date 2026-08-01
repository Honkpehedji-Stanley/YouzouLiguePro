import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Youzou Ligue Pro",
  description:
    "Le site officiel de la ligue professionnelle béninoise de basketball : équipes, joueurs, calendrier, statistiques et classement.",
};

const NAV_LINKS = [
  { href: "/equipes", label: "Équipes" },
  { href: "/joueurs", label: "Joueurs" },
  { href: "/calendrier", label: "Calendrier" },
  { href: "/classement", label: "Classement" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased flex min-h-screen flex-col">
        <header className="border-b border-black/10">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.jpg"
                alt="Youzou Ligue Pro"
                width={40}
                height={40}
                className="rounded-md"
              />
              <span className="text-lg font-bold tracking-tight">
                <span className="text-brand">Youzou</span> Ligue Pro
              </span>
            </Link>
            <nav className="flex gap-6 text-sm font-medium">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-brand"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-black/10 px-4 py-6 text-center text-sm text-black/60">
          Youzou Ligue Pro — Le basketball professionnel béninois.
        </footer>
      </body>
    </html>
  );
}
