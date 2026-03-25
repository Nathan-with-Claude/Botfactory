# Implémentation US-001 : Consulter la liste des colis assignés à ma tournée

## Contexte

**User Story** : En tant que Pierre Morel (livreur terrain), je veux consulter dès mon
authentification la liste complète des colis assignés à ma tournée du jour, avec l'adresse,
le destinataire, les contraintes et le statut de chaque colis, afin de prendre en main ma
tournée rapidement sans support papier.

**Références** :
- `/livrables/05-backlog/user-stories/US-001-consulter-liste-colis-tournee.md`
- `/livrables/02-ux/wireframes.md#écran-m-02--liste-des-colis-de-la-tournée`
- `/livrables/03-architecture-metier/domain-model.md` (BC-01)
- `/livrables/04-architecture-technique/architecture-applicative.md`

---

## Bounded Context et couche ciblée

- **BC** : BC-01 Orchestration de Tournée (Core Domain)
- **Aggregate(s) modifiés** : Tournee (Aggregate Root), Colis (Entity)
- **Domain Events émis** :
  - `TourneeDemarree` — premier accès seulement (idempotent)
  - `TourneeChargee` — décrit dans le domaine, publication à venir quand BC-03 (Supervision) sera implémenté

---

## Décisions d'implémentation

### Domain Layer

- `Tournee.java` — Aggregate Root avec méthode `demarrer()` idempotente et `calculerAvancement()`
- `Colis.java` — Entity avec `estTraite()` et `aUneContrainteHoraire()`
- `Adresse.java`, `Destinataire.java`, `Contrainte.java` — Value Objects immuables (records Java)
- `StatutColis.java`, `TypeContrainte.java`, `StatutTournee.java` — Value Objects enum
- `Avancement.java` — Value Object calculé (estimationFin = null dans MVP)
- `TourneeId.java`, `LivreurId.java`, `ColisId.java` — Identifiants typés (records Java)
- `TourneeInvariantException.java` — Exception domaine
- `TourneeDemarree.java`, `TourneeChargee.java` — Domain Events (records Java immuables)
- `DomainEvent.java` — Interface marqueur
- `TourneeRepository.java` — Port (interface)

**Invariant préservé** : `demarrer()` lève `TourneeInvariantException` si la liste de colis
est vide. L'idempotence est assurée par le test `statut == DEMARREE || CLOTUREE`.

**Pattern Domain Events** : les events sont collectés dans une liste interne à l'agrégat
(`domainEvents`). L'Application Service les publie via `pullDomainEvents()` après sauvegarde
(collect-and-publish pattern).

### Application Layer

- `ConsulterListeColisCommand.java` — record immuable (livreurId, date)
- `ConsulterListeColisHandler.java` — orchestration : charge → demarrer → save → publish events
- `TourneeNotFoundException.java` — exception applicative traduite en HTTP 404

**Pas de logique métier dans l'Application Layer** : seul `tournee.demarrer()` (domaine)
contient la logique d'idempotence et l'invariant "au moins un colis".

### Infrastructure Layer

- `TourneeEntity.java`, `ColisEntity.java` — JPA entities séparées du domaine
- `ColisContrainteEmbeddable.java` — `@Embeddable` pour les contraintes (table `colis_contraintes`)
- `TourneeJpaRepository.java` — Spring Data JPA (interface technique)
- `TourneeRepositoryImpl.java` — implémente `TourneeRepository` (port domain)
- `TourneeMapper.java` — conversion Entity ↔ Domain (toDomain / toEntity / updateStatut)
- `DevDataSeeder.java` — `@Component @Profile("dev")` CommandLineRunner, insère 1 tournée +
  5 colis pour `livreur-001` à la date du jour (idempotent au redémarrage)

### Interface Layer

- `TourneeController.java` — `GET /api/tournees/today`
  - Lit `Authentication.getName()` depuis le SecurityContext
  - Appelle `ConsulterListeColisHandler`
  - Retourne `TourneeDTO` (HTTP 200) ou HTTP 404 si `TourneeNotFoundException`
- `TourneeDTO.java`, `ColisDTO.java`, `AdresseDTO.java`, `DestinataireDTO.java`, `ContrainteDTO.java` — DTOs records
- `MockJwtAuthFilter.java` — `@Component @Profile("dev")` injecte `livreur-001 / ROLE_LIVREUR`
- `SecurityConfig.java` — Spring Security stateless, MockJwtAuthFilter conditionnel

