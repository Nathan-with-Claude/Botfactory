# Implémentation US-045 : Hint visuel swipe pour nouveaux utilisateurs

## Contexte

US-045 — Afficher un hint visuel de découverte du swipe pour les nouveaux utilisateurs.
Feedback terrain Pierre Morel (30/03 et 01/04) : le geste swipe gauche (US-029) est invisible.
Les livreurs ne devinent pas qu'un geste horizontal est possible sur les cartes colis.

**Différence avec le Bloquant 6 (session 01/04)** :
Le Bloquant 6 avait implémenté un hint basé sur un compteur de **sessions** (SWIPE_HINT_MAX_SESSIONS=5)
et l'incrémentait AU CHARGEMENT. US-045 spécifie un comportement plus précis :
- Compteur basé sur les **swipes réussis** (M-05 ouvert), pas sur le nombre de sessions
- Seuil : SEUIL_HINT = **3** (non 5)
- L'incrément se fait UNIQUEMENT quand M-05 s'ouvre via le swipe
- Fail-safe : si AsyncStorage indisponible → hint affiché par défaut (mieux trop que pas assez)

Source : `/livrables/05-backlog/user-stories/US-045-hint-visuel-swipe-onboarding.md`

## Bounded Context et couche ciblée

- **BC** : BC-01 Execution Tournee (Core Domain mobile)
- **Aggregate(s) modifiés** : aucun (préférence utilisateur — Read Model local AsyncStorage)
- **Domain Events émis** : aucun

## Décisions d'implémentation

### Extraction de la logique en hook (`useSwipeHint`)

Décision : extraire toute la logique du hint dans un hook dédié `useSwipeHint.ts`.

**Motivations** :
1. **Testabilité** : `renderHook` permet de tester la logique de comptage sans monter `ListeColisScreen`
   (qui est complexe à mocker — polling, websocket, consignes, etc.)
2. **Séparation des responsabilités** : `ListeColisScreen` orchestre, `useSwipeHint` décide
3. **Réutilisabilité** : si le hint est ajouté sur d'autres écrans, le hook est prêt

### Domain Layer
Aucun changement. La préférence swipeHintCount est une donnée locale (Read Model AsyncStorage),
pas un concept du domaine métier.

### Application Layer
Aucun changement.

### Infrastructure Layer
Aucun changement.

### Interface Layer — Frontend mobile

**Nouveau hook : `useSwipeHint.ts`**
- Exporte `SWIPE_HINT_SEUIL = 3` (constante configurable)
- Exporte `SWIPE_HINT_KEY = '@docupost/swipe_hint_count'` (clé AsyncStorage)
- `afficherHint` : `true` par défaut (fail-safe), mis à jour après lecture AsyncStorage
- `incrementerSwipeReussi()` : async, incrémente le compteur et masque le hint si seuil atteint

