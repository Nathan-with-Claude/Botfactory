# Journal de bord — @architecte-technique — DocuPost

> **RÈGLE** : Lire ce fichier EN DÉBUT de session. Le mettre à jour EN FIN de session.
> Ce fichier remplace la relecture complète de `/livrables/04-architecture-technique/`.

---

## Contexte synthétisé

- **Livrables propriété** : `04-architecture-technique/`
  - architecture-applicative.md v1.2
  - schemas-integration.md v1.1
  - design-decisions.md v1.2
  - exigences-non-fonctionnelles.md v1.2
- **Stack imposée** : Java 21 / Spring Boot 4.0.3 — React 19 / TypeScript 5.6 — Docker / Kubernetes — GitHub Actions CI/CD
- **Intégrations actives** : OMS (API REST, ACL sortant), TMS (API REST pull, cron 6h00, ACL entrant), SSO OAuth2, FCM (push mobile)

### Conteneurs C4 (résumé)

| Conteneur | Techno | Rôle |
|-----------|--------|------|
| app-mobile | React Native / Android | Application livreur (offline-first) |
| app-web | React 19 / TypeScript | Interface superviseur + logisticien |
| api-gateway | Spring Cloud Gateway | Routage, auth JWT |
| svc-tournee | Spring Boot / BC-01 | Orchestration de tournée (Core) |
| svc-planification | Spring Boot / BC-07 | Planification TMS (Core) |
| svc-preuves | Spring Boot / BC-02 | Gestion des preuves |
| svc-supervision | Spring Boot / BC-03 | Tableau de bord, alertes, instructions |
| svc-notification | Spring Boot / BC-04 | Push FCM / alertes |
| svc-integration-oms | Spring Boot / BC-05 | ACL OMS sortant |
| svc-identite | Keycloak / BC-06 | SSO OAuth2 |
| event-bus | Kafka (ou RabbitMQ) | Communication inter-services |
| db-* | PostgreSQL par service | Isolation données |

### ADR actifs (résumé)

| ADR | Décision | Statut |
|-----|----------|--------|
| DD-001 | Architecture microservices DDD | Validé |
| DD-002 | Offline-first app mobile (SQLite + sync) | Validé |
| DD-003 | Event sourcing pour les Domain Events | Validé |
| DD-004 | ACL OMS (anti-corruption layer) | Validé |
| DD-005 | SSO OAuth2 Keycloak | Validé |
| DD-006 | React Native pour mobile | Validé |
| DD-007 | Kafka pour event bus | Validé |
| DD-008 | PostgreSQL par bounded context | Validé |
| DD-009 | GitHub Actions pour CI/CD | Validé |
| DD-010 | Import TMS : API REST pull + fallback batch SFTP | Validé (H6 à confirmer) |
| DD-011 | Fenêtre planification : cron 6h00, alerte 6h45 | Validé |

---

## Décisions structurantes

| Date | Décision | Justification |
|------|----------|---------------|
| 2026-03-19 | Offline-first mobile (SQLite) | Zones blanches fréquentes en péri-urbain (H5) |
| 2026-03-19 | Event sourcing immuable | Preuves opposables + audit réglementaire (Mme Dubois) |
| 2026-03-19 | ACL OMS côté DocuPost | Zéro modification du cœur OMS (M. Garnier) |
| 2026-03-19 | Microservices 1 service = 1 BC | Isolation domaines, déploiement indépendant |
| 2026-03-20 | ImporteurTMS en cron 6h00 (Spring @Scheduled) | Contrainte fenêtre matinale logisticien |
| 2026-03-20 | 3 retries auto (6h05/6h10/6h15) + alerte si échec | Résilience sans intervention humaine immédiate |
| 2026-03-20 | Endpoints /plans, /affectations réservés SUPERVISOR | Sécurité RBAC — livreur ne doit pas accéder à la planification |
| 2026-04-06 | VueLivreur = agrégation à la volée (pas de table dédiée) | 6 livreurs MVP — cohérence immédiate, simplicité opérationnelle. Post-MVP : projection CQRS sur Domain Events |
| 2026-04-06 | LivreurReferentiel : interface + impl dev hardcodée | Découplage domain / infrastructure — substitution BC-06/Keycloak en prod sans toucher le domaine |
| 2026-04-06 | WebSocket STOMP : 1 message par livreur (pas broadcast liste) | Granularité fine — le frontend met à jour uniquement la ligne modifiée |

### NFR critiques

