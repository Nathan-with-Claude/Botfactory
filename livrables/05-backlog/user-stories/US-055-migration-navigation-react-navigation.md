# US-055 — Migrer la navigation mobile vers react-navigation Stack

> Feature : F-001 — Exécution de la tournée (navigation livreur)
> Epic : EPIC-001 — Exécution de la Tournée (app mobile livreur)
> Bounded Context : BC-01 — Tournée
> Aggregate(s) touchés : Tournee (indirectement — navigation entre écrans liés à la tournée)
> Priorité : P1 — Important avant démo terrain
> Complexité estimée : M
> Statut : À faire

## En tant que…

Livreur terrain utilisant l'application mobile sur un appareil Android,

## Je veux…

que le bouton retour natif Android fonctionne correctement entre les écrans de l'application (liste colis → détail → capture preuve, etc.),

## Afin de…

ne pas quitter l'application accidentellement en appuyant sur "retour", et naviguer naturellement entre les écrans comme dans toute application mobile professionnelle.

## Contexte

**Écart as-built identifié (rapport-as-built-mobile.md, §8 et §10) :**

La navigation est actuellement gérée par un `useState` conditionnel dans `ListeColisScreen.tsx` (champ `currentScreen`) avec passage de callbacks de navigation via props. Ce pattern :
- Ne supporte pas le bouton retour Android natif (`BackHandler`) — appuyer sur retour depuis DetailColisScreen ferme l'application.
- Ne supporte pas les deep links.
- Crée un props drilling important entre écrans.
- Rend `useSwipeHint` dépendant d'un modèle de navigation fragile.

**Migration attendue :**
- Intégrer `@react-navigation/native` et `@react-navigation/stack` (ou `@react-navigation/native-stack`).
- Définir un Stack Navigator dans `App.tsx` avec les routes : `Connexion`, `ListeColis`, `DetailColis`, `CapturePreuve`, `DeclarerEchec`, `Recapitulatif`, `MesConsignes`.
- Migrer le rendu conditionnel de `ListeColisScreen` vers `navigation.navigate()`.
- Gérer le retour Android via le back stack natif (comportement par défaut de react-navigation).

**Invariants à respecter :**
- La logique métier (hooks, api, store) ne doit pas être modifiée — seule la couche navigation (interfaces layer).
- L'authStore et le flux d'authentification (ConnexionScreen → ListeColisScreen) doivent être préservés.
- Le DevDataSeeder et les livreurs de dev doivent continuer à fonctionner sans modification.

## Critères d'acceptation

**Scénario 1 — Retour Android depuis DetailColisScreen**
- Given le livreur est sur DetailColisScreen (après avoir navigué depuis ListeColisScreen)
- When il appuie sur le bouton retour Android natif
- Then l'application revient à ListeColisScreen (pas de fermeture de l'app)

**Scénario 2 — Retour Android depuis CapturePreuveScreen**
- Given le livreur est sur CapturePreuveScreen
- When il appuie sur le bouton retour Android natif
- Then l'application revient à DetailColisScreen

**Scénario 3 — Navigation vers MesConsignesScreen**
- Given le livreur est sur ListeColisScreen
- When il appuie sur le bouton "Mes consignes"
- Then MesConsignesScreen s'affiche
- And le retour Android ramène à ListeColisScreen

**Scénario 4 — Flux d'authentification préservé**
- Given le livreur n'est pas authentifié
- When il ouvre l'application
- Then ConnexionScreen s'affiche
- And après connexion réussie, l'événement AuthenticationSucceeded redirige vers ListeColisScreen
- And le bouton retour depuis ListeColisScreen ne revient pas à ConnexionScreen (pile purgée)

**Scénario 5 — Tests screens existants toujours passants**
- Given la migration react-navigation est appliquée
- When on exécute la suite de tests Jest
- Then les tests de tous les écrans (`ListeColisScreen.test.tsx`, `DetailColisScreen.test.tsx`, etc.) passent
- And les wrappers de test utilisent `NavigationContainer` de react-navigation

## Définition of Done

- [ ] `@react-navigation/native`, `@react-navigation/native-stack` (ou stack) déclarés dans `package.json`
- [ ] Stack Navigator défini dans `App.tsx` avec toutes les routes
- [ ] `ListeColisScreen.tsx` : état `currentScreen` supprimé, navigation via `navigation.navigate()`
- [ ] Retour Android fonctionnel sur tous les écrans (testé sur émulateur Android)
- [ ] Tests Jest des écrans mis à jour (wrapper `NavigationContainer`)
- [ ] `useSwipeHint` réévalué et adapté si nécessaire
- [ ] Aucune régression fonctionnelle sur les flux de livraison, échec, clôture

## Liens

- Rapport as-built : /livrables/04-architecture-technique/rapport-as-built-mobile.md#8-navigation
- Wireframes : /livrables/02-ux/wireframes.md
- Parcours : /livrables/02-ux/user-journeys.md
