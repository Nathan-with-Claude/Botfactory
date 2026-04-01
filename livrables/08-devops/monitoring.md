# Monitoring DocuPost

> Document de référence — Version 1.0 — 2026-03-26
> Produit par @devops à partir de l'architecture applicative et des Domain Events
> identifiés dans chaque Bounded Context.
>
> Principe directeur DDD : les Domain Events sont les signaux métier observables.
> Chaque event publié est loggué avec son contexte. Les métriques et alertes
> sont dérivées du flux d'events, pas uniquement des métriques techniques.

---

## Vue d'ensemble de la stack de monitoring

### Stack recommandée pour le MVP

```
┌─────────────────────────────────────────────────────────────────┐
│                    Stack Monitoring DocuPost                     │
│                                                                 │
│  ┌──────────────────┐   ┌──────────────────┐                   │
│  │  Prometheus       │   │  Loki             │                   │
│  │  (métriques)      │   │  (logs structurés)│                   │
│  └────────┬─────────┘   └────────┬─────────┘                   │
│           │                      │                              │
│           └──────────┬───────────┘                              │
│                      ▼                                          │
│             ┌────────────────┐                                  │
│             │    Grafana      │ ← Dashboards + Alertes          │
│             └────────────────┘                                  │
│                      │                                          │
│             ┌────────▼────────┐                                 │
│             │ Alertmanager    │ → Slack #devops-prod             │
│             │                 │ → PagerDuty (incidents critiques)│
│             └─────────────────┘                                 │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Spring Boot Actuator (métriques Micrometer → Prometheus) │   │
│  │ Logback + MDC structuré (JSON → Loki via Promtail)       │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

Justification :
- **Prometheus + Grafana + Loki** : stack open source standard, compatible Kubernetes,
  déployable en cluster avec Helm charts officiels.
- **Spring Boot Actuator + Micrometer** : intégration native Spring Boot, expose
  les métriques JVM, HTTP et custom sans code additionnel.
- **Logback JSON** : logs structurés au format JSON, compatibles Loki / Elasticsearch.
- Pas d'Elasticsearch ni de Kafka au MVP : la simplicité opérationnelle est prioritaire.

---

## Domain Events comme signaux métier à observer

### Principe

Chaque Domain Event publié par un Bounded Context est loggué avec son contexte complet
via Logback MDC (Mapped Diagnostic Context). Ce log structuré est la source primaire
pour les métriques métier.

### Format de log d'un Domain Event

```json
{
  "timestamp": "2026-03-26T07:23:14.512Z",
  "level": "INFO",
  "logger": "com.docapost.tournee.domain.events",
  "event_type": "TourneeDemarree",
  "aggregate_id": "T-2026-03-26-042",
  "livreur_id": "L-00123",
  "payload": {
    "nb_colis": 87,
    "zone": "Paris-18e",
    "heure_depart_prevue": "07:30"
  },
  "trace_id": "abc123xyz",
  "service": "svc-tournee",
  "env": "prod"
}
```

### Catalogue des Domain Events à observer

#### BC-01 — Orchestration de Tournée

| Domain Event | Signal métier | Métrique dérivée |
|---|---|---|
| `TourneeDemarree` | Livreur a démarré sa tournée | `tournee_demarree_count` (par heure, par zone) |
| `LivraisonConfirmee` | Colis livré avec succès | `livraison_confirmee_count`, taux de réussite |
| `EchecLivraisonDeclare` | Colis non livré | `livraison_echec_count`, `livraison_echec_rate` (par motif) |
| `IncidentDeclare` | Incident terrain signalé | `incident_declare_count` (par type) |
| `TourneeModifiee` | Instruction superviseur appliquée | `instruction_appliquee_count` |
| `TourneeCloturee` | Tournée terminée | `tournee_cloturee_count`, durée effective vs prévue |

#### BC-02 — Gestion des Preuves

| Domain Event | Signal métier | Métrique dérivée |
|---|---|---|
| `PreuveCapturee` | Preuve de livraison enregistrée | `preuve_capturee_count` (par type : signature, photo, tiers, dépôt) |

#### BC-03 — Supervision

| Domain Event | Signal métier | Métrique dérivée |
|---|---|---|
| `TourneeARisqueDetectee` | Tournée en retard significatif | `tournee_a_risque_count` (alerte superviseur) |
| `AlerteDeclenchee` | Alerte automatique levée | `alerte_declenchee_count` (par sévérité) |
| `InstructionEnvoyee` | Superviseur a envoyé une instruction | `instruction_envoyee_count` |
| `InstructionExecutee` | Livreur a exécuté l'instruction | `instruction_executee_rate` (taux d'exécution) |

#### BC-04 — Notification

| Domain Event | Signal métier | Métrique dérivée |
|---|---|---|
| (Events consommés de BC-03) | Push FCM envoyé au livreur | `push_sent_count`, `push_delivery_rate` |

#### BC-05 — Intégration SI / OMS

| Domain Event | Signal métier | Métrique dérivée |
|---|---|---|
| `LivraisonConfirmeeHandler` exécuté | Statut transmis à l'OMS | `oms_event_sent_count`, `oms_event_retry_count` |
| Événement en queue outbox > seuil | Accumulation de retard OMS | `outbox_pending_count` (alerte si > 50) |

#### BC-07 — Planification de Tournée

| Domain Event | Signal métier | Métrique dérivée |
|---|---|---|
| `TourneeImporteeTMS` | Import TMS réussi | `tms_import_success` (booléen) + `tms_import_duration_ms` |
| `AffectationEnregistree` | Livreur affecté à une tournée | `affectation_count` |
| `TourneeLancee` | Tournée transmise au livreur | `tournee_lancee_count` |

---

## Métriques clés

### Métriques métier (dérivées des Domain Events)

| Métrique | Type | Description | Seuil d'alerte |
|---|---|---|---|
| `tournee_demarree_count` | Counter | Nombre de tournées démarrées par heure | < 50 % des tournées attendues à 7h30 |
| `livraison_echec_rate` | Gauge | Taux d'échec de livraison (%) | > 15 % sur 1 heure glissante |
| `incident_declare_rate` | Gauge | Taux d'incidents déclarés (%) | > 5 % des livraisons sur 30 min |
| `tournee_a_risque_count` | Counter | Tournées détectées en retard | > 3 tournées simultanées → alerte superviseur |
| `instruction_executee_rate` | Gauge | Taux d'instructions exécutées (%) | < 80 % sur 1 heure |
| `tms_import_success` | Gauge | Import TMS réussi (1) ou échoué (0) | = 0 à 6h15 → alerte critique |
| `outbox_pending_count` | Gauge | Événements en attente d'envoi OMS | > 50 → alerte, > 200 → critique |
| `oms_event_retry_count` | Counter | Nombre de retries OMS | > 10 en 5 min → alerte |

### Métriques techniques (Spring Boot Actuator + Micrometer)

| Métrique | Description | Seuil d'alerte |
|---|---|---|
| `http_server_requests_duration_p95` | Latence P95 des endpoints REST | > 500 ms |
| `http_server_requests_error_rate` | Taux d'erreurs HTTP 5xx | > 2 % sur 5 min |
| `jvm_memory_used_bytes` | Utilisation mémoire JVM | > 80 % du max alloué |
| `jvm_threads_live` | Nombre de threads actifs | > 200 par service |
| `jdbc_connections_active` | Connexions BD actives | > 80 % du pool |
| `websocket_sessions_active` | Sessions WebSocket superviseurs | < 0 si service UP |
| `spring_batch_job_executions` | Jobs Flyway / batch en cours | > 5 min d'exécution |

---

## Alertes et règles Prometheus

### Alertes critiques (PagerDuty — réveille l'astreinte)

```yaml
# Règles Prometheus — alertes critiques

