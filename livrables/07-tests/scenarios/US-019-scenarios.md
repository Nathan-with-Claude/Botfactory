# Scénarios de tests US-019 — Authentification SSO mobile

**US liée** : US-019
**Titre** : M'authentifier via mon compte Docaposte (SSO) depuis l'application mobile
**Bounded Context** : BC-06 Identité et Accès
**Aggregate / Domain Event ciblé** : Aucun (Generic Subdomain — délégation SSO)
**Agent** : @qa
**Date** : 2026-03-24
**Version** : 1.0

---

### TC-200 : Affichage de l'écran d'authentification M-01 au démarrage

**US liée** : US-019
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : Aucun (Interface Layer)
**Type** : Fonctionnel
**Préconditions** : Application mobile démarrée, utilisateur non authentifié
**Étapes** :
1. Ouvrir l'application DocuPost sur Expo Web
2. Observer l'écran initial

**Résultat attendu** : L'écran M-01 (ConnexionScreen) est affiché avec le bouton "Se connecter via compte Docaposte" visible
**Statut** : Passé

```gherkin
Given Pierre n'est pas authentifié
When Pierre ouvre l'application DocuPost
Then l'écran M-01 (Authentification) est affiché
And le bouton "Se connecter via compte Docaposte" (testID="btn-connexion-sso") est visible
And aucun spinner n'est affiché
```

---

### TC-201 : Connexion SSO réussie — redirection vers la liste des colis

**US liée** : US-019
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : Aucun (flux OAuth2 PKCE simulé en dev)
**Type** : Fonctionnel (happy path)
**Préconditions** : Backend en profil dev (MockJwtAuthFilter actif), ConnexionScreen affiché
**Étapes** :
1. Afficher ConnexionScreen
2. Appuyer sur le bouton "Se connecter via compte Docaposte"
3. En mode dev, le MockJwtAuthFilter accepte sans SSO réel
4. Observer la navigation

**Résultat attendu** : Pierre est redirigé vers l'écran M-02 (ListeColisScreen), la tournée du jour est chargée
**Statut** : Passé

```gherkin
Given Pierre est sur l'écran M-01 (Authentification)
When Pierre appuie sur "Se connecter via compte Docaposte"
And le MockJwtAuthFilter (profil dev) accepte la connexion avec rôle LIVREUR
Then Pierre est redirigé vers l'écran M-02 (ListeColisScreen)
And la liste des colis de la tournée du jour est chargée
And le header contient "Authorization: Bearer mock-livreur"
```

---

### TC-202 : Spinner affiché pendant le flux SSO

**US liée** : US-019
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : Aucun
**Type** : Fonctionnel
**Préconditions** : ConnexionScreen affiché
**Étapes** :
1. Intercepter la réponse de connexion avec un délai artificiel
2. Cliquer sur le bouton de connexion
3. Observer l'état intermédiaire

**Résultat attendu** : Le spinner de connexion (testID="spinner-connexion") est visible pendant la phase d'authentification
**Statut** : Passé

```gherkin
Given Pierre est sur l'écran M-01
When Pierre appuie sur "Se connecter via compte Docaposte"
And le flux SSO est en cours (latence réseau simulée)
Then le spinner (testID="spinner-connexion") est visible
And le bouton "Se connecter" est désactivé ou masqué
```

---

### TC-203 : Erreur SSO — message et bouton Réessayer affichés

**US liée** : US-019
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : Aucun
**Type** : Edge case
**Préconditions** : ConnexionScreen affiché, SSO simulé en erreur
**Étapes** :
1. Intercepter la requête de connexion et retourner une erreur réseau
2. Cliquer sur "Se connecter via compte Docaposte"
3. Observer le message d'erreur

**Résultat attendu** : Le message "Connexion impossible. Vérifiez votre réseau ou contactez le support." est affiché, le bouton "Réessayer" est visible
**Statut** : Passé

```gherkin
Given Pierre est sur l'écran M-01
When le SSO corporate retourne une erreur (connexion interrompue simulée)
Then le message d'erreur (testID="msg-erreur-connexion") est affiché
And le bouton "Réessayer" (testID="btn-reessayer") est visible
And aucun token JWT n'est émis
And Pierre reste sur l'écran M-01
```

---

### TC-204 : Invariant — rôle LIVREUR interdit sur l'API de supervision

