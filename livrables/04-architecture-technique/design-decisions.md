# Design Decisions DocuPost

> Document de référence — Version 1.2 — 2026-03-20
> Architecture Decision Records (ADR) produits par l'Architecte Technique.
> Format : contexte → options → décision → conséquences → statut.
>
> Chaque ADR couvre une décision technique majeure pour le MVP DocuPost.
> Sources : entretiens métier, contraintes SI imposées par M. Garnier (Architecte DSI),
> domain model (/livrables/03-architecture-metier/domain-model.md).
>
> Mise à jour v1.1 : DD-001 révisé (React Native remplace Kotlin/Jetpack Compose),
> DD-002 adapté à l'écosystème React Native, DD-009 ajouté (monorepo front).
>
> Mise à jour v1.2 : DD-010 ajouté (stratégie d'import TMS — API REST pull + fallback
> batch fichier) ; DD-011 ajouté (fenêtre de planification matinale — cron 6h00,
> alerte 6h45). Source : entretien complémentaire M. Renaud 2026-03-20.

---

## DD-001 : Choix de stack mobile — React Native (iOS + Android)

**Contexte**
L'application mobile est le composant le plus critique du MVP : c'est l'outil
quotidien du livreur, utilisé en conditions terrain difficiles (mains occupées, pluie,
réseau variable). Le parc matériel actuel de Docaposte est entièrement Android, mais
une extension iOS est exigée dès le MVP pour couvrir d'éventuels livreurs équipés
d'iPhone et anticiper la stratégie BYOD.
La contrainte de performance UX est forte : mise à jour de statut en moins de 45 secondes,
capture de preuve fluide.

Une décision produit impose l'unification de la stack frontend sur JavaScript/TypeScript
afin de maximiser le partage de code entre mobile et web et de simplifier les profils
développeurs nécessaires.

Hypothèse H1 révisée : "Les livreurs Docaposte disposent d'un smartphone iOS ou Android."

**Options envisagées**

| Option | Avantages | Inconvénients |
|---|---|---|
| React Native (Expo ou CLI) | Unification JS/TS avec le web, support iOS + Android depuis une seule base de code, large écosystème, profils développeurs accessibles, partage de hooks et logique métier avec l'app superviseur | Performances légèrement inférieures au natif sur les animations très complexes ; bridge natif à maintenir pour certains modules (caméra, signature) |
| Android natif Kotlin + Jetpack Compose | Performance maximale sur Android, accès natif caméra/GPS/signature, offline robuste (Room) | iOS exclu ou nécessite une seconde base de code ; stack distincte de React web, compétences Kotlin/Compose séparées |
| Flutter | Cross-platform iOS + Android + web, performance correcte | Dart : compétence hors stack JS/TS de l'équipe ; intégration OAuth2 mobile moins mature ; pas de partage de code TypeScript avec l'app web |
| PWA (Progressive Web App) | Zéro déploiement natif, partage total avec l'app web | Pas d'accès natif signature pad, performances caméra limitées, offline fragile sur iOS/Android, inadapté aux conditions terrain |

**Décision**
React Native avec TypeScript (Expo Managed Workflow en premier lieu, migration vers
Expo Bare ou React Native CLI si des modules natifs non disponibles en Expo le
nécessitent).

Justifications :
1. Support iOS + Android depuis une seule base de code TypeScript — prérequis exprimé
   par la décision produit.
2. Partage de code maximal : les hooks métier (useConfirmerLivraison, useEtatTournee),
   le client API typé et certains composants UI sont partagés avec l'app web React
   via le monorepo (voir DD-009).
3. Profils développeurs JS/TS disponibles dans l'équipe, sans nécessiter des spécialistes
   Kotlin et Swift séparés.
4. Écosystème mature pour les besoins terrain : react-native-vision-camera (capture),
   react-native-signature-canvas, react-native-app-auth (OAuth2 PKCE), react-native-firebase (FCM).
5. Offline-first : WatermelonDB (voir DD-002) est conçu spécifiquement pour React Native
   et offre une synchronisation déclarative adaptée au modèle de données DocuPost.

**Conséquences**
- Positives : iOS + Android couverts au MVP, unification de la stack frontend,
  partage de code avec le web, recrutement simplifié.
- Négatives : une couche de bridge natif est nécessaire pour certains modules (caméra,
  signature, Keychain/Keystore). Les performances JavaScript restent inférieures au
  natif pur pour les animations 60fps très intensives — acceptable pour le cas d'usage
  DocuPost (formulaires terrain, listes de colis).
- Action : valider le choix Expo Managed vs Bare avec l'équipe dev avant le sprint 1,
  en fonction de la disponibilité des modules natifs requis dans l'écosystème Expo.

**Statut** : Acceptée — remplace la décision initiale Android natif Kotlin (v1.0)

---

## DD-002 : Stratégie offline-first — WatermelonDB + Background Fetch (React Native)

