# Exigences Non Fonctionnelles DocuPost

> Document de référence — Version 1.2 — 2026-03-20
> Produit par l'Architecte Technique à partir des entretiens métier (Pierre livreur,
> Mme Dubois DSI, M. Garnier Architecte Technique, M. Renaud Responsable Exploitation
> Logistique), des KPIs (/livrables/01-vision/kpis.md) et des contraintes SI imposées.
>
> Chaque exigence est tracée vers sa source terrain. La matrice de criticité
> (must have / should have / nice to have) est alignée sur les priorités MVP.
>
> Mise à jour v1.1 : compatibilité étendue iOS + Android (React Native), exigences
> de performance mobile adaptées aux contraintes React Native.
>
> Mise à jour v1.2 : ajout des NFR spécifiques au Parcours 0 (Préparation des tournées) :
> ENF-DISP-004 (disponibilité 6h00), ENF-PERF-010 (import TMS < 5 min),
> ENF-RESIL-005 (résilience TMS indisponible), ENF-SEC-008 (accès SUPERVISOR only
> aux endpoints de planification). Mise à jour de la matrice de criticité.

---

## 1. Disponibilité

### ENF-DISP-001 — Disponibilité application mobile livreur

**Exigence** : L'application mobile (iOS et Android) doit être disponible pendant les plages
horaires de tournée (06h00 – 21h00, du lundi au samedi).

