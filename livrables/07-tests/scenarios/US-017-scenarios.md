# Scénarios de tests US-017 — Synchronisation OMS

**US liée** : US-017
**Titre** : Synchroniser automatiquement les événements de livraison vers l'OMS
**Bounded Context** : BC-05 Intégration SI / OMS
**Aggregate / Domain Event ciblé** : EvenementLivraison / Outbox pattern — StatutSynchronisation
**Agent** : @qa
**Date** : 2026-03-24
**Version** : 1.0

---

### TC-360 : Enregistrement d'un événement de livraison → statut PENDING puis SYNCHRONIZED

**US liée** : US-017
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : EnregistrerEvenementHandler / EvenementStore.append()
**Type** : Fonctionnel (happy path)
**Préconditions** : Backend svc-oms en profil dev (port 8083), OutboxPoller actif (10s)
**Étapes** :
1. Envoyer POST /api/oms/evenements avec un événement valide
2. Vérifier HTTP 201 et statut PENDING
3. Attendre 15 secondes (2 cycles de polling)
4. Appeler GET /api/oms/evenements/colis/{colisId}
5. Vérifier le statut SYNCHRONIZED

**Résultat attendu** : L'événement passe de PENDING à SYNCHRONIZED en moins de 30 secondes (SLA NFR)
**Statut** : Passé

```gherkin
Given le backend svc-oms tourne en profil dev (OmsApiClient en mode simulation)
When POST /api/oms/evenements est appelé avec un événement valide (qui, quoi, quand, GPS)
Then la réponse est HTTP 201 Created
And "statutSynchronisation" = "PENDING" dans la réponse immédiate
When 15 secondes s'écoulent (OutboxPoller déclenché)
Then GET /api/oms/evenements/colis/{colisId} retourne "statutSynchronisation" = "SYNCHRONIZED"
```

---

### TC-361 : Idempotence — doublon eventId rejeté avec HTTP 409

**US liée** : US-017
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : EnregistrerEvenementHandler — EvenementDejaExistantException → HTTP 409
**Type** : Invariant domaine
**Préconditions** : Backend svc-oms en profil dev
**Étapes** :
1. Envoyer POST /api/oms/evenements avec eventId="evt-test-idempotence"
2. Renvoyer la même requête avec le même eventId
3. Vérifier la réponse au deuxième envoi

**Résultat attendu** : Le premier appel retourne HTTP 201. Le deuxième retourne HTTP 409 Conflict.
**Statut** : Passé

```gherkin
Given le backend svc-oms tourne en profil dev
When POST /api/oms/evenements est appelé une première fois avec eventId="evt-idempotence"
Then la réponse est HTTP 201 Created
When la même requête est envoyée à nouveau avec le même eventId="evt-idempotence"
Then la réponse est HTTP 409 Conflict
And EvenementDejaExistantException est levée
And un seul événement existe en base pour cet eventId
```

---

### TC-362 : Historique d'un colis retourné en ordre chronologique ascendant

**US liée** : US-017
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : ConsulterHistoriqueColisHandler — ORDER BY horodatage ASC
**Type** : Fonctionnel
**Préconditions** : DevDataSeeder a créé des événements pour colis-s-001 (TOURNEE_DEMARREE + LIVRAISON_CONFIRMEE)
**Étapes** :
1. Appeler GET /api/oms/evenements/colis/colis-s-001
2. Vérifier l'ordre des événements

**Résultat attendu** : HTTP 200 avec les événements dans l'ordre chronologique ascendant (horodatage le plus ancien en premier)
**Statut** : Passé

```gherkin
Given le DevDataSeeder a créé 2 événements pour colis-s-001 (TOURNEE_DEMARREE puis LIVRAISON_CONFIRMEE)
When GET /api/oms/evenements/colis/colis-s-001 est appelé
Then la réponse est HTTP 200
And les événements sont dans l'ordre chronologique ascendant (TOURNEE_DEMARREE avant LIVRAISON_CONFIRMEE)
```

---

### TC-363 : OmsApiClient en mode simulation — événements passent PENDING → SYNCHRONIZED sans appel OMS réel

**US liée** : US-017
**Couche testée** : Infrastructure (OmsApiClient simulé)
**Aggregate / Domain Event ciblé** : SynchroniserPendingEvenementsHandler — OmsApiPort simulation
**Type** : Fonctionnel (MVP simulation)
**Préconditions** : Backend svc-oms en profil dev (oms.api.enabled=false)
**Étapes** :
1. Créer un événement PENDING via POST /api/oms/evenements
2. Attendre le polling (10s)
3. Vérifier le statut dans l'historique

**Résultat attendu** : L'événement passe PENDING → SYNCHRONIZED via le mode simulation (log + succès automatique). Aucun appel HTTP externe réel.
**Statut** : Passé

```gherkin
Given oms.api.enabled=false (mode simulation MVP)
When un événement PENDING est traité par OutboxPoller
Then OmsApiClient log "Simulation OMS OK" + retourne succès
And l'événement passe à SYNCHRONIZED sans appel HTTP réel vers l'OMS
```

---

### TC-364 : Historique d'une tournée accessible via /tournee/{tourneeId}

**US liée** : US-017
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : ConsulterHistoriqueTourneeHandler
**Type** : Fonctionnel
**Préconditions** : DevDataSeeder a créé 4 événements pour tournee-sup-001
**Étapes** :
1. Appeler GET /api/oms/evenements/tournee/tournee-sup-001
2. Vérifier la liste retournée

**Résultat attendu** : HTTP 200 avec les 4 événements de la tournée en ordre chronologique
**Statut** : Passé

```gherkin
Given le DevDataSeeder a créé 4 événements pour tournee-sup-001
When GET /api/oms/evenements/tournee/tournee-sup-001 est appelé
Then la réponse est HTTP 200
And 4 événements sont retournés en ordre chronologique ascendant
```

---

### TC-365 : Mode dégradé GPS — événement créé avec modeDegradGPS=true si coordonnées absentes

**US liée** : US-017
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : EvenementLivraison — modeDegradGPS=true si null
**Type** : Edge case
**Préconditions** : Backend svc-oms en profil dev
**Étapes** :
1. Envoyer POST /api/oms/evenements sans latitude ni longitude
2. Vérifier la réponse et modeDegradGPS

**Résultat attendu** : HTTP 201 avec modeDegradGPS=true dans la réponse
**Statut** : Passé

```gherkin
Given un événement est envoyé sans coordonnées GPS (latitude=null, longitude=null)
When POST /api/oms/evenements est appelé
Then la réponse est HTTP 201 Created
And "modeDegradGPS" = true dans l'événement créé
And l'événement est persisté normalement avec les 3 autres attributs obligatoires
```
