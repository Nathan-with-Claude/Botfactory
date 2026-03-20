# US-022 : Vérifier la composition d'une tournée avant affectation

**Epic** : EPIC-007 — Planification et Préparation des Tournées (interface web logisticien)
**Feature** : F-019 — Vérification de la composition des tournées
**Bounded Context** : BC-07 Planification de Tournée
**Aggregate(s) touchés** : TournéeTMS
**Priorité** : Should Have
**Statut** : Prête
**Complexité estimée** : S (3 points)

---

## User Story

En tant que Laurent Renaud (responsable exploitation logistique),
je veux consulter le détail de la composition d'une tournée (liste des colis, zones,
contraintes horaires, anomalies détectées),
afin de détecter les problèmes avant d'affecter un livreur.

---

## Contexte

Après l'import TMS, chaque TournéeTMS contient sa composition (colis, zones,
contraintes). Le VérificateurComposition (BC-07) analyse automatiquement la composition
et détecte les anomalies (contraintes horaires serrées, zones hétérogènes, colis
incompatibles). L'écran W-05 (onglet Composition) expose ces informations au responsable
logistique.

Cette User Story est un prérequis informationnel à l'affectation (US-023) mais n'est
pas techniquement bloquante : le responsable peut affecter sans vérifier explicitement
la composition. D'où la priorité Should Have.

**Invariants à respecter** :
- La vérification de composition est une opération de lecture (Read Model) : elle ne
  modifie pas la TournéeTMS.
- La validation explicite de la composition (clic sur "Valider la vérification") émet
  l'événement CompositionVérifiée avec horodatage et identifiant du responsable.
- Une anomalie détectée ne bloque pas l'affectation : elle est signalée mais non
  bloquante (choix de conception délibéré pour ne pas bloquer le départ des livreurs).

---

## Critères d'acceptation (Gherkin)

### Scénario 1 : Consultation du détail d'une tournée importée

```gherkin
Given une tournée TournéeTMS est disponible dans le plan du jour
And Laurent Renaud est sur l'écran W-04
When il clique sur "Voir détail" de la tournée concernée
Then l'écran W-05 s'affiche sur l'onglet Composition avec :
     - Le nombre de colis de la tournée
     - La liste des zones géographiques couvertes
     - Les contraintes horaires détectées (ex. "livraison avant 9h00 — 5 colis")
     - Une section "Anomalies" (vide si aucune anomalie)
```

### Scénario 2 : Anomalie de contrainte horaire serrée mise en évidence

```gherkin
Given une tournée importée contient une contrainte horaire serrée
      (ex. livraison avant 9h00 pour 20 colis)
And Laurent Renaud consulte l'onglet Composition de cette tournée sur W-05
When l'écran s'affiche
Then l'anomalie est listée dans la section "Anomalies" avec une icône d'alerte
And la contrainte horaire concernée est mise en évidence visuellement
And un message explicatif indique la nature du risque
```

### Scénario 3 : Validation explicite de la composition

```gherkin
Given Laurent Renaud a consulté la composition d'une tournée sur W-05
When il clique sur le bouton "Valider la vérification"
Then l'événement CompositionVérifiée est enregistré avec :
     - L'identifiant de la tournée
     - L'horodatage de validation
     - L'identifiant du responsable logistique
And la tournée affiche un indicateur "Composition vérifiée" sur W-04
```

### Scénario 4 : Tournée sans anomalie

```gherkin
Given une tournée importée dont la composition ne présente aucune anomalie détectable
When Laurent Renaud consulte l'onglet Composition sur W-05
Then la section "Anomalies" affiche le message "Aucune anomalie détectée"
And tous les indicateurs de composition sont au vert
```

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#écran-w-05--détail-dune-tournée-à-préparer
- Parcours : /livrables/02-ux/user-journeys.md#parcours-0--responsable-logistique--préparer-les-tournées-du-jour
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
