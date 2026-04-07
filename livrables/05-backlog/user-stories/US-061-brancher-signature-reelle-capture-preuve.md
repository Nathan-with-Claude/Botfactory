# US-061 — Brancher react-native-signature-canvas dans CapturePreuveScreen

**Epic** : EPIC-002 — Capture et Accès aux Preuves de Livraison
**Feature** : F-007 — Capture de la preuve de livraison
**Bounded Context** : BC-02 — Gestion des Preuves
**Aggregate(s) touchés** : PreuveLivraison (Aggregate Root)
**Priorité** : P0 — Bloquant légal (signature simulée non opposable)
**Statut** : À faire
**Complexité estimée** : S

---

> **Note doublon** : US-046 ("Intégrer le pad de tracé réel pour la capture de signature numérique dans M-04", statut "Prête") couvre le même périmètre fonctionnel. La présente US-061 est créée en urgence P0 suite au 4e signal terrain de Pierre Morel (2026-04-04) car US-046 n'a pas été implémentée lors du sprint corrections as-built. US-061 doit être traitée AVANT US-046 dans l'ordre de traitement pour signaler la priorité absolue. L'implémentation peut utiliser directement les spécifications de US-046.

---

## En tant que…

En tant que Pierre Morel (livreur terrain) lors de la confirmation d'une livraison,

## Je veux…

saisir une vraie signature manuscrite du destinataire avec le doigt sur l'écran M-04, en utilisant le composant `react-native-signature-canvas` déjà installé dans les dépendances,

## Afin de…

produire une PreuveLivraison de type SignatureNumerique contenant un tracé graphique authentique, opposable légalement en cas de litige sur la réception du colis.

---

## Contexte

**Signal terrain (4e occurrence) :** Pierre Morel a signalé ce problème lors de chaque cycle de feedback depuis le 20/03/2026. Les corrections du sprint as-built du 04/04/2026 n'ont pas adressé ce point.

**État actuel :**
- `CapturePreuveScreen.tsx` utilise un `TouchableOpacity` simulé dans la zone de signature — un seul appui déclenche l'événement `onSignatureCapturee` sans aucun tracé réel.
- `react-native-signature-canvas` est **déjà présent** dans les dépendances du projet.
- Un mock Jest existe : `src/mobile/src/__mocks__/react-native-signature-canvas.tsx`.
- La lib n'est simplement pas branchée dans `CapturePreuveScreen`.

**Risque légal :** Une PreuveLivraison de type SignatureNumerique sans tracé graphique réel n'est pas opposable. Si un destinataire conteste, le livreur n'a aucune preuve concrète d'une signature effectuée.

**Ce qui est à faire (périmètre minimal) :**
1. Remplacer le `TouchableOpacity` simulé par le composant `<SignatureCanvas>` de `react-native-signature-canvas`.
2. Désactiver le bouton "CONFIRMER LA LIVRAISON" tant que le pad est vide (`onEmpty = true`).
3. Activer un bouton "Effacer" appelant `clearSignature()`.
4. Au clic sur "CONFIRMER", appeler `readSignature()` et transmettre le base64 PNG au `ConfirmerLivraisonHandler`.

**Invariants à respecter** :
- Une PreuveLivraison de type SignatureNumerique doit contenir une donnée de tracé graphique non nulle (base64 PNG).
- L'horodatage et les coordonnées GPS sont capturés automatiquement au moment de la validation.
- Une PreuveLivraison est immuable après création (opposabilité juridique).
- Les types de preuve PHOTO, TIERS_IDENTIFIE, DEPOT_SECURISE ne sont pas modifiés.

---

## Critères d'acceptation (Gherkin)

### Scénario 1 — Le pad de tracé remplace le composant simulé

