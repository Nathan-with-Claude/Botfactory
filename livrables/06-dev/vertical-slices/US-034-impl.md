# Implémentation US-034 : Suggestion de réaffectation après échec de compatibilité véhicule

## Contexte

- **US** : US-034 — "En tant que responsable logistique, je veux qu'un lien d'action 'Réaffecter à un
  véhicule plus grand' soit proposé directement après un échec de vérification de compatibilité,
  afin de résoudre immédiatement le problème de surcharge."
- **Epic** : EPIC-007 — Planification et Préparation des Tournées
- **Feature** : F-020 — Affectation livreur et véhicule
- **Priorité** : Should Have — Complexité S
- **Sprint** : Sprint 4

Liens utiles :
- US spec : `/livrables/05-backlog/user-stories/US-034-suggestion-reaffectation-apres-echec-compatibilite.md`
- Prérequis : US-030 (CompatibiliteVehiculeEchouee implémenté)
- Wireframe W-05 : `/livrables/02-ux/wireframes.md#W-05`

---

## Bounded Context et couche ciblée

- **BC** : BC-07 Planification de Tournée (svc-supervision, port 8082)
- **Aggregate modifié** : `TourneePlanifiee` — aucune modification (réutilise `verifierCompatibiliteVehicule()`)
- **Domain Events émis** :
  - `VehiculeReaffecte` — event immuable loggué (pattern collect-and-publish)
  - `CompatibiliteVehiculeVerifiee` — réémis par l'Aggregate après réaffectation réussie
- **Nouveaux artefacts** :
  - `VehiculeReaffecte.java` — Domain Event record
  - `ReaffecterVehiculeCommand.java` — Command record
  - `ReaffecterVehiculeHandler.java` — Application Service

---

## Décisions d'implémentation

### Domain Layer

Aucune modification de l'Aggregate `TourneePlanifiee` — la réaffectation réutilise
`verifierCompatibiliteVehicule(Vehicule, superviseurId)` déjà implémentée (US-030).

**Nouveau Domain Event** :
- `VehiculeReaffecte.java` — record immuable, champs obligatoires validés dans le constructeur compact.
  Contient : `tourneePlanifieeId`, `ancienVehiculeId`, `nouveauVehiculeId`, `poidsEstimeKg`,
  `nouvelleCapaciteKg`, `margeKg`, `superviseurId`, `reaffecteeLe`.

### Application Layer

- `ReaffecterVehiculeCommand.java` — record avec validation des champs obligatoires
- `ReaffecterVehiculeHandler.java` — deux méthodes :
  1. `handle(ReaffecterVehiculeCommand)` : charge tournée + véhicule, délègue à l'Aggregate,
     sauvegarde si compatible, lève `CapaciteVehiculeDepasseeException` si encore insuffisant
  2. `rechercherVehiculesCompatibles(int poidsMinKg, LocalDate date)` : filtre
     `VehiculeRepository.findDisponibles()` sur `peutPorter(poidsMinKg)`, trie par capacité croissante

**Invariants de l'Application Layer** :
- Aucune logique métier dans le Handler — tout est délégué à l'Aggregate ou au domaine
- `CapaciteVehiculeDepasseeException` levée si le nouveau véhicule est encore insuffisant (pas de forçage silencieux)
- POIDS_ABSENT retourne immédiatement sans sauvegarde (cohérence US-030)

### Infrastructure Layer

Aucun changement — `VehiculeRepositoryImpl` in-memory (US-030) suffit.

### Interface Layer (REST)

**Deux nouveaux endpoints** ajoutés à `PlanificationController` :

```
GET  /api/planification/vehicules/compatibles?poidsMinKg={n}&date={d}
     200 : List<VehiculeCompatibleDTO> (triée par capacité croissante, vide si aucun compatible)
     400 : poidsMinKg <= 0
     403 : non-SUPERVISEUR

POST /api/planification/tournees/{id}/reaffecter-vehicule
     Body : { "nouveauVehiculeId": "VH-02" }
     200  : CompatibiliteVehiculeDTO (COMPATIBLE)
     409  : CompatibiliteVehiculeDTO (encore DEPASSEMENT)
     404  : tournée ou véhicule introuvable
     403  : non-SUPERVISEUR
```

