# Rapport As-Built — svc-supervision
> Date : 2026-04-04 | Auteur : @architecte-technique

---

## 1. Stack technique implémentée

| Composant | Valeur réelle | Valeur cible |
|-----------|--------------|-------------|
| Language | Java 20 | Java 21 |
| Framework | Spring Boot 3.4.3 | Spring Boot 4.0.3 |
| Base de données (dev) | H2 (in-memory) | PostgreSQL 16 |
| Base de données (prod) | PostgreSQL (driver inclus, non provisionné) | PostgreSQL 16 |
| Sécurité | Spring Security + OAuth2 Resource Server | Spring Security + Keycloak |
| WebSocket | Spring WebSocket (dépendance déclarée) | Spring WebSocket + STOMP |
| Tests | JUnit 5 + AssertJ + Mockito + @WebMvcTest | idem |
| Build | Maven | Maven |
| Port local | 8082 | 8082 |

**Dépendances déclarées dans pom.xml :**
- spring-boot-starter-web
- spring-boot-starter-data-jpa
- spring-boot-starter-websocket
- spring-boot-starter-security
- spring-boot-starter-oauth2-resource-server
- spring-boot-starter-actuator
- h2 (runtime, scope dev)
- postgresql (runtime)
- spring-boot-starter-test (scope test)
- spring-security-test (scope test)

---

## 2. Architecture applicative réelle

Le service implémente une architecture en couches **Domain / Application / Infrastructure / Interface** conforme au découpage DDD décrit dans l'architecture cible, avec une particularité : il fusionne dans un seul déployable les BC-03 (Supervision) et BC-07 (Planification).

### Structure des packages

```
com.docapost.supervision/
├── domain/
│   ├── model/                          # BC-03 : VueTournee, VueTourneeDetail, VueColis,
│   │                                   #          TableauDeBord, Instruction, StatutInstruction,
│   │                                   #          TypeInstruction, StatutTourneeVue, IncidentVue
│   ├── repository/                     # BC-03 : InstructionRepository, VueTourneeRepository (interfaces)
│   ├── service/                        # BC-03 : RisqueDetector (Domain Service)
│   ├── events/                         # BC-03 : TourneeARisqueDetectee, InstructionEnvoyee,
│   │                                   #          InstructionExecutee
│   └── planification/
│       ├── model/                      # BC-07 : TourneePlanifiee (Aggregate Root), Vehicule,
│       │                               #          VehiculeId (VO), StatutAffectation, ZoneTournee,
│       │                               #          ContrainteHoraire, Anomalie, ResultatCompatibilite,
│       │                               #          TypeVehicule, exceptions métier
│       ├── repository/                 # BC-07 : TourneePlanifieeRepository, VehiculeRepository (interfaces)
│       └── events/                     # BC-07 : AffectationEnregistree, TourneeLancee,
│                                       #          CompositionVerifiee, CompatibiliteVehiculeVerifiee,
│                                       #          CompatibiliteVehiculeEchouee, CompositionExportee,
│                                       #          DesaffectationEnregistree, TourneeImportee, VehiculeReaffecte
├── application/
│   ├── (handlers BC-03)                # ConsulterTableauDeBordHandler, ConsulterDetailTourneeHandler,
│   │                                   # EnvoyerInstructionHandler, MarquerInstructionExecuteeHandler,
│   │                                   # DetecterTourneesARisqueHandler, VueTourneeEventHandler,
│   │                                   # ConsulterInstructionsParTourneeHandler,
│   │                                   # ConsulterInstructionsEnAttenteHandler,
│   │                                   # PrendreEnCompteInstructionHandler
│   └── planification/                  # BC-07 : AffecterLivreurVehiculeHandler, LancerTourneeHandler,
│                                       # ValiderCompositionHandler, ConsulterPlanDuJourHandler,
│                                       # ConsulterDetailTourneePlanifieeHandler,
│                                       # VerifierCompatibiliteVehiculeHandler,
│                                       # ReaffecterVehiculeHandler, ExporterCompositionHandler,
│                                       # ConsulterVehiculesCompatiblesHandler, DesaffecterTourneeHandler
├── infrastructure/
│   ├── persistence/                    # Implémentations JPA : InstructionRepositoryImpl,
│   │                                   # VueTourneeRepositoryImpl, VueTourneeEntity,
│   │                                   # VueColisJpaRepository, IncidentVueJpaRepository,
│   │                                   # InstructionJpaRepository, ProcessedEventEntity,
│   │                                   # ProcessedEventJpaRepository (idempotence événements)
│   ├── planification/                  # TourneePlanifieeEntity, TourneePlanifieeMapper,
│   │                                   # TourneePlanifieeJpaRepository, VehiculeRepositoryImpl
│   ├── seeder/                         # DevDataSeeder (@Profile("dev"))
│   └── dev/                            # DevEventBridge (@Profile("dev")), DevRestConfig
├── interfaces/
│   ├── rest/                           # SupervisionController, InstructionController,
│   │                                   # EvenementTourneeController
│   ├── planification/rest/             # PlanificationController
│   ├── dev/                            # DevTmsController
│   ├── security/                       # SecurityConfig, MockJwtAuthFilter
│   └── dto/                            # DTOs request/response (EvenementTourneeRequest, VueTourneeDTO, etc.)
└── SvcSupervisionApplication.java
```

