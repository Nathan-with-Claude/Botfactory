# Scénarios de tests US-046 — Pad de trace réel pour la capture de signature numérique (M-04)

**Agent** : @qa
**Date de création** : 2026-04-03
**Dernière exécution** : 2026-04-03

---

## Synthèse d'exécution

| Suite | Niveau | Outil | Tests | Résultat |
|---|---|---|---|---|
| CapturePreuveScreen.US046.test.tsx | L1 | Jest + RNTL (React Native) | 13/13 | PASS |
| CapturePreuveScreen.test.tsx (non régression US-008/009) | L1 | Jest + RNTL | 19/19 | PASS |
| **TOTAL** | | | **32/32** | **PASS** |

**Verdict US-046** : Validée — 13/13 tests US-046 verts, 19/19 tests non régression US-008/009 verts.
Note : des warnings `act(...)` liés aux animations React Native sont présents mais non bloquants.

---

### TC-046-SC1 : Pad SignatureCanvas présent dans la section SIGNATURE

**US liée** : US-046
**Niveau** : L1
**Couche testée** : UI (React Native)
**Aggregate / Domain Event ciblé** : PreuveLivraison / PreuveCapturee
**Type** : Fonctionnel
**Préconditions** : `CapturePreuveScreen` montée en mode SIGNATURE, mock `react-native-signature-canvas` actif
**Étapes** :
1. Monter le composant avec `typePreuve: 'SIGNATURE'`
2. Rechercher un élément avec `testID="pad-signature-canvas"`
**Résultat attendu** : Le `View` conteneur du `SignatureCanvas` est présent avec les props `onOK` et `onEmpty`
**Statut** : Passé

```gherkin
Given le livreur ouvre M-04 en mode SIGNATURE
When l'écran de capture de signature est affiché
Then le pad de tracé réel (SignatureCanvas) est présent avec les callbacks onOK et onEmpty
```

---

### TC-046-SC8 : testID pad-signature-canvas présent dans la section SIGNATURE

**US liée** : US-046
**Niveau** : L1
**Couche testée** : UI (React Native)
**Aggregate / Domain Event ciblé** : aucun
**Type** : Non régression (remplacement de pad-signature par pad-signature-canvas)
**Préconditions** : Mock actif
**Étapes** :
1. Monter le composant en mode SIGNATURE
2. Vérifier la présence de `testID="pad-signature-canvas"`
**Résultat attendu** : Le testID `pad-signature-canvas` est présent
**Statut** : Passé

---

### TC-046-SC9 : Ancien pad simulé (pad-signature-simule) absent

**US liée** : US-046
**Niveau** : L1
**Couche testée** : UI (React Native)
**Aggregate / Domain Event ciblé** : aucun
**Type** : Non régression (dette US-008)
**Préconditions** : Composant monté en mode SIGNATURE
**Étapes** :
1. Rechercher `testID="pad-signature-simule"` dans le rendu
2. Vérifier qu'aucun élément ne correspond
**Résultat attendu** : L'ancien `TouchableOpacity` simulé de la dette US-008 est absent
**Statut** : Passé

```gherkin
Given la dette technique US-008 a été corrigée
When CapturePreuveScreen est rendu
Then l'ancien pad simulé (pad-signature-simule) n'existe plus dans le DOM de test
```

---

### TC-046-SC2 : Pad vide au rendu initial — bouton CONFIRMER désactivé

**US liée** : US-046
**Niveau** : L1
**Couche testée** : UI / Application
**Aggregate / Domain Event ciblé** : PreuveLivraison (invariant : signature non nulle requise)
**Type** : Invariant domaine
**Préconditions** : Composant monté sans signature
**Étapes** :
1. Monter le composant en mode SIGNATURE
2. Vérifier que le bouton CONFIRMER est désactivé (`disabled`)
**Résultat attendu** : Bouton CONFIRMER non pressable tant que `donneesSignature === null`
**Statut** : Passé

```gherkin
Given le livreur ouvre M-04 sans avoir tracé de signature
When il observe le bouton CONFIRMER
Then le bouton est désactivé
```

---

### TC-046-SC3 : Réception onOK avec base64 — bouton CONFIRMER activé

**US liée** : US-046
**Niveau** : L1
**Couche testée** : UI / Application
**Aggregate / Domain Event ciblé** : PreuveLivraison (invariant : signature non nulle)
**Type** : Fonctionnel
**Préconditions** : Composant monté, mock SignatureCanvas configuré
**Étapes** :
1. Déclencher `onOK` via `fireEvent` sur le View conteneur avec `"data:image/png;base64,abc123"`
2. Vérifier que le bouton CONFIRMER devient actif
**Résultat attendu** : Bouton CONFIRMER activé après réception d'un base64 valide
**Statut** : Passé

```gherkin
Given le livreur a tracé une signature
When le pad SignatureCanvas déclenche le callback onOK avec les données base64
Then le bouton CONFIRMER s'active
```

---

### TC-046-SC3b : onBegin déclenché — pad considéré en cours de trace

