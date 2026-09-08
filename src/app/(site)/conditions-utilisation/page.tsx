import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/LegalPage";

export const metadata = { title: "Conditions d'utilisation — Youzou Ligue Pro" };

export default function TermsOfUsePage() {
  return (
    <LegalPage title="Conditions d'utilisation" updatedAt="8 septembre 2026">
      <p>
        L&apos;utilisation du site Youzou Ligue Pro implique l&apos;acceptation pleine et entière des
        conditions décrites ci-dessous.
      </p>

      <LegalSection title="Objet du site">
        <p>
          Youzou Ligue Pro est un site d&apos;information à but non lucratif consacré au championnat
          professionnel béninois de basketball : présentation des équipes et des joueurs, calendrier,
          statistiques et classement. Le site n&apos;est pas un service de paris ni une billetterie.
        </p>
      </LegalSection>

      <LegalSection title="Exactitude des informations">
        <p>
          Les données affichées (effectifs, résultats, statistiques) sont saisies manuellement par
          l&apos;équipe éditoriale de la ligue à partir des informations disponibles. Des erreurs ou délais de
          mise à jour sont possibles ; nous nous efforçons de les corriger dès qu&apos;elles nous sont
          signalées à{" "}
          <a href="mailto:beninligueprobasket@gmail.com" className="text-brand hover:underline">
            beninligueprobasket@gmail.com
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Usage autorisé">
        <p>
          Vous êtes libre de consulter et de partager les pages du site. Toute extraction automatisée massive
          des données (aspiration/scraping) à des fins commerciales est interdite sans accord préalable.
        </p>
      </LegalSection>

      <LegalSection title="Liens vers des réseaux sociaux tiers">
        <p>
          Le site renvoie vers les comptes officiels de la ligue et des équipes sur Instagram, Facebook et
          TikTok. Ces plateformes sont exploitées par des tiers et régies par leurs propres conditions
          d&apos;utilisation, sur lesquelles Youzou Ligue Pro n&apos;a aucun contrôle.
        </p>
      </LegalSection>

      <LegalSection title="Responsabilité">
        <p>
          Le site est fourni « en l&apos;état ». La disponibilité continue du site n&apos;est pas garantie
          (maintenance, incidents techniques). Youzou Ligue Pro ne saurait être tenu responsable des
          conséquences d&apos;une indisponibilité temporaire ou d&apos;une inexactitude ponctuelle des données.
        </p>
      </LegalSection>

      <LegalSection title="Modification des conditions">
        <p>
          Ces conditions peuvent être mises à jour à mesure que le site évolue. Voir également nos{" "}
          <Link href="/mentions-legales" className="text-brand hover:underline">
            mentions légales
          </Link>{" "}
          et notre{" "}
          <Link href="/politique-de-confidentialite" className="text-brand hover:underline">
            politique de confidentialité
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
