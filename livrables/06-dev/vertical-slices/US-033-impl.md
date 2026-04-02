# Implémentation US-033 : Simulateur TMS pour tests de bout en bout

## Contexte

Cette US implémente l'infrastructure de test dev-only permettant de valider
le flux complet "import TMS → affectation → lancement → supervision → livreur"
sans TMS réel ni bus d'événements Kafka.

Liens utiles :
- US spec : `/livrables/05-backlog/user-stories/US-033-simulateur-tms-tests-bout-en-bout.md`
- Architecture : `/livrables/04-architecture-technique/architecture-applicative.md`

## Bounded Context et couche ciblée

- **BC** : BC-07 (Planification), BC-03 (Supervision read model), BC-01 (Orchestration tournée)
- **Aggregate(s) modifiés** : TourneePlanifiee (BC-07 — création simulée), Tournee (BC-01 — création via endpoint dev)
- **Domain Events émis** : TourneeLancee (BC-07), propagé vers BC-03 et BC-01 via DevEventBridge

## Décisions d'implémentation

### Domain Layer

Aucune modification d'agrégat ou de modèle domaine.

Deux méthodes ajoutées aux interfaces Repository (nécessaires pour le reset) :
- `TourneePlanifieeRepository.deleteAll()` (BC-07)
- `VueTourneeRepository.deleteAll()` (BC-03)

### Application Layer

`LancerTourneeHandler` modifié :
- Injection optionnelle `Optional<DevEventBridge>` (pattern injection optionnelle Spring).
- Après `clearEvenements()`, appelle `devEventBridge.ifPresent(bridge -> bridge.propaguerTourneeLancee(...))`.
- Idem dans `lancerToutesLesTourneesAffectees`.
- En profil prod, `Optional.empty()` est injecté — aucun impact.

### Infrastructure Layer (svc-supervision)

**`DevEventBridge`** (`infrastructure/dev/DevEventBridge.java`) :
- `@Profile("dev")` + `@Component`
- Reçoit un `RestTemplate` (fourni par `DevRestConfig` `@Profile("dev")`)
- URL svc-tournee configurable via `${docupost.dev.svc-tournee-url:http://localhost:8081}`
- Méthode `propaguerTourneeLancee(TourneeLancee)` :
  - BC-03 : crée `VueTournee` EN_COURS via `VueTourneeRepository` (idempotent)
  - BC-01 : `POST http://localhost:8081/internal/dev/tournees` via `RestTemplate`
  - Résilience : `RestClientException` loguée + continue (lancement BC-07 non annulé)

**`DevRestConfig`** (`infrastructure/dev/DevRestConfig.java`) :
- `@Profile("dev")` + `@Configuration`
- Fournit le bean `RestTemplate` utilisé par `DevEventBridge`

### Interface Layer (svc-supervision)

**`DevTmsController`** (`interfaces/dev/DevTmsController.java`) :
- `@Profile("dev")` + `@RestController` + `@RequestMapping("/dev/tms")`
- `POST /dev/tms/import` : accepte `{ "nombre": N, "date": "YYYY-MM-DD" }` (date optionnelle, défaut = today)
  - Génère N `TourneePlanifiee` avec 3 à 8 colis chacune
  - Zones fictives réalistes (Lyon 1er–9e, Villeurbanne, Caluire, etc.)
  - Contraintes horaires sur 50% des tournées
  - Anomalies SURCHARGE sur les très grosses tournées (10% de probabilité)
  - Retourne 201 Created `{ "tourneesCreees": N, "date": "..." }`
  - Retourne 400 Bad Request si `nombre <= 0`
- `DELETE /dev/tms/reset` : vide TourneePlanifiee + VueTournee, retourne 204

**SecurityConfig svc-supervision** :
- Ajout `.requestMatchers("/dev/**").permitAll()` (avant la règle `/api/supervision/**`)

### Interface Layer (svc-tournee)

**`DevTourneeController`** (`interfaces/dev/DevTourneeController.java`) :
- `@Profile("dev")` + `@RestController` + `@RequestMapping("/internal/dev")`
- `POST /internal/dev/tournees` : accepte `{ "tourneeId", "livreurId", "livreurNom", "nbColis" }`
  - SC6 Idempotence : si `tourneeId` existe déjà → `200 OK` + log INFO "TourneeDejaCree idempotence..."
  - Sinon : crée `Tournee` avec N colis `A_LIVRER` (adresses Lyon fictives réalistes)
  - Retourne 201 Created `{ "tourneeId", "statut": "CREEE", "nbColis": N }`

**SecurityConfig svc-tournee** :
- Ajout `.requestMatchers("/internal/dev/**").permitAll()`

### Erreurs / invariants préservés

- Invariant BC-01 : la Tournee créée via `DevTourneeController` respecte l'invariant "au moins 1 colis" et "livreurId obligatoire".
- Invariant BC-07 : aucun bypass des règles de l'agrégat `TourneePlanifiee`.
- Invariant prod : tous les composants dev sont annotés `@Profile("dev")`. En production, ils n'existent pas.
- Idempotence : `DevEventBridge` vérifie `findByTourneeId` avant création de `VueTournee`. `DevTourneeController` vérifie `findById` avant création de `Tournee`.

