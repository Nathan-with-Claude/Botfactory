# Implémentation US-014 : Envoyer une instruction structurée à un livreur

## Contexte

US-014 — BC-03 Supervision, écran W-03 (panneau modal).
Persona : Laurent Renaud (superviseur) qui envoie une instruction normalisée à un livreur.

Inputs :
- `/livrables/05-backlog/user-stories/US-014-envoyer-instruction-livreur.md`
- `/livrables/02-ux/wireframes.md` (section W-03)
- `/livrables/04-architecture-technique/architecture-applicative.md`

## Bounded Context et couche ciblée

- **BC** : BC-03 Supervision — `svc-supervision` (port 8082)
- **Aggregate(s) modifiés** : `Instruction` (nouveau Aggregate Root)
- **Domain Events émis** : `InstructionEnvoyee` (collecté, non persisté dans le MVP — Kafka Sprint 3)

## Décisions d'implémentation

### Domain Layer

- `TypeInstruction` : enum (PRIORISER | ANNULER | REPROGRAMMER)
- `StatutInstruction` : enum (ENVOYEE | EXECUTEE | REFUSEE) — cycle de vie US-015
- `InstructionEnvoyee` : domain event record (instructionId, tourneeId, colisId, superviseurId, type, creneauCible, horodatage)
- `Instruction` : Aggregate Root
  - Constructeur privé — factory method `envoyer()` comme seul point de création
  - `envoyer(id, tourneeId, colisId, superviseurId, type, creneauCible)` : valide invariants + collecte InstructionEnvoyee
  - `reconstruire(...)` : reconstruction depuis la persistance (pas d'événement émis)
  - Invariant : REPROGRAMMER sans creneauCible → `IllegalArgumentException`
  - Pattern collect-and-publish : `getEvenements()` + `clearEvenements()`
- `InstructionRepository` : interface port avec `save()` + `findInstructionEnAttenteParColis(colisId)`

### Application Layer

- `EnvoyerInstructionCommand` : record (tourneeId, colisId, superviseurId, typeInstruction, creneauCible)
- `InstructionDejaEnAttenteException` : exception → HTTP 409
- `EnvoyerInstructionHandler` : @Service
  - Vérifie invariant "une seule instruction en attente par colis"
  - Délègue à `Instruction.envoyer()` (uuid généré en application layer)
  - Sauvegarde + clearEvenements() + broadcast WebSocket

### Infrastructure Layer

- `InstructionEntity` : entité JPA (table `instructions`) avec tous les champs
- `InstructionJpaRepository` : `findByColisIdAndStatut(colisId, ENVOYEE)`
- `InstructionRepositoryImpl` : implémente `InstructionRepository` (save → entity + mapper ; find → `Instruction.reconstruire()`)

### Interface Layer

- `InstructionController` : `@RequestMapping("/api/supervision/instructions")`
  - `POST /api/supervision/instructions` → 201 + InstructionCreeDTO | 409 | 422 | 403
  - Extrait superviseurId depuis `Authentication.getName()` (MockJwtAuthFilter en dev)
  - Mappe IllegalArgumentException → 422 Unprocessable Entity
- `EnvoyerInstructionRequest` : DTO record (tourneeId, colisId, typeInstruction, creneauCible nullable)
- `InstructionCreeDTO` : DTO record réponse (instructionId, tourneeId, colisId, superviseurId, type, créneau, statut, horodatage), factory `from(Instruction)`
- Sécurité : `/api/supervision/**` déjà protégé par `hasRole("SUPERVISEUR")` dans SecurityConfig

### Frontend

- `PanneauInstructionPage.tsx` : composant modal React (`data-testid="panneau-instruction"`)
  - Props : tourneeId, colisId, livreurNom, onEnvoye, onFermer, apiBaseUrl, fetchFn
  - Sélecteur radio type (PRIORISER | ANNULER | REPROGRAMMER)
  - Champs date + heure cible si REPROGRAMMER (obligatoires — validés côté UI)
  - Bouton ENVOYER désactivé si REPROGRAMMER sans créneau valide
  - Message d'avertissement `data-testid="message-creneau-requis"` si REPROGRAMMER sans créneau
  - Toast succès `data-testid="toast-succes"` avec le nom du livreur après 201
  - Message d'erreur `data-testid="message-erreur"` pour 409 / 422 / erreur réseau
  - Bouton Fermer (×) + bouton Annuler

### Erreurs / invariants préservés

- 409 Conflict : colis avec instruction ENVOYEE déjà en base (invariant "une instruction en attente par colis")
- 422 Unprocessable Entity : REPROGRAMMER sans creneauCible (domaine lève IllegalArgumentException)
- 403 Forbidden : non ROLE_SUPERVISEUR
- Bouton ENVOYER côté UI désactivé si REPROGRAMMER sans créneau (double protection UI + API)
- Le bouton Instructionner dans DetailTourneePage n'est visible que pour A_LIVRER + tournée active (invariant US-012)

### Note : notification push FCM

La notification push au livreur (FCM) est déférée au Sprint 3.
Le service FCM n'est pas provisionné pour le MVP. L'événement `InstructionEnvoyee` sera consommé par un handler FCM dédié.
TODO : connecter KafkaProducer sur `InstructionEnvoyee` + micro-service notifications.

## Tests

### Backend (svc-supervision)

| Fichier | Tests | Résultat |
|---------|-------|----------|
| `InstructionTest.java` | 5 tests domaine (PRIORISER, ANNULER, REPROGRAMMER valide, REPROGRAMMER sans créneau, événement collecté) | Verts |
| `EnvoyerInstructionHandlerTest.java` | 3 tests (PRIORISER + broadcast, déjà en attente 409, REPROGRAMMER sans créneau 422) | Verts |
| `InstructionControllerTest.java` | 4 tests WebMvcTest (201, 409, 422, 403) | Verts |

Total svc-supervision après US-014 : **33/33 tests verts**

### Frontend (supervision-web)

| Fichier | Tests | Résultat |
|---------|-------|----------|
| `PanneauInstructionPage.test.tsx` | 6 tests Jest (rendu initial, REPROGRAMMER désactivé, REPROGRAMMER actif avec créneau, toast succès, 409, fermeture) | Verts |

Total frontend supervision : **30/30 tests verts** (24 US-010/011/012/013 + 6 US-014)

## Commandes de lancement

```bash
# Backend (svc-supervision)
cd src/backend/svc-supervision
JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-25.0.2.10-hotspot" mvn spring-boot:run -Dspring-boot.run.profiles=dev

# URL de test (rôle SUPERVISEUR requis)
# POST http://localhost:8082/api/supervision/instructions
# Body: {"tourneeId":"tournee-sup-001","colisId":"colis-s-003","typeInstruction":"PRIORISER"}

# Tests backend
JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-25.0.2.10-hotspot" mvn test

# Tests frontend
cd src/web/supervision
npm test -- --watchAll=false
```
