# US-017 : Synchroniser automatiquement les événements de livraison vers l'OMS

**Epic** : EPIC-005 — Intégration SI et Historisation Immuable
**Feature** : F-015 — Synchronisation des événements vers l'OMS
**Bounded Context** : BC-05 Intégration SI / OMS
**Aggregate(s) touchés** : EvenementLivraison (Value Object immuable)
**Priorité** : Must Have
**Statut** : Prête
**Complexité estimée** : L (8 points)

---

## User Story

En tant qu'Éric Garnier (Architecte Technique DSI),
je veux que chaque changement de statut colis déclenche automatiquement l'envoi d'un
événement normalisé vers l'OMS via API REST en moins de 30 secondes, avec rejeu
automatique en cas d'échec,
afin que DocuPost soit une brique SI officielle et que les données terrain soient
disponibles dans le SI en temps réel sans aucune double saisie manuelle.

---

## Contexte

Aujourd'hui, les statuts colis sont saisis manuellement dans l'OMS le soir ou le
lendemain, générant des doubles saisies et des données incohérentes. Le BC-05
(Anti-Corruption Layer) consomme les Domain Events du BC-01 (LivraisonConfirmée,
ÉchecLivraisonDéclaré, TournéeClôturée) et les traduit en appels API REST vers l'OMS
externe. Les événements non transmis (zone blanche) sont mis en queue et rejoués dès
le retour de connexion (at-least-once delivery, outbox pattern).

**Invariants à respecter** :
- Chaque événement contient obligatoirement : livreurId, action, horodatage,
  coordonnées GPS.
- Aucun événement ne peut être modifié ou supprimé après création (immuabilité).
- Les événements non transmis sont mis en queue et rejoués avec backoff exponentiel.
- SLA : transmission à l'OMS en moins de 30 secondes après l'action terrain (en mode
  connecté) ou après le retour de connexion (mode offline).
- Le BC-05 ne contient aucune logique métier DocuPost : il traduit et route uniquement.

---

## Critères d'acceptation (Gherkin)

### Scénario 1 : Synchronisation d'une livraison confirmée vers l'OMS

```gherkin
Given Pierre a confirmé la livraison du colis #00247 (événement LivraisonConfirmée émis)
And le réseau est disponible
When le BC-05 consomme l'événement LivraisonConfirmée
Then une requête POST est effectuée vers l'API REST de l'OMS dans les 30 secondes
And la requête contient : livreurId, colisId = #00247, statut = "livré", horodatage,
     coordonnées GPS, preuveLivraisonId
And le StatutSynchronisation passe de "pending" à "synchronized"
And le taux de synchronisation OMS reste > 99 %
```

### Scénario 2 : Rejeu automatique en cas d'échec de transmission

```gherkin
Given Pierre a déclaré un échec de livraison en zone blanche (réseau indisponible)
And l'événement ÉchecLivraisonDéclaré est stocké dans l'outbox (StatutSynchronisation
     = "pending")
When le réseau mobile revient
Then le OutboxPoller détecte l'événement en attente
And la transmission vers l'OMS est retentée avec backoff exponentiel
And l'événement est transmis à l'OMS en moins de 30 secondes après le retour de
     connexion
And le StatutSynchronisation passe à "synchronized"
And le taux d'événements rejoués avec succès reste > 99 %
```

### Scénario 3 : Idempotence — pas de doublon en cas de rejeu

```gherkin
Given l'événement LivraisonConfirmée pour le colis #00247 a été transmis à l'OMS
And en raison d'une instabilité réseau, le même événement est rejoué une deuxième fois
When l'OMS reçoit la requête dupliquée (même eventId)
Then l'OMS ou le BC-05 rejette silencieusement la requête dupliquée
And un seul événement est enregistré dans l'OMS pour le colis #00247
```

### Scénario 4 : Zéro double saisie manuelle après déploiement

```gherkin
Given DocuPost est déployé et actif
When un livreur met à jour le statut d'un colis via l'application mobile
Then aucune saisie manuelle dans l'OMS n'est nécessaire pour ce colis
And le statut est disponible dans l'OMS en moins de 30 secondes
And le taux de double saisie résiduelle est = 0 %
```

### Scénario 5 : L'OMS ne subit aucune modification de son cœur applicatif

```gherkin
Given le BC-05 envoie un événement normalisé à l'OMS
When l'OMS reçoit la requête POST /statuts ou POST /événements
Then l'OMS traite la requête via son API REST exposée
And aucune modification du code interne de l'OMS n'est requise
And le BC-05 est le seul point d'intégration avec l'OMS (Anti-Corruption Layer)
```

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md (flux SI — hors périmètre wireframe mobile/web)
- Parcours : /livrables/02-ux/user-journeys.md#parcours-1--livreur--exécuter-une-tournée
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