**Cible** : > 99,5 % (≈ 3,6 heures d'indisponibilité maximale par mois sur les plages actives)

**Source** : KPI "Taux de disponibilité de l'application livreur" (kpis.md, M. Garnier)

**Mitigation** : La stratégie offline-first (DD-002) garantit que le livreur peut
continuer à travailler même si le backend est temporairement indisponible.
La disponibilité de 99,5 % s'applique à la capacité de synchronisation, pas à
l'usage terrain.

**Criticité** : MUST HAVE

---

### ENF-DISP-002 — Disponibilité interface web superviseur

**Exigence** : L'interface web de supervision doit être disponible pendant les plages
de pilotage (06h00 – 21h00, du lundi au samedi).

**Cible** : > 99 %

**Source** : M. Renaud — "Je dois pouvoir intervenir à tout moment en cas d'aléa."

**Mitigation** : Déploiement Kubernetes avec Readiness/Liveness probes, rollback
automatique, blue/green en production.

**Criticité** : MUST HAVE

---

### ENF-DISP-003 — Disponibilité API de synchronisation OMS

**Exigence** : Le service d'intégration SI (svc-integration-si) doit être disponible
pour recevoir et transmettre les événements vers l'OMS.

**Cible** : > 99,9 % (hors indisponibilité de l'OMS lui-même)

**Source** : M. Garnier — "Garantir la cohérence des statuts inter-applications."

**Mitigation** : File de rejeu outbox (DD-003) : les événements sont persistés en base
avant transmission. Une indisponibilité du service n'entraîne pas de perte d'événement.

**Criticité** : MUST HAVE

---

### ENF-DISP-004 — Disponibilité interface web de planification dès 6h00 (Parcours 0)

**Exigence** : L'interface web de planification (Parcours 0 — Préparation des tournées)
doit être disponible dès 6h00 du matin, du lundi au samedi. Elle constitue le point de
démarrage de la journée opérationnelle pour le responsable logistique.

**Cible** : Disponibilité garantie dès 6h00 (avant l'import TMS automatique).
Continuité requise sans interruption jusqu'à 7h00 minimum (fin de la fenêtre de lancement).

**Source** : M. Renaud (entretien 2026-03-20) — "Les livreurs partent entre 6h30 et 7h00.
Je dois avoir fini les affectations avant qu'ils partent."
Contrainte temporelle critique identifiée dans DD-011 (fenêtre de planification matinale).

**Mitigation** :
- Le `svc-planification-tournee` et ses dépendances (PostgreSQL planification) doivent
  être démarrés et prêts (Readiness probe OK) avant 6h00.
- En production Kubernetes, la disponibilité est garantie par le déploiement blue/green
  (pas d'interruption pour les déploiements nocturnes) et les Liveness/Readiness probes.
- Les fenêtres de maintenance planifiées doivent éviter la plage 05h45 – 07h15
  (lundi au samedi).

**Criticité** : MUST HAVE

---

## 2. Performance et latence

### ENF-PERF-001 — Synchronisation OMS en temps réel

**Exigence** : Chaque changement de statut colis doit être transmis à l'OMS en moins
de 30 secondes à partir du moment où le livreur valide l'action (en mode connecté).

**Cible** : > 99 % des événements transmis en < 30 secondes (mode connecté)

**Source** : KPI "Taux de synchronisation OMS en temps réel" (kpis.md, M. Garnier)

**Mesure** : Timestamp au moment de l'action terrain (commandId timestamp) vs timestamp
de réception OMS. Métrique Prometheus `oms_sync_latency_seconds`.

**Criticité** : MUST HAVE

---

### ENF-PERF-002 — Rejeu des événements offline

**Exigence** : Les événements non transmis en zone blanche doivent être rattrapés dans
les 10 minutes suivant le retour de connexion.

**Cible** : > 99 % des événements offline rattrapés en < 10 minutes

**Source** : KPI "Taux d'événements en échec de synchronisation rejoués avec succès"
(kpis.md, M. Garnier)

**Criticité** : MUST HAVE

---

### ENF-PERF-003 — Mise à jour du tableau de bord superviseur

**Exigence** : Toute action terrain doit être reflétée sur le tableau de bord du
superviseur en moins de 30 secondes.

**Cible** : < 30 secondes (p95)

**Source** : modules-fonctionnels.md — "Le tableau de bord est mis à jour en moins de
30 secondes après toute action terrain." (M. Renaud)

**Mécanisme** : Domain Event → outbox → handler supervision → WebSocket push superviseur.
Latence estimée : outbox polling 5s + traitement < 1s + WebSocket < 1s = < 10s nominal.

**Criticité** : MUST HAVE

---

### ENF-PERF-004 — Détection tournée à risque

**Exigence** : Une tournée présentant un retard significatif doit déclencher une alerte
au superviseur en moins de 15 minutes après l'apparition de l'écart.

**Cible** : < 15 minutes (p95)

**Source** : KPI "Délai moyen de détection d'une tournée à risque" (kpis.md, M. Renaud)

**Mécanisme** : `RisqueDetector` (Domain Service BC_Supervision) recalcule l'avancement
à chaque événement de livraison reçu. Déclenchement d'alerte si écart > seuil (à calibrer
en phase de recette avec M. Renaud).

**Criticité** : MUST HAVE

---

### ENF-PERF-005 — Disponibilité d'une preuve opposable

**Exigence** : Le support client doit pouvoir accéder à la preuve d'une livraison
en moins de 5 minutes après la demande.

**Cible** : < 5 minutes (SLA métier)

**Source** : KPI "Délai moyen de fourniture d'une preuve opposable" (kpis.md, Mme Dubois)

**Mécanisme** : Index PostgreSQL sur `colisId` dans la table `preuve_livraison`. Accès
via API REST `GET /preuves/{colisId}`. Temps de réponse attendu < 200ms. SLA largement tenu.

**Criticité** : MUST HAVE

---

### ENF-PERF-006 — Temps de réponse API Gateway

**Exigence** : L'API Gateway doit répondre aux requêtes des clients (mobile iOS/Android
et web) avec une latence acceptable en conditions normales.

**Cible** : < 500ms (p95) pour les requêtes de lecture ; < 1 seconde (p95) pour les
commandes avec preuve.

**Source** : Contrainte UX implicite — "Mise à jour de statut en moins de 45 secondes."
(Pierre). La latence réseau doit laisser le plus de temps possible à l'interaction.

**Criticité** : SHOULD HAVE

---

### ENF-PERF-007 — Volumétrie MVP

**Exigence** : L'architecture doit supporter le volume du MVP sans dégradation.

**Cibles** :
- Livreurs simultanés : jusqu'à 50 (plage de tournées 07h00 – 19h00)
- Colis par journée : jusqu'à 6 000 (50 livreurs × 120 colis)
- Événements de livraison par heure (pic) : ~ 600 (estimé)
- Utilisateurs superviseur simultanés : jusqu'à 10

**Source** : Vision produit — "80 à 120 colis par journée" (Pierre)

**Criticité** : MUST HAVE (dimensionnement initial)

---

### ENF-PERF-008 — Performance de démarrage de l'application mobile React Native

**Exigence** : L'application mobile doit démarrer rapidement en conditions terrain,
même sur des appareils iOS et Android d'entrée de gamme.

**Cibles** :
- Temps au premier rendu interactif (TTI) depuis le lancement à froid : < 3 secondes
  sur un appareil de référence (iPhone SE 3e génération ou Android mid-range équivalent).
- Bundle JavaScript : < 3 Mo après minification et tree-shaking (Hermes engine activé
  sur Android et iOS).
- Startup time au chaud (app en arrière-plan) : < 1 seconde.

**Source** : Contrainte UX terrain — fluidité requise pour un livreur qui consulte sa tournée
entre deux arrêts. (Pierre)

**Mécanisme** :
- Moteur Hermes activé (optimisation bytecode pour React Native).
- Code splitting et lazy loading des écrans non critiques au démarrage.
- WatermelonDB : chargement lazy des données de tournée (pas de chargement complet
  au démarrage).
- Profiling avec Flipper ou React Native DevTools en phase de recette.

**Criticité** : SHOULD HAVE

---

### ENF-PERF-009 — Fluidité du thread JavaScript React Native

**Exigence** : Les interactions UI critiques (défilement de la liste de colis, validation
d'une livraison, capture de preuve) doivent rester fluides sans saccades visibles.

**Cible** : 60 fps maintenus sur les écrans principaux de l'application livreur.
Pas de blocage du JS thread > 16ms pendant les interactions utilisateur.

**Mécanisme** :
- Utilisation de la New Architecture React Native (Fabric + JSI) si disponible via Expo SDK.
- Animations via `react-native-reanimated` (worklets s'exécutant sur le thread UI,
  hors JS thread).
- Opérations WatermelonDB exécutées sur un thread worker séparé (architecture native
  de WatermelonDB).
- Éviter les re-renders inutiles : `React.memo`, `useCallback`, sélecteurs Zustand ciblés.

**Criticité** : SHOULD HAVE

---

### ENF-PERF-010 — Performance de l'import TMS (Parcours 0)

**Exigence** : L'import des tournées depuis le TMS, déclenché à 6h00, doit se terminer
en moins de 5 minutes pour l'ensemble des tournées du jour. L'interface web de planification
doit être opérationnelle (données disponibles) au plus tard à 6h05.

**Cible** :
- Import TMS complet : < 5 minutes (pour 8 à 15 tournées, soit jusqu'à 1 500 colis au total)
- Latence de l'appel API TMS : < 30 secondes (p95) pour la réponse initiale
- Temps de traitement ACL (TmsResponseTranslator) : < 10 secondes pour 1 500 colis
- Interface web W-04 disponible avec données chargées : < 5 minutes après 6h00

**Source** : M. Renaud (entretien 2026-03-20) — "Je dois avoir les tournées sous les yeux
dès que j'arrive. J'ai environ 45 minutes pour tout affecter."
Volume terrain : 8 à 15 tournées par jour, estimation 1 500 colis au total.

**Mécanisme** :
- `ImporteurTMSScheduler` déclenche l'import en un seul appel REST (ou batch fichier).
- Traitement batch en mémoire : pas d'appel OMS ou de jointure externe pendant l'import.
- Persistance en masse (JPA `saveAll` ou `batchInsert` PostgreSQL) pour les TourneeTMS.
- Métriques : `tms_import_duration_seconds` (histogram Prometheus) — alerte si > 3 minutes.

**Criticité** : MUST HAVE

---

## 3. Scalabilité

### ENF-SCAL-001 — Scalabilité horizontale des services backend

**Exigence** : Chaque service backend doit pouvoir être scalé horizontalement sans
modification architecturale.

**Mécanisme** : Services stateless Spring Boot (état externalisé en PostgreSQL).
Kubernetes Horizontal Pod Autoscaler (HPA) sur métriques CPU et requêtes/s.

**Criticité** : SHOULD HAVE (MVP : 1 replica par service suffisant)

---

### ENF-SCAL-002 — Évolutivité du bus d'événements

**Exigence** : L'architecture du bus d'événements (outbox PostgreSQL MVP) doit être
remplaçable par Apache Kafka en Release 2 sans refactoring des émetteurs.

**Mécanisme** : Interface `TourneeEventPublisher` (port dans la Domain Layer). L'implémentation
outbox PostgreSQL est remplaçable par une implémentation Kafka sans toucher aux use cases.
(Voir DD-003)

**Seuil de migration** : à envisager si > 50 tournées simultanées ou > 5 000 événements/heure.

**Criticité** : SHOULD HAVE

---

## 4. Sécurité

### ENF-SEC-001 — Authentification OAuth2 / SSO corporate

**Exigence** : Toutes les requêtes vers l'API Gateway doivent être authentifiées via
un token JWT émis par le SSO corporate Docaposte (OAuth2 / OIDC).

**Mécanisme** : Spring Security Resource Server (vérification signature RS256, expiration,
issuer). Aucun accès anonyme. (Voir DD-004)

**Criticité** : MUST HAVE

---

### ENF-SEC-002 — Chiffrement du transport

**Exigence** : Toutes les communications réseau (client-serveur et inter-services exposés
vers l'extérieur) doivent utiliser TLS 1.3.

**Mécanisme** : TLS terminé au niveau de l'Ingress Kubernetes (cert-manager Let's Encrypt
ou certificats Docaposte). HTTP strict (HSTS activé).

**Source** : M. Garnier — "chiffrement des données (TLS, HTTPS)"

**Criticité** : MUST HAVE

---

### ENF-SEC-003 — Chiffrement des données personnelles au repos

**Exigence** : Les données personnelles sensibles (coordonnées GPS des livreurs,
numéros de téléphone des destinataires) doivent être chiffrées au repos.

**Mécanisme** : Chiffrement au niveau application (AES-256) pour les champs sensibles
avant stockage PostgreSQL. Clés gérées via Kubernetes Secret / HashiCorp Vault.

**Source** : M. Garnier — "gestion des données conforme RGPD"

**Criticité** : MUST HAVE

---

### ENF-SEC-004 — Isolation des tokens mobiles (iOS + Android)

**Exigence** : Les tokens OAuth2 stockés sur le device (iOS ou Android) ne doivent pas être
accessibles en dehors de l'application DocuPost livreur.

**Mécanisme** :
- iOS : stockage via iOS Keychain (react-native-keychain). Tokens non accessibles
  par d'autres applications ou par iTunes Backup.
- Android : stockage via Android Keystore (react-native-keychain). Tokens chiffrés
  au niveau matériel sur les appareils compatibles.
- Jamais de stockage en AsyncStorage non chiffré.
- Refresh token rotation activée côté SSO.

**Criticité** : MUST HAVE

---

### ENF-SEC-005 — Contrôle d'accès par rôle (RBAC)

**Exigence** : Un livreur ne peut accéder qu'à sa propre tournée. Un superviseur peut
accéder à toutes les tournées du jour mais ne peut pas modifier des données de livraison.

**Mécanisme** : Spring Security `@PreAuthorize` avec rôles extraits du JWT.
Vérification `livreurId == token.sub` dans les handlers de commandes livreur.

**Criticité** : MUST HAVE

---

### ENF-SEC-006 — Immuabilité des événements de livraison

**Exigence** : Aucun événement de livraison ne peut être modifié ou supprimé après
création. Cette règle est à la fois métier (opposabilité juridique) et technique (audit).

**Mécanisme** : Trigger PostgreSQL `prevent_preuve_modification` (DD-005).
Table `event_store` en append-only (aucun UPDATE/DELETE autorisé, y compris pour les admins).

**Source** : M. Garnier — "Les événements doivent être immutables et historisés."
Mme Dubois — "Sécurisation juridique des livraisons sensibles."

**Criticité** : MUST HAVE

---

### ENF-SEC-007 — Accès aux preuves — URLs à durée limitée

**Exigence** : Les fichiers de preuves (photos, signatures) ne doivent pas être
accessibles par URL permanente. L'accès doit être limité dans le temps et audité.

**Mécanisme** : URL pré-signées MinIO avec expiration 1 heure. Chaque accès est loggué
(qui, quand, quel colis). Accès direct au bucket MinIO interdit depuis l'extérieur.

**Criticité** : MUST HAVE

---

### ENF-SEC-008 — Contrôle d'accès aux endpoints de planification (Parcours 0)

**Exigence** : Les endpoints de planification de tournée sont exclusivement accessibles
au rôle `SUPERVISOR`. Le rôle `LIVREUR` n'a aucun accès à ces ressources, ni en lecture
ni en écriture.

**Endpoints concernés** :
- `GET /plans/{date}` — consultation du plan du jour
- `GET /plans/{date}/tournees` — liste des tournées TMS du jour
- `POST /affectations` — enregistrement d'une affectation livreur/véhicule
- `POST /tournees/{id}/lancer` — lancement d'une tournée (transmission au livreur)

**Mécanisme** :
```java
// PlanificationController.java
@GetMapping("/plans/{date}")
@PreAuthorize("hasRole('SUPERVISOR')")
public ResponseEntity<PlanDuJourDto> getPlanDuJour(@PathVariable LocalDate date) { ... }

@PostMapping("/affectations")
@PreAuthorize("hasRole('SUPERVISOR')")
public ResponseEntity<Void> enregistrerAffectation(@RequestBody AffectationRequest req) { ... }

@PostMapping("/tournees/{id}/lancer")
@PreAuthorize("hasRole('SUPERVISOR')")
public ResponseEntity<Void> lancerTournee(@PathVariable UUID id) { ... }
```

Spring Security `@PreAuthorize` avec extraction du rôle depuis le claim JWT.
Toute tentative d'accès par un rôle `LIVREUR` ou `ADMIN` non autorisé retourne HTTP 403.

**Source** : Ségrégation des responsabilités Parcours 0 (responsable logistique uniquement)
et principe de moindre privilège DSI.

**Criticité** : MUST HAVE

---

## 5. Conformité RGPD

### ENF-RGPD-001 — Minimisation des données de géolocalisation

**Exigence** : La géolocalisation du livreur ne doit être capturée qu'au moment des
actions de livraison (confirmation, échec, incident). Pas de tracking GPS continu.

**Source** : Contrainte RGPD — "données personnelles (géolocalisation) minimisées et
consentement documenté." (perimetre-mvp.md)

**Mécanisme** : L'application mobile ne capture les coordonnées GPS que lors d'une action
explicite via `expo-location` ou `react-native-geolocation-service` (permission
`whenInUse` uniquement — pas de permission `always`). Aucun service de tracking
en arrière-plan.

**Criticité** : MUST HAVE

---

### ENF-RGPD-002 — Pseudonymisation des données d'analyse

**Exigence** : Les données utilisées pour le reporting et l'analyse de performance
doivent être pseudonymisées (remplacement des identifiants personnels par des
identifiants techniques).

**Mécanisme** : Les Read Models de reporting (Module 7) utilisent les UUIDs internes
sans exposer les noms/emails des livreurs dans les exports analytiques.

**Criticité** : SHOULD HAVE

---

### ENF-RGPD-003 — Durée de conservation des données

**Exigence** : Les données de livraison (preuves, événements) doivent être conservées
selon la durée légale applicable aux documents Docaposte.

**Cible** : Conservation des preuves de livraison : à définir avec le DPO Docaposte
(hypothèse 5 ans pour les livraisons de documents sensibles).

**Mécanisme** : Politique de purge automatique planifiée (Kubernetes CronJob).
Les données purgées sont archivées en stockage froid avant suppression si requis.

**Criticité** : SHOULD HAVE (périmètre à confirmer avec le DPO avant la mise en production)

---

### ENF-RGPD-004 — Consentement livreur — usage des données personnelles

**Exigence** : Les livreurs doivent être informés et avoir consenti à la collecte de
leur géolocalisation lors des actions de livraison.

**Mécanisme** :
- iOS : écran de consentement au premier lancement de l'application React Native.
  Permission `NSLocationWhenInUseUsageDescription` demandée avec description contextuelle
  conforme aux guidelines Apple App Store.
- Android : permission `ACCESS_FINE_LOCATION` demandée explicitement avec explication
  contextuelle via le dialogue système.
- Consentement horodaté et stocké (WatermelonDB local + synchronisé vers le backend).

**Criticité** : MUST HAVE

---

## 6. Résilience

### ENF-RESIL-001 — Résilience aux indisponibilités OMS

**Exigence** : Une indisponibilité de l'OMS (partielle ou totale) ne doit pas empêcher
le livreur de continuer à travailler ni entraîner de perte d'événements.

**Mécanisme** : File de rejeu outbox (DD-003). Backoff exponentiel sur les appels OMS.
Alerte ops si > 10 minutes sans transmission réussie.

**Criticité** : MUST HAVE

---

### ENF-RESIL-002 — Résilience aux indisponibilités FCM (push)

**Exigence** : Une indisponibilité de Firebase Cloud Messaging ne doit pas empêcher
le superviseur d'envoyer des instructions.

**Mécanisme** : Les Instructions sont persistées en base indépendamment de leur livraison
push. Si FCM est indisponible, l'instruction est en statut ENVOYEE en attente. Le livreur
peut consulter ses instructions en pulling lors de la prochaine synchronisation.

**Criticité** : SHOULD HAVE

---

### ENF-RESIL-003 — Résilience aux indisponibilités SSO

**Exigence** : Une coupure courte du SSO (< 5 minutes) ne doit pas déconnecter les
utilisateurs en session active.

**Mécanisme** : Cache de validation JWT côté API Gateway (durée 5 minutes). Les tokens
valides récents sont acceptés sans nouvelle introspection SSO.

**Criticité** : SHOULD HAVE

---

### ENF-RESIL-004 — Circuit Breaker sur les appels OMS

**Exigence** : Des erreurs répétées vers l'OMS ne doivent pas saturer le service
d'intégration avec des tentatives inutiles.

**Mécanisme** : Resilience4j CircuitBreaker sur `OmsApiAdapter`. Seuil d'ouverture :
50 % d'échec sur 10 appels consécutifs. Fenêtre half-open : 30 secondes.

**Criticité** : SHOULD HAVE

---

### ENF-RESIL-005 — Résilience aux indisponibilités du TMS lors de l'import matinal (Parcours 0)

**Exigence** : Si l'import TMS échoue à 6h00 (API indisponible, timeout, données
malformées), le système doit :
1. Alerter le responsable logistique dans un délai maximum de 2 minutes après l'échec.
2. Permettre une saisie manuelle de secours via l'interface web.
3. Retenter automatiquement l'import (3 tentatives : 6h05, 6h10, 6h15) avant de passer
   définitivement en mode dégradé.

**Délai de détection** : 2 minutes maximum après l'échec de l'import (constatation à 6h02 au plus tard).

**Source** : M. Renaud (entretien 2026-03-20) — "Si je n'ai pas les tournées au bout de
quelques minutes, je dois pouvoir saisir manuellement pour ne pas bloquer les livreurs."
Contrainte opérationnelle critique : fenêtre de planification de 45 minutes seulement
(DD-011).

**Mécanisme** :
- `ImporteurTMSScheduler` capture toutes les exceptions et publie une alerte WebSocket
  immédiate vers l'interface web de planification.
- 3 tentatives automatiques de retry (cron 6h05, 6h10, 6h15) via un `ScheduledRetryService`
  dans `svc-planification`.
- Après 3 échecs consécutifs :
  - Alerte critique via AlertManager (Prometheus) → email ops.
  - Métrique `tms_import_failure_total` incrémentée.
  - Interface web W-04 affiche un bandeau d'avertissement : "Import TMS indisponible —
    mode saisie manuelle activé."
- Formulaire de saisie manuelle disponible dans W-05 (mode dégradé) : le superviseur
  peut créer et configurer des TourneeTMS manuellement.
- En cas de saisie manuelle, le flux d'affectation et de lancement est identique au
  flux nominal (même use cases, même Domain Events).

**Criticité** : MUST HAVE

---

## 7. Observabilité

### ENF-OBS-001 — Logs structurés

**Exigence** : Tous les services backend doivent produire des logs structurés au format
JSON avec les attributs minimaux obligatoires.

**Format minimum** :
```json
{
  "timestamp": "2026-03-19T14:32:00.123Z",
  "level": "INFO",
  "service": "svc-orchestration-tournee",
  "traceId": "abc123",
  "spanId": "def456",
  "userId": "livreur-uuid",
  "tourneeId": "tournee-uuid",
  "message": "LivraisonConfirmee - colisId: xxx"
}
```

**Outil** : Logback + Jackson (Spring Boot). Collecte via Fluentd / Loki (à configurer
avec l'équipe DevOps).

**Criticité** : MUST HAVE

---

### ENF-OBS-002 — Tracing distribué

**Exigence** : Il doit être possible de suivre une requête de bout en bout, depuis
l'action du livreur sur l'application mobile jusqu'à la transmission à l'OMS.

**Mécanisme** : OpenTelemetry (Spring Boot auto-instrumentation). `traceId` propagé
dans les headers HTTP et les événements outbox. Export vers Jaeger ou Zipkin.

**Usage** : "Définir les besoins de logs/traces pour remonter aux causes racines."
(obra/root-cause-tracing — skill architecte technique)

**Criticité** : SHOULD HAVE

---

### ENF-OBS-003 — Métriques applicatives

**Exigence** : Les métriques suivantes doivent être exposées et collectées en continu.

| Métrique | Outil | Usage |
|---|---|---|
| `oms_sync_latency_seconds` (histogram) | Micrometer → Prometheus | SLA synchronisation OMS < 30s |
| `oms_sync_failure_total` (counter) | Micrometer → Prometheus | Détection anomalies intégration |
| `offline_queue_size` (gauge) | Micrometer → Prometheus | Surveillance rejeu offline |
| `tournee_risque_detected_total` (counter) | Micrometer → Prometheus | Volume alertes superviseur |
| `api_request_duration_seconds` (histogram) | Micrometer → Prometheus | Latence API Gateway |
| `preuve_capture_duration_seconds` (histogram) | Micrometer → Prometheus | SLA capture < 45s |

**Stack recommandée** : Prometheus + Grafana (dashboards), AlertManager pour les alertes ops.
Déploiement sur le cluster Kubernetes.

**Criticité** : MUST HAVE (métriques OMS et disponibilité) / SHOULD HAVE (métriques détaillées)

---

### ENF-OBS-004 — Health checks et readiness

**Exigence** : Chaque service backend doit exposer des endpoints de santé utilisés
par Kubernetes pour la gestion du cycle de vie des pods.

**Mécanisme** : Spring Boot Actuator `/actuator/health` (liveness + readiness).
Kubernetes Liveness Probe : redémarrage si le service est bloqué.
Kubernetes Readiness Probe : exclusion du trafic si le service n'est pas prêt
(ex. : connexion PostgreSQL non établie au démarrage).

**Criticité** : MUST HAVE

---

### ENF-OBS-005 — Alertes opérationnelles

**Exigence** : Les anomalies critiques doivent déclencher des alertes vers l'équipe
d'exploitation sans intervention manuelle.

**Seuils d'alerte minimaux** :

| Condition | Sévérité | Action |
|---|---|---|
| OMS sync failure > 10 minutes | CRITIQUE | PagerDuty / email ops |
| Import TMS en échec à 6h00 (3 tentatives échouées) | CRITIQUE | WebSocket superviseur + PagerDuty ops |
| Tournées non affectées à 6h45 | WARNING | WebSocket superviseur (alerte dans interface web) |
| Disponibilité API Gateway < 99,5 % sur 5 min | CRITIQUE | PagerDuty / email ops |
| File offline > 100 événements en attente > 15 min | WARNING | Email ops |
| Pod Kubernetes redémarré > 3 fois en 10 min | WARNING | Email ops |
| Espace disque PostgreSQL > 80 % | WARNING | Email ops |

**Outil** : AlertManager (Prometheus) → canal notification à définir avec DevOps.

**Criticité** : MUST HAVE (alertes critiques) / SHOULD HAVE (alertes warning)

---

## 8. Matrice de criticité globale

| Référence | Exigence | Criticité | Justification |
|---|---|---|---|
| ENF-DISP-001 | Disponibilité app mobile livreur > 99,5 % | MUST HAVE | KPI contractuel, activité terrain bloquée sinon |
| ENF-DISP-002 | Disponibilité interface superviseur > 99 % | MUST HAVE | Pilotage opérationnel critique |
| ENF-DISP-003 | Disponibilité service intégration OMS > 99,9 % | MUST HAVE | Cohérence SI, facturation |
| ENF-PERF-001 | Sync OMS < 30 secondes | MUST HAVE | KPI contractuel M. Garnier |
| ENF-PERF-002 | Rejeu offline < 10 minutes | MUST HAVE | KPI contractuel M. Garnier |
| ENF-PERF-003 | MAJ tableau de bord < 30s | MUST HAVE | Pilotage en temps réel |
| ENF-PERF-004 | Détection risque < 15 minutes | MUST HAVE | KPI superviseur M. Renaud |
| ENF-PERF-005 | Preuve disponible < 5 minutes | MUST HAVE | SLA litiges Mme Dubois |
| ENF-PERF-006 | Latence API < 500ms (p95) | SHOULD HAVE | Confort utilisateur |
| ENF-PERF-007 | Volumétrie MVP (50 livreurs, 6 000 colis/j) | MUST HAVE | Dimensionnement initial |
| ENF-PERF-008 | Démarrage app mobile < 3s (TTI), bundle < 3 Mo | SHOULD HAVE | Fluidité terrain React Native |
| ENF-PERF-009 | Fluidité UI 60 fps, JS thread non bloqué | SHOULD HAVE | Expérience livreur terrain |
| ENF-SCAL-001 | Scalabilité horizontale services | SHOULD HAVE | Évolution post-MVP |
| ENF-SCAL-002 | Évolutivité bus vers Kafka | SHOULD HAVE | Préparer R2 |
| ENF-SEC-001 | OAuth2 / SSO corporate obligatoire | MUST HAVE | Exigence DSI non négociable |
| ENF-SEC-002 | TLS 1.3 sur tous les endpoints | MUST HAVE | Exigence DSI non négociable |
| ENF-SEC-003 | Chiffrement données perso au repos | MUST HAVE | RGPD |
| ENF-SEC-004 | Tokens iOS Keychain + Android Keystore | MUST HAVE | Sécurité mobile iOS + Android |
| ENF-SEC-005 | RBAC livreur / superviseur | MUST HAVE | Isolation des données |
| ENF-SEC-006 | Immuabilité événements | MUST HAVE | Opposabilité juridique |
| ENF-SEC-007 | URLs preuves à durée limitée | MUST HAVE | RGPD + sécurité |
| ENF-RGPD-001 | Minimisation géolocalisation (permission whenInUse) | MUST HAVE | RGPD |
| ENF-RGPD-002 | Pseudonymisation reporting | SHOULD HAVE | RGPD |
| ENF-RGPD-003 | Durée conservation données | SHOULD HAVE | RGPD (à confirmer DPO) |
| ENF-RGPD-004 | Consentement livreur géoloc (iOS + Android) | MUST HAVE | RGPD |
| ENF-DISP-004 | Disponibilité interface web planification dès 6h00 | MUST HAVE | Prérequis Parcours 0 (M. Renaud) |
| ENF-PERF-010 | Import TMS complet < 5 min, interface disponible à 6h05 | MUST HAVE | Fenêtre planification 45 min (M. Renaud) |
| ENF-RESIL-005 | Résilience TMS indisponible : alerte < 2 min + saisie manuelle | MUST HAVE | Continuité Parcours 0, départ livreurs non bloqué |
| ENF-SEC-008 | Accès endpoints planification réservé au rôle SUPERVISOR | MUST HAVE | Ségrégation Parcours 0 (RBAC) |
| ENF-RESIL-001 | Résilience indisponibilité OMS | MUST HAVE | Continuité service terrain |
| ENF-RESIL-002 | Résilience FCM | SHOULD HAVE | Dégradation acceptable |
| ENF-RESIL-003 | Résilience SSO courte coupure | SHOULD HAVE | Confort utilisateur |
| ENF-RESIL-004 | Circuit Breaker OMS | SHOULD HAVE | Protection charge serveur |
| ENF-OBS-001 | Logs structurés JSON | MUST HAVE | Diagnostic incidents |
| ENF-OBS-002 | Tracing distribué OpenTelemetry | SHOULD HAVE | Root cause analysis |
| ENF-OBS-003 | Métriques Prometheus | MUST HAVE (OMS + dispo) | SLA contractuels |
| ENF-OBS-004 | Health checks Kubernetes | MUST HAVE | Déploiement production |
| ENF-OBS-005 | Alertes opérationnelles | MUST HAVE (critiques) | Exploitation production |

---

## 9. Exigences de conformité aux standards DSI

Les exigences suivantes sont imposées par M. Garnier (Architecte Technique DSI) et
ne sont pas négociables pour le MVP :

| Exigence | Valeur imposée |
|---|---|
| Language backend | Java 21 |
| Framework backend | Spring Boot 4.0.3 |
| Language frontend | React 19 / TypeScript 5.6 (web) — React Native / TypeScript (mobile) |
| Plateforme mobile | iOS (iPhone) + Android |
| Conteneurisation | Docker |
| Orchestration | Kubernetes |
| CI/CD | GitHub Actions |
| Authentification | OAuth2 / SSO corporate |
| Chiffrement transport | TLS / HTTPS |
| Architecture | DDD (Domain-Driven Design) |
| Intégration SI | API REST uniquement |
| Environnements | dev / recette / préprod / prod |
| Navigateurs web supportés | Chrome, Safari, Firefox (versions récentes — 2 dernières versions majeures) |

**Observabilité** : les modalités exactes (outils, stack de monitoring) sont à définir
avec M. Garnier. La présente documentation propose Prometheus + Grafana + OpenTelemetry
comme baseline, sous réserve de validation DSI.

TODO : Organiser un atelier avec M. Garnier pour finaliser la stack d'observabilité
avant le début du développement (sprint 0).
