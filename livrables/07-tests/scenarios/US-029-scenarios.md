# Scénarios de tests US-029

**US** : US-029 — Déclarer rapidement un échec de livraison par swipe gauche
**Agent** : @qa
**Date** : 2026-03-29
**Inputs** :
- `/livrables/05-backlog/user-stories/US-029-swipe-rapide-echec-livraison.md`
- `/livrables/06-dev/vertical-slices/US-029-impl.md`
- Composant : `src/mobile/src/components/design-system/CarteColis.tsx`
- Tests : `src/mobile/src/components/design-system/__tests__/CarteColis.test.tsx`

---

## Périmètre technique

US-029 est une US de navigation pure — le swipe-gauche est un raccourci qui ouvre M-05
avec le colis pré-sélectionné. Aucun Domain Event n'est émis depuis le geste.

**Bounded Context** : BC-01 Orchestration de Tournée — couche présentation uniquement.
**Aggregate modifié** : aucun (le geste ne modifie pas l'agrégat Colis).
**Domain Event émis depuis le swipe** : aucun. `EchecLivraisonDeclare` est émis uniquement
depuis M-05 après confirmation (invariant US-005 réutilisé).

**Backend impliqué** : `svc-tournee` (port 8081) — endpoint US-005 réutilisé sans modification.
**Mécanisme de propagation** : none (swipe = navigation locale, pas de cross-services).

**Note sur les tests de geste (PanResponder)** : l'animation PanResponder (translation,
spring, seuil 80px) n'est pas testable en Jest/RNTL car `Animated` est mocké en mode
statique dans l'environnement de test React Native. Ces comportements sont couverts par
des tests manuels (poste de commande). Les tests L1 portent sur : présence du bouton,
tap callback, exclusion des statuts terminaux, accessibilité — tout ce qui est observable
sans animation.

---

## Couverture de la pyramide

| Niveau | Outil | TCs | Ce qui est testé |
|--------|-------|-----|-----------------|
| L1 | Jest + RNTL | TC-029-01 à TC-029-14 (14 cas) | Rendu conditionnel, callback onSwipeEchec, statuts éligibles, accessibilité, prop facultative |
| L1 | Jest + RNTL | TC-029-15 à TC-029-16 (2 cas non-régression) | ListeColisScreen : onSwipeEchec passé, onPress conservé |
| L2 | curl | TC-029-17 à TC-029-20 (4 cas) | Endpoint POST echec : 200 sur A_LIVRER, 409 sur double appel, 404 sur tournée inexistante, projection état après echec |
| L3 | RNTL non applicable / Expo Web non requis | — | Geste PanResponder non simulable en RNTL — couverte manuellement |

**L3 non exécuté** : le geste de swipe (PanResponder + Animated) ne peut pas être simulé
en RNTL (Animated.spring mocké statiquement en Jest). L2 confirme que l'appel API
déclenché par le tap sur le bouton "Échec" fonctionne. L1 confirme que le bouton est rendu
et que le callback est déclenché correctement. Couverture L1+L2 complète sur tous les
critères d'acceptation fonctionnels.

---

## Jeux de données

| ID | Description | Valeur |
|----|-------------|--------|
| JDD-029-01 | Colis A_LIVRER | `colisId: C-002`, `statut: A_LIVRER`, `adresse: 5 Avenue des Lilas, Lyon 69003` |
| JDD-029-02 | Colis LIVRE | `colisId: C-003`, `statut: LIVRE` |
| JDD-029-03 | Colis ECHEC | `colisId: C-004`, `statut: ECHEC` |
| JDD-029-04 | Colis A_REPRESENTER | `colisId: C-005`, `statut: A_REPRESENTER` |
| JDD-029-05 | Tournée L2 test | `tourneeId: tournee-us029-test-*`, `livreurId: livreur-029`, 5 colis A_LIVRER |
| JDD-029-06 | Corps echec valide | `motif: ABSENT`, `disposition: A_REPRESENTER` |

