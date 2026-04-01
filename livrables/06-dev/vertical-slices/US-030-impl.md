# Implémentation US-030 : Vérifier la compatibilité véhicule / charge tournée

## Contexte

- **US** : US-030 — "En tant que responsable logistique, je veux être alerté automatiquement si le
  véhicule que je sélectionne ne peut pas porter la charge estimée de la tournée."
- **Epic** : EPIC-007 — Planification et Préparation des Tournées
- **Feature** : F-020 — Affectation livreur et véhicule
- **Priorité** : Should Have — Complexité M
- **Sprint** : Sprint 4

Liens utiles :
- US spec : `/livrables/05-backlog/user-stories/US-030-verification-compatibilite-vehicule.md`
- Wireframe W-05 : `/livrables/02-ux/wireframes.md#W-05`
- Prérequis : US-023 (affectation livreur + véhicule)

---

## Bounded Context et couche ciblée

- **BC** : BC-07 Planification de Tournée (svc-supervision, port 8082)
- **Aggregate modifié** : `TourneePlanifiee` — ajout `poidsEstimeKg` (nullable), méthodes
  `verifierCompatibiliteVehicule()`, `forcerAffectationMalgreDepassement()`, `evaluerCompatibiliteVehicule()`
- **Domain Events émis** :
  - `CompatibiliteVehiculeVerifiee` — poids <= capacité (SC1)
  - `CompatibiliteVehiculeEchouee` — forçage malgré dépassement (SC3)

---

## Décisions d'implémentation

### Domain Layer

**Nouveaux types** :
- `VehiculeId.java` — Value Object UUID wrappé, immuable, comparaison par valeur
- `TypeVehicule.java` — Enum (FOURGON, UTILITAIRE_LEGER, CARGO_VELO, POIDS_LOURD)
- `Vehicule.java` — Entity avec `capaciteKg`, méthodes `peutPorter(int)` et `calculerMarge(int)`
- `ResultatCompatibilite.java` — Enum (COMPATIBLE, DEPASSEMENT, POIDS_ABSENT)
- `CapaciteVehiculeDepasseeException.java` — Exception métier avec `vehiculeId`, `capaciteKg`,
  `poidsEstimeKg`, `depassementKg`
- `CompatibiliteVehiculeVerifiee.java` — Domain Event record immuable
- `CompatibiliteVehiculeEchouee.java` — Domain Event record immuable

**Modifications `TourneePlanifiee`** :
- Champ `final Integer poidsEstimeKg` ajouté (nullable — TMS peut ne pas fournir cette donnée)
- Constructeur principal surchargé avec `poidsEstimeKg` optionnel (rétrocompatibilité assurée)
- Constructeur de persistance surchargé (US-030) avec `poidsEstimeKg`
- `evaluerCompatibiliteVehicule(Vehicule)` → pure query sans side-effect
- `verifierCompatibiliteVehicule(Vehicule, superviseurId)` → émet `CompatibiliteVehiculeVerifiee`
  ou lève `CapaciteVehiculeDepasseeException`
- `forcerAffectationMalgreDepassement(Vehicule, superviseurId)` → émet
  `CompatibiliteVehiculeEchouee` (SC3)
- Getter `getPoidsEstimeKg()` ajouté

**Invariants préservés** :
- Si `poidsEstimeKg == null` : vérification ignorée (SC4), pas d'event, pas d'exception
- Si poids > capacité sans forçage : `CapaciteVehiculeDepasseeException` levée, **aucun event**
- `forcerAffectationMalgreDepassement` sur un véhicule compatible → `PlanificationInvariantException`
  (cohérence domaine)

### Application Layer

- `VerifierCompatibiliteVehiculeCommand.java` — `tourneePlanifieeId`, `vehiculeId`,
  `forcerSiDepassement`, `superviseurId`
- `CompatibiliteVehiculeResultatDTO.java` — DTO résultat avec factory methods `compatible()`,
  `depassement()`, `poidsAbsent()`
- `VehiculeNotFoundException.java` — Exception applicative si véhicule introuvable
- `VerifierCompatibiliteVehiculeHandler.java` — Orchestre :
  1. Charger `TourneePlanifiee` (NotFound si absent)
  2. Charger `Vehicule` via `VehiculeRepository` (NotFound si absent)
  3. `evaluerCompatibiliteVehicule()` sans side-effect
  4. Si POIDS_ABSENT → retour immédiat sans sauvegarde
  5. Si DEPASSEMENT + forcerSiDepassement=false → lever `CapaciteVehiculeDepasseeException`
  6. Si DEPASSEMENT + forcerSiDepassement=true → `forcerAffectationMalgreDepassement()`
  7. Si COMPATIBLE → `verifierCompatibiliteVehicule()` puis sauvegarde

**Stratégie**: l'Application Service n'a aucune logique métier — il orchestre et délègue.

### Infrastructure Layer

- `VehiculeRepository.java` (interface dans `domain/planification/repository/`) — `findById`,
  `findDisponibles`, `save`
- `VehiculeRepositoryImpl.java` — Implémentation in-memory avec flotte de 11 véhicules par défaut
  (VH-01 à VH-11, capacités 150–800 kg). En production : remplacer par implémentation JPA.

