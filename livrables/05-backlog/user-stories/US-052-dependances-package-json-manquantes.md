# US-052 — Déclarer les dépendances natives manquantes dans package.json

> Feature : F-DEV-001 — Infrastructure technique mobile
> Epic : EPIC-DEV-001 — Infrastructure et environnement de développement
> Priorité : P0 — Bloquant build natif
> Complexité estimée : XS
> Statut : À faire

## En tant que…

Développeur ou ingénieur DevOps préparant le build natif iOS/Android de l'application mobile DocuPost,

## Je veux…

que `react-native-app-auth` et `@react-native-community/netinfo` soient correctement déclarés dans `package.json`,

## Afin de…

que `npm install` (ou `npx expo install`) les installe effectivement et que le build natif Expo EAS puisse aboutir.

## Contexte technique

**Écart as-built identifié (rapport-as-built-mobile.md, §1 et §10) :**

Deux dépendances sont utilisées dans le code source mais absentes du `package.json` :

| Dépendance | Utilisée dans | Effet de l'absence |
|------------|--------------|-------------------|
| `react-native-app-auth` | `src/store/authStore.ts` — fonction `authorize` du flow PKCE | SSO PKCE inopérant en prod ; le build natif résout le module au linking et échoue |
| `@react-native-community/netinfo` | `src/hooks/useNetworkStatus.ts`, `src/hooks/useOfflineSync.ts` | Détection réseau absente ; build natif iOS/Android échoue |

Un `npm install` standard ne les installe pas car elles ne figurent pas dans `package.json`. Les tests unitaires passent car ces modules sont mockés dans les fichiers `jest.setup.ts`.

**Commandes de correction :**
```bash
npx expo install react-native-app-auth
npx expo install @react-native-community/netinfo
```

Ces commandes ajoutent les versions compatibles Expo 51 et mettent à jour `package.json` et `package-lock.json`.

**Invariants à respecter :**
- Les versions installées doivent être compatibles avec Expo SDK 51 (vérification via `expo-doctor`).
- Les mocks Jest existants ne doivent pas être supprimés — ils restent nécessaires pour les tests unitaires.

**Fichiers à modifier :** `src/mobile/package.json`, `src/mobile/package-lock.json`

## Critères d'acceptation

**Scénario 1 — Installation propre**
- Given un environnement Node.js vierge
- When on exécute `npm install` dans `src/mobile/`
- Then `react-native-app-auth` est présent dans `node_modules/`
- And `@react-native-community/netinfo` est présent dans `node_modules/`

**Scénario 2 — Compatibilité Expo**
- Given les dépendances sont ajoutées au package.json
- When on exécute `npx expo-doctor`
- Then aucune incompatibilité de version n'est signalée pour ces deux packages

**Scénario 3 — Tests unitaires inchangés**
- Given les dépendances sont ajoutées
- When on exécute la suite de tests Jest
- Then tous les tests passants avant la modification restent passants
- And l'événement DépendancesNativesInstallées est implicitement émis (build CI vert)

**Scénario 4 — Build Expo web**
- Given les dépendances sont ajoutées
- When on exécute `npx expo start --web`
- Then l'application démarre sans erreur de module non résolu

## Définition of Done

- [ ] `react-native-app-auth` déclaré dans `dependencies` de `package.json` avec version compatible Expo 51
- [ ] `@react-native-community/netinfo` déclaré dans `dependencies` de `package.json` avec version compatible Expo 51
- [ ] `npm install` réussi dans un environnement propre
- [ ] `npx expo-doctor` sans avertissement sur ces packages
- [ ] Suite de tests Jest toujours verte

## Liens

- Rapport as-built : /livrables/04-architecture-technique/rapport-as-built-mobile.md#1-stack-technique-implémentée
- Infrastructure locale : /livrables/00-contexte/infrastructure-locale.md
