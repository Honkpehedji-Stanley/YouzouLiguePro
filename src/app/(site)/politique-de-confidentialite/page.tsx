import { LegalPage, LegalSection } from "@/components/LegalPage";

export const metadata = { title: "Politique de confidentialité — Youzou Ligue Pro" };

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Politique de confidentialité" updatedAt="8 septembre 2026">
      <p>
        Youzou Ligue Pro attache de l&apos;importance à la protection de la vie privée de ses visiteurs.
        Cette page explique simplement quelles données sont traitées sur ce site et pourquoi.
      </p>

      <LegalSection title="Ce que nous ne collectons pas">
        <p>
          La partie publique du site (équipes, joueurs, calendrier, statistiques, classement) ne demande aucune
          création de compte et n&apos;utilise aucun outil de suivi publicitaire, aucun cookie de mesure
          d&apos;audience et aucun pixel tiers. Vous pouvez consulter le site sans fournir la moindre
          information personnelle.
        </p>
      </LegalSection>

      <LegalSection title="Ce que nous collectons">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="font-medium">Emails envoyés directement</span> : si vous nous écrivez à{" "}
            <a href="mailto:youzouleaguepro@gmail.com" className="text-brand hover:underline">
              youzouleaguepro@gmail.com
            </a>{" "}
            ou{" "}
            <a href="mailto:beninligueprobasket@gmail.com" className="text-brand hover:underline">
              beninligueprobasket@gmail.com
            </a>
            , nous recevons votre adresse email et le contenu de votre message, utilisés uniquement pour vous
            répondre.
          </li>
          <li>
            <span className="font-medium">Espace d&apos;administration</span> : les comptes du personnel de la
            ligue habilité à saisir les données sportives (équipes, joueurs, résultats) sont protégés par
            authentification. Ces comptes ne concernent pas les visiteurs du site.
          </li>
          <li>
            <span className="font-medium">Mémoire locale du navigateur</span> : certaines préférences
            d&apos;affichage peuvent être conservées localement dans votre navigateur (par exemple un filtre
            sélectionné) ; ces informations restent sur votre appareil et ne nous sont jamais transmises.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Vos droits">
        <p>
          Conformément au code du numérique béninois (loi n° 2017-20) et aux principes de protection des
          données personnelles, vous pouvez à tout moment demander l&apos;accès, la correction ou la
          suppression des informations que vous nous avez transmises par email, en écrivant à{" "}
          <a href="mailto:youzouleaguepro@gmail.com" className="text-brand hover:underline">
            youzouleaguepro@gmail.com
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Évolution de cette politique">
        <p>
          À mesure que le site évoluera (par exemple avec l&apos;ajout d&apos;outils de mesure d&apos;audience
          ou de comptes utilisateurs), cette page sera mise à jour pour refléter précisément les données
          réellement traitées.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
