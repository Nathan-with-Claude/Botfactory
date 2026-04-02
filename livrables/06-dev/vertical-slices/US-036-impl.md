# Implémentation US-036 : Card SSO rétractable après la première connexion

## Contexte

US-036 ajoute un comportement d'UX ergonomique sur l'écran de connexion M-01 : la card
explicative "Comment ça fonctionne ?" est automatiquement repliée après la première connexion
réussie du livreur, et le livreur peut la déplier/replier manuellement à tout moment.

Liens utiles :
- US : `/livrables/05-backlog/user-stories/US-036-card-sso-retractable-premiere-connexion.md`
- Wireframe : `/livrables/02-ux/wireframes.md` section M-01
- Implémentation auth : `/livrables/06-dev/vertical-slices/US-019-impl.md`

## Bounded Context et couche ciblée

- **BC** : BC-06 — Identité et Accès
- **Aggregate(s) modifiés** : aucun (comportement UI pur — pas de domaine métier impliqué)
- **Domain Events émis** : aucun

## Décisions d'implémentation

### Couche Frontend (mobile uniquement)

**Fichier modifié** : `src/mobile/src/screens/ConnexionScreen.tsx`

- Ajout d'un `useState<boolean | null>(null)` pour l'état `cardOuverte` (null = en cours de chargement).
- Import de `AsyncStorage` depuis `@react-native-async-storage/async-storage`.
- Deux clés AsyncStorage :
  - `hasConnectedOnce` : écrite à `'true'` à la première connexion réussie (dans `useEffect` sur `status`).
  - `cardSsoOuverte` : préférence explicite du livreur, écrite au toggle.
- `useEffect` de chargement initial : lit les deux clés en parallèle via `Promise.all`.
  Logique de priorité : préférence explicite > comportement par défaut (ouvert si première fois, replié sinon).
- `useEffect` sur `status === 'authenticated'` : appelle `onLoginSuccess()` puis vérifie
  asynchronement si `hasConnectedOnce` est déjà positionné avant d'écrire (évite les doubles écritures).
- Fonction `toggleCard()` : inverse l'état et persiste en AsyncStorage.
- Trois nouveaux `testID` : `card-sso-info`, `card-sso-header`, `card-sso-contenu`, `btn-toggle-card-sso`.

**Erreurs / invariants préservés** :
- Le bouton `btn-connexion-sso` reste toujours visible, quelle que soit l'état de la card (non-régression US-019).
- `onLoginSuccess` continue d'être appelé exactement une fois quand `status === 'authenticated'` (non-régression US-019).
- Pas de regression sur les 280 tests existants de la suite mobile.

### Couche Infrastructure (mobile)

**Fichier modifié** : `src/mobile/package.json`

- Ajout de `moduleNameMapper` dans la config Jest pour mapper `@react-native-async-storage/async-storage`
  vers le mock existant `src/__mocks__/asyncStorageMock.ts`.
- Note : `@react-native-async-storage/async-storage` n'est pas encore dans les dépendances npm
  car le projet utilise Expo (`expo` bundle l'API AsyncStorage de façon transparente en production).
  En développement local et tests : le mock suffit.

### Couche Domain / Application / Infrastructure backend

Non concernées par cette US — comportement purement UI sans impact domaine.

## Tests

### Type : unitaires Jest

**Fichier** : `src/mobile/src/__tests__/ConnexionScreen.US036.test.tsx`

16 tests couvrant :
- SC1 : première ouverture — card visible, contenu affiché, chevron présent.
- SC2 : ouvertures suivantes (`hasConnectedOnce=true`) — contenu masqué, header et chevron toujours présents.
- SC3 : toggle depuis état replié — contenu devient visible.
- SC4 : toggle depuis état ouvert — contenu devient masqué.
- SC5 : persistance préférence — `setItem('cardSsoOuverte', ...)` appelé au toggle, restauré au chargement.
- SC6 : écriture `hasConnectedOnce = true` après `status='authenticated'`, et non-écriture si déjà `true`.
- Non-régression US-019 : bouton SSO et spinner toujours présents.

**Résultat** : 16/16 verts + 280/280 suite totale verts.

### Stratégie mock AsyncStorage

Le mock `asyncStorageMock.ts` préexistant est branché via `moduleNameMapper` dans `package.json`.
Il fournit un store en mémoire avec `jest.fn()` trackables (`setItem`, `getItem`, `clear`).
Chaque test appelle `jest.clearAllMocks()` + `clear()` en `beforeEach` pour isolation.

## Cycle TDD respecté

1. RED : 13/16 tests échouent (testID manquants, AsyncStorage non importé).
2. GREEN : implémentation minimale — card state + useEffect + toggleCard.
3. REFACTOR : séparation des responsabilités `onLoginSuccess` / écriture `hasConnectedOnce`
   pour éviter la double dépendance cyclique React state.

## Décision : pas de dépendance npm supplémentaire

`@react-native-async-storage/async-storage` n'est pas ajouté à `package.json` comme dépendance
explicite car expo-sdk le fournit nativement. Pour les tests Jest, le moduleNameMapper suffit.
Si le projet évolue vers une configuration bare React Native (sans Expo), il faudra l'ajouter
explicitement.
