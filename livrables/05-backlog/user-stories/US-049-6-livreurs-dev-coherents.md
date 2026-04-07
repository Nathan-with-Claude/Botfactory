# US-049 : Aligner les 6 profils livreurs de développement entre l'app mobile et la supervision

**Epic** : EPIC-DEV-001 — Infrastructure de test et observabilité (dev/test uniquement)
**Feature** : F-DEV-001 — Simulateur TMS et pont d'événements inter-BC (périmètre dev/test, hors prod)
**Bounded Context** : BC-06 (Identité et Accès) / BC-07 (Planification et Préparation des Tournées)
**Aggregate(s) touchés** : Livreur (BC-06), TourneePlanifiee (BC-07), Tournee (BC-01)
**Priorité** : Must Have
**Statut** : Prête
**Complexité estimée** : S

---

## User Story

En tant que développeur DocuPost,
je veux disposer de 6 profils livreurs identiques (mêmes IDs, mêmes noms) dans le picker
de connexion mobile, dans le seeder de svc-supervision et dans le seeder de svc-tournee,
afin de pouvoir tester tous les cas d'usage (livreur avec tournée, livreur sans tournée,
livreur en erreur) sans incohérence entre les deux interfaces.

---

## Contexte

### Problème observé

Après l'implémentation de US-047 (picker dev mobile) et US-048 (DevEventBridge), le
projet dispose de 5 livreurs dans le picker mobile (`livreur-001` à `livreur-005`) mais
seulement 4 dans les seeders backend (livreur-001 à livreur-004 pour svc-tournee),
et les VueTournees de svc-supervision ne couvrent que 3 d'entre eux (Pierre Martin,
Marie Lambert, Jean Moreau). Sophie Bernard (`livreur-005`) n'a pas de données de
supervision.

Il manque en outre un 6e livreur, nécessaire pour couvrir le cas "nouveau livreur
sans aucune donnée" (onboarding) et pour que le picker de supervision (W-05 onglet
Affectation) propose 6 choix alignés sur les 6 comptes dev mobiles.

### Invariants à respecter

- Chaque `Livreur` de l'infrastructure dev doit avoir un identifiant unique au format
  `livreur-00N` (N de 001 à 006).
- Le `livreurId` utilisé dans le picker mobile (`devLivreurs.ts`) doit être strictement
  identique à celui stocké dans les seeders `svc-tournee` et `svc-supervision`.
- Le `DevDataSeeder` ne doit pas être actif en profil `prod` (annotation `@Profile("dev")`
  obligatoire).
- Au moins une `TourneePlanifiee` doit être associée à chacun des 6 livreurs dans
  svc-supervision (seeder), quelle que soit sa valeur de statut (`NON_AFFECTEE`,
  `AFFECTEE`, `LANCEE`).
- Au moins une `Tournee` doit exister dans svc-tournee pour les livreurs 001 à 004.
  Les livreurs 005 et 006 restent sans tournée (cas "message vide") pour couvrir SC4
  de US-048.

### Liens avec US existantes

- **US-047** : définit le format du picker mobile et la liste initiale (4 livreurs
  initiaux, puis étendue à 5 avec livreur-005). US-049 porte l'extension à 6 et
  l'alignement complet.
- **US-048** : le DevEventBridge lit le `livreurId` du seeder supervision — si le seeder
  ne couvre pas livreur-005 et livreur-006, ces livreurs n'auront jamais de tournée
  propagée dans BC-01.
- **US-023** : le picker d'affectation W-05 doit proposer tous les livreurs de
  développement (source : seeder supervision).

---

## Critères d'acceptation (Gherkin)

### SC1 — Le picker mobile propose exactement 6 livreurs dev

```gherkin
Scenario: L'écran de connexion mobile affiche 6 profils livreurs en mode développement
  Given l'application mobile est lancée avec __DEV__ === true
  When l'écran de connexion (ConnexionScreen) s'affiche
  Then le bloc "MODE DEV" contient exactement 6 boutons livreurs :
    | testID                           | libellé affiché           |
    | btn-dev-livreur-livreur-001      | Pierre Martin (livreur-001) |
    | btn-dev-livreur-livreur-002      | Paul Dupont (livreur-002)   |
    | btn-dev-livreur-livreur-003      | Marie Lambert (livreur-003) |
    | btn-dev-livreur-livreur-004      | Jean Moreau (livreur-004)   |
    | btn-dev-livreur-livreur-005      | Sophie Bernard (livreur-005)|
    | btn-dev-livreur-livreur-006      | Lucas Petit (livreur-006)  |
  And aucun autre bouton livreur n'est présent dans la section dev
```

### SC2 — Le seeder svc-supervision couvre les 6 livreurs

