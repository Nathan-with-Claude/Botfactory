# Implémentation US-043 : Card SSO rétractable avant connexion

## Contexte

Feedback terrain du 2026-04-01 (Pierre Morel) : US-036 a livré la card SSO rétractable
après la première connexion. Mais avant toute connexion, le bouton de réduction n'existait
pas — le livreur devait lire les explications SSO à chaque ouverture de l'application.

US-043 étend le comportement : le toggle est disponible dès la première ouverture, mais le
repliage avant connexion n'est PAS persisté en AsyncStorage (session courante uniquement).

Liens :
- Spec : `/livrables/05-backlog/user-stories/US-043-card-sso-retractable-avant-connexion.md`
- Wireframe : `/livrables/02-ux/wireframes.md#M-01`
- US prérequis : US-036 (card SSO rétractable après connexion), US-019 (auth SSO mobile)

## Bounded Context et couche ciblée

- **BC** : BC-06 Authentification et Accès
- **Aggregate(s) modifiés** : PreferenceUtilisateur (Read Model local AsyncStorage)
- **Domain Events émis** : aucun

## Décisions d'implémentation

### Interface Layer — Frontend Mobile

**Fichier modifié** : `src/mobile/src/screens/ConnexionScreen.tsx`

1. **Ajout du state `dejaConnecte`** :
   - Type : `boolean`, initialisé à `false`.
   - Chargé depuis AsyncStorage au montage (en parallèle des autres préférences, via le
     `useEffect` existant).
   - Stocke la valeur de `hasConnectedOnce` pour que `toggleCard` y ait accès.

2. **Modification de `toggleCard`** :
   - Avant (US-036) : toujours écrire `cardSsoOuverte` en AsyncStorage.
   - Après (US-043) : écrire `cardSsoOuverte` en AsyncStorage UNIQUEMENT si `dejaConnecte=true`.
   - Si `dejaConnecte=false` (avant première connexion) : state local uniquement, sans I/O.

3. **Invariant US-036 préservé** :
   - La persistance `cardSsoOuverte` continue de fonctionner pour les utilisateurs déjà
     connectés (`hasConnectedOnce=true`).
   - `hasConnectedOnce` est toujours écrit à `true` après connexion réussie.

**Test US-036-SC5 mis à jour** :
- Avant : testait la persistance de `cardSsoOuverte` après repli manuel avec
  `hasConnectedOnce=null` (première ouverture) — ce comportement est maintenant invalide
  selon US-043.
- Après : le test simule `hasConnectedOnce=true` (utilisateur déjà connecté), effectue
  deux toggles (étendre + replier) et vérifie que le dernier setItem pour `cardSsoOuverte`
  est `'false'`. Le comportement US-036 reste correct pour les utilisateurs connectés.

### Erreurs / invariants préservés

- Le bouton de connexion (`btn-connexion-sso`) reste accessible en permanence, que la
  card soit ouverte ou repliée.
- Le chevron indique l'état (`▲` si ouverte, `▼` si repliée) — inchangé.
- Aucune écriture AsyncStorage pour `cardSsoOuverte` lors d'un repli avant connexion.
- Après connexion, `hasConnectedOnce=true` est écrit → les ouvertures suivantes utilisent
  le comportement US-036 (persistance).

## Tests

### Types : tests unitaires Jest (TDD)

**Fichier créé** : `src/mobile/src/__tests__/ConnexionScreen.US043.test.tsx`

10 tests couvrant les 5 scénarios de la US :

- **SC1** (2 tests) : bouton toggle présent + card ouverte par défaut à la première ouverture
- **SC2** (3 tests) : repliage immédiat, bouton SSO toujours visible, aucun setItem pour
  `cardSsoOuverte` lors d'un repli avant connexion
- **SC3** (1 test) : réouverture sans connexion → card ouverte (non persistée)
- **SC4** (1 test) : après connexion réussie, `hasConnectedOnce` écrit à `true`
- **SC5** (2 tests) : card repliée togglable, bouton toggle toujours visible

**Fichier mis à jour** : `src/mobile/src/__tests__/ConnexionScreen.US036.test.tsx`
- SC5-1 mis à jour pour simuler `hasConnectedOnce=true` (comportement post-connexion).

**Résultats** :
- 34/34 tests ConnexionScreen verts (US-019 + US-036 + US-043)
- Suite totale mobile : 315/315 → 325/325 (aucune régression)

## Commandes de lancement (tests manuels)

```bash
# Tests ConnexionScreen uniquement
cd src/mobile && npx jest --testPathPattern="ConnexionScreen" --no-coverage

# Suite mobile complète
cd src/mobile && npx jest --no-coverage
```
