# Scénarios de tests US-032 — Synchroniser le read model supervision depuis les événements livreur

**US liée** : US-032
**Bounded Context** : BC-03 (Supervision) — consumer / BC-01 (Tournée) — producer
**Aggregate / Domain Event ciblé** : VueTournee (read model) / ColisLivre, EchecDeclaree, TourneeCloturee
**Date de rédaction** : 2026-03-29

---

## Périmètre

US-032 résout un bloquant MVP : le tableau de bord superviseur affichait des données statiques
figées au démarrage. La solution retenue est un appel HTTP synchrone fire-and-forget depuis
`svc-tournee` (:8081) vers `svc-supervision` (:8082) après chaque action livreur significative.

---

## TC-032-L1-01 : COLIS_LIVRE incrémente colisTraites et broadcaster est appelé

**US liée** : US-032
**Niveau** : L1
**Couche testée** : Application
**Aggregate / Domain Event ciblé** : VueTournee / COLIS_LIVRE
**Type** : Invariant domaine
**Préconditions** : VueTournee(T-001) existe avec colisTraites=1, VueColis(C-009) en statut A_LIVRER, eventId EVT-001 non encore traité
**Étapes** :
1. Appeler `VueTourneeEventHandler.handle(EvenementTourneeCommand("EVT-001", "COLIS_LIVRE", "T-001", ..., "C-009", null))`
**Résultat attendu** : VueTournee.colisTraites == 2, VueColis.statut == "LIVRE", broadcaster.broadcastTableauDeBord() appelé une fois, processedEventJpaRepository.save() appelé

```gherkin
Given une VueTournee T-001 avec colisTraites=1, colisTotal=10, statut=EN_COURS
  And une VueColis C-009 avec statut=A_LIVRER
  And l'eventId EVT-001 n'est pas dans processed_events
When VueTourneeEventHandler reçoit COLIS_LIVRE(eventId=EVT-001, tourneeId=T-001, colisId=C-009)
Then VueTournee.colisTraites == 2
  And VueColis C-009 passe au statut LIVRE
  And broadcaster.broadcastTableauDeBord() est appelé une fois
  And EVT-001 est enregistré dans processed_events
```

**Statut** : Passé

---

## TC-032-L1-02 : ECHEC_DECLAREE incrémente colisTraites et met à jour VueColis avec motif

**US liée** : US-032
**Niveau** : L1
**Couche testée** : Application
**Aggregate / Domain Event ciblé** : VueTournee / ECHEC_DECLAREE
**Type** : Invariant domaine
**Préconditions** : VueTournee(T-001) avec colisTraites=1, VueColis(C-003) en statut A_LIVRER
**Étapes** :
1. Appeler `handle(EvenementTourneeCommand("EVT-002", "ECHEC_DECLAREE", "T-001", ..., "C-003", "ABSENT"))`
**Résultat attendu** : colisTraites == 2, VueColis.statut == "ECHEC", VueColis.motifEchec == "ABSENT", broadcaster appelé

```gherkin
Given une VueTournee T-001 avec colisTraites=1
  And une VueColis C-003 avec statut=A_LIVRER
  And eventId EVT-002 non traité
When VueTourneeEventHandler reçoit ECHEC_DECLAREE(motif=ABSENT, colisId=C-003)
Then VueTournee.colisTraites == 2
  And VueColis C-003 passe au statut ECHEC avec motifEchec=ABSENT
  And broadcaster.broadcastTableauDeBord() est appelé
```

**Statut** : Passé

---

## TC-032-L1-03 : TOURNEE_CLOTUREE passe le statut à CLOTUREE

**US liée** : US-032
**Niveau** : L1
**Couche testée** : Application
**Aggregate / Domain Event ciblé** : VueTournee / TOURNEE_CLOTUREE
**Type** : Invariant domaine
**Préconditions** : VueTournee(T-001) avec statut=EN_COURS, colisTraites=10, colisTotal=10
**Étapes** :
1. Appeler `handle(EvenementTourneeCommand("EVT-003", "TOURNEE_CLOTUREE", "T-001", ..., null, null))`
**Résultat attendu** : VueTournee.statut == CLOTUREE, broadcaster appelé