**US liée** : US-019
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : SecurityConfig — ROLE_LIVREUR refusé sur /api/supervision
**Type** : Invariant domaine / Sécurité
**Préconditions** : Backend svc-tournee en profil dev, MockJwtAuthFilter actif avec rôle LIVREUR
**Étapes** :
1. Appeler GET /api/supervision/tableau-de-bord avec le token mock LIVREUR
2. Vérifier la réponse HTTP

**Résultat attendu** : HTTP 403 Forbidden
**Statut** : Passé

```gherkin
Given Pierre est authentifié avec le rôle LIVREUR
When Pierre tente d'accéder à GET /api/supervision/tableau-de-bord
Then la réponse est HTTP 403 Forbidden
And l'accès à la liste des colis (/api/tournees/today) reste autorisé (200)
```

---

### TC-205 : Header Authorization Bearer injecté sur toutes les requêtes API

**US liée** : US-019
**Couche testée** : Application (httpClient)
**Aggregate / Domain Event ciblé** : Aucun (infrastructure)
**Type** : Fonctionnel
**Préconditions** : Backend en profil dev, utilisateur authentifié
**Étapes** :
1. Charger l'écran M-02 après connexion
2. Capturer les requêtes réseau vers /api/tournees/today
3. Vérifier la présence du header Authorization

**Résultat attendu** : Toutes les requêtes API incluent le header `Authorization: Bearer <token>`
**Statut** : Passé

```gherkin
Given Pierre est authentifié et sur l'écran M-02
When l'application charge la tournée du jour
Then la requête GET /api/tournees/today contient le header "Authorization: Bearer mock-livreur"
And la réponse est HTTP 200 avec les données de la tournée
```

---

### TC-206 : Déconnexion — retour à l'écran M-01 et vidage des tokens

**US liée** : US-019
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : Aucun (RGPD — vidage local)
**Type** : Fonctionnel
**Préconditions** : Pierre est connecté sur l'écran M-02
**Étapes** :
1. Naviguer vers le menu de l'application
2. Cliquer sur "Déconnexion"
3. Observer la redirection et l'état local

**Résultat attendu** : Pierre est redirigé vers M-01, les tokens sont effacés du store
**Statut** : Passé

```gherkin
Given Pierre est connecté à l'application mobile et sur l'écran M-02
When Pierre déclenche la déconnexion
Then Pierre est redirigé vers l'écran M-01 (ConnexionScreen)
And les tokens JWT et refresh token sont effacés du store authStore
And aucune donnée personnelle de session n'est conservée localement (conformité RGPD)
```

---

### TC-207 : Test unitaire — authStore.login() émet le bon token

**US liée** : US-019
**Couche testée** : Application (Store mobile)
**Aggregate / Domain Event ciblé** : authStore — extraction livreurId + role depuis JWT
**Type** : Fonctionnel
**Préconditions** : Tests Jest disponibles
**Étapes** :
1. Lancer `npx jest --testPathPattern="authStore"`
2. Vérifier que les 16 tests passent

**Résultat attendu** : 16/16 tests verts (login, refresh, logout, getAuthHeader, isTokenExpired)
**Statut** : Passé

```gherkin
Given le fichier authStore.test.ts est configuré avec un mock OAuth2
When les tests Jest sont exécutés
Then login() extrait correctement livreurId et role=LIVREUR depuis le payload JWT
And getAuthHeader() retourne "Authorization: Bearer <token>"
And logout() vide l'état local (RGPD)
And isTokenExpired() détecte correctement l'expiration sans appel réseau
```

---

### TC-208 : Non régression — API /api/tournees/today accessible après introduction de httpClient

**US liée** : US-019
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : Aucun
**Type** : Non régression
**Préconditions** : Backend en profil dev avec MockJwtAuthFilter
**Étapes** :
1. Appeler GET /api/tournees/today via l'API request Playwright
2. Vérifier que l'endpoint répond toujours 200

**Résultat attendu** : HTTP 200 avec les données de la tournée — aucun breaking change dû à US-019
**Statut** : Passé

```gherkin
Given le backend svc-tournee tourne en profil dev
When GET /api/tournees/today est appelé avec le header MockJwt
Then la réponse est HTTP 200
And le corps contient tourneeId, colis[], resteALivrer, colisTotal
And les US-001 à US-007 ne sont pas régressées
```
