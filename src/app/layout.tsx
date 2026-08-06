import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Youzou Ligue Pro",
  description:
    "Le site officiel de la ligue professionnelle béninoise de basketball : équipes, joueurs, calendrier, statistiques et classement.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
