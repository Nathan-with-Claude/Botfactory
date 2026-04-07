# US-051 — Injecter le Bearer token dans les appels supervisionApi

> Feature : F-008 — Sécurisation des échanges mobile ↔ backend
> Epic : EPIC-006 — Authentification et Accès (BC-06)
> Priorité : P0 — Bloquant production
> Complexité estimée : XS
> Statut : À faire

## En tant que…

Livreur authentifié sur l'application mobile,

## Je veux…

que tous mes appels vers svc-supervision (polling instructions, marquage exécuté, prise en compte) transmettent mon Bearer token JWT dans le header Authorization,

## Afin de…

pouvoir recevoir et acquitter mes instructions en production, sans recevoir de réponse 403.

## Contexte technique

**Écart as-built identifié (rapport-as-built-mobile.md, §5 et §10) :**
`supervisionApi.ts` utilise `fetch` natif sans injection du Bearer token, alors que `tourneeApi.ts` utilise correctement `createHttpClient` avec injection depuis l'`authStore`.

Le commentaire `// TODO US-019` est visible dans le code — correction attendue depuis US-019 mais non réalisée.

Les trois endpoints concernés :
- `GET /api/supervision/instructions/en-attente?tourneeId=` (polling depuis ListeColisScreen)
- `PATCH /api/supervision/instructions/{id}/executer` (depuis DetailColisScreen)
- `PATCH /api/supervision/instructions/{id}/prendre-en-compte` (depuis MesConsignesScreen)

En profil prod, svc-supervision attend un JWT valide avec le rôle `ROLE_LIVREUR`. Sans header Authorization, la réponse est 403.

**Invariants à respecter :**
- Le token JWT ne doit jamais être stocké dans AsyncStorage (invariant authStore — token en mémoire uniquement).
- Le refresh automatique doit être déclenché si le token est expiré avant l'appel.
- Les erreurs silencieuses sur le polling doivent être maintenues (ne pas bloquer le livreur sur 401 temporaire).

**Fichier à modifier :** `src/mobile/src/api/supervisionApi.ts`

## Critères d'acceptation

**Scénario 1 — Polling instructions avec token valide**
- Given le livreur est authentifié (authStore.status = 'authenticated', token valide)
- When ListeColisScreen déclenche le polling toutes les 10 secondes
- Then le header `Authorization: Bearer <token>` est présent dans la requête GET `/api/supervision/instructions/en-attente`

**Scénario 2 — Marquage exécuté avec token valide**
- Given le livreur est authentifié
- When il marque une instruction comme exécutée depuis DetailColisScreen
- Then le header `Authorization: Bearer <token>` est présent dans le PATCH `/executer`
- And la réponse est 200 (pas 403)

**Scénario 3 — Prise en compte avec token valide**
- Given le livreur est authentifié
- When il prend en compte une instruction depuis MesConsignesScreen
- Then le header `Authorization: Bearer <token>` est présent dans le PATCH `/prendre-en-compte`

**Scénario 4 — Token expiré avant appel**
- Given le livreur est authentifié mais le token a expiré
- When supervisionApi effectue un appel
- Then le refresh automatique est déclenché avant l'envoi de la requête
- And l'appel est émis avec le nouveau token

**Scénario 5 — Erreur silencieuse maintenue sur 401**
- Given le livreur est en session active
- When le polling reçoit un 401 (token révoqué côté serveur)
- Then l'erreur est loggée sans bloquer l'affichage de la liste colis

## Définition of Done

- [ ] Code implémenté : `supervisionApi.ts` utilise `createHttpClient` avec injection authStore (alignement avec `tourneeApi.ts`)
- [ ] Tests unitaires passants : mock du token vérifié dans les appels supervisionApi
- [ ] Testé en intégration locale : les 3 endpoints retournent 200 avec MockJwtAuthFilter actif en profil dev
- [ ] Aucune régression sur le polling (erreur silencieuse maintenue)

## Liens

- Rapport as-built : /livrables/04-architecture-technique/rapport-as-built-mobile.md#5-authentification-et-sécurité
- US liée : US-019 (authentification SSO mobile)
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