**Endpoint US-030 également ajouté** au Controller (était implémenté dans le Handler mais l'endpoint
REST manquait) :
```
POST /api/planification/tournees/{id}/verifier-compatibilite-vehicule
     Body : { "vehiculeId": "VH-07", "forcerSiDepassement": false }
     200  : CompatibiliteVehiculeDTO (COMPATIBLE ou POIDS_ABSENT)
     409  : CompatibiliteVehiculeDTO (DEPASSEMENT sans forçage)
     404  : introuvable
```

**Nouveau DTO** :
- `VehiculeCompatibleDTO.java` — `vehiculeId`, `immatriculation`, `capaciteKg`, `typeVehicule`, `disponible`
- `ReaffecterVehiculeRequest.java` — `nouveauVehiculeId`

### Frontend (W-05 — onglet Affectation)

**`DetailTourneePlanifieePage.tsx`** enrichi :

**Nouveaux types** :
- `ResultatCompatibilite` — `'COMPATIBLE' | 'DEPASSEMENT' | 'POIDS_ABSENT'`
- `CompatibiliteVehiculeDTO` — interface de réponse compatibilité
- `VehiculeCompatibleDTO` — interface élément de la liste filtrée

**Nouveaux states** :
- `compatibilite: CompatibiliteVehiculeDTO | null` — résultat de la vérification automatique
- `depassementForce: boolean` — true si le superviseur a cliqué "Affecter quand même"
- `panneauReaffectationOuvert: boolean` — contrôle l'affichage du panneau
- `vehiculesCompatibles: VehiculeCompatibleDTO[]` — liste chargée depuis l'API
- `chargementVehicules: boolean` — loader du panneau

**Comportements US-030** :
- `verifierCompatibiliteVehicule(vehiculeId)` — appelée automatiquement via `useEffect` sur `vehiculeSelectionne`
- Indicateur coloré : `data-testid="indicateur-compatibilite-COMPATIBLE"` (vert) ou `DEPASSEMENT` (rouge)
- `forcerAffectationMalgreDepassement()` — déclenche POST avec `forcerSiDepassement: true`
- `peutLancer = peutValider && !depassementNonForce` — bouton "Valider et Lancer" bloqué

**Comportements US-034** :
- Bouton `data-testid="btn-reaffecter-vehicule-plus-grand"` (bleu primaire) visible uniquement si
  `DEPASSEMENT && !depassementForce`
- Bouton `data-testid="btn-affecter-quand-meme"` (orange secondaire) : visuellement distinct
- `ouvrirPanneauReaffectation()` — GET `/vehicules/compatibles?poidsMinKg={poidsEstimeKg}`
- `selectionnerVehiculeCompatible(vehiculeId)` — POST `/reaffecter-vehicule` puis ferme le panneau,
  met à jour `compatibilite`, affiche `data-testid="message-succes"`
- Panneau `data-testid="panneau-reaffectation"` avec `data-testid="aucun-vehicule-disponible"` si vide
- Après forçage : `panneauReaffectationOuvert` remis à `false`, `depassementForce` = `true`

**Invariants UI** :
- Le lien "Réaffecter" est retiré dès que `depassementForce = true` (SC5)
- `data-testid="msg-depassement-bloque"` visible si le lancement est bloqué

---

## Tests

### Tests backend Java (TDD — src/backend/svc-supervision)

| Fichier | Classe | Tests |
|---------|--------|-------|
| `application/planification/ReaffecterVehiculeHandlerTest.java` | Handler | 7 tests (SC3/SC4/erreurs) |
| `interfaces/planification/PlanificationControllerTest.java` | Controller | +7 tests US-030/034 ajoutés |

