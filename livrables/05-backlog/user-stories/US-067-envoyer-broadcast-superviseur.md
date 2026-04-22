# US-067 : Envoyer un broadcast a ses livreurs actifs depuis le tableau de bord

**Epic** : EPIC-003 — Supervision et Pilotage Temps Reel
**Feature** : F-030 — Broadcast superviseur vers livreurs (Module 8)
**Bounded Context** : BC-03 Supervision
**Aggregate(s) touches** : BroadcastMessage
**Priorite** : Must Have
**Statut** : A affiner
**Complexite estimee** : M (5 points)

---

## User Story

En tant que Karim B. (superviseur logistique terrain),
je veux envoyer un message broadcast a tous mes livreurs actifs ou aux livreurs d'un secteur
depuis mon tableau de bord en moins de 3 clics,
afin d'informer immediatement plusieurs livreurs simultanement d'un incident terrain (rue barree,
fermeture depot, consigne de securite) sans les appeler un par un.

---

## Contexte

Actuellement, Karim doit appeler ses livreurs individuellement ou passer par un groupe WhatsApp
informel pour communiquer une information urgente. Il a mis 20 minutes a joindre 6 livreurs lors
d'une fermeture de voie imprevue. "Mon probleme numero un en journee, c'est quand il se passe
quelque chose sur le terrain et que je dois le faire savoir a tout le monde vite." (Karim B.)

L'ecran concerne est le panneau lateral W-09 (drawer ouvert depuis W-01 via la SideNavBar).
Le formulaire permet de choisir le TypeBroadcast (ALERTE / INFO / CONSIGNE), le BroadcastCiblage
(TOUS les livreurs actifs ou un ou plusieurs BroadcastSecteur predefinies), et saisir un texte
libre jusqu'a 280 caracteres. La commande EnvoyerBroadcast est validee par le bouton ENVOYER.
Le BroadcastEnvoye est emis et declenche le fan-out FCM via svc-notification (DD-013 :
sendEachForMulticast). Les secteurs disponibles sont configures statiquement dans DocuPost
(DD-014 : table broadcast_secteur).

**Invariants a respecter** :
- Un BroadcastMessage ne peut etre envoye que si le ciblage resout au moins un livreur actif
  (EtatJournalierLivreur == EN_COURS dans BC-07). Un broadcast sans destinataire est rejete
  avec l'erreur metier "Aucun livreur actif dans le ciblage".
- Un BroadcastMessage est immuable apres envoi : ni le texte, ni le ciblage, ni le TypeBroadcast
  ne peuvent etre modifies. Aucun rappel ou annulation possible.
- Le texte du message ne peut pas etre vide et ne peut pas depasser 280 caracteres.
- Le ciblage de type SECTEUR doit referencer au moins un secteur predefini valide (code present
  dans la table broadcast_secteur avec actif = true).
- L'envoi est unidirectionnel : aucune reponse livreur n'est attendue ni possible.
- Seul un utilisateur avec le role SUPERVISEUR peut executer la commande EnvoyerBroadcast
  (ENF-BROADCAST-006).
- L'envoi doit etre realise en 3 clics maximum depuis W-01 : (1) clic SideNavBar "Broadcast",
  (2) composition et ciblage, (3) bouton ENVOYER.

---

## Criteres d'acceptation (Gherkin)

### Scenario 1 : Envoi d'un broadcast ALERTE a tous les livreurs actifs

```gherkin
Given Karim est authentifie sur l'interface web avec le role "superviseur"
And 4 livreurs sont a l'etat EN_COURS dans BC-07 pour la date du jour
And le panneau W-09 est ouvert (1 clic depuis la SideNavBar W-01)
When Karim selectionne le TypeBroadcast "ALERTE"
And Karim selectionne le ciblage "Tous les livreurs actifs"
And Karim saisit le texte "Rue Gambetta barree, prenez la rue Victor Hugo"
And Karim clique sur ENVOYER
Then le Domain Event BroadcastEnvoye est emis avec type=ALERTE, ciblage.typeCiblage=TOUS,
  livreurIds=[4 ids EN_COURS], horodatageEnvoi=now()
And un toast de confirmation affiche "Message envoye a 4 livreurs"
And le BroadcastMessage apparait en tete de l'historique des broadcasts du jour dans W-09
And le bouton ENVOYER est desactive pendant l'envoi (eviter double envoi)
```

### Scenario 2 : Envoi d'un broadcast CONSIGNE cible sur un secteur

```gherkin
Given Karim est authentifie avec le role "superviseur"
And les secteurs "SECT-IDF-01" (3 livreurs EN_COURS) et "SECT-IDF-02" (2 livreurs EN_COURS)
  sont disponibles dans la liste de ciblage
And le panneau W-09 est ouvert
When Karim selectionne le TypeBroadcast "CONSIGNE"
And Karim selectionne le ciblage "Secteur 2" (SECT-IDF-02)
And Karim saisit "Ne pas livrer les sous-sols en cas de pluie — directive securite"
And Karim clique sur ENVOYER
Then le Domain Event BroadcastEnvoye est emis avec ciblage.typeCiblage=SECTEUR,
  ciblage.secteurs=[{codeSecteur: "SECT-IDF-02"}], livreurIds=[2 ids resolus]
And le toast affiche "Message envoye a 2 livreurs"
And le fan-out FCM sendEachForMulticast est appele avec 2 tokens FCM (DD-013)
```

