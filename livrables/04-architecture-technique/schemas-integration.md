# Schémas d'intégration DocuPost

> Document de référence — Version 1.0 — 2026-03-19
> Produit par l'Architecte Technique à partir des entretiens métier (M. Garnier Architecte
> Technique DSI, Mme Dubois DSI, M. Renaud Responsable Exploitation) et du domain model
> (/livrables/03-architecture-metier/domain-model.md).
>
> Périmètre MVP : intégration OMS uniquement. CRM et ERP exclus du MVP (Release 2).
> Source : "Phase 1 limitée à l'OMS pour maîtriser la complexité d'intégration." (perimetre-mvp.md)

---

## Context Map technique

Reproduit la Context Map de l'Architecte Métier avec les choix d'intégration techniques.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DocuPost (périmètre interne)                      │
│                                                                             │
│  BC_Orchestration_Tournée ──[Events]──→ BC_Supervision                      │
│  BC_Orchestration_Tournée ──[Events]──→ BC_GestionPreuves (PreuveCapturée)  │
│  BC_Orchestration_Tournée ──[Events]──→ BC_Integration_SI                   │
│  BC_GestionPreuves        ──[Events]──→ BC_Integration_SI                   │
│  BC_Supervision           ──[Commands]→ BC_Notification                     │
│  BC_Notification          ──[Events]──→ BC_Orchestration_Tournée            │
│  BC_Identite_Acces        ──[SharedKernel]── tous les BC                    │
│                                                                             │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │ ACL
                         ┌─────────▼──────────┐
                         │  BC_Integration_SI │
                         │  (Anti-Corruption  │
                         │   Layer)           │
                         └─────────┬──────────┘
                                   │ API REST
                         ┌─────────▼──────────┐
                         │   OMS Docaposte    │
                         │   (Système externe)│
                         └────────────────────┘

SSO Corporate Docaposte ──[OAuth2/OIDC]──→ Tous les BC (Shared Kernel Identité)
FCM Google             ──[Push API]──────→ BC_Notification → App Android
```

### Tableau des relations inter-contextes

| Contexte upstream | Contexte downstream | Type de relation | Mécanisme technique |
|---|---|---|---|
| BC_Orchestration_Tournée | BC_Supervision | Customer/Supplier — Domain Events | Spring ApplicationEvent + outbox PostgreSQL |
| BC_Orchestration_Tournée | BC_Integration_SI | Published Language — Events | Spring ApplicationEvent + outbox PostgreSQL |
| BC_GestionPreuves | BC_Integration_SI | Customer/Supplier — Events | Spring ApplicationEvent |
| BC_GestionPreuves | BC_Orchestration_Tournée | Customer/Supplier — Events | Spring ApplicationEvent |
| BC_Supervision | BC_Notification | Customer/Supplier — Commandes | Appel interne synchrone (HTTP interne) |
| BC_Notification | BC_Orchestration_Tournée | Customer/Supplier — Events | InstructionReçue via API Gateway → App mobile |
| BC_Integration_SI | OMS Externe | ACL — API REST | HTTP POST avec retry et backoff |
| SSO Corporate | Tous BC | Shared Kernel — Token JWT | OAuth2 / OIDC introspection |

---

## Anti-Corruption Layers

| Système externe | BC consommateur | Mécanisme ACL | Mapping clé |
|---|---|---|---|
| OMS Docaposte | BC_Integration_SI | Adapter + Translator (`OmsEventTranslator`) | `LivraisonConfirmee` DocuPost → payload statut OMS ; `colisId` DocuPost → `shipmentItemId` OMS |
| SSO Corporate OAuth2 | BC_Identite_Acces | Spring Security OAuth2 Resource Server | `sub` JWT → `livreurId` ou `superviseurId` DocuPost ; claim `role` → rôle interne |
| Firebase Cloud Messaging | BC_Notification | `FcmPushAdapter` | `InstructionEnvoyee` DocuPost → payload FCM JSON avec `data.instructionId`, `data.type` |
| Google Maps / cartographie | App Mobile (BC_Orchestration) | SDK Maps (aucun modèle interne exposé) | `Coordonnees` DocuPost → `LatLng` Maps SDK |

### Détail ACL — OMS Docaposte

```
DocuPost (modèle interne)          OMS Docaposte (modèle externe)
─────────────────────────          ───────────────────────────────
LivraisonConfirmee
  tourneeId        (UUID)    →      routeId          (String OMS)
  colisId          (UUID)    →      shipmentItemId   (String OMS)
  statut           LIVRE     →      deliveryStatus   "DELIVERED"
  horodatage       Instant   →      deliveredAt      ISO-8601
  coordonnees.lat  Double    →      gpsLatitude      Double
  coordonnees.lon  Double    →      gpsLongitude     Double
  preuveLivraisonId (UUID)   →      proofReference   (String)
  livreurId        (UUID)    →      carrierId        (String OMS)

