# Scénarios de tests US-020 — Authentification SSO web

**US liée** : US-020
**Titre** : M'authentifier via mon compte Docaposte (SSO) depuis l'interface web de supervision
**Bounded Context** : BC-06 Identité et Accès
**Aggregate / Domain Event ciblé** : Aucun (Generic Subdomain — délégation SSO)
**Agent** : @qa
**Date** : 2026-03-24
**Version** : 1.0

---

### TC-210 : Affichage de la page de connexion web avec le bouton SSO

**US liée** : US-020
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : Aucun
**Type** : Fonctionnel
**Préconditions** : Frontend web supervision démarré sur http://localhost:3000
**Étapes** :
1. Naviguer vers http://localhost:3000/connexion
2. Observer l'affichage

**Résultat attendu** : La ConnexionPage affiche le bouton "Se connecter via compte Docaposte" (testID="btn-connexion-sso")
**Statut** : Passé

```gherkin
Given Laurent ouvre le navigateur sur http://localhost:3000/connexion
When la page se charge
Then le bouton "Se connecter via compte Docaposte" est visible
And aucun message d'erreur n'est affiché
And le statut de la page est "unauthenticated"
```

---

### TC-211 : Connexion SSO réussie superviseur — accès au tableau de bord W-01

**US liée** : US-020
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : Aucun (flux OAuth2 simulé en dev)
**Type** : Fonctionnel (happy path)
**Préconditions** : Backend svc-supervision en profil dev (MockJwtAuthFilter SUPERVISEUR actif)
**Étapes** :
1. Naviguer vers http://localhost:3000/connexion
2. Cliquer sur "Se connecter via compte Docaposte"
3. En mode dev, le MockJwtAuthFilter accepte avec rôle SUPERVISEUR
4. Observer la redirection

**Résultat attendu** : Laurent est redirigé vers le tableau de bord W-01 (/), la liste des tournées est affichée
**Statut** : Passé

```gherkin
Given Laurent est sur la page de connexion
When Laurent clique sur "Se connecter via compte Docaposte"
And le MockJwtAuthFilter injecte ROLE_SUPERVISEUR
Then Laurent est redirigé vers le tableau de bord W-01
And la liste des tournées du jour est affichée
```

---

### TC-212 : Invariant — rôle LIVREUR refusé sur l'interface web de supervision

**US liée** : US-020
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : SecurityConfig svc-supervision — ROLE_LIVREUR → 403
**Type** : Invariant domaine / Sécurité
**Préconditions** : Backend svc-supervision en profil dev
**Étapes** :
1. Appeler GET /api/supervision/tableau-de-bord avec un token LIVREUR
2. Vérifier la réponse

**Résultat attendu** : HTTP 403 Forbidden
**Statut** : Passé

```gherkin
Given Pierre est authentifié avec le rôle LIVREUR
When Pierre tente d'accéder à GET /api/supervision/tableau-de-bord
Then la réponse est HTTP 403 Forbidden
And le message "Accès non autorisé. Cette interface est réservée aux superviseurs." est attendu
```

---

### TC-213 : Message accès refusé affiché sur la page web pour un livreur

**US liée** : US-020
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : ConnexionPage — statut "forbidden"
**Type** : Edge case / Sécurité
**Préconditions** : Frontend web supervision, profil LIVREUR simulé
**Étapes** :
1. Naviguer vers http://localhost:3000/connexion
2. Simuler un token avec rôle LIVREUR (via interception de requête)
3. Observer le message affiché

**Résultat attendu** : Le message d'accès refusé (testID="msg-acces-refuse") est affiché
**Statut** : Passé

```gherkin
Given Pierre tente d'accéder à l'interface web avec le rôle LIVREUR
When la page de connexion traite la réponse 403
Then le message d'accès refusé (testID="msg-acces-refuse") est visible
And Pierre ne peut pas accéder au tableau de bord
```

---

### TC-214 : Session expirée — redirection vers SSO et retour sur la page d'origine

**US liée** : US-020
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : webAuthService — handleApiError 401 → retry
**Type** : Edge case
**Préconditions** : Laurent connecté, session expirée simulée
**Étapes** :
1. Simuler une réponse 401 sur un appel API superviseur
2. Observer le comportement de la page

**Résultat attendu** : La page affiche le message session expirée (testID="msg-session-expiree") et le bouton Reconnecter
**Statut** : Passé

```gherkin
Given Laurent est connecté sur l'interface web
And sa session expire (simulé via réponse 401)
When Laurent tente d'effectuer une action
Then la page affiche le message "Session expirée" (testID="msg-session-expiree")
And le bouton Reconnecter (testID="btn-reconnecter") est visible
```

---

### TC-215 : API tableau de bord accessible avec rôle SUPERVISEUR

**US liée** : US-020
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : SecurityConfig svc-supervision
**Type** : Fonctionnel
**Préconditions** : Backend svc-supervision en profil dev
**Étapes** :
1. Appeler GET /api/supervision/tableau-de-bord avec le MockJwt SUPERVISEUR
2. Vérifier la réponse

**Résultat attendu** : HTTP 200 avec les données du tableau de bord
**Statut** : Passé

```gherkin
Given Laurent est authentifié avec le rôle SUPERVISEUR
When Laurent appelle GET /api/supervision/tableau-de-bord
Then la réponse est HTTP 200
And le corps contient la liste des tournées avec leurs statuts
```

---

### TC-216 : Déconnexion web — session invalidée côté serveur

**US liée** : US-020
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : webAuthService — logout() + effacement sessionStorage
**Type** : Fonctionnel
**Préconditions** : Laurent connecté sur l'interface web
**Étapes** :
1. Cliquer sur "Déconnexion" dans le header
2. Observer la redirection et l'état de la session

**Résultat attendu** : Laurent est redirigé vers la page de connexion, le sessionStorage est effacé
**Statut** : Passé

```gherkin
Given Laurent est connecté sur l'interface web
When Laurent clique sur "Déconnexion" dans le header
Then la session web est invalidée
And Laurent est redirigé vers la page de connexion
And le sessionStorage ne contient plus de tokens JWT
```

---

### TC-217 : Non régression — API svc-supervision après introduction de SecurityConfig US-020

**US liée** : US-020
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : SecurityConfig svc-supervision
**Type** : Non régression
**Préconditions** : Backend svc-supervision en profil dev
**Étapes** :
1. Appeler GET /api/supervision/tableau-de-bord avec le token MockJwt SUPERVISEUR
2. Vérifier que les US-011 à US-014 ne sont pas régressées

**Résultat attendu** : HTTP 200 — aucun breaking change dû à US-020
**Statut** : Passé

```gherkin
Given le backend svc-supervision tourne en profil dev
When GET /api/supervision/tableau-de-bord est appelé avec MockJwt SUPERVISEUR
Then la réponse est HTTP 200
And les endpoints US-011 à US-015 restent accessibles (non régression)
```
