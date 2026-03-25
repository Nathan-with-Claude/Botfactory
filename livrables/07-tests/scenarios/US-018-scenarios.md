# Scénarios de tests US-018 — Historisation immuable des événements

**US liée** : US-018
**Titre** : Garantir l'historisation immuable de chaque événement de livraison
**Bounded Context** : BC-05 Intégration SI / OMS
**Aggregate / Domain Event ciblé** : EvenementLivraison (record Java immuable) — Event Store append-only
**Agent** : @qa
**Date** : 2026-03-24
**Version** : 1.0

---

### TC-370 : Les 4 attributs obligatoires sont vérifiés à la création (qui, quoi, quand, GPS)

**US liée** : US-018
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : EvenementLivraison — compact constructor requireNonNull
**Type** : Invariant domaine
**Préconditions** : Backend svc-oms en profil dev
**Étapes** :
1. Envoyer POST /api/oms/evenements sans livreurId (qui manquant)
2. Vérifier la réponse

**Résultat attendu** : HTTP 400 Bad Request — livreurId obligatoire
**Statut** : Passé

```gherkin
Given le backend svc-oms tourne en profil dev
When POST /api/oms/evenements est appelé sans livreurId (attribut "qui" absent)
Then la réponse est HTTP 400 Bad Request
And l'événement n'est pas persisté (immuabilité — création tout-ou-rien)
```

---

### TC-371 : Immuabilité — les attributs métier ne peuvent pas être modifiés après création

**US liée** : US-018
**Couche testée** : Infrastructure (JPA — updatable=false)
**Aggregate / Domain Event ciblé** : EvenementEntity — updatable=false sur attributs métier
**Type** : Invariant domaine
**Préconditions** : Backend svc-oms en profil dev, un événement SYNCHRONIZED créé
**Étapes** :
1. Vérifier que /api/oms/evenements ne propose pas d'endpoint PUT ou PATCH sur les attributs métier
2. Vérifier via les tests EvenementLivraisonTest que marquerSynchronise() retourne un nouvel objet

**Résultat attendu** : Aucun endpoint PUT/PATCH métier disponible. marquerSynchronise() retourne une copie, l'original reste intact.
**Statut** : Passé

```gherkin
Given un EvenementLivraison est persisté avec type=LIVRAISON_CONFIRMEE et colisId=colis-001
When marquerSynchronise() est appelé sur cet événement
Then un NOUVEL objet EvenementLivraison est retourné avec statutSynchronisation=SYNCHRONIZED
And l'objet ORIGINAL reste intact (record Java immuable)
And la colonne "type" en base reste inchangée (updatable=false)
```

---

### TC-372 : Unicité eventId — UNIQUE constraint SQL empêche les doublons en base

**US liée** : US-018
**Couche testée** : Infrastructure (base de données)
**Aggregate / Domain Event ciblé** : EvenementEntity — UNIQUE(event_id)
**Type** : Invariant domaine
**Préconditions** : Backend svc-oms en profil dev
**Étapes** :
1. Envoyer POST /api/oms/evenements avec eventId="evt-unique-test"
2. Tenter d'insérer directement un doublon (ou utiliser le second appel API)
3. Vérifier que HTTP 409 est retourné

**Résultat attendu** : HTTP 409 Conflict au deuxième appel — la contrainte UNIQUE SQL est respectée en plus de la vérification applicative
**Statut** : Passé

```gherkin
Given un événement avec eventId="evt-unique-test" est déjà persisté
When POST /api/oms/evenements est appelé à nouveau avec le même eventId
Then la réponse est HTTP 409 Conflict
And la contrainte UNIQUE(event_id) empêche l'insertion en base
```

---

### TC-373 : Pas de méthode delete disponible sur EvenementStore

**US liée** : US-018
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : EvenementStore — pas de delete
**Type** : Invariant domaine
**Préconditions** : Backend svc-oms en profil dev
**Étapes** :
1. Tenter DELETE /api/oms/evenements/{eventId}
2. Vérifier la réponse

**Résultat attendu** : HTTP 405 Method Not Allowed — aucun endpoint de suppression n'existe
**Statut** : Passé

```gherkin
Given un événement exist en base
When DELETE /api/oms/evenements/{eventId} est tenté
Then la réponse est HTTP 405 Method Not Allowed
And l'événement reste intact en base (immuabilité garantie)
```

---

### TC-374 : Reconstitution complète du parcours d'un colis en ordre chronologique

**US liée** : US-018
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : ConsulterHistoriqueColisHandler — audit < 5 min (NFR)
**Type** : Fonctionnel / NFR
**Préconditions** : DevDataSeeder a créé plusieurs événements pour colis-s-001 (TOURNEE_DEMARREE + LIVRAISON_CONFIRMEE)
**Étapes** :
1. Appeler GET /api/oms/evenements/colis/colis-s-001
2. Chronométrer la réponse
3. Vérifier l'ordre et les 4 attributs obligatoires dans chaque événement

**Résultat attendu** : HTTP 200 en moins de 5 minutes (SLA audit NFR), événements en ordre chronologique, chaque événement contient qui/quoi/quand/GPS-ou-modeDegradGPS
**Statut** : Passé

```gherkin
Given le DevDataSeeder a créé 2 événements pour colis-s-001
When GET /api/oms/evenements/colis/colis-s-001 est appelé
Then la réponse est HTTP 200 en moins de 5 secondes
And les événements sont dans l'ordre chronologique ascendant
And chaque événement contient livreurId (qui), type+colisId (quoi), horodatage (quand), coordonnees ou modeDegradGPS (GPS)
```

---

### TC-375 : Mode dégradé GPS — événement créé sans GPS, modeDegradGPS=true

**US liée** : US-018
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : EvenementLivraison — coordonnees null accepté si modeDegradGPS=true
**Type** : Edge case
**Préconditions** : Backend svc-oms en profil dev
**Étapes** :
1. Envoyer POST /api/oms/evenements sans latitude ni longitude
2. Vérifier modeDegradGPS dans la réponse

**Résultat attendu** : HTTP 201, modeDegradGPS=true — l'événement est créé avec les 3 autres attributs obligatoires. Les 4 attributs sont satisfaits.
**Statut** : Passé

```gherkin
Given un événement de livraison est créé sans coordonnées GPS (zone blanche)
When POST /api/oms/evenements est appelé (livreurId, colisId, type, horodatage présents; GPS absent)
Then la réponse est HTTP 201 Created
And "modeDegradGPS" = true dans la réponse
And les 4 attributs obligatoires sont satisfaits (GPS remplacé par le flag modeDegradGPS)
```