**Observations architecturales :**
- Le pattern Command / Handler (CQRS light) est correctement appliqué dans la couche Application.
- Le pattern **collect-and-publish** des Domain Events est implémenté sur TourneePlanifiee (liste `evenements` collectée dans l'agrégat, publiée par l'Application Service après sauvegarde).
- La table `processed_events` assure l'idempotence pour les événements entrants via EvenementTourneeController (US-032).
- L'event bus Kafka est **absent** : remplacé par des appels HTTP directs (DevEventBridge) en profil dev et par l'endpoint `/internal/vue-tournee/events` pour la propagation inter-services.

---

## 3. Endpoints REST exposés

### Contrôleur SupervisionController (`/api/supervision`)

| Méthode | URL | Description | Auth requise |
|---------|-----|-------------|-------------|
| GET | `/api/supervision/tableau-de-bord` | Tableau de bord — liste des tournées + compteurs. Filtre optionnel `?statut=` | SUPERVISEUR ou DSI |
| GET | `/api/supervision/tournees/{tourneeId}` | Détail d'une tournée (VueColis + incidents) | SUPERVISEUR ou DSI |

### Contrôleur InstructionController (`/api/supervision/instructions`)

| Méthode | URL | Description | Auth requise |
|---------|-----|-------------|-------------|
| POST | `/api/supervision/instructions` | Envoyer une instruction à un livreur | SUPERVISEUR ou DSI |
| GET | `/api/supervision/instructions/tournee/{tourneeId}` | Lister les instructions d'une tournée | SUPERVISEUR uniquement (@PreAuthorize) |
| GET | `/api/supervision/instructions/en-attente?tourneeId=` | Instructions ENVOYEE pour polling mobile | LIVREUR ou SUPERVISEUR |
| PATCH | `/api/supervision/instructions/{id}/executer` | Marquer une instruction exécutée | LIVREUR ou SUPERVISEUR |
| PATCH | `/api/supervision/instructions/{id}/prendre-en-compte` | Marquer une instruction prise en compte | LIVREUR ou SUPERVISEUR |

### Contrôleur EvenementTourneeController (`/api/supervision/internal`)

| Méthode | URL | Description | Auth requise |
|---------|-----|-------------|-------------|
| POST | `/api/supervision/internal/vue-tournee/events` | Réception d'événements svc-tournee (US-032) | Aucune (réseau interne) |

### Contrôleur PlanificationController (`/api/planification`)