**Contexte**
"Les zones péri-urbaines ont une connectivité variable." (M. Garnier)
Hypothèse H5 (périmètre MVP) : "Définir une stratégie offline-first si les zones
concernées sont significatives."
Le KPI de synchronisation OMS (> 99 % en < 30s) s'applique en mode connecté.
Les événements offline doivent être rattrapés dans les 10 minutes.

Suite au passage à React Native (DD-001), les outils Android natifs (Room SQLite,
WorkManager) ne sont plus applicables. La stratégie offline-first est adaptée à
l'écosystème React Native.

**Options envisagées**

| Option | Description | Risques |
|---|---|---|
| A — WatermelonDB + Background Fetch | Base de données locale réactive pour React Native (SQLite sous-jacent). Background fetch pour le rejeu dès retour réseau. | Sur iOS, le background fetch est soumis aux politiques OS (BGTaskScheduler) ; synchronisation garantie au retour au premier plan si non exécutée en arrière-plan |
| B — MMKV (react-native-mmkv) clé-valeur | Très performant pour les lectures/écritures simples | Pas adapté aux collections structurées (colis, tournées) ; pas de requêtes relationnelles |
| C — AsyncStorage (React Native) | Solution standard React Native pour le stockage local | Non adapté aux volumes de données structurées ; performances insuffisantes pour 120 colis/tournée |
| D — SQLite direct via expo-sqlite | Contrôle total du schéma SQL | Nécessite un ORM custom ou du SQL brut ; synchronisation à implémenter manuellement |
| E — Mode dégradé explicite (disable offline) | Bloquer l'action si pas de connexion | Inacceptable terrain : bloque le livreur dans une zone blanche |

**Décision**
Option A : WatermelonDB pour la persistance locale, react-native-background-fetch
pour le rejeu asynchrone, react-native-mmkv pour les données clé-valeur légères
(préférences, état de session).

Principes :
1. Chaque commande terrain (ConfirmerLivraison, DeclarerEchec, CapturePreuve) est
   d'abord écrite dans WatermelonDB avec statut `PENDING`.
2. Si connexion disponible : envoi immédiat à l'API Gateway via le service de sync,
   statut → `SYNCHRONIZED`.
3. Si pas de connexion : react-native-background-fetch programme une tâche de rejeu.
   Sur Android, la tâche s'exécute dès retour réseau via JobScheduler. Sur iOS,
   elle s'exécute selon la politique BGTaskScheduler ou immédiatement au retour
   au premier plan.
4. Chaque commande porte un `commandId` UUID v7 pour l'idempotence côté backend.
5. Les fichiers binaires (photos, signatures) sont stockés dans le filesystem local
   de l'app (react-native-fs ou expo-file-system) compressés, et uploadés vers
   MinIO lors de la synchronisation.
6. MMKV stocke les métadonnées légères : jeton de session, état de sync, préférences UI.

**Conséquences**
- Positives : le livreur travaille sans interruption dans les zones blanches (iOS et
  Android). Le SLA terrain est garanti (rattrapage < 10 min en mode connecté).
- Négatives : sur iOS, le background fetch n'est pas garanti par le système si l'app
  est en arrière-plan prolongé (acceptable : synchronisation au retour au premier plan).
  La clôture de tournée reste conditionnée à la synchronisation complète.
- Risque : collision de commandes si le livreur est déconnecté longtemps et que le
  superviseur envoie des instructions. Mitigation : les instructions reçues hors ligne
  s'appliquent au retour de connexion avec validation des préconditions.
- Action : mesurer en recette les délais de background fetch sur iOS pour valider
  le SLA de rattrapage < 10 minutes.

**Statut** : Acceptée — remplace la décision initiale Room + WorkManager (v1.0)

---

## DD-003 : Architecture du bus d'événements interne — Outbox Pattern PostgreSQL (MVP)

**Contexte**
Les Domain Events entre Bounded Contexts (LivraisonConfirmee → BC_Integration_SI,
etc.) doivent être transmis de façon fiable avec une garantie at-least-once delivery.
M. Garnier impose Java 21 / Spring Boot et PostgreSQL. Le MVP doit être opérationnel
rapidement sans sur-ingénierie.

**Options envisagées**

| Option | Avantages | Inconvénients |
|---|---|---|
| A — Outbox Pattern PostgreSQL + Spring Event | Pas de broker externe, transactionnel avec la BDD, simplicité opérationnelle MVP | Latence légèrement supérieure à Kafka, scalabilité limitée (~10k events/jour MVP) |
| B — Apache Kafka | Scalabilité massive, replay natif, découplage fort | Complexité opérationnelle élevée (Kafka, ZooKeeper/KRaft), surcoût pour le volume MVP |
| C — RabbitMQ | Plus simple que Kafka, bonne maturité | Broker externe à opérer, moins adapté au replay d'événements |
| D — Spring ApplicationEvent synchrone | Zero infrastructure | Pas de persistance, perte d'événements en cas de crash, couplage dans le même JVM |

