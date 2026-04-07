# US-050 : Désaffecter un livreur d'une tournée planifiée depuis l'interface de supervision

**Epic** : EPIC-007 — Planification et Préparation des Tournées
**Feature** : F-020 — Affectation livreur et véhicule
**Bounded Context** : BC-07 (Planification et Préparation des Tournées)
**Aggregate(s) touchés** : TourneePlanifiee (BC-07)
**Priorité** : Should Have
**Statut** : Prête
**Complexité estimée** : S

---

## User Story

En tant que responsable logistique,
je veux pouvoir retirer l'affectation d'un livreur sur une tournée planifiée depuis
l'onglet Affectation de W-05,
afin de corriger une erreur d'affectation ou de remplacer un livreur absent sans
devoir recréer la tournée.

---

## Contexte

### Besoin métier

Le cas d'usage courant est le suivant : un livreur affecté la veille est absent le
matin. Le responsable logistique doit affecter un remplaçant. Aujourd'hui, si une
`TourneePlanifiee` est déjà à l'état `AFFECTEE`, l'interface de supervision (W-05
onglet Affectation) ne propose aucune action pour retirer le livreur. Le superviseur
est bloqué et doit intervenir directement en base ou relancer un import TMS.

Un autre cas d'usage est la correction d'erreur : le mauvais livreur a été affecté.
La désaffectation remet la tournée en statut `NON_AFFECTEE`, libère le livreur
pour d'autres tournées, et permet une nouvelle affectation depuis la même interface.

### Invariants à respecter

