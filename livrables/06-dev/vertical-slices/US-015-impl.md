# Implémentation US-015 : Suivre l'état d'exécution d'une instruction envoyée à un livreur

## Contexte

US-015 — BC-03 Supervision, écrans W-02 (onglet Instructions) + M-03 (déclenchement automatique).
Persona : Laurent Renaud (superviseur) veut voir en temps réel si Pierre a exécuté son instruction.

Inputs :
- `/livrables/05-backlog/user-stories/US-015-suivre-execution-instruction.md`
- `/livrables/02-ux/wireframes.md` (section W-02)
- `/livrables/04-architecture-technique/architecture-applicative.md`

## Bounded Context et couche ciblée

- **BC** : BC-03 Supervision — `svc-supervision` (port 8082)
- **Aggregate(s) modifiés** : `Instruction` — nouvelle méthode `marquerExecutee(livreurId)`
- **Domain Events émis** : `InstructionExecutee` (collecté, non persisté dans le MVP — Kafka Sprint 3)

## Décisions d'implémentation

### Domain Layer

- `InstructionExecutee` : nouveau domain event record (instructionId, tourneeId, colisId, livreurId, horodatage)
- `Instruction.marquerExecutee(livreurId)` : transition ENVOYEE → EXECUTEE
  - Lève `IllegalStateException` si statut != ENVOYEE (invariant)
  - Collecte `InstructionExecutee` (collect-and-publish)
- `getEvenements()` : type `List<Object>` (union InstructionEnvoyee | InstructionExecutee)
- `InstructionRepository` : ajout de `findById`, `findByTourneeId`, `update`, `findEnAttenteParTournee`

### Application Layer

- `MarquerInstructionExecuteeCommand` : record (instructionId, livreurId)
- `InstructionNotFoundException` : → HTTP 404
- `MarquerInstructionExecuteeHandler` : charge → transition domaine → update → broadcast WS
- `ConsulterInstructionsParTourneeQuery` : record (tourneeId)
- `ConsulterInstructionsParTourneeHandler` : retourne `List<Instruction>` triée par horodatage
- `ConsulterInstructionsEnAttenteQuery` + `ConsulterInstructionsEnAttenteHandler` : retourne instructions ENVOYEE (polling US-016)

### Infrastructure Layer

- `InstructionJpaRepository` : ajout `findByTourneeIdOrderByHorodatageDesc`, `findByTourneeIdAndStatut`
- `InstructionEntity` : ajout `setStatut()` pour permettre `update()`
- `InstructionRepositoryImpl` : ajout `update`, `findById`, `findByTourneeId`, `findEnAttenteParTournee`, extraction méthode `toInstruction()`
- `DevDataSeeder` : 2 instructions de test pour tournee-sup-001 (1 ENVOYEE, 1 EXECUTEE)

### Interface Layer

- `InstructionController` : 3 nouveaux endpoints
  - `GET /api/supervision/instructions/tournee/{tourneeId}` → 200 + `List<InstructionDTO>` (SUPERVISEUR)
  - `PATCH /api/supervision/instructions/{instructionId}/executer` → 200 + `InstructionDTO` | 404 | 409 (LIVREUR ou SUPERVISEUR)
  - `GET /api/supervision/instructions/en-attente?tourneeId={id}` → 200 + `List<InstructionDTO>` (LIVREUR ou SUPERVISEUR) — pour polling US-016
- `InstructionDTO` : DTO record pour les réponses (instructionId, tourneeId, colisId, superviseurId, typeInstruction, statut, creneauCible, horodatage)

### Frontend Web (W-02)

- `DetailTourneePage.tsx` : 3ème onglet "Instructions"
  - Badge orange sur le bouton si des instructions sont ENVOYEE (count)
  - Carte par instruction : type, colisId, statut badge (En attente / Exécutée), superviseur, horodatage, créneau si REPROGRAMMER
  - Rechargement via `chargerInstructions()` au montage + à chaque message WebSocket
  - `chargerInstructions` défensif (vérifie `Array.isArray`) pour ne pas casser les tests existants

### Frontend Mobile (M-03)

- `supervisionApi.ts` (nouveau) : `getInstructionsEnAttente(tourneeId)` + `marquerInstructionExecutee(instructionId)` — appelle svc-supervision (port 8082)
- `DetailColisScreen.tsx` : après chargement du colis, interroge les instructions en attente pour ce colis et appelle `marquerInstructionExecutee` si une instruction ENVOYEE est trouvée
  - Transparent pour Pierre (aucune UI, silencieux en cas d'erreur)
  - Props injectables `getInstructionsFn` et `marquerExecuteeFn` pour les tests

### Erreurs / invariants préservés

- Transition ENVOYEE → EXECUTEE uniquement — toute autre transition lève `IllegalStateException` → HTTP 409
- 404 si instruction inconnue
- 403 si rôle non autorisé (LIVREUR ne peut pas envoyer d'instruction — POST réservé SUPERVISEUR)

## Tests

### Backend (svc-supervision)

| Fichier | Tests | Résultat |
|---------|-------|----------|
| `InstructionTest.java` | +3 tests US-015 (marquerExecutee transition, event collecté, IllegalStateException si EXECUTEE) | Verts |
| `MarquerInstructionExecuteeHandlerTest.java` | 3 tests (OK + broadcast, 404, 409 déjà EXECUTEE) | Verts |
| `ConsulterInstructionsParTourneeHandlerTest.java` | 2 tests (liste 2 instructions, liste vide) | Verts |
| `InstructionControllerTest.java` | +4 tests (GET tournee 200, PATCH 200, PATCH 404, GET en-attente 200) | Verts |

Total svc-supervision après US-015 : **50/50 tests verts** (33 US-014 + 12 US-015 + 5 US-016 backend partagé)

### Frontend Web

| Fichier | Tests | Résultat |
|---------|-------|----------|
| `DetailTourneePage.test.tsx` | +3 tests US-015 (onglet affiché, badge, liste vide) | Verts |

### Frontend Mobile

| Fichier | Tests | Résultat |
|---------|-------|----------|
| Tests existants `DetailColisScreen.test.tsx` | Props injectables → compatibles sans modification | Verts |

## Commandes de lancement

```bash
# Backend svc-supervision
cd src/backend/svc-supervision
JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-25.0.2.10-hotspot" mvn spring-boot:run -Dspring-boot.run.profiles=dev

# URL de test — lister instructions tournee-sup-001 (SUPERVISEUR requis)
# GET http://localhost:8082/api/supervision/instructions/tournee/tournee-sup-001

# URL de test — marquer instruction exécutée (LIVREUR ou SUPERVISEUR)
# PATCH http://localhost:8082/api/supervision/instructions/instr-dev-001/executer

# Tests backend
JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-25.0.2.10-hotspot" mvn test

# Tests frontend web
cd src/web/supervision && npm test -- --watchAll=false
```
