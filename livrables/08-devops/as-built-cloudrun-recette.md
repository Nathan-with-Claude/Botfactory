# As-Built — Environnement Recette Cloud Run

> Document de référence opérationnelle — Version 1.2 — 2026-04-07
> Décrit l'état **réel** de l'environnement recette GCP tel qu'il a été mis en production.
> Source de vérité infra : `/livrables/00-contexte/infrastructure-locale.md`
> Schéma d'architecture : `/livrables/04-architecture-technique/architecture-gcp-recette.drawio`

---

## 1. Identification du projet GCP

| Paramètre | Valeur |
|-----------|--------|
| Project ID | `docupost-recette-prod` |
| Project Number | `830746169662` |
| Région | `europe-west1` |
| Compte opérateur | `nathan.with.claude@gmail.com` |
| Date de provisionnement initial | 2026-04-06 |
| Date de premier déploiement réussi | 2026-04-07 |

---

## 2. Services Cloud Run déployés

### 2.1 `svc-tournee`

| Paramètre | Valeur |
|-----------|--------|
| URL | https://svc-tournee-llb4mq4zha-ew.a.run.app |
| Image | `europe-west1-docker.pkg.dev/docupost-recette-prod/docupost/svc-tournee:<sha>` |
| Port conteneur | `8081` |
| CPU | 1000m (1 vCPU) |
| Mémoire | 512Mi |
| Max instances | 12 |
| Startup CPU boost | activé |
| Accès | Public (`allUsers` → `roles/run.invoker`) |
| Health check | `GET /actuator/health` → `{"status":"UP"}` |

**Variables d'environnement :**

| Variable | Valeur / Source |
|----------|----------------|
| `SPRING_PROFILES_ACTIVE` | `prod,recette` |
| `POSTGRES_URL` | `jdbc:postgresql:///docupost_tournee?cloudSqlInstance=docupost-recette-prod:europe-west1:docupost-db&socketFactory=com.google.cloud.sql.postgres.SocketFactory` |
| `POSTGRES_USER` | `docupost` |
| `POSTGRES_PASSWORD` | Secret Manager → `tournee-db-password:latest` |
| `INTERNAL_SECRET` | Secret Manager → `internal-secret:latest` |

> Le profil `recette` active : `MockJwtAuthFilter`, `DevTourneeController`, `DevDataSeeder` (colis seed fictifs).

---

### 2.2 `svc-supervision`

| Paramètre | Valeur |
|-----------|--------|
| URL | https://svc-supervision-llb4mq4zha-ew.a.run.app |
| Image | `europe-west1-docker.pkg.dev/docupost-recette-prod/docupost/svc-supervision:<sha>` |
| Port conteneur | `8082` |
| CPU | 1000m (1 vCPU) |
| Mémoire | 512Mi |
| Max instances | 12 |
| Startup CPU boost | activé |
| Accès | Public (`allUsers` → `roles/run.invoker`) |
| Health check | `GET /actuator/health` → `{"status":"UP"}` |

**Variables d'environnement :**

| Variable | Valeur / Source |
|----------|----------------|
| `SPRING_PROFILES_ACTIVE` | `prod,recette` |
| `SUPERVISION_DB_URL` | `jdbc:postgresql:///docupost_supervision?cloudSqlInstance=docupost-recette-prod:europe-west1:docupost-db&socketFactory=com.google.cloud.sql.postgres.SocketFactory` |
| `SUPERVISION_DB_USER` | `docupost` |
| `SUPERVISION_DB_PASSWORD` | Secret Manager → `supervision-db-password:latest` |
| `INTERNAL_SECRET` | Secret Manager → `internal-secret:latest` |
| `ALLOWED_ORIGINS` | `https://frontend-supervision-llb4mq4zha-ew.a.run.app,https://frontend-supervision-830746169662.europe-west1.run.app` |
| `DOCUPOST_DEV_SVC_TOURNEE_URL` | `https://svc-tournee-llb4mq4zha-ew.a.run.app` |

> Le profil `recette` active : `MockJwtAuthFilter` (superviseur-001), `DevTmsController`, `DevDataSeeder`, `DevEventBridge`, `DevRestConfig`.
> `DOCUPOST_DEV_SVC_TOURNEE_URL` est lu par `DevEventBridge` pour propager les `TourneeLancee` vers `svc-tournee` via HTTP (simulation Kafka inter-BC).

---

### 2.3 `frontend-supervision`