groups:
  - name: docupost-critique
    rules:

    - alert: ImportTMSEchec
      expr: tms_import_success == 0
      for: 0m
      labels:
        severity: critical
      annotations:
        summary: "Import TMS échoué ou non démarré"
        description: "L'ImporteurTMS n'a pas produit de données. Vérifier la connectivité TMS et les logs svc-planification. Alerte si pas de correction avant 6h15."

    - alert: ServiceDown
      expr: up{job=~"svc-.*"} == 0
      for: 1m
      labels:
        severity: critical
      annotations:
        summary: "Service DocuPost {{ $labels.job }} hors ligne"
        description: "Le service {{ $labels.job }} ne répond plus depuis 1 minute en prod."

    - alert: TauxEchecLivraisonCritique
      expr: livraison_echec_rate > 30
      for: 10m
      labels:
        severity: critical
      annotations:
        summary: "Taux d'échec de livraison critique ({{ $value }}%)"
        description: "Le taux d'échec dépasse 30% depuis 10 minutes. Investigation terrain requise."

    - alert: OutboxAccumulation
      expr: outbox_pending_count > 200
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: "Accumulation critique dans l'outbox OMS ({{ $value }} events)"
        description: "Plus de 200 events en attente d'envoi à l'OMS. Risque de perte de synchronisation."