| Réf | Exigence | Cible |
|-----|----------|-------|
| ENF-PERF-001 | Mise à jour statut colis < 45 sec | Mobile offline inclus |
| ENF-PERF-002 | Synchronisation OMS < 30 sec | En ligne |
| ENF-PERF-003 | Détection tournée à risque < 15 min | Calcul automatique |
| ENF-PERF-010 | Import TMS complet < 5 min | 8-15 tournées, ~1 500 colis |
| ENF-DISP-001 | App livreur > 99,5 % | Plages de tournée |
| ENF-DISP-004 | Interface web planification dès 6h00 | Lu-Sa |
| ENF-RESIL-005 | Détection échec import TMS < 2 min | 3 retries auto |
| ENF-SEC-008 | /plans, /affectations, /lancer → SUPERVISOR uniquement | Spring @PreAuthorize |

---

## Interventions réalisées

| Date | Version | Sujet | Fichiers |
| --- | --- | --- | --- |
| 2026-03-19 | 1.0/1.1 | Création — architecture C4, ADR-001→009, NFR, schémas OMS/SSO/FCM | architecture-applicative.md, schemas-integration.md, design-decisions.md, exigences-non-fonctionnelles.md |
| 2026-03-20 | 1.1→1.2 | Ajout TMS : conteneur svc-planification, ImporteurTMS cron, ACL TMS, ADR-010/011, NFR DISP-004/PERF-010/RESIL-005/SEC-008 | architecture-applicative.md, schemas-integration.md, design-decisions.md, exigences-non-fonctionnelles.md |
| 2026-04-01 | 1.2 | Création diagramme draw.io C4 Container macro : 6 microservices, 6 BDs, MinIO, API Gateway, SSO Keycloak, Mobile/Web clients, 4 systèmes externes, infra K8s, légende protocoles | /livrables/06-dev/architecture-technique-macro.drawio |
| 2026-04-04 | — | Analyse as-built svc-supervision + app mobile. Rédaction de deux rapports d'écart architecture cible / code réel. | rapport-as-built-supervision.md, rapport-as-built-mobile.md |
| 2026-04-06 | — | US-066 : Spécification technique complète "Page état des livreurs" (W-08). Endpoint GET /api/supervision/livreurs/etat-du-jour, LivreurReferentiel (port + impl dev), EtatJournalierLivreur (VO), VueLivreur (Read Model), ConsulterEtatLivreursHandler, LivreurEtatWebSocketPublisher (/topic/livreurs/etat), LivreurEtatController. Mise à jour architecture-applicative.md (section BC-03 + BC-07 extension). | specs-us066-etat-livreurs.md, architecture-applicative.md |
| 2026-04-21 | v1.3 | Feature Broadcast : tranché 3 questions ouvertes par ADR (DD-012 BroadcastVu endpoint REST, DD-013 FCM sendEachForMulticast, DD-014 secteurs statiques). Ajout 6 NFR broadcast (ENF-BROADCAST-001→006). Section architecture-applicative.md broadcast déjà présente en v1.2. | design-decisions.md, exigences-non-fonctionnelles.md, CHANGELOG |

---

## Points d'attention — prochaines interventions

- **H6 (API TMS)** non encore validée — si invalide, prévoir interface de saisie manuelle des tournées
- La stratégie **offline** mobile doit être re-vérifiée pour toute nouvelle fonctionnalité livreur : s'assurer que l'action fonctionne sans réseau
- Tout nouvel endpoint créé doit être ajouté au tableau des **rôles RBAC**
- L'**event bus** (Kafka vs RabbitMQ) reste à finaliser si l'équipe infrastructure a une contrainte
- **CRITIQUE mobile** : Bearer token absent dans supervisionApi.ts → bloquant en prod (403)
- **CRITIQUE mobile** : react-native-app-auth et @react-native-community/netinfo absents du package.json → build natif cassé
- **CRITIQUE svc-supervision** : BC-07 fusionné dans svc-supervision — décision à valider avant R2
- **Dette technique** : poidsEstimeKg non restitué depuis la BDD dans TourneePlanifiee → compatibilité véhicule silencieusement désactivée après rechargement
- **Spring Boot 3.4.3** utilisé (cible 4.0.3 non existante en GA) — mettre à jour l'ADR DD-001
- **Java 20** utilisé (cible Java 21) — mettre à jour pom.xml
- **US-066 (W-08)** : `WebSocketConfig` absente en as-built (écart identifié) — doit être créée avant de livrer le temps réel. Sans WebSocketConfig, `LivreurEtatWebSocketPublisher` ne peut pas publier sur `/topic/livreurs/etat`
- **US-066 (W-08)** : Aligner `DevDataSeeder` avec les livreurIds du `DevLivreurReferentiel` (tp-201 doit être AFFECTEE à livreur-pierre-martin, tp-202 à livreur-marie-lambert)
- **US-066 post-MVP** : envisager projection CQRS complète (VueLivreur persistée) si le nombre de livreurs dépasse 50 ou si la latence des requêtes à la volée devient problématique