| Paramètre | Valeur |
|-----------|--------|
| URL | https://frontend-supervision-llb4mq4zha-ew.a.run.app |
| Image | `europe-west1-docker.pkg.dev/docupost-recette-prod/docupost/frontend-supervision:<sha>` |
| Port conteneur | `80` |
| CPU | 1000m (1 vCPU) |
| Mémoire | 512Mi |
| Accès | Public (`allUsers` → `roles/run.invoker`) |
| Build-arg baked | `REACT_APP_API_URL=https://svc-supervision-llb4mq4zha-ew.a.run.app` |

> ⚠️ `REACT_APP_API_URL` est **baked à la compilation** dans l'image Docker (comportement CRA).
> Toute modification de l'URL de l'API nécessite un rebuild complet de l'image.

---

## 3. Infrastructure de données

### 3.1 Cloud SQL

| Paramètre | Valeur |
|-----------|--------|
| Instance | `docupost-db` |
| Connexion | `docupost-recette-prod:europe-west1:docupost-db` |
| Version PostgreSQL | 15.17 |
| Tier | `db-f1-micro` (shared vCPU, 614MB RAM) |
| Région | `europe-west1` |

**Bases de données :**

| Base | Utilisée par | Schéma créé par |
|------|-------------|-----------------|
| `docupost_tournee` | `svc-tournee` | Hibernate `ddl-auto: update` au premier démarrage |
| `docupost_supervision` | `svc-supervision` | Hibernate `ddl-auto: update` au premier démarrage |

> **Limite de connexions** : `db-f1-micro` supporte ~25 connexions simultanées.
> HikariCP est configuré à **3 connexions max par service** (`maximum-pool-size: 3`, `minimum-idle: 1`).
> Avec 2 services, cela laisse une marge suffisante pour les connexions de maintenance.

### 3.2 Secret Manager

| Secret | Contenu | Utilisé par |
|--------|---------|-------------|
| `tournee-db-password` | Mot de passe PostgreSQL user `docupost` (base tournee) | `svc-tournee` |
| `supervision-db-password` | Mot de passe PostgreSQL user `docupost` (base supervision) | `svc-supervision` |
| `internal-secret` | Secret partagé inter-services (header `X-Internal-Secret`) | `svc-tournee`, `svc-supervision` |

---

## 4. CI/CD — Pipeline de déploiement

### 4.1 Déclenchement

Le déploiement est **manuel** (pas de trigger GitHub). Commande depuis la racine du projet :

```bash
TAG=$(git rev-parse --short HEAD)
gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions=_TAG=${TAG} \
  --project=docupost-recette-prod
```

### 4.2 Étapes Cloud Build (`cloudbuild.yaml`)

```
[1] build-svc-tournee        docker build → svc-tournee:$_TAG
[2] push-svc-tournee         docker push → Artifact Registry
[3] build-svc-supervision    docker build → svc-supervision:$_TAG
[4] push-svc-supervision     docker push → Artifact Registry
[5] build-frontend-supervision  docker build (avec REACT_APP_API_URL baked)
[6] push-frontend-supervision   docker push → Artifact Registry
[7] deploy-svc-tournee       gcloud run deploy (parallèle avec [8])
[8] deploy-svc-supervision   gcloud run deploy (parallèle avec [7])
[9] deploy-frontend-supervision  gcloud run deploy
```

Durée typique : **8–12 minutes**

### 4.3 Artifact Registry

| Image | Chemin |
|-------|--------|
| svc-tournee | `europe-west1-docker.pkg.dev/docupost-recette-prod/docupost/svc-tournee:<tag>` |
| svc-supervision | `europe-west1-docker.pkg.dev/docupost-recette-prod/docupost/svc-supervision:<tag>` |
| frontend-supervision | `europe-west1-docker.pkg.dev/docupost-recette-prod/docupost/frontend-supervision:<tag>` |

---

## 5. IAM — Comptes de service

| Compte | Rôles | Usage |
|--------|-------|-------|
| `830746169662-compute@developer.gserviceaccount.com` (Compute Engine default) | `roles/editor` (inclut `cloudsql.client`) | Identité des services Cloud Run au runtime |
| `830746169662@cloudbuild.gserviceaccount.com` | `roles/cloudbuild.builds.builder`, `roles/cloudsql.client`, `roles/run.admin` | Exécution des builds et déploiements Cloud Build |

> ⚠️ **À durcir avant staging/prod** : `roles/editor` est trop permissif pour le compte Compute Engine.
> Remplacer par des rôles granulaires : `roles/cloudsql.client`, `roles/secretmanager.secretAccessor`.

---

## 6. Couche applicative — Configurations Spring Boot (profil `prod`)