```

### Alertes avertissement (Slack #devops-prod)

```yaml
    - alert: TauxEchecLivraisonElevé
      expr: livraison_echec_rate > 15
      for: 10m
      labels:
        severity: warning
      annotations:
        summary: "Taux d'échec de livraison élevé ({{ $value }}%)"
        description: "Taux d'échec au-dessus du seuil normal depuis 10 minutes."

    - alert: TourneesARisque
      expr: tournee_a_risque_count > 3
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "{{ $value }} tournées détectées en retard"
        description: "Plusieurs tournées sont identifiées à risque par le RisqueDetector."

    - alert: LatenceAPIElevee
      expr: histogram_quantile(0.95, http_server_requests_duration_seconds_bucket) > 0.5
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "Latence API P95 élevée ({{ $value }}s)"
        description: "La latence P95 dépasse 500ms sur les endpoints REST."

    - alert: OutboxEnAttente
      expr: outbox_pending_count > 50
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "Outbox OMS : {{ $value }} events en attente"
        description: "La queue outbox s'accumule. Vérifier la connexion OMS."

    - alert: TourneesNonDemarrées
      expr: tournee_demarree_count < (tournee_planifiee_count * 0.5)
      for: 0m
      annotations:
        summary: "Moins de 50% des tournées démarrées à 7h30"
        description: "Anomalie dans le lancement des tournées livreurs."
```

---

## Monitoring des ACLs et adapters d'infrastructure

Les ACLs (Anti-Corruption Layers) vers l'OMS et le TMS sont des points de fragilité
prioritaires à surveiller.

### Tableau de bord ACL (Grafana)

| Adapter | Métriques surveillées | Health Check |
|---|---|---|
| `TmsApiAdapter` (BC-07) | `tms_api_latency_p95`, `tms_api_error_rate`, `tms_import_success`, `tms_import_duration_ms` | `/actuator/health/tms` |
| `OmsApiAdapter` (BC-05) | `oms_api_latency_p95`, `oms_api_error_rate`, `oms_retry_count`, `oms_circuit_breaker_state` | `/actuator/health/oms` |
| `FcmPushAdapter` (BC-04) | `fcm_send_success_rate`, `fcm_send_error_rate`, `fcm_delivery_latency_p95` | `/actuator/health/fcm` |
| `ObjectStoreAdapter` (BC-02) | `minio_upload_success_rate`, `minio_upload_latency_p95` | `/actuator/health/minio` |

### Configuration des health checks ACL (Spring Boot Actuator)

```java
// Exemple : health check TMS dans svc-planification
@Component
public class TmsHealthIndicator implements HealthIndicator {

    private final TmsApiAdapter tmsApiAdapter;
    private final ImportStatusRepository importStatusRepository;

    @Override
    public Health health() {
        try {
            // Vérifier la dernière tentative d'import
            ImportStatus lastImport = importStatusRepository.findLatest();
            if (lastImport == null) {
                return Health.unknown().withDetail("message", "Aucun import TMS effectué").build();
            }
            if (lastImport.isSuccess()) {
                return Health.up()
                    .withDetail("last_import", lastImport.getTimestamp())
                    .withDetail("tournees_importees", lastImport.getTourneesCount())
                    .build();
            } else {
                return Health.down()
                    .withDetail("last_import", lastImport.getTimestamp())
                    .withDetail("error", lastImport.getErrorMessage())
                    .build();
            }
        } catch (Exception e) {
            return Health.down().withException(e).build();
        }
    }
}
```

### Circuit Breaker OMS (Resilience4j)

Pour le MVP, l'ACL OMS est protégée par un circuit breaker Resilience4j :

```yaml
# application-prod.yml
resilience4j:
  circuitbreaker:
    instances:
      oms-api:
        slidingWindowSize: 10
        failureRateThreshold: 50          # 50% d'échecs → OPEN
        waitDurationInOpenState: 30s      # Attente 30s avant HALF_OPEN
        permittedNumberOfCallsInHalfOpenState: 3
        slowCallDurationThreshold: 5s     # Appel > 5s = lent
        slowCallRateThreshold: 70
  retry:
    instances:
      oms-api:
        maxAttempts: 3
        waitDuration: 2s
        enableExponentialBackoff: true
        exponentialBackoffMultiplier: 2   # 2s, 4s, 8s
