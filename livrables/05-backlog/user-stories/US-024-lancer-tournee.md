# US-024 : Lancer une tournée pour la rendre visible au livreur

**Epic** : EPIC-007 — Planification et Préparation des Tournées (interface web logisticien)
**Feature** : F-021 — Lancement des tournées
**Bounded Context** : BC-07 Planification de Tournée
**Aggregate(s) touchés** : TournéeTMS, Affectation
**Priorité** : Must Have
**Statut** : Prête
**Complexité estimée** : S (3 points)

---

## User Story

En tant que Laurent Renaud (responsable exploitation logistique),
je veux lancer une tournée affectée,
afin de la rendre visible dans l'application mobile du livreur concerné et de
déclencher le Parcours 1 (exécution livreur).

---

## Contexte

Le lancement est le dernier acte du Parcours 0. Il déclenche la transition
TournéeLancée (BC-07) → TournéeChargée (BC-01), rendant la tournée disponible
dans l'application mobile du livreur affecté. Sans cette étape, le livreur ne peut
pas démarrer sa journée depuis l'application DocuPost.

Le LanceurTournée (BC-07) publie l'événement TournéeLancée, consommé par le BC-01
(Orchestration de Tournée) qui déclenche le chargement de la tournée dans l'app mobile.

**Invariants à respecter** :
- Une TournéeTMS ne peut être lancée que si elle est au statut "Affectée" (livreur +
  véhicule tous deux renseignés).
- Le lancement est irréversible depuis l'interface : une tournée lancée ne peut pas
  revenir au statut "Non affectée" sans intervention administrative.
- L'événement TournéeLancée doit être émis et consommé par BC-01 avant que la tournée
  soit visible dans l'app mobile (cohérence garantie par le bus d'événements).
- Seul un utilisateur avec le rôle "superviseur" peut lancer une tournée (BC-06).

---

## Critères d'acceptation (Gherkin)

### Scénario 1 : Lancement d'une tournée avec affectation complète

```gherkin
Given une TournéeTMS est au statut "Affectée" (livreur et véhicule renseignés)
And Laurent Renaud est sur l'écran W-04 ou W-05
When il clique sur le bouton "Lancer"
Then l'événement TournéeLancée est émis avec :
     - L'identifiant de la tournée
     - L'identifiant du livreur affecté
     - L'horodatage du lancement
And la tournée passe au statut "Lancée" sur l'écran W-04
And la tournée devient visible dans l'application mobile du livreur affecté
     (l'événement TournéeChargée est émis par BC-01)
```

### Scénario 2 : Bouton "Lancer" désactivé si affectation incomplète

```gherkin
Given une TournéeTMS est au statut "Non affectée" (sans livreur ou sans véhicule)
And Laurent Renaud est sur l'écran W-04 ou W-05
When l'écran s'affiche
Then le bouton "Lancer" est désactivé (grisé)
And un message explicatif indique ce qui manque pour pouvoir lancer
     (ex. "Affectez un livreur et un véhicule avant de lancer cette tournée")
```

### Scénario 3 : Lancement groupé de toutes les tournées affectées

```gherkin
Given plusieurs TournéesTMS sont au statut "Affectée" dans le plan du jour
And Laurent Renaud est sur l'écran W-04 (vue liste)
When il clique sur "Lancer toutes les tournées affectées"
Then toutes les TournéesTMS au statut "Affectée" passent au statut "Lancée"
And un événement TournéeLancée est émis pour chacune
And un récapitulatif affiche le nombre de tournées lancées
     (ex. "5 tournées lancées avec succès")
```

### Scénario 4 : Tournée déjà lancée — idempotence

```gherkin
Given une TournéeTMS est déjà au statut "Lancée"
When Laurent Renaud tente de cliquer à nouveau sur "Lancer"
Then le bouton "Lancer" n'est plus affiché (remplacé par le badge "Lancée")
And aucun événement supplémentaire n'est émis
```

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#écran-w-04--vue-liste-des-tournées-du-matin
- Wireframe : /livrables/02-ux/wireframes.md#écran-w-05--détail-dune-tournée-à-préparer
- Parcours : /livrables/02-ux/user-journeys.md#parcours-0--responsable-logistique--préparer-les-tournées-du-jour
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
- Modules fonctionnels : /livrables/03-architecture-metier/modules-fonctionnels.md#module-8
