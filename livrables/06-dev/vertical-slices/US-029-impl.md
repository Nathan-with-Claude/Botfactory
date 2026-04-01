# Implémentation US-029 : Swipe rapide pour déclarer un échec de livraison

## Contexte

US-029 — "Déclarer rapidement un échec de livraison par swipe gauche sur la CarteColis"
Spec : `/livrables/05-backlog/user-stories/US-029-swipe-rapide-echec-livraison.md`
Wireframe : `/livrables/02-ux/wireframes.md#M-02` (section Ecran Stitch M-02, tokens swipeThreshold/swipeActionWidth)
Dépendance : US-025 (CarteColis DS), US-005 (logique métier échec, écran M-05)
Branche : `feature/US-001`

Contexte terrain : le KPI "traitement d'un colis en moins de 45 secondes" est difficile à atteindre
sur les cas d'échec (absent, accès impossible) quand le livreur doit naviguer M-02 → M-03 → M-05.
Le swipe est un raccourci de navigation pur — il ouvre M-05 avec le colis pré-sélectionné.
Aucun événement métier n'est émis depuis le swipe lui-même.

---

## Bounded Context et couche ciblée

- **BC** : BC-01 Orchestration de Tournée (Core Domain) — couche présentation uniquement
- **Aggregate(s) modifiés** : aucun (raccourci de navigation, pas de logique métier)
- **Domain Events émis** : aucun depuis le swipe. `EchecLivraisonDeclare` est émis uniquement depuis M-05 après confirmation (invariant US-029).

---

## Décisions d'implémentation

### Domain Layer
Aucun changement. Le swipe est un raccourci de navigation UI.

### Application Layer
Aucun changement. `DeclarerEchecLivraisonHandler` (US-005) reste l'unique point de déclenchement.

### Infrastructure Layer
Aucun changement.

### Interface Layer — Backend
Aucun changement. L'endpoint `POST /api/tournees/{tourneeId}/colis/{colisId}/echec` (US-005) est réutilisé sans modification.

### Interface Layer — Frontend Mobile

#### Composant `CarteColis.tsx` enrichi (US-029)

Fichier : `src/mobile/src/components/design-system/CarteColis.tsx`

**Nouvelle prop ajoutée :**
```typescript
onSwipeEchec?: (colisId: string) => void;
```
Facultative. Si absente (ou si statut non éligible), le swipe est inactif.

**Mécanisme swipe — PanResponder natif React Native :**

`react-native-gesture-handler` et `react-native-reanimated` sont absents du projet.
Décision : utiliser `PanResponder` (API React Native standard).

Structure du rendu quand swipe actif (`statut === 'A_LIVRER'` et `onSwipeEchec` fourni) :

```
swipeWrapper (View, overflow: hidden, marginHorizontal/marginVertical externes)
├── zoneActionEchec (View absolute, right: 0, width: 80px, fond Colors.alerte)
│   └── boutonEchec (TouchableOpacity testID="bouton-swipe-echec")
│       ├── icône ✕
│       └── texte "Échec"
└── Animated.View (translateX animé, PanResponder attaché)
    └── TouchableOpacity testID="carte-colis" (contenu de la carte inchangé)
```

**Logique swipe :**
- `onMoveShouldSetPanResponder` : capture uniquement si `|dx| > |dy| * 2` (geste horizontal)
- `onPanResponderMove` : translateX limité à `[−swipeActionWidth, 0]`
- `onPanResponderRelease` :
  - `dx < −80px` → snap `spring` vers `−80px` (zone rouge révélée)
  - sinon → spring back vers `0` (annulation)
- Tap sur le bouton rouge → `resetPosition()` + appel `onSwipeEchec(colisId)`

**Constantes (conformes aux tokens Stitch M-02) :**
- `SWIPE_THRESHOLD = 80` (px)
- `SWIPE_ACTION_WIDTH = 80` (px)

**Invariant de style :**
La carte animée dans le `swipeWrapper` utilise `containerInSwipe` (marges = 0) pour éviter
le doublement des marges avec le wrapper externe.

**Statuts éligibles au swipe :**
`['A_LIVRER']` — conformément à l'invariant US-029 : LIVRE, ECHEC, A_REPRESENTER sont bloqués.

#### `ListeColisScreen.tsx` mis à jour

Fichier : `src/mobile/src/screens/ListeColisScreen.tsx`

La prop `onSwipeEchec` est passée à `CarteColis` dans `renderCarteColis` :

```typescript
onSwipeEchec={item.statut === 'A_LIVRER' ? ouvrirDeclarerEchec : undefined}
```

La garde `item.statut === 'A_LIVRER'` est redondante avec la logique interne de `CarteColis`
mais constitue une ceinture-bretelles explicite au niveau du parent.