**ListeColisScreen.tsx — modifications** :
- Suppression de la logique `SWIPE_HINT_MAX_SESSIONS` / `useEffect` session
- Import et utilisation du hook `useSwipeHint`
- `afficherHintSwipe` = `useSwipeHint().afficherHint`
- `onSwipeEchec` → `ouvrirDeclarerEchecViaSwipe` (wrapper qui appelle `incrementerSwipeReussi()` avant d'ouvrir M-05)
- Distinction preservée : `ouvrirDeclarerEchec` (depuis M-03, bouton) ne déclenche PAS l'incrément

**Comportement fail-safe** :
```ts
// État initial du hook : afficherHint = true (fail-safe)
const [afficherHint, setAfficherHint] = useState(true);
// Si AsyncStorage.getItem lève une exception → setAfficherHint(true) confirmé
```

### Erreurs / invariants préservés
- Le swipe (US-029) est entièrement préservé — seule l'affordance change
- `ouvrirDeclarerEchec` (depuis M-03/M-04) ne déclenche pas l'incrément
- Incrément uniquement via `ouvrirDeclarerEchecViaSwipe` (chemin swipe uniquement)

## Tests

### Tests unitaires (hook useSwipeHint)

Fichier : `/src/mobile/src/__tests__/US045.hintSwipe.test.tsx`

**Groupe "constantes"** :
- SWIPE_HINT_SEUIL === 3
- SWIPE_HINT_KEY === '@docupost/swipe_hint_count'

**Groupe "logique affichage"** :
- SC1 : `afficherHint=true` si swipeHintCount absent (null)
- SC1b : `afficherHint=true` si swipeHintCount = "0"
- SC2a : `afficherHint=true` si swipeHintCount = "1"
- SC2b : `afficherHint=true` si swipeHintCount = "2"
- SC3 : `afficherHint=false` si swipeHintCount = "3"
- SC3b : `afficherHint=false` si swipeHintCount = "10"
- SC5 : `AsyncStorage.setItem` non appelé au montage
- SC6 : fail-safe — `afficherHint=true` si AsyncStorage.getItem lève une exception

**Groupe "incrément"** :
- SC4 : `incrementerSwipeReussi()` écrit la valeur+1 dans AsyncStorage
- SC7 : `afficherHint` passe à `false` immédiatement quand le seuil 3 est atteint
- SC4b : fail-safe — pas d'erreur si AsyncStorage.setItem échoue

13 tests, tous verts.

### Résultats de la suite totale mobile

Avant US-045 : **329/329 tests verts** (après US-038)
Après US-045 : **342/342 tests verts** (+13 nouveaux, 0 régression)

## Commandes de lancement

```bash
# Tests US-045 uniquement
cd src/mobile && npx jest --testPathPattern="US045" --no-coverage

# Suite complète mobile
cd src/mobile && npx jest --no-coverage
```

## Fichiers modifiés / créés

| Fichier | Nature du changement |
|---------|---------------------|
| `src/mobile/src/hooks/useSwipeHint.ts` | Nouveau — hook logique hint swipe |
| `src/mobile/src/screens/ListeColisScreen.tsx` | Remplacement logique sessions par useSwipeHint + ouvrirDeclarerEchecViaSwipe |
| `src/mobile/src/__tests__/US045.hintSwipe.test.tsx` | Nouveau — 13 tests TDD hook |
| `src/mobile/src/components/ColisItem.tsx` | Delta v1.3 — texte exact + position sous la carte |
| `src/mobile/src/__tests__/US045.colisItem.hint.test.tsx` | Nouveau — 4 tests TDD rendu composant |

## Delta v1.3 (2026-04-02) — Correction rendu ColisItem

Lors de la première implémentation (session 2026-04-02), le hook `useSwipeHint` était correct
mais `ColisItem.tsx` conservait encore la version Bloquant-6 du hint :
- Texte tronqué `'← Glisser'` au lieu de `'← Glissez vers la gauche pour déclarer un problème'`
- Position dans le header (en ligne avec le badge statut) au lieu de sous la carte

### Corrections appliquées

1. **Texte exact** : `'← Glisser'` → `'← Glissez vers la gauche pour déclarer un problème'`
2. **Position** : déplacement du hint hors du `header` (flexRow) vers la fin du `contenu`
   (après les contraintes), conformément au wireframe M-02 v1.3
3. **Accessibilité** : suppression de `accessibilityElementsHidden` → ajout de
   `accessibilityLabel` + `accessibilityRole="text"` pour les lecteurs d'écran

### Tests ajoutés (TDD delta)

4 tests dans `US045.colisItem.hint.test.tsx` :
- SC-RENDER-1 : texte exact conforme wireframe
- SC-RENDER-2 : hint absent si `afficherHintSwipe=false`
- SC-RENDER-3 : hint absent si colis non A_LIVRER
- SC-RENDER-4 : hint positionné hors du header (parent différent du badge statut)

### Résultats suite totale mobile

Avant delta : **342/342 tests verts**
Après delta : **352/352 tests verts** (+4 nouveaux SC-RENDER, 0 régression)
