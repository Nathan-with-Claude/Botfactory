# Schémas d'intégration DocuPost

> Document de référence — Version 1.1 — 2026-03-20
> Produit par l'Architecte Technique à partir des entretiens métier (M. Garnier Architecte
> Technique DSI, Mme Dubois DSI, M. Renaud Responsable Exploitation) et du domain model
> (/livrables/03-architecture-metier/domain-model.md).
>
> Périmètre MVP : intégration OMS et TMS. CRM et ERP exclus du MVP (Release 2).
> Source : "Phase 1 limitée à l'OMS pour maîtriser la complexité d'intégration." (perimetre-mvp.md)
>
> Mise à jour v1.1 : ajout du schéma "Intégration TMS — Import des tournées du matin",
> ACL TMS→DocuPost, mode dégradé TMS indisponible, flux TournéeLancée inter-contextes.

---

## Context Map technique

Reproduit la Context Map de l'Architecte Métier avec les choix d'intégration techniques.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DocuPost (périmètre interne)                      │
│                                                                             │
│  BC_PlanificationTournée  ──[Events]──→ BC_Orchestration_Tournée            │
│  BC_Orchestration_Tournée ──[Events]──→ BC_Supervision                      │
│  BC_Orchestration_Tournée ──[Events]──→ BC_GestionPreuves (PreuveCapturée)  │
│  BC_Orchestration_Tournée ──[Events]──→ BC_Integration_SI                   │
│  BC_GestionPreuves        ──[Events]──→ BC_Integration_SI                   │
│  BC_Supervision           ──[Commands]→ BC_Notification                     │
│  BC_Notification          ──[Events]──→ BC_Orchestration_Tournée            │
│  BC_Identite_Acces        ──[SharedKernel]── tous les BC                    │
│                                                                             │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ ACL (deux points d'entrée)
                    ┌──────────────────┴──────────────────────┐
                    │                                         │
          ┌─────────▼──────────┐                  ┌──────────▼──────────┐
          │  BC_Planification  │                  │  BC_Integration_SI  │
          │  (ACL TMS entrant) │                  │  (ACL OMS sortant)  │
          └─────────┬──────────┘                  └──────────┬──────────┘
                    │ API REST pull / batch fichier           │ API REST
          ┌─────────▼──────────┐                  ┌──────────▼──────────┐
          │   TMS Externe      │                  │   OMS Docaposte     │
          │   (Système externe)│                  │   (Système externe) │
          └────────────────────┘                  └─────────────────────┘

SSO Corporate Docaposte ──[OAuth2/OIDC]──→ Tous les BC (Shared Kernel Identité)
FCM Google             ──[Push API]──────→ BC_Notification → App Android
```

### Tableau des relations inter-contextes

| Contexte upstream | Contexte downstream | Type de relation | Mécanisme technique |
|---|---|---|---|
| TMS Externe | BC_PlanificationTournée | ACL — import entrant | ImporteurTMSScheduler (Spring @Scheduled) + TmsResponseTranslator |
| BC_PlanificationTournée | BC_Orchestration_Tournée | Customer/Supplier — Domain Events | Spring ApplicationEvent + outbox PostgreSQL (TournéeLancée) |
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
| TMS Externe | BC_PlanificationTournée | `TmsApiAdapter` + `TmsResponseTranslator` (import entrant) | `tournee` TMS → `TourneeTMS` DocuPost ; `tourneeId` TMS → `tourneeTMSId` DocuPost ; voir détail ci-dessous |
| OMS Docaposte | BC_Integration_SI | Adapter + Translator (`OmsEventTranslator`) | `LivraisonConfirmee` DocuPost → payload statut OMS ; `colisId` DocuPost → `shipmentItemId` OMS |
| SSO Corporate OAuth2 | BC_Identite_Acces | Spring Security OAuth2 Resource Server | `sub` JWT → `livreurId` ou `superviseurId` DocuPost ; claim `role` → rôle interne |
| Firebase Cloud Messaging | BC_Notification | `FcmPushAdapter` | `InstructionEnvoyee` DocuPost → payload FCM JSON avec `data.instructionId`, `data.type` |
| Google Maps / cartographie | App Mobile (BC_Orchestration) | SDK Maps (aucun modèle interne exposé) | `Coordonnees` DocuPost → `LatLng` Maps SDK |

### Détail ACL — TMS Externe (entrant, Parcours 0)

```
TMS Externe (modèle externe)          DocuPost BC_Planification (modèle interne)
────────────────────────────          ─────────────────────────────────────────
TournéeExport (modèle TMS)
  tourId          (String TMS)  →     tourneeTMSId     (UUID DocuPost, généré)
  tourDate        (String)      →     dateJour         (LocalDate)
  zoneCode        (String)      →     zone             (Value Object Zone)
  parcels[]                    →     compositionTournee.colis[]
    parcelId      (String TMS)  →       colisId        (UUID DocuPost, généré)
    recipientName (String)      →       destinataire   (Value Object Destinataire)
    address       (Object)      →       adresse        (Value Object Adresse)
    gpsLat        (Double)      →       coordonnees.lat (Double)
    gpsLon        (Double)      →       coordonnees.lon (Double)
    isSensitive   (Boolean)     →       documentSensible (Boolean)
    timeWindowStart (String)    →       creneauDebut   (LocalTime)
    timeWindowEnd   (String)    →       creneauFin     (LocalTime)
    constraints[]  (String[])   →       contraintes    (List<ContraintesColis>)
  vehicleType     (String TMS)  →     typeVehiculeRequis (Value Object)
  estimatedParcels (Integer)    →     compositionTournee.nbColisEstime (Integer)

PlanDuJour DocuPost (créé après import)
  date            (LocalDate)
  tourneestms[]   (List<TourneeTMS>)   ← toutes les TourneeTMS importées
  statut          (EN_ATTENTE_AFFECTATION | COMPLET | PARTIEL)
```

Note : le mapping exact des identifiants TMS (`tourId`, `parcelId`) est à valider
avec M. Garnier et M. Renaud (Hypothèse H6 : "Le TMS expose une API ou un flux d'export
permettant l'import automatique des tournées.").

### Détail ACL — OMS Docaposte (sortant)

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

---

## Flux Domain Events inter-contextes

| Domain Event | BC émetteur | BC(s) abonnés | Transport | SLA |
|---|---|---|---|---|
| TourneeImporteeTMS | BC_Planification | BC_Planification (interne — log + alerte superviseur) | Spring Event | < 5s |
| CompositionVerifiee | BC_Planification | BC_Planification (interne) | Spring Event | < 5s |
| AffectationEnregistree | BC_Planification | BC_Planification (interne) | Spring Event | < 5s |
| TourneeLancee | BC_Planification | BC_Orchestration_Tournée | Spring Event + outbox | < 5s |
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

### Flux 0 — Intégration TMS — Import des tournées du matin (TMS → DocuPost)

Ce flux est le prérequis bloquant du Parcours 0. Il se déclenche automatiquement
chaque matin via le scheduler Spring et alimente le BC_PlanificationTournée.

```
TMS Externe
    |
    | API REST pull (GET /api/tournees?date={date})
    | ou batch fichier SFTP/JSON (selon résultat validation H6)
    ↓
ImporteurTMSScheduler (@Scheduled, cron "0 0 6 * * MON-SAT")
    |
    | TmsApiAdapter.importerTourneesduJour(date)
    ↓
TmsResponseTranslator.toPlanDuJour()
    |   Traduit le modèle TMS → modèle DocuPost (ACL)
    |   TournéeTMS (modèle TMS) → PlanDuJour + TournéesTMS (modèle DocuPost)
    ↓
BC-07 PlanificationTournée
    |   PlanDuJour créé
    |   TournéesTMS initialisées (statut : EN_ATTENTE_AFFECTATION)
    |   TourneeImporteeTMS publié (Domain Event)
    ↓
Interface web superviseur (W-04 : Vue liste des tournées du matin)
    |   Superviseur visualise le plan du jour
    |   Vérifie les compositions (W-05 : Détail d'une tournée à préparer)
    |   Enregistre les affectations livreur + véhicule
    |   Lance les tournées affectées
    ↓
TourneeLancee publié (Domain Event)  [POST /tournees/{id}/lancer]
    |
    ↓
BC-01 OrchestrationTournée
    |   Tournée créée dans le BC-01 à partir des données de la TourneeTMS
    |   Tournée visible dans l'application mobile livreur
    ↓
App mobile livreur
    |   ChargerTourneeUseCase déclenché pour le livreur concerné
    |   Colis disponibles dès le départ en tournée
```

#### Format d'échange supposé (à confirmer avec TMS — H6)

Format privilégié : **API REST pull** (Option retenue dans DD-010).
Format alternatif : batch fichier JSON ou CSV via SFTP (fallback si API non exposée).

Contrat d'interface TMS supposé (hypothèse — à valider avec M. Garnier et M. Renaud) :
```
GET /api/v1/tournees?date={YYYY-MM-DD}
Authorization: Bearer {token_docupost_service_account}

Réponse 200 :
{
  "date": "2026-03-20",
  "tournees": [
    {
      "tourId": "string",
      "zoneCode": "string",
      "vehicleType": "string",
      "estimatedParcels": 95,
      "timeWindowStart": "07:00",
      "timeWindowEnd": "19:00",
      "parcels": [
        {
          "parcelId": "string",
          "recipientName": "string",
          "address": {
            "street": "...",
            "city": "...",
            "zipCode": "..."
          },
          "gpsLat": 48.8566,
          "gpsLon": 2.3522,
          "isSensitive": false,
          "constraints": ["FRAGILE", "TIME_WINDOW"],
          "timeWindowStart": "09:00",
          "timeWindowEnd": "12:00"
        }
      ]
    }
  ]
}

Réponse 404 : aucune tournée disponible pour cette date
Réponse 503 : TMS indisponible → mode dégradé déclenché
```

#### Mode dégradé — TMS indisponible au matin

```
ImporteurTMSScheduler déclenche l'import à 6h00
    |
    | TmsApiAdapter lève une exception (timeout, 503, réseau)
    ↓
Détection de l'échec d'import (délai max : 2 minutes après 6h00)
    |
    ↓
Alerte superviseur déclenchée
    |   - Notification WebSocket sur l'interface web de planification
    |   - Log ERROR dans les traces applicatives (OpenTelemetry)
    |   - Métrique : tms_import_failure_total incrémentée (Prometheus)
    |   - Alerte AlertManager si aucun import réussi à 6h10
    ↓
Interface web : bandeau d'avertissement affiché sur W-04
    |   "Import TMS échoué — saisie manuelle disponible"
    ↓
Saisie manuelle de secours
    |   Le superviseur peut créer manuellement une TourneeTMS
    |   via le formulaire de saisie de l'interface web (W-05 mode saisie manuelle)
    |   POST /plans/{date}/tournees (corps JSON manuel)
    ↓
Suite du flux normal (affectation, lancement)
```

---

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

### Stratégie de rejeu — Import TMS (mode dégradé)

```
ImporteurTMSScheduler à 6h00
         │
         ▼
Tentative d'import TMS
         │
    ┌────┴──────────────────────────────────┐
    │ Succès                                 │ Échec (timeout, 503, réseau)
    ▼                                       ▼
PlanDuJour créé                       Alerte immédiate superviseur (WebSocket)
TourneeImporteeTMS publié             Retry automatique : 6h05, 6h10, 6h15
                                      Si > 3 tentatives échouées :
                                        Alerte critique ops (AlertManager)
                                        Interface web : mode saisie manuelle
                                        activé (formulaire W-05 mode dégradé)
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
| ImporteurTMS → TMS Externe | DocuPost (scheduler 6h00) | TMS Externe | < 5 minutes (import complet tournées du jour) | Retry 6h05/6h10/6h15, puis saisie manuelle |
| App mobile → API Gateway | App Android | Backend DocuPost | < 2 secondes (p95) | Stockage local offline |
| API Gateway → svc-tournee | API Gateway | Backend DocuPost | < 500ms (p95) | N/A (interne) |
| API Gateway → svc-planification | API Gateway | Backend DocuPost | < 500ms (p95) | N/A (interne) |
| svc-integration → OMS | DocuPost | OMS Docaposte | < 30 secondes (nominal) | Rejeu < 10 minutes |
| SSO → API Gateway | SSO Corporate | API Gateway | < 500ms (p95) | Blocage authentification |
| FCM → App mobile | DocuPost | App Android | < 10 secondes (p95) | Polling fallback si FCM indisponible |
| WebSocket superviseur | Backend | Navigateur web | < 30 secondes mise à jour | Reconnexion auto |
| Preuve disponible support | DocuPost | Support client | < 5 minutes (SLA métier) | Recherche manuelle |