`ouvrirDeclarerEchec(colisId)` (existant depuis US-005) navigue vers M-05 avec le colis pré-sélectionné,
et le motif "Absent" est pré-sélectionné au chargement (spec Stitch M-05 US-029 : `motif = "Absent"`).

### Erreurs / invariants préservés

| Invariant | Où appliqué | Comportement |
|---|---|---|
| EchecLivraisonDeclare émis uniquement depuis M-05 | CarteColis ne fait que naviguer | Le swipe appelle onSwipeEchec → ouvrirDeclarerEchec → M-05. L'événement domaine n'est déclenché qu'à la confirmation dans M-05. |
| Seuil anti-accidentel 80px | PanResponder.onPanResponderRelease | dx < −80px requis pour valider le snap |
| Swipe non disponible sur LIVRE / ECHEC / A_REPRESENTER | `STATUTS_SWIPABLES = ['A_LIVRER']` | Rendu sans wrapper swipe pour ces statuts |
| onSwipeEchec absente = swipe inactif | `swipeActif = STATUTS_SWIPABLES.includes(statut) && !!onSwipeEchec` | Rendu standard sans PanResponder |
| onPress conservé intact | PanResponder capturé seulement si geste horizontal | Le tap vertical déclenche normalement onPress |

---

## Tests

### Tests unitaires mobile (Jest + React Native Testing Library)

Fichier : `src/mobile/src/components/design-system/__tests__/CarteColis.test.tsx`

Approche TDD : tests écrits avant l'implémentation.

| Suite | Cas de test | Résultat |
|---|---|---|
| US-025 §3.2 (existants conservés) | 8 tests (touch target, rendu, contraintes, interaction, statuts) | PASS |
| US-029 SC1 — Zone action A_LIVRER | rend wrapper, rend bouton Echec, texte "Échec" | PASS |
| US-029 SC2 — Tap bouton Echec | appelle onSwipeEchec(colisId), exactement 1 fois | PASS |
| US-029 SC3 — Statuts terminaux | bouton absent pour LIVRE, ECHEC, A_REPRESENTER | PASS |
| US-029 SC4 — Prop facultative | pas de bouton sans onSwipeEchec, onPress conservé | PASS |
| US-029 SC5 — Wrapper conditionnel | wrapper présent si A_LIVRER+onSwipeEchec, absent si LIVRE | PASS |
| US-029 SC6 — Accessibilité | accessibilityLabel descriptif, accessibilityRole="button" | PASS |

**Total : 22 tests CarteColis (8 US-025 + 14 US-029), tous verts.**

### Tests ListeColisScreen (non-régression)

Fichier : `src/mobile/src/__tests__/ListeColisScreen.test.tsx`
13/13 tests verts — aucune régression introduite par la mise à jour de `renderCarteColis`.

### Note sur les tests de geste (PanResponder)

Les tests d'animation et de geste PanResponder (mouvement, spring, seuil) ne sont pas
testés en Jest car `Animated` est mocké en mode statique dans l'environnement de test
React Native. Ces interactions sont couvertes par les tests manuels (poste de commande).

---

## Commandes pour tester localement

### Tests unitaires CarteColis
```bash
cd src/mobile
npx jest --testPathPattern="components/design-system/__tests__/CarteColis" --passWithNoTests
```

### Démarrer l'app mobile
```bash
cd src/mobile
npx expo start
```

Application accessible sur `http://localhost:8082` (web Expo) ou via émulateur Android.

### Flux US-029 à tester manuellement
1. Charger la liste M-02 avec au moins un colis en statut `A_LIVRER`.
2. Réaliser un swipe-gauche lent sur la CarteColis (< 80px) → la carte revient (spring back).
3. Réaliser un swipe-gauche de plus de 80px → le fond rouge "Échec" apparaît, la carte reste décalée.
4. Taper sur le bouton rouge "Échec" → navigation vers M-05 (DeclarerEchecScreen) avec le colis pré-sélectionné.
5. Vérifier que le motif "Absent" est pré-sélectionné dans M-05 (spec Stitch M-05).
6. Vérifier qu'un colis LIVRE ou ECHEC ne réagit pas au swipe.

---

## Fichiers créés ou modifiés

- `src/mobile/src/components/design-system/CarteColis.tsx` — **MODIFIÉ** (ajout swipe PanResponder + prop onSwipeEchec)
- `src/mobile/src/components/design-system/__tests__/CarteColis.test.tsx` — **MODIFIÉ** (+14 tests US-029)
- `src/mobile/src/screens/ListeColisScreen.tsx` — **MODIFIÉ** (renderCarteColis passe onSwipeEchec)
- `livrables/06-dev/vertical-slices/US-029-impl.md` — **CRÉÉ** (ce fichier)
