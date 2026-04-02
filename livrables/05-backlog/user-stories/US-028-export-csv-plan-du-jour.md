# US-028 : Exporter en CSV la composition d'une tournee

**Epic** : EPIC-007 : Planification et Preparation des Tournees (interface web logisticien)
**Feature** : F-019 : Verification de la composition des tournees
**Bounded Context** : BC-07 Planification de Tournee (Core Domain)
**Aggregate(s) touchés** : PlanDuJour, TourneeTMS
**Priorité** : Should Have
**Statut** : A affiner
**Complexité estimée** : S

---

## User Story

En tant que responsable logistique,
je veux pouvoir exporter en CSV la liste des colis d'une tournee depuis l'onglet Composition
de W-05,
afin de pouvoir imprimer la feuille de route ou la transmettre en cas de defaillance systeme.

---

## Contexte

Besoin terrain identifie lors du redesign v2.0 (cf. evolution-design.md W-05 "Export CSV").
Cette fonctionnalite couvre le cas de defaillance : si l'application mobile livreur est
inaccessible, le responsable logistique peut fournir une feuille papier au livreur.

Le Domain Event emis est `CompositionExportee` afin de tracer les exports dans l'historique
de la TourneeTMS.

**Invariants a respecter** :
- L'export n'emet aucun changement d'etat sur la TourneeTMS (operation en lecture).
- Le fichier CSV genere ne peut pas contenir de donnees d'une tournee non encore
  importee depuis le TMS (la TourneeTMS doit exister dans le PlanDuJour courant).
- Le nom du fichier suit le format impose : `tournee-[ID]-[date].csv`.

---

## Criteres d'acceptation (Gherkin)

### Scenario 1 — Export CSV depuis W-05 onglet Composition

```gherkin
Given le logisticien est sur W-05 (detail d'une TourneeTMS), onglet Composition
When il clique sur le bouton "Exporter CSV"
Then le navigateur declenche le telechargement d'un fichier CSV
And le nom du fichier est "tournee-[ID de la tournee]-[date du jour].csv"
And l'evenement CompositionExportee est emis avec l'identifiant de la TourneeTMS
  et l'horodatage de l'export
```

### Scenario 2 — Contenu du fichier CSV conforme

```gherkin
Given une TourneeTMS avec N colis de composition variee
When le fichier CSV est genere
Then il contient exactement les colonnes : #Colis, Adresse, Zone, Contrainte
And chaque ligne correspond a un Colis de la TourneeTMS
And les contraintes sont serialisees en clair (ex : "Avant 14h, Fragile")
And le fichier est encode en UTF-8
```

### Scenario 3 — Bouton visible uniquement pour les tournees existantes

```gherkin
Given l'onglet Composition de W-05
When la TourneeTMS est correctement chargee et affiche ses colis
Then le bouton "Exporter CSV" est visible et actif
When la page est en etat de chargement ou en erreur
Then le bouton "Exporter CSV" est masque ou desactive
```

### Scenario 4 — Traçabilite de l'export dans l'historique

```gherkin
Given un export CSV qui vient d'etre realise
When le logisticien consulte l'historique de la TourneeTMS
Then l'evenement CompositionExportee est visible avec la date, l'heure et l'identifiant
  du logisticien ayant realise l'export
```

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#W-05
- Evolution Design : /livrables/02-ux/evolution-design.md (W-05 "Export CSV")
- US suggeree UX : evolution-design.md §2 US-suggeree-A
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
