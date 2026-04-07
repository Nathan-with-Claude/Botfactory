# Rapport As-Built — Application Mobile Livreur
> Date : 2026-04-04 | Auteur : @architecte-technique

---

## 1. Stack technique implémentée

| Composant | Valeur réelle | Valeur cible |
|-----------|--------------|-------------|
| Framework | Expo ~51.0.0 | React Native (Expo ou CLI) |
| React | 18.2.0 | React 19 |
| React Native | 0.74.5 | React Native (non versionné dans la cible) |
| TypeScript | ~5.6.0 | TypeScript 5.6 |
| Gestion d'état | Store custom pub/sub (authStore) | Zustand ou équivalent |
| Navigation | État local React (useState) | react-navigation (non précisé dans cible) |
| Offline storage | AsyncStorage + mémoire vive (offlineQueue) | WatermelonDB (SQLite) |
| Auth | OAuth2 PKCE (react-native-app-auth, non installé) + MockJwt | react-native-app-auth |
| Signature | react-native-signature-canvas ^4.7.2 | react-native-vision-camera + react-native-signature-canvas |
| Camera | Absente (non installée) | react-native-vision-camera |
| Push notifications | Absentes (react-native-firebase non installé) | Firebase Cloud Messaging |
| Background sync | NetInfo (@react-native-community/netinfo, absent du package.json) | react-native-background-fetch |
| UI | StyleSheet natif + composants custom (Colors + Theme tokens) | React Native Paper ou NativeWind |
| Tests | Jest 29 + jest-expo + @testing-library/react-native | idem |
| Build | Expo CLI | Expo EAS Build ou Fastlane |
| Port local (web) | 8084 | 8084 |

**Dépendances déclarées dans package.json :**
- expo ~51.0.0
- expo-linear-gradient ~13.0.2
- react 18.2.0 / react-native 0.74.5
- react-native-signature-canvas ^4.7.2
- @react-native-async-storage/async-storage 1.23.1
- react-native-web ~0.19.10
- @expo/metro-runtime ~3.2.3

**Absences notables par rapport à la cible :**
- `@react-native-community/netinfo` : utilisé dans le code mais absent du package.json (probablement mocké en test)
- `react-native-app-auth` : référencé dans authStore.ts mais non installé
- `react-native-firebase` / `@react-native-firebase/messaging` : absent
- `react-native-vision-camera` : absent
- `react-native-background-fetch` : absent
- `watermelondb` : absent (AsyncStorage utilisé à la place)

---

## 2. Architecture applicative réelle

L'application suit un découpage en couches inspiré de l'architecture hexagonale, adapté à React Native.

### Structure des dossiers

```
src/mobile/
├── App.tsx                        # Point d'entrée — routage auth (unauthenticated / authenticated)
└── src/
    ├── api/                       # Infrastructure layer — appels HTTP
    │   ├── httpClient.ts          # Factory HTTP avec injection Bearer token
    │   ├── httpClientTypes.ts     # Interface AuthStore pour injection
    │   ├── tourneeApi.ts          # Client svc-tournee (port 8081)
    │   ├── tourneeTypes.ts        # DTOs : TourneeDTO, ColisDTO, PreuveLivraisonDTO, etc.
    │   ├── supervisionApi.ts      # Client svc-supervision (port 8082)
    │   └── syncExecutor.ts        # Exécuteur de commandes offline → HTTP
    ├── domain/                    # Domain layer — logique métier pure
    │   ├── offlineQueue.ts        # File FIFO, idempotence commandId, sync
    │   └── filtreZone.ts          # Filtre par zone géographique (logique pure)
    ├── store/                     # Application layer — état global
    │   ├── authStore.ts           # Store auth OAuth2 PKCE (factory + singleton)
    │   ├── authStoreInstance.ts   # Instance singleton prod
    │   └── devAuthOptions.ts      # Options dev (fake JWT)
    ├── hooks/                     # Application layer — hooks React
    │   ├── useOfflineSync.ts      # Gestion offline + sync automatique au retour réseau
    │   ├── useOfflineSyncState.ts # Variante légère d'état sync
    │   ├── useNetworkStatus.ts    # Détection connectivité réseau
    │   ├── useConsignesLocales.ts # Gestion locale des instructions livreur
    │   └── useSwipeHint.ts        # Tutoriel swipe (UX)
    ├── constants/
    │   └── devLivreurs.ts         # Liste des livreurs de dev (sélecteur ConnexionScreen)
    ├── screens/                   # Interface layer — écrans applicatifs
    │   ├── ConnexionScreen.tsx
    │   ├── ListeColisScreen.tsx
    │   ├── DetailColisScreen.tsx
    │   ├── CapturePreuveScreen.tsx
    │   ├── DeclarerEchecScreen.tsx
    │   ├── RecapitulatifTourneeScreen.tsx
    │   └── MesConsignesScreen.tsx
    ├── components/                # Interface layer — composants partagés
    │   ├── ColisItem.tsx
    │   ├── FiltreZones.tsx
    │   ├── SyncIndicator.tsx
    │   ├── BandeauInstructionOverlay.tsx
    │   └── design-system/         # Composants DS DocuPost
    └── theme/                     # Design tokens
        ├── colors.ts
        ├── theme.ts
        ├── spacing.ts
        └── shadows.ts
```

