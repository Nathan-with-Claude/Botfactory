# US-016 : Recevoir une notification push quand le superviseur modifie ma tournée

**Epic** : EPIC-004 — Notification et Messaging
**Feature** : F-013 — Notification push d'instruction au livreur
**Bounded Context** : BC-04 Notification
**Aggregate(s) touchés** : Tournée (BC-01, modification via instruction)
**Priorité** : Must Have
**Statut** : Prête
**Complexité estimée** : M (5 points)

---

## User Story

En tant que Pierre Morel (livreur terrain),
je veux recevoir une notification push structurée sur mon application mobile quand le
superviseur m'envoie une instruction ou ajoute un colis urgent à ma tournée,
afin d'être informé immédiatement sans que le superviseur ait à m'appeler au téléphone,
et que ma liste de colis se mette à jour automatiquement.

---

## Contexte

Aujourd'hui Pierre apprend les modifications de sa tournée par un appel téléphonique,
souvent au mauvais moment. La notification push (via Firebase Cloud Messaging) est
livrée par le BC-04 Notification en réponse aux événements InstructionEnvoyée et
TournéeModifiée. L'écran M-06 affiche un bandeau overlay sur l'écran courant. La liste
de colis se met à jour en arrière-plan.

**Invariants à respecter** :
- L'événement InstructionReçue est émis côté livreur dès que la notification push est
  livrée à l'application.
- La liste de colis (M-02) est mise à jour automatiquement dès réception de
  l'InstructionReçue, sans rechargement manuel.
- Le bandeau overlay disparaît automatiquement après 10 secondes si Pierre n'interagit
  pas, mais la modification de la liste reste effective.
- En mode offline, la notification push est mise en queue et livrée dès le retour de
  connexion.

---

## Critères d'acceptation (Gherkin)

### Scénario 1 : Réception d'une notification push d'instruction en mode connecté

```gherkin
Given Pierre est sur l'écran M-02 en mode connecté
And Laurent a envoyé une instruction "Prioriser le colis #00312"
When la notification push est livrée à l'application mobile de Pierre
Then le bandeau overlay M-06 s'affiche par-dessus l'écran courant avec :
     "INSTRUCTION SUPERVISEUR — Prioriser le colis #00312 — 25 Rue Victor Hugo"
And un bouton "VOIR" est disponible dans le bandeau
And l'événement InstructionReçue est émis avec instructionId et livreurId = Pierre
```

### Scénario 2 : Mise à jour automatique de la liste de colis après instruction

```gherkin
Given Pierre a reçu la notification push d'instruction "Prioriser le colis #00312"
When l'InstructionReçue est traitée par l'application
And l'événement TournéeModifiée est consommé
Then la liste de colis M-02 est mise à jour automatiquement (le colis #00312 est
     remonté en haut de liste ou mis en évidence)
And la mise à jour est visible sans rechargement de page
```

### Scénario 3 : Navigation vers le détail du colis depuis la notification

```gherkin
Given le bandeau overlay M-06 est affiché pour l'instruction sur le colis #00312
When Pierre appuie sur "VOIR"
Then l'écran M-03 (Détail du colis #00312) s'affiche directement
And Pierre voit les informations du colis #00312 avec l'instruction signalée
```

### Scénario 4 : Disparition automatique du bandeau après 10 secondes

```gherkin
Given le bandeau overlay M-06 est affiché
When Pierre n'interagit pas avec le bandeau pendant 10 secondes
Then le bandeau disparaît automatiquement
And la liste de colis reste mise à jour (la modification persiste)
And aucune donnée n'est perdue
```

### Scénario 5 : Notification push reçue quand l'application est en arrière-plan

```gherkin
Given Pierre a mis l'application en arrière-plan et travaille sur autre chose
When Laurent envoie une instruction urgente
Then la notification push s'affiche dans la barre de notifications du système Android
And le message inclut "DocuPost — Instruction superviseur : [résumé]"
And en appuyant sur la notification, l'application s'ouvre directement sur M-06
```

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#écran-m-06--notification-dinstruction-reçue
- Parcours : /livrables/02-ux/user-journeys.md#parcours-5--superviseur--envoyer-une-instruction-à-un-livreur
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