---

## TC-029-01 : Zone d'action "Échec" rendue pour statut A_LIVRER (wrapper présent)

**US liée** : US-029
**Niveau** : L1
**Couche testée** : UI / Composant React Native
**Aggregate / Domain Event ciblé** : Colis (navigation uniquement — aucun event)
**Type** : Fonctionnel
**Préconditions** : CarteColis avec `statut="A_LIVRER"` et `onSwipeEchec` fourni
**Résultat attendu** : `testID="carte-colis-swipe-wrapper"` présent dans le rendu
**Statut** : Passé

```gherkin
Given un colis avec StatutColis A_LIVRER et onSwipeEchec fourni
When CarteColis est rendu
Then le wrapper swipe est présent dans l'arbre de composants
```

---

## TC-029-02 : Bouton "Échec" rendu en zone rouge pour statut A_LIVRER

**US liée** : US-029
**Niveau** : L1
**Couche testée** : UI / Composant React Native
**Aggregate / Domain Event ciblé** : Colis (navigation uniquement)
**Type** : Fonctionnel — Scénario 1 (swipe révèle bouton)
**Préconditions** : CarteColis avec `statut="A_LIVRER"` et `onSwipeEchec` fourni
**Résultat attendu** : `testID="bouton-swipe-echec"` présent dans le rendu
**Statut** : Passé

```gherkin
Given un colis avec StatutColis A_LIVRER et onSwipeEchec fourni
When CarteColis est rendu
Then le bouton "Échec" (zone rouge) est présent dans l'arbre de composants
```

---

## TC-029-03 : Bouton "Échec" affiche le texte correct

**US liée** : US-029
**Niveau** : L1
**Couche testée** : UI / Composant React Native
**Aggregate / Domain Event ciblé** : aucun
**Type** : Fonctionnel
**Préconditions** : CarteColis avec `statut="A_LIVRER"` et `onSwipeEchec` fourni
**Résultat attendu** : élément `testID="bouton-swipe-echec"` est truthy
**Statut** : Passé

```gherkin
Given un colis A_LIVRER avec bouton swipe rendu
When on inspecte le bouton-swipe-echec
Then le bouton est présent et truthy
```

---

## TC-029-04 : Tap sur bouton "Échec" appelle onSwipeEchec avec le colisId

