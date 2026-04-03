# US-037 : Acceder a l'historique des consignes superviseur recues dans la journee

**Epic** : EPIC-004 : Notification et Messaging
**Feature** : F-013 : Notification push d'instruction au livreur
**Bounded Context** : BC-04 Notification et Messaging (Supporting Domain)
**Aggregate(s) touchés** : InstructionRecue (Read Model mobile)
**Priorité** : Should Have
**Statut** : Prête
**Complexité estimée** : M
**Wireframe de référence** : /livrables/02-ux/wireframes.md#M-07 (v1.3 — 2026-04-02)

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
- Chaque consigne affiche : badge de statut (NOUVELLE = bleu primaire, PRISE EN COMPTE = gris,
  EXECUTEE = vert), texte de la consigne, code colis associe ou "Non associe a un colis",
  et horodatage de reception (voir US-042 pour le format).
- La navigation depuis une consigne associee a un colis vers M-03 (detail du colis) est possible.
- Un ecran vide ("Aucune consigne recue aujourd'hui. Votre superviseur n'a pas envoye
  d'instruction.") est affiche si aucune InstructionRecue n'est presente.
- En mode offline : les consignes recues avant la perte de connexion restent accessibles
  (stockage local). Un bandeau orange "Hors connexion" est affiche.

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
And M-03 affiche les informations completes du colis COLIS-042
```

### Scenario 5b — Consigne sans colis associe : pas de navigation

```gherkin
Given M-07 affiche la consigne C-002 "Eviter la Rue du Port (travaux)"
And C-002 ne reference aucun colis (champ codeColis absent)
When le livreur appuie sur la ligne de la consigne C-002
Then aucune navigation n'est declenchee (la consigne est non interactive)
And C-002 affiche "Non associe a un colis" dans la zone du code colis
```

### Scenario 5c — Affichage des badges de statut par couleur

```gherkin
Given M-07 est affiche avec 3 consignes aux statuts Nouvelle, Prise en compte et Executee
When M-07 est affiche
Then la consigne au statut "Nouvelle" affiche un badge bleu primaire
And la consigne au statut "Prise en compte" affiche un badge gris neutre
And la consigne au statut "Executee" affiche un badge vert success
```

### Scenario 5d — Liste vide si aucune consigne recue

```gherkin
Given aucune InstructionRecue n'est presente dans le Read Model local pour la journee en cours
When le livreur ouvre M-07
Then le message "Aucune consigne recue aujourd'hui. Votre superviseur n'a pas envoye d'instruction."
  est affiche
```

### Scenario 5e — Mode offline : consignes locales accessibles

```gherkin
Given le livreur a recu 2 consignes avant la perte de connexion
And le statut reseau est hors connexion
When le livreur ouvre M-07
Then les 2 consignes stockees localement sont affichees
And un bandeau orange "Hors connexion" est visible en haut de l'ecran
And le message "Les nouvelles consignes ne peuvent pas arriver en mode hors connexion."
  est affiche sous le bandeau
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
And le message "Aucune consigne recue aujourd'hui. Votre superviseur n'a pas envoye d'instruction."
  est affiche
```

### Scenario 7b — Retour vers M-02 depuis M-07 met a jour le badge

```gherkin
Given le livreur est sur M-07 et a pris en compte toutes les consignes
When il appuie sur le bouton retour [<] vers M-02
Then M-02 est affiche
And le badge de l'icone "Mes consignes" dans le header de M-02 disparait
  (aucune consigne au statut "Nouvelle" restante)
```

---

## Definition of Done

- [ ] Le Read Model local `InstructionRecue` est cree et persiste les consignes des leur
      reception (independamment de l'etat du bandeau M-06).
- [ ] L'ecran M-07 "Mes consignes" est implemente avec la liste par ordre chronologique inverse.
- [ ] Chaque consigne affiche : badge de statut colore, texte, code colis ou "Non associe a un colis",
      et horodatage (US-042).
- [ ] Le badge sur l'icone dans M-02 affiche le nombre de consignes "Nouvelles".
- [ ] Le badge disparait sur M-02 apres retour depuis M-07 si toutes les consignes sont prises en compte.
- [ ] Le passage au statut "Prise en compte" est declenche a l'ouverture de M-07.
- [ ] Le passage au statut "Executee" est declenche apres l'action sur le colis cible.
- [ ] L'evenement `InstructionPriseEnCompte` est emis vers BC-03 a la lecture.
- [ ] La navigation depuis M-07 vers M-03 (detail colis cible) est implementee uniquement si
      la consigne a un codeColis associe.
- [ ] L'ecran vide ("Aucune consigne recue aujourd'hui") est affiche si aucune InstructionRecue.
- [ ] Le mode offline affiche les consignes locales avec bandeau orange.
- [ ] La reinitialisation a minuit est implementee (TTL sur les entrees du Read Model local).
- [ ] Tests unitaires sur le reducer/store des InstructionRecue.
- [ ] Tests E2E couvrant les scenarios 1 a 7b.
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

- Wireframe : /livrables/02-ux/wireframes.md#M-07 (v1.3 — ecran M-07 defini le 2026-04-02)
- Design visuel : /livrables/02-ux/design_web_designer.md
- Feedback source : /livrables/09-feedback/feedback-livreur-2026-03-30.md
- US liees : /livrables/05-backlog/user-stories/US-014-envoyer-instruction-livreur.md
- US liees : /livrables/05-backlog/user-stories/US-015-suivre-execution-instruction.md
- US liees : /livrables/05-backlog/user-stories/US-016-notification-push-instruction.md
- US complementaire horodatage : /livrables/05-backlog/user-stories/US-042-horodatage-consignes-ecran-m07.md
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