EchecLivraisonDeclare
  colisId          (UUID)    →      shipmentItemId   (String OMS)
  statut           ECHEC     →      deliveryStatus   "FAILED"
  motif            ABSENT    →      failureReason    "RECIPIENT_ABSENT"
  motif            ACCES_IMP →      failureReason    "ACCESS_DENIED"
  motif            REFUS     →      failureReason    "REFUSED_BY_RECIPIENT"
  motif            HORAIRES  →      failureReason    "OUTSIDE_DELIVERY_HOURS"
  disposition      A_REPR.   →      nextAction       "REDELIVER"
  disposition      TIERS     →      nextAction       "LEFT_WITH_NEIGHBOR"
  disposition      RETOUR    →      nextAction       "RETURN_TO_DEPOT"

TourneeCloturee
  tourneeId        (UUID)    →      routeId          (String OMS)
  recap.livres     Integer   →      deliveredCount   Integer
  recap.echecs     Integer   →      failedCount      Integer
  horodatage       Instant   →      closedAt         ISO-8601
```

Note : le mapping exact des identifiants OMS (`routeId`, `shipmentItemId`) est à valider
avec M. Garnier sur la base de la documentation API OMS. Hypothèse H2 du périmètre MVP :
"L'OMS expose une API REST permettant la réception d'événements de statut colis."

---

## Flux Domain Events inter-contextes

| Domain Event | BC émetteur | BC(s) abonnés | Transport | SLA |
|---|---|---|---|---|
| TourneeChargee | BC_Orchestration | BC_Supervision | Spring Event + outbox | < 5s |
| TourneeDemarree | BC_Orchestration | BC_Supervision, BC_Integration_SI | Spring Event + outbox | < 5s |
| LivraisonConfirmee | BC_Orchestration | BC_Supervision, BC_Integration_SI | Spring Event + outbox | < 30s vers OMS |
| EchecLivraisonDeclare | BC_Orchestration | BC_Supervision, BC_Integration_SI | Spring Event + outbox | < 30s vers OMS |
| MotifEnregistre | BC_Orchestration | BC_Integration_SI | Spring Event + outbox | < 30s vers OMS |
| IncidentDeclare | BC_Orchestration | BC_Supervision, BC_Notification, BC_Integration_SI | Spring Event + outbox | < 15min alerte |
| TourneeModifiee | BC_Orchestration | BC_Supervision, BC_Integration_SI | Spring Event + outbox | < 30s |
| TourneeCloturee | BC_Orchestration | BC_Supervision, BC_Integration_SI, BC_Reporting | Spring Event + outbox | < 30s |
| PreuveCapturee | BC_GestionPreuves | BC_Orchestration, BC_Integration_SI | Spring Event | < 5s |
| TourneeARisqueDetectee | BC_Supervision | BC_Notification | Spring Event | < 15min |
| AlerteDeclenchee | BC_Supervision | BC_Notification | Spring Event | Immédiat |
| InstructionEnvoyee | BC_Supervision | BC_Notification | Spring Event | Immédiat |
| InstructionRecue | BC_Notification | BC_Orchestration (via App mobile) | FCM push | < 10s |

---

## Flux d'intégration détaillés

### Flux 1 — Chargement de la tournée (OMS → DocuPost)

```
Livreur s'authentifie sur App Android
         │
         ▼
App mobile → API Gateway (JWT)
         │
         ▼
svc-orchestration-tournee : ChargerTournee(livreurId, date)
         │
         ▼
[Appel OMS : GET /routes?carrierId={livreurId}&date={date}]
         │
         ▼