- La désaffectation est **uniquement autorisée** si la `TourneePlanifiee` est dans
  l'état `AFFECTEE`. Une tournée à l'état `NON_AFFECTEE` ne peut pas être désaffectée
  (aucun livreur à retirer). Une tournée à l'état `LANCEE` ne peut pas être désaffectée
  (tournée en cours d'exécution — le livreur est sur le terrain).
- Après désaffectation, le `livreurId` de la `TourneePlanifiee` est remis à `null`
  et le statut passe à `NON_AFFECTEE`. Ces deux transitions sont atomiques.
- L'événement `DesaffectationEnregistree` doit être émis et historisé dans le
  store d'événements (BC-05) pour garantir l'auditabilité de l'opération.
- Un livreur désaffecté d'une tournée redevient immédiatement sélectionnable dans
  le picker d'affectation pour d'autres tournées de la même journée.

### Règles de gestion complémentaires

- Si la tournée est à l'état `LANCEE` et que le superviseur tente de désaffecter,
  afficher un message d'erreur explicite : "Impossible de désaffecter un livreur d'une
  tournée en cours. Clôturez d'abord la tournée depuis l'application mobile."
- La désaffectation ne modifie pas les colis associés à la tournée : ils restent
  attachés à la `TourneePlanifiee` et sont réaffectés avec le livreur suivant.

### Liens avec US existantes

- **US-023** : l'affectation d'un livreur et d'un véhicule. US-050 est le pendant
  inverse — la désaffectation. Elles appartiennent à la même Feature F-020.
- **US-018** : l'historisation immuable. L'événement `DesaffectationEnregistree` doit
  être capturé dans le store d'événements de BC-05.
- **US-049** : les 6 livreurs dev alignés. Après désaffectation d'un livreur, le picker
  doit proposer les 6 livreurs, y compris celui qui vient d'être désaffecté.

---

## Critères d'acceptation (Gherkin)

### SC1 — Affichage du bouton "Désaffecter" pour une tournée affectée

```gherkin
Scenario: Le superviseur voit le bouton "Désaffecter" sur une tournée déjà affectée
  Given le superviseur est connecté à l'interface de supervision web
  And la TourneePlanifiee T-202 est à l'état AFFECTEE avec livreurId="livreur-001" (Pierre Martin)
  When le superviseur ouvre le détail de T-202 sur W-05 onglet "Affectation"
  Then le nom du livreur affecté "Pierre Martin" est affiché
  And un bouton "Désaffecter" est visible à côté du nom du livreur
  And le bouton "Affecter un autre livreur" reste accessible
```

### SC2 — Désaffectation réussie d'un livreur

```gherkin
Scenario: Le superviseur désaffecte avec succès un livreur d'une tournée planifiée
  Given la TourneePlanifiee T-202 est à l'état AFFECTEE avec livreurId="livreur-001"
  When le superviseur clique sur "Désaffecter"
  And confirme l'action dans la boîte de dialogue de confirmation
  Then la TourneePlanifiee T-202 passe à l'état NON_AFFECTEE
  And le champ livreurId de T-202 est remis à null
  And l'événement DesaffectationEnregistree est émis avec les attributs :
    | tourneeId   | T-202       |
    | livreurId   | livreur-001 |
    | horodatage  | [timestamp] |
  And l'interface W-05 affiche le statut "Non affectée" pour T-202
  And le picker d'affectation propose à nouveau "livreur-001 — Pierre Martin"
```

### SC3 — La désaffectation est bloquée si la tournée est lancée

```gherkin
Scenario: Le superviseur ne peut pas désaffecter un livreur d'une tournée lancée
  Given la TourneePlanifiee T-204 est à l'état LANCEE avec livreurId="livreur-002"
  When le superviseur ouvre le détail de T-204 sur W-05 onglet "Affectation"
  Then le bouton "Désaffecter" est absent ou désactivé
  And un message d'information est affiché :
    "Impossible de désaffecter un livreur d'une tournée en cours. Clôturez d'abord la tournée depuis l'application mobile."
```

### SC4 — La désaffectation est inutile si la tournée est déjà non affectée

```gherkin
Scenario: Aucun bouton "Désaffecter" n'est affiché pour une tournée non affectée
  Given la TourneePlanifiee T-201 est à l'état NON_AFFECTEE (livreurId = null)
  When le superviseur ouvre le détail de T-201 sur W-05 onglet "Affectation"
  Then le bouton "Désaffecter" est absent
  And le picker d'affectation est disponible pour affecter un livreur
```

### SC5 — Réaffectation immédiate après désaffectation

```gherkin
Scenario: Le superviseur réaffecte un nouveau livreur immédiatement après désaffectation
  Given la TourneePlanifiee T-202 vient d'être désaffectée (statut NON_AFFECTEE)
  When le superviseur sélectionne "livreur-003 — Marie Lambert" dans le picker d'affectation
  And confirme l'affectation
  Then la TourneePlanifiee T-202 passe à l'état AFFECTEE avec livreurId="livreur-003"
  And l'événement AffectationEnregistree est émis avec livreurId="livreur-003" et tourneeId="T-202"
  And l'interface W-05 affiche "Marie Lambert" comme livreur affecté à T-202
```

### SC6 — L'événement DesaffectationEnregistree est historisé dans BC-05

```gherkin
Scenario: La désaffectation est auditée dans le store d'événements
  Given la TourneePlanifiee T-202 est désaffectée par le superviseur
  When l'événement DesaffectationEnregistree est émis
  Then il est persisté dans le store d'événements (BC-05) avec les attributs obligatoires :
    | attribut       | valeur              |
    | qui            | superviseurId       |
    | quoi           | DesaffectationEnregistree |
    | quand          | horodatage ISO 8601 |
    | tourneeId      | T-202               |
    | livreurIdRetire| livreur-001         |
  And l'événement est immuable (non modifiable après création)
```

---

## Notes techniques

- Côté backend : ajouter un endpoint `DELETE /api/supervision/tournees-planifiees/{tourneeId}/affectation`
  (ou `PATCH` avec body `{ livreurId: null }`) dans `svc-supervision`. L'endpoint vérifie
  l'état de la `TourneePlanifiee` avant de procéder.
- La vérification d'état (`AFFECTEE` requis, `LANCEE` interdit) est un invariant de
  l'Aggregate `TourneePlanifiee` — elle doit être appliquée dans la couche domaine,
  pas uniquement dans le controller.
- Côté frontend : modifier `DetailTourneePage.tsx` pour afficher le bouton "Désaffecter"
  conditionnellement (statut === 'AFFECTEE') et appeler le nouvel endpoint.
- La boîte de dialogue de confirmation (SC2) peut être un `window.confirm` natif ou
  un composant modal DaisyUI — à aligner avec le design system en place.
- Pas d'impact sur `svc-tournee` (BC-01) : la désaffectation est une opération BC-07
  uniquement. Si la tournée n'a pas encore été propagée via le DevEventBridge, aucune
  Tournee dans BC-01 n'est concernée.
- En profil `dev`, les seeders doivent créer au moins une `TourneePlanifiee` à l'état
  `AFFECTEE` pour permettre le test manuel de SC2.

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#W-05 (onglet Affectation)
- US liées : US-023 (affectation livreur et véhicule), US-018 (historisation immuable), US-049 (6 livreurs dev)
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
- Écran supervision : src/web/supervision/src/pages/DetailTourneePage.tsx
- Seeder supervision : src/backend/svc-supervision/src/main/java/com/docapost/supervision/infrastructure/seeder/DevDataSeeder.java
