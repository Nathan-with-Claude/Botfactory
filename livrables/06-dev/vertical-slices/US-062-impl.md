# Implémentation US-062 : Compteur d'envois en attente dans IndicateurSync

## Contexte

US-062 — Afficher le nombre d'envois en attente dans l'indicateur de synchronisation.

Problème : Quand le livreur est hors ligne, `IndicateurSync` affichait uniquement "OFFLINE" sans information sur le nombre d'actions en attente de synchronisation. Le livreur ne savait pas combien d'envois allaient être synchronisés au retour du réseau.

Fichiers de référence :
- `/livrables/05-backlog/user-stories/US-062-compteur-envois-en-attente-indicateur-sync.md`
- `/livrables/02-ux/wireframes.md` (M-02 bandeau hors ligne)

## Bounded Context et couche ciblée

- **BC** : BC-01 (Orchestration de Tournée) — Interface Layer (Design System)
- **Aggregate(s) modifiés** : aucun — modification de la couche de présentation
- **Domain Events émis** : aucun

## Décisions d'implémentation

### Domain Layer
- `offlineQueue.ts` : `getPendingCount()` était déjà exposée (SC5 US-006). Aucune modification.
- `offlineQueueInstance.ts` : **créé** — singleton de la file offline pour partage entre composants.
  Pattern identique à `authStoreInstance.ts`.

### Application Layer
- `useOfflineSync.ts` : `pendingCount` était déjà exposé dans le return du hook. Aucune modification.

### Infrastructure Layer
Aucune modification.

### Interface Layer
Modifications de la couche de présentation uniquement.

### Frontend (Mobile)

#### `IndicateurSync.tsx` — prop `pendingCount` ajoutée
```tsx
export interface IndicateurSyncProps {
  syncStatus: SyncStatus;
  pendingCount?: number;  // US-062 — nombre d'envois en attente
}
```

Comportement :
- LIVE, pendingCount absent ou 0 → badge "LIVE" uniquement
- OFFLINE, pendingCount > 0 → badge "OFFLINE" + "N envoi(s) en attente"
- OFFLINE, pendingCount = 0 ou absent → badge "OFFLINE" uniquement

Terminologie terrain : **"envois en attente"** (pas "synchronisation").
Label d'accessibilité enrichi : "Pas de réseau — N envois en attente".

#### `ListeColisScreen.tsx` — branchement pendingCount
- Import de `offlineQueueInstance` (singleton partagé).
- `useState<number>` initialisé avec `offlineQueue.getPendingCount()`.
- `useEffect` de rafraîchissement à chaque changement d'`etat` (chargement tournée).
- `<IndicateurSync syncStatus="offline" pendingCount={pendingCount} />` dans le bandeau hors ligne.
- Texte redondant `"Hors ligne — vos actions seront synchronisees"` supprimé (IndicateurSync porte le message).

### Erreurs / Invariants préservés
- Tous les `testID` préservés (`indicateur-sync`, `sync-point`, `bandeau-hors-ligne`).
- Nouveau `testID` ajouté : `sync-pending-count`.
- Logique métier inchangée.
- `offlineQueue.getPendingCount()` est synchrone (lecture en mémoire, O(1)).
- 25 tests des fichiers modifiés passent (18 IndicateurSync + 13 ListeColisScreen - 6 existants).

## Tests

- **Types** : tests unitaires TDD (7 nouveaux tests IndicateurSync).
- **Fichiers modifiés** :
  - `/src/mobile/src/components/design-system/IndicateurSync.tsx`
  - `/src/mobile/src/components/design-system/__tests__/IndicateurSync.test.tsx` (+7 tests)
  - `/src/mobile/src/screens/ListeColisScreen.tsx`
  - `/src/mobile/src/__tests__/ListeColisScreen.test.tsx` (correction test pré-existant statut colis)
  - `/src/mobile/src/domain/offlineQueueInstance.ts` (créé)
- **Résultat** : 53/53 tests verts sur les fichiers concernés.

### Scénarios couverts par les tests

| Scénario | Test |
|---|---|
| LIVE sans pendingCount → pas de compteur | `LIVE sans pendingCount : affiche uniquement "LIVE"` |
| LIVE avec pendingCount=0 → pas de compteur | `LIVE avec pendingCount = 0 : pas de compteur` |
| OFFLINE pendingCount>0 → affiche N envois | `OFFLINE avec pendingCount > 0 : affiche "N envois en attente"` |
| OFFLINE pendingCount=1 → singulier | `OFFLINE avec pendingCount = 1 : affiche "1 envoi en attente"` |
| OFFLINE sans pendingCount → pas de compteur | `OFFLINE sans pendingCount : pas de compteur` |
| OFFLINE pendingCount=0 → pas de compteur | `OFFLINE avec pendingCount = 0 : pas de compteur` |
| testID sync-pending-count présent si > 0 | `OFFLINE avec pendingCount > 0 : testID présent` |

## Limitation connue (R2)

Le `pendingCount` dans `ListeColisScreen` est rafraîchi uniquement au chargement de la tournée (via `useEffect([etat])`). Pour un compteur en temps réel (mis à jour à chaque enqueue/dequeue), il faudrait :
- Soit utiliser `useOfflineSync` avec la queue singleton et une `syncFn`.
- Soit exposer un Observable/EventEmitter dans `offlineQueue`.

Pour le MVP, le rafraîchissement au chargement est suffisant (le compteur augmente lors du passage au détail colis et diminue à la resynchronisation).