```gherkin
Given une VueTournee T-001 avec statut=EN_COURS, colisTraites=10, colisTotal=10
  And eventId EVT-003 non traité
When VueTourneeEventHandler reçoit TOURNEE_CLOTUREE(tourneeId=T-001)
Then VueTournee.statut == CLOTUREE
  And broadcaster.broadcastTableauDeBord() est appelé
```

**Statut** : Passé

---

## TC-032-L1-04 : Idempotence — eventId déjà traité, aucune modification du read model

**US liée** : US-032
**Niveau** : L1
**Couche testée** : Application
**Aggregate / Domain Event ciblé** : VueTournee / idempotence
**Type** : Invariant domaine
**Préconditions** : L'eventId EVT-42 est déjà présent dans processed_events (existsById=true)
**Étapes** :
1. Appeler `handle(EvenementTourneeCommand("EVT-42", "COLIS_LIVRE", "T-001", ..., "C-009", null))`
**Résultat attendu** : vueTourneeRepository.save() jamais appelé, vueTourneeRepository.findByTourneeId() jamais appelé, broadcaster jamais appelé

```gherkin
Given l'eventId EVT-42 est déjà dans processed_events
When VueTourneeEventHandler reçoit à nouveau COLIS_LIVRE(eventId=EVT-42)
Then vueTourneeRepository.save() n'est pas appelé
  And broadcaster.broadcastTableauDeBord() n'est pas appelé
  And aucune exception n'est levée
```

**Statut** : Passé

---

## TC-032-L1-05 : Création automatique VueTournee si absente du read model

**US liée** : US-032
**Niveau** : L1
**Couche testée** : Application
**Aggregate / Domain Event ciblé** : VueTournee / création automatique
**Type** : Edge case
**Préconditions** : La tournée T-NOUVEAU n'existe pas dans le read model (findByTourneeId retourne Optional.empty())
**Étapes** :
1. Appeler `handle(EvenementTourneeCommand("EVT-010", "COLIS_LIVRE", "T-NOUVEAU", "livreur-999", "C-001", null))`
**Résultat attendu** : Une nouvelle VueTournee est créée avec tourneeId=T-NOUVEAU, colisTraites=1, statut=EN_COURS

```gherkin
Given aucune VueTournee pour tourneeId=T-NOUVEAU dans le read model
  And eventId EVT-010 non traité
When VueTourneeEventHandler reçoit COLIS_LIVRE pour T-NOUVEAU
Then une nouvelle VueTournee est créée avec tourneeId=T-NOUVEAU
  And colisTraites == 1
  And statut == EN_COURS
  And broadcaster.broadcastTableauDeBord() est appelé
```

**Statut** : Passé

---

## TC-032-L1-06 : Type d'événement inconnu — log WARN, pas d'exception, pas de modification

**US liée** : US-032
**Niveau** : L1
**Couche testée** : Application
**Aggregate / Domain Event ciblé** : VueTournee / résilience
**Type** : Edge case
**Préconditions** : VueTournee(T-001) existe, eventId EVT-999 non traité
**Étapes** :
1. Appeler `handle(EvenementTourneeCommand("EVT-999", "TYPE_INCONNU", "T-001", ...))`
**Résultat attendu** : vueTourneeRepository.save() jamais appelé, broadcaster jamais appelé, aucune exception levée

```gherkin
Given une VueTournee T-001 existante
  And un eventType inconnu "TYPE_INCONNU"
When VueTourneeEventHandler traite cet événement
Then aucune exception n'est levée
  And vueTourneeRepository.save() n'est pas appelé
  And broadcaster.broadcastTableauDeBord() n'est pas appelé
```

**Statut** : Passé

---

## TC-032-L1-07 : POST /internal/vue-tournee/events retourne 200 pour payload COLIS_LIVRE valide

