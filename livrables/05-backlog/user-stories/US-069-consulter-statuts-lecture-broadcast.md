# US-069 : Consulter les statuts de lecture des broadcasts envoyes

**Epic** : EPIC-003 — Supervision et Pilotage Temps Reel
**Feature** : F-030 — Broadcast superviseur vers livreurs (Module 8)
**Bounded Context** : BC-03 Supervision (Read Model broadcast_statut_livraison)
**Aggregate(s) touches** : BroadcastMessage (lecture), BroadcastStatutLivraison (projection)
**Priorite** : Must Have
**Statut** : A affiner
**Complexite estimee** : S (3 points)

---

## User Story

En tant que Karim B. (superviseur logistique terrain),
je veux consulter, depuis le panneau W-09 de mon tableau de bord, combien de livreurs ont
lu chacun des messages broadcast que j'ai envoyes dans la journee, et voir le detail nominatif
par livreur,
afin de savoir si mon message a bien ete recu et d'identifier les livreurs qui ne l'ont pas
encore vu pour les contacter si necessaire.

---

## Contexte

Aujourd'hui, Karim envoie des messages sur WhatsApp sans aucune confirmation de lecture.
"S'il y a moyen de savoir qu'ils l'ont vu, encore mieux. Parce que la j'envoie un message
WhatsApp et je sais meme pas si le livreur a son telephone en mode silencieux." (Karim B.)

L'historique des broadcasts du jour est affiche dans la partie basse du panneau W-09 (section
"Historique des broadcasts du jour"). Pour chaque BroadcastMessage, le superviseur voit :
- un badge TypeBroadcast colore
- l'heure d'envoi
- le texte tronque (1 ligne)
- le compteur "Vu par N / M livreurs" (N = livreurs avec StatutBroadcast == VU,
  M = total des destinataires resolus)
- un chevron [>] pour acceder au detail nominatif

Le detail nominatif liste chaque BroadcastStatutLivraison du message avec le nom du livreur
et son statut (VU avec horodatage, ou EN ATTENTE).

La mise a jour du compteur est temps reel via le canal WebSocket STOMP existant (meme canal
que W-01, topic dedie `/topic/supervision/broadcasts/{date}`) : chaque Domain Event BroadcastVu
provoque une mise a jour de la projection broadcast_statut_livraison et une publication
WebSocket vers le superviseur.

**Invariants a respecter** :
- Un BroadcastMessage est immuable apres envoi : l'historique est en lecture seule.
  Ni modification ni suppression possible depuis W-09.
- La liste affichee est limitee aux broadcasts de la journee courante du superviseur
  (ENF-BROADCAST-003 : rétention journee courante uniquement).
- Seul l'auteur du broadcast (ou tout superviseur du meme perimetre) peut consulter
  le detail nominatif — acces restreint au role SUPERVISEUR (ENF-BROADCAST-006).
- Le compteur "Vu par N / M" se met a jour sans rechargement de page via WebSocket
  STOMP : la latence cible est < 5 secondes apres emission de BroadcastVu (ENF-BROADCAST-001).
- La projection broadcast_statut_livraison est la seule source authoritative pour
  les statuts de lecture ; elle est alimentee exclusivement par les Domain Events BroadcastVu.

---

## Criteres d'acceptation (Gherkin)

### Scenario 1 : Affichage de l'historique du jour dans W-09

```gherkin
Given Karim a envoye 3 BroadcastMessages dans la journee :
  - "ALERTE" a 09:12 vers 4 livreurs (2 vus)
  - "INFO" a 11:45 vers 4 livreurs (4 vus)
  - "CONSIGNE" a 14:03 vers 2 livreurs (0 vus)
And le panneau W-09 est ouvert
When Karim consulte la section "Historique des broadcasts du jour"
Then la liste affiche 3 items en ordre chronologique inverse (le plus recent en haut)
And chaque item affiche : badge TypeBroadcast colore, heure d'envoi, texte tronque 1 ligne,
  compteur "Vu par N / M livreurs", chevron [>]
And la CONSIGNE de 14:03 affiche "Vu par 0 / 2 livreurs"
And l'ALERTE de 09:12 affiche "Vu par 2 / 4 livreurs"
And l'INFO de 11:45 affiche "Vu par 4 / 4 livreurs"
```

### Scenario 2 : Mise a jour temps reel du compteur apres lecture d'un livreur

```gherkin
Given Karim consulte W-09 et voit "CONSIGNE" a "Vu par 0 / 2 livreurs"
When Pierre Morel ouvre M-08 et le message CONSIGNE devient visible
And le Domain Event BroadcastVu est emis avec
  broadcastMessageId=[id-consigne], livreurId=[livreur-pierre-morel]
And la projection broadcast_statut_livraison est mise a jour avec StatutBroadcast=VU
  pour Pierre Morel sur ce BroadcastMessage
Then dans W-09, le compteur de la CONSIGNE passe a "Vu par 1 / 2 livreurs"
And la mise a jour est visible en moins de 5 secondes (WebSocket STOMP)
And aucun rechargement de page n'est necessaire
```

### Scenario 3 : Consultation du detail nominatif d'un broadcast