**Détail des tests Handler US-034** :
- SC3 réaffectation compatible (410 kg / 600 kg) → COMPATIBLE + sauvegarde
- SC3 réaffectation encore insuffisant → `CapaciteVehiculeDepasseeException`, pas de sauvegarde
- SC4 `rechercherVehiculesCompatibles` avec filtre → 3 compatibles sur 5
- SC4 aucun compatible → liste vide
- Tournée introuvable → `TourneePlanifieeNotFoundException`
- Véhicule introuvable → `VehiculeNotFoundException`
- Commande null → `NullPointerException`

**Détail des tests Controller** (ajoutés à `PlanificationControllerTest`) :
- US-030 : verifier-compatibilite-vehicule → 200 COMPATIBLE
- US-030 : verifier-compatibilite-vehicule → 409 DEPASSEMENT
- US-034 : GET vehicules/compatibles → 200 liste de 2
- US-034 : GET vehicules/compatibles → 200 liste vide
- US-034 : POST reaffecter-vehicule → 200 COMPATIBLE
- US-034 : POST reaffecter-vehicule → 409 encore insuffisant
- US-034 : POST reaffecter-vehicule → 404 tournée introuvable

### Tests frontend Jest (TDD — src/web/supervision)

| Fichier | Section | Tests |
|---------|---------|-------|
| `src/__tests__/DetailTourneePlanifieePage.test.tsx` | US-030 | 3 tests (COMPATIBLE, DEPASSEMENT, bouton bloqué) |
| `src/__tests__/DetailTourneePlanifieePage.test.tsx` | US-034 | 5 tests (SC1–SC5) |

**Détail des tests Jest US-030** :
- Indicateur COMPATIBLE visible après sélection véhicule compatible
- Indicateur DEPASSEMENT + bouton "Réaffecter" visible après dépassement
- Bouton "Valider et Lancer" désactivé si dépassement non forcé

**Détail des tests Jest US-034** :
- SC1 : bouton "Réaffecter à un véhicule plus grand" visible après dépassement
- SC2 : cliquer ouvre le panneau avec la liste filtrée (VH-02 + VH-01)
- SC3 : sélectionner VH-02 → message succès + panneau fermé
- SC4 : liste vide → "Aucun véhicule disponible pour cette capacité"
- SC5 : après "Affecter quand même", le bouton "Réaffecter" disparaît

---

## Ordre TDD respecté

1. Tests Handler écrits en premier (RED) — `ReaffecterVehiculeHandlerTest.java`
2. Tests Controller écrits (RED) — ajoutés dans `PlanificationControllerTest.java`
3. Tests Jest écrits (RED) — ajoutés dans `DetailTourneePlanifieePage.test.tsx`
4. Domain Event implémenté (GREEN) — `VehiculeReaffecte.java`
5. Application Layer implémenté (GREEN) — `ReaffecterVehiculeCommand` + `ReaffecterVehiculeHandler`
6. Interface Layer enrichi (GREEN) — 3 nouveaux endpoints + 2 DTOs + Controller mis à jour
7. Frontend enrichi (GREEN) — `DetailTourneePlanifieePage.tsx` avec tous les states/comportements US-034

---

## Commandes de lancement local

```bash
# Backend BC-07
cd src/backend/svc-supervision && mvn spring-boot:run

# Tests backend
cd src/backend/svc-supervision && JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-25.0.2.10-hotspot" mvn test

# Frontend web
cd src/web/supervision && npm start

# Tests frontend
cd src/web/supervision && npx react-scripts test --watchAll=false
```

**Curl de test** :
```bash
# SC2 — Lister véhicules compatibles avec poids 410 kg
curl -s "http://localhost:8082/api/planification/vehicules/compatibles?poidsMinKg=410"

# SC3 — Réaffecter vers VH-02 (capacité 600 kg)
curl -s -X POST http://localhost:8082/api/planification/tournees/tp-001/reaffecter-vehicule \
  -H "Content-Type: application/json" \
  -d '{"nouveauVehiculeId":"VH-02"}'

# US-030 — Vérifier compatibilité sans forçage
curl -s -X POST http://localhost:8082/api/planification/tournees/tp-001/verifier-compatibilite-vehicule \
  -H "Content-Type: application/json" \
  -d '{"vehiculeId":"VH-09","forcerSiDepassement":false}'
```
