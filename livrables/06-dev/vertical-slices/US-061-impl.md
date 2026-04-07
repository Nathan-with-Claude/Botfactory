# Implémentation US-061 : Brancher react-native-signature-canvas dans CapturePreuveScreen

## Contexte

US-061 (P0/S) — Bloquant légal : le pad de signature dans `CapturePreuveScreen` (M-04) devait utiliser `react-native-signature-canvas` (bibliothèque déjà installée). L'implémentation US-046 avait intégré le composant mais avec une configuration webStyle basique. Cette US finalise la configuration pour se conformer à la spec légale et UX.

Liens utiles :
- `/livrables/05-backlog/user-stories/US-061-brancher-signature-reelle-capture-preuve.md`
- `/livrables/02-ux/wireframes.md` (écran M-04)

## Bounded Context et couche ciblée

- **BC** : BC-02 Preuve de Livraison
- **Aggregate(s) modifiés** : aucun (correction couche présentation)
- **Domain Events émis** : aucun

## Décisions d'implémentation

### Frontend / Mobile

Fichier modifié : `src/mobile/src/screens/CapturePreuveScreen.tsx`

Modifications apportées au composant `SignatureCanvas` :

1. **webStyle enrichi** : ajout `border-radius: 12px` sur le pad, footer masqué (`display: none`), fond transparent, nettoyage des règles parasites.
2. **style direct** : `{ flex: 1, width: '100%', height: 240 }` (hauteur 240 au lieu de `'100%'` dans le style CSS de la webview)
3. **descriptionText** : `"Signez ici"` (texte d'instruction visible dans le pad)
4. **Suppression des props non nécessaires** : `autoClear` et `imageType` retirés (valeurs par défaut suffisantes)
5. **Callback onOK** simplifié : `(sig) => setSignatureDataUrl(sig)` aligné avec la signature de la lib

Les fonctionnalités préexistantes sont maintenues :
- `ref={signatureRef}` pour `clearSignature()` via le bouton "Effacer"
- `onOK` → `setDonneesSignature(sig)` → active le bouton CONFIRMER
- `onEmpty` → `setDonneesSignature(null)` → désactive le bouton CONFIRMER
- `testID="pad-signature-canvas"` sur le conteneur View préservé
- `testID="bouton-effacer-signature"` préservé
- `testID="bouton-confirmer-livraison"` préservé et disabled quand pas de signature

### Mock Jest

Fichier : `src/mobile/src/__mocks__/react-native-signature-canvas.tsx`

Le mock existant est correct et compatible. Il expose :
- `readSignature()` → appelle `onOK` avec valeur mock base64
- `clearSignature()` → appelle `onEmpty`
- `testID="mock-signature-pad"` pour les tests d'intégration SignatureCanvas directe

### Invariants préservés

- Les 4 types de preuve (SIGNATURE, PHOTO, TIERS_IDENTIFIE, DEPOT_SECURISE) restent sélectionnables
- Style Material Design 3 du reste de l'écran inchangé
- Le bouton CONFIRMER est désactivé tant que `donneesSignature` est `null`
- La signature base64 est transmise à `confirmerLivraison()` via le handler

### Erreurs / invariants

- `LivraisonDejaConfirmeeError` et `DonneesPreuveInvalidesError` : gestion inchangée

## Tests

### Tests préexistants validés (TDD déjà en place depuis US-046)

Fichiers :
- `src/mobile/src/__tests__/CapturePreuveScreen.test.tsx` — 20 tests
- `src/mobile/src/__tests__/CapturePreuveScreen.US046.test.tsx` — 13 tests

Suite complète : **33/33 tests verts** après modification de la config SignatureCanvas.

Les tests vérifient :
- SC1/SC8 : `pad-signature-canvas` présent avec `onOK` et `onEmpty` définis
- SC2 : bouton CONFIRMER désactivé au rendu initial
- SC3 : `onOK(base64)` active le bouton CONFIRMER
- SC4 : bouton Effacer → `clearSignature()` → bouton CONFIRMER désactivé
- SC5 : signature base64 transmise à `confirmerLivraison()`
- SC6 : aucune régression sur TIERS_IDENTIFIE, DEPOT_SECURISE, PHOTO
- SC9 : `pad-signature-simule` absent (composant simulé supprimé)

### Régression

Aucune régression — 60/60 tests verts sur les suites `offlineQueue`, `CapturePreuveScreen`, `useOfflineSync`.
