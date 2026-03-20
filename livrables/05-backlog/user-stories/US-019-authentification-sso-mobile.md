# US-019 : M'authentifier via mon compte Docaposte (SSO) depuis l'application mobile

**Epic** : EPIC-006 — Authentification et Accès
**Feature** : F-017 — Connexion SSO corporate et contrôle d'accès par rôle
**Bounded Context** : BC-06 Identité et Accès
**Aggregate(s) touchés** : (Generic Subdomain — délégation SSO, pas d'agrégat propre)
**Priorité** : Must Have
**Statut** : Prête
**Complexité estimée** : S (3 points)

---

## User Story

En tant que Pierre Morel (livreur terrain),
je veux me connecter à l'application mobile DocuPost avec mon compte Docaposte existant
via le SSO corporate,
afin d'accéder à ma tournée du jour sans créer un nouveau mot de passe, en respectant
les exigences de sécurité de la DSI.

---

## Contexte

L'authentification via SSO corporate (OAuth2 PKCE) est une exigence non négociable de
M. Garnier et Mme Dubois. Aucun compte ad hoc ne peut être créé hors du référentiel
Docaposte. Le flux OAuth2 PKCE est standard pour les applications mobiles natives.
L'application utilise react-native-app-auth. Le token JWT obtenu est consommé par tous
les services backend pour identifier Pierre et son rôle (LIVREUR).

**Invariants à respecter** :
- Seul le SSO corporate Docaposte est autorisé comme fournisseur d'identité. Aucun
  autre mode d'authentification n'est accepté.
- Le rôle "livreur" donne accès uniquement à l'application mobile (pas à l'interface web
  de supervision).
- Les tokens JWT expirent et sont renouvelés de façon transparente (refresh token).
- Conformité RGPD : aucune donnée d'identité n'est stockée localement au-delà de la
  session (sauf le token de refresh sécurisé).

---

## Critères d'acceptation (Gherkin)

### Scénario 1 : Connexion SSO réussie depuis l'application mobile

```gherkin
Given Pierre ouvre l'application DocuPost sur son mobile Android
And Pierre est sur l'écran M-01 (Authentification)
When Pierre appuie sur "Se connecter via compte Docaposte"
And Pierre saisit ses identifiants sur la page SSO corporate (redirection OAuth2 PKCE)
And l'authentification SSO est validée
Then un token JWT est obtenu avec le rôle = LIVREUR et l'identifiant livreurId = Pierre
And Pierre est redirigé automatiquement vers l'écran M-02 (Liste des colis)
And la tournée du jour est chargée via l'événement TournéeChargée
```

### Scénario 2 : Erreur d'authentification SSO — message clair affiché

```gherkin
Given Pierre est sur l'écran M-01 et tente de se connecter
When le SSO corporate retourne une erreur (identifiants incorrects, compte verrouillé)
Then l'application affiche "Connexion impossible. Vérifiez votre réseau ou contactez
     le support."
And un bouton "Réessayer" est disponible
And aucun token JWT n'est émis
```

### Scénario 3 : Rôle "livreur" — accès limité à l'application mobile

```gherkin
Given Pierre est authentifié avec le rôle LIVREUR
When Pierre tente d'accéder à l'interface web de supervision (W-01)
Then l'accès est refusé avec une erreur 403 Forbidden
And Pierre est redirigé vers l'application mobile
```

### Scénario 4 : Renouvellement automatique du token JWT

```gherkin
Given Pierre est connecté et son token JWT est sur le point d'expirer
When le token arrive à expiration pendant l'utilisation de l'application
Then le refresh token est utilisé automatiquement pour obtenir un nouveau token JWT
And Pierre ne perçoit aucune interruption dans son utilisation de l'application
And la tournée en cours reste accessible sans reconnexion manuelle
```

### Scénario 5 : Déconnexion explicite

```gherkin
Given Pierre est connecté à l'application mobile
When Pierre accède au menu et clique sur "Déconnexion"
Then le token JWT et le refresh token sont invalidés
And Pierre est redirigé vers l'écran M-01
And aucune donnée personnelle de session n'est conservée localement
```

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#écran-m-01--authentification
- Parcours : /livrables/02-ux/user-journeys.md#parcours-1--livreur--exécuter-une-tournée
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
