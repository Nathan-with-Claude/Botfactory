# Implémentation US-060 : Corriger persist() manquant après sync() dans offlineQueue

## Contexte

US-060 (P0/XS) — Bug critique détecté par QA (OBS-AS-006) : après une synchronisation réussie, la file offline est vidée en mémoire mais `persist()` n'est jamais appelé dans `sync()`. Conséquence : au redémarrage de l'app post-sync, AsyncStorage contient encore les commandes déjà envoyées → double envoi.

Liens utiles :
- `/livrables/05-backlog/user-stories/US-060-correction-persist-apres-sync-offline-queue.md`
- `/livrables/04-architecture-technique/architecture-applicative.md` (pattern offline-first)

## Bounded Context et couche ciblée

- **BC** : BC-01 Orchestration de Tournée
- **Aggregate(s) modifiés** : aucun (correction infrastructure domain)
- **Domain Events émis** : aucun

## Décisions d'implémentation

### Domain Layer

Fichier modifié : `src/mobile/src/domain/offlineQueue.ts`

La fonction `sync()` effectuait le `dequeue` (suppression en mémoire) mais n'appelait jamais `persist()` ensuite. La correction consiste à appeler `await persist()` immédiatement après chaque suppression de commande de la file, dans les trois branches :

1. `result.success || result.alreadyProcessed` → persist après dequeue
2. `result.status === 409` → persist après dequeue
3. Erreur métier non récupérable → persist après dequeue

La branche `catch` (erreur réseau) ne persiste PAS intentionnellement : les commandes non traitées doivent rester dans AsyncStorage pour le prochain redémarrage.

### Invariants préservés

- Idempotence par `commandId` : inchangée
- Ordre FIFO : inchangé
- 409 = succès : inchangé
- Sync partielle : les commandes non encore jouées restent dans AsyncStorage (testID SC3)
- `canCloseRoute()` : retourne `true` uniquement quand la file mémoire ET AsyncStorage sont vides (SC4)
- Pas de double envoi au redémarrage (SC5)

### Application Layer

Aucune modification — `useOfflineSync.ts` appelle `syncFn()` qui lui-même appelle `queue.sync(executor)`. Le fix est entièrement dans `offlineQueue.ts`.

### Infrastructure Layer

Aucune modification — `AsyncStorage` injectable via `OfflineQueueOptions.storage` (pattern DI déjà en place depuis US-056).

### Interface Layer

Aucune modification.

### Frontend / Mobile

Aucune modification d'écran.

## Tests

### Nouveaux tests unitaires (TDD — tests écrits AVANT la correction)

Fichier : `src/mobile/src/__tests__/offlineQueue.test.ts`

5 nouveaux cas de test dans la section `US-060 — persist() après sync()` :

| ID | Scénario | Résultat |
|---|---|---|
| SC1 | `persist()` est appelé après chaque dequeue réussi pendant `sync()` | `setItem` appelé > fois qu'avant sync |
| SC2 | Après sync complète, AsyncStorage est vide | Dernier `setItem` contient `[]` |
| SC3 | Redémarrage après sync partielle : commandes non envoyées restent dans AsyncStorage | 2 commandes dans AsyncStorage (uuid-s2, uuid-s3) |
| SC4 | `canCloseRoute()` retourne false si AsyncStorage non vide (simulation redémarrage) | `false` après `initialize()` |
| SC5 | Pas de double envoi : commandes sync réussies absentes d'AsyncStorage au redémarrage | 2ème instance vide, executor appelé seulement 2 fois |

Suite complète après correction : **21/21 tests verts** (`offlineQueue.test.ts`).

### Régression

Aucune régression — 60/60 tests verts sur les suites `offlineQueue`, `CapturePreuveScreen`, `useOfflineSync`.
