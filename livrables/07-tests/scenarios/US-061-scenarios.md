# Scénarios de tests US-061 : Brancher react-native-signature-canvas dans CapturePreuveScreen

**Agent** : @qa
**Date** : 2026-04-05
**US** : US-061 — Brancher react-native-signature-canvas dans CapturePreuveScreen (M-04)
**Bounded Context** : BC-02 Preuve de Livraison (mobile — CapturePreuveScreen)
**Priorité** : P0 — Bloquant légal

---

## Récapitulatif des TC

| TC | Titre | Niveau | Statut |
|----|-------|--------|--------|
| TC-061-01 | pad-signature-canvas présent (composant réel) | L1 | Passé |
| TC-061-02 | Bouton CONFIRMER désactivé si onEmpty=true | L1 | Passé |
| TC-061-03 | onOK(base64) active le bouton CONFIRMER | L1 | Passé |
| TC-061-04 | Bouton Effacer → clearSignature() → CONFIRMER désactivé | L1 | Passé |
| TC-061-05 | Signature base64 transmise à confirmerLivraison() | L1 | Passé |
| TC-061-06 | Aucune régression TIERS_IDENTIFIE, DEPOT_SECURISE, PHOTO | L1 | Passé |

---

### TC-061-01 : pad-signature-canvas présent

**Niveau** : L1 | **Type** : Invariant (SC1)

```gherkin
Given CapturePreuveScreen avec type SIGNATURE sélectionné
When M-04 est affiché
Then pad-signature-canvas est présent dans le DOM (testID sur le conteneur View)
And aucun TouchableOpacity simulé n'est présent dans la zone signature
```

**Statut** : Passé

---

### TC-061-02 : Bouton CONFIRMER désactivé si pad vide

**Niveau** : L1 | **Type** : Invariant domaine (SC2)

```gherkin
Given CapturePreuveScreen affiché avec pad SignatureCanvas
And aucun tracé n'a été effectué (onEmpty initial)
When M-04 est affiché
Then bouton-confirmer-livraison est disabled
And le livreur ne peut pas déclencher la validation
```

**Statut** : Passé

---

### TC-061-03 : onOK(base64) active le bouton CONFIRMER

**Niveau** : L1 | **Type** : Fonctionnel (SC3)

```gherkin
Given pad-signature-canvas est affiché
When le mock readSignature() est appelé (onOK avec valeur base64 mock)
Then donneesSignature passe à la valeur base64 mock
And bouton-confirmer-livraison devient actif
```

**Statut** : Passé

---

### TC-061-04 : Bouton Effacer → clearSignature() → CONFIRMER désactivé

**Niveau** : L1 | **Type** : Fonctionnel (SC5)

```gherkin
Given une signature base64 est dans donneesSignature (bouton CONFIRMER actif)
When le livreur appuie sur bouton-effacer-signature
Then clearSignature() est appelée sur le composant (via ref)
And onEmpty est déclenché → donneesSignature = null
And bouton-confirmer-livraison repasse à l'état disabled
```

**Statut** : Passé

---

### TC-061-05 : Signature base64 transmise à confirmerLivraison

**Niveau** : L1 | **Type** : Invariant domaine (SC4)

```gherkin
Given donneesSignature contient une valeur base64 non nulle
When le livreur appuie sur bouton-confirmer-livraison
Then confirmerLivraison() est appelé avec la donnée base64
And PreuveCapturee contient type=SignatureNumerique, donneeBrute=base64 (non nulle)
```

**Statut** : Passé

---

### TC-061-06 : Aucune régression sur les autres types de preuve

**Niveau** : L1 | **Type** : Non régression (SC6)

```gherkin
Given CapturePreuveScreen avec type PHOTO, TIERS_IDENTIFIE ou DEPOT_SECURISE
When on exécute les tests CapturePreuveScreen
Then les comportements sont identiques à avant US-061
And PreuveCapturee est émis avec le bon type
```

**Statut** : Passé