**Décision**
Option A : Outbox Pattern PostgreSQL + polling via Spring scheduler.

Architecture :
1. Chaque Domain Event est écrit dans la table `outbox_events` dans la même transaction
   que l'agrégat. Atomicité garantie par ACID PostgreSQL.
2. Un scheduler Spring (`@Scheduled`, toutes les 5 secondes) lit les événements PENDING
   et les publie via `ApplicationEventPublisher`.
3. Les handlers (Supervision, Integration SI, Notification) consomment les événements.
4. En cas d'échec d'un handler, l'événement est marqué FAILED et rejoué avec backoff.
5. Migration vers Kafka en Release 2 si le volume dépasse les capacités du polling
   (seuil estimé : > 50 tournées simultanées avec 100 colis chacune).

Table outbox :
```sql
CREATE TABLE outbox_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type      VARCHAR(100) NOT NULL,
    aggregate_id    UUID NOT NULL,
    payload         JSONB NOT NULL,
    status          VARCHAR(20) DEFAULT 'PENDING',
    attempt_count   INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT now(),
    processed_at    TIMESTAMPTZ,
    error_message   TEXT
);
CREATE INDEX idx_outbox_pending ON outbox_events(status, created_at) WHERE status = 'PENDING';
```

**Conséquences**
- Positives : aucun broker externe au MVP, transactionnel, observable (table SQL), simple.
- Négatives : débit limité (acceptable pour le volume MVP). Polling introduit une latence
  de 0-5 secondes entre publication et consommation (acceptable vis-à-vis du SLA 30s).
- Évolution : la table outbox peut servir de source pour un connecteur Kafka Connect
  (Debezium CDC) si une migration vers Kafka est décidée en R2 sans refactoring des
  émetteurs d'événements.

**Statut** : Acceptée — à réévaluer si volume > 50 tournées simultanées

---

## DD-004 : Sécurité et authentification — OAuth2 / SSO corporate + JWT stateless

**Contexte**
M. Garnier impose : "OAuth2 / SSO corporate, gestion des données conforme RGPD,
chiffrement des données (TLS, HTTPS)."
Hypothèse H4 : "Le SSO corporate peut être étendu aux livreurs terrain (population
potentiellement sans compte SI actif)."

**Options envisagées**

| Option | Avantages | Inconvénients |
|---|---|---|
| A — SSO Corporate OAuth2 + JWT RS256 | Aligné avec l'exigence DSI, SSO unifié pour tous les utilisateurs Docaposte | Dépendance au SSO corporate ; H4 à valider (livreurs sans compte SI) |
| B — Keycloak auto-hébergé | Contrôle total, gestion des livreurs indépendante | Charge opérationnelle, divergence avec le SSO corporate existant |
| C — Authentification basique applicative | Indépendance complète | Non conforme aux exigences de sécurité DSI ; hors périmètre accepté |

**Décision**
Option A : SSO Corporate OAuth2 + JWT RS256, avec stratégie de fallback si H4 invalide.

Architecture de sécurité :

1. **Authentification** : OAuth2 Authorization Code Flow + PKCE (mobile React Native
   via react-native-app-auth), Code Flow (web React). Token JWT signé RS256 par le SSO
   corporate.

2. **Validation** : L'API Gateway valide le JWT à chaque requête via Spring Security
   Resource Server (vérification signature, expiration, issuer).

3. **Autorisation RBAC** :
   - `LIVREUR` : accès en lecture/écriture à sa propre tournée uniquement.
   - `SUPERVISEUR` : accès en lecture à toutes les tournées, en écriture aux Instructions.
   - `ADMIN` : accès complet (DSI, support).

4. **Données sensibles** :
   - Géolocalisation minimisée : coordonnées GPS stockées uniquement dans les événements
     de livraison (pas de tracking continu).
   - Numéros de téléphone destinataires : chiffrés au repos (AES-256, clé en Kubernetes
     Secret / Vault).
   - Photos de preuves : stockées dans MinIO avec accès pré-signé limité dans le temps.

5. **Transport** : TLS 1.3 obligatoire sur tous les endpoints. Certificats gérés
   par cert-manager (Kubernetes).

6. **Tokens mobiles** : stockés via react-native-keychain (Android Keystore / iOS
   Keychain) — jamais en AsyncStorage non chiffré. Refresh token rotation activée.

**Fallback si H4 invalide** : provisionnement d'un groupe d'utilisateurs dédié dans
le SSO corporate pour les livreurs sans compte SI existant. À prévoir avec la DSI
avant le sprint 1.

**Conséquences**
- Positives : conformité RGPD, SSO unifié, aucune gestion de mot de passe applicatif.
- Risque : dépendance à la disponibilité du SSO corporate. Mitigation : token cache
  côté API Gateway (5 minutes) pour résister aux coupures SSO courtes.
- Action : valider H4 avec la DSI avant le sprint 1 de développement.

**Statut** : Acceptée — H4 à valider en phase de préparation

---