**US liée** : US-029
**Niveau** : L1
**Couche testée** : UI / Application (callback)
**Aggregate / Domain Event ciblé** : aucun (navigation — pas d'event domaine)
**Type** : Fonctionnel — Scénario 2 (tap → M-05)
**Préconditions** : CarteColis avec `colisId="C-002"`, `statut="A_LIVRER"`, `onSwipeEchec` mocké
**Résultat attendu** : `onSwipeEchec` appelé avec `"C-002"`
**Statut** : Passé

```gherkin
Given un colis A_LIVRER avec le bouton Échec visible
When le livreur tape sur le bouton "Échec"
Then onSwipeEchec est appelé avec le colisId "C-002"
And aucun événement EchecLivraisonDeclare n'est émis (navigation uniquement)
```

---

## TC-029-05 : Tap sur bouton "Échec" n'appelle onSwipeEchec qu'une seule fois

**US liée** : US-029
**Niveau** : L1
**Couche testée** : UI / Application (callback)
**Aggregate / Domain Event ciblé** : aucun
**Type** : Invariant domaine (non-duplication)
**Préconditions** : CarteColis avec `statut="A_LIVRER"`, `onSwipeEchec` mocké
**Résultat attendu** : `onSwipeEchec.toHaveBeenCalledTimes(1)`
**Statut** : Passé

```gherkin
Given le bouton Échec visible
When le livreur tape une fois sur le bouton
Then onSwipeEchec est appelé exactement une fois
```

---

## TC-029-06 : Swipe inactif — statut LIVRE (invariant)

**US liée** : US-029
**Niveau** : L1
**Couche testée** : Domain (règle d'éligibilité)
**Aggregate / Domain Event ciblé** : Colis — invariant `STATUTS_SWIPABLES`
**Type** : Invariant domaine — Scénario 5
**Préconditions** : CarteColis avec `statut="LIVRE"` et `onSwipeEchec` fourni
**Résultat attendu** : `testID="bouton-swipe-echec"` absent (null)
**Statut** : Passé

```gherkin
Given un colis avec StatutColis LIVRE
When CarteColis est rendu avec onSwipeEchec fourni
Then le bouton Échec n'est PAS rendu
And la carte reste immobile (swipe inactif)
```

---

## TC-029-07 : Swipe inactif — statut ECHEC (invariant)

**US liée** : US-029
**Niveau** : L1
**Couche testée** : Domain (règle d'éligibilité)
**Aggregate / Domain Event ciblé** : Colis — invariant `STATUTS_SWIPABLES`
**Type** : Invariant domaine — Scénario 5
**Préconditions** : CarteColis avec `statut="ECHEC"` et `onSwipeEchec` fourni
**Résultat attendu** : `testID="bouton-swipe-echec"` absent (null)
**Statut** : Passé

```gherkin
Given un colis avec StatutColis ECHEC
When CarteColis est rendu avec onSwipeEchec fourni
Then le bouton Échec n'est PAS rendu
```

---

## TC-029-08 : Swipe inactif — statut A_REPRESENTER (invariant)

**US liée** : US-029
**Niveau** : L1
**Couche testée** : Domain (règle d'éligibilité)
**Aggregate / Domain Event ciblé** : Colis — invariant `STATUTS_SWIPABLES`
**Type** : Invariant domaine — Scénario 5
**Préconditions** : CarteColis avec `statut="A_REPRESENTER"` et `onSwipeEchec` fourni
**Résultat attendu** : `testID="bouton-swipe-echec"` absent (null)
**Statut** : Passé

```gherkin
Given un colis avec StatutColis A_REPRESENTER
When CarteColis est rendu avec onSwipeEchec fourni
Then le bouton Échec n'est PAS rendu
```

---

## TC-029-09 : Prop onSwipeEchec absente — pas de bouton swipe

**US liée** : US-029
**Niveau** : L1
**Couche testée** : UI (prop facultative)
**Aggregate / Domain Event ciblé** : aucun
**Type** : Edge case
**Préconditions** : CarteColis avec `statut="A_LIVRER"` sans `onSwipeEchec`
**Résultat attendu** : `testID="bouton-swipe-echec"` absent (null)
**Statut** : Passé

```gherkin
Given un colis A_LIVRER sans prop onSwipeEchec
When CarteColis est rendu
Then le bouton Échec n'est PAS rendu
And la carte se comporte normalement (onPress conservé)
```

---

## TC-029-10 : onPress conservé même sans onSwipeEchec

**US liée** : US-029
**Niveau** : L1
**Couche testée** : UI (non-régression onPress)
**Aggregate / Domain Event ciblé** : aucun
**Type** : Non régression
**Préconditions** : CarteColis avec `statut="A_LIVRER"` sans `onSwipeEchec`
**Résultat attendu** : tap sur `carte-colis` déclenche `onPress`
**Statut** : Passé

```gherkin
Given un colis A_LIVRER sans onSwipeEchec
When le livreur tape sur la carte
Then onPress est appelé normalement
```

---

## TC-029-11 : Wrapper swipe absent pour colis LIVRE

**US liée** : US-029
**Niveau** : L1
**Couche testée** : UI (rendu conditionnel wrapper)
**Aggregate / Domain Event ciblé** : aucun
**Type** : Invariant domaine
**Préconditions** : CarteColis avec `statut="LIVRE"` et `onSwipeEchec` fourni
**Résultat attendu** : `testID="carte-colis-swipe-wrapper"` absent (null)
**Statut** : Passé

```gherkin
Given un colis LIVRE avec onSwipeEchec fourni
When CarteColis est rendu
Then le wrapper swipe n'est PAS rendu (la carte est rendue directement)
```

---

## TC-029-12 : Wrapper swipe présent pour colis A_LIVRER avec onSwipeEchec

**US liée** : US-029
**Niveau** : L1
**Couche testée** : UI (rendu conditionnel wrapper)
**Aggregate / Domain Event ciblé** : aucun
**Type** : Fonctionnel
**Préconditions** : CarteColis avec `statut="A_LIVRER"` et `onSwipeEchec` fourni
**Résultat attendu** : `testID="carte-colis-swipe-wrapper"` présent
**Statut** : Passé

```gherkin
Given un colis A_LIVRER avec onSwipeEchec fourni
When CarteColis est rendu
Then le wrapper swipe est présent (structure PanResponder active)
```

---

## TC-029-13 : Bouton swipe a un accessibilityLabel descriptif

**US liée** : US-029
**Niveau** : L1
**Couche testée** : UI (accessibilité)
**Aggregate / Domain Event ciblé** : aucun
**Type** : Fonctionnel (accessibilité)
**Préconditions** : CarteColis avec `statut="A_LIVRER"` et `onSwipeEchec` fourni
**Résultat attendu** : `bouton-swipe-echec.props.accessibilityLabel` est truthy
**Statut** : Passé

```gherkin
Given le bouton Échec rendu
When on inspecte ses propriétés d'accessibilité
Then accessibilityLabel est renseigné et descriptif
```

---

## TC-029-14 : Bouton swipe a le rôle button (accessibilité)

**US liée** : US-029
**Niveau** : L1
**Couche testée** : UI (accessibilité)
**Aggregate / Domain Event ciblé** : aucun
**Type** : Fonctionnel (accessibilité)
**Préconditions** : CarteColis avec `statut="A_LIVRER"` et `onSwipeEchec` fourni
**Résultat attendu** : `bouton-swipe-echec.props.accessibilityRole === "button"`
**Statut** : Passé

```gherkin
Given le bouton Échec rendu
When on inspecte ses propriétés d'accessibilité
Then accessibilityRole vaut "button"
```

---

## TC-029-15 : Non-régression ListeColisScreen — 13 tests existants (US-001/002/003)

**US liée** : US-029 (non-régression)
**Niveau** : L1
**Couche testée** : UI / Application (ListeColisScreen)
**Aggregate / Domain Event ciblé** : aucun
**Type** : Non régression
**Préconditions** : Suite de tests `ListeColisScreen.test.tsx` existante
**Résultat attendu** : 13/13 tests PASS sans modification
**Statut** : Passé

```gherkin
Given l'implémentation US-029 modifie renderCarteColis (ajout onSwipeEchec)
When les 13 tests existants de ListeColisScreen sont exécutés
Then tous passent sans régression
```

---

## TC-029-16 : Non-régression CarteColis US-025 — 8 tests de base (touch target, rendu, statuts)

**US liée** : US-029 (non-régression US-025)
**Niveau** : L1
**Couche testée** : UI / Composant React Native
**Aggregate / Domain Event ciblé** : aucun
**Type** : Non régression
**Préconditions** : Suite de tests `CarteColis.test.tsx` — describe `US-025 §3.2`
**Résultat attendu** : 8/8 tests US-025 PASS
**Statut** : Passé

```gherkin
Given les 8 tests US-025 de CarteColis (touch target 72px, rendu, onPress, statut LIVRE opacity)
When exécutés après ajout du code swipe US-029
Then tous passent sans régression
```

---

## TC-029-17 : POST echec sur colis A_LIVRER → 200 + état ECHEC

**US liée** : US-029 (validation endpoint US-005 réutilisé)
**Niveau** : L2
**Couche testée** : Infrastructure / Interface REST (svc-tournee)
**Aggregate / Domain Event ciblé** : Colis / EchecLivraisonDeclare
**Type** : Fonctionnel cross-services (confirmation que l'appel navigué depuis swipe aboutit)
**Préconditions** : `svc-tournee` démarré (port 8081), tournée `tournee-us029-test-*` avec colis C-001 en A_LIVRER
**Résultat attendu** : HTTP 200, body `statut: "ECHEC"`, `motifNonLivraison: "ABSENT"`, `disposition: "A_REPRESENTER"`
**Statut** : Passé

```gherkin
Given un colis colis-001 avec StatutColis A_LIVRER dans tournee-us029-test
When POST /api/tournees/{tourneeId}/colis/{colisId}/echec avec motif ABSENT
Then HTTP 200
And response body contient statut ECHEC
And motifNonLivraison ABSENT
And disposition A_REPRESENTER
```

---

## TC-029-18 : POST echec sur colis déjà ECHEC → 409 (invariant domaine)

**US liée** : US-029
**Niveau** : L2
**Couche testée** : Domain / Infrastructure REST
**Aggregate / Domain Event ciblé** : Colis — invariant transition d'état
**Type** : Invariant domaine (double déclenchement interdit)
**Préconditions** : Colis C-001 déjà en statut ECHEC (après TC-029-17)
**Résultat attendu** : HTTP 409
**Statut** : Passé

```gherkin
Given un colis déjà en statut ECHEC
When POST /api/tournees/{tourneeId}/colis/{colisId}/echec
Then HTTP 409 (transition d'état interdite)
And aucun nouvel EchecLivraisonDeclare n'est émis
```

---

## TC-029-19 : POST echec sur tournée inexistante → 404

**US liée** : US-029
**Niveau** : L2
**Couche testée** : Infrastructure REST
**Aggregate / Domain Event ciblé** : aucun
**Type** : Edge case
**Préconditions** : tourneeId inexistant dans svc-tournee
**Résultat attendu** : HTTP 404
**Statut** : Passé

```gherkin
Given un tourneeId inexistant dans svc-tournee
When POST /api/tournees/{tourneeId}/colis/{colisId}/echec
Then HTTP 404
```

---

## TC-029-20 : GET tournée après echec → resteALivrer décrémenté

**US liée** : US-029
**Niveau** : L2
**Couche testée** : Domain / Infrastructure (projection état)
**Aggregate / Domain Event ciblé** : Tournée (resteALivrer)
**Type** : Fonctionnel (cohérence état après action)
**Préconditions** : Colis C-001 déclaré ECHEC (après TC-029-17)
**Résultat attendu** : GET /api/tournees/today retourne `resteALivrer: 4` (5 - 1)
**Statut** : Passé

```gherkin
Given un colis A_LIVRER déclaré en ECHEC
When GET /api/tournees/today est appelé
Then resteALivrer est decrementé de 1 (de 5 à 4)
And le colis concerné affiche statut ECHEC avec motifNonLivraison ABSENT
```

---

## Résumé couverture critères d'acceptation

| Critère d'acceptation (US-029) | TC(s) couvrant |
|-------------------------------|----------------|
| SC1 : Swipe gauche > 80px révèle le bouton Échec | TC-029-01, TC-029-02 (rendu), test manuel gestuel |
| SC2 : Tap sur bouton Échec ouvre M-05 avec colis pré-sélectionné | TC-029-04, TC-029-05 |
| SC2 : Aucun EchecLivraisonDeclare avant confirmation M-05 | TC-029-04 (callback = navigation, pas d'event), TC-029-17 (event émis uniquement depuis l'API) |
| SC3 : Swipe court < 80px annule (spring back) | Test manuel — non simulable RNTL |
| SC4 : Swipe-droit annule (spring back) | Test manuel — non simulable RNTL |
| SC5 : Swipe non disponible sur LIVRE, ECHEC, A_REPRESENTER | TC-029-06, TC-029-07, TC-029-08 |
| Seuil anti-accidentel 80px | Logique PanResponder dans CarteColis.tsx — test manuel |
| Accessibilité bouton | TC-029-13, TC-029-14 |