**Pattern général :** screen → hook / api → domain / store. Pas de Zustand ni Redux — le store authStore est un singleton custom (factory pattern avec pub/sub). La navigation est gérée par `useState` dans App.tsx (pas de react-navigation).

---

## 3. Écrans implémentés

| Écran | Fichier | US couverte(s) | Statut |
|-------|---------|----------------|--------|
| ConnexionScreen | `ConnexionScreen.tsx` | US-019 (SSO + sélecteur dev), US-036, US-043, US-047, US-049 | Implémenté |
| ListeColisScreen | `ListeColisScreen.tsx` | US-001, US-002, US-003, US-016 (polling instructions), US-038, US-045 | Implémenté |
| DetailColisScreen | `DetailColisScreen.tsx` | US-004, US-015 (marquage instruction exécutée) | Implémenté |
| CapturePreuveScreen | `CapturePreuveScreen.tsx` | US-008, US-009, US-046 (signature pad réel) | Implémenté |
| DeclarerEchecScreen | `DeclarerEchecScreen.tsx` | US-005 | Implémenté |
| RecapitulatifTourneeScreen | `RecapitulatifTourneeScreen.tsx` | US-007 (clôture tournée + exports CSV) | Implémenté |
| MesConsignesScreen | `MesConsignesScreen.tsx` | US-037 (consignes locales + prise en compte) | Implémenté |

---

## 4. Gestion des API

### Deux clients HTTP distincts

**Client svc-tournee (tourneeApi.ts) :**
- Base URL : `EXPO_PUBLIC_API_URL` (défaut : `http://localhost:8081`)
- Utilise `createHttpClient` avec injection du Bearer token depuis authStore
- Refresh automatique du token avant appel si expiré
- Déconnexion forcée sur 401

**Client svc-supervision (supervisionApi.ts) :**
- Base URL : `EXPO_PUBLIC_SUPERVISION_URL` (défaut : `http://localhost:8082`)
- Utilise `fetch` natif **sans** injection de Bearer token (TODO US-019 en commentaire)
- Erreurs silencieuses sur le polling (ne bloque pas le livreur)

### Endpoints consommés depuis le mobile

| Service | Endpoint | Appel depuis |
|---------|----------|-------------|
| svc-tournee | `GET /api/tournees/today` | ListeColisScreen (chargement) |
| svc-tournee | `GET /api/tournees/{id}/colis/{colisId}` | DetailColisScreen |
| svc-tournee | `POST /api/tournees/{id}/colis/{colisId}/livraison` | CapturePreuveScreen, syncExecutor |
| svc-tournee | `POST /api/tournees/{id}/colis/{colisId}/echec` | DeclarerEchecScreen, syncExecutor |
| svc-tournee | `POST /api/tournees/{id}/cloture` | RecapitulatifTourneeScreen |
| svc-supervision | `GET /api/supervision/instructions/en-attente?tourneeId=` | ListeColisScreen (polling 10s) |
| svc-supervision | `PATCH /api/supervision/instructions/{id}/executer` | DetailColisScreen |
| svc-supervision | `PATCH /api/supervision/instructions/{id}/prendre-en-compte` | MesConsignesScreen |

### Gestion des erreurs

Les classes d'erreur métier sont définies en fin de fichier tourneeApi.ts : `TourneeNonTrouveeError`, `ColisNonTrouveError`, `EchecDejaDeClareError`, `ColisEncoreALivrerError`, `LivraisonDejaConfirmeeError`, `DonneesPreuveInvalidesError`. Ces erreurs sont levées à partir des codes HTTP retournés (404, 409, 400).

