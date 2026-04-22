# US-068 : Recevoir et consulter les messages broadcast sur l'application mobile

**Epic** : EPIC-004 — Notification et Messaging
**Feature** : F-030 — Broadcast superviseur vers livreurs (Module 8)
**Bounded Context** : BC-03 Supervision (emission BroadcastVu) / BC-04 Notification (reception FCM)
**Aggregate(s) touches** : BroadcastMessage (MarquerBroadcastVu), BroadcastStatutLivraison
**Priorite** : Must Have
**Statut** : A affiner
**Complexite estimee** : M (5 points)

---

## User Story

En tant que Pierre Morel (livreur terrain),
je veux etre notifie immediatement des messages broadcast de mon superviseur, meme si
l'application est en arriere-plan, et pouvoir les consulter dans une zone dediee de
l'application,
afin de rester informe des incidents terrain et consignes operationnelles sans etre
interrompu par un appel telephonique pendant ma tournee.

---

## Contexte

Aujourd'hui, le superviseur appelle les livreurs un par un ou passe par un groupe WhatsApp
informel. Les livreurs conduisent et ne peuvent pas repondre facilement au telephone.
"Un message qui s'affiche sur leur ecran au bon moment, c'est tout ce que je demande." (Karim B.)

La reception se fait en deux temps :
1. Notification push FCM (app en arriere-plan ou premier plan) : overlay system Android,
   puis a la reouverture de l'app l'overlay broadcast est affiche si le message date de
   moins de 5 minutes.