```

L'état du circuit breaker est exposé via Micrometer (`resilience4j_circuitbreaker_state`)
et affiché dans le dashboard Grafana.

---

## Dashboards Grafana

### Dashboard 1 — Vue opérationnelle temps réel (journée de livraison)

Panneaux :
- Compteur tournées actives / terminées / à risque (Gauge).
- Taux de livraison (succès vs échec) en temps réel (Time series).
- Carte des incidents déclarés (si plugin Grafana Worldmap).
- Queue outbox OMS (Gauge + alerte couleur).
- État des ACLs : TMS / OMS / FCM (Stat panels verts/rouges).

### Dashboard 2 — Santé technique des services

Panneaux :
- Uptime de chaque service (Stat panels).
- Latence P50/P95/P99 par service et endpoint (Heatmap ou Time series).
- Taux d'erreurs HTTP par service (Time series).
- Utilisation mémoire JVM (Time series).
- Connexions BD actives par service (Gauge).
- Sessions WebSocket actives (superviseurs connectés).

### Dashboard 3 — Import TMS (dashboard matinal 05h30–07h30)

Panneaux :
- Statut du dernier import TMS (UP/DOWN/PENDING — Stat panel).
- Heure du dernier import réussi.
- Nombre de tournées importées vs attendues.
- Erreurs de l'ImporteurTMS (Log panel depuis Loki).
- Taux de lancement des tournées (0–100 %).

---

## Logs structurés — Configuration Logback

### Configuration recommandée (logback-spring.xml)

```xml
<configuration>
  <springProfile name="prod,preprod">
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
      <encoder class="net.logstash.logback.encoder.LogstashEncoder">
        <!-- Champs MDC automatiquement inclus -->
        <includeMdcKeyName>event_type</includeMdcKeyName>
        <includeMdcKeyName>aggregate_id</includeMdcKeyName>
        <includeMdcKeyName>livreur_id</includeMdcKeyName>
        <includeMdcKeyName>trace_id</includeMdcKeyName>
        <includeMdcKeyName>service</includeMdcKeyName>
      </encoder>
    </appender>
    <root level="WARN">
      <appender-ref ref="STDOUT" />
    </root>
    <!-- Logger dédié aux Domain Events : toujours loggué en INFO -->
    <logger name="com.docapost.*.domain.events" level="INFO" additivity="false">
      <appender-ref ref="STDOUT" />
    </logger>
  </springProfile>
</configuration>
```

### Exemple de log d'un Domain Event dans le code applicatif

```java
// Dans le handler d'application (après publication de l'event)
@EventListener
public void onTourneeDemarree(TourneeDemarree event) {
    MDC.put("event_type", "TourneeDemarree");
    MDC.put("aggregate_id", event.getTourneeId().value());
    MDC.put("livreur_id", event.getLivreurId().value());
    log.info("Domain Event: TourneeDemarree — nb_colis={}, zone={}",
        event.getNbColis(), event.getZone());
    MDC.clear();
}
```

---

## Alertes horaires critiques (fenêtre matinale)

| Heure | Alerte | Niveau | Canal |
|---|---|---|---|
| 06h00 | Import TMS déclenché (attente résultat) | INFO | Log |
| 06h15 | Import TMS non terminé avec succès | CRITICAL | PagerDuty |
| 07h00 | < 50 % des livreurs ont démarré leur tournée | WARNING | Slack |
| 07h30 | > 3 tournées à risque détectées simultanément | WARNING | Slack + email superviseur |
| 08h00 | taux d'erreur HTTP > 2 % sur 15 min | CRITICAL | PagerDuty |
| Continue | Outbox OMS > 200 events | CRITICAL | PagerDuty |
| Continue | Service DOWN (liveness probe K8s) | CRITICAL | PagerDuty |

---

## Rétention des données de monitoring

| Type | Outil | Rétention |
|---|---|---|
| Métriques Prometheus | Prometheus | 15 jours en hot storage |
| Métriques long terme | Thanos ou Cortex (optionnel R2) | 12 mois |
| Logs Loki | Loki | 30 jours |
| Logs Domain Events | Loki | 90 jours (traçabilité OMS) |
| Rapports Playwright E2E | GitHub Actions artifacts | 14 jours |
| Backups PostgreSQL prod | S3-compatible | 30 jours (RGPD) |

---

## TODO

- Installer la stack Prometheus + Grafana + Loki via Helm charts dans le cluster K8s.
- Créer le realm Keycloak `docupost-prod` et configurer le SSO corporate.
- Configurer Alertmanager pour Slack `#devops-prod` et PagerDuty.
- Implémenter `TmsHealthIndicator` et `OmsHealthIndicator` dans les services Spring Boot.
- Créer les dashboards Grafana (importer les JSON templates depuis grafana.com).
- Configurer la rétention Loki (30 jours logs, 90 jours events métier).
- Définir le SLO de disponibilité prod (cible : 99,5 % sur la fenêtre 06h00–20h00).
