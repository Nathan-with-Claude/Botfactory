# US-013 : Recevoir une alerte automatique dès qu'une tournée est à risque de retard

**Epic** : EPIC-003 — Supervision et Pilotage Temps Réel
**Feature** : F-011 — Détection automatique des tournées à risque
**Bounded Context** : BC-03 Supervision
**Aggregate(s) touchés** : VueTournee (Read Model), Instruction (Aggregate Root)
**Priorité** : Must Have
**Statut** : Prête
**Complexité estimée** : L (8 points)

---

## User Story

En tant que Laurent Renaud (responsable exploitation logistique),
je veux recevoir automatiquement une alerte visuelle et sonore sur mon tableau de bord
dès qu'une tournée est détectée comme à risque de dépasser les délais contractuels,
afin d'anticiper et corriger la situation avant qu'il soit trop tard, en moins de
15 minutes après l'apparition du risque.

---

## Contexte

Aujourd'hui Laurent détecte les retards uniquement quand ils sont déjà avérés. Le
service RisqueDetector (BC-03 Supervision) calcule en continu l'écart entre l'avancement
réel et l'avancement attendu de chaque tournée. Quand cet écart dépasse le seuil
configuré, les événements TournéeÀRisqueDétectée et AlerteDéclenchée sont émis. Le
tableau de bord W-01 reçoit ces événements via WebSocket et déclenche la mise en
surbrillance et le signal sonore.

**Invariants à respecter** :
- La détection d'une tournée à risque doit déclencher une alerte en moins de 15 minutes
  après l'apparition d'un écart de délai significatif.
- TournéeÀRisqueDétectée est un événement calculé : il est réévalué à chaque mise à
  jour du VueTournee.
- Le tableau de bord est mis à jour en moins de 30 secondes après tout changement de
  statut terrain.
- Une tournée ne peut être dans l'état "à risque" que si elle est au statut "en cours"
  (pas clôturée).

---

## Critères d'acceptation (Gherkin)

### Scénario 1 : Déclenchement automatique de l'alerte tournée à risque

```gherkin
Given la tournée T-043 (L. Petit) est en cours avec 6 / 20 colis traités
And l'écart entre l'avancement réel et l'avancement attendu dépasse le seuil de retard
When le service RisqueDetector calcule l'écart
Then l'événement TournéeÀRisqueDétectée est émis avec tourneeId = T-043 et
     retardEstime = 45 min
And l'événement AlerteDéclenchée est émis
And moins de 15 minutes se sont écoulées depuis l'apparition de l'écart de délai
```

### Scénario 2 : Affichage de l'alerte sur le tableau de bord

```gherkin
Given l'événement AlerteDéclenchée pour la tournée T-043 a été émis
When le tableau de bord W-01 reçoit l'événement via WebSocket
Then la ligne de la tournée T-043 est mise en surbrillance orange en moins de 30
     secondes
And l'icône d'alerte ⚠ est affichée sur la ligne
And le bandeau résumé met à jour "1 à risque" avec un point rouge clignotant
And une alerte sonore discrète est déclenchée une seule fois
```

### Scénario 3 : Résolution de l'alerte quand la tournée rattrape son retard

```gherkin
Given la tournée T-043 est en statut "À risque" avec un retard estimé de 45 min
When le livreur accélère et l'avancement recalculé repasse sous le seuil de risque
Then le statut de la tournée T-043 repasse à "EN COURS" dans le tableau de bord
And la surbrillance orange disparaît
And le compteur "À risque" revient à 0 dans le bandeau résumé
```

### Scénario 4 : Alerte sur tournée clôturée — ignorée

```gherkin
Given la tournée T-044 (S. Roger) est clôturée
When le service RisqueDetector évalue l'avancement de T-044
Then aucun événement TournéeÀRisqueDétectée n'est émis pour une tournée clôturée
And le statut "CLÔTURÉE" reste inchangé dans le tableau de bord
```

### Scénario 5 : Plusieurs alertes simultanées

```gherkin
Given les tournées T-043 et T-045 sont toutes les deux à risque simultanément
When le tableau de bord W-01 reçoit les deux AlerteDéclenchée
Then les deux tournées sont mises en surbrillance orange
And le bandeau résumé affiche "2 à risque"
And les tournées à risque sont affichées en haut du tableau (avant les tournées en cours)
```

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#écran-w-01--tableau-de-bord-des-tournées
- Parcours : /livrables/02-ux/user-journeys.md#parcours-2--superviseur--piloter-les-tournées-en-temps-réel
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
