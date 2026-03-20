# US-020 : M'authentifier via mon compte Docaposte (SSO) depuis l'interface web de supervision

**Epic** : EPIC-006 — Authentification et Accès
**Feature** : F-017 — Connexion SSO corporate et contrôle d'accès par rôle
**Bounded Context** : BC-06 Identité et Accès
**Aggregate(s) touchés** : (Generic Subdomain — délégation SSO, pas d'agrégat propre)
**Priorité** : Must Have
**Statut** : Prête
**Complexité estimée** : S (3 points)

---

## User Story

En tant que Laurent Renaud (responsable exploitation logistique),
je veux me connecter à l'interface web de supervision DocuPost avec mon compte Docaposte
existant via le SSO corporate,
afin d'accéder au tableau de bord des tournées sans créer un nouveau mot de passe, en
bénéficiant du niveau de sécurité corporatif.

---

## Contexte

L'interface web de supervision est accessible uniquement aux utilisateurs avec le rôle
"superviseur" ou "DSI". L'authentification se fait via le flux standard OAuth2 Authorization
Code (navigateur web). Le token JWT obtenu est transmis à l'API Gateway pour
l'autorisation sur toutes les requêtes de supervision. Sophie Dubois (DSI) peut
également accéder à cette interface avec le rôle "DSI".

**Invariants à respecter** :
- Seul le SSO corporate Docaposte est autorisé comme fournisseur d'identité.
- Le rôle "superviseur" donne accès à l'interface web W-01, W-02, W-03 et au module de
  consultation des preuves.
- Le rôle "livreur" ne donne pas accès à l'interface web de supervision.
- Les sessions web expirent après une période d'inactivité configurable.
- Conformité RGPD : journalisation des accès au module de consultation des preuves.

---

## Critères d'acceptation (Gherkin)

### Scénario 1 : Connexion SSO réussie depuis l'interface web (superviseur)

```gherkin
Given Laurent ouvre le navigateur web sur l'URL de supervision DocuPost
And Laurent est sur la page de connexion
When Laurent clique sur "Se connecter via compte Docaposte"
And Laurent s'authentifie sur la page SSO corporate (flux OAuth2 Authorization Code)
And l'authentification est validée avec le rôle = SUPERVISEUR
Then Laurent est redirigé automatiquement vers le tableau de bord W-01
And la liste des tournées du jour est affichée en temps réel
```

### Scénario 2 : Tentative d'accès d'un livreur à l'interface web

```gherkin
Given Pierre est authentifié avec le rôle LIVREUR
When Pierre tente d'accéder directement à l'URL de supervision web (W-01)
Then l'accès est refusé avec une erreur 403 Forbidden
And un message "Accès non autorisé. Cette interface est réservée aux superviseurs."
     est affiché
```

### Scénario 3 : Expiration de session — redirection vers SSO

```gherkin
Given Laurent est connecté sur l'interface web et la session expire après inactivité
When Laurent tente d'effectuer une action (ex : envoyer une instruction)
Then l'interface redirige automatiquement vers la page de connexion SSO
And après reconnexion, Laurent est redirigé vers la page sur laquelle il se trouvait
```

### Scénario 4 : Accès DSI avec rôle "DSI" au module de consultation des preuves

```gherkin
Given Sophie Dubois est authentifiée avec le rôle DSI
When Sophie accède au module de consultation des preuves
Then l'accès est autorisé
And chaque consultation est journalisée (qui a consulté, quel colis, à quelle heure)
     pour les besoins d'audit RGPD
```

### Scénario 5 : Déconnexion explicite côté web

```gherkin
Given Laurent est connecté sur l'interface web
When Laurent clique sur "Déconnexion" dans le header
Then la session web est invalidée côté serveur
And le token JWT est révoqué
And Laurent est redirigé vers la page de connexion SSO
```

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#écran-w-01--tableau-de-bord-des-tournées
- Parcours : /livrables/02-ux/user-journeys.md#parcours-2--superviseur--piloter-les-tournées-en-temps-réel
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