---

## 5. Authentification et Sécurité

### authStore (src/store/authStore.ts)

- Factory pattern (`createAuthStore(options)`) avec injection de dépendances pour les tests.
- Gère le cycle complet : `login` / `logout` / `refreshAccessToken`.
- Token JWT stocké **en mémoire uniquement** (jamais dans AsyncStorage).
- Extraction du `livreurId` depuis le claim `sub` du JWT.
- Extraction du rôle depuis le claim `roles[0]`.
- Configuration SSO déclarée : `SSO_CONFIG` (issuer, clientId, redirectUrl, PKCE activé).
- En dev : `devAuthOptions.ts` injecte une fonction `authorize` qui génère un fake JWT.

### MockJwtAuthFilter (svc-tournee et svc-supervision)

- Actif en profil `dev` uniquement.
- Injecte automatiquement l'utilisateur `superviseur-001` / `ROLE_SUPERVISEUR` côté backend.
- Le mobile n'envoie pas de token Bearer en dev vers svc-supervision (TODO visible dans supervisionApi.ts).
- Le mobile envoie un Bearer token via `httpClient` vers svc-tournee (compatible avec MockJwtAuthFilter qui lit le claim `sub`).

### Vulnérabilité identifiée

Les appels vers svc-supervision dans `supervisionApi.ts` ne transmettent pas le header Authorization. En profil prod, ces trois endpoints (`en-attente`, `executer`, `prendre-en-compte`) retourneraient 403 (LIVREUR non authentifié). Ce point doit être corrigé avant la mise en production.

---

## 6. Mode Offline

### Mécanisme implémenté

| Composant | Fichier | Rôle |
|-----------|---------|------|
| `offlineQueue` | `src/domain/offlineQueue.ts` | File FIFO en mémoire, idempotence par commandId, sync FIFO |
| `syncExecutor` | `src/api/syncExecutor.ts` | Traduit les commandes offline en requêtes HTTP (header X-Command-Id) |
| `useOfflineSync` | `src/hooks/useOfflineSync.ts` | Écoute NetInfo, déclenche sync automatique au retour de connexion |
| `useNetworkStatus` | `src/hooks/useNetworkStatus.ts` | Expose `isOnline` aux composants |

### Fonctionnement

1. En mode offline, les commandes `CONFIRMER_LIVRAISON` et `DECLARER_ECHEC` sont enfilées dans `offlineQueue` avec un `commandId` UUID v7 généré localement.
2. `useOfflineSync` écoute NetInfo. Dès que `isConnected` redevient `true`, la sync est déclenchée automatiquement.
3. `syncExecutor` rejoue les commandes en FIFO, en transmettant `X-Command-Id` pour l'idempotence backend.
4. Les 409 côté serveur (commande déjà traitée) sont traités comme des succès.
5. La clôture de tournée est conditionnée à `queue.canCloseRoute()` (file vide).

### Limites identifiées vs la cible

| Aspect | Cible | Réalisé |
|--------|-------|---------|
| Persistance offline entre sessions | WatermelonDB (SQLite natif) | AsyncStorage (clé-valeur) + mémoire vive |
| Background sync iOS | BGTaskScheduler | NetInfo seulement (sync au premier plan) |
| Sync photos/signatures | Upload objet store après retour réseau | Non implémenté (photoData transmise en base64 dans le payload) |

---

## 7. Design System

### Tokens de couleur (colors.ts)

Palette Material Design 3 complète :
- Couleurs primaires, secondaires, tertiaires, erreur, surface, outline, inverse.
- Alias legacy maintenus pour rétrocompatibilité (`primaire`, `succes`, `alerte`, `avertissement`).
- Token spécifiques métier : `progresEncours`, `progresRisque`, `progresDone`.

### Tokens de style (theme.ts)

- `borderRadius` : sm(4), md(8), lg(12), xl(16), full(9999)
- `spacing` : xs(4), sm(8), md(16), lg(24), xl(32)
- `fontSize` : xs(11) → display(36)
- `fontWeight` : regular → black
- `touchTarget` : minHeight/minWidth 48px (accessibilité)
- `shadow` : sm, md, lg (compatibles iOS + Android via `elevation`)

