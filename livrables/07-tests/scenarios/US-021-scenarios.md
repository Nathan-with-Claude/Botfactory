# Scénarios de tests US-021 — Visualiser le plan du jour

**US liée** : US-021
**Titre** : Visualiser le plan du jour importé depuis le TMS
**Bounded Context** : BC-07 Planification de Tournée
**Aggregate / Domain Event ciblé** : TourneePlanifiee / TourneeImportee
**Agent** : @qa
**Date** : 2026-03-24
**Version** : 1.0

---

### TC-220 : Affichage du plan du jour avec le bandeau résumé

**US liée** : US-021
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : TourneePlanifiee / PlanDuJourDTO
**Type** : Fonctionnel (happy path)
**Préconditions** : Backend svc-supervision en profil dev, DevDataSeeder a créé 4 tournées (T-201 à T-204), superviseur authentifié
**Étapes** :
1. Naviguer vers http://localhost:3000/preparation (page W-04)
2. Observer le bandeau résumé et la liste des tournées

**Résultat attendu** : Le bandeau affiche totalTournees=4, nonAffectees≥1, affectees≥1, lancees≥1. La liste des tournées est affichée avec leurs badges de statut.
**Statut** : Passé

```gherkin
Given Laurent est authentifié avec le rôle SUPERVISEUR
And le DevDataSeeder a créé 4 TourneePlanifiee pour aujourd'hui
When Laurent accède à la page W-04 (Préparation)
Then le bandeau résumé affiche totalTournees=4
And au moins une tournée NON_AFFECTEE, une AFFECTEE et une LANCEE sont affichées
And chaque ligne de tournée comporte un badge coloré selon le statut
```

---

### TC-221 : API GET /api/planification/plans/{date} retourne 200 avec structure complète

**US liée** : US-021
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : TourneePlanifiee / ConsulterPlanDuJourHandler
**Type** : Fonctionnel
**Préconditions** : Backend svc-supervision en profil dev
**Étapes** :
1. Appeler GET /api/planification/plans/{date du jour} avec le token MockJwt SUPERVISEUR
2. Vérifier la structure de la réponse

**Résultat attendu** : HTTP 200 avec un PlanDuJourDTO contenant bandeau et liste de tournées
**Statut** : Passé

```gherkin
Given le backend svc-supervision tourne en profil dev
When GET /api/planification/plans/{today} est appelé avec MockJwt SUPERVISEUR
Then la réponse est HTTP 200
And le corps contient "totalTournees", "nonAffectees", "affectees", "lancees", "tournees"
And chaque tournée a un "statut", "codeTms", "zones", "livreurNom" (nullable)
```

---

### TC-222 : Invariant — HTTP 403 si non SUPERVISEUR sur /api/planification

**US liée** : US-021
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : SecurityConfig — ROLE_LIVREUR refusé
**Type** : Invariant domaine / Sécurité
**Préconditions** : Backend svc-supervision en profil dev
**Étapes** :
1. Appeler GET /api/planification/plans/{date} avec un token LIVREUR
2. Vérifier la réponse

**Résultat attendu** : HTTP 403 Forbidden
**Statut** : Passé

```gherkin
Given Pierre est authentifié avec le rôle LIVREUR
When Pierre appelle GET /api/planification/plans/{today}
Then la réponse est HTTP 403 Forbidden
```

---

### TC-223 : Invariant — HTTP 400 si date invalide

**US liée** : US-021
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : PlanificationController — validation date ISO
**Type** : Edge case
**Préconditions** : Backend svc-supervision en profil dev
**Étapes** :
1. Appeler GET /api/planification/plans/invalid-date avec le token SUPERVISEUR
2. Vérifier la réponse

**Résultat attendu** : HTTP 400 Bad Request
**Statut** : Passé

```gherkin
Given le backend svc-supervision tourne en profil dev
When GET /api/planification/plans/invalid-date est appelé
Then la réponse est HTTP 400 Bad Request
```

---

### TC-224 : Liste vide si aucune tournée importée pour la date

**US liée** : US-021
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : ConsulterPlanDuJourHandler — liste vide
**Type** : Edge case
**Préconditions** : Backend svc-supervision en profil dev
**Étapes** :
1. Appeler GET /api/planification/plans/{date future sans données}
2. Vérifier la réponse

**Résultat attendu** : HTTP 200 avec totalTournees=0 et liste vide — aucune erreur
**Statut** : Passé

```gherkin
Given aucune TourneePlanifiee n'a été créée pour la date du lendemain
When GET /api/planification/plans/{demain} est appelé
Then la réponse est HTTP 200
And "totalTournees" = 0
And "tournees" est une liste vide
```

---

### TC-225 : Filtre par statut NON_AFFECTEE sur la page W-04

**US liée** : US-021
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : PlanDuJourDTO — filtre statut
**Type** : Fonctionnel
**Préconditions** : Page W-04 chargée avec 4 tournées
**Étapes** :
1. Charger la page W-04
2. Sélectionner le filtre "NON_AFFECTEE"
3. Observer la liste filtrée

**Résultat attendu** : Seules les tournées NON_AFFECTEE sont affichées (T-201 et T-203 dans le DevDataSeeder)
**Statut** : Passé

```gherkin
Given Laurent est sur la page W-04 avec 4 tournées affichées
When Laurent sélectionne le filtre "NON_AFFECTEE"
Then seules les tournées avec statut=NON_AFFECTEE sont visibles
And les tournées AFFECTEE et LANCEE sont masquées
```
