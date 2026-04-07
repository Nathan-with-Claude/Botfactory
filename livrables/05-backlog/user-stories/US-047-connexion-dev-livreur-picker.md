# US-047 — Sélectionner un compte livreur en mode développement

## Métadonnées

| Champ | Valeur |
|---|---|
| **ID** | US-047 |
| **Feature** | BC-06 — Identité et Accès |
| **Sprint** | Sprint 6 |
| **Priorité** | Must Have (développement) |
| **Statut** | Implémenté |
| **Dépendances** | US-019 (authStore + ConnexionScreen), US-001 (ListeColisScreen) |
| **Branche** | feature/US-001 |

## User Story

**En tant que** développeur,
**je veux** pouvoir choisir quel livreur simuler depuis l'écran de connexion de l'application mobile en mode développement,
**afin de** tester les fonctionnalités de l'app mobile sans avoir besoin d'un serveur Keycloak opérationnel.

## Valeur

Accélère le cycle de développement et de test local. Permet de tester les comportements par profil livreur (ex. livreur-001 a des colis différents de livreur-003) sans infrastructure SSO.

## Critères d'acceptation

### SC1 — Affichage du sélecteur en mode dev

```gherkin
Scenario: L'écran de connexion affiche le picker en mode développement
  Given l'application est lancée avec __DEV__ === true
  When l'écran de connexion s'affiche
  Then je vois une section "MODE DEV" (testID="section-dev-mode")
  And la section contient 4 boutons livreurs :
    | testID                         | libellé affiché       |
    | btn-dev-livreur-livreur-001    | Pierre Martin         |
    | btn-dev-livreur-livreur-002    | Paul Dupont           |
    | btn-dev-livreur-livreur-003    | Marie Lambert         |
    | btn-dev-livreur-livreur-004    | Jean Moreau           |
  And chaque bouton affiche l'identifiant du livreur (ex. "livreur-001")
```

### SC2 — Absent en mode production

```gherkin
Scenario: Le picker n'est pas affiché en mode production
  Given l'application est lancée avec __DEV__ === false (ou devLivreurs=undefined)
  When l'écran de connexion s'affiche
  Then je ne vois PAS la section "section-dev-mode"
  And le bouton SSO "Connexion Docaposte" est présent normalement
```

### SC3 — Connexion via sélection d'un livreur dev

```gherkin
Scenario: Je sélectionne un compte livreur pour simuler la connexion
  Given l'écran de connexion est affiché en mode dev
  When j'appuie sur le bouton "Pierre Martin" (livreur-001)
  Then un faux JWT est créé avec sub="livreur-001" et roles=["LIVREUR"]
  And le statut du store passe à "authenticated"
  And l'écran ListeColisScreen s'affiche
```

### SC4 — livreurId utilisé dans les headers API

```gherkin
Scenario: Le livreurId du livreur sélectionné est inclus dans les appels API
  Given je me suis connecté via le picker avec "Marie Lambert" (livreur-003)
  When l'app effectue un appel API authentifié
  Then le header Authorization contient un Bearer token
  And le payload du token contient sub="livreur-003"
```

### SC5 — Accessibilité du sélecteur

```gherkin
Scenario: Les boutons livreur sont accessibles
  Given l'écran de connexion est affiché en mode dev
  Then chaque bouton livreur a un accessibilityRole="button"
  And un accessibilityLabel du type "Se connecter en tant que [Prénom] [Nom]"
```

## Design / UX

Le bloc dev est visuellement distinct de l'interface prod :
- Fond jaune pâle (#FFF9C4)
- Bordure orange (#F59E0B)
- Texte "MODE DEV" en majuscules, gras, couleur orange foncé (#92400E)
- Chaque bouton affiche le nom complet + l'identifiant technique en monospace

Le bloc est positionné **entre la card SSO et la zone principale** (au-dessus du bouton "Connexion Docaposte").

## Notes techniques

- `__DEV__` est une globale React Native — pas d'import nécessaire.
- Le faux JWT est structuré `header.payload.signature` où `payload = btoa(JSON.stringify({ sub, roles }))`.
- `decodeJwtPayload()` dans `authStore.ts` extrait correctement `sub` → `livreurId` et `roles[0]` → `role`.
- La navigation est gérée par état local dans `App.tsx` (pas de react-navigation).
- `devAuthOptions` et `devLivreurs` ne sont PAS importés en prod grâce au guard `__DEV__` dans App.tsx.
