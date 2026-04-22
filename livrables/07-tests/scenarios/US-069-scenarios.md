# Scénarios de tests US-069 — Consulter les statuts de lecture des broadcasts envoyés

**Agent** : @qa
**Date de rédaction** : 2026-04-21
**US** : US-069 — Consulter les statuts de lecture des broadcasts envoyés
**Aggregates** : BroadcastMessage (lecture), BroadcastStatutLivraison (projection)
**Domain Events** : BroadcastEnvoye (entrée), BroadcastVuEvent (mise à jour projection)

---

## Pyramide de tests

| Niveau | Nb TCs | Outil | Objectif |
|--------|--------|-------|----------|
| L1 | 6 | `mvn test` (JUnit/Mockito) + Jest | Event handlers, projection, composant React |
| L2 | 3 | `curl` sur svc-supervision port 8082 | GET /du-jour, GET /{id}/statuts, compteurs |
| L3 | 2 | Playwright (port 3000) | Historique W-09, détail nominatif |

---

## TC-069-L1-01 : BroadcastEnvoyeEventHandler — création N lignes ENVOYE dans la projection

**US liée** : US-069
**Niveau** : L1
**Couche testée** : Application (Event Handler)
**Aggregate / Domain Event ciblé** : BroadcastStatutLivraison / BroadcastEnvoye
**Type** : Fonctionnel
**Préconditions** : BroadcastEnvoye émis avec livreurIds=[livreur-001, livreur-002, livreur-003]
**Étapes** : `BroadcastEnvoyeEventHandler.on(event)` avec 3 livreurs
**Résultat attendu** : 3 entrées BroadcastStatutLivraison créées avec statut=ENVOYE dans la projection
**Statut** : À tester

```gherkin
Given un BroadcastEnvoye est émis avec livreurIds=[livreur-001, livreur-002, livreur-003]
When BroadcastEnvoyeEventHandler traite l'événement
Then 3 lignes broadcast_statut_livraison sont créées avec statut=ENVOYE
And chaque ligne porte le broadcastMessageId, livreurId, et statut=ENVOYE
```

---

## TC-069-L1-02 : BroadcastEnvoyeEventHandler — nomCompletLivreur renseigné

**US liée** : US-069
**Niveau** : L1
**Couche testée** : Application (Event Handler)
**Aggregate / Domain Event ciblé** : BroadcastStatutLivraison
**Type** : Fonctionnel
**Préconditions** : BroadcastEnvoye avec livreurId=livreur-001 (Pierre Morel dans le référentiel)
**Étapes** : `BroadcastEnvoyeEventHandler.on(event)` — vérifier que nomComplet est récupéré
**Résultat attendu** : BroadcastStatutLivraisonEntity.nomCompletLivreur = "Pierre Morel"
**Statut** : À tester

```gherkin
Given BroadcastEnvoye avec livreurId=livreur-001 (Pierre Morel dans le référentiel)
When BroadcastEnvoyeEventHandler traite l'événement
Then la ligne broadcast_statut_livraison pour livreur-001 a nomCompletLivreur="Pierre Morel"
```

---

## TC-069-L1-03 : BroadcastVuEventHandler — transition statut ENVOYE → VU dans la projection

**US liée** : US-069
**Niveau** : L1
**Couche testée** : Application (Event Handler)
**Aggregate / Domain Event ciblé** : BroadcastStatutLivraison / BroadcastVuEvent
**Type** : Fonctionnel
**Préconditions** : Ligne ENVOYE existante pour (broadcastMessageId, livreur-001)
**Étapes** : `BroadcastVuEventHandler.on(event)` avec (broadcastMessageId, livreur-001, horodatageVu)
**Résultat attendu** : Ligne mise à jour avec statut=VU et horodatageVu non null
**Statut** : À tester

```gherkin
Given une ligne broadcast_statut_livraison existe avec statut=ENVOYE pour livreur-001
When BroadcastVuEventHandler reçoit BroadcastVuEvent(broadcastMessageId, livreur-001, horodatageVu)
Then le statut de la ligne passe à VU
And horodatageVu est enregistré
```