## DD-005 : Capture et stockage des preuves de livraison — Immuabilité et opposabilité

**Contexte**
"Toute livraison doit produire une preuve opposable (horodatage, géolocalisation,
identité)." (Mme Dubois)
"Quand un client nous dit qu'il n'a pas reçu son colis, on met parfois des heures à
retrouver la preuve." (Mme Dubois)
SLA : preuve disponible en moins de 5 minutes pour le support client.
Les preuves constituent des éléments juridiquement opposables pour Docaposte.

**Options envisagées**

| Option | Avantages | Inconvénients |
|---|---|---|
| A — Object store (S3-compatible MinIO) + hash d'intégrité SHA-256 | Scalable, fichiers nativement adaptés au stockage objet, URL pré-signées pour accès limité | Pas de blockchain / horodatage certifié tiers |
| B — Base de données BLOB PostgreSQL | Simplicité (tout en BDD) | Volumétrie problématique, performances dégradées pour les fichiers binaires |
| C — Service tiers de signature électronique (DocuSign, etc.) | Valeur légale maximale | Coût, dépendance externe, latence, hors périmètre MVP |
| D — Object store + timestamp certifié RFC 3161 | Opposabilité renforcée | Complexité, coût, post-MVP |

**Décision**
Option A pour le MVP : MinIO (S3-compatible) + hash d'intégrité SHA-256 + métadonnées
immuables PostgreSQL.

Architecture de la preuve opposable :

1. **Capture terrain** (App mobile React Native) :
   - Horodatage : `Date.now()` sur le device. Synchronisé NTP au démarrage de l'app.
   - GPS : coordonnées capturées via `expo-location` ou `react-native-geolocation-service`
     au moment de la validation (non modifiables).
   - Fichier (photo / signature) : compressé localement, hash SHA-256 calculé avant upload.

2. **Stockage** :
   - Métadonnées immuables dans PostgreSQL (`preuve_livraison` table avec contrainte
     `NO UPDATE, NO DELETE` via trigger).
   - Fichiers binaires dans MinIO, path `/{tourneeId}/{colisId}/{preuveLivraisonId}.{ext}`.
   - Hash SHA-256 stocké en BDD pour vérification d'intégrité à tout moment.

3. **Accès support** :
   - API `GET /preuves/{colisId}` retourne métadonnées + URL pré-signée MinIO
     (expiration 1 heure).
   - Index PostgreSQL sur `colisId` → recherche < 100ms → SLA 5 minutes largement tenu.

4. **Immuabilité technique** :
   ```sql
   CREATE OR REPLACE FUNCTION prevent_preuve_modification()
   RETURNS TRIGGER AS $$
   BEGIN
       RAISE EXCEPTION 'PreuveLivraison est immuable après création';
   END;
   $$ LANGUAGE plpgsql;

   CREATE TRIGGER no_update_preuve
   BEFORE UPDATE OR DELETE ON preuve_livraison
   FOR EACH ROW EXECUTE FUNCTION prevent_preuve_modification();
   ```

5. **Mode dégradé GPS** : livraison confirmable sans coordonnées GPS si le signal
   est indisponible (tunnels, sous-sols). L'absence de GPS est documentée dans la
   preuve et génère une alerte au superviseur.

**Évolution post-MVP** : ajout d'un horodatage certifié RFC 3161 pour les livraisons
de documents sensibles (Release 2, en coordination avec Mme Dubois).

**Conséquences**
- Positives : SLA 5 minutes tenu, opposabilité via hash et immuabilité, scalable.
- Négatives : horodatage non certifié par tiers (côté serveur, non RFC 3161).
  Acceptable pour le MVP selon les exigences actuelles.
- RGPD : les photos de preuves peuvent contenir des données personnelles
  (visage du destinataire). URL pré-signées avec expiration limitée, accès audité.

**Statut** : Acceptée — horodatage certifié à prévoir en R2 pour documents sensibles

---

## DD-006 : Intégration OMS — Anti-Corruption Layer REST sans modification du cœur

**Contexte**
"Les flux doivent passer par API / ESB, sans modification du cœur OMS." (M. Garnier)
"Tout changement de statut colis doit générer un événement synchronisé vers l'OMS."
L'OMS Docaposte est un système existant dont le modèle de données est différent du
modèle DocuPost. La désynchronisation entre OMS, CRM et ERP est un problème identifié.

Hypothèse H2 : "L'OMS expose une API REST permettant la réception d'événements de statut
colis sans modification de son cœur applicatif."

**Options envisagées**

| Option | Avantages | Inconvénients |
|---|---|---|
| A — ACL dédiée (svc-integration-si) avec translator | Isolation totale du modèle OMS, aucun couplage dans les autres BC | Service supplémentaire à déployer et maintenir |
| B — Appel OMS direct depuis svc-orchestration-tournee | Simplicité | Couplage fort entre le Core Domain et l'OMS externe. Tout changement OMS impacte le Core Domain. |
| C — ESB / Middleware existant Docaposte | Réutilise l'infrastructure existante | Dépendance à l'ESB Docaposte, délai d'intégration, hors contrôle de l'équipe DocuPost |

