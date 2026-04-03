# Implémentation US-046 : Intégrer le pad de trace réel pour la capture de signature numérique dans M-04

## Contexte

**User Story** : En tant que Pierre Morel (livreur terrain), je veux dessiner ma signature avec le doigt sur un véritable pad de tracé dans M-04, afin de produire une preuve de livraison numérique opposable au sens légal.

**Lien US** : `/livrables/05-backlog/user-stories/US-046-signature-numerique-pad-reel.md`
**Sprint** : Sprint 5 (correctif dette technique US-008)
**Priorité** : Must Have — bloquant légal
**Branche git** : `feature/US-001`

**Contexte dette technique** : US-008 avait remplacé le pad de tracé réel par un `TouchableOpacity` simulé (note interne : "react-native-signature-canvas non installé"). Pierre Morel a signalé ce problème à 3 reprises. Une preuve de livraison opposable doit contenir un tracé graphique authentique.

---

## Bounded Context et couche ciblée

- **BC** : BC-02 — Gestion des Preuves de Livraison (collocalisé dans `svc-tournee`)
- **Aggregate(s) modifiés** : aucun (remplacement du composant d'interface uniquement)
- **Domain Events émis** : `PreuveCapturee` (inchangé — signature base64 PNG transmise via le même contrat)

---

## Décisions d'implémentation

### Dépendance ajoutée
- `react-native-signature-canvas: ^4.7.2` ajoutée dans `package.json`

### Interface Layer (React Native)

**Modification `CapturePreuveScreen.tsx`** :
- Import `SignatureCanvas, { SignatureViewRef }` de `react-native-signature-canvas`
- Ajout `useRef<SignatureViewRef>(null)` pour `signatureRef`
- Remplacement du `TouchableOpacity` simulé (`testID="pad-signature"`) par :
  - Un `View testID="pad-signature-canvas"` conteneur portant les props `onOK`, `onEmpty`, `onBegin`
  - Un composant `SignatureCanvas` avec `ref={signatureRef}`, `onOK`, `onEmpty`, `onBegin`, `webStyle`
- `handleEffacerSignature()` appelle maintenant `signatureRef.current?.clearSignature()`
- `setDonneesSignature()` est appelée via `onOK` (callback SignatureCanvas) avec la valeur base64 PNG
- `onEmpty` remet `donneesSignature` à `null` (bouton CONFIRMER désactivé)
- Les données `donneesSignature` transitent toujours vers `ConfirmerLivraisonHandler` via le même contrat (`ConfirmerLivraisonRequest.donneesSignature`)

### Infrastructure de test
- Mock `src/__mocks__/react-native-signature-canvas.tsx` créé — expose `SignatureViewRef` et un `MockSignatureCanvas` `forwardRef` avec `clearSignature()` / `readSignature()`
- `moduleNameMapper` mis à jour dans `package.json` pour pointer vers ce mock

### Invariants préservés
- Une `PreuveLivraison` de type `SignatureNumerique` requiert une donnée base64 non nulle : le bouton CONFIRMER reste désactivé si `donneesSignature === null`
- Les autres types de preuve (PHOTO, TIERS_IDENTIFIE, DEPOT_SECURISE) ne sont pas touchés
- L'horodatage et les coordonnées GPS sont toujours capturés automatiquement au moment de la confirmation

---

## Tests

### Mobile (Jest + @testing-library/react-native)

| Fichier | Type | Tests | Résultats |
|---|---|---|---|
| `CapturePreuveScreen.US046.test.tsx` | Unitaire (React Native) — TDD | 13 tests : SC1 à SC9 + régressions | 13/13 |
| `CapturePreuveScreen.test.tsx` | Mis à jour (remplacement testID) | 19 tests (ex-US-008/009) | 19/19 |

**Suite totale mobile** : 365/365 tests verts (aucune régression).

### Scénarios couverts

- SC1 : `pad-signature-canvas` présent avec props `onOK` et `onEmpty`
- SC2 : pad vide → bouton CONFIRMER désactivé
- SC3 : réception `onOK` avec base64 → bouton CONFIRMER activé
- SC4 : Effacer → `clearSignature()` + bouton désactivé
- SC5 : confirmation → base64PNG transmis à `confirmerLivraison()` (non nul)
- SC6a/b/c/d : aucune régression PHOTO, TIERS_IDENTIFIE, DEPOT_SECURISE

---

## Notes

- La librairie `react-native-signature-canvas` utilise une WebView HTML5 canvas — elle est pleinement compatible Expo sur Android/iOS
- Les tests Jest utilisent un mock `forwardRef` qui simule les callbacks `onOK` / `onEmpty` via `fireEvent` sur le `View` conteneur
- La prop `onSignatureCapturee` (ancienne dette US-008) a été supprimée du composant
