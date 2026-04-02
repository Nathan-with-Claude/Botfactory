# Implémentation US-032 : Synchroniser le read model supervision depuis les événements livreur

## Contexte

US-032 résout un bloquant MVP : le tableau de bord superviseur affichait des données statiques
(figées au démarrage par le DevDataSeeder). Quand le livreur confirmait une livraison, déclarait
un échec ou clôturait sa tournée, ces actions n'étaient pas propagées vers `svc-supervision`.

La solution MVP retenue est un **appel HTTP synchrone fire-and-forget** depuis `svc-tournee` vers
`svc-supervision` après chaque action livreur significative. Pas de broker (Kafka/RabbitMQ) au MVP —
migration V2 prévue.

Liens :
- US : `/livrables/05-backlog/user-stories/US-032-synchroniser-read-model-supervision.md`
- Architecture : `/livrables/04-architecture-technique/architecture-applicative.md`
- US liée (tableau de bord) : `/livrables/05-backlog/user-stories/US-011-tableau-de-bord-tournees.md`

## Bounded Context et couche ciblée

- **BC** : BC-03 (Supervision) — consumer, BC-01 (Tournée) — producer
- **Aggregate(s) modifiés** : VueTournee (read model) dans svc-supervision
- **Domain Events émis** : aucun nouveau event de domaine — les events existants
  (ColisLivre, EchecLivraisonDeclare, TourneeCloturee) sont maintenant propagés via HTTP
  depuis svc-tournee vers svc-supervision

## Décisions d'implémentation

### Domain Layer (svc-supervision)

Aucune modification des entités de domaine. `VueTournee` expose déjà les méthodes nécessaires :
- `mettreAJourAvancement(colisTraites, colisTotal)` — utilisée pour COLIS_LIVRE et ECHEC_DECLAREE
- `cloturer()` — utilisée pour TOURNEE_CLOTUREE

### Application Layer (svc-supervision)

Nouveaux fichiers :
- `EvenementTourneeCommand` (record) — transporteur de la commande vers le handler
- `VueTourneeEventHandler` — orchestre la mise à jour du read model :
  1. Check idempotence via `ProcessedEventJpaRepository.existsById(eventId)`
  2. Récupère ou crée la `VueTournee` (création auto si absente)
  3. Applique la mutation selon `eventType`
  4. Sauvegarde le read model
  5. Marque l'event traité dans `processed_events`
  6. Broadcaster WebSocket via `TableauDeBordBroadcaster`

### Infrastructure Layer (svc-supervision)

Nouveaux fichiers :
- `ProcessedEventEntity` — entité JPA, table `processed_events(event_id PK, processed_at)`
- `ProcessedEventJpaRepository` — Spring Data JPA, `existsById()` pour le check O(1)

### Infrastructure Layer (svc-tournee)

Nouveaux fichiers :
- `SupervisionNotifier` — appel HTTP fire-and-forget vers svc-supervision :
  - Génère un `UUID` comme `eventId` pour l'idempotence
  - `CompletableFuture.runAsync()` — ne bloque pas la réponse livreur
  - 2 tentatives avec backoff 500ms en cas d'échec réseau
  - Log WARN si échec définitif, jamais d'exception propagée
  - URL configurable : `supervision.api.url` dans `application.yml`
- `SupervisionConfig` — déclare le bean `RestTemplate`

### Interface Layer (svc-supervision)

Endpoint ajouté dans `SupervisionController` :
```
POST /api/supervision/internal/vue-tournee/events
Content-Type: application/json

{
  "eventId": "uuid-v4",
  "eventType": "COLIS_LIVRE | ECHEC_DECLAREE | TOURNEE_CLOTUREE",
  "tourneeId": "string",
  "livreurId": "string",
  "colisId": "string | null",
  "motif": "string | null",
  "horodatage": "ISO-8601"
}

Réponses : 200 OK | 400 Bad Request (eventId/eventType/tourneeId manquant)
```

Nouveau DTO : `EvenementTourneeRequest` (record Java)

### Interface Layer (svc-tournee)

`TourneeController` modifié pour injecter `SupervisionNotifier` et l'appeler après :
- `POST /{tourneeId}/colis/{colisId}/livraison` → `notifierAsync("COLIS_LIVRE", ...)`
- `POST /{tourneeId}/colis/{colisId}/echec` → `notifierAsync("ECHEC_DECLAREE", ...)`
- `POST /{tourneeId}/cloture` → `notifierAsync("TOURNEE_CLOTUREE", ...)`

### Sécurité (svc-supervision)

`SecurityConfig` : la route `/api/supervision/internal/**` est déclarée `permitAll()`
**avant** la règle `/api/supervision/**` qui requiert `ROLE_SUPERVISEUR`. Le endpoint interne
n'est pas exposé au frontend — il est protégé par isolation réseau.

### Erreurs / invariants préservés

- Idempotence : un même `eventId` ne modifie jamais le read model deux fois
- Création automatique : si `VueTournee` absente, elle est créée avec `colisTraites=1,
  colisTotal=0, statut=EN_COURS` (colisTotal sera réconcilié manuellement si nécessaire)
- Résilience : l'action livreur est **toujours** persistée même si svc-supervision est
  indisponible (fire-and-forget — pas de rollback)
