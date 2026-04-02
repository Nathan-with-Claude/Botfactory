# US-030 : Verifier la compatibilite entre le vehicule selectionne et la charge de la tournee

**Epic** : EPIC-007 : Planification et Preparation des Tournees (interface web logisticien)
**Feature** : F-020 : Affectation livreur et vehicule
**Bounded Context** : BC-07 Planification de Tournee (Core Domain)
**Aggregate(s) touchés** : TourneeTMS, Affectation, Vehicule
**Priorité** : Should Have
**Statut** : A affiner
**Complexité estimée** : M

---

## User Story

En tant que responsable logistique,
je veux etre alerte automatiquement si le vehicule que je selectionne ne peut pas porter
la charge estimee de la tournee,
afin d'eviter un incident logistique (surcharge, refus du transporteur, avarie materielle)
avant le depart du livreur.

---

## Contexte

Besoin terrain identifie lors du redesign v2.0 (cf. evolution-design.md W-05 "Verification
compatibilite vehicule").

La verification est declenchee au moment de la selection du vehicule dans l'onglet Affectation
de W-05. Si le poids estime de la Composition de tournee depasse la capacite du Vehicule, une
alerte inline est affichee. Le logisticien garde la possibilite de passer outre (bouton
"Affecter quand meme"), ce qui doit etre trace.

Le poids estime de la TourneeTMS est fourni par l'import TMS dans la Composition de tournee.
La capacite du Vehicule est un attribut de l'entite Vehicule dans BC-07.

**Invariants a respecter** :
- L'Affectation ne peut etre validee automatiquement que si poids estime <= capacite vehicule.
- Si le logisticien clique "Affecter quand meme" malgre l'alerte, l'evenement
  `CompatibiliteVehiculeEchouee` doit etre emis avec le delta de depassement et l'identite
  du logisticien ayant force l'affectation.
- Si poids estime <= capacite vehicule, l'evenement `CompatibiliteVehiculeVerifiee` est emis.
- Le poids estime est obligatoire dans la Composition de tournee pour que la verification
  soit effectuee. Si absent (donnee manquante du TMS), la verification est ignoree et un
  avertissement "Poids non disponible — verification impossible" est affiche.

---

## Criteres d'acceptation (Gherkin)

### Scenario 1 — Selection d'un vehicule compatible (cas nominal)

```gherkin
Given le logisticien est sur W-05 onglet Affectation
And la TourneeTMS a un poids estime de 350 kg dans sa Composition de tournee
When il selectionne un vehicule dont la capacite est de 500 kg
Then aucune alerte n'est affichee
And l'evenement CompatibiliteVehiculeVerifiee est emis avec vehiculeId, tourneeTMSId
  et le delta de marge (150 kg)
```

### Scenario 2 — Selection d'un vehicule insuffisant

```gherkin
Given le logisticien est sur W-05 onglet Affectation
And la TourneeTMS a un poids estime de 410 kg dans sa Composition de tournee
When il selectionne un vehicule dont la capacite est de 400 kg
Then une alerte inline est affichee : "VH-07 : capacite 400 kg, tournee estimee 410 kg
  — risque de surcharge."
And le bouton "Valider et Lancer" est desactive tant que l'alerte est presente
And un bouton "Affecter quand meme" est propose
```

### Scenario 3 — Force de l'affectation malgre depassement

```gherkin
Given l'alerte de depassement de capacite affichee pour un vehicule selectionne
When le logisticien clique sur "Affecter quand meme"
Then l'evenement CompatibiliteVehiculeEchouee est emis avec le vehiculeId, le tourneeTMSId,
  le depassement en kg et l'identifiant du logisticien
And l'alerte inline passe en mode avertissement (non bloquant) avec l'icone AlertTriangle
And le bouton "Valider et Lancer" redevient actif
```

### Scenario 4 — Poids estime absent dans la composition

```gherkin
Given une TourneeTMS dont le poids estime n'a pas ete fourni par le TMS
When le logisticien selectionne un vehicule dans l'onglet Affectation
Then aucune alerte de surcharge n'est affichee
And un avertissement "Poids non disponible — verification impossible" est affiche
And l'Affectation peut etre validee normalement
```

### Scenario 5 — Changement de vehicule recalcule la verification

```gherkin
Given un vehicule insuffisant selectionne avec une alerte de surcharge affichee
When le logisticien change de vehicule et en selectionne un avec une capacite suffisante
Then l'alerte de surcharge disparait
And l'evenement CompatibiliteVehiculeVerifiee est emis pour le nouveau vehicule
```

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#W-05
- Evolution Design : /livrables/02-ux/evolution-design.md (W-05 "Verification compatibilite vehicule")
- US suggeree UX : evolution-design.md §2 US-suggeree-C
- US liee : US-023-affecter-livreur-vehicule.md (logique metier affectation)
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