**US liée** : US-032
**Niveau** : L1 (WebMvcTest)
**Couche testée** : Interface (contrôleur)
**Aggregate / Domain Event ciblé** : SupervisionController / endpoint interne
**Type** : Fonctionnel
**Préconditions** : VueTourneeEventHandler mocké, payload JSON valide (eventId, eventType, tourneeId présents)
**Étapes** :
1. POST `/api/supervision/internal/vue-tournee/events` avec payload COLIS_LIVRE valide
**Résultat attendu** : HTTP 200, vueTourneeEventHandler.handle() appelé une fois

```gherkin
Given un payload JSON valide avec eventId="EVT-001", eventType="COLIS_LIVRE", tourneeId="T-001"
When POST /api/supervision/internal/vue-tournee/events
Then HTTP 200 OK
  And vueTourneeEventHandler.handle() est appelé une fois
```

**Statut** : Passé

---

## TC-032-L1-08 : POST /internal sans eventId retourne 400

**US liée** : US-032
**Niveau** : L1 (WebMvcTest)
**Couche testée** : Interface (validation)
**Type** : Edge case
**Préconditions** : payload avec eventId=""
**Étapes** :
1. POST `/api/supervision/internal/vue-tournee/events` avec eventId=""
**Résultat attendu** : HTTP 400 Bad Request

```gherkin
Given un payload avec eventId vide ""
When POST /api/supervision/internal/vue-tournee/events
Then HTTP 400 Bad Request
```

**Statut** : Passé

---

## TC-032-L1-09 : POST /internal sans tourneeId retourne 400

**US liée** : US-032
**Niveau** : L1 (WebMvcTest)
**Couche testée** : Interface (validation)
**Type** : Edge case
**Préconditions** : payload avec tourneeId=""
**Étapes** :
1. POST `/api/supervision/internal/vue-tournee/events` avec tourneeId=""
**Résultat attendu** : HTTP 400 Bad Request

```gherkin
Given un payload avec tourneeId vide ""
When POST /api/supervision/internal/vue-tournee/events
Then HTTP 400 Bad Request
```

**Statut** : Passé

---

## TC-032-L2-01 : COLIS_LIVRE incrémente colisTraites dans le read model en base

**US liée** : US-032
**Niveau** : L2
**Couche testée** : Infrastructure / API svc-supervision
**Type** : Fonctionnel
**Préconditions** : svc-supervision démarré sur :8082, tournee-sup-001 dans le seeder avec colisTraites=3
**Étapes** :
1. Lire colisTraites initial via GET /api/supervision/tableau-de-bord
2. POST /api/supervision/internal/vue-tournee/events avec eventId unique, COLIS_LIVRE, tourneeId=tournee-sup-001
3. GET /api/supervision/tableau-de-bord et vérifier colisTraites incrémenté
**Résultat attendu** : HTTP 200, colisTraites == 4 (avant=3)

```gherkin
Given svc-supervision opérationnel sur :8082
  And tournee-sup-001 avec colisTraites=3
When POST /api/supervision/internal/vue-tournee/events avec COLIS_LIVRE pour tournee-sup-001
Then HTTP 200 OK
  And GET /tableau-de-bord retourne tournee-sup-001.colisTraites == 4
```

**Statut** : Passé

---

## TC-032-L2-02 : ECHEC_DECLAREE incrémente colisTraites dans le read model en base

**US liée** : US-032
**Niveau** : L2
**Couche testée** : Infrastructure / API svc-supervision
**Type** : Fonctionnel
**Préconditions** : svc-supervision démarré, tournee-sup-002 avec colisTraites=7
**Étapes** :
1. POST /internal/vue-tournee/events avec ECHEC_DECLAREE, motif=ABSENT, tourneeId=tournee-sup-002
2. GET /tableau-de-bord vérifier colisTraites
**Résultat attendu** : HTTP 200, colisTraites == 8

```gherkin
Given tournee-sup-002 avec colisTraites=7
When POST /internal/vue-tournee/events ECHEC_DECLAREE(motif=ABSENT)
Then HTTP 200 OK
  And tournee-sup-002.colisTraites == 8
```

**Statut** : Passé

---

