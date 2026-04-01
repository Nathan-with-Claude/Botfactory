# US-032 : Synchroniser le read model supervision depuis les événements livreur

**Epic** : EPIC-003 — Supervision et Pilotage Temps Réel
**Feature** : F-023 — Propagation des événements livreur vers le read model supervision
**Bounded Context** : BC-03 (Supervision) — consumer du BC-01 (Tournée)
**Aggregate(s) touchés** : VueTournee (read model svc-supervision)
**Priorité** : Must Have (bloquant MVP)
**Statut** : Prête
**Complexité estimée** : L

---

## User Story

En tant que superviseur,
je veux que mon tableau de bord reflète en temps réel les actions effectuées par le livreur
(livraisons confirmées, échecs déclarés, clôture de tournée),
afin de piloter les tournées du jour avec des données à jour sans avoir à rafraîchir manuellement.

---

## Contexte

### Problème architectural identifié (2026-03-26)

`svc-tournee` (:8081) émet des Domain Events (`ColisLivre`, `EchecDeclaree`, `TourneeCloturee`)
dans sa propre JVM mais ne les publie sur aucun bus ou topic. `svc-supervision` (:8082)
maintient un read model `VueTournee` dans `supervision_dev` qui est peuplé uniquement au
démarrage par le `DevDataSeeder` et jamais mis à jour ultérieurement. `svc-oms` (:8083)
enregistre les événements de `svc-tournee` dans son Event Store immuable mais aucun
mécanisme ne propage ces événements vers `svc-supervision`.

