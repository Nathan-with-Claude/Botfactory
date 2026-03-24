# Implémentation US-006 : Continuer à livrer en zone blanche et synchroniser dès le retour de connexion

## Contexte

US-006 : En tant que Pierre Morel (livreur terrain), je veux pouvoir continuer à enregistrer mes livraisons même sans connexion réseau, et que toutes mes actions soient synchronisées avec le SI dès que le réseau revient.

Complexité : L (8 points). Implémentation partielle MVP : file de sync en mémoire + détection réseau.

Liens :
- Spec : `/livrables/05-backlog/user-stories/US-006-mode-offline-synchronisation.md`
- Wireframe : `/livrables/02-ux/wireframes.md#écran-m-02--liste-des-colis-de-la-tournée`
- Architecture : `/livrables/04-architecture-technique/architecture-applicative.md`

## Bounded Context et couche ciblée

- **BC** : BC-01 Orchestration de Tournée (mobile offline) + BC-05 Intégration SI (sync OMS)
- **Aggregate(s) modifiés** : Tournée (côté mobile — état local), EvenementLivraison (côté backend)
- **Domain Events émis** : LivraisonConfirmee, EchecLivraisonDeclare (rejoués au retour réseau)

## Décisions d'implémentation

### Domain Layer (mobile)
- `offlineQueue.ts` :
  - `OfflineCommand` : commandId (UUID v7) + type (CONFIRMER_LIVRAISON | DECLARER_ECHEC) + payload + createdAt
  - `createOfflineQueue()` : factory pure, Map<commandId, command> + array d'ordre FIFO
  - `enqueue()` : idempotent (ignore les commandId déjà présents — SC3)
  - `sync(executor)` : replay FIFO, s'arrête sur erreur réseau (conserve les restants — SC2)
  - `canCloseRoute()` : true si file vide (SC4)
  - `generateCommandId()` : UUID v7 simplifié (timestamp-ordered)
- `useOfflineSyncState.ts` : logique de sync testable sans NetInfo

### Application Layer (mobile)
- `syncExecutor.ts` : convertit les OfflineCommand en requêtes HTTP, injecte `X-Command-Id`
- `useOfflineSync.ts` : hook React Native, écoute NetInfo, déclenche sync automatique (SC2)

### Infrastructure Layer (backend)
- `CommandIdempotencyFilter.java` (svc-tournee) :
  - Filtre `OncePerRequestFilter` sur POST `/livraison` et `/echec`
  - Détecte le header `X-Command-Id` et rejette les doublons en 409 (SC3)
  - Stockage en mémoire `ConcurrentHashMap` (MVP mono-instance)
  - Rétention 7 jours, cleanup lazy à chaque requête
  - TODO Sprint 4 : migrer vers Redis pour multi-instance

### Interface Layer (mobile — composants)
- `SyncIndicator.tsx` :
  - SC1 : bandeau orange "Hors connexion — Données locales" (`testID="bandeau-hors-connexion"`)
  - SC5 : indicateur "Synchronisation en attente — X action(s)" (`testID="indicateur-sync"`)
  - SC4 : spinner de synchronisation (`testID="spinner-sync"`)
  - Composant pur (props uniquement, pas d'accès au store)

### Fichiers créés

- `/src/mobile/src/domain/offlineQueue.ts`
- `/src/mobile/src/hooks/useOfflineSync.ts`
- `/src/mobile/src/hooks/useOfflineSyncState.ts`
- `/src/mobile/src/api/syncExecutor.ts`
- `/src/mobile/src/components/SyncIndicator.tsx`
- `/src/mobile/src/__tests__/offlineQueue.test.ts`
- `/src/mobile/src/__tests__/useOfflineSync.test.ts`
- `/src/mobile/src/__tests__/syncExecutor.test.ts`
- `/src/mobile/src/__tests__/SyncIndicator.test.tsx`
- `/src/backend/svc-tournee/src/main/java/com/docapost/tournee/interfaces/rest/CommandIdempotencyFilter.java`

### Erreurs / invariants préservés

- SC3 : idempotence double-niveaux — frontend (enqueue) et backend (X-Command-Id + 409)
- SC4 : `canCloseRoute()` bloque la clôture si file non vide (à connecter dans ListeColisScreen)
- SC2 : replay FIFO garanti — les commandes conservent leur ordre d'insertion
- SC2 : si réseau échoue au milieu du replay → les commandes restantes sont conservées

### Périmètre déféré (Sprint 4)

- **WatermelonDB** (SQLite natif) : persistence des commandes entre sessions
  - Raison : bindings natifs non configurés dans le monorepo Expo actuel
  - La file en mémoire suffit pour le MVP (session courante)
- **Redis** pour CommandIdempotencyFilter : multi-instance
- **Preuves offline** : upload S3 différé au retour de connexion
- **Intégration dans ListeColisScreen** : le bouton Clôturer doit vérifier `canCloseRoute()`

## Commandes pour lancer l'app en local

### Backend
```bash
cd src/backend/svc-tournee
JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-25.0.2.10-hotspot" mvn spring-boot:run
# Port 8081
# CommandIdempotencyFilter actif sur POST /livraison et /echec
```

### Mobile
```bash
cd src/mobile
npx expo start --android
# Activer le mode avion sur l'émulateur pour tester le mode offline
```

### Tests unitaires
```bash
cd src/mobile
npx jest --testPathPattern="offlineQueue|syncExecutor|SyncIndicator|useOfflineSync"
```

## URLs pour tester manuellement

- Backend svc-tournee : http://localhost:8081
- Confirmer livraison avec X-Command-Id : `POST /api/tournees/{id}/colis/{id}/livraison`
  - Header : `X-Command-Id: uuid-test-001`
  - Second appel avec même commandId → 409 attendu

## Instructions pour les tests manuels

1. Lancer le backend
2. Envoyer une livraison avec `X-Command-Id: uuid-test-001` → 200
3. Ré-envoyer la même requête → 409 (idempotence confirmée)
4. Sur mobile : activer le mode avion → bandeau orange "Hors connexion" visible
5. Confirmer une livraison → indicateur "1 action en attente"
6. Désactiver le mode avion → sync automatique, indicateur disparaît

## Tests

### Tests unitaires mobiles (35 tests)
- `src/mobile/src/__tests__/offlineQueue.test.ts` : 14 tests (enqueue, sync, canCloseRoute, idempotence)
- `src/mobile/src/__tests__/syncExecutor.test.ts` : 5 tests (X-Command-Id, 409, routage, erreur réseau)
- `src/mobile/src/__tests__/SyncIndicator.test.tsx` : 7 tests (bandeau offline, indicateur, spinner)
- `src/mobile/src/__tests__/useOfflineSync.test.ts` : 6 tests (pendingCount, canCloseRoute, triggerSync)

**Totaux** : 32 tests US-006 + 121 tests existants = 153 tests mobiles verts.