## TC-032-L2-03 : TOURNEE_CLOTUREE passe le statut à CLOTUREE en base

**US liée** : US-032
**Niveau** : L2
**Couche testée** : Infrastructure / API svc-supervision
**Type** : Fonctionnel
**Préconditions** : svc-supervision démarré, tournee-sup-003 avec statut=A_RISQUE
**Étapes** :
1. POST /internal/vue-tournee/events avec TOURNEE_CLOTUREE, tourneeId=tournee-sup-003
2. GET /tableau-de-bord vérifier statut
**Résultat attendu** : HTTP 200, tournee-sup-003.statut == CLOTUREE

```gherkin
Given tournee-sup-003 avec statut=A_RISQUE
When POST /internal/vue-tournee/events TOURNEE_CLOTUREE
Then HTTP 200 OK
  And tournee-sup-003.statut == CLOTUREE
```

**Statut** : Passé

---

## TC-032-L2-04 : Idempotence — deuxième envoi du même eventId sans modification

**US liée** : US-032
**Niveau** : L2
**Couche testée** : Infrastructure / idempotence en base
**Type** : Invariant domaine
**Préconditions** : L'eventId "us032-evt-L2-001" a déjà été traité (colisTraites=4 pour tournee-sup-001)
**Étapes** :
1. Renvoyer exactement le même payload avec eventId="us032-evt-L2-001"
2. GET /tableau-de-bord vérifier colisTraites
**Résultat attendu** : HTTP 200, colisTraites toujours == 4 (non modifié)

```gherkin
Given l'eventId "us032-evt-L2-001" a déjà été traité
  And tournee-sup-001.colisTraites == 4
When POST /internal/vue-tournee/events avec le même eventId="us032-evt-L2-001"
Then HTTP 200 OK (idempotent, pas d'erreur)
  And tournee-sup-001.colisTraites reste == 4
```

**Statut** : Passé

---

## TC-032-L2-05 : Création automatique d'une VueTournee absente du read model

**US liée** : US-032
**Niveau** : L2
**Couche testée** : Infrastructure / création automatique
**Type** : Edge case
**Préconditions** : aucune tournée "tournee-L2-NEW" dans le seeder de svc-supervision
**Étapes** :
1. POST /internal/vue-tournee/events avec COLIS_LIVRE, tourneeId="tournee-L2-NEW"
2. GET /tableau-de-bord chercher tournee-L2-NEW
**Résultat attendu** : HTTP 200, tournee-L2-NEW apparaît dans le tableau de bord avec colisTraites=1, statut=EN_COURS

```gherkin
Given aucune VueTournee "tournee-L2-NEW" dans svc-supervision
When POST /internal/vue-tournee/events COLIS_LIVRE(tourneeId=tournee-L2-NEW)
Then HTTP 200 OK
  And GET /tableau-de-bord retourne tournee-L2-NEW avec colisTraites=1 et statut=EN_COURS
```

**Statut** : Passé

---

## TC-032-L2-06a : Validation 400 — eventId manquant

**US liée** : US-032
**Niveau** : L2
**Couche testée** : Interface / validation HTTP
**Type** : Edge case
**Préconditions** : svc-supervision démarré
**Étapes** :
1. POST /internal/vue-tournee/events avec eventId=""
**Résultat attendu** : HTTP 400 Bad Request

```gherkin
Given un payload avec eventId=""
When POST /api/supervision/internal/vue-tournee/events
Then HTTP 400 Bad Request
```

**Statut** : Passé

---

## TC-032-L2-06b : Validation 400 — tourneeId manquant

**US liée** : US-032
**Niveau** : L2
**Couche testée** : Interface / validation HTTP
**Type** : Edge case
**Préconditions** : svc-supervision démarré
**Étapes** :
1. POST /internal/vue-tournee/events avec tourneeId=""
**Résultat attendu** : HTTP 400 Bad Request

```gherkin
Given un payload avec tourneeId=""
When POST /api/supervision/internal/vue-tournee/events
Then HTTP 400 Bad Request
```

**Statut** : Passé

---

