# US-037 : Acceder a l'historique des consignes superviseur recues dans la journee

**Epic** : EPIC-004 : Notification et Messaging
**Feature** : F-013 : Notification push d'instruction au livreur
**Bounded Context** : BC-04 Notification et Messaging (Supporting Domain)
**Aggregate(s) touchés** : InstructionRecue (Read Model mobile)
**Priorité** : Should Have
**Statut** : Prête
**Complexité estimée** : M

---

## User Story

En tant que livreur terrain,
je veux pouvoir consulter la liste de toutes les consignes que mon superviseur m'a envoyees
dans la journee depuis un ecran dedie accessible depuis ma liste de colis,
afin de ne perdre aucune consigne que j'aurais manquee lorsque le bandeau d'instruction
a disparu pendant que j'etais occupe.

---

## Contexte

Feedback terrain du 2026-03-30 (Pierre Morel, Livreur terrain) :
le bandeau d'instruction superviseur (M-06) disparait apres 10 secondes. Si le livreur est
en train de monter dans son camion, de chercher une adresse ou de faire signer un destinataire,
il peut manquer la consigne sans moyen de la retrouver. La seule trace accessible est le statut
d'execution sur l'interface web du superviseur (US-015) — mais cote livreur, la consigne est
perdue une fois le bandeau ferme.

Cette US cree un ecran "Mes consignes" (nouvel ecran M-07) accessible depuis le header ou la
barre de navigation de la liste des colis (M-02). Les consignes sont stockees localement
(Read Model mobile) des leur reception, independamment de l'affichage du bandeau.

**Invariants a respecter** :
- Toute `InstructionRecue` est persistee localement sur l'appareil des sa reception via
  le canal WebSocket / push, independamment de l'etat du bandeau d'affichage.
- Le Read Model local `InstructionRecue` contient : l'identifiant de la consigne, le texte
  de la consigne, l'horodatage de reception, le codeColis associe (si applicable) et
  le statut (Nouvelle / Prise en compte / Executee).
- Le statut "Nouvelle" est assigne a la reception.
- Le statut passe a "Prise en compte" lorsque le livreur ouvre l'ecran "Mes consignes"
  et que la consigne est visible (lecture confirmee). L'evenement `InstructionPriseEnCompte`
  est emis vers le superviseur.
- Le statut passe a "Executee" lorsque l'action associee au colis est realisee
  (LivraisonConfirmee ou EchecLivraisonDeclare sur le colis cible).
- L'historique est limite a la journee en cours (reinitialise a minuit).
- Les consignes sont affichees par ordre chronologique inverse (la plus recente en premier).

---

## Criteres d'acceptation (Gherkin)

### Scenario 1 — Persistance de la consigne a la reception

```gherkin
Given le livreur a le bandeau d'instruction (M-06) affiche pour la consigne C-001
  "Prioriser le colis COLIS-042 — client urgent"
When le bandeau disparait apres 10 secondes (ou est ferme manuellement)
Then la consigne C-001 est persistee dans le Read Model local InstructionRecue
  avec le statut "Nouvelle"
And la consigne C-001 est accessible depuis l'ecran "Mes consignes" (M-07)
```

### Scenario 2 — Acces a l'ecran "Mes consignes" depuis la liste des colis

```gherkin
Given le livreur est sur M-02 (liste des colis de la tournee)
And au moins une InstructionRecue est presente dans le Read Model local
When il appuie sur l'icone "Mes consignes" dans le header de M-02
Then M-07 (ecran "Mes consignes") s'affiche
And la liste des consignes de la journee est affichee par ordre chronologique inverse
And chaque consigne affiche : le texte, l'horodatage de reception, le code colis associe
  (si applicable) et son statut (Nouvelle / Prise en compte / Executee)
```

### Scenario 3 — Passage au statut "Prise en compte" a l'ouverture de M-07

```gherkin
Given le livreur ouvre M-07 et la consigne C-001 est au statut "Nouvelle"
When M-07 est affiche et la consigne C-001 est visible a l'ecran
Then le statut de C-001 passe a "Prise en compte"
And l'evenement InstructionPriseEnCompte est emis vers BC-03 (supervision)
And le superviseur voit le statut de la consigne passer a "Prise en compte" sur W-02
```

### Scenario 4 — Passage au statut "Executee" apres action sur le colis cible

```gherkin
Given la consigne C-001 "Prioriser le colis COLIS-042" est au statut "Prise en compte"
When le livreur confirme la livraison de COLIS-042 (LivraisonConfirmee emis)
Then le statut de C-001 dans M-07 passe a "Executee"
And l'evenement InstructionExecutee est emis vers BC-03 (supervision)
```

### Scenario 5 — Navigation directe vers le colis cible depuis M-07

```gherkin
Given M-07 affiche la consigne C-001 associee a COLIS-042
When le livreur appuie sur la ligne de la consigne C-001
Then l'ecran M-03 (detail du colis COLIS-042) s'affiche
```

### Scenario 6 — Indicateur de nouvelles consignes sur le bouton d'acces

```gherkin
Given le livreur est sur M-02 et une nouvelle InstructionRecue au statut "Nouvelle" existe
When M-02 est affiche
Then l'icone "Mes consignes" dans le header affiche un badge avec le nombre de consignes
  au statut "Nouvelle" (ex : badge rouge "1")
```

### Scenario 7 — Reinitialisation de l'historique a minuit

```gherkin
Given le livreur a 5 consignes dans M-07 de la journee J
When il ouvre M-07 le lendemain (jour J+1)
Then la liste des consignes est vide
And le message "Aucune consigne recue aujourd'hui" est affiche
```

---

## Definition of Done

- [ ] Le Read Model local `InstructionRecue` est cree et persiste les consignes des leur
      reception (independamment de l'etat du bandeau M-06).
- [ ] L'ecran M-07 "Mes consignes" est implemente avec la liste par ordre chronologique inverse.
- [ ] Le badge sur l'icone dans M-02 affiche le nombre de consignes "Nouvelles".
- [ ] Le passage au statut "Prise en compte" est declenche a l'ouverture de M-07.
- [ ] Le passage au statut "Executee" est declenche apres l'action sur le colis cible.
- [ ] L'evenement `InstructionPriseEnCompte` est emis vers BC-03 a la lecture.
- [ ] La navigation depuis M-07 vers M-03 (detail colis cible) est implementee.
- [ ] La reinitialisation a minuit est implementee (TTL sur les entrees du Read Model local).
- [ ] Tests unitaires sur le reducer/store des InstructionRecue.
- [ ] Tests E2E couvrant les scenarios 1 a 6.
- [ ] Aucune regression sur le bandeau M-06 (US-016) et le suivi instruction superviseur (US-015).

---

## Dépendances

- **US-014** (prerequis) : l'envoi d'instruction depuis le superviseur doit etre en place.
- **US-015** : la mise a jour du statut cote superviseur utilise les evenements
  `InstructionPriseEnCompte` et `InstructionExecutee` egalement emis par cette US.
- **US-016** (prerequis) : le canal de reception des notifications push sur mobile
  doit etre en place pour alimenter le Read Model `InstructionRecue`.

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#M-06 (ecran M-07 a creer)
- Feedback source : /livrables/09-feedback/feedback-livreur-2026-03-30.md
- US liees : /livrables/05-backlog/user-stories/US-014-envoyer-instruction-livreur.md
- US liees : /livrables/05-backlog/user-stories/US-015-suivre-execution-instruction.md
- US liees : /livrables/05-backlog/user-stories/US-016-notification-push-instruction.md
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
