# US-065 : Correction des anomalies de cohérence supervision — données et UI

**Epic** : EPIC-003 — Supervision et Pilotage Temps Réel
**Feature** : F-011 — Tableau de bord supervision temps réel
**Bounded Context** : BC-03 (VueTournee / Supervision) + BC-07 (TourneePlanifiee / Affectation)
**Aggregate(s) touchés** : VueTournee, TourneePlanifiee, Livreur
**Priorité** : Must Have
**Statut** : Terminée (corrections déjà appliquées en code)
**Complexité estimée** : S

---

## User Story

En tant que superviseur logistique,
je veux que le tableau de bord affiche des données cohérentes et exactes sur les tournées et les livreurs,
afin de prendre des décisions d'affectation fiables sans être induit en erreur par des données incohérentes.

---

## Contexte

Quatre anomalies de cohérence ont été identifiées lors d'un test de l'interface supervision.
Elles introduisaient des données fausses dans le tableau de bord et dans le formulaire d'affectation,
pouvant conduire le superviseur à des décisions incorrectes (double affectation, tournées fantômes, mauvais identifiant affiché).

Les corrections ont été appliquées directement dans le code lors de la session de test du 2026-04-06.
Cette US sert de traçabilité backlog et définit les règles de non-régression à valider.

**Fichiers corrigés** :
- `src/web/supervision/src/pages/TableauDeBordPage.tsx` (ligne ~334)
- `src/backend/svc-supervision/.../DevDataSeeder.java` (seeds de données de développement)
- `src/web/supervision/src/pages/DetailTourneePlanifieePage.tsx` (logique `peutValider`)

**Invariants à respecter** :
1. Le `codeTMS` est l'identifiant métier d'une tournée exposé aux utilisateurs. L'ID interne ne doit jamais être affiché dans l'interface.
2. Un Livreur ne peut être affecté qu'à une seule TourneePlanifiee par jour (1 livreur = 1 tournée par jour).
3. Une VueTournee dans BC-03 ne doit exister que pour une TourneePlanifiee dont le statut est `LANCEE`. Une tournée `AFFECTEE` ou `PLANIFIEE` ne génère pas de VueTournee.
4. La validation d'une affectation dans l'UI doit être bloquée si le livreur sélectionné est déjà affecté à une autre tournée, avant tout appel backend.

---

## Détail des corrections

### Correction 1 — Affichage du codeTMS dans le tableau de bord

**Symptôme** : Le tableau de bord affichait l'ID interne `tournee-sup-001` au lieu du code TMS `T-201`.

**Correction** :
```tsx
// Avant
tournee.tourneeId

// Après
tournee.codeTMS ?? tournee.tourneeId
```

**Fichier** : `src/web/supervision/src/pages/TableauDeBordPage.tsx` (~ligne 334)

---

### Correction 2 — Double affectation de Pierre Martin dans les seeds

**Symptôme** : Pierre Martin apparaissait sur `tournee-sup-001` (BC-03, `EN_COURS`) ET sur `T-202` (BC-07, `AFFECTEE`) simultanément.

**Correction** : `T-202` réaffectée à Jean Moreau (livreur-004, VH-04). Pierre Martin reste uniquement sur `T-201` (BC-03).

**Fichier** : `src/backend/svc-supervision/.../DevDataSeeder.java`

---

### Correction 3 — VueTournees fantômes pour tournées non lancées

**Symptôme** : Sophie Bernard (T-205) et Lucas Petit (T-206) apparaissaient dans le tableau de bord avec `0/0 colis` alors que leurs tournées sont `AFFECTEE` dans BC-07 (pas encore `LANCEE`).

**Correction** : Suppression des VueTournees manuelles pour T-205 et T-206 dans les seeds. Ces VueTournees seront créées via `DevEventBridge` uniquement lors du passage à l'état `LANCEE`.

**Fichier** : `src/backend/svc-supervision/.../DevDataSeeder.java`

---

### Correction 4 — Livreurs déjà affectés sélectionnables dans le formulaire d'affectation

**Symptôme** : Dans l'onglet Affectation (`DetailTourneePlanifieePage`), un livreur déjà affecté à une autre tournée pouvait être sélectionné. L'erreur ne remontait qu'au moment de la validation (409 backend).

**Corrections** :
- `peutValider` inclut maintenant la vérification de disponibilité du livreur sélectionné.
- Exception : la réaffectation du livreur déjà sur cette tournée (mise à jour) reste autorisée.
- Message d'erreur explicite affiché si un livreur indisponible est sélectionné.
- `livreursMock` et `vehiculesMock` mis à jour pour refléter les seeds corrigés.

