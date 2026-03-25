# US-015 : Suivre l'état d'exécution d'une instruction envoyée à un livreur

**Epic** : EPIC-003 — Supervision et Pilotage Temps Réel
**Feature** : F-012 — Envoi d'une instruction structurée au livreur
**Bounded Context** : BC-03 Supervision
**Aggregate(s) touchés** : Instruction (Aggregate Root)
**Priorité** : Must Have
**Statut** : Prête
**Complexité estimée** : S (3 points)

---

## User Story

En tant que Laurent Renaud (responsable exploitation logistique),
je veux voir en temps réel l'état d'exécution d'une instruction que j'ai envoyée à un
livreur (envoyée, prise en compte, exécutée),
afin de savoir sans appel téléphonique si le livreur a bien reçu et appliqué mon
instruction.

---

## Contexte

Aujourd'hui Laurent n'a aucun retour sur l'exécution de ses instructions : il doit
rappeler le livreur pour savoir si l'instruction a été suivie. L'agrégat Instruction
passe par les statuts Envoyée → PriseEnCompte → Executée. Ces transitions sont
déclenchées par les Domain Events côté livreur (InstructionReçue, TournéeModifiée) et
synchronisées sur le tableau de bord via le bus d'événements.

**Invariants à respecter** :
- Les transitions de statut autorisées pour une Instruction sont :
  Envoyée → PriseEnCompte → Executée.
- Toute transition de statut génère un événement horodaté.
- Une Instruction au statut "Executée" est archivée et ne peut plus être modifiée.
- Toute instruction est historisée avec l'identité du superviseur émetteur.

---

## Critères d'acceptation (Gherkin)

### Scénario 1 : Instruction passant de "Envoyée" à "Prise en compte"

```gherkin
Given Laurent a envoyé une instruction de type Prioriser pour le colis #00312
And l'instruction a le statut "Envoyée"
When Pierre reçoit la notification push (événement InstructionReçue émis)
And Pierre consulte le détail du colis #00312 sur M-03
Then l'événement InstructionExecutée est émis côté livreur avec instructionId et
     horodatage
And le statut de l'instruction dans W-02 passe de "Envoyée" à "Exécutée" en moins de
     30 secondes
And Laurent voit la mise à jour sans rechargement de page
```

### Scénario 2 : Statut "Envoyée" persistant si la notification n'est pas encore reçue

```gherkin
Given Laurent a envoyé une instruction pour le colis #00312
And la notification push n'a pas encore été livrée (Pierre est hors connexion)
When Laurent consulte l'état de l'instruction dans W-02
Then le statut de l'instruction est "Envoyée"
And aucune modification automatique n'est faite tant que Pierre ne l'a pas réceptionnée
```

### Scénario 3 : Historique des instructions visible dans le détail de la tournée

```gherkin
Given la tournée T-043 a reçu 2 instructions aujourd'hui
When Laurent consulte l'écran W-02 onglet "Instructions" (ou section dédiée)
Then les 2 instructions sont listées avec :
     - Type d'instruction
     - Colis concerné
     - Horodatage d'envoi
     - Statut actuel (Envoyée / Exécutée)
     - Identité du superviseur émetteur (Laurent Renaud)
```

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#écran-w-02--détail-dune-tournée
- Parcours : /livrables/02-ux/user-journeys.md#parcours-5--superviseur--envoyer-une-instruction-à-un-livreur
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