### Frontend Mobile

- `tourneeTypes.ts` — interfaces TypeScript miroir des DTOs backend
- `tourneeApi.ts` — `getTourneeAujourdhui()` : fetch + gestion 404 (TourneeNonTrouveeError)
- `ListeColisScreen.tsx` — machine d'état (chargement / succes / vide / erreur), FlatList,
  bandeau progression "Reste à livrer : X / Y", pull-to-refresh
- `ColisItem.tsx` — adresse, destinataire, badge statut coloré, contraintes (mise en évidence
  horaire avec `estHoraire: true`)

### Configuration

- `application.yml` — profil dev : H2 en mémoire, port 8081, H2 console activée
- `pom.xml` — Spring Boot 3.4.3 (voir note ci-dessous), Java 21, H2, PostgreSQL, Spring Security

---

## Limitations actuelles et roadmap de remplacement

### 1. Spring Boot 3.4.3 au lieu de 4.0.3

Spring Boot 4.0.3 n'est pas disponible au moment de l'implémentation (Q1 2026).
La version 3.4.3 (LTS stable) est utilisée. Migration vers 4.x prévue dès disponibilité.
**Action** : mettre à jour le pom.xml quand Spring Boot 4.x est stable.

### 2. MockJwtAuthFilter — remplacer par Keycloak (US-019)

`MockJwtAuthFilter` (`@Profile("dev")`) simule un JWT avec `livreur-001 / ROLE_LIVREUR`.
Quand US-019 (Authentification SSO mobile) sera implémentée :
1. Supprimer `MockJwtAuthFilter.java`
2. Ajouter `spring-boot-starter-oauth2-resource-server` dans le pom.xml
3. Configurer `SecurityConfig` avec `.oauth2ResourceServer(oauth2 -> oauth2.jwt(...))`
4. Lire le `livreurId` depuis le claim `sub` ou `preferred_username` du token

**TODO** : tag `TODO: supprimer quand US-019 est implémenté` dans le code.

### 3. DevDataSeeder — remplacer par TourneeLancee (US-024)

`DevDataSeeder` (`@Profile("dev")`) crée manuellement la tournée de test.
Quand BC-07 (Planification) sera implémenté (US-021 à US-024) :
1. Supprimer `DevDataSeeder.java`
2. Implémenter un handler Spring Event pour `TourneeLancee`
3. Ce handler créera la `Tournee` dans BC-01 à partir des données de l'event

**TODO** : tag `TODO: supprimer quand US-024 est implémenté` dans le code.

### 4. TourneeChargee — publication à implémenter

`TourneeChargee` est défini dans le domaine mais pas encore publié dans le handler.
Le publication sera activée quand BC-03 (Supervision) aura un consumer pour cet event.

### 5. estimationFin = null

Le calcul de l'estimation de fin de tournée n'est pas dans le périmètre de US-001.
`Avancement.estimationFin` est systématiquement `null` dans le MVP initial.
Sera calculé lors de l'implémentation de US-002 (Suivre ma progression).

---

## Tests

### Backend

| Fichier | Type | Ce qui est testé |
|---|---|---|
| `TourneeTest.java` | Unitaire (JUnit 5 + AssertJ) | `demarrer()` : invariant sans colis, success, idempotence, event émis ; `calculerAvancement()` : 0 traités, livres+echecs, a_representer |
| `ConsulterListeColisHandlerTest.java` | Unitaire (Mockito) | retourne tournee, appelle demarrer, sauvegarde, lève 404, émet events |
| `TourneeControllerTest.java` | Intégration (@WebMvcTest) | HTTP 200 avec liste colis, HTTP 404 si TourneeNotFoundException, HTTP 401 si non authentifié, contraintes dans la réponse |

### Mobile

| Fichier | Type | Ce qui est testé |
|---|---|---|
| `ListeColisScreen.test.tsx` | Jest + Testing Library | spinner chargement, bandeau reste à livrer, estimation fin, liste de 2 colis, adresse et destinataire, contrainte horaire visible, message aucun colis assigné, erreur réseau, statuts |

---

## Fichiers créés

