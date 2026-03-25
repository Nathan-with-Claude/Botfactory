# US-021 : Visualiser le plan du jour importé depuis le TMS

**Epic** : EPIC-007 — Planification et Préparation des Tournées (interface web logisticien)
**Feature** : F-018 — Import et visualisation du plan du jour
**Bounded Context** : BC-07 Planification de Tournée
**Aggregate(s) touchés** : PlanDuJour, TournéeTMS
**Priorité** : Must Have
**Statut** : Prête
**Complexité estimée** : M (5 points)

---

## User Story

En tant que Laurent Renaud (responsable exploitation logistique),
je veux visualiser la liste des tournées importées depuis le TMS pour la journée en
cours, avec pour chaque tournée : le code, le nombre de colis, les zones principales,
les contraintes horaires et le statut d'affectation,
afin de prendre en main rapidement le plan du jour sans saisie manuelle.

---

## Contexte

Chaque matin à 6h00, l'ImporteurTMS déclenche automatiquement la récupération du plan
du jour depuis le TMS via l'ACL (TmsResponseTranslator). Les tournées importées sont
stockées dans le BC-07 (PlanDuJour) et rendues disponibles sur l'écran W-04.

Sans cette étape d'import et de visualisation, aucune tournée ne peut être affectée ni
lancée, bloquant l'intégralité du Parcours 0 et, par conséquent, le Parcours 1 des
livreurs.

**Invariants à respecter** :
- Un PlanDuJour correspond exactement à une date calendaire (pas de doublons par date).
- Une TournéeTMS importée ne peut pas être modifiée : toute correction passe par une
  mise à jour TMS et un réimport.
- L'écran W-04 est réservé aux utilisateurs portant le rôle "superviseur" (RBAC BC-06).
- En cas d'échec de l'import TMS après 3 retries, une alerte critique est affichée sur
  le tableau de bord avant 6h45 (ENF-RESIL-005).

---

## Critères d'acceptation (Gherkin)

### Scénario 1 : Affichage du plan du jour après import TMS réussi

```gherkin
Given l'import TMS s'est exécuté à 6h00 avec succès
And l'événement TournéeImportéeTMS a été émis pour chaque tournée du jour
When Laurent Renaud ouvre le tableau de bord de préparation (écran W-04)
Then il voit la liste de toutes les tournées du jour avec pour chacune :
     - Code tournée (identifiant TMS)
     - Nombre de colis
     - Zone(s) principale(s)
     - Statut d'affectation (badge : Non affectée / Affectée / Lancée)
And le bandeau résumé affiche le total des tournées et la répartition par statut
```

### Scénario 2 : Alerte d'erreur d'import partielle

```gherkin
Given l'import TMS s'est exécuté à 6h00
And une tournée n'a pas pu être importée (erreur de format ou données manquantes)
When Laurent Renaud consulte le tableau de bord W-04
Then il voit une alerte d'erreur d'import identifiant la tournée concernée
And le détail du problème est affiché (code erreur, tournée concernée, cause)
And les autres tournées importées avec succès sont affichées normalement
```

### Scénario 3 : Alerte critique si l'import TMS a totalement échoué

```gherkin
Given l'import TMS a échoué à 6h00
And le système a effectué 3 tentatives de retry sans succès
When Laurent Renaud ouvre le tableau de bord W-04
Then une alerte critique est affichée avec le message d'échec d'import
And un lien vers la saisie manuelle de secours est proposé
And l'alerte apparaît avant 6h45 (dans les 45 minutes suivant la première tentative)
```

### Scénario 4 : Accès refusé sans le rôle superviseur

```gherkin
Given un utilisateur authentifié avec le rôle "livreur" tente d'accéder à W-04
When la requête atteint l'endpoint GET /plans/{date}/tournees
Then un code HTTP 403 Forbidden est retourné
And l'utilisateur est redirigé vers l'application mobile (M-01)
```

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#écran-w-04--vue-liste-des-tournées-du-matin
- Parcours : /livrables/02-ux/user-journeys.md#parcours-0--responsable-logistique--préparer-les-tournées-du-jour
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
- Intégration TMS : /livrables/04-architecture-technique/schemas-integration.md
