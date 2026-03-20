# US-008 : Capturer une signature numérique comme preuve de livraison

**Epic** : EPIC-002 — Capture et Accès aux Preuves de Livraison
**Feature** : F-007 — Capture de la preuve de livraison
**Bounded Context** : BC-02 Gestion des Preuves
**Aggregate(s) touchés** : PreuveLivraison (Aggregate Root)
**Priorité** : Must Have
**Statut** : Prête
**Complexité estimée** : M (5 points)

---

## User Story

En tant que Pierre Morel (livreur terrain),
je veux faire signer le destinataire directement sur l'écran de mon application mobile
après lui avoir remis son colis,
afin de produire une preuve de livraison numérique opposable, horodatée et géolocalisée,
sans feuille papier.

---

## Contexte

La signature numérique est le type de preuve le plus courant pour les livraisons où
le destinataire est présent. Elle est capturée sur le pad tactile de l'écran M-04.
L'horodatage et les coordonnées GPS sont capturés automatiquement au moment de la
validation. La PreuveLivraison est immuable après création.

En cas d'absence de signal GPS, la livraison peut être confirmée sans coordonnées
(mode dégradé documenté), avec une alerte automatique au superviseur.

**Invariants à respecter** :
- Une PreuveLivraison doit contenir exactement une donnée de preuve correspondant
  à son type (ici : SignatureNumerique).
- L'horodatage et les coordonnées GPS sont capturés automatiquement. Ils ne peuvent
  pas être saisis manuellement.
- Une PreuveLivraison est immuable après création (opposabilité juridique).
- Un Colis avec statut "livré" doit être associé à une PreuveLivraisonId.

---

## Critères d'acceptation (Gherkin)

### Scénario 1 : Capture d'une signature numérique avec succès

```gherkin
Given Pierre est sur l'écran M-04 (Capture de la preuve) pour le colis #00247
And le type de preuve "Signature du destinataire" est sélectionné
When le destinataire signe sur le pad tactile de l'écran
And Pierre appuie sur "CONFIRMER LA LIVRAISON"
Then l'événement PreuveCapturée est émis avec type = SignatureNumerique, horodatage
     automatique et coordonnées GPS
And l'événement LivraisonConfirmée est émis avec colisId = #00247 et preuveLivraisonId
And le statut du colis #00247 passe à "livré"
And Pierre est redirigé vers M-02 avec le colis #00247 coché (statut livré)
And l'indicateur "Reste à livrer" est décrémenté de 1
```

### Scénario 2 : Bouton "CONFIRMER LA LIVRAISON" désactivé sans signature

```gherkin
Given Pierre est sur l'écran M-04 avec le type "Signature du destinataire" sélectionné
When le pad de signature est vide (aucun tracé)
Then le bouton "CONFIRMER LA LIVRAISON" est désactivé
And Pierre ne peut pas valider la livraison sans capturer la signature
```

### Scénario 3 : Effacer et recommencer la signature

```gherkin
Given Pierre est sur l'écran M-04 et le destinataire a signé sur le pad
When Pierre appuie sur "Effacer"
Then le pad de signature est vidé
And le bouton "CONFIRMER LA LIVRAISON" repasse à l'état désactivé
And le destinataire peut signer à nouveau
```

### Scénario 4 : Livraison confirmée en mode dégradé GPS (signal absent)

```gherkin
Given Pierre est sur l'écran M-04 et l'API de localisation est indisponible
When le destinataire signe et Pierre appuie sur "CONFIRMER LA LIVRAISON"
Then l'événement PreuveCapturée est émis sans coordonnées GPS (champ vide documenté)
And l'événement LivraisonConfirmée est émis normalement
And une alerte est émise automatiquement au superviseur indiquant l'absence de
     géolocalisation pour le colis #00247
And le mode dégradé est enregistré dans les métadonnées de la PreuveLivraison
```

### Scénario 5 : PreuveLivraison immuable après création

```gherkin
Given une PreuveLivraison a été créée pour le colis #00247 (type SignatureNumerique)
When une tentative de modification de la signature ou de l'horodatage est effectuée
     (via API ou interface)
Then le système rejette la modification avec une erreur 409 Conflict
And aucune donnée de la PreuveLivraison n'est modifiée
```

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#écran-m-04--capture-de-la-preuve-de-livraison
- Parcours : /livrables/02-ux/user-journeys.md#parcours-4--livreur--capturer-une-preuve-de-livraison
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