```gherkin
Given Karim consulte W-09 et voit l'ALERTE de 09:12 a "Vu par 2 / 4 livreurs"
When Karim clique sur le chevron [>] de l'ALERTE
Then un panneau detail s'ouvre avec la liste des 4 BroadcastStatutLivraison :
  | Livreur         | Statut     | Horodatage    |
  | Pierre Morel    | VU         | 09:14         |
  | Paul Dupont     | VU         | 09:15         |
  | Marie Lambert   | EN ATTENTE | —             |
  | Jean Moreau     | EN ATTENTE | —             |
And les livreurs "EN ATTENTE" sont visuellement distingues des livreurs "VU"
And aucun bouton de modification ou suppression n'est present (lecture seule)
```

### Scenario 4 : Aucun broadcast envoye dans la journee

```gherkin
Given Karim ouvre le panneau W-09 pour la premiere fois de la journee
And aucun BroadcastMessage n'a ete envoye aujourd'hui
When Karim consulte la section "Historique des broadcasts du jour"
Then le message "Aucun message envoye aujourd'hui." est affiche
And la section du formulaire de composition reste accessible pour envoyer un premier message
```

### Scenario 5 : Persistance de l'historique pendant la journee courante

```gherkin
Given Karim a envoye un BroadcastMessage ALERTE a 08:30
And il est maintenant 17:00 (meme journee)
When Karim rouvre le panneau W-09
Then le BroadcastMessage de 08:30 est toujours visible dans l'historique
And le compteur "Vu par N / M livreurs" reflecte l'etat reel actuel de la projection

Given il est maintenant le lendemain matin a 08:00
When Karim ouvre le panneau W-09
Then l'historique est vide ("Aucun message envoye aujourd'hui.")
And les broadcasts du jour precedent ne sont plus affichés dans W-09
  (ENF-BROADCAST-003 : retention journee courante uniquement)
```

### Scenario 6 : Acces non autorise refuse

```gherkin
Given un utilisateur authentifie avec le role "livreur" tente d'acceder au detail
  nominatif d'un broadcast via l'URL directe /supervision/broadcasts/{id}/statuts
When la requete GET /api/supervision/broadcasts/{id}/statuts est soumise
Then le serveur repond avec HTTP 403 Forbidden
And aucune donnee de BroadcastStatutLivraison n'est exposee (ENF-BROADCAST-006)
```

---

## Contraintes techniques

- Endpoint liste du jour : `GET /api/supervision/broadcasts/du-jour?date=YYYY-MM-DD`
  - Acces : ROLE_SUPERVISEUR
  - Reponse : liste de BroadcastSummaryDTO {broadcastMessageId, type, texte, horodatageEnvoi,
    nombreDestinataires, nombreVus}
- Endpoint detail nominatif : `GET /api/supervision/broadcasts/{broadcastMessageId}/statuts`
  - Acces : ROLE_SUPERVISEUR
  - Reponse : liste de BroadcastStatutLivraisonDTO {livreurId, nomComplet, statut, horodatageVu}
- Read Model : table ou projection `broadcast_statut_livraison` dans svc-supervision.
  Alimentee par les Domain Events BroadcastVu via handler Spring Event.
- Canal temps reel : WebSocket STOMP, topic `/topic/supervision/broadcasts/{date}`.
  Publie a chaque mise a jour de BroadcastStatutLivraison (handler BroadcastVuEventHandler).
- Rétention : filtrer sur la date courante uniquement (ENF-BROADCAST-003).
  Les donnees des jours precedents ne sont pas exposees dans W-09 au MVP.
- Volumetrie : jusqu'a 750 BroadcastStatutLivraison par journee (ENF-BROADCAST-002).

---

## Dependances avec les User Stories existantes

| US | Titre | Type de dependance |
|----|-------|-------------------|
| US-057 | WebSocket STOMP tableau de bord temps reel | Partage le canal WebSocket STOMP — prerequis pour le temps reel |
| US-011 | Tableau de bord W-01 | W-09 est un drawer sur W-01 — partage la session WebSocket |
| US-067 | Envoyer broadcast superviseur | US-067 cree les BroadcastMessages dont US-069 lit les statuts |
| US-068 | Recevoir broadcast livreur | US-068 emet BroadcastVu qui alimente la projection lue par US-069 |

**Prerequis d'implementation** : US-067 et US-068 doivent etre au moins "Pretes" avant
US-069. US-057 (WebSocket STOMP) est un prerequis technique pour le temps reel ;
US-069 peut etre livree en polling REST si US-057 n'est pas disponible.

---

## Liens

- Wireframe W-09 (section historique) : /livrables/02-ux/wireframes.md#historique-des-broadcasts-du-jour
- Parcours : /livrables/02-ux/user-journeys.md#parcours-7--superviseur--envoyer-un-broadcast-a-ses-livreurs
- Domain model (BroadcastStatutLivraison) : /livrables/03-architecture-metier/domain-model.md
- ENF : /livrables/04-architecture-technique/exigences-non-fonctionnelles.md#enf-broadcast-003
- Module 8 : /livrables/03-architecture-metier/modules-fonctionnels.md#module-8--broadcast-superviseur