### Scenario 3 : Rejet du broadcast si aucun livreur actif dans le ciblage

```gherkin
Given Karim est authentifie avec le role "superviseur"
And le secteur "SECT-IDF-02" ne contient aucun livreur a l'etat EN_COURS pour le jour
And le panneau W-09 est ouvert
When Karim selectionne le TypeBroadcast "INFO"
And Karim selectionne le ciblage "Secteur 2" (SECT-IDF-02)
And Karim saisit "Information depot relais"
And Karim clique sur ENVOYER
Then le Domain Event BroadcastEnvoye n'est PAS emis
And un message d'erreur affiche "Aucun livreur actif dans ce secteur"
And le formulaire reste ouvert pour modification du ciblage
```

### Scenario 4 : Validation en temps reel du compteur de caracteres

```gherkin
Given Karim est sur le formulaire du panneau W-09
When Karim saisit un texte de 280 caracteres exactement
Then le compteur affiche "280 / 280" et le bouton ENVOYER est actif
When Karim tente de saisir un caractere supplementaire
Then le champ texte bloque la saisie a 280 caracteres
And le bouton ENVOYER reste actif
```

### Scenario 5 : Bouton ENVOYER inactif si le formulaire est incomplet

```gherkin
Given Karim est sur le formulaire du panneau W-09
And aucun TypeBroadcast n'est selectionne
When Karim saisit un texte valide et selectionne un ciblage
Then le bouton ENVOYER reste inactif tant que le TypeBroadcast n'est pas selectionne
When Karim selectionne "ALERTE"
Then le bouton ENVOYER devient actif
```

### Scenario 6 : Indisponibilite reseau superviseur bloque l'envoi

```gherkin
Given Karim est sur le formulaire W-09
And la connexion reseau superviseur est indisponible (mode hors ligne)
When Karim clique sur ENVOYER
Then un message d'avertissement affiche "Connexion indisponible — envoi impossible en mode
  hors ligne"
And le bouton ENVOYER reste inactif
And aucun BroadcastMessage n'est cree (ENF-BROADCAST-001 : envoi synchrone obligatoire)
```

---

## Contraintes techniques

- Endpoint backend : `POST /api/supervision/broadcasts`
  - Acces : ROLE_SUPERVISEUR uniquement (ENF-BROADCAST-006)
  - Corps : `{ superviseurId, type, texte, ciblage: { typeCiblage, secteurs? } }`
  - Reponse 201 : `{ broadcastMessageId, nombreDestinataires, horodatageEnvoi }`
  - Reponse 422 : `{ error: "AUCUN_LIVREUR_ACTIF" }` si ciblage resout 0 livreur
- Fan-out FCM : `sendEachForMulticast` (DD-013). Tokens invalides (UNREGISTERED) supprimes
  de la table `fcm_token` automatiquement.
- Secteurs : servis par `GET /api/supervision/broadcast-secteurs` (table broadcast_secteur,
  DD-014). Seuls les secteurs avec `actif = true` sont proposes.
- Latence FCM cible : < 10s (p95) pour la livraison push aux livreurs (ENF-BROADCAST-001).
- Volumetrie supportee : 15 broadcasts/jour, max 50 livreurs/broadcast (ENF-BROADCAST-002).

---

## Dependances avec les User Stories existantes

| US | Titre | Type de dependance |
|----|-------|-------------------|
| US-011 | Tableau de bord W-01 | Navigation entrante : W-09 ouvert depuis W-01 SideNavBar |
| US-016 | Notification push instruction | Partage le canal FCM et FcmPushAdapter |
| US-049 | 6 livreurs dev coherents | Referentiel livreurs pour les tests d'integration |
| US-068 | Recevoir broadcast livreur | US-067 produit le BroadcastEnvoye consomme par US-068 |
| US-069 | Consulter statuts lecture | US-067 cree le BroadcastMessage dont les statuts sont lus par US-069 |

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#ecran-w-09--panneau-broadcast-interface-superviseur-web
- Parcours : /livrables/02-ux/user-journeys.md#parcours-7--superviseur--envoyer-un-broadcast-a-ses-livreurs
- Domain model (BC-03 BroadcastMessage) : /livrables/03-architecture-metier/domain-model.md
- Architecture : /livrables/04-architecture-technique/design-decisions.md#dd-013
- ENF : /livrables/04-architecture-technique/exigences-non-fonctionnelles.md#enf-broadcast-001
- Module 8 : /livrables/03-architecture-metier/modules-fonctionnels.md#module-8--broadcast-superviseur