---

## TC-069-L1-04 : BroadcastVuEventHandler — publication WebSocket après mise à jour

**US liée** : US-069
**Niveau** : L1
**Couche testée** : Application (Event Handler) / Infrastructure WebSocket
**Aggregate / Domain Event ciblé** : BroadcastStatutLivraison / BroadcastVuEvent
**Type** : Fonctionnel
**Préconditions** : BroadcastStatutWebSocketPublisher mocké
**Étapes** : `BroadcastVuEventHandler.on(event)` — vérifier appel WebSocket publisher
**Résultat attendu** : `BroadcastStatutWebSocketPublisher.publier(...)` appelé avec topic /topic/supervision/broadcasts/{date}
**Statut** : À tester

```gherkin
Given BroadcastVuEvent est traité par BroadcastVuEventHandler
When le statut est mis à jour
Then BroadcastStatutWebSocketPublisher.publier est appelé avec le topic /topic/supervision/broadcasts/{date}
And le payload contient broadcastMessageId, nombreVus, nombreDestinataires
```

---

## TC-069-L1-05 : BroadcastVuEventHandler — idempotence (double VuEvent)

**US liée** : US-069
**Niveau** : L1
**Couche testée** : Application (Event Handler)
**Aggregate / Domain Event ciblé** : BroadcastStatutLivraison
**Type** : Invariant domaine
**Préconditions** : Ligne déjà à statut=VU pour livreur-001
**Étapes** : Second `BroadcastVuEventHandler.on(event)` pour le même (broadcastMessageId, livreur-001)
**Résultat attendu** : Aucune exception, statut reste VU, WebSocket appelé une seule fois maximum
**Statut** : À tester

```gherkin
Given le statut broadcast est déjà VU pour (broadcastMessageId, livreur-001)
When BroadcastVuEventHandler reçoit un second BroadcastVuEvent pour les mêmes paramètres
Then aucune exception n'est levée
And le statut reste VU (pas de régression)
```

---

## TC-069-L1-06 : BroadcastVuEventHandler — statut inconnu ignoré sans erreur

**US liée** : US-069
**Niveau** : L1
**Couche testée** : Application (Event Handler)
**Aggregate / Domain Event ciblé** : BroadcastStatutLivraison
**Type** : Edge case
**Préconditions** : Aucune ligne dans broadcast_statut_livraison pour (broadcastMessageId, livreur-001)
**Étapes** : `BroadcastVuEventHandler.on(event)` avec un broadcastMessageId inconnu
**Résultat attendu** : Aucune exception levée (comportement défensif), log WARN attendu
**Statut** : À tester

```gherkin
Given aucune ligne broadcast_statut_livraison n'existe pour le broadcastMessageId fourni
When BroadcastVuEventHandler traite l'événement
Then aucune exception n'est levée
And un log WARN est émis
```

---

## TC-069-L2-01 : GET /broadcasts/du-jour → 200 avec BroadcastSummaryDTO et compteurs

**US liée** : US-069
**Niveau** : L2
**Couche testée** : Infrastructure / Interface
**Type** : Fonctionnel
**Préconditions** : svc-supervision démarré, au moins un broadcast envoyé pour la date courante
**Étapes** :
```bash
curl -s "http://localhost:8082/api/supervision/broadcasts/du-jour?date=$(date +%Y-%m-%d)"
```
**Résultat attendu** : HTTP 200, liste de BroadcastSummaryDTO avec broadcastMessageId, type, texte, horodatageEnvoi, nombreDestinataires, nombreVus
**Statut** : À tester

```gherkin
Given au moins un broadcast a été envoyé pour la date du jour
When GET /api/supervision/broadcasts/du-jour?date=YYYY-MM-DD
Then HTTP 200 est retourné
And chaque item a broadcastMessageId, type, texte, horodatageEnvoi, nombreDestinataires >= 0, nombreVus >= 0
And nombreVus <= nombreDestinataires
```

---

## TC-069-L2-02 : GET /broadcasts/{id}/statuts → 200 avec liste nominative

