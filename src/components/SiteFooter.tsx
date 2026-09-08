import Image from "next/image";
import Link from "next/link";
import { InstagramIcon, FacebookIcon, TikTokIcon } from "@/components/icons/SocialIcons";

const SOCIAL_LINKS = [
  { label: "TikTok", href: "https://www.tiktok.com/@youzou_ligue_pro", Icon: TikTokIcon },
  { label: "Instagram", href: "https://www.instagram.com/youzou_ligue_pro/", Icon: InstagramIcon },
  {
    label: "Facebook",
    href: "https://www.facebook.com/people/%F0%9D%90%98%F0%9D%90%A8%F0%9D%90%AE%F0%9D%90%99%F0%9D%90%A8%F0%9D%90%AE-%F0%9D%90%8B%F0%9D%90%A2%F0%9D%90%A0%F0%9D%90%AE%F0%9D%90%9E-%F0%9D%90%8F%F0%9D%90%AB%F0%9D%90%A8/61573379142172/",
    Icon: FacebookIcon,
  },
];

const NAV_COLUMN = [
  { href: "/equipes", label: "Équipes" },
  { href: "/joueurs", label: "Joueurs" },
  { href: "/calendrier", label: "Calendrier" },
  { href: "/statistiques", label: "Statistiques" },
  { href: "/classement", label: "Classement" },
  { href: "/agents-libres", label: "Agents libres" },
];

const LEGAL_COLUMN = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/politique-de-confidentialite", label: "Politique de confidentialité" },
  { href: "/conditions-utilisation", label: "Conditions d'utilisation" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-black/10 bg-black text-white/70">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.jpg" alt="Youzou Ligue Pro" width={36} height={36} className="rounded-md" />
              <span className="text-base font-bold tracking-tight text-white">
                <span className="text-brand-light">Youzou</span> Ligue Pro
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed">
              Le hub des fans du championnat professionnel béninois de basketball : équipes, joueurs,
              calendrier, statistiques et classement.
            </p>
            <div className="mt-4 flex items-center gap-3">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Youzou Ligue Pro sur ${label}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-white/40">Navigation</p>
            <ul className="flex flex-col gap-2 text-sm">
              {NAV_COLUMN.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-white/40">Contact</p>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <p className="text-white/40">Communication</p>
                <a href="mailto:youzouleaguepro@gmail.com" className="transition hover:text-white">
                  youzouleaguepro@gmail.com
                </a>
              </li>
              <li>
                <p className="text-white/40">Support</p>
                <a href="mailto:beninligueprobasket@gmail.com" className="transition hover:text-white">
                  beninligueprobasket@gmail.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-white/40">Informations légales</p>
            <ul className="flex flex-col gap-2 text-sm">
              {LEGAL_COLUMN.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Youzou Ligue Pro. Tous droits réservés.</p>
          <p>Ligue Pro D1 — Hommes et Dames · Bénin</p>
        </div>
      </div>
    </footer>
  );
}