- Type inconnu : log WARN, pas d'exception, pas de modification du read model

## Tests

### Unitaires svc-supervision

Fichier : `src/backend/svc-supervision/src/test/java/com/docapost/supervision/application/VueTourneeEventHandlerTest.java`

6 tests TDD :
- SC1 : COLIS_LIVRE incrémente colisTraites + broadcaster appelé
- SC2 : ECHEC_DECLAREE incrémente colisTraites (échec = traité)
- SC3 : TOURNEE_CLOTUREE passe statut à CLOTUREE
- SC4 : Idempotence — eventId déjà traité → aucune modification
- SC5 : Création automatique VueTournee absente du read model
- SC6 : Type inconnu → log WARN, pas d'exception, pas de modification

### Intégration HTTP svc-supervision

Fichier : `src/backend/svc-supervision/src/test/java/com/docapost/supervision/interfaces/SupervisionControllerTest.java`

3 tests ajoutés (US-032) :
- POST /internal/vue-tournee/events valide → 200 OK, handler appelé
- POST sans eventId → 400 Bad Request
- POST sans tourneeId → 400 Bad Request

### Non-régression svc-tournee

6 fichiers de tests Controller mis à jour pour mocker `SupervisionNotifier` :
`TourneeControllerTest`, `CloturerTourneeControllerTest`, `EchecLivraisonControllerTest`,
`ConfirmerLivraisonControllerTest`, `DetailColisControllerTest`, `SecurityConfigTest`

### Résultats

- svc-supervision : **122/122 tests verts** (BUILD SUCCESS)
- svc-tournee : **109/109 tests verts** (BUILD SUCCESS)

## Commandes pour tester

### Lancer les services

```bash
# Terminal 1 : svc-supervision
cd src/backend/svc-supervision && mvn spring-boot:run

# Terminal 2 : svc-tournee
cd src/backend/svc-tournee && mvn spring-boot:run
```

### Simuler une livraison confirmée (curl depuis svc-tournee)

```bash
# Livraison confirmée sur le colis colis-001 de la tournée tournee-001
curl -X POST http://localhost:8081/api/tournees/tournee-001/colis/colis-001/livraison \
  -H "Content-Type: application/json" \
  -H "X-Livreur-Id: livreur-001" \
  -d '{"typePreuve":"DEPOT_SECURISE","descriptionDepot":"Boite aux lettres"}'

# Résultat attendu : svc-supervision met à jour VueTournee(tournee-001).colisTraites + 1
```

### Appeler directement l'endpoint interne (curl vers svc-supervision)

```bash
# COLIS_LIVRE
curl -X POST http://localhost:8082/api/supervision/internal/vue-tournee/events \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "test-evt-001",
    "eventType": "COLIS_LIVRE",
    "tourneeId": "tournee-001",
    "livreurId": "livreur-001",
    "colisId": "colis-001",
    "motif": null,
    "horodatage": "2026-03-26T10:00:00Z"
  }'
# → 200 OK + WebSocket push sur /topic/tableau-de-bord

# Vérifier le read model mis à jour
curl http://localhost:8082/api/supervision/tableau-de-bord \
  -H "Authorization: Bearer mock-supervisor"

# TOURNEE_CLOTUREE
curl -X POST http://localhost:8082/api/supervision/internal/vue-tournee/events \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "test-evt-002",
    "eventType": "TOURNEE_CLOTUREE",
    "tourneeId": "tournee-001",
    "livreurId": "livreur-001",
    "colisId": null,
    "motif": null,
    "horodatage": "2026-03-26T17:00:00Z"
  }'
# → 200 OK + VueTournee(tournee-001).statut = CLOTUREE

# Test idempotence (même eventId envoyé deux fois)
curl -X POST http://localhost:8082/api/supervision/internal/vue-tournee/events \
  -H "Content-Type: application/json" \
  -d '{"eventId":"test-evt-001","eventType":"COLIS_LIVRE","tourneeId":"tournee-001","livreurId":"livreur-001","colisId":"colis-001","motif":null,"horodatage":"2026-03-26T10:00:00Z"}'
# → 200 OK mais colisTraites PAS doublé (idempotence)
```

## Limites connues

1. **livreurId non résolu** : `SupervisionNotifier` passe le token `"livreur"` (littéral) comme
   livreurId. En production, il faudrait extraire l'ID depuis le `SecurityContext` de svc-tournee.
   La création auto de VueTournee utilisera donc cet ID factice comme nom de livreur.

2. **colisTotal à 0** pour les VueTournee créées automatiquement (tournées non présentes dans les
   seeds de supervision). Un endpoint de réconciliation `GET /internal/vue-tournee/reconcile/{tourneeId}`
   est prévu en V2 (cf. US-032 scénario 5).

3. **Pas de circuit-breaker** : uniquement 2 tentatives avec backoff 500ms. En production,
   un pattern Resilience4j ou une outbox seraient plus robustes.

4. **Payload JSON construit manuellement** dans `SupervisionNotifier.buildPayload()` pour éviter
   une dépendance Jackson dans la couche infrastructure. En V2, utiliser `ObjectMapper` injecté.

5. **Route /internal non authentifiée** : protégée uniquement par isolation réseau.
   En production, ajouter un secret partagé (header `X-Internal-Secret`) ou mTLS.
