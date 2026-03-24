# Implémentation US-020 : M'authentifier via mon compte Docaposte (SSO) depuis l'interface web de supervision

## Contexte

US-020 : En tant que Laurent Renaud (superviseur logistique), je veux me connecter à l'interface web de supervision DocuPost via le SSO corporate Docaposte (OAuth2 Authorization Code), afin d'accéder au tableau de bord sans créer un nouveau mot de passe.

Liens :
- Spec : `/livrables/05-backlog/user-stories/US-020-authentification-sso-web.md`
- Wireframe : `/livrables/02-ux/wireframes.md#écran-w-01--tableau-de-bord-des-tournées`
- Architecture : `/livrables/04-architecture-technique/architecture-applicative.md`

## Bounded Context et couche ciblée

- **BC** : BC-06 Identité et Accès (Generic Subdomain — délégation SSO)
- **Aggregate(s) modifiés** : aucun
- **Domain Events émis** : aucun

## Décisions d'implémentation

### Application Layer
- `webAuthService.ts` : service d'authentification web OAuth2 Authorization Code.
  - `redirectToSso()` → redirige vers Keycloak avec state anti-CSRF
  - `exchangeCodeForToken()` → échange le code d'autorisation contre un JWT
  - `refreshAccessToken()` → refresh silencieux
  - `logout()` → révocation session Keycloak + redirection
  - `getAuthHeader()` → header `Authorization: Bearer`
  - `handleApiError()` → 401 → retry, 403 → forbidden
  - Stockage : tokens en sessionStorage (scope session, effacés à la fermeture)

### Infrastructure Layer
- `SecurityConfig.java` (svc-supervision) :
  - Profil `prod` : OAuth2 Resource Server activé (même pattern que svc-tournee)
  - SC2 US-020 : `ROLE_LIVREUR` refusé sur `/api/supervision/**` et `/api/planification/**`
  - SC4 US-020 : `ROLE_DSI` autorisé sur `/api/preuves/**`
  - Convertisseur JWT identique à svc-tournee
- `pom.xml` (svc-supervision) : ajout `spring-boot-starter-oauth2-resource-server`
- `application.yml` (prod) : `spring.security.oauth2.resourceserver.jwt.issuer-uri`

### Interface Layer (web)
- `ConnexionPage.tsx` :
  - Statuts : `unauthenticated`, `loading`, `forbidden`, `session-expired`, `error`
  - Bouton "Se connecter via compte Docaposte" (`testID="btn-connexion-sso"`)
  - SC2 : message accès refusé (`testID="msg-acces-refuse"`)
  - SC3 : message session expirée + bouton Reconnecter (`testID="msg-session-expiree"`, `testID="btn-reconnecter"`)
- `AuthCallbackPage.tsx` :
  - Reçoit `?code=xxx&state=yyy` depuis Keycloak
  - Échange le code via `exchangeCodeForToken()`
  - Redirige vers W-01 ou la page d'origine (SC3)
  - Validation du state anti-CSRF

### Fichiers créés/modifiés

Créés :
- `/src/web/supervision/src/auth/webAuthService.ts`
- `/src/web/supervision/src/pages/ConnexionPage.tsx`
- `/src/web/supervision/src/pages/AuthCallbackPage.tsx`
- `/src/web/supervision/src/__tests__/ConnexionPage.test.tsx`
- `/src/web/supervision/src/__tests__/webAuthService.test.ts`

Modifiés :
- `/src/backend/svc-supervision/src/main/java/com/docapost/supervision/interfaces/security/SecurityConfig.java`
- `/src/backend/svc-supervision/src/main/resources/application.yml`
- `/src/backend/svc-supervision/pom.xml`

### Erreurs / invariants préservés

- SC2 US-020 : LIVREUR refusé sur supervision → 403 (validé par SecurityConfig svc-supervision)
- SC4 US-020 : DSI accède aux preuves → audit RGPD (TODO : AuditLogger Sprint 4 quand BC-02 sera extrait)
- SC5 US-020 : `logout()` redirige vers Keycloak logout endpoint + efface sessionStorage
- Anti-CSRF : validation `state` dans `exchangeCodeForToken()` (rejet si state ne correspond pas)

## Commandes pour lancer l'app en local

### Backend (mode dev — MockJwtAuthFilter actif)
```bash
cd src/backend/svc-supervision
JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-25.0.2.10-hotspot" mvn spring-boot:run
# Port 8082 — aucune configuration SSO nécessaire en dev
```

### Frontend web (mode dev)
```bash
cd src/web/supervision
npm start
# Port 3000 — http://localhost:3000
# Naviguer vers /connexion pour voir ConnexionPage
```

### Tests unitaires
```bash
cd src/web/supervision
npx react-scripts test --watchAll=false --testPathPattern="ConnexionPage|webAuthService"
```

## URLs pour tester manuellement

- Interface supervision : http://localhost:3000
- Page connexion : http://localhost:3000/connexion
- Callback OAuth2 : http://localhost:3000/auth/callback

## Instructions pour les tests manuels

1. Lancer le backend svc-supervision (profil dev — MockJwtAuthFilter active ROLE_SUPERVISEUR)
2. Lancer le frontend web
3. Accéder à http://localhost:3000/connexion
4. Vérifier l'affichage du bouton "Se connecter via compte Docaposte"
5. En mode dev, MockJwtAuthFilter accepte sans SSO réel — naviguer vers http://localhost:3000

Pour tester le flux SSO complet (profil prod) :
- Configurer `SSO_ISSUER_URI` et `REACT_APP_SSO_ISSUER` vers un Keycloak dev
- La page redirectionnera vers Keycloak, puis reviendra sur `/auth/callback`

## Tests

### Tests unitaires web (15 tests)
- `src/web/supervision/src/__tests__/ConnexionPage.test.tsx` : 7 tests (SC1, SC2, SC3, SC5, loading)
- `src/web/supervision/src/__tests__/webAuthService.test.ts` : 8 tests (redirectToSso, exchangeCodeForToken, handleApiError, getCurrentUser)

**Totaux** : 15 tests US-020 + 60 tests existants = 75 tests web verts.
