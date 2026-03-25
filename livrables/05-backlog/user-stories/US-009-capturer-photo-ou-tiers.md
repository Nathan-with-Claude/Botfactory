# US-009 : Capturer une photo ou identifier un tiers comme preuve de livraison

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
je veux pouvoir capturer une photo du colis déposé, identifier un tiers ayant
réceptionné le colis, ou documenter un dépôt sécurisé comme alternative à la
signature numérique,
afin de produire une preuve de livraison opposable même quand le destinataire est
absent ou refuse de signer.

---

## Contexte

Quand le destinataire est absent, Pierre peut déposer le colis chez un voisin (tiers
identifié) ou dans un lieu sécurisé (boîte aux lettres, gardien). Ces deux cas
requièrent une preuve spécifique. La photo du colis déposé est également une preuve
valide pour les dépôts sécurisés. Chaque preuve est horodatée et géolocalisée
automatiquement. La PreuveLivraison est immuable après création.

**Invariants à respecter** :
- Une PreuveLivraison doit contenir exactement une donnée de preuve correspondant
  à son type (Photo, TiersIdentifie ou DepotSecurise).
- L'horodatage et les coordonnées GPS sont capturés automatiquement. Ils ne peuvent
  pas être saisis manuellement.
- Une PreuveLivraison est immuable après création (opposabilité juridique).
- Un Colis avec statut "livré" doit être associé à une PreuveLivraisonId.
- Pour TiersIdentifie : le nom du tiers est obligatoire.
- La photo est stockée localement en format compressé et uploadée dès le retour de
  connexion (mode offline compatible).

---

## Critères d'acceptation (Gherkin)

### Scénario 1 : Capture d'une photo du colis déposé

```gherkin
Given Pierre est sur l'écran M-04 pour le colis #00198
And Pierre sélectionne le type de preuve "Photo du colis déposé"
When Pierre prend une photo via l'appareil photo natif du mobile
And Pierre appuie sur "CONFIRMER LA LIVRAISON"
Then l'événement PreuveCapturée est émis avec type = Photo, url de la photo, hash
     d'intégrité, horodatage et coordonnées GPS
And l'événement LivraisonConfirmée est émis avec colisId = #00198 et preuveLivraisonId
And le statut du colis #00198 passe à "livré"
And la photo est uploadée vers le store objet (MinIO) dès la connexion disponible
```

### Scénario 2 : Identification d'un tiers ayant réceptionné le colis

```gherkin
Given Pierre est sur l'écran M-04 pour le colis #00198
And Pierre sélectionne le type de preuve "Dépôt chez un tiers"
When Pierre saisit le nom du tiers "Mme Leroy" dans le champ prévu
And Pierre appuie sur "CONFIRMER LA LIVRAISON"
Then l'événement PreuveCapturée est émis avec type = TiersIdentifie, nomTiers = "Mme
     Leroy", horodatage et coordonnées GPS
And l'événement LivraisonConfirmée est émis pour le colis #00198
And le statut du colis #00198 passe à "livré"
```

### Scénario 3 : Champ nom du tiers obligatoire

```gherkin
Given Pierre est sur l'écran M-04 avec le type "Dépôt chez un tiers" sélectionné
When le champ "Nom du tiers" est vide
Then le bouton "CONFIRMER LA LIVRAISON" est désactivé
And un message d'indication "Saisissez le nom de la personne ayant réceptionné" est
     affiché
```

### Scénario 4 : Documentation d'un dépôt sécurisé

```gherkin
Given Pierre est sur l'écran M-04 pour le colis #00198
And Pierre sélectionne le type de preuve "Dépôt sécurisé"
When Pierre saisit la description "Boîte aux lettres n°3"
And Pierre appuie sur "CONFIRMER LA LIVRAISON"
Then l'événement PreuveCapturée est émis avec type = DepotSecurise, description =
     "Boîte aux lettres n°3", horodatage et coordonnées GPS
And l'événement LivraisonConfirmée est émis pour le colis #00198
```

### Scénario 5 : Erreur d'accès à l'appareil photo

```gherkin
Given Pierre est sur l'écran M-04 avec le type "Photo" sélectionné
When l'accès à l'appareil photo est refusé (autorisations non accordées)
Then le message "Impossible d'accéder à l'appareil photo. Vérifiez les autorisations."
     est affiché
And Pierre peut choisir un autre type de preuve (tiers, dépôt sécurisé)
```

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#écran-m-04--capture-de-la-preuve-de-livraison
- Parcours : /livrables/02-ux/user-journeys.md#parcours-4--livreur--capturer-une-preuve-de-livraison
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