**Fichier** : `src/web/supervision/src/pages/DetailTourneePlanifieePage.tsx`

---

## Critères d'acceptation (Gherkin)

### Scénario 1 — Affichage du codeTMS dans le tableau de bord

```gherkin
Given une VueTournee avec codeTMS "T-201" et tourneeId interne "tournee-sup-001"
When le superviseur consulte le tableau de bord
Then la colonne identifiant affiche "T-201"
And "tournee-sup-001" n'est visible nulle part dans l'interface
```

### Scénario 2 — Fallback vers tourneeId si codeTMS absent

```gherkin
Given une VueTournee dont le codeTMS est null ou absent
When le superviseur consulte le tableau de bord
Then la colonne identifiant affiche le tourneeId interne en guise de fallback
```

### Scénario 3 — Un livreur ne peut être affecté qu'à une seule tournée par jour

```gherkin
Given Pierre Martin est affecté à la tournée T-201 avec statut EN_COURS
When le superviseur consulte la liste des tournées du jour
Then Pierre Martin n'apparaît que sur T-201
And aucune autre tournée du jour ne liste Pierre Martin comme livreur affecté
And l'événement TourneeAffecteeALivreur n'est pas émis deux fois pour le même livreur le même jour
```

### Scénario 4 — Absence de VueTournee pour une tournée non lancée

```gherkin
Given la tournée T-205 de Sophie Bernard a le statut AFFECTEE dans BC-07
When le superviseur consulte le tableau de bord
Then T-205 n'apparaît pas dans la liste des VueTournees actives
And aucune ligne "0/0 colis" n'est affichée pour T-205
```

### Scénario 5 — Création de la VueTournee lors du lancement

```gherkin
Given la tournée T-205 a le statut AFFECTEE
When le superviseur lance la tournée T-205 (transition vers LANCEE)
Then l'événement TourneeDemarree est émis
And une VueTournee est créée dans BC-03 pour T-205
And T-205 apparaît dans le tableau de bord avec le compteur de colis initialisé
```

### Scénario 6 — Blocage UI avant sélection d'un livreur indisponible

```gherkin
Given le superviseur est sur l'onglet Affectation de la tournée T-203
And Pierre Martin est déjà affecté à la tournée T-201 (LANCEE)
When le superviseur sélectionne Pierre Martin dans le sélecteur de livreur
Then le bouton "Valider l'affectation" reste désactivé
And un message explicite s'affiche : "Ce livreur est déjà affecté à une autre tournée"
And aucun appel API n'est émis
```

### Scénario 7 — Réaffectation du même livreur autorisée (mise à jour)

```gherkin
Given Pierre Martin est le livreur actuellement affecté à la tournée T-201
When le superviseur ouvre le formulaire d'affectation de T-201
And sélectionne à nouveau Pierre Martin pour mettre à jour le véhicule
Then le bouton "Valider l'affectation" est activé
And la validation s'exécute normalement
```

---

## Règles de non-régression

Pour éviter que ces anomalies se reproduisent, les règles suivantes doivent être systématiquement appliquées :

| Règle | Portée | Contrôle |
|-------|--------|---------|
| Toujours utiliser `codeTMS ?? tourneeId` pour l'affichage de l'identifiant tournée dans l'UI | BC-03, TableauDeBordPage | Revue de code |
| Les seeds de développement (`DevDataSeeder`) doivent respecter la contrainte 1 livreur = 1 tournée par jour | BC-07 seeds | Test d'intégration |
| Les VueTournees en seed ne sont créées que pour les tournées dont le statut est `LANCEE` ou `EN_COURS` | BC-03 seeds | Test d'intégration |
| La logique `peutValider` dans l'UI doit inclure la vérification de disponibilité du livreur sélectionné avant l'appel API | UI affectation | Test unitaire composant |
| Tout changement dans `DevDataSeeder` doit faire l'objet d'une relecture croisée entre BC-03 et BC-07 | Seeds | Processus de revue |

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#w-01-tableau-de-bord-supervision
- Wireframe : /livrables/02-ux/wireframes.md#w-04-affectation-livreur
- Parcours : /livrables/02-ux/user-journeys.md#superviseur-pilotage
- US liée (affectation) : US-023-affecter-livreur-vehicule.md
- US liée (désaffectation) : US-050-desaffecter-livreur-tournee-planifiee.md
- US liée (tableau de bord) : US-011-tableau-de-bord-tournees.md
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
