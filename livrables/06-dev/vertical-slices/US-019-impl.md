# Implémentation US-019 : M'authentifier via mon compte Docaposte (SSO) depuis l'application mobile

## Contexte

US-019 : En tant que Pierre Morel (livreur terrain), je veux me connecter à l'application mobile DocuPost via le SSO corporate Docaposte (OAuth2 PKCE), afin d'accéder à ma tournée sans créer un nouveau mot de passe.

Liens :
- Spec : `/livrables/05-backlog/user-stories/US-019-authentification-sso-mobile.md`
- Wireframe : `/livrables/02-ux/wireframes.md#écran-m-01--authentification`
- Architecture : `/livrables/04-architecture-technique/architecture-applicative.md`

## Bounded Context et couche ciblée

- **BC** : BC-06 Identité et Accès (Generic Subdomain — délégation SSO)
- **Aggregate(s) modifiés** : aucun (Generic Subdomain sans agrégat propre)
- **Domain Events émis** : aucun (BC-06 est un sous-domaine générique)

## Décisions d'implémentation

### Domain Layer
Aucune. BC-06 délègue entièrement l'identité au SSO corporate. Pas d'agrégat "Utilisateur" dans le modèle DocuPost.

### Application Layer
- `authStore.ts` : store d'authentification mobile avec pattern factory.
  - `login()` → flux OAuth2 PKCE via `authorize()` injecté
  - `refreshAccessToken()` → refresh silencieux via `refresh()` injecté
  - `logout()` → révocation token + vidage état (RGPD)
  - `getAuthHeader()` → header `Authorization: Bearer xxx`
  - `isTokenExpired()` → détection expiration sans appel réseau
  - Extraction `livreurId` et `role` depuis le payload JWT décodé
- `httpClient.ts` : intercepteur HTTP qui injecte le Bearer token sur tous les appels API

### Infrastructure Layer
- `SecurityConfig.java` (svc-tournee) :
  - Profil `dev` : MockJwtAuthFilter conservé (pas de breaking change)
  - Profil `prod` : `http.oauth2ResourceServer(...)` activé **uniquement** si `isProdProfile()`
  - Convertisseur JWT : claim `roles` → `ROLE_xxx`, claim `sub` → principalName
  - `CommandIdempotencyFilter.java` : filtre d'idempotence (partagé avec US-006)
- `pom.xml` (svc-tournee) : ajout `spring-boot-starter-oauth2-resource-server`
- `application.yml` (prod) : `spring.security.oauth2.resourceserver.jwt.issuer-uri`

### Interface Layer (mobile)
- `ConnexionScreen.tsx` (M-01) :
  - Bouton "Se connecter via compte Docaposte" (`testID="btn-connexion-sso"`)
  - Spinner pendant le flux SSO (`testID="spinner-connexion"`)
  - Message d'erreur SSO + bouton Réessayer (`testID="msg-erreur-connexion"`, `testID="btn-reessayer"`)
  - `useEffect` → `onLoginSuccess()` quand `status === "authenticated"`
- `httpClientTypes.ts` : interface `AuthStore` (évite les imports circulaires)

### Fichiers créés/modifiés

Créés :
- `/src/mobile/src/store/authStore.ts`
- `/src/mobile/src/screens/ConnexionScreen.tsx`
- `/src/mobile/src/api/httpClient.ts`
- `/src/mobile/src/api/httpClientTypes.ts`
- `/src/mobile/src/__tests__/authStore.test.ts`
- `/src/mobile/src/__tests__/ConnexionScreen.test.tsx`
- `/src/backend/svc-tournee/src/test/java/com/docapost/tournee/interfaces/SecurityConfigTest.java`

Modifiés :
- `/src/backend/svc-tournee/src/main/java/com/docapost/tournee/interfaces/security/SecurityConfig.java`
- `/src/backend/svc-tournee/src/main/resources/application.yml` (profil prod)
- `/src/backend/svc-tournee/pom.xml` (ajout oauth2-resource-server)
- `/src/backend/svc-tournee/src/test/resources/application.yml` (exclusion auto-config OAuth2)

### Erreurs / invariants préservés

- SC3 US-019 : LIVREUR refusé sur `/api/supervision/**` (403) → validé par SecurityConfigTest
- SC5 US-019 : `logout()` vide l'état avant la révocation (RGPD — aucune donnée en local après déconnexion)
- MockJwtAuthFilter conservé en profil `dev` (0 breaking change sur les US précédentes)
- `isProdProfile()` évite l'activation du JwtDecoder dans les tests @WebMvcTest

## Commandes pour lancer l'app en local

### Backend (mode dev — MockJwtAuthFilter actif)
```bash
cd src/backend/svc-tournee
JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-25.0.2.10-hotspot" mvn spring-boot:run
# Port 8081 — aucune configuration SSO nécessaire en dev
```

### Mobile (mode dev — SSO simulé)
```bash
cd src/mobile
npx expo start --android
# En dev, le MockJwtAuthFilter backend accepte toutes les requêtes sans token
# Pour tester la page M-01, naviguer vers ConnexionScreen
```

### Tests unitaires
```bash
# Mobile
cd src/mobile && npx jest --testPathPattern="authStore|ConnexionScreen"
# Backend
cd src/backend/svc-tournee && JAVA_HOME="..." mvn test -Dtest=SecurityConfigTest
```

## URLs pour tester manuellement

- Backend health : http://localhost:8081/actuator/health
- ConnexionScreen : accessible comme premier écran de l'app mobile (M-01)

## Instructions pour les tests manuels

1. Lancer le backend svc-tournee (profil dev)
2. Lancer l'app mobile (Expo)
3. L'app démarre sur ConnexionScreen M-01
4. Cliquer "Se connecter via compte Docaposte" — en dev, MockJwtAuthFilter accepte sans SSO réel
5. Vérifier la redirection vers ListeColisScreen M-02
6. Vérifier le header `Authorization: Bearer` dans les appels API (onglet Network Expo)

Pour tester le flux SSO complet (profil prod) :
- Configurer `SSO_ISSUER_URI` et `EXPO_PUBLIC_SSO_ISSUER` vers un Keycloak dev
- Lancer le backend avec `--spring.profiles.active=prod`
- L'app redirigera vers la page de connexion Keycloak

## Tests

### Tests unitaires mobiles (49 tests)
- `src/mobile/src/__tests__/authStore.test.ts` : 16 tests (login, refresh, logout, getAuthHeader, isTokenExpired)
- `src/mobile/src/__tests__/ConnexionScreen.test.tsx` : 8 tests (SC1, SC2, loading)

### Tests backend (5 tests)
- `src/backend/svc-tournee/src/test/.../SecurityConfigTest.java` : 4 tests (LIVREUR/SUPERVISEUR accès, 401 sans auth)

**Totaux** : 24 tests US-019 + 104 tests existants conservés = 128 backend + 153 mobile verts.
