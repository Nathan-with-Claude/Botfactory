# US-042 : Afficher la date et l'heure d'émission de chaque consigne dans M-07

**Epic** : EPIC-004 : Notification et Messaging
**Feature** : F-013 : Notification push d'instruction au livreur
**Bounded Context** : BC-04 Notification et Messaging (Supporting Domain)
**Aggregate(s) touches** : InstructionRecue (Read Model mobile)
**Priorite** : Should Have
**Statut** : Prete
**Complexite estimee** : XS

---

## User Story

En tant que livreur terrain,
je veux voir la date et l'heure d'emission de chaque consigne dans la liste M-07,
afin de savoir laquelle est la plus recente quand j'ai plusieurs consignes en attente
et de prioriser mon attention.

---

## Contexte

Feedback terrain du 2026-04-01 (Pierre Morel) : l'ecran M-07 (Mes consignes) livre par
US-037 affiche la liste des consignes avec le texte, le code colis et le statut, mais pas
l'horodatage d'emission. Avec plusieurs consignes dans la liste, Pierre ne peut pas
determiner laquelle est arrivee en premier ou la plus recente.

La donnee `horodatageReception` est deja stockee dans le Read Model local `InstructionRecue`
(invariant defini dans US-037 : "le Read Model local contient l'horodatage de reception").
Cette US ne necessite aucune modification du modele de donnees — uniquement une modification
de l'affichage dans MesConsignesScreen.

**Format d'affichage propose** :
- Si la consigne est du jour courant : afficher l'heure uniquement (ex. "14:35")
- Si la consigne date d'un autre jour (cas marginal avant reinitialisation minuit) : afficher
  la date + heure (ex. "31/03 09:12")
- Placement : sous le texte de la consigne, en typographie secondaire (style leger)

**Invariants a respecter** :
- L'horodatage affiche est celui de la reception locale sur le mobile (champ
  `horodatageReception` du Read Model `InstructionRecue`), pas celui de l'emission serveur.
- L'affichage est en lecture seule — aucun Domain Event emis.
- Les consignes restent triees par ordre chronologique inverse (la plus recente en premier),
  comme defini dans US-037.

---

## Criteres d'acceptation (Gherkin)

### Scenario 1 — Horodatage visible sous chaque consigne

```gherkin
Given le livreur est sur M-07 (ecran "Mes consignes")
And au moins une InstructionRecue est presente dans le Read Model local
When M-07 est affiche
Then chaque consigne affiche son horodatage de reception
And l'horodatage est place sous le texte de la consigne
And le format est "HH:mm" pour les consignes recues aujourd'hui
```

### Scenario 2 — Ordre chronologique inverse confirme avec horodatage

```gherkin
Given le livreur a recu 3 consignes a 09:00, 11:30 et 14:45
When M-07 est affiche
Then la consigne de 14:45 apparait en premier
And la consigne de 11:30 apparait en deuxieme
And la consigne de 09:00 apparait en troisieme
And chaque consigne affiche son heure correcte
```

### Scenario 3 — Format date+heure si consigne hors du jour courant

```gherkin
Given une consigne a ete recue avant la reinitialisation de minuit (cas exceptionnel)
And la consigne porte un horodatage de la veille
When M-07 est affiche
Then la consigne affiche le format "JJ/MM HH:mm" (ex. "31/03 22:47")
```

---

## Definition of Done

- [ ] Horodatage `horodatageReception` affiche sous le texte de chaque consigne dans MesConsignesScreen.
- [ ] Format "HH:mm" pour les consignes du jour courant.
- [ ] Format "JJ/MM HH:mm" pour les consignes hors du jour.
- [ ] Tests unitaires sur le composant consigne (formatage de la date).
- [ ] Tests mis a jour dans MesConsignesScreen.test.tsx.
- [ ] Aucune regression sur l'ordre d'affichage (US-037), le badge de comptage (US-037)
      et la navigation vers M-03 (US-037).

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#M-07
- Feedback source : /livrables/09-feedback/feedback-livreur-2026-04-01.md
- US liees : US-037 (historique consignes livreur — prerequis)
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
