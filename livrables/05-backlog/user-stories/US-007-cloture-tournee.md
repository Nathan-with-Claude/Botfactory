# US-007 : Clôturer ma tournée et consulter le récapitulatif

**Epic** : EPIC-001 — Exécution de la Tournée
**Feature** : F-006 — Clôture de tournée
**Bounded Context** : BC-01 Orchestration de Tournée
**Aggregate(s) touchés** : Tournée (Aggregate Root)
**Priorité** : Must Have
**Statut** : Prête
**Complexité estimée** : S (3 points)

---

## User Story

En tant que Pierre Morel (livreur terrain),
je veux clôturer ma tournée une fois tous mes colis traités et voir immédiatement un
récapitulatif de ma journée (livrés, échecs, incidents),
afin de confirmer officiellement la fin de ma tournée dans le SI et de connaître mon
bilan de la journée sans double saisie au dépôt.

---

## Contexte

Aujourd'hui, Pierre rentre au dépôt et remet sa feuille papier. Les données sont
saisies manuellement dans le SI le soir ou le lendemain. Avec DocuPost, la clôture
génère l'événement TournéeClôturée, déclenche la synchronisation finale vers l'OMS et
affiche un récapitulatif immédiat.

La clôture est bloquée si au moins un colis est encore au statut "à livrer" ou si la
file de synchronisation offline n'est pas vide.

**Invariants à respecter** :
- Une Tournée ne peut être clôturée que si tous ses Colis ont un statut terminal :
  livré, échec, à représenter (aucun colis ne doit rester à "à livrer").
- La clôture est bloquée tant que la file de synchronisation offline n'est pas vide.
- L'identifiant du livreur est immuable une fois la Tournée démarrée.
- L'événement TournéeClôturée est émis une seule fois par tournée (idempotent).

---

## Critères d'acceptation (Gherkin)

### Scénario 1 : Clôture normale de la tournée

```gherkin
Given Pierre a traité tous ses 22 colis (18 livrés, 3 en échec, 1 à représenter)
And la file de synchronisation offline est vide
When Pierre appuie sur "Clôturer la tournée" sur M-02
Then l'événement TournéeClôturée est émis avec tourneeId, livreurId, horodatage et
     récapitulatif (18 livrés, 3 échecs, 1 à représenter)
And l'OMS reçoit l'événement de clôture en moins de 30 secondes
And l'écran de récapitulatif est affiché avec : 18 livrés, 3 échecs, 1 à représenter
And le bouton "Clôturer la tournée" n'est plus accessible
```

### Scénario 2 : Clôture bloquée — colis encore "à livrer"

```gherkin
Given Pierre a encore 2 colis au statut "à livrer"
When Pierre visualise l'écran M-02
Then le bouton "Clôturer la tournée" n'est pas visible (ou est désactivé)
And le bandeau de progression affiche "Reste à livrer : 2 / 22 colis"
```

### Scénario 3 : Clôture bloquée — synchronisation offline en cours

```gherkin
Given Pierre a traité tous ses colis mais 1 action est en attente de synchronisation
When Pierre appuie sur "Clôturer la tournée"
Then le système affiche "Synchronisation en cours — Attendez la fin avant de clôturer"
And le bouton de clôture reste désactivé jusqu'à la fin de la synchronisation
```

### Scénario 4 : Récapitulatif affiché après clôture

```gherkin
Given Pierre a clôturé sa tournée avec succès
When l'écran de récapitulatif est affiché
Then le récapitulatif contient :
     - Nombre total de colis : 22
     - Livrés : 18
     - Échecs : 3 (avec motifs résumés)
     - À représenter : 1
And une micro-enquête de satisfaction (note 1 à 5) est proposée
And le résultat est transmis au système pour les KPIs de satisfaction livreur
```

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#écran-m-02--liste-des-colis-de-la-tournée
- Parcours : /livrables/02-ux/user-journeys.md#parcours-1--livreur--exécuter-une-tournée
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