Résultat : le superviseur voit des données statiques sur son tableau de bord — le statut
des colis, le compteur de livraisons et le statut global de la tournée sont figés à leur
valeur initiale. C'est un bloquant MVP car la supervision temps réel est un KPI central
du produit (délai de détection d'une anomalie < 15 minutes).

### Périmètre de la solution MVP

La solution MVP adopte un mécanisme de propagation synchrone HTTP entre services
(pas de broker de messages au MVP — cf. design-decisions.md). `svc-tournee` appelle
l'endpoint `POST /internal/vue-tournee/events` de `svc-supervision` après chaque
action livreur significative. `svc-supervision` met à jour son aggregate `VueTournee`
et pousse la mise à jour via WebSocket vers le frontend web.

Le couplage HTTP synchrone est un compromis acceptable pour le MVP. La migration vers
un bus d'événements (Kafka ou RabbitMQ) est prévue en V2.

### Invariants à respecter

- Un `VueTournee` ne peut passer à l'état `CLOTUREE` que si `colisRestants == 0`
  ou si `TourneeCloturee` est reçu (clôture forcée par le livreur).
- `nbColisLivres + nbColisEnEchec + colisRestants` doit toujours être égal
  à `nbColisTotal` (invariant de cohérence du compteur).
- L'état de `VueTournee` est mis à jour de façon idempotente : recevoir deux fois
  le même événement (même `eventId`) ne doit pas modifier le read model une seconde fois.
- Le endpoint `/internal/vue-tournee/events` n'est accessible que par les services
  internes (pas exposé au frontend — sécurité réseau interne).

---

## Critères d'acceptation (Gherkin)

### Scénario 1 — Livraison confirmée mise à jour dans le tableau de bord

```gherkin
Given une tournée T-001 est EN_COURS avec 10 colis (8 restants, 1 livré, 1 en échec)
  And le read model VueTournee de svc-supervision reflète ces valeurs initiales
When svc-tournee traite la confirmation de livraison du colis C-009
  And émet le Domain Event ColisLivre(tourneeId=T-001, colisId=C-009, horodatage)
Then svc-tournee appelle POST /internal/vue-tournee/events sur svc-supervision
  And VueTournee(T-001) est mis à jour : nbColisLivres=2, colisRestants=7
  And la mise à jour est poussée via WebSocket au frontend superviseur
  And le tableau de bord W-01 affiche "2 livrés / 1 échec / 7 restants" sans rechargement
```

### Scénario 2 — Échec de livraison déclaré mis à jour dans le tableau de bord

```gherkin
Given une tournée T-001 est EN_COURS avec nbColisEnEchec=1
When svc-tournee traite la déclaration d'échec pour le colis C-003
  And émet le Domain Event EchecDeclaree(tourneeId=T-001, colisId=C-003, motif=ABSENT)
Then VueTournee(T-001) est mis à jour : nbColisEnEchec=2, colisRestants décrémenté de 1
  And le tableau de bord W-01 signale l'incident (indicateur d'échec mis à jour)
```

### Scénario 3 — Clôture de tournée propagée vers le read model

```gherkin
Given une tournée T-001 est EN_COURS
When svc-tournee traite la clôture de la tournée par le livreur
  And émet le Domain Event TourneeCloturee(tourneeId=T-001, horodatage)
Then VueTournee(T-001) passe au statut CLOTUREE
  And la mise à jour est poussée via WebSocket
  And le tableau de bord W-01 affiche la tournée T-001 dans la colonne "Clôturées"
```

### Scénario 4 — Idempotence : réception d'un événement dupliqué

```gherkin
Given svc-supervision a déjà traité ColisLivre(eventId=EVT-42, colisId=C-009)
  And VueTournee(T-001) a nbColisLivres=2
When svc-supervision reçoit à nouveau ColisLivre(eventId=EVT-42, colisId=C-009)
Then VueTournee(T-001) n'est pas modifié (nbColisLivres reste à 2)
  And svc-supervision retourne HTTP 200 sans erreur (traitement idempotent)
```

### Scénario 5 — Indisponibilité de svc-supervision (résilience)

```gherkin
Given svc-supervision est temporairement indisponible (timeout réseau)
When svc-tournee tente d'appeler POST /internal/vue-tournee/events
  And l'appel échoue après 2 tentatives (retry avec backoff 500ms)
Then svc-tournee logue l'événement non propagé (niveau WARN) avec le eventId
  And l'action livreur est tout de même persistée dans svc-tournee (pas de rollback)
  And une réconciliation pourra être déclenchée manuellement via GET /internal/vue-tournee/reconcile/{tourneeId}
```

---

## Architecture de la solution

### Flux de propagation

```
Livreur (mobile)
      |
      v
svc-tournee (:8081)
  - Action livreur → mise à jour Aggregate Tournee
  - Emission Domain Event (ColisLivre | EchecDeclaree | TourneeCloturee)
  - Appel HTTP POST /internal/vue-tournee/events → svc-supervision
      |
      v
svc-supervision (:8082)
  - VueTourneeEventHandler : reçoit l'événement
  - Met à jour VueTournee (read model) en base supervision_dev
  - Pousse la mise à jour via WebSocket → frontend web superviseur
      |
svc-oms (:8083) — enregistrement immuable (flux existant, non impacté)
```

### Contrat d'interface (endpoint interne)

```
POST /internal/vue-tournee/events
Content-Type: application/json

{
  "eventId": "uuid-v4",
  "eventType": "COLIS_LIVRE | ECHEC_DECLAREE | TOURNEE_CLOTUREE",
  "tourneeId": "string",
  "colisId": "string | null",
  "motif": "string | null",
  "horodatage": "ISO-8601"
}

Réponses :
  200 OK  — événement traité (y compris si déjà traité = idempotent)
  400 Bad Request — payload invalide
  500 Internal Server Error — erreur de traitement
```

### Composants à créer / modifier

**svc-tournee** :
- `VueTourneeClient` : HTTP client (RestTemplate ou WebClient) vers svc-supervision
- Appels dans `LivraisonConfirmeHandler`, `EchecDeclarerHandler`, `CloturerTourneeHandler`

**svc-supervision** :
- `VueTourneeEventHandler` : endpoint POST /internal/vue-tournee/events
- `VueTourneeUpdater` : service applicatif mettant à jour VueTournee
- `VueTourneeWebSocketPublisher` : pousse la mise à jour via le WebSocket existant
- Table `processed_events(event_id, processed_at)` pour l'idempotence

---

## Liens

- Wireframe : /livrables/02-ux/wireframes.md#w-01-tableau-de-bord
- Parcours : /livrables/02-ux/user-journeys.md#parcours-superviseur
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
- US liée (tableau de bord) : /livrables/05-backlog/user-stories/US-011-tableau-de-bord-tournees.md
- US liée (détail tournée) : /livrables/05-backlog/user-stories/US-012-detail-tournee-superviseur.md
- US liée (alertes risque) : /livrables/05-backlog/user-stories/US-013-alerte-tournee-risque.md