2. Zone dediee M-08 (accessible depuis l'icone campaign dans le header de M-02) : liste
   chronologique inverse de tous les BroadcastMessages du jour avec badge de non-lus.

A l'ouverture de M-08, tous les messages non lus deviennent "lus" : la commande
MarquerBroadcastVu est appelee pour chaque message non acquitte, ce qui emet le Domain Event
BroadcastVu. L'appel se fait via l'endpoint REST `POST /api/supervision/broadcasts/{id}/vu`
(DD-012 : REST mobile, pas le FCM delivery receipt).

En mode offline, les messages deja recus avant la perte de connexion restent accessibles
(stockage local WatermelonDB). L'appel BroadcastVu est mis en file PENDING dans
WatermelonDB et rejoue au retour de connexion (DD-012, ENF-BROADCAST-004).

**Invariants a respecter** :
- Le statut VU est emis automatiquement a l'affichage du message dans M-08 — aucun clic
  "lire" n'est requis du livreur.
- Un livreur ne peut emettre BroadcastVu que pour les broadcasts dont il est destinataire
  (le livreurId est extrait du JWT, verifie cote serveur — ENF-BROADCAST-006).
- La communication est strictement unidirectionnelle : Pierre ne peut pas repondre a
  un message broadcast.
- En mode offline, les nouveaux broadcasts FCM ne peuvent pas arriver (FCM indisponible) ;
  les messages deja recus restent consultables.
- L'overlay broadcast se ferme automatiquement apres 15 secondes si aucune interaction
  (duree plus longue que l'overlay instruction M-06).

---

## Criteres d'acceptation (Gherkin)

### Scenario 1 : Reception de la notification push FCM app en arriere-plan

```gherkin
Given Pierre est authentifie sur l'application mobile
And l'application DocuPost est en arriere-plan
When le superviseur envoie un BroadcastMessage de TypeBroadcast ALERTE cible sur TOUS
And le Domain Event BroadcastEnvoye est emis avec le livreurId de Pierre dans livreurIds
Then une notification push systeme Android s'affiche dans la barre de notifications
  avec le titre "[ALERTE]" et le texte du message (tronque si > 2 lignes)
And a la reouverture de l'application, l'overlay broadcast M-08 s'affiche par-dessus
  l'ecran courant avec le badge "[ALERTE]", le texte complet et les boutons "VOIR" et [X]
```

### Scenario 2 : Affichage de l'overlay broadcast et navigation vers M-08

```gherkin
Given Pierre consulte l'ecran M-02 (liste des colis)
When un BroadcastMessage est recu en foreground (connexion active)
Then l'overlay broadcast s'affiche par-dessus M-02 avec :
  - le badge TypeBroadcast colore (ALERTE = rouge, INFO = bleu, CONSIGNE = orange)
  - le libelle "SUPERVISEUR"
  - le texte complet du message (2 lignes max, tronque)
  - les boutons "VOIR" et [X]
And l'overlay disparait automatiquement apres 15 secondes sans interaction
When Pierre appuie sur "VOIR"
Then il est redirige vers l'ecran M-08 avec scroll positionne sur ce message
And le message passe a l'etat "lu" (Domain Event BroadcastVu emis pour ce broadcastMessageId)
When Pierre appuie sur [X] a la place
Then l'overlay se ferme sans marquer le message comme lu
And le badge compteur de l'icone campaign dans M-02 incremente de 1 (message non lu)
```

### Scenario 3 : Consultation de la zone messages M-08 avec marquage automatique comme lu

```gherkin
Given Pierre a recu 3 BroadcastMessages du jour dont 2 non lus
And le badge de l'icone campaign dans M-02 affiche "2"
When Pierre appuie sur l'icone campaign pour ouvrir M-08
Then l'ecran M-08 affiche les 3 messages en ordre chronologique inverse (le plus recent en haut)
And les 2 messages non lus ont un fond colore (selon TypeBroadcast a 30% opacite)
And les messages deja lus ont un fond blanc
And l'appel REST POST /api/supervision/broadcasts/{id}/vu est emis pour les 2 messages non lus
And le Domain Event BroadcastVu est emis pour chacun (broadcastMessageId, livreurId, horodatageVu)
And le badge de l'icone campaign passe a 0 (reinitialise)
```

### Scenario 4 : Affichage correct des types de broadcast dans M-08

```gherkin
Given M-08 contient un message ALERTE, un message INFO et un message CONSIGNE
When Pierre consulte la liste M-08
Then chaque item affiche :
  - le badge TypeBroadcast : "[ALERTE]" (rouge) / "[INFO]" (bleu) / "[CONSIGNE]" (orange)
  - l'heure d'envoi (ex. "14:32")
  - le texte du message tronque a 2 lignes avec "..."
  - l'emetteur "De : [Prenom Nom du superviseur]"
And les messages sont tries du plus recent au plus ancien
```

### Scenario 5 : Comportement offline — messages recus avant perte de connexion

```gherkin
Given Pierre a recu 2 BroadcastMessages alors qu'il etait connecte
And ils sont stockes localement dans WatermelonDB
When Pierre perd sa connexion reseau (zone blanche)
Then M-08 reste accessible avec les 2 messages deja recus
And un bandeau orange "Hors connexion" s'affiche en tete de M-08
And aucun nouveau message ne peut arriver (FCM indisponible)
When Pierre ouvre M-08 en mode offline
And les 2 messages sont non lus
Then l'appel BroadcastVu est mis en file PENDING dans WatermelonDB (DD-012 offline)
When Pierre retablit sa connexion
Then les appels REST BroadcastVu PENDING sont rejoues automatiquement
And le Domain Event BroadcastVu est emis avec l'horodatage reel de l'affichage (pas du retour reseau)
```

### Scenario 6 : Aucun message du jour

```gherkin
Given aucun BroadcastMessage n'a ete envoye pour la journee du livreur
When Pierre ouvre M-08
Then l'ecran affiche "Votre superviseur n'a pas envoye de message aujourd'hui."
And le badge de l'icone campaign est absent ou affiche 0
```

---

## Contraintes techniques

- Endpoint reception BroadcastVu : `POST /api/supervision/broadcasts/{broadcastMessageId}/vu`
  - Acces : ROLE_LIVREUR uniquement (livreurId extrait du JWT)
  - Validation : le livreurId doit etre dans la liste des destinataires du BroadcastMessage
  - Reponse 204 : acquittement silencieux
  - Reponse 403 : si livreurId pas destinataire du broadcast (ENF-BROADCAST-006)
  - Idempotent : un double appel pour le meme (broadcastMessageId, livreurId) n'emet pas
    deux BroadcastVu
- Endpoint consultation livreur : `GET /api/supervision/broadcasts/recus?date=YYYY-MM-DD`
  - Acces : ROLE_LIVREUR (filtre sur livreurId du JWT)
  - Reponse : liste de BroadcastMessageDTO avec statut VU/ENVOYE pour ce livreur
- Stockage offline : BroadcastMessages recus stockes dans WatermelonDB. Appels BroadcastVu
  mis en file PENDING si offline (DD-012, ENF-BROADCAST-004).
- Notification push FCM : payload contient `broadcastMessageId` et `type` pour construire
  l'overlay sans appel supplementaire (DD-013).
- Rétention : broadcasts consultables pour la journee courante uniquement (ENF-BROADCAST-003).

---

## Dependances avec les User Stories existantes

| US | Titre | Type de dependance |
|----|-------|-------------------|
| US-006 | Mode offline et synchronisation | Partage WatermelonDB et mecanisme de rejeu PENDING |
| US-016 | Notification push instruction | Partage FcmPushAdapter et overlay M-06 (meme pattern) |
| US-067 | Envoyer broadcast superviseur | US-067 produit le BroadcastEnvoye et les tokens FCM |
| US-069 | Consulter statuts lecture | BroadcastVu emis par US-068 alimente le read model de US-069 |

---

## Liens

- Wireframe M-08 : /livrables/02-ux/wireframes.md#ecran-m-08--zone-messages-broadcast-app-mobile-livreur
- Wireframe overlay broadcast : /livrables/02-ux/wireframes.md#layout--overlay-broadcast-recu
- Parcours : /livrables/02-ux/user-journeys.md#parcours-7--superviseur--envoyer-un-broadcast-a-ses-livreurs
- Design Decisions : /livrables/04-architecture-technique/design-decisions.md#dd-012
- ENF : /livrables/04-architecture-technique/exigences-non-fonctionnelles.md#enf-broadcast-004
- Module 8 : /livrables/03-architecture-metier/modules-fonctionnels.md#module-8--broadcast-superviseur
