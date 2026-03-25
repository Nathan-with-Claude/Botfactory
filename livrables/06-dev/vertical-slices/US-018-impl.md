# Implémentation US-018 : Garantir l'historisation immuable de chaque événement de livraison

## Contexte

**User Story** : En tant que Sophie Dubois (DSI), je veux que chaque événement de livraison soit stocké de façon immuable dans le système avec les quatre attributs obligatoires (qui, quoi, quand, géolocalisation), afin de pouvoir auditer complètement l'historique de n'importe quel colis ou tournée en moins de 5 minutes.

**Spec** : `/livrables/05-backlog/user-stories/US-018-historisation-immuable-evenements.md`
**Sprint** : Sprint 3
**Service** : `svc-oms` (partagé avec US-017, port 8083)

---

## Bounded Context et couche ciblée

- **BC** : BC-05 — Intégration SI / OMS
- **Aggregate(s) modifiés** : `EvenementLivraison` (Value Object immuable — record Java)
- **Domain Events émis** : aucun (Event Store = récepteur, non émetteur)
- **Pattern** : Event Store append-only (PostgreSQL en prod, H2 dev)

---

## Décisions d'implémentation

### Domain Layer — Immuabilité garantie par le type

`EvenementLivraison` est un `record` Java :
- Tous les champs sont `final` par construction.
- `marquerSynchronise()` retourne une **copie** avec le statut mis à jour — l'original est intact.
- Quatre attributs obligatoires vérifiés dans le compact constructor :
  - **qui** : `livreurId` — `requireNonNull`
  - **quoi** : `type` + `colisId` — `requireNonNull`
  - **quand** : `horodatage` — `requireNonNull`
  - **géolocalisation** : `coordonnees` — null accepté **uniquement** si `modeDegradGPS = true` (SC4)

### Infrastructure Layer — Append-only JPA

`EvenementEntity` :
- Tous les champs métier ont `updatable = false` en annotation JPA.
- Seuls `statutSynchronisation` et `tentativesSynchronisation` sont modifiables (nécessaire pour outbox US-017).
- Contrainte SQL `UNIQUE(event_id)` garantit l'idempotence au niveau base de données.
- Aucune méthode `delete` n'existe dans `EvenementStore` (interface ni implémentation).

### Application Layer

- `EnregistrerEvenementHandler` : vérifie l'unicité avant `append()` → `EvenementDejaExistantException` (HTTP 409) si doublon.
- `ConsulterHistoriqueColisHandler` : retourne les événements triés par `horodatage ASC` (ordre chronologique ascendant, SC3).
- `ConsulterHistoriqueTourneeHandler` : idem pour la granularité tournée.

### Interface Layer

- `GET /api/oms/evenements/colis/{colisId}` : reconstitution complète du parcours d'un colis (SC3).
- `GET /api/oms/evenements/tournee/{tourneeId}` : historique d'une tournée.
- `POST /api/oms/evenements` : point d'entrée d'enregistrement (201, 409 si doublon).

### Mode dégradé GPS (SC4)

- `latitude` et `longitude` peuvent être `null` dans la commande.
- Si null → `modeDegradGPS = true`, `coordonnees = null`.
- L'événement est créé normalement avec les 3 autres attributs obligatoires présents.
- Le champ `modeDegradGPS` permet de distinguer ces enregistrements dans les métriques d'audit.

### DevDataSeeder (profil dev)

4 événements de test pour `tournee-sup-001` :
1. `TOURNEE_DEMARREE` — SYNCHRONIZED (GPS Paris)
2. `LIVRAISON_CONFIRMEE` colis-s-001 — SYNCHRONIZED + preuveLivraisonId
3. `ECHEC_LIVRAISON_DECLARE` colis-s-002 — SYNCHRONIZED + modeDegradGPS + motifEchec=ABSENT
4. `LIVRAISON_CONFIRMEE` colis-s-003 — PENDING (déclenche rejeu OutboxPoller)

---

## Erreurs / invariants préservés

| Invariant | Mécanisme |
|---|---|
| Immuabilité attributs métier | `updatable = false` JPA + record Java |
| Unicité eventId | UNIQUE constraint SQL + vérification applicative |
| 4 attributs obligatoires | compact constructor avec `requireNonNull` + validation GPS |
| Pas de suppression | Aucune méthode delete dans EvenementStore |
| Ordre chronologique audit | `ORDER BY horodatage ASC` JPA |

---

## Commandes de lancement (tests manuels)

```bash
# Démarrer svc-oms (profil dev — DevDataSeeder crée 4 événements)
cd src/backend/svc-oms
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Audit historique d'un colis (SC3)
curl http://localhost:8083/api/oms/evenements/colis/colis-s-001
# → 2 événements : TOURNEE_DEMARREE + LIVRAISON_CONFIRMEE (ordre chrono)

# Audit historique d'une tournée
curl http://localhost:8083/api/oms/evenements/tournee/tournee-sup-001
# → 4 événements en ordre chronologique

# Test idempotence (SC3) — POST deux fois le même eventId → 409
curl -X POST http://localhost:8083/api/oms/evenements \
  -H "Content-Type: application/json" \
  -d '{"eventId":"evt-001","tourneeId":"t","colisId":"c","livreurId":"l","type":"TOURNEE_DEMARREE","horodatage":"2026-03-24T10:00:00Z"}'
# → 409 Conflict si eventId déjà présent

# Mode dégradé GPS (SC4)
curl -X POST http://localhost:8083/api/oms/evenements \
  -H "Content-Type: application/json" \
  -d '{"eventId":"evt-gps-null","tourneeId":"t","colisId":"c","livreurId":"l","type":"LIVRAISON_CONFIRMEE","horodatage":"2026-03-24T11:00:00Z"}'
# → 201 Created avec modeDegradGPS=true dans la réponse GET
```

---

## Tests

- **Type** : unitaires (Mockito) + @WebMvcTest (MockMvc)
- **Fichiers** :
  - `EvenementLivraisonTest` — 9 tests (4 attributs obligatoires, immuabilité, mode dégradé GPS, validations coordonnées)
  - `EnregistrerEvenementHandlerTest` — 3 tests (nominal GPS, mode dégradé, idempotence 409)
  - `EvenementControllerTest` — 6 tests (POST 201, POST 409, GET colis, GET vide, GET tournée, GPS dégradé)
- **Total** : 23 tests — 23/23 verts ✓

---

## Skills utilisés

- obra/test-driven-development : invariants d'immuabilité testés avant implémentation
- DDD hexagonal : `EvenementStore` = port, `EvenementStoreImpl` = adapter JPA
