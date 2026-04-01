# Implémentation US-APP-routing : Routeur React — Interface Supervision

## Contexte

L'interface web supervision (`src/web/supervision/`) possédait 8 pages React complètes
mais `App.tsx` ne rendait que `<TableauDeBordPage />` sans aucune navigation.
Résultat : aucune route fonctionnelle, pas de page de connexion accessible, pas de
section planification ni de détail de tournée.

Cette tranche verticale branche toutes les pages via un routeur maison basé sur
`useState` (pas de `react-router-dom` — absent de `package.json`).

Liens :
- `src/web/supervision/src/App.tsx` — routeur implémenté
- `src/web/supervision/src/__tests__/App.test.tsx` — 13 tests TDD

## Bounded Context et couche ciblée

- **BC** : BC-03 Supervision + BC-06 Auth + BC-07 Planification (interface unifiée)
- **Aggregate(s) modifiés** : aucun (couche Interface uniquement)
- **Domain Events émis** : aucun

## Décisions d'implémentation

### Interface Layer — App.tsx

**Mécanisme de navigation choisi : routeur maison (`useState`)**

`react-router-dom` n'est pas présent dans `package.json`. Plutôt que d'ajouter
une dépendance, on utilise un type discriminant TypeScript (`AppRoute`) qui encode
la page courante ainsi que ses paramètres obligatoires. Chaque page reçoit ses
callbacks de navigation en props — les pages elles-mêmes ne sont pas modifiées.

```typescript
export type AppRoute =
  | { page: 'connexion'; status?: ConnexionStatus; error?: string | null }
  | { page: 'tableau-de-bord' }
  | { page: 'detail-tournee'; tourneeId: string }
  | { page: 'instruction'; tourneeId: string; colisId: string }
  | { page: 'planification' }
  | { page: 'detail-tournee-planifiee'; tourneePlanifieeId: string }
  | { page: 'preuves'; colisId?: string }
  | { page: 'auth-callback' };
```

Le discriminant garantit statiquement (TypeScript) que les paramètres requis sont
présents (ex : `tourneeId` obligatoire pour `detail-tournee`).

### Routes implémentées

| Route (page) | Composant | Props de navigation injectées |
|---|---|---|
| `connexion` | `ConnexionPage` | aucune (page de sortie) |
| `tableau-de-bord` | `TableauDeBordPage` | `onVoirTournee → detail-tournee` |
| `detail-tournee` | `DetailTourneePage` | `onRetour → tableau-de-bord`, `onInstructionner → instruction` |
| `instruction` | `PanneauInstructionPage` | `onFermer → detail-tournee`, `onEnvoye → detail-tournee` |
| `planification` | `PreparationPage` | `onVoirDetail → detail-tournee-planifiee`, `onAffecter → detail-tournee-planifiee` |
| `detail-tournee-planifiee` | `DetailTourneePlanifieePage` | `onRetour → planification` |
| `preuves` | `ConsulterPreuvePage` | aucune |
| `auth-callback` | `AuthCallbackPage` | `onAuthSuccess → tableau-de-bord`, `onAuthError → connexion` |

### Layout shell

Un `NavBar` minimal (Supervision / Planification / Preuves) est affiché pour
toutes les pages "authentifiées" (hors `connexion` et `auth-callback`).
Les pages d'authentification sont rendues en plein écran (pas de shell).

### Injection de la route initiale (testabilité)

`App` accepte une prop optionnelle `routeInitiale?: AppRoute`.
En production, la route est déduite depuis `window.location` (détection du
path `/auth/callback` pour le retour SSO). En test, on injecte directement
la route souhaitée — pas de manipulation de `window.location`.

### Note sur le WebSocket STOMP (problème connu, non résolu dans cette US)

`TableauDeBordPage` et `DetailTourneePage` créent un WebSocket natif vers
`ws://localhost:8082/ws/supervision`. Or le backend Spring utilise **STOMP sur SockJS**
(endpoint `/ws/supervision` enregistré via `configureMessageBroker`). Un WebSocket
natif ne réussit pas la négociation SockJS (handshake HTTP 101 non reçu).

Conséquence observable : l'erreur WebSocket est attrapée silencieusement dans
les hooks (`ws.onerror`), le bandeau "Connexion temps réel indisponible" s'affiche,
et l'application bascule sur le polling HTTP de secours toutes les n secondes.

Les données restent fonctionnelles — seule la mise à jour temps réel est dégradée.

Résolution prévue : remplacer le `new WebSocket(url)` dans les hooks par un client
`@stomp/stompjs` (déjà dans `package.json`) + `SockJS` (idem), via la prop
`wsFactory` déjà prévue sur `TableauDeBordPage` et `DetailTourneePage`.

TODO: US-future — migrer les hooks WebSocket vers STOMP/SockJS via `wsFactory`.

## Tests

### Approche TDD

Les tests ont été écrits avant l'implémentation. Chaque page est mockée pour
isoler le routeur de leurs dépendances réseau / SSO.

### Fichiers

- `src/web/supervision/src/__tests__/App.test.tsx` — 13 cas de test

### Cas de test

| TC | Description | Résultat |
|---|---|---|
| TC-APP-01 | Route par défaut → ConnexionPage | PASS |
| TC-APP-02 | Route "connexion" → ConnexionPage | PASS |
| TC-APP-03 | Route "tableau-de-bord" → TableauDeBordPage | PASS |
| TC-APP-04 | Auth callback réussie → tableau-de-bord | PASS |
| TC-APP-05 | Clic sur tournée → DetailTourneePage (tourneeId transmis) | PASS |
| TC-APP-06 | Retour depuis DetailTourneePage → tableau-de-bord | PASS |
| TC-APP-07 | Instructionner → PanneauInstructionPage (tourneeId + colisId) | PASS |
| TC-APP-08 | Fermer PanneauInstruction → DetailTourneePage | PASS |
| TC-APP-09 | Route "planification" → PreparationPage | PASS |
| TC-APP-10 | Voir détail → DetailTourneePlanifieePage (id transmis) | PASS |
| TC-APP-11 | Retour depuis DetailTourneePlanifieePage → planification | PASS |
| TC-APP-12 | Route "preuves" → ConsulterPreuvePage | PASS |
| TC-APP-13 | Route "auth-callback" → AuthCallbackPage | PASS |

**Résultat global : 13/13 — 171/171 tests du projet supervision verts.**

## Reproduire en local

```bash
cd src/web/supervision

# Installer les dépendances (si pas fait)
npm install

# Lancer les tests
npm test -- --watchAll=false

# Démarrer l'application
npm start
# Ouvre http://localhost:3000
# Page de connexion affichée — bouton SSO redirige vers Keycloak (ou mock dev)
```

**Navigation manuelle attendue :**
1. `/` → ConnexionPage (bouton "Se connecter via compte Docaposte")
2. Après auth SSO → `/auth/callback?code=xxx&state=yyy` → AuthCallbackPage → tableau-de-bord
3. En mode dev (sans SSO) : modifier `App.tsx` — changer `resolveRouteInitiale()` pour
   retourner `{ page: 'tableau-de-bord' }` directement, ou passer `routeInitiale` depuis
   `index.tsx` pour contourner le SSO.

**Backend requis :**
- `svc-supervision` sur `localhost:8082`
- `svc-tournee` sur `localhost:8081` (pour les preuves)
- Voir `/livrables/06-dev/guide-test-local.md`