| Méthode | URL | Description | Auth requise |
|---------|-----|-------------|-------------|
| GET | `/api/planification/plans/{date}` | Plan du jour, filtre optionnel `?statut=` | SUPERVISEUR ou DSI |
| GET | `/api/planification/tournees/{id}` | Détail d'une tournée planifiée | SUPERVISEUR ou DSI |
| POST | `/api/planification/tournees/{id}/composition/valider` | Valider la composition — émet CompositionVerifiee | SUPERVISEUR ou DSI |
| POST | `/api/planification/tournees/{id}/affecter` | Affecter livreur + véhicule | SUPERVISEUR ou DSI |
| POST | `/api/planification/tournees/{id}/lancer` | Lancer une tournée affectée — émet TourneeLancee | SUPERVISEUR ou DSI |
| POST | `/api/planification/plans/{date}/lancer-toutes` | Lancer toutes les tournées AFFECTEES | SUPERVISEUR ou DSI |
| POST | `/api/planification/tournees/{id}/verifier-compatibilite-vehicule` | Vérifier compatibilité poids/véhicule | SUPERVISEUR ou DSI |
| GET | `/api/planification/vehicules/compatibles?poidsMinKg=` | Lister les véhicules compatibles | SUPERVISEUR ou DSI |
| POST | `/api/planification/tournees/{id}/reaffecter-vehicule` | Réaffecter un véhicule | SUPERVISEUR ou DSI |
| DELETE | `/api/planification/tournees/{id}/affectation` | Désaffecter le livreur d'une tournée | SUPERVISEUR ou DSI |