```gherkin
Scenario: Le seeder de supervision initialise des données pour les 6 livreurs dev
  Given svc-supervision démarre en profil "dev"
  When le DevDataSeeder s'exécute
  Then 6 VueTournees sont créées, une par livreurId (livreur-001 à livreur-006)
  And au moins 4 TourneePlanifiees sont créées avec les affectations suivantes :
    | tourneeId | livreurId    | statut      |
    | T-201     | NON_AFFECTEE | NON_AFFECTEE |
    | T-202     | livreur-001  | AFFECTEE    |
    | T-203     | NON_AFFECTEE | NON_AFFECTEE |
    | T-204     | livreur-002  | LANCEE      |
    | T-205     | livreur-005  | AFFECTEE    |
    | T-206     | livreur-006  | AFFECTEE    |
  And les VueTournees de livreur-005 et livreur-006 sont accessibles via GET /api/supervision/vue-tournees/{livreurId}
```

### SC3 — Le seeder svc-tournee couvre les livreurs 001 à 004

```gherkin
Scenario: Le seeder de svc-tournee initialise des Tournees pour les livreurs 001 à 004
  Given svc-tournee démarre en profil "dev"
  When le DevDataSeeder s'exécute
  Then au moins 4 Tournees existent dans BC-01 :
    | livreurId    | nombreColis |
    | livreur-001  | 5           |
    | livreur-002  | 22          |
    | livreur-003  | 3           |
    | livreur-004  | 6           |
  And aucune Tournee n'existe pour livreur-005 ni livreur-006 (cas "sans tournée affectée")
```

### SC4 — Les 6 livreurs apparaissent dans le picker d'affectation de supervision (W-05)

```gherkin
Scenario: Le picker d'affectation sur W-05 propose les 6 livreurs dev
  Given le superviseur est connecté à l'interface de supervision
  And l'application tourne en profil "dev"
  When le superviseur ouvre l'onglet "Affectation" d'une TourneePlanifiee
  Then le menu déroulant de sélection du livreur contient exactement 6 entrées :
    | livreurId    | nomAffiche       |
    | livreur-001  | Pierre Martin    |
    | livreur-002  | Paul Dupont      |
    | livreur-003  | Marie Lambert    |
    | livreur-004  | Jean Moreau      |
    | livreur-005  | Sophie Bernard   |
    | livreur-006  | Lucas Petit      |
  And l'événement AffectationEnregistree peut être émis pour n'importe lequel des 6 livreurs
```

### SC5 — Les livreurs 005 et 006 affichent le message "sans tournée" sur mobile

```gherkin
Scenario: Les livreurs sans tournée affichent un message explicite
  Given l'application mobile est lancée avec __DEV__ === true
  And le développeur se connecte en tant que "livreur-005" ou "livreur-006"
  When l'écran ListeColisScreen se charge
  Then l'app affiche le message :
    "Aucune tournée n'a encore été commandée pour vous. Veuillez vous rapprocher de votre superviseur."
  And aucun Colis n'est affiché
```

### SC6 — Les seeders ne sont pas actifs en profil production

```gherkin
Scenario: Les données dev ne sont pas chargées en production
  Given l'application tourne en profil "prod"
  When svc-tournee et svc-supervision démarrent
  Then aucun DevDataSeeder n'est instancié
  And aucune donnée de test (Pierre Martin, Paul Dupont, etc.) n'est présente en base
```

---

## Notes techniques

- Ajouter `livreur-006 / Lucas Petit` dans :
  - `src/mobile/src/constants/devLivreurs.ts` (6ème entrée dans le tableau `DEV_LIVREURS`)
  - `src/mobile/src/store/devAuthOptions.ts` (option correspondante)
  - `svc-supervision/DevDataSeeder.java` (VueTournee + TourneePlanifiee T-205/T-206)
  - `svc-tournee/DevDataSeeder.java` (pas de Tournee pour livreur-005 ni livreur-006)
- La liste des livreurs dev dans le picker d'affectation W-05 peut être alimentée par
  une constante statique côté frontend web (`LIVREURS_DEV`) ou par un endpoint
  GET /api/supervision/dev/livreurs (profil dev uniquement).
- Les noms et IDs ci-dessus sont les valeurs de référence. Toute divergence dans le
  code doit être corrigée pour s'aligner sur cette liste canonique.
- Vérifier que `ConnexionScreen.tsx` itère bien sur `devLivreurs` sans hard-coder
  le nombre de livreurs.

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#M-01 (ConnexionScreen), #W-05 (Affectation)
- US liées : US-047 (picker dev), US-048 (DevEventBridge + livreur-005), US-023 (affectation livreur)
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
- Picker mobile : src/mobile/src/constants/devLivreurs.ts
- Seeder supervision : src/backend/svc-supervision/src/main/java/com/docapost/supervision/infrastructure/seeder/DevDataSeeder.java
- Seeder tournée : src/backend/svc-tournee/src/main/java/com/docapost/tournee/infrastructure/seeder/DevDataSeeder.java
- Écran affectation : src/web/supervision/src/pages/DetailTourneePage.tsx