**Décision**
Option A : Service dédié `svc-integration-si` implémentant un Anti-Corruption Layer.

Architecture ACL :

```
DocuPost Domain Events          ACL (svc-integration-si)         OMS Externe
──────────────────────          ────────────────────────          ───────────
LivraisonConfirmee      →  OmsEventTranslator.translate()  →  POST /shipment-items/{id}/delivery-status
EchecLivraisonDeclare   →  OmsEventTranslator.translate()  →  POST /shipment-items/{id}/delivery-status
TourneeCloturee         →  OmsEventTranslator.translate()  →  POST /routes/{id}/close
PreuveCapturee          →  OmsEventTranslator.translate()  →  PUT  /shipment-items/{id}/proof
```

Responsabilités du translator :
1. Traduire les identifiants (UUID DocuPost → String OMS).
2. Mapper les enums (StatutColis.LIVRE → "DELIVERED", MotifNonLivraison.ABSENT →
   "RECIPIENT_ABSENT").
3. Formater les dates (Instant → ISO-8601 String).
4. Construire le payload OMS sans aucune connaissance du modèle DocuPost dans l'OMS.

Politique de retry OMS :
- Backoff exponentiel : 30s → 1min → 2min → 5min → 10min.
- Après 10 minutes sans succès : statut DEAD_LETTER + alerte ops.
- Idempotence : `idempotencyKey` UUID v7 dans chaque requête OMS.

**Si H2 s'avère invalide** (OMS sans API REST) : ajouter un adaptateur vers l'ESB
Docaposte ou une intégration file CSV/SFTP dans le `svc-integration-si`, sans modifier
aucun autre composant DocuPost. L'ACL absorbe le changement.

**Conséquences**
- Positives : le modèle DocuPost est totalement isolé du modèle OMS. Tout changement
  OMS n'impacte que le translator.
- Négatives : un service supplémentaire à déployer (faible : service stateless simple).
- Action : obtenir la documentation API OMS de M. Garnier avant le sprint 1 d'intégration.

**Statut** : Acceptée — documentation API OMS requise avant sprint d'intégration

---

## DD-007 : Temps réel superviseur — WebSocket + CQRS allégé côté supervision

**Contexte**
Le superviseur doit voir le tableau de bord mis à jour en moins de 30 secondes.
"Je pilote à l'aveugle. Je sais seulement ce que le livreur me dit quand il m'appelle."
(M. Renaud)
La détection des tournées à risque doit déclencher une alerte en moins de 15 minutes.

**Options envisagées**

| Option | Avantages | Inconvénients |
|---|---|---|
| A — WebSocket (Spring WebSocket + STOMP) + Read Models CQRS | Mise à jour push instantanée, pas de polling, React Query s'intègre bien | Gestion de la reconnexion WebSocket client |
| B — Server-Sent Events (SSE) | Plus simple que WebSocket, unidirectionnel suffisant | Moins standard pour les messages bidirectionnels futurs |
| C — Polling REST (toutes les 10s) | Très simple à implémenter | Charge serveur, latence 0-10s → trop juste pour le SLA 15min alerte |
| D — GraphQL Subscriptions | Flexibilité requête | Surcoût de stack, hors compétences imposées |

**Décision**
Option A : WebSocket (Spring WebSocket + STOMP) pour les mises à jour temps réel,
combiné avec des Read Models dédiés (CQRS allégé).

Architecture CQRS supervision :

1. **Write side** (BC_Orchestration) : Tournee et Colis gèrent leurs états, publient
   des Domain Events via l'outbox.

2. **Read side** (BC_Supervision) : `VueTournee` et `VueColis` sont des projections
   construites par `TourneeEventHandler` à partir des Domain Events. Stockées dans une
   base PostgreSQL dédiée (lecture optimisée). La supervision ne lit jamais la base
   d'écriture de l'orchestration.

3. **WebSocket** : Dès qu'un Read Model est mis à jour, `SuperviseurWebSocketPublisher`
   envoie la mise à jour sur le topic STOMP `/topic/tournees/{date}`.

4. **Frontend React** : `useWebSocket` hook souscrit au topic STOMP. Mise à jour
   de l'état local React sans polling.

5. **Reconnexion** : Le client WebSocket React reconnecte automatiquement avec backoff
   exponentiel. En cas de reconnexion, un appel REST initial recharge l'état complet.

**Conséquences**
- Positives : latence < 1 seconde pour les mises à jour terrain → tableau de bord.
  SLA 30 secondes largement tenu. SLA 15 minutes alerte tenu.
- Négatives : gestion de la reconnexion WebSocket à soigner côté React. Double stockage
  (write + read PostgreSQL) — faible surcoût pour le volume MVP.

**Statut** : Acceptée

---

## DD-008 : Conteneurisation et déploiement — Docker + Kubernetes multi-namespaces