### Contrôleur DevTmsController (profil dev uniquement)

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/dev/tms/import` | Simuler un import TMS |
| DELETE | `/dev/tms/reset` | Réinitialiser toutes les données dev |

### Endpoints système

| Méthode | URL | Description | Auth requise |
|---------|-----|-------------|-------------|
| GET | `/actuator/health` | Health check | Aucune |
| GET | `/actuator/info` | Info | Aucune |
| ALL | `/ws/**` | WebSocket STOMP | Aucune (déclarée) |

---

## 4. Modèles de domaine

### BC-03 — Supervision

| Classe | Type | Description |
|--------|------|-------------|
| `VueTournee` | Read Model | Représente l'état d'une tournée pour le tableau de bord : id, livreurNom, colisTraites, colisTotal, statut, codeTms, zone |
| `VueTourneeDetail` | Read Model | Extension de VueTournee avec listes de VueColis et IncidentVue |
| `VueColis` | Read Model | État d'un colis vu par le superviseur : adresse, statut, motif, horodatage |
| `IncidentVue` | Read Model | Incident déclaré sur un colis : adresse, motif, horodatage, commentaire |
| `TableauDeBord` | Objet applicatif | Agrégation des VueTournee + compteurs (total, en cours, à risque, clôturées) |
| `Instruction` | Aggregate Root | Instruction envoyée à un livreur : tourneeId, colisId, superviseurId, typeInstruction, creneauCible, statut, horodatage |
| `StatutInstruction` | Value Object (enum) | ENVOYEE, PRISE_EN_COMPTE, EXECUTEE |
| `TypeInstruction` | Value Object (enum) | PRIORISER, ANNULER, MODIFIER_CRENEAU, REPROGRAMMER |
| `StatutTourneeVue` | Value Object (enum) | EN_COURS, A_RISQUE, CLOTUREE |

### BC-07 — Planification

| Classe | Type | Description |
|--------|------|-------------|
| `TourneePlanifiee` | Aggregate Root | Tournée importée depuis TMS, cycle NON_AFFECTEE → AFFECTEE → LANCEE |
| `Vehicule` | Entity | Véhicule disponible : vehiculeId, capaciteKg, typeVehicule |
| `VehiculeId` | Value Object | Identifiant encapsulé du véhicule |
| `ZoneTournee` | Value Object | Zone géographique d'une tournée : nom, nbColis |
| `ContrainteHoraire` | Value Object | Contrainte temporelle : libellé, nbColis concernés |
| `Anomalie` | Value Object | Anomalie détectée : code (ex. "SURCHARGE"), description |
| `StatutAffectation` | Value Object (enum) | NON_AFFECTEE, AFFECTEE, LANCEE |
| `TypeVehicule` | Value Object (enum) | FOURGON, VL, UTILITAIRE (valeurs déduites) |
| `ResultatCompatibilite` | Value Object (enum) | COMPATIBLE, DEPASSEMENT, POIDS_ABSENT |

### Domain Events

**BC-03 :** `TourneeARisqueDetectee`, `InstructionEnvoyee`, `InstructionExecutee`
**BC-07 :** `TourneeLancee`, `AffectationEnregistree`, `CompositionVerifiee`, `CompatibiliteVehiculeVerifiee`, `CompatibiliteVehiculeEchouee`, `CompositionExportee`, `DesaffectationEnregistree`, `TourneeImportee`, `VehiculeReaffecte`

---

## 5. Sécurité implémentée

### Mécanisme général

| Aspect | Implémentation réelle |
|--------|----------------------|
| Session | Stateless (STATELESS) |
| CSRF | Désactivé |
| CORS | Toutes origines (`*`), méthodes GET/POST/PUT/PATCH/DELETE/OPTIONS, credentials autorisés |
| Profil dev | `MockJwtAuthFilter` injecte automatiquement `superviseur-001` / `ROLE_SUPERVISEUR` |
| Profil prod | OAuth2 Resource Server (Keycloak) — claim `roles` → `ROLE_xxx` via `JwtGrantedAuthoritiesConverter` |

### Règles d'accès par URL

| Pattern | Rôles autorisés | Remarques |
|---------|----------------|-----------|
| `OPTIONS /**` | Tous | CORS preflight |
| `/actuator/health`, `/actuator/info` | Tous | Health check |
| `/h2-console/**` | Tous | Dev uniquement |
| `/ws/**` | Tous | WebSocket — auth STOMP non vérifiée |
| `/api/supervision/internal/**` | Tous | Inter-services — protection réseau uniquement |
| `/api/preuves/**` | SUPERVISEUR, DSI | |
| `GET /api/supervision/instructions/en-attente` | LIVREUR, SUPERVISEUR | |
| `PATCH /api/supervision/instructions/*/executer` | LIVREUR, SUPERVISEUR | |
| `PATCH /api/supervision/instructions/*/prendre-en-compte` | LIVREUR, SUPERVISEUR | |
| `/api/supervision/**` | SUPERVISEUR, DSI | Catch-all supervision |
| `/api/planification/**` | SUPERVISEUR, DSI | |
| Tout autre | Authentifié | |

---

## 6. Tests

### Types de tests présents

| Type | Fichiers | Couverture |
|------|----------|-----------|
| Tests domaine (unitaires purs) | `TourneePlanifieeTest.java` (25 cas), `TourneePlanifieeUS030Test.java`, `InstructionTest.java` | Aggregate TourneePlanifiee (US-021→US-024, US-030, US-050), Instruction |
| Tests application handlers | `AffecterLivreurVehiculeHandlerTest.java`, `LancerTourneeHandlerTest.java`, `ConsulterPlanDuJourHandlerTest.java`, `VerifierCompatibiliteVehiculeHandlerTest.java`, `ReaffecterVehiculeHandlerTest.java`, `ExporterCompositionHandlerTest.java`, `ConsulterVehiculesCompatiblesHandlerTest.java`, `EnvoyerInstructionHandlerTest.java`, `MarquerInstructionExecuteeHandlerTest.java`, `ConsulterDetailTourneeHandlerTest.java`, `ConsulterTableauDeBordHandlerTest.java`, `ConsulterInstructionsParTourneeHandlerTest.java`, `DetecterTourneesARisqueHandlerTest.java`, `VueTourneeEventHandlerTest.java`, `RisqueDetectorTest.java` | Use cases complets BC-03 et BC-07 |
| Tests contrôleurs (@WebMvcTest) | `PlanificationControllerTest.java` (21 cas), `SupervisionControllerTest.java`, `InstructionControllerTest.java`, `DevTmsControllerTest.java` | Tous les endpoints principaux + cas d'erreur |
| Tests infrastructure | `DevEventBridgeTest.java` | Bridge de propagation inter-services |
| Tests d'intégration | Absents | Aucun test @SpringBootTest ou test de base de données |

**Observations :** La couverture de tests est dense sur les couches Domain et Application. Les tests @WebMvcTest couvrent les happy paths et les principaux cas d'erreur. Il n'existe pas de tests d'intégration avec la base de données H2 (repository) ni de tests de la couche infrastructure JPA.

---

## 7. Données de seed (DevDataSeeder)

Activé uniquement avec `@Profile("dev")`. Créé au démarrage via `CommandLineRunner`.

### VueTournee (BC-03)

| Id | Livreur | Colis traités / Total | Statut | codeTms | Zone |
|----|---------|-----------------------|--------|---------|------|
| tournee-sup-001 | Pierre Martin | 3/10 | EN_COURS | T-201 | Lyon 3e |
| tournee-sup-002 | Marie Lambert | 7/10 | EN_COURS | T-202 | Villeurbanne |
| tournee-sup-003 | Jean Moreau | 2/12 | A_RISQUE | T-203 | Lyon 3e |
| tournee-sup-005 | Sophie Bernard | 0/0 | EN_COURS | T-205 | Lyon 4e |
| tournee-sup-006 | Lucas Petit | 0/0 | EN_COURS | T-206 | Lyon 7e |

### TourneePlanifiee (BC-07)

| Id | codeTms | Statut | Livreur | Véhicule | Anomalie |
|----|---------|--------|---------|---------|----------|
| tp-201 | T-201 | NON_AFFECTEE | — | — | — |
| tp-202 | T-202 | AFFECTEE | Pierre Martin | VH-07 | — |
| tp-203 | T-203 | NON_AFFECTEE | — | — | SURCHARGE (41 colis > seuil 35) |
| tp-204 | T-204 | LANCEE | Paul Dupont | VH-03 | — |
| tp-205 | T-205 | AFFECTEE | Sophie Bernard | VH-05 | — |
| tp-206 | T-206 | AFFECTEE | Lucas Petit | VH-06 | — |

### Instructions

| Id | Tournée | Colis | Type | Statut |
|----|---------|-------|------|--------|
| instr-dev-001 | tournee-sup-001 | colis-s-003 | PRIORISER | ENVOYEE |
| instr-dev-002 | tournee-sup-001 | colis-s-001 | ANNULER | EXECUTEE |

---

## 8. Écarts avec l'architecture cible

| Élément | Cible | Réalisé | Impact | Recommandation |
|---------|-------|---------|--------|----------------|
| Java version | Java 21 | Java 20 | Mineur — absence de virtual threads (Project Loom), LTS Java 21 non utilisé | Mettre à jour `<java.version>` vers 21 dans pom.xml, tester la compatibilité |
| Spring Boot version | 4.0.3 | 3.4.3 | Moyen — Spring Boot 4 n'existe pas encore en GA. L'équipe utilise la version stable la plus récente | Conserver 3.4.3 jusqu'à la GA de Spring Boot 4. Mettre à jour l'ADR DD-001 |
| Event bus | Kafka (DD-007, MVP : Spring ApplicationEventPublisher) | HTTP direct (DevEventBridge) en dev + endpoint interne en prod | Moyen — la propagation BC-07 → BC-03 en prod repose sur un appel HTTP synchrone, pas un bus asynchrone | En prod, l'endpoint `/internal/vue-tournee/events` doit être appelé par svc-tournee. Documenter ce contrat. Planifier Kafka pour R2 |
| BC-07 Planification | Service déployable séparé (`svc-planification`) | Fusionné dans `svc-supervision` (même déployable) | Moyen — un seul service à déployer, mais couplage accru entre BC-03 et BC-07 ; contredit DD-001 | Acceptable pour le MVP. Documenter comme dette technique. Prévoir split en R2 |
| Outbox pattern | PostgreSQL table outbox + scheduler | Absent — aucune table outbox ni OutboxPoller | Moyen — pas de garantie at-least-once delivery en cas de crash après commit BDD | Ajouter l'outbox pour les Domain Events critiques (TourneeLancee → svc-tournee) |
| Base de données | PostgreSQL 16 par BC | H2 in-memory en dev, PostgreSQL non provisionné | Faible en dev, bloquant pour le déploiement | Provisionner une instance PostgreSQL (docker-compose ou cloud) ; le driver est déjà inclus |
| WebSocket (STOMP) | Spring WebSocket + STOMP côté serveur | Dépendance déclarée mais aucun `@MessageMapping` ni `@SendTo` identifié | Moyen — le tableau de bord en temps réel n'est pas livré | Implémenter le WebSocketConfig et les broadcast handlers pour US-011 temps réel |
| Keycloak SSO | Keycloak provisionné | MockJwtAuthFilter (dev) + OAuth2 Resource Server configuré (prod, non testé) | Moyen — aucun Keycloak de dev disponible | Provisionner Keycloak sur Docker ou utiliser un environnement partagé |
| svc-notification (BC-04) | Service séparé — FCM push | Absent de svc-supervision | Mineur pour le MVP supervision | Non requis pour les US supervision. Planifier quand US notifications push seront adressées |
| `/api/preuves/**` | svc-preuves distinct | Route déclarée dans SecurityConfig mais service absent | Faible — configuration proactive | Supprimer ou documenter la règle comme placeholder |
| Tests d'intégration | Plan de test complet | Aucun test @SpringBootTest / test repository JPA | Faible — la logique applicative est bien couverte | Ajouter au moins un test d'intégration H2 par repository |

---

## 9. Points d'attention

1. **Dette technique BC-07 dans svc-supervision** : l'intégration de BC-07 (Planification) dans le même service que BC-03 (Supervision) contredit l'ADR DD-001 (1 service = 1 BC). Le code est proprement séparé par packages mais le déploiement est unifié. Décision à valider avec l'équipe et le PO avant la R2.

2. **Propagation BC-07 → BC-01 (DevEventBridge)** : en profil dev, le DevEventBridge appelle svc-tournee via HTTP synchrone. Si svc-tournee est arrêté, la propagation est silencieusement ignorée. En prod, aucun mécanisme équivalent n'est décrit côté svc-tournee — le contrat d'appel à `/internal/vue-tournee/events` doit être documenté et testé.

3. **CORS trop permissif** : `allowedOriginPatterns(List.of("*"))` avec `allowCredentials(true)` est acceptable en dev mais doit être restreint en prod (liste blanche des origines autorisées).

4. **`/ws/**` ouvert sans authentification** : le WebSocket endpoint est permis sans JWT. Si un WebSocket fonctionnel est implémenté, ajouter l'authentification STOMP (header Authorization dans `CONNECT`).

5. **`/api/supervision/internal/**` sans authentification** : protégé uniquement par le réseau interne. Si l'API Gateway est mal configurée, un appelant externe peut injecter de faux événements dans le read model. Envisager une authentification mTLS ou un secret partagé pour cet endpoint en prod.

6. **Poidsestimé non persisté** : le constructeur de reconstruction de `TourneePlanifiee` (depuis persistance) ne restitue pas le `poidsEstimeKg` dans le constructeur à 14 paramètres (passe `null`). Cela désactive silencieusement la vérification de compatibilité véhicule pour les tournées rechargées depuis la BDD.

7. **UUID v7 non utilisé** : `TourneePlanifiee` utilise des identifiants fournis par l'extérieur (pas de génération interne). Le commentaire de code mentionne UUID v7 mais la dépendance n'est pas dans le pom.xml.
