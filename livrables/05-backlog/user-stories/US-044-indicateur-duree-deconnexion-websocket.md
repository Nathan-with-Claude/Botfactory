# US-044 : Afficher un compteur de durée de déconnexion WebSocket dans le bandeau superviseur

**Epic** : EPIC-003 : Supervision et Pilotage Temps Reel
**Feature** : F-009 : Tableau de bord des tournees du jour
**Bounded Context** : BC-03 Supervision (Core Domain)
**Aggregate(s) touches** : (etat de connexion — Read Model local navigateur)
**Priorite** : Should Have
**Statut** : Prete
**Complexite estimee** : S

---

## User Story

En tant que superviseur logistique,
je veux voir depuis combien de temps la connexion temps reel est indisponible
dans le bandeau d'alerte WebSocket,
afin d'evaluer l'impact de la deconnexion sur la fraicheur de mes donnees
et de prendre une decision informee (attendre, reconnecter manuellement, basculer
sur une autre source).

---

## Contexte

Feedback terrain du 2026-04-01 (Laurent Renaud) : le bandeau "Connexion temps reel
indisponible" signale l'absence de WebSocket mais n'indique pas depuis combien de temps
la deconnexion a eu lieu. En supervision de 15 tournees simultanees, la duree de
deconnexion est une information critique : 30 secondes de deconnexion est negligeable,
5 minutes signifie que les donnees affichees peuvent etre tres en retard.

Cette US ajoute un compteur en temps reel dans le bandeau OFFLINE / POLLING :
"Deconnecte depuis 3 min 42 s" avec un increment toutes les secondes.

**Comportement attendu** :
- Le compteur demarre a zero au moment ou le statut passe de LIVE a OFFLINE ou POLLING.
- Le compteur s'incremente chaque seconde (setInterval de 1000ms).
- Si la connexion est retablie (statut LIVE), le compteur se reinitialise et le bandeau
  disparait.
- Format du compteur :
  - < 60s : "Deconnecte depuis X s"
  - >= 60s : "Deconnecte depuis X min Y s"
  - >= 3600s : "Deconnecte depuis X h Y min"
- Le compteur est un etat local du composant (non persiste, non transmis au backend).

**Lien avec le bloquant identifie** :
Ce bloquant ("bandeau sans bouton Reconnecter ni compteur") est signale depuis le 30/03.
Cette US adresse la partie compteur. Un bouton "Reconnecter" pourrait faire l'objet d'une
US distincte (Could Have) car il implique de determiner le comportement de reconnexion
WebSocket manuelle.

**Invariants a respecter** :
- Le compteur est affiche uniquement si le statut est OFFLINE ou POLLING (pas en LIVE).
- La reinitialisation du compteur a lieu exactement au moment ou le statut repasse en LIVE.
- Le compteur ne genere aucun appel reseau, aucun evenement backend.

---

## Criteres d'acceptation (Gherkin)

### Scenario 1 — Compteur demarre a la deconnexion

```gherkin
Given le statut WebSocket est LIVE
When le statut passe en OFFLINE (perte de connexion)
Then le bandeau "Connexion temps reel indisponible" s'affiche
And le bandeau contient "Déconnecté depuis 0 s"
And le compteur s'incremente chaque seconde
```

### Scenario 2 — Format minutes apres 60 secondes

```gherkin
Given le superviseur est deconnecte depuis 90 secondes
When le bandeau est affiche
Then le compteur affiche "Déconnecté depuis 1 min 30 s"
```

### Scenario 3 — Reinitialisation a la reconnexion

```gherkin
Given le statut WebSocket est OFFLINE et le compteur affiche "3 min 12 s"
When le WebSocket se reconnecte (statut repasse en LIVE)
Then le bandeau OFFLINE disparait
And le compteur est reinitialise a zero
And aucun compteur n'est visible en etat LIVE
```

### Scenario 4 — Compteur actif en mode POLLING

```gherkin
Given le WebSocket est indisponible et le fallback HTTP polling est actif (statut POLLING)
When le bandeau est affiche
Then le compteur de deconnexion est affiche dans le bandeau
And le texte indique clairement le mode de fallback actif
```

### Scenario 5 — Compteur non affiche en etat LIVE

```gherkin
Given le statut WebSocket est LIVE
When TopAppBar est affiche
Then aucun compteur de deconnexion n'est visible
And le badge "LIVE" est affiche normalement
```

---

## Definition of Done

- [ ] Compteur de deconnexion affiche dans le bandeau OFFLINE / POLLING.
- [ ] Increment toutes les secondes via setInterval.
- [ ] Format adaptatif : "X s", "X min Y s", "X h Y min".
- [ ] Reinitialisation immediate a la reconnexion WebSocket.
- [ ] Nettoyage du setInterval au demontage du composant (eviter memory leaks).
- [ ] Tests Jest sur TopAppBar ou composant de bandeau : scenarios 1 a 5.
- [ ] Aucune regression sur US-032 (synchronisation read model), US-011 (tableau de bord temps reel).

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#W-01
- Feedback source : /livrables/09-feedback/feedback-superviseur-2026-04-01.md
- US liees : US-032 (synchronisation read model supervision), US-011 (tableau de bord temps reel)
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
