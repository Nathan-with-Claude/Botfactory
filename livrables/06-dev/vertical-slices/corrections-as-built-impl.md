# Implémentation Corrections As-Built — US-051 à US-059

## Contexte

Suite à l'analyse as-built de l'architecte technique (2026-04-04), 9 corrections
ont été identifiées et classées P0 (bloquantes prod) et P1 (importantes avant démo).
Ce document recense les corrections réalisées dans cette session.

## Résumé des corrections

| US | Priorité | Statut | Description |
|----|----------|--------|-------------|
| US-051 | P0 | FAIT | Bearer token dans supervisionApi.ts |
| US-052 | P0 | FAIT | Dépendances manquantes package.json |
| US-053 | P0 | FAIT | Correction poidsEstimeKg dans TourneePlanifiee |
| US-054 | P0 | FAIT | Provisionnement PostgreSQL dev |
| US-055 | P1 | PARTIEL | Migration navigation react-navigation (structure App.tsx) |
| US-056 | P1 | FAIT | Persistance offlineQueue via AsyncStorage |
| US-057 | P1 | DEJA-IMPL | WebSocket STOMP tableau de bord — déjà implémenté |
| US-058 | P1 | FAIT | CORS + sécurité endpoint interne |
| US-059 | P1 | FAIT | Upload photo multipart — config Spring + avertissement TODO |

---

## US-051 — Bearer token dans supervisionApi.ts

### Problème
`supervisionApi.ts` utilisait `fetch` brut sans Bearer token JWT, contrairement
à `tourneeApi.ts` qui utilise `createHttpClient` avec injection automatique du token.

### Correction
Fichier modifié : `src/mobile/src/api/supervisionApi.ts`

- Import de `createHttpClient` depuis `./httpClient`
- Import de `authStore` depuis `../store/authStoreInstance`
- Création d'une instance `{ apiFetch }` avec `baseUrl = SUPERVISION_BASE_URL`
- Remplacement de `fetch` brut par `apiFetch` sur les 3 endpoints :
  - `GET /api/supervision/instructions/en-attente`
  - `PATCH /api/supervision/instructions/{id}/executer`
  - `PATCH /api/supervision/instructions/{id}/prendre-en-compte`
- Gestion silencieuse des erreurs 401 (httpClient déclenche `logout()` automatiquement)
- Ajout d'un bloc `try/catch` sur `getInstructionsEnAttente` pour absorber les erreurs réseau

### Décisions
- Pattern identique à `tourneeApi.ts` — cohérence maximale
- Le `SUPERVISION_BASE_URL` reste séparé (`http://localhost:8082`) vs svc-tournee (`8081`)

---

## US-052 — Dépendances manquantes package.json

### Problème
`react-native-app-auth` (utilisé dans `authStore.ts` via `SSO_CONFIG`) et
`@react-native-community/netinfo` (utilisé dans `useNetworkStatus.ts`) étaient
absents du `package.json`.

### Correction
Fichier modifié : `src/mobile/package.json`

Ajout dans `dependencies` :
```json
"react-native-app-auth": "^7.1.0"
"@react-native-community/netinfo": "^11.3.1"
```

Ajout dans `jest.moduleNameMapper` :
```json
"react-native-app-auth": "<rootDir>/src/__mocks__/react-native-app-auth.ts"
"@react-native-community/netinfo": "<rootDir>/src/__mocks__/netInfoMock.ts"
```

Fichiers créés :
- `src/mobile/src/__mocks__/react-native-app-auth.ts` — mock Jest complet
- `src/mobile/src/__mocks__/netInfoMock.ts` — mock Jest avec `addEventListener`

### Versions choisies
- `react-native-app-auth@^7.1.0` : compatible Expo SDK 51 / RN 0.74
- `@react-native-community/netinfo@^11.3.1` : compatible Expo SDK 51

---

## US-053 — Correction poidsEstimeKg dans TourneePlanifiee

### Problème
Le constructeur de reconstruction à 15 paramètres (`TourneePlanifiee` sans `poidsEstimeKg`)
appelait `this(... , null)` — passant `null` pour `poidsEstimeKg`. Si ce constructeur était
utilisé pour la reconstruction, `evaluerCompatibiliteVehicule()` retournait `POIDS_ABSENT`.

**Note** : le mapper `TourneePlanifieeMapper.toDomain()` utilisait déjà le constructeur
à 16 paramètres (avec `poidsEstimeKg`) — le bug était latent mais pouvait être déclenché
si le constructeur 15-params était appelé directement.

### Correction
Fichier modifié : `src/backend/svc-supervision/.../TourneePlanifiee.java`

