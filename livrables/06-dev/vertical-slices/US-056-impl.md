# Implémentation US-056 : Persistance offlineQueue via AsyncStorage — enqueue + initialisation

## Contexte

US-056 couvre la persistance de la file offline côté `enqueue()` et l'initialisation au démarrage via `initialize()`. US-060 avait déjà implémenté `persist()` après chaque `dequeue()` dans `sync()`. L'analyse du code existant a révélé que les deux mécanismes étaient déjà présents dans `offlineQueue.ts` et `useOfflineSync.ts`, mais les tests explicitement étiquetés US-056 manquaient.

- US spécification : `/livrables/05-backlog/user-stories/US-056-*.md`
- Architecture : `/livrables/04-architecture-technique/architecture-applicative.md`
- Code implémenté lors de la session corrections as-built (2026-04-04) : `offlineQueue.ts` + `useOfflineSync.ts`

## Bounded Context et couche ciblée

- **BC** : BC-01 — Orchestration de Tournée
- **Aggregate(s) modifiés** : OfflineQueue (domain service)
- **Domain Events émis** : aucun (infrastructure concern)

## Décisions d'implémentation

### Domain Layer

Aucun changement de code de domaine — l'implémentation était déjà en place.

`offlineQueue.ts` — état final vérifié :
- `initialize()` : charge la file depuis AsyncStorage au démarrage. Idempotent — les commandId déjà en mémoire ne sont pas dupliqués. Silencieux si AsyncStorage est vide ou si le JSON est corrompu (try/catch).
- `enqueue()` : appelle `void persist()` après chaque ajout en mémoire (non-bloquant).
- `persist()` : sérialise la file courante dans AsyncStorage avec la clé `'docupost_offline_queue'`. Silencieux si l'écriture échoue.
- `OfflineQueueOptions.storage` : interface `Pick<typeof AsyncStorage, 'getItem' | 'setItem'>` injectable pour les tests.

### Application Layer — Hook React Native

`useOfflineSync.ts` — état final vérifié :
```typescript
// US-056 — Charger la file persistée depuis AsyncStorage au montage
useEffect(() => {
  void queue.initialize();
  refreshPendingCount();
}, []);
```
`queue.initialize()` est appelé au montage du hook. `refreshPendingCount()` est appelé immédiatement après (pas de await) — le compteur se rafraîchira lors du prochain render une fois l'async terminé.

### Infrastructure Layer

Pas d'implémentation spécifique — `AsyncStorage` de `@react-native-async-storage/async-storage` est utilisé directement avec injection de dépendance pour les tests.

### Interface Layer

Aucune modification côté API/frontend.

### Erreurs / invariants préservés

- **Idempotence au rechargement** : si `commandId` est déjà en mémoire avant `initialize()`, il n'est pas re-enqueué.
- **Résistance aux erreurs** : `initialize()` et `persist()` sont tous les deux dans des blocs try/catch — une erreur AsyncStorage ne plante pas l'app.
- **Non-bloquant** : `enqueue()` appelle `void persist()` — l'appelant n'attend pas la fin de la persistance. Acceptable car la file en mémoire est toujours l'état de vérité pendant la session.

## Tests

**Type** : Unitaires (Jest, jsdom)

**Fichier** : `/src/mobile/src/__tests__/offlineQueue.test.ts`

**7 nouveaux tests US-056** (suite `'US-056 — persistance enqueue + initialize()'`) :

| Test | Scénario |
|---|---|
| SC1 | `enqueue()` persiste immédiatement dans AsyncStorage via `void persist()` |
| SC2 | `initialize()` charge les commandes depuis AsyncStorage (2 commandes, ordre préservé) |
| SC3 | `initialize()` est idempotent — 2 appels successifs ne dupliquent pas |
| SC4 | `initialize()` avec AsyncStorage vide ne plante pas |
| SC5 | `initialize()` résiste à un JSON corrompu dans AsyncStorage |
| SC6 | `canCloseRoute()` retourne false après chargement via `initialize()` |
| SC7 | Ordre FIFO préservé après rechargement depuis AsyncStorage |

**Total suite** : 28 tests offlineQueue (14 US-006 + 5 US-060 + 7 US-056 nouveaux + 2 types).

**Commande** :
```bash
cd src/mobile && npx jest src/__tests__/offlineQueue.test.ts --no-coverage
```

## Commandes pour tester en local

```bash
# Backend svc-tournee (port 8081)
cd src/backend/svc-tournee && ./mvnw spring-boot:run

# App mobile
cd src/mobile && npx expo start --android

# Tests unitaires seuls
cd src/mobile && npx jest src/__tests__/offlineQueue.test.ts --no-coverage
```