## TC-032-L2-08 : Flux cross-services — livraison confirmée sur svc-tournee propagée vers svc-supervision

**US liée** : US-032
**Niveau** : L2
**Couche testée** : Cross-services (svc-tournee → svc-supervision)
**Type** : Cross-services
**Préconditions** : svc-tournee (:8081) et svc-supervision (:8082) démarrés, colis-001-001 A_LIVRER dans tournee-dev-001
**Étapes** :
1. POST /api/tournees/tournee-dev-001/colis/colis-001-001/livraison sur svc-tournee
2. Poll GET /api/supervision/tableau-de-bord (max 5s) pour vérifier propagation
**Résultat attendu** : HTTP 200 svc-tournee, VueTournee tournee-dev-001 apparaît dans supervision avec colisTraites=1 (création automatique)

```gherkin
Given svc-tournee et svc-supervision opérationnels
  And colis-001-001 en statut A_LIVRER dans tournee-dev-001
  And tournee-dev-001 absente du read model svc-supervision
When POST /api/tournees/tournee-dev-001/colis/colis-001-001/livraison
Then HTTP 200 OK côté svc-tournee
  And GET /tableau-de-bord supervision retourne tournee-dev-001.colisTraites == 1
```

**Statut** : Passé

---

## TC-032-L2-09 : Flux cross-services — échec déclaré sur svc-tournee propagé vers svc-supervision

**US liée** : US-032
**Niveau** : L2
**Couche testée** : Cross-services
**Type** : Cross-services
**Préconditions** : svc-tournee et svc-supervision démarrés, tournee-dev-001 colisTraites=1, colis-001-002 A_LIVRER
**Étapes** :
1. POST /api/tournees/tournee-dev-001/colis/colis-001-002/echec avec motif=ABSENT, disposition=A_REPRESENTER
2. Poll GET /tableau-de-bord supervision (max 5s)
**Résultat attendu** : HTTP 200, tournee-dev-001.colisTraites == 2

```gherkin
Given tournee-dev-001 dans supervision avec colisTraites=1
  And colis-001-002 A_LIVRER dans svc-tournee
When POST /api/tournees/tournee-dev-001/colis/colis-001-002/echec(motif=ABSENT)
Then HTTP 200 OK
  And tournee-dev-001.colisTraites == 2 dans svc-supervision
```

**Statut** : Passé

---

## TC-032-L2-10 : Flux cross-services — clôture de tournée propagée vers svc-supervision

**US liée** : US-032
**Niveau** : L2
**Couche testée** : Cross-services
**Type** : Cross-services
**Préconditions** : tous les colis traités dans tournee-dev-001, statut EN_COURS dans supervision
**Étapes** :
1. POST /api/tournees/tournee-dev-001/cloture
2. Poll GET /tableau-de-bord (max 5s) vérifier statut
**Résultat attendu** : HTTP 200, tournee-dev-001.statut == CLOTUREE dans supervision

```gherkin
Given tournee-dev-001 avec tous les colis traités
  And tournee-dev-001 dans supervision avec statut=EN_COURS
When POST /api/tournees/tournee-dev-001/cloture
Then HTTP 200 OK
  And tournee-dev-001.statut == CLOTUREE dans svc-supervision
```

**Statut** : Passé

---

## Note sur L3

L3 (Playwright) non exécuté pour cette US.

Les critères d'acceptation 1 à 4 de l'US-032 sont entièrement couverts par L1 (logique domaine et
invariants) et L2 (propagation cross-services et idempotence réelle en base). La fonctionnalité testée
est la synchronisation de données entre services (mise à jour du read model), pas une interaction UI
spécifique. Le WebSocket est brodcasté en arrière-plan — le tableau de bord superviseur (US-011) a
déjà été validé via Playwright lors de sa propre campagne. La couverture L1+L2 est complète.

Le critère 5 (résilience — svc-supervision indisponible) est couvert architecturalement par le
pattern fire-and-forget avec retry du `SupervisionNotifier` (2 tentatives, backoff 500ms), validé
par les tests unitaires de non-régression de svc-tournee (112/112 PASS).
