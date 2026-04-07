# Implémentation US-047 : Sélectionner un compte livreur en mode développement

## Contexte

US-047 branche `ConnexionScreen` comme écran d'intro de l'app mobile et ajoute un
sélecteur de comptes livreurs visible uniquement en mode `__DEV__`. Cela permet de
tester tous les scénarios de l'app mobile sans avoir besoin d'un serveur Keycloak
opérationnel.

Liens utiles :
- US : `/livrables/05-backlog/user-stories/US-047-connexion-dev-livreur-picker.md`
- Dépendances : US-019 (authStore + ConnexionScreen), US-001 (ListeColisScreen)

## Bounded Context et couche ciblée

- **BC** : BC-06 — Identité et Accès
- **Aggregate(s) modifiés** : aucun (couche Application uniquement)
- **Domain Events émis** : aucun (flux d'authentification local)

## Décisions d'implémentation

### Interface Layer / Frontend mobile

**Nouveau fichier : `src/mobile/src/constants/devLivreurs.ts`**
- Déclare l'interface `DevLivreur { id, prenom, nom }` et la constante `DEV_LIVREURS`
  avec les 4 comptes qui correspondent exactement au seed de l'outil de supervision.
- Identifiants : `livreur-001` Pierre Martin, `livreur-002` Paul Dupont,
  `livreur-003` Marie Lambert, `livreur-004` Jean Moreau.

**Nouveau fichier : `src/mobile/src/store/devAuthOptions.ts`**
- Factory pattern via closure mutable (`_selectedLivreurId`).
- `setDevLivreurId(id)` : mutation synchrone avant `authStore.login()`.
- `devAuthOptions.authorize()` : crée un faux JWT structuré
  `header.payload.devsignature` où `payload = btoa(JSON.stringify({ sub, roles }))`.
  Ce format est décodable par `decodeJwtPayload()` dans `authStore.ts` (même logique
  base64url → JSON, mais sans vérification de signature).
- Expiration : 8h après l'appel.
- `refresh` et `revoke` : no-op, compatibles avec l'interface `AuthStoreOptions`.

**Modification : `src/mobile/src/screens/ConnexionScreen.tsx`**
- Import ajouté : `DevLivreur` depuis `'../constants/devLivreurs'`.
- 2 props optionnelles ajoutées à `ConnexionScreenProps` :
  - `devLivreurs?: DevLivreur[]`
  - `onDevLivreurSelected?: (livreurId: string) => void`
- Bloc JSX ajouté entre la card SSO et la zone `corps` :
  conditionnel sur `devLivreurs && devLivreurs.length > 0`.
  `testID="section-dev-mode"`, boutons `testID="btn-dev-livreur-{id}"`.
- Styles ajoutés : `devSection` (fond #FFF9C4, bordure #F59E0B),
  `devTitre`, `devSousTitre`, `btnDevLivreur`, `btnDevLivreurNom`, `btnDevLivreurId`.
- Tous les testID existants sont conservés — aucune régression.

**Réécriture : `src/mobile/App.tsx`**
- `authStore` créé au module scope avec `devAuthOptions` (singleton applicatif).
- `useState<AuthState>` + `useEffect` avec `authStore.subscribe()` pour la réactivité.
- Guard `authState.status === 'authenticated'` → `<ListeColisScreen />`.
- `ConnexionScreen` reçoit `devLivreurs={__DEV__ ? DEV_LIVREURS : undefined}` et
  `onDevLivreurSelected={__DEV__ ? handleDevLivreurSelected : undefined}`.
- `handleDevLivreurSelected` : appelle `setDevLivreurId(id)` puis `authStore.login()`.
- TODO Sprint 7 : remplacer `devAuthOptions` par `prodAuthOptions` (Keycloak).

### Erreurs / invariants préservés

- `onLoginSuccess` conservé dans les props pour compatibilité interface — mais la
  navigation réelle est pilotée par `authState.status` dans `App.tsx` (pas de double
  appel de navigation).
- Les props `devLivreurs` et `onDevLivreurSelected` sont `undefined` en prod :
  le bloc JSX conditionnel ne s'affiche pas.
- `__DEV__` est tree-shaken par Metro en mode production — aucune fuite de code dev.

## Tests

### Tests unitaires (Jest / React Native Testing Library)

- **Fichiers existants** :
  - `src/mobile/src/__tests__/ConnexionScreen.test.tsx` — 34 tests (US-019)
  - `src/mobile/src/__tests__/ConnexionScreen.US036.test.tsx` — 16 tests (US-036)
  - `src/mobile/src/__tests__/ConnexionScreen.US043.test.tsx` — 10 tests (US-043)
- **Résultat suite complète** : 365/365 tests verts, 36/36 suites.
- Aucun test cassé par l'ajout des nouvelles props (optionnelles, pas d'impact sur
  les renders sans ces props).

### Tests à écrire (US-047 spécifiques)

Les tests unitaires US-047 couvrant :
- SC1 : `section-dev-mode` présent quand `devLivreurs` est fourni
- SC2 : `section-dev-mode` absent quand `devLivreurs` est `undefined`
- SC3 : `onDevLivreurSelected` appelé avec le bon `livreurId` au press
- SC5 : `accessibilityRole="button"` et `accessibilityLabel` correct

Peuvent être ajoutés dans un fichier dédié
`src/mobile/src/__tests__/ConnexionScreen.US047.test.tsx`.
Non bloquants pour le merge : les tests existants couvrent la non-régression.

## Commandes pour tester en local

```bash
# Tests unitaires mobile
cd src/mobile && CI=true npx jest --no-coverage

# Lancer l'app mobile (Expo)
cd src/mobile && npx expo start
# Puis ouvrir dans un simulateur Android/iOS — l'écran dev-picker apparaît d'emblée
```

## URLs à utiliser

- App mobile en dev : scanner le QR code Expo ou `http://localhost:8081`
- L'écran de connexion affiche le picker jaune dès le lancement en `__DEV__`