**US liée** : US-069
**Niveau** : L2
**Couche testée** : Infrastructure / Interface
**Type** : Fonctionnel
**Préconditions** : broadcast créé, au moins un livreur a marqué vu
**Étapes** :
```bash
# Récupérer l'id du dernier broadcast
BROADCAST_ID=$(curl -s "http://localhost:8082/api/supervision/broadcasts/du-jour?date=$(date +%Y-%m-%d)" \
  | jq -r '.[0].broadcastMessageId')

curl -s "http://localhost:8082/api/supervision/broadcasts/$BROADCAST_ID/statuts"
```
**Résultat attendu** : HTTP 200, liste de BroadcastStatutLivraisonDTO avec livreurId, nomComplet, statut (VU/ENVOYE), horodatageVu
**Statut** : À tester

```gherkin
Given un broadcast existe avec N destinataires dont au moins 1 a marqué VU
When GET /api/supervision/broadcasts/{id}/statuts
Then HTTP 200 est retourné
And la liste contient N lignes (une par destinataire)
And les livreurs qui ont marqué vu ont statut=VU et horodatageVu non null
And les autres ont statut=ENVOYE et horodatageVu=null
```

---

## TC-069-L2-03 : Cohérence compteurs après marquage VU (flux cross-services)

**US liée** : US-069
**Niveau** : L2
**Couche testée** : Infrastructure / Cross-services
**Type** : Cross-services / Non régression
**Préconditions** : svc-supervision démarré, broadcast créé avec nombreDestinataires=N
**Étapes** :
1. POST /broadcasts → récupérer broadcastMessageId, nombreDestinataires=N
2. GET /broadcasts/du-jour → vérifier nombreVus=0
3. POST /broadcasts/{id}/vu avec livreur-001
4. GET /broadcasts/du-jour → vérifier nombreVus=1
**Résultat attendu** : Compteur nombreVus incrémenté de 0 → 1 après marquage
**Statut** : À tester

```gherkin
Given un broadcast vient d'être envoyé avec nombreDestinataires=N
When GET /du-jour
Then nombreVus = 0
When POST /broadcasts/{id}/vu avec un livreur destinataire
And GET /du-jour après propagation (<2s)
Then nombreVus = 1
```

---

## TC-069-L3-01 : Historique du jour affiché dans W-09 avec compteurs

**US liée** : US-069
**Niveau** : L3
**Couche testée** : UI
**Type** : Fonctionnel UI
**Préconditions** : frontend-supervision démarré port 3000, svc-supervision port 8082, au moins 1 broadcast du jour
**Étapes** : Playwright — naviguer vers W-09, vérifier la section Historique
**Résultat attendu** : La section "Historique des broadcasts du jour" affiche les items avec badge, heure, texte tronqué, "Vu par N/M livreurs"
**Statut** : À tester

```gherkin
Given le panneau W-09 est ouvert et au moins un broadcast du jour existe
When le superviseur consulte la section "Historique des broadcasts du jour"
Then au moins un item est affiché avec badge TypeBroadcast, heure d'envoi, texte, compteur "Vu par N/M livreurs"
And le compteur N <= M
```

---

## TC-069-L3-02 : Détail nominatif accessible depuis le chevron

**US liée** : US-069
**Niveau** : L3
**Couche testée** : UI
**Type** : Navigation / Fonctionnel UI
**Préconditions** : au moins un broadcast dans l'historique W-09
**Étapes** : Playwright — cliquer le chevron [>] d'un broadcast, vérifier le panneau détail
**Résultat attendu** : Panneau détail s'ouvre avec liste nominative livreur / statut / horodatage, pas de bouton modification
**Statut** : À tester

```gherkin
Given un broadcast dans l'historique W-09
When le superviseur clique sur le chevron [>]
Then un panneau détail s'ouvre avec la liste des destinataires
And chaque ligne affiche nomComplet, statut (VU/EN ATTENTE), horodatageVu si VU
And aucun bouton "Modifier" ou "Supprimer" n'est présent (lecture seule)
```
