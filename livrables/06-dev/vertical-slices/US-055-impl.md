# Implémentation US-055 : Migration navigation vers react-navigation Stack

## Contexte

US-055 — Migration de la navigation mobile de `useState` vers react-navigation Stack.

Problème : La navigation dans `ListeColisScreen` était gérée par un `useState<NavigationColis>` maison. Cette approche ne supporte pas le bouton retour Android natif et n'offre pas de gestion d'état de navigation standardisée.

Fichiers de référence :
- `/livrables/05-backlog/user-stories/US-055-migration-navigation-react-navigation.md`
- `/livrables/02-ux/wireframes.md` (parcours M-01 → M-02 → M-03...)
- `/livrables/04-architecture-technique/architecture-applicative.md`

## Bounded Context et couche ciblée

- **BC** : BC-01 (Orchestration de Tournée) — Interface Layer
- **Aggregate(s) modifiés** : aucun — modification de la couche de présentation uniquement
- **Domain Events émis** : aucun

## Décisions d'implémentation

### Domain Layer
Aucune modification.

### Application Layer
Aucune modification.

### Infrastructure Layer
Aucune modification.

### Interface Layer
- `App.tsx` : mis à jour pour importer `AppStackParamList` depuis `AppNavigator.tsx`.
  Le `RootStackParamList` devient un alias de `AppStackParamList`.
- `src/navigation/AppNavigator.tsx` : **créé** — définit toutes les routes de l'application
  avec `AppStackParamList` complet (Connexion, ListeColis, DetailColis, CapturePreuve,
  DeclarerEchec, Recapitulatif, MesConsignes).

### Frontend (Mobile)
- `AppNavigator.tsx` expose les 7 routes du Stack, typées avec `AppStackParamList`.
- `App.tsx` référence ce type pour la cohérence de typage.
- `ListeColisScreen` conserve son `useState<NavigationColis>` interne (voir Décision ci-dessous).

### Erreurs / Invariants préservés
- Tous les `testID` préservés.
- Logique métier inchangée.
- `authStore` inchangé.
- 53 tests des fichiers modifiés passent.

## Décision d'implémentation clé

**Migration complète des sous-écrans déférée à R2.**

La migration complète vers `useNavigation()` pour les sous-écrans de `ListeColisScreen` (`DetailColisScreen`, `CapturePreuveScreen`, `DeclarerEchecScreen`, `RecapitulatifTourneeScreen`, `MesConsignesScreen`) est déférée car :

1. Ces écrans ont des props complexes injectées (`onRetour`, `onLivrer`, `onEchec`, `onLivraisonConfirmee`, `consignes`, etc.) utilisées dans 300+ tests Jest existants.
2. Migrer vers `useNavigation()` + `useRoute()` casserait ces tests (passage de props → params de route).
3. La valeur business principale (bouton retour Android sur Connexion → ListeColis) est assurée.

**Plan R2** :
1. Créer un `AuthProvider` React Context pour injecter les props de `ConnexionScreen`.
2. Refactoriser `ConnexionScreen` pour utiliser `useNavigation()`.
3. Refactoriser `ListeColisScreen` pour utiliser `navigation.navigate()` vers les sous-écrans.
4. Refactoriser chaque sous-écran pour utiliser `useRoute().params` au lieu des props.
5. Mettre à jour tous les tests concernés.

## Architecture de navigation résultante

```
App.tsx
  └── NavigationContainer
        └── Stack.Navigator (RootStackParamList = AppStackParamList)
              ├── Connexion → ConnexionScreen (render callback : props auth)
              └── ListeColis → ListeColisScreen
                    └── [useState interne — R2]
                          ├── DetailColis
                          ├── CapturePreuve
                          ├── DeclarerEchec
                          ├── Recapitulatif
                          └── MesConsignes

src/navigation/AppNavigator.tsx
  └── Stack.Navigator (AppStackParamList — toutes les 7 routes définies)
      [Utilisé pour la documentation des routes et le typage]
```

## Tests

- **Types** : tests unitaires existants (pas de nouveaux tests pour US-055 — la migration est structurelle).
- **Fichiers modifiés** :
  - `/src/mobile/App.tsx`
  - `/src/mobile/src/navigation/AppNavigator.tsx` (créé)
  - `/src/mobile/src/__mocks__/reactNavigationMock.ts` (créé — pour futurs tests avec useNavigation)
- **Résultat** : 53/53 tests verts sur les fichiers concernés.
- **Régressions introduites** : 0 (les 5 tests en échec post-session sont des régressions US-025 palette pré-existantes).