**Contexte**
M. Garnier impose : "Docker / Kubernetes / CI/CD GitHub Actions."
Environnements requis : dev / recette / préprod / prod.
La plateforme doit être scalable et permettre des déploiements sans interruption
de service en production.

**Options envisagées**

| Option | Description | Risques |
|---|---|---|
| A — Kubernetes multi-namespaces (un namespace par env) | Isolation par namespace, même cluster pour dev/recette/préprod, cluster dédié prod | Complexité initiale de configuration |
| B — Clusters séparés par environnement | Isolation maximale | Coût élevé, complexité opérationnelle |
| C — Docker Compose uniquement | Simplicité dev | Non adapté à la production, pas de Kubernetes |

**Décision**
Option A : Kubernetes avec namespaces par environnement.

Architecture de déploiement :

1. **Namespaces** : `docupost-dev`, `docupost-recette`, `docupost-preprod`,
   `docupost-prod`. Les environnements dev/recette/préprod partagent un cluster
   non-prod. La production a son propre cluster (isolation réseau et sécurité).

2. **CI/CD (GitHub Actions)** :
   - `push feature/*` → build + tests unitaires.
   - `merge main` → build Docker → push registry → deploy auto dev.
   - Tests E2E automatisés sur dev → déploiement recette (manuel ou auto selon policy).
   - Validation QA → déploiement préprod (manuel).
   - Validation tech lead + DSI → déploiement prod (blue/green).

3. **Blue/Green deployment en prod** : zero downtime. Deux ensembles de pods actifs
   (blue = version actuelle, green = nouvelle version). Basculement via Ingress update.
   Rollback immédiat si anomalie.

4. **Secrets** : Kubernetes Secrets + (optionnel) HashiCorp Vault pour les credentials
   OMS, clés de chiffrement, FCM API key.

5. **Health checks** : Readiness et Liveness probes Spring Boot Actuator sur chaque service.

**Conséquences**
- Positives : aligné avec les standards DSI, déploiements sans interruption, rollback rapide.
- Négatives : courbe d'apprentissage Kubernetes pour l'équipe dev si non maîtrisé.
  Mitigation : utiliser Helm charts pour standardiser les déploiements.

**Statut** : Acceptée

---

## DD-009 : Architecture monorepo frontend — Nx ou Turborepo (web + mobile)

**Contexte**
Suite à l'adoption de React Native (DD-001), le frontend DocuPost comprend désormais
deux applications distinctes partageant le même langage TypeScript :
- `apps/mobile` : application livreur React Native (iOS + Android)
- `apps/web` : application superviseur React 19 (SPA navigateur)

Ces deux applications partagent une logique métier commune (hooks de domaine, client API
REST typé, types TypeScript des agrégats DocuPost) et peuvent partager certains composants
UI adaptables. Gérer ces deux applications dans des dépôts séparés introduirait une
duplication de code, des désynchronisations de types et des frictions de maintenance.

**Options envisagées**

| Option | Avantages | Inconvénients |
|---|---|---|
| A — Monorepo Nx | Générateurs de code, cache de build local et distant (Nx Cloud), pipelines CI/CD par projet affecté, plugins React/React Native natifs | Configuration initiale plus riche |
| B — Monorepo Turborepo | Simplicité de configuration, cache de build efficace, agnostique au framework | Moins de générateurs de code que Nx, moins de support natif React Native |
| C — Dépôts séparés + package npm publié | Indépendance totale des équipes | Duplication de types, friction de versionning des packages partagés, synchronisation manuelle |
| D — Monorepo sans outil (npm/yarn workspaces bruts) | Pas de dépendance sur un outil de build | Pas de cache de build, pipelines CI/CD non optimisés, complexité croissante |

**Décision**
Option A : Monorepo Nx avec workspaces TypeScript.

Structure du monorepo :

```
docupost-frontend/          # Racine du monorepo Nx
├── apps/
│   ├── mobile/             # React Native (Expo ou CLI) — livreur iOS + Android
│   └── web/                # React 19 — superviseur SPA
├── packages/
│   ├── shared-ui/          # Composants UI adaptables (web + mobile via platform-specific files)
│   ├── domain-hooks/       # Hooks React : useConfirmerLivraison, useEtatTournee, useTournee, etc.
│   ├── api-client/         # Client REST TypeScript typé (fetch / axios), DTOs, types des agrégats
│   └── utils/              # Utilitaires partagés (UUID v7, formatage dates, validation)
├── nx.json
├── package.json
└── tsconfig.base.json
```

Règles de partage :
- `packages/domain-hooks` : aucune dépendance React Native ou React DOM directe.
  Utilise uniquement des APIs React standard (hooks). Consommable par les deux apps.
- `packages/shared-ui` : utilise des fichiers `.native.tsx` / `.web.tsx` pour les
  composants nécessitant des implémentations plateforme-spécifiques (ex. : ScrollView
  native vs div web). Tailwind CSS côté web, NativeWind côté mobile.
