# Youzou Ligue Pro

Youzou Ligue Pro est la plateforme officieuse — et à terme officielle — de la **Ligue Professionnelle de Basketball du Bénin (D1, Hommes et Dames)**, organisée par la Fédération béninoise de basket-ball (FBBB).

## Pourquoi ce projet

Aujourd'hui, la ligue béninoise de basketball n'a pas de site centralisant ses statistiques, ses joueurs, son historique. Les fans ne connaissent parfois même pas le nom des équipes, les résultats des matchs restent sur papier, et rien ne permet de retrouver l'historique d'un club, d'un joueur ou d'une saison.

Youzou Ligue Pro existe pour régler ce problème : **une base de données vivante de la ligue**, qui permet de :

- **Statistiquer** — suivre les performances des joueurs et des équipes, match après match, saison après saison (points, rebonds, passes, interceptions, contres, pourcentages aux tirs, double/triple-doubles, etc.), avec des classements et des meilleurs marqueurs à jour.
- **Documenter** — donner à chaque équipe et chaque joueur une vraie fiche : effectif, capitanat, poste, taille, poids, nationalité, ville natale, biographie, photo.
- **Historiser** — ne plus jamais perdre les données d'un match. Une fois saisi, un résultat, une feuille de match ou une statistique reste consultable indéfiniment : classements, historiques d'équipes, parcours de joueurs (y compris les transferts d'un club à l'autre).
- **Créer de l'attache** — permettre aux fans de suivre leur équipe et leurs joueurs préférés d'aussi près que sur un site comme nba.com : calendrier, résultats, effectifs, stats détaillées, agents libres.

## Périmètre

- **Ligue Pro D1 béninoise exclusivement**, catégories **Hommes** et **Dames**.
- Deux conférences géographiques, **Sud** et **Nord**, chacune avec ses propres classements.
- Structuré pour suivre plusieurs **saisons** dans le temps, avec montées/descentes d'équipes d'une saison à l'autre.

## Ce qui existe aujourd'hui

**Site public**
- Accueil : derniers résultats, prochains matchs, aperçu du classement.
- Équipes : liste par catégorie/conférence, fiche équipe (effectif, calendrier, résultats, couleur et logo du club).
- Joueurs : effectif complet de la ligue avec recherche, fiche joueur détaillée façon nba.com (bandeau aux couleurs du club, stats rapides, onglets Profil / Stats / Bio / Vidéos, historique par saison, coéquipiers).
- Calendrier & feuilles de match (score final + statistiques individuelles par joueur).
- Classement par catégorie et conférence.
- Statistiques : meilleurs marqueurs, rebondeurs, passeurs, intercepteurs, contreurs.
- Agents libres : joueurs actuellement sans club.

**Administration**
- Gestion des équipes, joueurs, saisons et calendrier.
- Affectation des joueurs à une équipe par saison (numéro de maillot, capitanat, poste).
- Formulaire de saisie groupée pour renseigner rapidement les informations de tous les joueurs d'un coup.
- Écran de saisie de match pensé pour le bord du terrain (gros boutons, utilisable au téléphone) : brouillon en cours de match, puis clôture qui calcule automatiquement le score final et met à jour classements et statistiques.

**Données déjà en place**
- Les équipes réelles des conférences Sud et Nord (Hommes et Dames), avec logos officiels.
- Les effectifs connus d'Energie BBC, ASPAC BBC, Elan Coton BBC et Renaissance BBC, avec capitaines et informations disponibles (taille, âge, nationalité, ville natale, photo quand elle existe).

## Feuille de route

- **Saisie en direct depuis le terrain** : une application mobile (ou une interface web mobile enrichie) permettant à un scoreur de statter un match en temps réel plutôt qu'après coup, pour ne plus dépendre d'une feuille papier.
- **Complétion des effectifs** : ajout progressif des joueurs et de leurs informations pour toutes les équipes de la ligue (Sud et Nord, Hommes et Dames), au fur et à mesure qu'elles sont connues.
- **Historique complet** : anciens champions, MVP, palmarès des clubs, une fois les premières saisons jouées sur la plateforme.
- **Contenu éditorial** : actualités et articles liés aux temps forts de la ligue.
- **Vidéos et highlights** : dès que les moyens de captation des matchs le permettront.
- **Accès joueur en libre-service** : un moyen simple (lien de réclamation par joueur) pour que chaque joueur puisse compléter sa propre fiche (bio, photo, réseaux sociaux) sans multiplier le travail de saisie manuelle.

## Stack technique

Next.js (TypeScript) + PostgreSQL/Prisma + Auth.js pour l'administration, déployable à faible coût (Vercel + base de données managée). Le détail des choix techniques et du schéma de données est dans le code (`prisma/schema.prisma`) et dans l'historique des commits.