**US liée** : US-046
**Niveau** : L1
**Couche testée** : UI / Application
**Aggregate / Domain Event ciblé** : aucun
**Type** : Fonctionnel
**Préconditions** : Composant monté en mode SIGNATURE
**Étapes** :
1. Déclencher `onBegin` via `fireEvent`
2. Vérifier l'état du composant (pad en cours de trace)
**Résultat attendu** : L'état `enCoursDeTrace` est mis à jour (bouton toujours désactivé jusqu'à onOK)
**Statut** : Passé

---

### TC-046-SC4 : Effacer → clearSignature() + bouton CONFIRMER désactivé

**US liée** : US-046
**Niveau** : L1
**Couche testée** : UI / Application
**Aggregate / Domain Event ciblé** : aucun
**Type** : Fonctionnel
**Préconditions** : Signature saisie (onOK reçu), bouton CONFIRMER actif
**Étapes** :
1. Déclencher `onOK` avec données base64
2. Cliquer sur le bouton "Effacer"
3. Vérifier que `clearSignature()` du ref est appelé
4. Vérifier que le bouton CONFIRMER repasse désactivé
**Résultat attendu** : `signatureRef.current.clearSignature()` appelé, bouton désactivé
**Statut** : Passé

```gherkin
Given le livreur a tracé et validé une signature
When il clique sur "Effacer"
Then le pad est remis à zéro et le bouton CONFIRMER se désactive
```

---

### TC-046-SC7 : onEmpty déclenché → bouton CONFIRMER désactivé

**US liée** : US-046
**Niveau** : L1
**Couche testée** : UI / Application
**Aggregate / Domain Event ciblé** : PreuveLivraison (invariant)
**Type** : Edge case
**Préconditions** : Signature puis effacement par le pad lui-même (`onEmpty`)
**Étapes** :
1. Déclencher `onOK` puis `onEmpty`
2. Vérifier que le bouton CONFIRMER repasse désactivé
**Résultat attendu** : `donneesSignature` remis à `null`, bouton désactivé
**Statut** : Passé

---

### TC-046-SC5 : Confirmation transmet le base64PNG au handler

**US liée** : US-046
**Niveau** : L1
**Couche testée** : Application (contrat entre UI et ConfirmerLivraisonHandler)
**Aggregate / Domain Event ciblé** : PreuveLivraison / PreuveCapturee
**Type** : Fonctionnel
**Préconditions** : Signature saisie, mock `confirmerLivraison` espionné
**Étapes** :
1. Déclencher `onOK` avec `"data:image/png;base64,SGVsbG8="`
2. Cliquer sur CONFIRMER
3. Vérifier que `confirmerLivraison` est appelé avec `donneesSignature` non nul
**Résultat attendu** : Le base64 est transmis fidèlement au handler via `ConfirmerLivraisonRequest`
**Statut** : Passé

```gherkin
Given le livreur a tracé sa signature et clique sur CONFIRMER
When la confirmation est traitée
Then le base64PNG est transmis à ConfirmerLivraisonHandler via PreuveCapturee
```

---

### TC-046-SC6a : Aucune régression PHOTO (preuve photo toujours disponible)

**US liée** : US-046 / US-009
**Niveau** : L1
**Couche testée** : UI (React Native)
**Aggregate / Domain Event ciblé** : aucun
**Type** : Non régression
**Préconditions** : Composant monté en mode PHOTO
**Étapes** : Vérifier la présence du bouton caméra
**Résultat attendu** : Bouton caméra présent, mode PHOTO non affecté
**Statut** : Passé

---

### TC-046-SC6b : Aucune régression DEPOT_SECURISE

**US liée** : US-046 / US-009
**Niveau** : L1
**Couche testée** : UI (React Native)
**Aggregate / Domain Event ciblé** : aucun
**Type** : Non régression
**Préconditions** : Composant monté en mode DEPOT_SECURISE
**Étapes** : Vérifier la présence du champ description
**Résultat attendu** : Champ description présent, mode DEPOT non affecté
**Statut** : Passé

---

### TC-046-SC6c : Aucune régression PHOTO — bouton caméra présent

**US liée** : US-046 / US-009
**Niveau** : L1
**Couche testée** : UI (React Native)
**Aggregate / Domain Event ciblé** : aucun
**Type** : Non régression
**Préconditions** : Mode PHOTO
**Étapes** : Vérifier `testID="bouton-camera"` présent
**Résultat attendu** : Bouton caméra visible
**Statut** : Passé

---

### TC-046-SC6d : TIERS_IDENTIFIE — confirmerLivraison appelé avec nomTiers (sans signature)

**US liée** : US-046 / US-009
**Niveau** : L1
**Couche testée** : Application
**Aggregate / Domain Event ciblé** : PreuveLivraison
**Type** : Non régression
**Préconditions** : Mode TIERS_IDENTIFIE, nom tiers saisi
**Étapes** :
1. Monter en mode TIERS_IDENTIFIE
2. Saisir un nom de tiers
3. Confirmer
4. Vérifier que `confirmerLivraison` est appelé avec `nomTiers` et sans signature
**Résultat attendu** : Le contrat TIERS_IDENTIFIE est préservé
**Statut** : Passé