### Interface Layer (REST)

**Nouveau endpoint** :
```
POST /api/planification/tournees/{id}/verifier-compatibilite-vehicule
Body  : { "vehiculeId": "VH-07", "forcerSiDepassement": false }
200   : CompatibiliteVehiculeDTO (COMPATIBLE | DEPASSEMENT avec forçage | POIDS_ABSENT)
409   : CompatibiliteVehiculeDTO (DEPASSEMENT sans forçage — corps avec détail)
404   : tournée ou véhicule introuvable
403   : accès refusé (non-SUPERVISEUR)
```

**DTOs nouveaux** :
- `VerifierCompatibiliteRequest.java` — `vehiculeId`, `forcerSiDepassement`
- `CompatibiliteVehiculeDTO.java` — `resultat`, `poidsEstimeKg`, `capaciteKg`,
  `margeOuDepassementKg`, `vehiculeId`, `message`

**`TourneePlanifieeDetailDTO`** étendu avec `poidsEstimeKg` (Integer nullable)

### Frontend (W-05 — onglet Affectation)

**`DetailTourneePlanifieePage.tsx`** enrichi :
- Interface `TourneePlanifieeDetailDTO` : ajout `poidsEstimeKg: number | null`
- Interface `VehiculeDisponible` : ajout `capaciteKg?: number`
- Types `ResultatCompatibilite` et `CompatibiliteVehiculeDTO` ajoutés
- States : `compatibilite: CompatibiliteVehiculeDTO | null`, `depassementForce: boolean`
- Fonction `verifierCompatibiliteVehicule(vehiculeId)` — appelée automatiquement au changement
  du select véhicule
- Fonction `forcerAffectationMalgreDepassement()` — appelée via bouton "Affecter quand même"
- Calculs : `peutLancer = peutValider && !depassementNonForce` — le bouton "Valider et Lancer"
  est désactivé si dépassement non accepté
- Indicateur de charge estimée visible dans le label "Véhicule" (si `poidsEstimeKg != null`)
- Indicateur coloré `data-testid="indicateur-compatibilite-{COMPATIBLE|DEPASSEMENT|POIDS_ABSENT}"`
- Bouton "Affecter quand même" (orange, `data-testid="btn-affecter-quand-meme"`) visible uniquement
  si dépassement non forcé

---

## Tests

### Tests backend Java (TDD — src/backend/svc-supervision)

| Fichier | Classe | Tests |
|---------|--------|-------|
| `domain/planification/TourneePlanifieeUS030Test.java` | Aggregate | 12 tests domaine (SC1–SC4, null guards) |
| `application/planification/VerifierCompatibiliteVehiculeHandlerTest.java` | Handler | 6 tests handler |
| `interfaces/planification/PlanificationControllerTest.java` | Controller | 5 tests US-030 ajoutés (+13 non-régressés = 18 total) |

**Total backend US-030** : +23 tests (12 domaine + 6 handler + 5 controller)
**Bilan global backend** : 113 tests verts (0 régressions)

### Tests frontend Jest (TDD — src/web/supervision)

| Fichier | Tests |
|---------|-------|
| `src/__tests__/DetailTourneePlanifieePage.test.tsx` | +7 tests US-030 ajoutés (section US-030) |
| (tests existants US-022/023/028 mis à jour) | 21 tests verts total (0 régressions) |

**Total frontend** : 158 tests verts (16 suites, 0 régressions)

---

## Ordre TDD respecté

1. Tests domaine écrits en premier (RED) — `TourneePlanifieeUS030Test.java`
2. Tests handler écrits (RED) — `VerifierCompatibiliteVehiculeHandlerTest.java`
3. Domain Layer implémenté (GREEN) — types + méthodes Aggregate
4. Application Layer implémenté (GREEN) — Handler + Command + DTO
5. Infrastructure Layer (GREEN) — `VehiculeRepositoryImpl` in-memory
6. Interface Layer (GREEN) — endpoint REST + DTOs
7. Frontend enrichi — indicateurs visuels + bouton "Affecter quand même"
8. Tests Jest ajoutés et tous verts

---

## Commandes de lancement local

```bash
# Backend BC-07
cd src/backend/svc-supervision && mvn spring-boot:run

# Tests backend
cd src/backend/svc-supervision && mvn test

# Frontend web
cd src/web/supervision && npm start

# Tests frontend
cd src/web/supervision && npx react-scripts test
```

**URL de test** : http://localhost:8082/api/planification/plans/2026-03-26
**W-05** : http://localhost:3000 → Plan du jour → Cliquer sur une tournée → Onglet Affectation

**Curl de test** :
```bash
# SC1 — Véhicule compatible
curl -s -X POST http://localhost:8082/api/planification/tournees/tp-001/verifier-compatibilite-vehicule \
  -H "Content-Type: application/json" \
  -d '{"vehiculeId":"VH-07","forcerSiDepassement":false}'

# SC3 — Forçage malgré dépassement
curl -s -X POST http://localhost:8082/api/planification/tournees/tp-001/verifier-compatibilite-vehicule \
  -H "Content-Type: application/json" \
  -d '{"vehiculeId":"VH-09","forcerSiDepassement":true}'
```
