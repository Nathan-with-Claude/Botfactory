# US-041 : Afficher le poids estimé et une alerte de surcharge dans le tableau de préparation

**Epic** : EPIC-007 : Planification et Preparation des Tournees
**Feature** : F-019 : Verification de la composition des tournees
**Bounded Context** : BC-07 Planification (Supporting Domain)
**Aggregate(s) touches** : TourneePlanifiee, Vehicule
**Priorite** : Should Have
**Statut** : Prete
**Complexite estimee** : M

---

## User Story

En tant que superviseur logistique,
je veux voir le poids estime de chaque tournee directement dans le tableau de preparation W-04,
avec une icone d'alerte si ce poids depasse la capacite du vehicule affecte,
afin de detecter les surcharges potentielles sans avoir a ouvrir le detail de chaque tournee.

---

## Contexte

Feedback terrain du 2026-04-01 (Laurent Renaud) : avec 12 tournees a preparer en 30 minutes,
Laurent doit actuellement ouvrir chaque tournee (W-05) pour voir si le poids depasse la
capacite vehicule. La verification de compatibilite est deja implementee dans W-05 (US-030),
mais l'information n'est pas surfacee dans la vue liste W-04.

Cette US ajoute une colonne "Poids" dans le tableau W-04, avec une icone d'alerte (ex. triangle
orange) si le poids estime depasse ou s'approche de la capacite du vehicule affecte.

**Regles de calcul du poids estime** :
- Le poids estime d'une tournee est la somme des poids unitaires de tous les colis
  de la composition.
- Si aucun vehicule n'est encore affecte, la colonne Poids affiche la valeur brute
  sans icone d'alerte.
- L'icone d'alerte de surcharge apparait si : poids estime >= capacite vehicule * 0.95
  (seuil d'alerte a 95% de la capacite, coherent avec les regles de BC-07 issues de US-030).
- L'icone d'alerte critique apparait si : poids estime > capacite vehicule
  (depassement effectif — coherent avec `CapaciteVehiculeDepasseeException`).

**Invariants a respecter** :
- Le seuil d'alerte (95%) et le seuil de depassement (100%) sont coherents avec les
  invariants de l'Aggregate Vehicule (US-030).
- Si la capacite du vehicule est inconnue (vehicule non affecte), aucune icone d'alerte
  n'est affichee.
- La colonne Poids est en lecture seule — aucune action depuis cette colonne.

---

## Criteres d'acceptation (Gherkin)

### Scenario 1 — Colonne Poids presente dans W-04

```gherkin
Given le superviseur est sur W-04 (tableau de preparation)
And au moins une tournee est listee
When l'ecran W-04 est affiche
Then une colonne "Poids" est visible dans le tableau
And chaque ligne affiche le poids estime de la tournee en kilogrammes (ex. "245 kg")
```

### Scenario 2 — Icone d'alerte surcharge critique

```gherkin
Given la tournee T-205 a un poids estime de 850 kg
And le vehicule affecte a une capacite de 800 kg
When W-04 est affiche
Then la ligne de T-205 affiche une icone d'alerte critique (rouge) dans la colonne Poids
And un tooltip ou texte court indique "Chargement trop lourd — 850 kg / 800 kg"
And l'evenement CompatibiliteVehiculeEchouee est reference (coherent avec US-030)
```

### Scenario 3 — Icone d'alerte seuil d'approche

```gherkin
Given la tournee T-206 a un poids estime de 775 kg
And le vehicule affecte a une capacite de 800 kg (seuil alerte a 760 kg = 95% de 800)
When W-04 est affiche
Then la ligne de T-206 affiche une icone d'alerte (orange) dans la colonne Poids
And un tooltip indique "Charge elevee — 775 kg / 800 kg"
```

### Scenario 4 — Aucune alerte si charge normale

```gherkin
Given la tournee T-207 a un poids estime de 400 kg
And le vehicule affecte a une capacite de 800 kg
When W-04 est affiche
Then la ligne de T-207 affiche "400 kg" sans icone d'alerte
```

### Scenario 5 — Aucune alerte si vehicule non affecte

```gherkin
Given la tournee T-208 n'a pas de vehicule affecte
When W-04 est affiche
Then la ligne de T-208 affiche le poids estime sans icone d'alerte
And aucun tooltip de capacite n'est affiche
```

---

## Definition of Done

- [ ] Colonne "Poids" ajoutee dans le tableau W-04 (PreparationPage).
- [ ] Calcul du poids estime base sur la somme des colis de la composition.
- [ ] Icone d'alerte orange affichee si poids >= 95% de la capacite vehicule.
- [ ] Icone d'alerte rouge affichee si poids > capacite vehicule.
- [ ] Tooltip avec detail "xxx kg / yyy kg" sur l'icone d'alerte.
- [ ] Aucune icone si vehicule non affecte.
- [ ] Tests Jest sur PreparationPage couvrant les 5 scenarios.
- [ ] Aucune regression sur US-023 (affectation vehicule), US-030 (compatibilite vehicule W-05).

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#W-04
- Feedback source : /livrables/09-feedback/feedback-superviseur-2026-04-01.md
- US liees : US-023 (affectation livreur/vehicule), US-030 (verification compatibilite vehicule)
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
