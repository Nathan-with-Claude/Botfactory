# US-046 : Integrer le pad de trace reel pour la capture de signature numerique dans M-04

**Epic** : EPIC-002 — Capture et Acces aux Preuves de Livraison
**Feature** : F-007 — Capture de la preuve de livraison
**Bounded Context** : BC-02 Gestion des Preuves
**Aggregate(s) touches** : PreuveLivraison (Aggregate Root)
**Priorite** : Must Have
**Statut** : Prete
**Complexite estimee** : M

---

## User Story

En tant que Pierre Morel (livreur terrain),
je veux dessiner ma signature avec le doigt sur un veritable pad de trace dans M-04,
afin de produire une preuve de livraison numerique opposable au sens legal, avec un
tracé authentique du destinataire et non un simple appui simulé.

---

## Contexte

La User Story US-008 a spécifie la capture de signature numerique comme preuve de
livraison. L'implémentation initiale (documentée dans US-008-impl.md) a remplace le
pad de tracé réel par un `TouchableOpacity` simulé qui déclenche l'evenement
`onSignatureCapturee` sans aucune capture graphique réelle.

Ce choix était une dette technique explicite, identifiee par le developpeur comme
"Pad signature MVP = TouchableOpacity simulé + event onSignatureCapturee.
react-native-signature-canvas non installé."

Pierre Morel (livreur terrain) a signalé ce problème à trois reprises :
- Feedback 20/03/2026
- Feedback 30/03/2026
- Feedback 01/04/2026

La signature simulée est un **bloquant légal** : une preuve de livraison opposable
doit contenir un tracé graphique authentique. Sans ce tracé, la PreuveLivraison de
type SignatureNumerique ne peut pas être utilisée en cas de litige.

La solution retenue est l'intégration de la librairie `react-native-signature-canvas`,
qui fournit un WebView embarqué avec canvas HTML5 pour la capture du tracé. La
signature est exportée en base64 PNG et transmise au `ConfirmerLivraisonHandler`
exactement comme le format attendu par l'Aggregate PreuveLivraison.

Cette US ne modifie pas les invariants du domaine ni le contrat de l'evenement
`PreuveCapturee` : elle remplace uniquement le composant d'interface simulé par un
composant de tracé réel.

**Invariants a respecter** :
- Une PreuveLivraison de type SignatureNumerique doit contenir une donnée de tracé
  graphique non nulle (base64 PNG) — un pad vide ne satisfait pas cet invariant.
- L'horodatage et les coordonnées GPS sont toujours capturés automatiquement au moment
  de la validation, indépendamment du composant de signature.
- Une PreuveLivraison est immuable après création (opposabilité juridique).
- Les autres types de preuve (PHOTO, TIERS_IDENTIFIE, DEPOT_SECURISE) ne sont pas
  modifiés par cette US — aucune régression n'est acceptable.

---

## Criteres d'acceptation (Gherkin)

### Scenario 1 — Le pad de trace remplace le TouchableOpacity simule

```gherkin
Given Pierre est sur l'ecran M-04 (Capture de la preuve)
And le type de preuve "Signature du destinataire" est selectionne
When M-04 est affiche
Then la zone de signature affiche un composant react-native-signature-canvas
And aucun TouchableOpacity simule n'est present dans la zone de signature
And le composant est interactif : le destinataire peut tracer avec le doigt
```

### Scenario 2 — Le livreur peut dessiner une signature avec le doigt

```gherkin
Given Pierre est sur M-04 avec le composant react-native-signature-canvas affiche
When le destinataire dessine sa signature avec le doigt sur le pad
Then le trace est visible en temps reel sur le composant
And le bouton "CONFIRMER LA LIVRAISON" passe a l'etat actif
```

### Scenario 3 — Le bouton Effacer remet le pad a zero

```gherkin
Given le destinataire a trace une signature sur le pad
When Pierre appuie sur "Effacer"
Then l'evenement onEmpty du composant react-native-signature-canvas est declenche
And le pad de trace est vide
And le bouton "CONFIRMER LA LIVRAISON" repasse a l'etat desactive
And le destinataire peut tracer a nouveau
```

### Scenario 4 — La signature est capturee en base64 PNG et transmise au handler