### 6.1 Connexion DB (Cloud SQL Connector)

La connexion à Cloud SQL utilise le **Cloud SQL Java Connector** (`postgres-socket-factory` v1.15.0).
Ce connecteur utilise l'IAM du compte de service Cloud Run pour s'authentifier sans mot de passe réseau.
Le mot de passe PostgreSQL reste nécessaire pour l'utilisateur applicatif `docupost`.

**Dépendance ajoutée dans les deux `pom.xml` :**
```xml
<dependency>
    <groupId>com.google.cloud.sql</groupId>
    <artifactId>postgres-socket-factory</artifactId>
    <version>1.15.0</version>
</dependency>
```

### 6.2 Authentification (OAuth2 / SSO)

Le profil `prod` utilise `jwk-set-uri` (lazy) au lieu de `issuer-uri` :

```yaml
spring.security.oauth2.resourceserver.jwt.jwk-set-uri:
  ${SSO_JWK_SET_URI:https://sso.docaposte.fr/realms/docupost/protocol/openid-connect/certs}
```

> **Pourquoi** : `issuer-uri` provoque une connexion Keycloak au démarrage. Keycloak n'étant pas encore déployé en recette, cela faisait crasher les services. `jwk-set-uri` est lazy — la connexion n'est établie qu'au premier JWT à valider.
>
> **Impact actuel** : les endpoints protégés OAuth2 retourneront 401 si aucun token valide n'est fourni. Pour les tests en recette sans Keycloak, utiliser les endpoints publics ou passer par `/api/supervision/internal/**`.
>
> **TODO** : déployer Keycloak sur Cloud Run et reconfigurer avec `issuer-uri`.

### 6.3 Référentiel livreurs (`svc-supervision`)

Une implémentation `@Profile("prod")` a été créée pour le profil prod :
`com.docapost.supervision.infrastructure.planification.ProdLivreurReferentiel`

> Liste hardcodée des 6 livreurs canoniques. **TODO** : remplacer par `Bc06LivreurReferentiel` qui interroge l'API admin Keycloak.

---

## 7. Couche frontend (React / nginx)

### 7.1 Dockerfile

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps      # --legacy-peer-deps : conflit TypeScript 5.x / react-scripts 5.0.1
COPY . .
ARG REACT_APP_API_URL
ARG REACT_APP_SUPERVISION_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

> `--legacy-peer-deps` est requis car `react-scripts@5.0.1` n'est compatible qu'avec TypeScript `^3 || ^4`,
> alors que le projet utilise `typescript@^5.6.0`.

---

## 8. Bugs corrigés lors du premier déploiement

