import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/LegalPage";

export const metadata = { title: "Mentions légales — Youzou Ligue Pro" };

export default function LegalNoticePage() {
  return (
    <LegalPage title="Mentions légales" updatedAt="8 septembre 2026">
      <LegalSection title="Éditeur du site">
        <p>
          Le site Youzou Ligue Pro est édité à titre non commercial dans le but de faire connaître et de
          documenter le championnat professionnel béninois de basketball (Ligue Pro D1, Hommes et Dames).
        </p>
        <p>
          Contact éditorial :{" "}
          <a href="mailto:youzouleaguepro@gmail.com" className="text-brand hover:underline">
            youzouleaguepro@gmail.com
          </a>
        </p>
      </LegalSection>

      <LegalSection title="Hébergement">
        <p>
          Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis
          (
          <a
            href="https://vercel.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand hover:underline"
          >
            vercel.com
          </a>
          ). La base de données est hébergée par Neon (
          <a
            href="https://neon.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand hover:underline"
          >
            neon.tech
          </a>
          ).
        </p>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>
          Les noms, logos et couleurs des équipes appartiennent à leurs clubs respectifs et sont utilisés à des
          fins d&apos;identification et d&apos;information sportive. Les statistiques, calendriers et contenus
          éditoriaux propres à Youzou Ligue Pro ne peuvent être reproduits sans autorisation, sauf mention
          contraire.
        </p>
      </LegalSection>

      <LegalSection title="Signaler un contenu">
        <p>
          Pour toute question relative à l&apos;exactitude d&apos;une information, à un droit d&apos;image ou à
          un contenu présent sur le site, contactez-nous à{" "}
          <a href="mailto:beninligueprobasket@gmail.com" className="text-brand hover:underline">
            beninligueprobasket@gmail.com
          </a>
          . Voir aussi notre{" "}
          <Link href="/politique-de-confidentialite" className="text-brand hover:underline">
            politique de confidentialité
          </Link>{" "}
          et nos{" "}
          <Link href="/conditions-utilisation" className="text-brand hover:underline">
            conditions d&apos;utilisation
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
