# Implémentation US-017 : Synchroniser automatiquement les événements de livraison vers l'OMS

## Contexte

**User Story** : En tant qu'Éric Garnier (Architecte Technique DSI), je veux que chaque changement de statut colis déclenche automatiquement l'envoi d'un événement normalisé vers l'OMS via API REST en moins de 30 secondes, avec rejeu automatique en cas d'échec.

**Spec** : `/livrables/05-backlog/user-stories/US-017-synchronisation-oms.md`
**Sprint** : Sprint 3
**Service** : `svc-oms` (nouveau microservice, port 8083)

---

## Bounded Context et couche ciblée

- **BC** : BC-05 — Intégration SI / OMS (Anti-Corruption Layer)
- **Aggregate(s) modifiés** : `EvenementLivraison` (Value Object immuable — `marquerSynchronise()`, `marquerEchecSynchronisation()`)
- **Domain Events émis** : aucun (BC-05 consomme les events BC-01, ne les publie pas)
- **Pattern** : Outbox pattern — append-only Event Store + poller périodique

---

## Décisions d'implémentation

### Domain Layer
- `EvenementLivraison` : record Java immuable. `marquerSynchronise()` et `marquerEchecSynchronisation()` retournent un **nouvel objet** sans modifier l'original.
- `StatutSynchronisation` : enum PENDING → SYNCHRONIZED | FAILED.
- `EvenementStore` interface : `append()` (insertion uniquement), `updateStatut()` (seul champ mutable), `findEnAttente()`.

### Application Layer
- `OmsApiPort` : interface (port) isolant le BC-05 de l'OMS externe. Principe ACL : aucun objet métier DocuPost n'est exposé à l'OMS.
- `SynchroniserPendingEvenementsHandler` : itère sur les PENDING, appelle `OmsApiPort.transmettre()`, met à jour le statut.
- Gestion des erreurs : exception OMS capturée → FAILED, traitement indépendant par événement (un échec n'arrête pas les autres).

### Infrastructure Layer
- `OmsApiClient` : implémente `OmsApiPort`. En MVP : **simulation** (`oms.api.enabled=false`) — log + succès automatique. En production (Sprint 3) : `RestTemplate POST {oms.api.base-url}/statuts`.
- `OmsPayload` record : payload normalisé transmis à l'OMS — traduction ACL (livreurId, colisId, statut, horodatage, GPS, preuveLivraisonId).
- `OutboxPoller` : `@Scheduled(fixedDelay = 10 000 ms)` — garantit SLA < 30 secondes en mode connecté.
- `EvenementEntity` : seuls `statutSynchronisation` et `tentativesSynchronisation` sont `updatable=true`.

### Interface Layer
- `POST /api/oms/evenements` : enregistrement d'un événement (201 Created, 409 si doublon eventId).
- `GET /api/oms/evenements/colis/{colisId}` : historique pour audit.
- `GET /api/oms/evenements/tournee/{tourneeId}` : historique tournée.

### Erreurs / invariants préservés
- **Idempotence** (SC3) : `findById(eventId)` avant append — `EvenementDejaExistantException` (HTTP 409).
- **Pas de logique métier dans l'ACL** : BC-05 traduit et route uniquement, sans interpréter la sémantique DocuPost.
- **Tentatives** : compteur `tentativesSynchronisation` incrémenté à chaque essai (base pour backoff exponentiel Sprint 3).

### Limitations MVP
| Limitation | Mitigation | Sprint cible |
|---|---|---|
| OMS réelle non provisionnée | Simulation via `OmsApiClient` (log + succès) | Sprint 3 |
| Backoff exponentiel non implémenté | Tous les FAILED sont rejoués à chaque poll | Sprint 3 |
| Écoute événements BC-01 via Kafka | POST HTTP manuel ou DevDataSeeder | Sprint 3 |

---

## Commandes de lancement (tests manuels)

```bash
# Démarrer svc-oms (profil dev)
cd src/backend/svc-oms
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# API disponible sur http://localhost:8083

# Enregistrer un événement
curl -X POST http://localhost:8083/api/oms/evenements \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "evt-test-001",
    "tourneeId": "tournee-001",
    "colisId": "colis-001",
    "livreurId": "livreur-001",
    "type": "LIVRAISON_CONFIRMEE",
    "horodatage": "2026-03-24T10:00:00Z",
    "latitude": 48.8566,
    "longitude": 2.3522,
    "preuveLivraisonId": "preuve-001"
  }'

# Vérifier la synchronisation OMS (attendre 10s, l'OutboxPoller bascule PENDING → SYNCHRONIZED)
curl http://localhost:8083/api/oms/evenements/colis/colis-001
```

---

## Tests

- **Type** : unitaires (Mockito) + @WebMvcTest (MockMvc)
- **Fichiers** :
  - `SynchroniserPendingEvenementsHandlerTest` — 5 tests (succès, OMS KO, exception, liste vide, multi-événements)
  - `EvenementControllerTest` — 6 tests (POST 201, POST 409, GET colis, GET colis vide, GET tournée, mode dégradé GPS)
- **Total** : 23 tests — 23/23 verts ✓

---

## Skills utilisés

- obra/test-driven-development : tests écrits avant implémentation
- DDD hexagonal : OmsApiPort = port, OmsApiClient = adapter (ACL)
