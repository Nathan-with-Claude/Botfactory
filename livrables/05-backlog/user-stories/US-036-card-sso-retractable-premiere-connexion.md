# US-036 : Card SSO rétractable après la première connexion

## Contexte métier

Les livreurs ouvrent l'application chaque matin pour démarrer leur tournée. L'écran de connexion M-01 affiche une card bleue "Comment ça fonctionne ?" explicative du flux SSO. Pour un utilisateur récurrent, cette card encombre l'accès au bouton de connexion principal.

## User Story

**En tant que** livreur ayant déjà utilisé l'application,
**Je veux que** la card explicative SSO soit automatiquement repliée à l'ouverture,
**Afin de** accéder plus rapidement au bouton de connexion.

## Critères d'acceptation

- **CA-1** : Première ouverture — la card "Comment ça fonctionne ?" est visible et dépliée.
- **CA-2** : Après la première connexion réussie — `hasConnectedOnce = true` est stocké en AsyncStorage.
- **CA-3** : Ouvertures suivantes — la card est repliée par défaut (seul le header + chevron restent visibles).
- **CA-4** : Le livreur peut déplier/replier la card à tout moment via un chevron.
- **CA-5** : La préférence manuelle (dépliée/repliée) est persistée dans AsyncStorage (clé `cardSsoOuverte`).
- **CA-6** : Le bouton "Connexion Docaposte" reste toujours accessible, card ouverte ou fermée.

## Contraintes techniques

- AsyncStorage : `@react-native-async-storage/async-storage` (mock via `moduleNameMapper` Jest).
- Clés AsyncStorage utilisées :
  - `hasConnectedOnce` : `'true'` après la première connexion réussie.
  - `cardSsoOuverte` : `'true'` ou `'false'` pour la préférence manuelle.
- Ne pas modifier le comportement de navigation ou d'authentification (US-019 non-régression).

## Périmètre

- **In scope** : ConnexionScreen M-01 (mobile).
- **Out of scope** : Animations de dépliage, design system complet (US-026).

## Priorité / Sprint

- Sprint 4 — amélioration ergonomique livreur.
- Taille : XS (1 point).

## Bounded Context

BC-06 — Identité et Accès (écran de connexion).