### Cohérence des identifiants (SC5)

Le `tourneeId` utilisé comme clé de cohérence est le `codeTms` de la `TourneePlanifiee` (BC-07).
Ce même `codeTms` est utilisé comme :
- `tourneeId` dans `VueTournee` (BC-03)
- `tourneeId` dans `Tournee` (BC-01)

## Tests

### Tests unitaires (TDD — écrits avant le code de production)

| Fichier | Classe | Tests | Couverture |
|---|---|---|---|
| `svc-supervision/.../infrastructure/dev/DevEventBridgeTest.java` | `DevEventBridgeTest` | 4 | SC2, SC3, résilience HTTP, SC6 idempotence VueTournee |
| `svc-supervision/.../interfaces/dev/DevTmsControllerTest.java` | `DevTmsControllerTest` | 4 | SC1 (3 tournées), colis 3-8, refus nombre=0, reset |
| `svc-tournee/.../interfaces/dev/DevTourneeControllerTest.java` | `DevTourneeControllerTest` | 3 | SC3 création, colis A_LIVRER, SC6 idempotence |

### Tests de régression

- 130/130 tests svc-supervision toujours verts après modification de `LancerTourneeHandler`
- 112/112 tests svc-tournee toujours verts après ajout de `DevTourneeController`

## Comment tester manuellement (séquence de curl)

### Prérequis

```bash
# Lancer svc-supervision (port 8082, profil dev)
cd src/backend/svc-supervision && mvn spring-boot:run

# Lancer svc-tournee (port 8081, profil dev)
cd src/backend/svc-tournee && mvn spring-boot:run
```

### Séquence complète

```bash
# 1. Repartir de zéro (optionnel)
curl -X DELETE http://localhost:8082/dev/tms/reset

# 2. Importer 3 tournées simulées pour le lendemain
curl -X POST http://localhost:8082/dev/tms/import \
  -H "Content-Type: application/json" \
  -d '{"nombre": 3, "date": "2026-03-27"}'
# Réponse attendue : {"tourneesCreees":3,"date":"2026-03-27"}

# 3. Vérifier le plan du jour dans la supervision web
# → Ouvrir http://localhost:3000 (supervision web)
# → Onglet "Planification" → voir les 3 tournées

# 4. Affecter un livreur à la 1ère tournée (remplacer tp-sim-XXXX par l'id retourné)
curl -X POST http://localhost:8082/api/planification/tournees/tp-sim-XXXX/affecter \
  -H "Content-Type: application/json" \
  -d '{"livreurId": "livreur-007", "livreurNom": "Jean Dupont", "vehiculeId": "VH-01", "superviseurId": "superviseur-001"}'

# 5. Lancer la tournée
curl -X POST http://localhost:8082/api/planification/tournees/tp-sim-XXXX/lancer \
  -H "Content-Type: application/json" \
  -d '{"superviseurId": "superviseur-001"}'
# Réponse attendue : {"tourneeLancee":true, ...}

# 6. Vérifier que la VueTournee est créée dans BC-03
curl http://localhost:8082/api/supervision/tableau-de-bord
# La tournée T-SIM-XXXX doit apparaître avec statut EN_COURS

# 7. Vérifier que la Tournee est créée dans BC-01
curl http://localhost:8081/api/tournees/livreur/livreur-007
# La tournée T-SIM-XXXX doit apparaître avec ses colis A_LIVRER
```

### Test d'idempotence

```bash
# Double appel au bridge : relancer la même tournée
curl -X POST http://localhost:8081/internal/dev/tournees \
  -H "Content-Type: application/json" \
  -d '{"tourneeId": "T-SIM-XXXX", "livreurId": "livreur-007", "livreurNom": "Jean Dupont", "nbColis": 5}'
# 1er appel → 201 Created
# 2ème appel → 200 OK (idempotence, log "TourneeDejaCree idempotence")
```

## Ce qui reste hors scope

- **Kafka production** : en production, `TourneeLancee` sera publié sur Kafka et consommé par svc-tournee. Le `DevEventBridge` remplace ce bus uniquement en dev.
- **Nombre de colis cohérent** : le `DevEventBridge` passe `nbColis=5` fixe à svc-tournee. En production, le nombre exact viendra de l'event BC-07. Une US future pourra enrichir l'event `TourneeLancee` avec `nbColis`.
- **VueColis** : les colis de la tournée ne sont pas remontés dans le read model BC-03 lors de la création. Ils le seront via les events `LivraisonConfirmee` / `EchecLivraisonDeclare` (flux US-032 existant).
- **Bouton UI de simulation** : un bouton "Importer depuis TMS simulé" dans W-04 (web supervision) n'est pas implémenté dans cette US — l'endpoint REST suffit pour les tests E2E automatisés.
- **Récupération sur coupure réseau** : couvert par US-006 (mode offline).
- **Intégration TMS réelle** : prévue en V2 post-MVP.