| # | Symptôme | Cause | Correctif appliqué |
|---|---------|-------|-------------------|
| 1 | `invalid image name "...:"`  | `$COMMIT_SHA` vide en deploy manuel (variable injectée uniquement par trigger GitHub) | Remplacé par substitution `$_TAG` dans `cloudbuild.yaml` |
| 2 | `npm error ERESOLVE` (frontend) | `react-scripts@5.0.1` incompatible avec `typescript@5.9.3` | `npm ci --legacy-peer-deps` dans `Dockerfile` supervision |
| 3 | `SocketFactory could not be instantiated` | Dépendance `postgres-socket-factory` absente des `pom.xml` | Ajout dans `svc-tournee/pom.xml` et `svc-supervision/pom.xml` |
| 4 | `missing table [colis]` | Hibernate en mode `validate` sur base vide | `ddl-auto: validate` → `ddl-auto: update` en profil prod |
| 5 | `No qualifying bean of type 'LivreurReferentiel'` | Implémentation uniquement `@Profile("dev")` | Création `ProdLivreurReferentiel.java` (`@Profile("prod")`) |
| 6 | Crash au démarrage (Keycloak unreachable) | `issuer-uri` provoque connexion OIDC synchrone au boot | Migré vers `jwk-set-uri` (lazy) dans les deux services |
| 7 | `remaining connection slots are reserved` | Pool HikariCP 10 connexions × 2 services dépasse limite `db-f1-micro` | `maximum-pool-size: 3`, `minimum-idle: 1` dans les deux services |
| 8 | `TS2345` TypeScript au build frontend | Type callback `stompSubscribeFn` incorrect (retournait `void` au lieu de `{ unsubscribe }`) | Correction dans `EtatLivreursPage.tsx` ligne 41 |
| 9 | 403 sur tous les endpoints Cloud Run | `--allow-unauthenticated` échoue silencieusement sans droits IAM suffisants | `gcloud run services add-iam-policy-binding --member=allUsers --role=roles/run.invoker` pour chaque service |
| 10 | `ALLOWED_ORIGINS` = placeholder | Valeur non substituée dans `cloudbuild.yaml` lors du premier déploiement | Corrigé via `gcloud run services update --update-env-vars` |
| 11 | `ERR_NAME_NOT_RESOLVED` (sso.docaposte.fr) | Frontend redirige vers Keycloak absent | `REACT_APP_AUTH_BYPASS=true` baked à la compilation ; `MockJwtAuthFilter` activé sur profil `recette` |
| 12 | CORS bloqué 403 | `ALLOWED_ORIGINS` ne contenait qu'une URL sur deux ; token Bearer invalide en l'absence de JWT réel | Deux URLs dans `ALLOWED_ORIGINS` + `MockJwtAuthFilter @Profile({"dev","recette"})` |
| 13 | `key "_FRONTEND_URL" not matched` (Cloud Build) | Substitution `_FRONTEND_URL` non déclarée après renommage en `_FRONTEND_URLS` | Suppression de `_FRONTEND_URL` du `cloudbuild.yaml` |
| 14 | `--set-env-vars` parsing échoue avec `prod^recette` | `^` sans préfixe déclenche le mode délimiteur gcloud | Syntaxe `^|^KEY=val1,val2|KEY2=val3` adoptée dans `cloudbuild.yaml` |
| 15 | "Impossible de déclencher l'import TMS simulé" | `DevTmsController`, `DevDataSeeder`, `DevEventBridge`, `DevRestConfig` limités à `@Profile("dev")` | Extension à `@Profile({"dev","recette"})` sur tous ces composants dans `svc-supervision` et `svc-tournee` |
| 16 | `DevEventBridge` appelait `localhost:8081` en recette | Valeur par défaut de `docupost.dev.svc-tournee-url` = `localhost:8081` | Ajout de `DOCUPOST_DEV_SVC_TOURNEE_URL=https://svc-tournee-llb4mq4zha-ew.a.run.app` dans `cloudbuild.yaml` |

---

## 9. Limitations connues et points d'attention

| Sujet | Impact | Action requise |
|-------|--------|----------------|
| Keycloak absent | Auth OAuth2 non fonctionnelle — tous les endpoints protégés retournent 401 | Déployer Keycloak sur Cloud Run, configurer `SSO_JWK_SET_URI` |
| `ddl-auto: update` en prod | Hibernate modifie le schéma automatiquement — risque de perte de données si entité modifiée | Introduire Flyway pour les migrations de schéma |
| `roles/editor` sur Compute SA | Surface d'attaque large si une instance Cloud Run est compromise | Restreindre aux rôles minimaux avant passage en staging |
| `db-f1-micro` (614MB RAM, 1 shared vCPU) | Performances limitées, max ~25 connexions simultanées | Upgrade vers `db-g1-small` ou `db-n1-standard-1` pour staging |
| `REACT_APP_API_URL` baked à la compilation | Changement d'URL backend = rebuild image frontend | Envisager API Gateway ou variable injectée au runtime via nginx |
| Pas de health check timeout étendu | Cold start Spring Boot (~12s) peut causer des timeouts de health check | Ajouter `--min-instances=1` pour `svc-tournee` et `svc-supervision` si cold starts fréquents |
| WebSocket STOMP (`/ws/**`) | Non testé en production Cloud Run (Cloud Run supporte WebSocket mais configuration spécifique) | Tester les abonnements WebSocket en recette |

---

## 10. Commandes utiles de supervision

```bash
# État des services
gcloud run services list --region=europe-west1 --project=docupost-recette-prod

# Health checks
curl https://svc-tournee-llb4mq4zha-ew.a.run.app/actuator/health
curl https://svc-supervision-llb4mq4zha-ew.a.run.app/actuator/health

# Logs en temps réel (erreurs uniquement)
gcloud logging read \
  "resource.type=cloud_run_revision AND severity>=ERROR" \
  --project=docupost-recette-prod \
  --order=desc --limit=50

# Logs d'un service spécifique
gcloud logging read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=svc-supervision" \
  --project=docupost-recette-prod \
  --order=desc --limit=100

# Révisions déployées
gcloud run revisions list --service=svc-tournee --region=europe-west1 --project=docupost-recette-prod

# Rollback vers révision précédente
gcloud run services update-traffic svc-tournee \
  --to-revisions=[REVISION_ID]=100 \
  --region=europe-west1 --project=docupost-recette-prod
```