Fichiers complémentaires : `spacing.ts`, `shadows.ts` (tokens extraits).

### Composants du Design System (src/components/design-system/)

| Composant | Description |
|-----------|-------------|
| `BadgeStatut` | Badge coloré selon le statut d'un colis |
| `BandeauProgression` | Barre de progression de tournée |
| `BoutonCTA` | Bouton d'action principal |
| `CarteColis` | Carte résumé d'un colis |
| `ChipContrainte` | Chip pour les contraintes horaires |
| `ContextBannerColis` | Bandeau contextuel colis |
| `CardTypePreuve` | Carte de sélection du type de preuve |
| `SignatureGrid` | Grille de signature |
| `MiniProgressBar` | Barre de progression compacte |
| `TacticalGradient` | Dégradé tactique (fond d'écran) |
| `GlassEffectFooter` | Footer avec effet verre |
| `BandeauInstruction` | Bandeau d'instruction livreur |
| `IndicateurSync` | Indicateur de synchronisation offline |

**Composants partagés (src/components/) :**
- `ColisItem` : item de liste de colis
- `FiltreZones` : onglets de filtre par zone
- `SyncIndicator` : indicateur sync (composant legacy)
- `BandeauInstructionOverlay` : overlay d'instruction en temps réel

---

## 8. Navigation

### Pattern utilisé

La navigation est gérée par `useState` dans `App.tsx` et par le passage de fonctions de navigation entre écrans via props. Il n'y a pas de bibliothèque de navigation installée (react-navigation absent du package.json).

### Flux de navigation réel

```
App.tsx
├── [status !== 'authenticated'] → ConnexionScreen
│       └── [login réussi] → authStore.status = 'authenticated' → retour App.tsx
└── [status === 'authenticated'] → ListeColisScreen
        ├── → DetailColisScreen (via prop onColisSelected)
        │       └── → CapturePreuveScreen
        │       └── → DeclarerEchecScreen
        ├── → RecapitulatifTourneeScreen (bouton clôture)
        └── → MesConsignesScreen (bouton consignes)
```

La navigation entre écrans s'effectue par rendu conditionnel dans ListeColisScreen (qui maintient un état `currentScreen`). Ce pattern est fonctionnel pour le MVP mais ne supporte pas le bouton "retour" natif Android ni la navigation par pile (back stack).

---

## 9. Tests

### Types de tests présents

| Type | Fichiers | Couverture |
|------|----------|-----------|
| Tests domaine purs | `offlineQueue.test.ts`, `filtreZone.domain.test.ts`, `authStore.test.ts` | offlineQueue (enqueue, sync, idempotence), filtreZone, authStore (login, logout, refresh) |
| Tests hooks | `useOfflineSync.test.ts`, `useNetworkStatus.test.ts`, `useConsignesLocales.test.ts` | Logique offline + réseau |
| Tests composants DS | `BadgeStatut`, `BandeauProgression`, `BoutonCTA`, `CarteColis`, `ChipContrainte`, `ContextBannerColis`, `CardTypePreuve`, `SignatureGrid`, `MiniProgressBar`, `TacticalGradient`, `GlassEffectFooter`, `BandeauInstruction`, `IndicateurSync` | Rendu + props |
| Tests screens | `ConnexionScreen.test.tsx` + `.US043`, `.US036`, `.US049`, `ListeColisScreen.test.tsx`, `DetailColisScreen.test.tsx`, `CapturePreuveScreen.test.tsx` + `.US046`, `DeclarerEchecScreen.test.tsx`, `RecapitulatifTourneeScreen.test.tsx`, `MesConsignesScreen.test.tsx` | Happy paths + cas erreur des écrans principaux |
| Tests application | `syncExecutor.test.ts`, `FiltreZone.test.tsx`, `SyncIndicator.test.tsx`, `BandeauInstructionOverlay.test.tsx` | Exécuteur de sync, composants |
| Tests US spécifiques | `US038.libelles.test.tsx`, `US045.hintSwipe.test.tsx`, `US045.colisItem.hint.test.tsx`, `ConnexionScreen.US043.test.tsx`, `ConnexionScreen.US036.test.tsx`, `CapturePreuveScreen.US046.test.tsx` | Tests US par acceptance criteria |
| Tests E2E | Absents | Non implémentés (Playwright non configuré) |

---

## 10. Écarts avec l'architecture cible

| Élément | Cible | Réalisé | Impact | Recommandation |
|---------|-------|---------|--------|----------------|
| React version | React 19 | React 18.2 | Faible — Concurrent Mode absent mais fonctionnement correct | Mettre à jour vers React 19 quand Expo 52+ supporté |
| Navigation | react-navigation (implicite) | useState conditionnel + props drilling | Moyen — pas de back stack Android, deep links impossibles | Intégrer react-navigation (Stack navigator) avant la mise en production |
| Offline storage | WatermelonDB (SQLite) | AsyncStorage (clé-valeur) + mémoire vive | Moyen — perte de la file offline si l'app est tuée | Migrer vers WatermelonDB ou expo-sqlite pour la persistance entre sessions |
| Background sync | react-native-background-fetch | NetInfo uniquement (sync premier plan) | Moyen — sync garantie uniquement quand l'app est au premier plan | Intégrer react-native-background-fetch pour iOS BGTaskScheduler |
| Push notifications | FCM via react-native-firebase | Absent | Élevé — les notifications push livreur ne fonctionnent pas | Implémenter react-native-firebase/messaging + enregistrement token FCM |
| Caméra | react-native-vision-camera | Absent | Moyen — US-009 (capture photo) non couverte nativement | Intégrer react-native-vision-camera ou expo-camera |
| Auth mobile → svc-supervision | Bearer token JWT | Absent (TODO dans supervisionApi.ts) | Élevé — bloquant en prod (retournerait 403) | Injecter le Bearer token dans les appels supervisionApi |
| react-native-app-auth | Installé et configuré | Référencé dans authStore.ts mais absent du package.json | Élevé — le SSO PKCE ne peut pas fonctionner en prod | Ajouter à package.json : `npx expo install react-native-app-auth` |
| @react-native-community/netinfo | Installé | Utilisé dans le code mais absent du package.json | Élevé — erreur au build natif iOS/Android | Ajouter : `npx expo install @react-native-community/netinfo` |
| Monorepo Nx/Turborepo | Packages partagés @docupost/* | Absent — chaque app est un projet isolé | Faible pour le MVP | Planifier pour R2 si partage de code web + mobile |
| Keycloak SSO | SSO corporate provisionné | Non provisionné — fake JWT en dev | Moyen | Provisionner Keycloak dev pour valider le flux PKCE complet |
| Signature pad | react-native-signature-canvas v4 | Implémenté (US-046) | Conforme | — |

---

## 11. Points d'attention

1. **Bearer token absent vers svc-supervision** : les trois endpoints `supervisionApi.ts` ne transmettent pas l'Authorization. En prod, le livreur ne pourrait pas récupérer ses instructions ni les marquer exécutées. Correction prioritaire avant livraison en production.

2. **react-native-app-auth et netinfo absents du package.json** : les dépendances sont utilisées dans le code mais non déclarées. Un `npm install` ne les installe pas. Une session de build native (iOS/Android) échouerait. Corriger en ajoutant les deux dépendances.

3. **Persistance offline entre sessions non assurée** : si le livreur ferme l'app en zone blanche avant de synchroniser, les commandes en file (offlineQueue) sont perdues (stockage en mémoire). AsyncStorage est référencé dans la documentation mais l'intégration n'est pas visible dans le code de `offlineQueue.ts`.

4. **Navigation par état conditionnel** : le modèle actuel (un seul `currentScreen` dans ListeColisScreen) ne supporte pas le bouton retour Android natif. Sur Android, appuyer sur "retour" ferme l'app plutôt que de revenir à l'écran précédent. C'est une régression UX majeure pour un usage terrain.

5. **Photos en base64 dans le payload** : `syncExecutor.ts` sérialise `photoData` directement en JSON. Les images peuvent dépasser 1 Mo, ce qui surcharge le payload JSON et peut entraîner des erreurs de taille de requête côté Spring Boot. Prévoir un upload multipart ou une URL pré-signée (S3) pour les photos.

6. **Absence de tests E2E** : Playwright n'est pas configuré. Les tests de bout en bout du flux livreur complet (connexion → liste → livraison → clôture) ne sont pas automatisés.

7. **useSwipeHint non connecté à la navigation** : le hook `useSwipeHint.ts` produit un hint visuel mais dépend du modèle de navigation actuel. Sa pertinence doit être ré-évaluée après migration vers react-navigation.
