# US-014 : Envoyer une instruction structurée à un livreur depuis le tableau de bord

**Epic** : EPIC-003 — Supervision et Pilotage Temps Réel
**Feature** : F-012 — Envoi d'une instruction structurée au livreur
**Bounded Context** : BC-03 Supervision
**Aggregate(s) touchés** : Instruction (Aggregate Root)
**Priorité** : Must Have
**Statut** : Prête
**Complexité estimée** : M (5 points)

---

## User Story

En tant que Laurent Renaud (responsable exploitation logistique),
je veux envoyer une instruction normalisée (prioriser, annuler, reprogrammer) à un
livreur depuis le détail de sa tournée, sans passer par un appel téléphonique,
afin d'agir directement sur la tournée en cours avec une trace complète de la décision
et sans interrompre le livreur de façon non structurée.

---

## Contexte

Aujourd'hui Laurent appelle le livreur, lui dicte une instruction verbale non tracée,
et n'a aucun moyen de vérifier qu'elle a bien été prise en compte. Le panneau W-03
permet de composer une instruction normalisée, de l'envoyer via notification push et de
suivre son exécution. L'instruction est historisée avec l'identité de Laurent et son
horodatage.

**Invariants à respecter** :
- Une Instruction ne peut être envoyée que vers un Colis dont le statut est "à livrer"
  dans une Tournée active.
- Un Colis ne peut avoir qu'une seule Instruction en attente à la fois.
- Une Instruction de type "reprogrammer" requiert obligatoirement un créneau cible
  (date + heure).
- Toute Instruction envoyée est historisée avec l'identité du superviseur émetteur.
- Les types d'instruction autorisés sont : Prioriser, Annuler, Reprogrammer.

---

## Critères d'acceptation (Gherkin)

### Scénario 1 : Envoi d'une instruction "Prioriser"

```gherkin
Given Laurent est sur l'écran W-02 et le colis #00312 a le statut "À livrer"
When Laurent clique sur "Instructionner" pour le colis #00312
And le panneau W-03 s'ouvre avec le colis #00312 en contexte
And Laurent sélectionne le type d'instruction "Prioriser ce colis"
And Laurent clique sur "ENVOYER"
Then l'événement InstructionEnvoyée est émis avec instructionId, tourneeId, colisId =
     #00312, type = Prioriser, superviseurId (Laurent), horodatage
And une notification push est envoyée à Pierre via FCM
And un toast "Instruction envoyée à P. Morel" confirme l'envoi dans l'interface web
And le panneau W-03 se ferme
```

### Scénario 2 : Instruction "Reprogrammer" sans créneau — validation bloquée

```gherkin
Given Laurent est sur le panneau W-03 pour le colis #00312
And Laurent sélectionne le type "Reprogrammer"
When les champs de créneau cible (date et heure) sont vides
Then le bouton "ENVOYER" est désactivé
And un message "Veuillez renseigner la date et l'heure cibles pour reprogrammer" est
     affiché
```

### Scénario 3 : Instruction "Reprogrammer" avec créneau valide

```gherkin
Given Laurent est sur le panneau W-03 pour le colis #00312
And Laurent sélectionne "Reprogrammer"
And Laurent saisit la date "20/03/2026" et l'heure "10h00"
When Laurent clique sur "ENVOYER"
Then l'événement InstructionEnvoyée est émis avec type = Reprogrammer et
     creneauCible = 20/03/2026 10:00
And la notification push envoyée à Pierre indique "Reprogrammer le colis #00312 —
     Nouveau créneau : 20/03 à 10h00"
```

### Scénario 4 : Instruction bloquée — colis déjà avec une instruction en attente

```gherkin
Given le colis #00312 a déjà une Instruction de type "Prioriser" au statut "Envoyée"
When Laurent tente d'envoyer une nouvelle instruction pour le colis #00312
Then le système affiche "Une instruction est en attente d'exécution. Attendez la
     confirmation du livreur avant d'en envoyer une nouvelle."
And aucun événement InstructionEnvoyée n'est émis
```

### Scénario 5 : Instruction bloquée — colis au statut terminal

```gherkin
Given le colis #00247 a le statut "livré"
When Laurent tente d'accéder au bouton "Instructionner" pour ce colis
Then le bouton "Instructionner" est absent ou désactivé pour ce colis
And aucune instruction ne peut être créée pour un colis au statut terminal
```

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#écran-w-03--panneau-denvoi-dune-instruction
- Parcours : /livrables/02-ux/user-journeys.md#parcours-5--superviseur--envoyer-une-instruction-à-un-livreur
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