OmsApiAdapter.getTourneeFromOms()
  → OmsEventTranslator.toTournee()    # ACL : modèle OMS → Tournée DocuPost
         │
         ▼
Tournee persistée localement (PostgreSQL)
         ▼
Tournee sérialisée → App mobile (REST JSON)
         ▼
App mobile → Room SQLite (persistence offline)
```

Contrat d'interface OMS (hypothèse — à valider avec M. Garnier) :
```
GET /api/v1/routes?carrierId={id}&date={YYYY-MM-DD}
Authorization: Bearer {token_docupost_service_account}

Réponse 200 :
{
  "routeId": "string",
  "carrierId": "string",
  "date": "YYYY-MM-DD",
  "items": [
    {
      "shipmentItemId": "string",
      "recipientName": "string",
      "deliveryAddress": { "street": "...", "city": "...", "zipCode": "..." },
      "gpsLat": 48.8566,
      "gpsLon": 2.3522,
      "zone": "string",
      "constraints": ["FRAGILE", "TIME_WINDOW"],
      "timeWindowStart": "09:00",
      "timeWindowEnd": "12:00",
      "isSensitiveDocument": false
    }
  ]
}
```

### Flux 2 — Mise à jour de statut colis (DocuPost → OMS)

```
Livreur confirme livraison sur App Android
         │
         ├─── Mode connecté ──────────────────────────────┐
         │    App → API Gateway → svc-orchestration        │
         │    → LivraisonConfirmee publié (outbox)         │
         │    → svc-integration-si consomme               │
         │    → OmsApiAdapter.postStatut()                 │
         │    → OMS reçoit dans < 30 secondes              │
         │                                                  │
         └─── Mode offline (zone blanche) ─────────────────┘
              Action stockée dans Room (SQLite)
              WorkManager détecte retour réseau
              → Rejoue la commande via API Gateway
              → Même flux qu'en mode connecté
              → OMS reçoit dans < 30s après reconnexion
              → SLA terrain-OMS : < 10 minutes (rattrapage)
```

Contrat d'interface OMS — mise à jour statut :
```
POST /api/v1/shipment-items/{shipmentItemId}/delivery-status
Authorization: Bearer {token_docupost_service_account}
Content-Type: application/json

{
  "deliveryStatus": "DELIVERED" | "FAILED",
  "deliveredAt": "2026-03-19T14:32:00Z",
  "gpsLatitude": 48.8566,
  "gpsLongitude": 2.3522,
  "carrierId": "string",
  "proofReference": "uuid-preuve",
  "failureReason": "RECIPIENT_ABSENT" | "ACCESS_DENIED" | "REFUSED_BY_RECIPIENT" | "OUTSIDE_DELIVERY_HOURS",
  "nextAction": "REDELIVER" | "LEFT_WITH_NEIGHBOR" | "RETURN_TO_DEPOT",
  "idempotencyKey": "uuid-v7-commande"
}

Réponse 200 : { "accepted": true }
Réponse 409 : { "error": "DUPLICATE_REQUEST" }  → rejet silencieux (déjà traité)
```

### Flux 3 — Instruction superviseur → livreur

```
Superviseur envoie une instruction (Interface web)
         │
         ▼
API Gateway → svc-supervision : EnvoyerInstruction(...)
         │
         ▼
Instruction persistée (PostgreSQL supervision)
InstructionEnvoyee publié (Spring Event)
         │
         ▼
svc-notification reçoit InstructionEnvoyee
         │
         ▼
FcmPushAdapter.send(livreurId, payload)
         │
         ▼
FCM → App Android livreur
         │
         ▼
App reçoit push → affiche notification
InstructionRecue émis → AppliquerInstruction(instructionId)
         │
         ▼
svc-orchestration : TourneeModifiee publié
         │
         ▼
svc-supervision : InstructionExecutee mise à jour
```

Payload FCM notification :
```json
{
  "to": "{fcm_token_livreur}",
  "data": {
    "type": "INSTRUCTION",
    "instructionId": "uuid",
    "instructionType": "PRIORISER" | "ANNULER" | "REPROGRAMMER",
    "colisId": "uuid",
    "messageComplementaire": "string",
    "creneauCible": "2026-03-19T16:00:00Z"
  },
  "notification": {
    "title": "Instruction superviseur",
    "body": "Prioriser le colis Dupont — 12 rue de la Paix"
  }
}
```

### Flux 4 — Authentification (SSO → DocuPost)

```
Livreur ouvre l'App Android
         │
         ▼