- Constructeur 15-params marqué `@Deprecated`
- Son implémentation redirigée vers le constructeur 16-params avec `poidsEstimeKg` en
  dernier argument (délégation correcte au lieu de `null`)

Fichier modifié : `TourneePlanifieeTest.java`

Ajout de 2 tests :
- `reconstruction_depuis_persistance_avec_poids_restitue_le_poids` — vérifie que le
  poids est bien restitué et que `evaluerCompatibiliteVehicule` retourne COMPATIBLE
- `reconstruction_depuis_persistance_sans_poids_retourne_poids_absent` — vérifie le
  comportement SC4 (POIDS_ABSENT quand poids est null)

### Résultat des tests
22 tests passent (20 existants + 2 nouveaux). BUILD SUCCESS.

---

## US-054 — Provisionnement PostgreSQL dev

### Problème
`svc-supervision` avait le driver PostgreSQL dans `pom.xml` mais aucune instance
locale provisionnée et aucun profil de configuration dédié.

### Correction
Fichiers créés :
- `src/backend/svc-supervision/docker-compose.yml` — PostgreSQL 16-alpine sur port 5432
- `src/backend/svc-supervision/src/main/resources/application-local-postgres.yml`
  — profil `local-postgres` avec connexion `jdbc:postgresql://localhost:5432/docupost_supervision`

Profil dev (H2) conservé inchangé — aucune régression.

### Usage
```bash
# Démarrer PostgreSQL
docker compose -f src/backend/svc-supervision/docker-compose.yml up -d

# Lancer l'application avec le profil PostgreSQL local
SPRING_PROFILES_ACTIVE=local-postgres mvn spring-boot:run
```

---

## US-055 — Migration navigation react-navigation Stack

### Problème
Navigation par `useState` dans `ListeColisScreen` sans support bouton retour Android.

### Correction (partielle — structure de premier niveau)
Fichiers modifiés :
- `src/mobile/package.json` — ajout de `@react-navigation/native@^6.1.17`,
  `@react-navigation/stack@^6.3.29`, `react-native-screens@~3.31.1`,
  `react-native-safe-area-context@4.10.5`
- `src/mobile/App.tsx` — `NavigationContainer` + `Stack.Navigator` avec les routes
  `Connexion` et `ListeColis`

### Limitations
La navigation par `useState` dans `ListeColisScreen` (pour les sous-écrans :
`DetailColis`, `DeclarerEchec`, `CapturePreuve`, `Recapitulatif`, `MesConsignes`)
est conservée en attendant la migration complète en R2. Les écrans n'ont pas encore
de props `navigation` typées — une migration complète risquerait de casser les tests.

### Invariants préservés
- `testID` préservés sur tous les éléments
- `authStore` inchangé
- Tous les tests Jest passent

---

## US-056 — Persistance offlineQueue via AsyncStorage

### Problème
`offlineQueue.ts` stockait les commandes en mémoire uniquement — perte au redémarrage.

### Correction
Fichier modifié : `src/mobile/src/domain/offlineQueue.ts`

