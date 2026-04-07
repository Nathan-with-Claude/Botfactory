# US-058 — Restreindre CORS et sécuriser l'endpoint interne en production

> Feature : F-008 — Sécurisation des échanges mobile ↔ backend
> Epic : EPIC-006 — Authentification et Accès (BC-06)
> Bounded Context : BC-06 — Sécurité et Accès
> Aggregate(s) touchés : N/A (configuration infrastructure)
> Priorité : P1 — Important avant déploiement
> Complexité estimée : S
> Statut : À faire

## En tant que…

Responsable sécurité et ingénieur DevOps déployant svc-supervision en production,

## Je veux…

que la configuration CORS soit restreinte aux origines autorisées en production, et que l'endpoint inter-services `/api/supervision/internal/**` soit protégé par un mécanisme d'authentification,

## Afin de…

respecter la politique de sécurité de l'entreprise et éviter qu'un appelant externe puisse injecter de faux événements dans le read model de supervision.

## Contexte

**Écarts as-built identifiés (rapport-as-built-supervision.md, §9, points 3 et 5) :**

**CORS trop permissif :**
`allowedOriginPatterns(List.of("*"))` avec `allowCredentials(true)` est utilisé dans `SecurityConfig`. En développement c'est acceptable, mais en production, cette configuration autorise n'importe quelle origine à effectuer des requêtes avec credentials, ce qui contredit la politique same-origin et expose des vecteurs CSRF résiduels.

**Endpoint interne sans authentification :**
`/api/supervision/internal/**` est ouvert à tous (`permitAll()`) dans `SecurityConfig`. Il est protégé uniquement par le réseau interne (isolation de pods Kubernetes ou réseau Docker). Si l'API Gateway est mal configurée ou si le réseau interne est compromis, n'importe qui peut POSTer sur cet endpoint et injecter des événements arbitraires dans le read model BC-03.

**Ce qui est attendu :**
- CORS : externaliser la liste des origines autorisées dans `application-prod.yml` (via variable d'environnement `ALLOWED_ORIGINS`). La valeur par défaut dev reste `*`.
- Endpoint interne : ajouter un header de secret partagé (`X-Internal-Secret`) ou une authentification par service account. En dev, ce mécanisme est by-passé. En prod, le secret est injecté via variable d'environnement et vérifié dans un filtre ou un intercepteur.

**Invariants à respecter :**
- La configuration dev (profil `dev`) ne doit pas être impactée — CORS `*` et endpoint interne ouvert restent valides en dev.
- Le DevEventBridge (profil dev) doit continuer à appeler l'endpoint interne sans modification.
- Aucun endpoint métier ne doit être bloqué par cette restriction.

## Critères d'acceptation

**Scénario 1 — CORS restreint en prod**
- Given svc-supervision démarre avec le profil `prod` et `ALLOWED_ORIGINS=https://supervision.docupost.fr`
- When une requête OPTIONS arrive depuis `https://supervision.docupost.fr`
- Then le header `Access-Control-Allow-Origin: https://supervision.docupost.fr` est retourné
- And une requête depuis `https://externe.example.com` est rejetée (pas de header CORS)

**Scénario 2 — CORS permissif conservé en dev**
- Given svc-supervision démarre avec le profil `dev`
- When une requête OPTIONS arrive depuis n'importe quelle origine
- Then le comportement actuel est préservé (toutes origines acceptées)

**Scénario 3 — Endpoint interne protégé en prod**
- Given svc-supervision tourne en prod avec `INTERNAL_SECRET=secret-abc-123`
- When svc-tournee appelle `POST /api/supervision/internal/vue-tournee/events` avec le header `X-Internal-Secret: secret-abc-123`
- Then la requête est acceptée et l'événement traité

**Scénario 4 — Rejet sans secret**
- Given svc-supervision tourne en prod avec `INTERNAL_SECRET` configuré
- When un appel arrive sur `/api/supervision/internal/**` sans le header `X-Internal-Secret`
- Then la réponse est 401 ou 403

**Scénario 5 — DevEventBridge inchangé en dev**
- Given svc-supervision tourne avec le profil `dev`
- When DevEventBridge appelle l'endpoint interne
- Then l'appel est accepté sans header X-Internal-Secret (bypass du filtre en dev)

## Définition of Done

- [ ] `SecurityConfig.java` : CORS lit les origines depuis une propriété `app.cors.allowed-origins` (liste)
- [ ] `application-dev.yml` : `app.cors.allowed-origins=*`
- [ ] `application-prod.yml` : `app.cors.allowed-origins=${ALLOWED_ORIGINS}` (variable d'environnement)
- [ ] Filtre ou intercepteur ajouté pour `X-Internal-Secret` sur `/api/supervision/internal/**` en profil prod
- [ ] DevEventBridge : bypass du header en profil dev documenté
- [ ] Tests `SecurityConfig` mis à jour pour couvrir CORS restreint et secret interne
- [ ] `/livrables/00-contexte/infrastructure-locale.md` : variables d'environnement documentées

## Liens

- Rapport as-built : /livrables/04-architecture-technique/rapport-as-built-supervision.md#9-points-dattention
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
- US liée : US-020 (authentification SSO web), US-032 (synchronisation read model)