```gherkin
Given le destinataire a trace une signature non vide sur le pad
When Pierre appuie sur "CONFIRMER LA LIVRAISON"
Then la methode readSignature() du composant est appelee
And la signature est recuperee sous forme de chaine base64 PNG
And l'evenement PreuveCapturee est emis avec type = SignatureNumerique,
    donneeBrute = base64PNG, horodatage automatique et coordonnees GPS
And l'evenement LivraisonConfirmee est emis avec colisId et preuveLivraisonId
And le ConfirmerLivraisonHandler recoit la signature base64 PNG (non nulle, non vide)
```

### Scenario 5 — Pad vide : le bouton de validation reste desactive

```gherkin
Given Pierre est sur M-04 avec le type "Signature du destinataire" selectionne
And aucun trace n'a ete effectue sur le pad (onEmpty = true)
When M-04 est affiche ou apres utilisation du bouton Effacer
Then le bouton "CONFIRMER LA LIVRAISON" est desactive
And Pierre ne peut pas declencher la validation
```

### Scenario 6 — Apercu de la signature avant confirmation

```gherkin
Given le destinataire a trace une signature sur le pad
When Pierre s'apprete a confirmer
Then la signature tracee est visible dans la zone du composant react-native-signature-canvas
And Pierre peut visuellement verifier la signature avant d'appuyer sur
    "CONFIRMER LA LIVRAISON"
```

### Scenario 7 — Tests Jest avec mock de react-native-signature-canvas

```gherkin
Given la suite de tests Jest de CapturePreuveScreen
When les tests sont executes
Then react-native-signature-canvas est mocke via __mocks__
And les scenarios : pad vide -> bouton desactive, trace present -> bouton actif,
    appui Effacer -> pad vide, confirmation -> base64PNG transmis au handler
    sont couverts par des tests unitaires
And tous les tests Jest passent sans erreur
```

### Scenario 8 — Aucune regression sur les autres types de preuve

```gherkin
Given Pierre est sur M-04 avec un type de preuve different de SignatureNumerique
And le type selectionne est PHOTO, TIERS_IDENTIFIE ou DEPOT_SECURISE
When Pierre utilise l'ecran M-04 pour ces types de preuve
Then le comportement de chaque type de preuve est identique a avant cette US
And l'evenement PreuveCapturee est emis avec le bon type pour chaque cas
And aucune regression n'est detectee sur US-008 (scenarios 4 et 5 GPS degrade) ni
    sur US-009 (capture photo et tiers identifie)
```

---

## Definition of Done

- [ ] `react-native-signature-canvas` installe et reference dans package.json.
- [ ] Le `TouchableOpacity` simule dans CapturePreuveScreen est remplace par le
      composant `SignatureCanvas`.
- [ ] Le bouton "CONFIRMER LA LIVRAISON" est desactive si `onEmpty = true`.
- [ ] Le bouton "Effacer" declenche `clearSignature()` et remet `onEmpty = true`.
- [ ] La signature est recuperee via `readSignature()` au moment de la confirmation.
- [ ] La donnee base64 PNG est transmise au `ConfirmerLivraisonHandler` (non nulle).
- [ ] Un apercu du trace est visible dans le composant avant confirmation.
- [ ] Mock de `react-native-signature-canvas` cree dans `__mocks__/`.
- [ ] Tests Jest couvrant les 4 cas : pad vide, trace present, effacer, confirmation.
- [ ] Tous les tests Jest de CapturePreuveScreen passent (aucune regression).
- [ ] Aucune regression sur les types PHOTO, TIERS_IDENTIFIE, DEPOT_SECURISE.
- [ ] Aucune regression sur US-009 (photo, tiers identifie).

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#ecran-m-04--capture-de-la-preuve-de-livraison
- Parcours : /livrables/02-ux/user-journeys.md#parcours-4--livreur--capturer-une-preuve-de-livraison
- US liee (remplace la dette de) : US-008 — Capturer une signature numerique comme preuve de livraison
- Dette technique source : /livrables/06-dev/vertical-slices/US-008-impl.md
- Feedback source : /livrables/09-feedback/feedback-livreur-2026-03-20.md
- Feedback source : /livrables/09-feedback/feedback-livreur-2026-03-30.md
- Feedback source : /livrables/09-feedback/feedback-livreur-2026-04-01.md
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
