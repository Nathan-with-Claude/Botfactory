# Feedback : Interface web de supervision DocuPost

**Persona testé** : Laurent Renaud — Responsable Exploitation Logistique
**Date** : 2026-04-01
**Périmètre testé** : Refactorisation écrans superviseur MD3 (US-027), Export CSV (US-028), Vérification compatibilité véhicule (US-030), Nouveaux composants designer web (US-031), Synchronisation read model (US-032), Suggestion réaffectation après échec compatibilité (US-034), Recherche multi-critères tableau de bord (US-035)

---

## Bloquants (à corriger avant livraison)

- **Le titre de l'onglet navigateur est toujours absent ou générique.** Ce bloquant du 30/03 n'a pas été adressé dans les US récentes (US-027 à US-035 se concentrent sur le design et les fonctionnalités, pas sur le `<title>` HTML). En salle de supervision le matin, j'ai DocuPost, l'ERP, les mails et parfois une feuille de calcul ouverts en simultané. Sans titre d'onglet clair ("DocuPost — Préparation" ou "DocuPost — Supervision"), je perds du temps à survoler les onglets. C'est une correction de 5 minutes pour une gêne quotidienne réelle.

- **La connexion WebSocket casse toujours sans action proposée.** Le bandeau "Connexion temps réel indisponible" est là mais il n'y a toujours pas de bouton "Reconnecter" ni de décompte de temps de déconnexion. US-032 a amélioré la synchronisation via HTTP fire-and-forget, ce qui est bien — mais la reconnexion WebSocket manuelle reste absente de l'UI. Si le WebSocket tombe et que le fallback polling est actif, je ne le sais pas clairement. En supervision de 15 tournées simultanées, travailler sur des données gelées sans le savoir est un risque opérationnel sérieux.

- **Aucune confirmation visuelle après envoi d'instruction.** Ce bloquant du 30/03 reste non résolu dans les US récentes. Après avoir cliqué "Envoyer", l'interface ne me donne pas de retour visible immédiat. Je continue à recliqueter, je génère des doublons, et Pierre reçoit deux fois la même notification. Un message temporaire de 2 secondes suffirait.

---

## Améliorations importantes

- **L'export CSV (US-028) est implémenté dans W-05 (onglet Composition), mais pas depuis le tableau de bord.** Mon besoin principal est en fin de journée, depuis le tableau de bord, pour exporter le bilan des tournées du jour. Or US-028 place le bouton uniquement dans le détail d'une tournée planifiée (W-05). Depuis le tableau de bord (W-01), il n'y a pas d'export global. C'est un bon premier pas, mais le cas d'usage quotidien reste couvert à moitié.

- **La vérification de compatibilité véhicule (US-030) et la suggestion de réaffectation (US-034) sont bien implémentées.** L'indicateur coloré COMPATIBLE/DEPASSEMENT dans W-05, le bouton "Affecter quand même" en orange et le bouton "Réaffecter à un véhicule plus grand" en bleu répondent exactement à ce que je demandais au 30/03. Le panneau pré-filtré avec les véhicules compatibles triés par capacité est particulièrement utile — je n'ai plus à chercher moi-même un véhicule disponible. C'est le gain le plus concret de cette session.

- **La recherche multi-critères (US-035) est fonctionnelle.** Je peux chercher par nom de livreur, par code TMS ou par zone, et la liste se filtre en temps réel. Le lien "Effacer la recherche" est bien placé. En revanche, le placeholder "Livreur, code TMS (ex: T-205), zone (ex: Villeurbanne)..." est un peu long pour une saisie rapide. Un placeholder plus court ("Rechercher...") avec un tooltip sur les critères disponibles serait plus lisible.

- **La synchronisation du read model (US-032) est une avancée majeure.** Avant, le tableau de bord était figé — les livraisons de Pierre ne remontaient pas. Maintenant, chaque livraison confirmée ou échec déclaré met à jour la vue supervision en temps réel (via HTTP fire-and-forget + WebSocket push). C'est fondamental pour la supervision journée. Le comportement attendu pour moi en salle de supervision : voir les compteurs de la barre de progression avancer sans avoir à rafraîchir la page.

- **La limite connue sur le `livreurId`** mérite attention : l'implémentation US-032 passe `"livreur"` comme identifiant littéral depuis `svc-tournee`. Si une VueTournee est créée automatiquement (tournée non présente dans les seeds), le nom du livreur affiché dans le tableau de bord sera "livreur" au lieu de "Pierre Morel". En salle de supervision, je dois voir le nom réel, pas un identifiant système. Ce point doit être corrigé avant la mise en production.

- **Le design MD3 (US-027) est un vrai progrès visuellement.** La sidebar avec les icônes Material Symbols, le header avec le badge LIVE animé, les cards métriques du tableau de bord avec leurs icônes — l'interface ressemble enfin à un outil professionnel. Le tableau de préparation avec les lignes d'anomalie en orange surligné est lisible et fonctionnel.

- **La barre de filtres W-01 avec des tabs à la place du `<select>`** est plus claire. Je vois d'un coup d'oeil "Tous | A_RISQUE | CLOTUREE" et je clique directement. L'ancienne liste déroulante était moins intuitive.

- **Le poids estimé n'est toujours pas visible dans le tableau de préparation W-04.** Je dois aller dans le détail de chaque tournée (W-05) pour voir si le poids dépasse la capacité du véhicule. Avec 12 tournées à préparer en 30 minutes, je voudrais voir directement dans le tableau si une ligne est en surcharge potentielle, sans cliquer sur "Voir détail". L'icône d'alerte est présente pour les anomalies détectées — il suffirait d'y ajouter la donnée "xxx kg / yyy kg capacité".