### Backend `src/backend/svc-tournee/`

**Domain** :
- `src/main/java/com/docapost/tournee/domain/model/Tournee.java`
- `src/main/java/com/docapost/tournee/domain/model/Colis.java`
- `src/main/java/com/docapost/tournee/domain/model/TourneeId.java`
- `src/main/java/com/docapost/tournee/domain/model/LivreurId.java`
- `src/main/java/com/docapost/tournee/domain/model/ColisId.java`
- `src/main/java/com/docapost/tournee/domain/model/StatutTournee.java`
- `src/main/java/com/docapost/tournee/domain/model/StatutColis.java`
- `src/main/java/com/docapost/tournee/domain/model/TypeContrainte.java`
- `src/main/java/com/docapost/tournee/domain/model/Adresse.java`
- `src/main/java/com/docapost/tournee/domain/model/Destinataire.java`
- `src/main/java/com/docapost/tournee/domain/model/Contrainte.java`
- `src/main/java/com/docapost/tournee/domain/model/Avancement.java`
- `src/main/java/com/docapost/tournee/domain/model/TourneeInvariantException.java`
- `src/main/java/com/docapost/tournee/domain/events/DomainEvent.java`
- `src/main/java/com/docapost/tournee/domain/events/TourneeDemarree.java`
- `src/main/java/com/docapost/tournee/domain/events/TourneeChargee.java`
- `src/main/java/com/docapost/tournee/domain/repository/TourneeRepository.java`

**Application** :
- `src/main/java/com/docapost/tournee/application/ConsulterListeColisCommand.java`
- `src/main/java/com/docapost/tournee/application/ConsulterListeColisHandler.java`
- `src/main/java/com/docapost/tournee/application/TourneeNotFoundException.java`

**Infrastructure** :
- `src/main/java/com/docapost/tournee/infrastructure/persistence/TourneeEntity.java`
- `src/main/java/com/docapost/tournee/infrastructure/persistence/ColisEntity.java`
- `src/main/java/com/docapost/tournee/infrastructure/persistence/ColisContrainteEmbeddable.java`
- `src/main/java/com/docapost/tournee/infrastructure/persistence/TourneeJpaRepository.java`
- `src/main/java/com/docapost/tournee/infrastructure/persistence/TourneeRepositoryImpl.java`
- `src/main/java/com/docapost/tournee/infrastructure/persistence/TourneeMapper.java`
- `src/main/java/com/docapost/tournee/infrastructure/seeder/DevDataSeeder.java`

**Interface** :
- `src/main/java/com/docapost/tournee/interfaces/rest/TourneeController.java`
- `src/main/java/com/docapost/tournee/interfaces/dto/TourneeDTO.java`
- `src/main/java/com/docapost/tournee/interfaces/dto/ColisDTO.java`
- `src/main/java/com/docapost/tournee/interfaces/dto/AdresseDTO.java`
- `src/main/java/com/docapost/tournee/interfaces/dto/DestinataireDTO.java`
- `src/main/java/com/docapost/tournee/interfaces/dto/ContrainteDTO.java`
- `src/main/java/com/docapost/tournee/interfaces/security/MockJwtAuthFilter.java`
- `src/main/java/com/docapost/tournee/interfaces/security/SecurityConfig.java`
- `src/main/java/com/docapost/tournee/SvcTourneeApplication.java`

**Tests** :
- `src/test/java/com/docapost/tournee/domain/TourneeTest.java`
- `src/test/java/com/docapost/tournee/application/ConsulterListeColisHandlerTest.java`
- `src/test/java/com/docapost/tournee/interfaces/TourneeControllerTest.java`

**Config** :
- `src/main/resources/application.yml`
- `pom.xml`

### Mobile `src/mobile/`

- `src/api/tourneeTypes.ts`
- `src/api/tourneeApi.ts`
- `src/screens/ListeColisScreen.tsx`
- `src/components/ColisItem.tsx`
- `src/__tests__/ListeColisScreen.test.tsx`
- `package.json`
- `tsconfig.json`

### Stubs

- `src/web/README.md` — A implémenter (BC-03, BC-07 — US-011 à US-015, US-021 à US-024)
- `src/backend/shared/domain-events/README.md` — A implémenter (pour bus d'événements R2)
