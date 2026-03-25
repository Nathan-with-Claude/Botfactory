# Implémentation US-021 : Visualiser le plan du jour importé depuis le TMS

## Contexte

En tant que Laurent Renaud (responsable exploitation logistique), je veux visualiser la liste des tournées importées depuis le TMS pour la journée en cours, avec pour chaque tournée : le code, le nombre de colis, les zones principales, les contraintes horaires et le statut d'affectation.

- Spec : `/livrables/05-backlog/user-stories/US-021-visualiser-plan-du-jour.md`
- Wireframe : W-04 — `/livrables/02-ux/wireframes.md`
- API TMS : déférée (MVP : DevDataSeeder)

## Bounded Context et couche ciblée

- **BC** : BC-07 Planification de Tournée
- **Service** : `svc-supervision` (port 8082) — collocalisé dans `package com.docapost.supervision.domain.planification`
- **Aggregate(s) modifiés** : `TourneePlanifiee` (création)
- **Domain Events émis** : `TourneeImportee` (simulé via DevDataSeeder dans le MVP)

## Décisions d'implémentation

### Domain Layer

- **`TourneePlanifiee`** : Aggregate Root BC-07. Contient les invariants, émet les événements (collect-and-publish). Deux constructeurs : création initiale (statut NON_AFFECTEE) + reconstruction depuis persistance.
- **`StatutAffectation`** : Enum à 3 valeurs : NON_AFFECTEE → AFFECTEE → LANCEE.
- **`ZoneTournee`** : Value Object (nom + nbColis), immuable.
- **`ContrainteHoraire`** : Value Object (libelle + nbColisAffectes), immuable.
- **`Anomalie`** : Value Object (code + description), immuable.
- **`TouneeImportee`** : Domain Event record Java (immuable).
- **`TourneePlanifieeRepository`** : Interface (port) dans `domain/planification/repository/`.

### Application Layer

- **`ConsulterPlanDuJourQuery`** : record Java avec date et filtre statut optionnel. Factory `pourAujourdHui()` + `pourDate(LocalDate)`.
- **`ConsulterPlanDuJourHandler`** : délègue au repository (findByDate ou findByDateAndStatut). Pas de logique métier.

### Infrastructure Layer

- **`TourneePlanifieeEntity`** : JPA. Zones, contraintes et anomalies sérialisées en JSON (colonne TEXT) via `TourneePlanifieeMapper` (ObjectMapper interne + records ZoneJson/ContrainteJson/AnomalieJson).
- **`TourneePlanifieeJpaRepository`** : Spring Data JPA avec `findByDate`, `findByDateAndStatut`, `existsByLivreurIdAndDate`, `existsByVehiculeIdAndDate`.
- **`TourneePlanifieeRepositoryImpl`** : stratégie upsert (find existing → update fields, ou insert).
- **`DevDataSeeder`** enrichi : 4 tournées créées (T-201 NON_AFFECTEE, T-202 AFFECTEE, T-203 NON_AFFECTEE+SURCHARGE, T-204 LANCEE).

### Interface Layer

- **`GET /api/planification/plans/{date}`** : retourne `PlanDuJourDTO` (bandeau résumé + liste).
- **`PlanDuJourDTO`** : bandeau (totalTournees, nonAffectees, affectees, lancees) + liste `TourneePlanifieeDTO`.
- **`TourneePlanifieeDTO`** : DTO de sortie avec statut, zones, livreurNom, vehiculeId, aDesAnomalies.
- **`PlanificationController`** : routes BC-07 sous `/api/planification/**`.
- **SecurityConfig** mis à jour : `/api/planification/**` requiert ROLE_SUPERVISEUR.

### Frontend

- **`PreparationPage.tsx`** (W-04) : bandeau résumé avec compteurs, filtres par statut, tableau des tournées (badge coloré par statut, anomalie ⚠, actions contextuelles).
- Props injectables : `fetchFn`, `onVoirDetail`, `onAffecter` (testabilité).

### Erreurs / invariants préservés

- HTTP 400 si date invalide (format ISO).
- HTTP 403 si non ROLE_SUPERVISEUR.
- Import TMS réel déféré : simulation via DevDataSeeder (`@Profile("dev")`).
- La liste est vide si aucune tournée importée pour la date demandée (message UI adapté).

## Tests

- **Domaine** : `TourneePlanifieeTest.java` — 15 tests (statut initial, propriétés, événements).
- **Application** : `ConsulterPlanDuJourHandlerTest.java` — 3 tests (sans filtre, avec filtre, liste vide).
- **Interface** : `PlanificationControllerTest.java` — 10 tests (inclut US-021, US-022, US-023, US-024).
- **Frontend** : `PreparationPage.test.tsx` — 11 tests (bandeau, badges, boutons, erreur réseau).
- Total : **83 tests backend verts** + **25 tests Jest verts**.

## Commandes de lancement

```bash
# Backend
cd src/backend/svc-supervision
JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-25.0.2.10-hotspot" mvn spring-boot:run

# Accès API plan du jour
curl http://localhost:8082/api/planification/plans/$(date +%Y-%m-%d) \
  -H "Authorization: Bearer mock-superviseur"

# Frontend (supervision web)
cd src/web/supervision && npm start
# Accès : http://localhost:3000 (page W-04 via route /preparation)
```

---

## Corrections post-QA (2026-03-25)

**Anomalie OBS-021-01 (BLOQUANT)** — Rapport : `livrables/07-tests/scenarios/US-021-rapport-playwright.md`

**Symptôme** : `GET /api/planification/plans/{today}` retournait 0 tournées. Le DevDataSeeder BC-07 créait les tournées avec `LocalDate.now()` au premier démarrage, mais en cas de redémarrage, le `save()` JPA effectuait un `merge` sur les IDs existants (`tp-201` à `tp-204`) sans mettre à jour la date — si les données avaient été créées lors d'un démarrage précédent avec une ancienne date, elles restaient intactes en base.

**Correction** : Ajout d'un `tourneePlanifieeJpaRepository.deleteAll()` en début de section BC-07 dans `DevDataSeeder.java`. Cela garantit que les tournées sont toujours recréées avec `LocalDate.now()` à chaque démarrage.

**Fichier modifié** : `src/backend/svc-supervision/src/main/java/com/docapost/supervision/infrastructure/seeder/DevDataSeeder.java`