- **L'indicateur LIVE/OFFLINE dans la TopAppBar est maintenant plus visible (badge animé)**, mais il reste en haut à droite, loin de mon regard centré sur le tableau. Amélioration : si le statut passe en OFFLINE ou POLLING, que le bandeau rouge central soit automatiquement affiché sans attendre que je remarque le badge.

---

## Points positifs

- **La suggestion de réaffectation (US-034) est exactement ce que j'attendais.** Avant, après un échec de compatibilité, j'avais un message d'erreur et aucun chemin de résolution. Maintenant j'ai un bouton "Réaffecter à un véhicule plus grand" qui ouvre directement une liste filtrée des véhicules disponibles. Je sélectionne, je confirme, c'est réglé. Le flux prend moins de 30 secondes.

- **Le bouton "Affecter quand même" (orange) se distingue bien du bouton "Réaffecter" (bleu).** La distinction de couleur est logique : orange pour l'action de forçage (risque assumé), bleu pour l'action recommandée (réaffectation propre). Pas besoin d'explication.

- **La recherche multi-critères (US-035) règle le problème du matin où je cherche une tournée par zone.** Je tape "Villeurbanne", je vois immédiatement les tournées de Villeurbanne. Avant, je parcourais le tableau entier.

- **La synchronisation en temps réel (US-032) fonctionne.** Voir les compteurs de progression évoluer sans rafraîchir manuellement est ce qu'on attendait depuis le début du projet. C'est le coeur fonctionnel de la supervision.

- **Le statut des instructions (Envoyée / Exécutée) dans le détail de tournée** continue de bien fonctionner. Je vois en temps réel si Pierre a pris en compte ma consigne.

- **Le Design System MD3 (US-027)** donne une cohérence visuelle à l'ensemble. Les couleurs de statut sont claires, les badges lisibles à distance (je travaille parfois à 1,5m du moniteur), et la sidebar est fonctionnelle.

- **Les filtres "Toutes / Non affectées / Affectées / Lancées" dans W-04** correspondent exactement à mon flux de préparation matinal.

---

## Termes que j'utilise naturellement (signal Ubiquitous Language)

| Ce que j'ai vu à l'écran | Ce que j'aurais dit moi | Difference significative ? |
|--------------------------|------------------------|---------------------------|
| "Réaffecter à un véhicule plus grand" (bouton US-034) | "Changer de véhicule" ou "Prendre un véhicule plus grand" | Non — "réaffecter" est compris en contexte |
| "Compatibilité vérifiée" / "Dépassement détecté" (indicateurs US-030) | "Véhicule ok" / "Chargement trop lourd" | Oui — "dépassement" est technique, "trop lourd" serait plus naturel |
| "Panneau de réaffectation" (terme interne) | [non visible par le superviseur] | — |
| "Exporter CSV" (bouton US-028) | "Télécharger la liste" ou "Imprimer la feuille de route" | Oui — "CSV" est un format technique, "Télécharger la liste" serait plus parlant |
| "Composition exportée" (event domain) | [non visible] | — |
| "Code TMS" (champ de recherche US-035) | "Numéro de tournée" ou "ID tournée" | Oui — "TMS" est notre système interne, mais mes collègues moins techniques ne savent pas ce que ça signifie |
| "Zone" (critère de recherche US-035) | "Secteur" ou "Quartier" | Oui — "zone" est accepté mais "secteur" serait plus parlant pour les livreurs qui me demandent "la tournée du secteur Villeurbanne" |
| "livreurId" (limite connue US-032) | [non visible si bug — sinon "Pierre Morel"] | — — critique si "livreur" s'affiche à la place du nom |
| "Instruction" (envoi superviseur) | "Consigne" ou "Message" | Oui — même remarque que le 30/03, "consigne" est plus naturel terrain |
| "VueTournee" (terme technique) | [non visible] | — |
| "Rechercher" (placeholder) | "Trouver une tournée" | Non — les deux fonctionnent |

---

## Notes complémentaires terrain

**Sur la préparation matinale et le chrono 30 minutes** : avec les nouvelles fonctionnalités (vérification compatibilité + suggestion réaffectation + lancement en un clic), le flux de préparation W-04 est maintenant raisonnablement efficace. La séquence "sélectionner livreur > sélectionner véhicule > vérification automatique > corriger si besoin > lancer" peut tenir en moins de 2 minutes par tournée si tout se passe bien. Sur 12 tournées, ça reste serré mais réalisable si aucun blocage réseau ne ralentit les appels API.

**Sur la synchronisation et la fiabilité** : US-032 a un risque connu — si `svc-supervision` est indisponible lors d'une livraison, la mise à jour du tableau de bord est perdue (fire-and-forget sans outbox). En production, ce scénario arrivera tôt ou tard. Le feedback que je verrai en salle : un compteur de progression gelé alors que le livreur avance. Je préfère être informé de ce cas plutôt que de piloter sur des données incomplètes en pensant qu'elles sont exactes.

**Sur l'export CSV** : le format généré (BOM UTF-8 + CRLF + guillemets pour les virgules) est correct pour Excel — c'est l'outil que j'utilise pour mes rapports. Le contenu (colonnes `#Colis, Adresse, Zone, Contrainte`) est un bon point de départ, mais en pratique j'aurais besoin du nom du destinataire et du statut final (livré / échec) pour le rapport de fin de journée. Cette colonne manquante rend le CSV partiellement utile pour mon usage réel.

**Sur l'absence d'export depuis le tableau de bord** : mon workflow réel est : fin de journée à 19h, je vais sur le tableau de bord, je vois toutes les tournées clôturées, je veux exporter le bilan. Cette action naît dans W-01, pas dans W-05 (détail d'une tournée planifiée). L'export depuis W-05 répond au cas "avant le départ" — ce n'est pas mon cas d'usage principal.