```gherkin
Given Pierre est sur l'écran M-04 (Capture de la preuve)
And le type de preuve "Signature du destinataire" est sélectionné
When M-04 est affiché
Then la zone de signature affiche le composant react-native-signature-canvas
And aucun TouchableOpacity simulé n'est présent dans la zone de signature
And le composant est interactif : le destinataire peut tracer avec le doigt
```

### Scénario 2 — Pad vide : le bouton de confirmation est désactivé

```gherkin
Given Pierre est sur M-04 avec le type "Signature du destinataire" sélectionné
And aucun tracé n'a été effectué (onEmpty = true)
When M-04 est affiché
Then le bouton "CONFIRMER LA LIVRAISON" est désactivé
And Pierre ne peut pas déclencher la validation
```

### Scénario 3 — Le tracé active le bouton de confirmation

```gherkin
Given Pierre est sur M-04 avec le composant react-native-signature-canvas affiché
When le destinataire dessine sa signature avec le doigt sur le pad
Then le tracé est visible en temps réel sur le composant
And le bouton "CONFIRMER LA LIVRAISON" passe à l'état actif
```

### Scénario 4 — La signature est transmise en base64 PNG au handler

```gherkin
Given le destinataire a tracé une signature non vide sur le pad
When Pierre appuie sur "CONFIRMER LA LIVRAISON"
Then readSignature() est appelée sur le composant
And l'événement PreuveCapturee est émis avec type = SignatureNumerique,
    donneeBrute = base64PNG (non nulle, non vide)
And l'événement LivraisonConfirmee est émis avec colisId et preuveLivraisonId
```

### Scénario 5 — Le bouton Effacer remet le pad à zéro

```gherkin
Given le destinataire a tracé une signature sur le pad
When Pierre appuie sur "Effacer"
Then clearSignature() est appelée sur le composant
And le pad de tracé est vide
And le bouton "CONFIRMER LA LIVRAISON" repasse à l'état désactivé
```

### Scénario 6 — Aucune régression sur les autres types de preuve

```gherkin
Given Pierre est sur M-04 avec un type de preuve PHOTO, TIERS_IDENTIFIE ou DEPOT_SECURISE
When Pierre utilise l'écran M-04 pour ces types de preuve
Then le comportement est identique à avant cette US
And l'événement PreuveCapturee est émis avec le bon type pour chaque cas
```

---

## Définition of Done

- [ ] Le `TouchableOpacity` simulé est remplacé par `<SignatureCanvas>` dans `CapturePreuveScreen.tsx`
- [ ] Le bouton "CONFIRMER LA LIVRAISON" est désactivé si `onEmpty = true`
- [ ] Le bouton "Effacer" déclenche `clearSignature()` et remet `onEmpty = true`
- [ ] La signature est récupérée via `readSignature()` au moment de la confirmation
- [ ] La donnée base64 PNG est transmise au `ConfirmerLivraisonHandler` (non nulle)
- [ ] Tests Jest couvrant les cas : pad vide, tracé présent, effacer, confirmation
- [ ] Tous les tests Jest de CapturePreuveScreen passent (aucune régression)
- [ ] Aucune régression sur les types PHOTO, TIERS_IDENTIFIE, DEPOT_SECURISE

---

## Liens

- US-046 (doublon à consolider) : /livrables/05-backlog/user-stories/US-046-signature-numerique-pad-reel.md
- Wireframe : /livrables/02-ux/wireframes.md#ecran-m-04--capture-de-la-preuve-de-livraison
- Parcours : /livrables/02-ux/user-journeys.md#parcours-4--livreur--capturer-une-preuve-de-livraison
- Feedback source : /livrables/09-feedback/feedback-corrections-as-built-2026-04-04.md (signal #4, 4e occurrence)
- US liée (dette source) : US-008 — Capturer une signature numérique comme preuve de livraison
- Fichiers concernés :
  - `src/mobile/src/screens/CapturePreuveScreen.tsx`
  - `src/mobile/src/__mocks__/react-native-signature-canvas.tsx`