- Import `AsyncStorage` depuis `@react-native-async-storage/async-storage`
- Constante `ASYNC_STORAGE_KEY = 'docupost_offline_queue'`
- Interface `OfflineQueueOptions { storage? }` pour l'injection de dépendances (tests)
- Méthode `initialize()` — charge la file depuis AsyncStorage au démarrage
- Méthode `persist()` — sérialise la file en JSON après chaque `enqueue()`
- `enqueue()` appelle `persist()` de façon asynchrone (sans bloquer l'appelant)

Fichier modifié : `src/mobile/src/hooks/useOfflineSync.ts`

- Ajout d'un `useEffect` au montage qui appelle `queue.initialize()` suivi
  de `refreshPendingCount()`

### Invariants préservés
- Idempotence par `commandId` : `initialize()` ne duplique pas les commandes déjà en mémoire
- Ordre FIFO conservé
- 409 = succès conservé dans `sync()`
- AsyncStorage injectable pour les tests (via `OfflineQueueOptions`)

---

## US-057 — WebSocket STOMP tableau de bord temps réel

### Constat
Déjà implémenté. Fichiers existants :
- `src/backend/svc-supervision/.../infrastructure/websocket/SupervisionWebSocketConfig.java`
  — configuration STOMP avec endpoint `/ws/supervision` et topic `/topic/tableau-de-bord`
- `src/backend/svc-supervision/.../interfaces/websocket/TableauDeBordBroadcaster.java`
  — broadcaster injectant `SimpMessagingTemplate`

Aucune modification nécessaire.

---

## US-058 — CORS + sécurité endpoint interne

### Problème
- CORS avec `allowedOriginPatterns("*")` hardcodé dans le code Java
- Endpoint `/api/supervision/internal/**` ouvert sans protection en prod

### Correction
Fichier modifié : `src/backend/svc-supervision/.../interfaces/security/SecurityConfig.java`

- Ajout de `@Value("${app.cors.allowed-origins:*}")` — origines externalisées
- Ajout de `@Value("${app.internal.secret:dev-secret-ignored}")` — secret interne externalisé
- `corsConfigurationSource()` utilise les valeurs injectées (plus de `"*"` hardcodé)
- `allowCredentials` désactivé automatiquement si wildcard `"*"` (contrainte Spring Security)
- Nouveau bean `InternalSecretFilter` instancié avec le secret configuré
- Filtre ajouté à la chaîne de sécurité avant `UsernamePasswordAuthenticationFilter`

Fichier créé : `.../interfaces/security/InternalSecretFilter.java`
- Filtre `OncePerRequestFilter` sur les routes `/api/supervision/internal/**`
- En dev (secret = "dev-secret-ignored") : bypass du contrôle
- En prod : vérifie le header `X-Internal-Secret`
- Retourne 403 avec body JSON si secret invalide

Fichier modifié : `src/backend/svc-supervision/src/main/resources/application.yml`

Ajout dans le profil `dev` :
```yaml
app:
  cors:
    allowed-origins: "*"
  internal:
    secret: dev-secret-ignored
```

Ajout dans le profil `prod` :
```yaml
app:
  cors:
    allowed-origins: ${ALLOWED_ORIGINS:https://supervision.docupost.fr}
  internal:
    secret: ${INTERNAL_SECRET}
```

### Résultat des tests
154 tests passent. BUILD SUCCESS.

---

## US-059 — Upload photo multipart

### Correction MVP
Fichier modifié : `src/backend/svc-supervision/src/main/resources/application.yml`

Ajout global (section commune) :
```yaml
spring:
  servlet:
    multipart:
      max-file-size: 5MB
      max-request-size: 10MB
```

Fichier modifié : `src/mobile/src/api/syncExecutor.ts`

Ajout d'un avertissement console si `photoData` dépasse ~500 Ko :
```typescript
const MAX_PHOTO_BASE64_CHARS = 667_000; // ~500 Ko binaires
if (payload.photoData && payload.photoData.length > MAX_PHOTO_BASE64_CHARS) {
  console.warn('[syncExecutor] US-059 : photoData dépasse 500 Ko...');
}
```

### TODO R2
Intégrer `react-native-image-compressor` et créer un endpoint multipart dédié
`POST /api/tournees/{id}/colis/{id}/preuve` pour les photos volumineuses.

---

## Points d'attention

1. **US-055** : la migration react-navigation est partielle. Les sous-écrans de
   `ListeColisScreen` (détail, échec, preuve, récap, consignes) sont encore gérés
   par `useState` interne. La migration complète doit être planifiée en R2.

2. **US-058** : en prod, les variables d'environnement `ALLOWED_ORIGINS` et
   `INTERNAL_SECRET` doivent être configurées dans l'infrastructure (Kubernetes secrets,
   Docker env, etc.). Ne jamais les committer en clair.

3. **US-059** : la limite `5MB` par fichier est suffisante pour des photos compressées.
   Pour les photos brutes (iPhone 15 Pro = ~5-8 Mo), la compression côté mobile est
   indispensable (prévu R2).

4. **US-056** : `initialize()` est appelé au montage du hook `useOfflineSync`. Si
   l'app est utilisée hors connexion immédiatement après démarrage, la file sera
   chargée avant la tentative de sync.

## Fichiers créés ou modifiés

### Mobile (src/mobile/)
- `src/mobile/package.json` — US-052, US-055
- `src/mobile/App.tsx` — US-055
- `src/mobile/src/api/supervisionApi.ts` — US-051
- `src/mobile/src/api/syncExecutor.ts` — US-059
- `src/mobile/src/domain/offlineQueue.ts` — US-056
- `src/mobile/src/hooks/useOfflineSync.ts` — US-056
- `src/mobile/src/__mocks__/react-native-app-auth.ts` (créé) — US-052
- `src/mobile/src/__mocks__/netInfoMock.ts` (créé) — US-052

### Backend svc-supervision (src/backend/svc-supervision/)
- `src/main/java/.../domain/planification/model/TourneePlanifiee.java` — US-053
- `src/main/java/.../interfaces/security/SecurityConfig.java` — US-058
- `src/main/java/.../interfaces/security/InternalSecretFilter.java` (créé) — US-058
- `src/main/resources/application.yml` — US-058, US-059
- `src/main/resources/application-local-postgres.yml` (créé) — US-054
- `docker-compose.yml` (créé) — US-054
- `src/test/java/.../domain/planification/TourneePlanifieeTest.java` — US-053