AppAuth (PKCE) → SSO Corporate Docaposte
         │        (Authorization Code + PKCE)
         ▼
SSO émet Access Token (JWT) + Refresh Token
         │
         ▼
App stocke tokens (Android Keystore chiffré)
         │
         ▼
Toutes les requêtes API → Bearer {access_token}
         │
         ▼
API Gateway : Spring Security Resource Server
  → Introspection / validation signature JWT
  → Extraction userId, rôle du claim JWT
  → Injection dans SecurityContext
```

Contenu du JWT attendu :
```json
{
  "sub": "user-uuid",
  "email": "pierre.morel@docaposte.fr",
  "role": "LIVREUR" | "SUPERVISEUR" | "ADMIN",
  "exp": 1234567890,
  "iss": "https://sso.docaposte.fr"
}
```

Note hypothèse H4 : "Le SSO corporate peut être étendu aux livreurs terrain
(population potentiellement sans compte SI actif)." À valider avec la DSI.

---

## Gestion des ruptures de synchronisation

### Stratégie offline — Application mobile

| Scénario | Comportement | Indicateur utilisateur |
|---|---|---|
| Connexion perdue en cours de tournée | Actions stockées localement dans Room SQLite | Bandeau "Mode hors ligne — X actions en attente" |
| Retour connexion | WorkManager rejoue actions en ordre FIFO | Progression de synchronisation visible |
| Rejeu d'une action déjà traitée | API détecte l'idempotencyKey et rejette silencieusement | Aucun impact utilisateur |
| Clôture de tournée avec sync en attente | Blocage de la clôture jusqu'à sync complète | Message explicite : "Synchronisation en cours — clôture impossible" |
| Photo/signature hors connexion | Stockée en local, uploadée vers MinIO au retour réseau | Indicateur "Upload en attente" sur la livraison concernée |

### Stratégie de rejeu — Service Intégration SI (OMS)

```
Événement reçu par svc-integration-si
         │
         ▼
Tentative POST vers OMS
         │
    ┌────┴─────────────────────────────────┐
    │ Succès (200)                          │ Échec (timeout, 5xx, réseau)
    ▼                                       ▼
Event Store : statut SYNCHRONIZED    Event Store : statut FAILED
                                      + incrementer attempt_count
                                             │
                                      Outbox poller (scheduler 30s)
                                      Backoff exponentiel :
                                        1er retry : +30s
                                        2e retry  : +1min
                                        3e retry  : +2min
                                        4e retry  : +5min
                                        5e retry  : +10min
                                             │
                                      Si > 10 minutes sans succès :
                                      Alerte ops (log ERROR + métriques)
                                      Statut : DEAD_LETTER
```

### Idempotence

Chaque commande terrain porte un `commandId` (UUID v7, généré sur le mobile).
Chaque appel OMS porte un `idempotencyKey` (même UUID).

```java
// Exemple : vérification idempotence côté backend
if (evenementRepository.existsByCommandId(command.getCommandId())) {
    log.info("Commande déjà traitée : {}", command.getCommandId());
    return; // rejet silencieux
}
```

---

## Contrats d'interface — SLA

| Interface | Source | Cible | SLA | Mode dégradé |
|---|---|---|---|---|
| App mobile → API Gateway | App Android | Backend DocuPost | < 2 secondes (p95) | Stockage local offline |
| API Gateway → svc-tournee | API Gateway | Backend DocuPost | < 500ms (p95) | N/A (interne) |
| svc-integration → OMS | DocuPost | OMS Docaposte | < 30 secondes (nominal) | Rejeu < 10 minutes |
| SSO → API Gateway | SSO Corporate | API Gateway | < 500ms (p95) | Blocage authentification |
| FCM → App mobile | DocuPost | App Android | < 10 secondes (p95) | Polling fallback si FCM indisponible |
| WebSocket superviseur | Backend | Navigateur web | < 30 secondes mise à jour | Reconnexion auto |
| Preuve disponible support | DocuPost | Support client | < 5 minutes (SLA métier) | Recherche manuelle |