- `packages/api-client` : zéro dépendance plateforme. TypeScript pur.

Builds CI/CD :
- `nx affected --target=build` : ne rebuild que les apps et packages affectés par
  un changement. Réduit significativement les temps de CI.
- Build React Native (iOS .ipa / Android .apk) : via Expo EAS Build intégré dans le
  pipeline GitHub Actions (branche release uniquement).
- Build web (SPA) : via Vite, déployé dans le pipeline Docker/Kubernetes standard.

**Conséquences**
- Positives : un seul dépôt pour tout le frontend, types partagés garantissant la
  cohérence avec le backend, build intelligent (seul l'affecté est rebuilt), profils
  développeurs unifiés TypeScript.
- Négatives : configuration Nx initiale à investir en sprint 0. Les builds React Native
  (EAS Build) sont externes au cluster Kubernetes et nécessitent un compte Expo.
- Action : initialiser le monorepo Nx et la structure des packages en sprint 0, avant
  le premier sprint de développement feature.

**Statut** : Acceptée

---

## DD-010 : Stratégie d'import TMS — API REST pull avec fallback batch fichier

**Contexte**
Le TMS génère les tournées du jour chaque soir ou en début de matinée.
DocuPost doit importer ces tournées automatiquement avant le départ des livreurs
(fenêtre cible : disponibles à 6h15 dans l'interface web superviseur).
L'hypothèse H6 du périmètre MVP stipule que "le TMS expose une API ou un flux d'export
(fichier structuré, webhook) permettant l'import automatique des tournées du jour."
Le mode d'exposition exact du TMS reste à confirmer avec M. Garnier et M. Renaud.

M. Renaud (entretien complémentaire 2026-03-20) : "Le matin, je récupère la liste des
tournées depuis le TMS manuellement. Je perds 20 à 30 minutes chaque matin."

**Options envisagées**

| Option | Avantages | Inconvénients |
|---|---|---|
| A — API REST pull TMS → DocuPost | Standard, ne nécessite pas de modification du TMS, ACL DocuPost-side, stateless, testable | Dépend de l'existence d'une API REST sur le TMS (H6) |
| B — Batch fichier SFTP / JSON | Universel, fonctionne même avec les TMS anciens | Nécessite un serveur SFTP, latence potentiellement plus élevée, gestion des fichiers en erreur |
| C — Webhook push TMS → DocuPost | Réactivité maximale, pas de polling | Nécessite une modification du TMS (ajout du webhook) — risque élevé ; implique de gérer un endpoint entrant exposé |
| D — Import manuel superviseur (formulaire web) | Pas de dépendance TMS | Charge opérationnelle importante (20-30 min/jour, pain point M. Renaud) ; erreurs de saisie |

**Décision**
Option A (API REST pull) comme stratégie principale, avec fallback Option B (batch fichier)
si l'API REST n'est pas disponible.
L'Option D (saisie manuelle) est conservée uniquement comme mode dégradé en cas
d'indisponibilité du TMS au moment de l'import (voir DD-011 et schemas-integration.md).

L'option C (webhook) est écartée pour le MVP car elle implique une modification du TMS
externe, contrairement à l'exigence "sans modification du cœur" étendue par analogie au TMS.

Implémentation :
1. `ImporteurTMSScheduler` (Spring `@Scheduled`, cron `"0 0 6 * * MON-SAT"`) déclenche
   chaque matin à 6h00 (du lundi au samedi).
2. `TmsApiAdapter.importerTourneesduJour(date)` appelle l'API REST TMS.
3. En cas d'échec (timeout, 503), `TmsApiAdapter` tente un accès au dossier SFTP batch
   (fallback Option B) si configuré.
4. En cas d'échec des deux mécanismes, une alerte est émise et l'interface web passe
   en mode saisie manuelle de secours.

Configuration externalisée :
```yaml
# application.yml svc-planification
docupost:
  tms:
    api-url: "https://tms.docaposte.fr/api/v1"   # à confirmer H6
    api-token-secret: "${TMS_API_TOKEN}"          # Kubernetes Secret
    sftp-fallback-enabled: true
    sftp-host: "${TMS_SFTP_HOST}"
    sftp-path: "/exports/tournees/"
    import-cron: "0 0 6 * * MON-SAT"
    retry-max-attempts: 3
    retry-delay-minutes: 5
```

**Alternatives considérées**
Voir tableau ci-dessus. L'ACL est entièrement DocuPost-side via `TmsResponseTranslator` :
le modèle interne DocuPost (PlanDuJour, TourneeTMS) ne dépend pas du format TMS.

**Conséquences**
- Positives : aucune modification du TMS requise, ACL absorbe tout changement de format TMS,
  fallback batch garantit la continuité en cas d'API TMS non disponible.
- Négatives : dépendance à l'hypothèse H6 (API REST TMS exposée). Si H6 invalide et si le
  TMS ne propose ni API ni export batch, l'import reste manuel avec le formulaire de secours.
- Action requise : obtenir la documentation d'interface du TMS auprès de M. Garnier et
  M. Renaud avant le sprint d'implémentation du Module 8 (BC-07). Valider H6.

**Statut** : Retenue sous condition — validation H6 requise avant sprint Module 8

---

## DD-011 : Gestion de la fenêtre de planification matinale

**Contexte**
L'import TMS et les affectations livreur/véhicule doivent être réalisés avant le départ
des livreurs, qui quittent le dépôt entre 6h30 et 7h00.
M. Renaud (entretien 2026-03-20) : "Les livreurs partent entre 6h30 et 7h00. Si je n'ai
pas fini les affectations à 6h45, certains partent sans tournée dans DocuPost."
Cette contrainte temporelle critique impose une architecture précise du cycle de démarrage.

**Contrainte identifiée**
La fenêtre de planification est de 45 minutes maximum :
- 6h00 : import automatique TMS (ImporteurTMSScheduler).
- 6h00 – 6h45 : superviseur vérifie les compositions, enregistre les affectations, lance.
- 6h45 : seuil d'alerte — toute tournée non affectée génère une alerte dans l'interface.
- 6h30 – 7h00 : départ des livreurs — les tournées lancées doivent être visibles dans l'app.

**Options envisagées**

| Option | Avantages | Inconvénients |
|---|---|---|
| A — Import cron 6h00 + alerte 6h45 non affectées | Automatique, alertes ciblées, pas de fragmentation | Dépend de la disponibilité du backend dès 6h00 |
| B — Import la veille au soir (cron 22h00) | Plus de marge, pas de pression matinale | Les tournées TMS du lendemain ne sont pas toujours finalisées la veille |
| C — Import 6h00 + relance auto à 6h30 si incomplet | Double filet de sécurité | Complexité accrue, doublons à gérer |

**Décision**
Option A : import automatique programmé à 6h00 via cron Spring, tableau de bord superviseur
disponible dès 6h00, alertes si des tournées sont non affectées à 6h45.

Architecture de la fenêtre matinale :

```
06h00 — ImporteurTMSScheduler déclenche l'import
         → PlanDuJour créé, TournéesTMS initialisées
         → Superviseur notifié (WebSocket) : "Plan du jour importé — N tournées"

06h00 - 06h45 — Superviseur travaille sur l'interface web (W-04, W-05)
         → Vérifie les compositions de tournée
         → Enregistre les affectations livreur + véhicule
         → Lance les tournées prêtes
         → TourneeLancee → BC-01 → Tournée visible dans l'app livreur

06h45 — Scheduler d'alerte (cron "0 45 6 * * MON-SAT")
         → PlanDuJourRepository.findTourneesNonAffectees(LocalDate.now())
         → Si > 0 tournées non affectées :
             - Alerte WebSocket superviseur : "X tournées non affectées — départ dans 15 min"
             - Métrique : tournees_non_affectees_a_6h45 (Prometheus)
             - Log WARN

06h30 - 07h00 — Départ livreurs
         → Tournées lancées visibles dans l'application mobile (ChargerTourneeUseCase)
```

Implémentation du scheduler d'alerte (composant dédié dans svc-planification) :
```java
@Component
public class AlertePlanificationScheduler {

    @Scheduled(cron = "0 45 6 * * MON-SAT")
    public void alerterTourneesNonAffectees() {
        LocalDate today = LocalDate.now();
        List<TourneeTMS> nonAffectees = planDuJourRepository
            .findTourneesNonAffectees(today);

        if (!nonAffectees.isEmpty()) {
            superviseurWebSocketPublisher.sendAlert(
                "TOURNEES_NON_AFFECTEES",
                nonAffectees.size() + " tournée(s) non affectée(s) — départ dans 15 min"
            );
            metriques.incrementer("tournees_non_affectees_a_6h45", nonAffectees.size());
            log.warn("Alerte planification 6h45 : {} tournée(s) non affectée(s)", nonAffectees.size());
        }
    }
}
```

**Conséquences**
- Positives : le superviseur est alerté automatiquement en cas de retard de planification.
  La chaîne Import TMS → Affectation → Lancement → App livreur est entièrement automatisée
  sauf l'étape d'affectation (intentionnellement manuelle au MVP).
- Négatives : exigence de disponibilité de l'interface web dès 6h00 du matin (ENF-DISP-002
  étendue au Parcours 0 — voir exigences-non-fonctionnelles.md).
  Le scheduler d'alerte 6h45 suppose que le cron 6h00 a réussi. En cas d'import échoué,
  l'alerte porte sur l'import en échec (DD-010) plutôt que sur les tournées non affectées.
- Action : définir avec M. Renaud le seuil exact du délai d'alerte (6h45 à confirmer
  selon les habitudes terrain) et les créneaux exacts des jours travaillés (MON-SAT à valider).

**Statut** : Acceptée — seuil d'alerte et calendrier à confirmer avec M. Renaud avant implémentation
