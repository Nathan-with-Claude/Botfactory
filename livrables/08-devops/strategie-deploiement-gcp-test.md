# Stratégie de déploiement — Environnements de test sur Google Cloud Platform

> Document autonome — Version 1.0 — 2026-04-05
> Produit par @devops à partir de :
> - `/livrables/00-contexte/infrastructure-locale.md` (stack locale)
> - `/livrables/04-architecture-technique/architecture-applicative.md` (stack cible)
> - `/livrables/00-contexte/journaux/journal-devops.md` (contexte CI/CD)
>
> Ce document décrit la démarche complète pour déployer les environnements
> de test DocuPost sur Google Cloud Platform (GCP).
> Il est conçu pour être suivi pas-à-pas par un ingénieur sans connaissance
> préalable de l'historique de la chaîne DevOps DocuPost.

---

## 1. Vue d'ensemble — Architecture cible sur GCP

### Environnements ciblés

| Environnement | Objectif | Audience | Branche Git |
|---------------|----------|----------|-------------|
| `integration` | Valider les intégrations BC-to-BC après merge | Développeurs, CI | `develop` |
| `recette` | Tests QA formels, validation fonctionnelle | QA, PO | `release/*` |
| `staging` | Répétition générale avant prod, tests de charge | DevOps, PO | `main` (pré-merge) |

> L'environnement `prod` est hors scope de ce document.
> La production est déployée séparément avec validation manuelle.

### Services DocuPost à déployer par environnement

| Service | Port local | Criticité | Environnements |
|---------|-----------|-----------|---------------|
| `api-gateway` | — | Critique | integration, recette, staging |
| `svc-tournee` | 8081 | Haute | integration, recette, staging |
| `svc-supervision` | 8082 | Haute | integration, recette, staging |
| `svc-preuves` | — | Haute | integration, recette, staging |
| `svc-notification` | — | Haute | recette, staging |
| `svc-integration-oms` | — | Haute | recette, staging |
| `svc-identite` (Keycloak) | — | Critique | integration, recette, staging |
| `frontend-supervision` | 3000 | Haute | recette, staging |
| `app-mobile` (Expo Web) | 8084 | — | recette |
| PostgreSQL (x4 databases) | — | Critique | integration, recette, staging |
| Stockage objets (preuves) | — | Haute | recette, staging |

### Schéma réseau cible sur GCP

```
Internet
    │
    ▼
Cloud Load Balancer (HTTPS)
    │  TLS terminé ici
    ▼
Cloud Run — api-gateway
    │
    ├── Cloud Run — svc-tournee
    ├── Cloud Run — svc-supervision
    ├── Cloud Run — svc-preuves
    ├── Cloud Run — svc-notification
    ├── Cloud Run — svc-integration-oms
    ├── Cloud Run — svc-identite (Keycloak)
    ├── Cloud Run — frontend-supervision (React)
    └── Cloud Run — app-mobile (Expo Web)
             │
             ▼
     VPC privé (accès restreint)
             │
    ┌────────┴────────┐
    ▼                 ▼
Cloud SQL           Cloud Storage
(PostgreSQL 16)     (preuves, photos,
4 instances         signatures)
```

---

## 2. Prérequis

### Compte et facturation GCP

- Un projet GCP par environnement est recommandé pour l'isolation stricte.
  Alternative acceptable pour MVP : un projet GCP unique avec namespaces.
- Facturation activée sur le compte GCP.
- Droits de création de projet ou accès à un projet existant.

### Outils CLI à installer sur la machine de déploiement

```bash
# Google Cloud SDK (inclut gcloud, gsutil, bq)
curl https://sdk.cloud.google.com | bash
gcloud init

# Terraform (infrastructure as code)
# https://developer.hashicorp.com/terraform/install
terraform --version   # >= 1.7 requis

# Docker (build des images)
docker --version      # >= 24.0 requis

# kubectl (interaction avec clusters si besoin GKE)
gcloud components install kubectl

# Vérification
gcloud version
terraform version
docker version
```

### Permissions IAM requises sur le compte opérateur

L'opérateur qui déploie doit posséder les rôles suivants sur le projet GCP :

| Rôle GCP | Usage |
|----------|-------|
| `roles/run.admin` | Déploiement Cloud Run |
| `roles/cloudsql.admin` | Création instances Cloud SQL |
| `roles/storage.admin` | Création buckets Cloud Storage |
| `roles/secretmanager.admin` | Gestion des secrets |
| `roles/iam.serviceAccountAdmin` | Création des service accounts |
| `roles/compute.networkAdmin` | Configuration VPC et règles pare-feu |
| `roles/monitoring.admin` | Configuration alertes et dashboards |
| `roles/artifactregistry.admin` | Push images Docker |
| `roles/dns.admin` | Configuration Cloud DNS |

> Pour un MVP, le rôle `roles/editor` peut être utilisé temporairement.
> Il doit être remplacé par des rôles granulaires avant de passer en staging.

---

## 3. Choix de services GCP — Justification

| Besoin DocuPost | Service GCP choisi | Justification |
|----------------|-------------------|---------------|
| Exécution des services Spring Boot | **Cloud Run** | Sans serveur, facturation à l'usage, démarrage rapide. Adapté aux 7-10 microservices du MVP sans surcharge opérationnelle Kubernetes. |
| Base de données PostgreSQL 16 | **Cloud SQL (PostgreSQL)** | Managé, sauvegardes automatiques, compatibilité exacte avec la stack locale. |
| Stockage des preuves (photos, signatures) | **Cloud Storage** | Compatible S3 API (HMAC keys), utilisé par svc-preuves déjà configuré pour S3-compatible. |
| Secrets (DB passwords, JWT keys, FCM keys) | **Secret Manager** | Intégration native Cloud Run, rotation, audit. |
| Images Docker | **Artifact Registry** | Remplace Container Registry (déprécié). Régions EU disponibles. |
| Load balancer HTTPS | **Cloud Load Balancing + Cloud Armor** | TLS terminaison, certificats managés, protection DDoS de base. |
| DNS | **Cloud DNS** | Gestion des sous-domaines par environnement. |
| Réseau privé | **VPC** | Isolation des services backend — Cloud Run en mode VPC interne. |
| Logs centralisés | **Cloud Logging** | Collecte automatique des logs Cloud Run. |
| Métriques et alertes | **Cloud Monitoring** | Dashboards métriques, alertes email/PagerDuty. |
| CI/CD | **GitHub Actions** | Déjà choisi dans le pipeline DocuPost existant. |

> GKE (Kubernetes managé) n'est pas retenu pour les environnements de test :
> trop complexe et trop coûteux pour un MVP. À envisager si le nombre de services
> dépasse 15 ou si des besoins de scaling horizontal fin apparaissent en prod.

---

## 4. Démarche pas-à-pas

### Étape 1 — Initialisation du projet GCP

```bash
# Authentification
gcloud auth login

# Créer un projet par environnement (recommandé)
# Exemple pour recette :
gcloud projects create docupost-recette \
  --name="DocuPost Recette" \
  --labels=env=recette,app=docupost

# Activer la facturation (remplacer BILLING_ACCOUNT_ID)
gcloud billing projects link docupost-recette \
  --billing-account=BILLING_ACCOUNT_ID

# Définir le projet actif
gcloud config set project docupost-recette

# Activer les APIs nécessaires
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  storage.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com \
  compute.googleapis.com \
  dns.googleapis.com \
  monitoring.googleapis.com \
  logging.googleapis.com \
  cloudresourcemanager.googleapis.com \
  iam.googleapis.com
```

Répéter pour chaque environnement (`docupost-integration`, `docupost-recette`, `docupost-staging`).

---

### Étape 2 — Configuration IAM et service accounts

```bash
# Service account pour l'application DocuPost
gcloud iam service-accounts create docupost-app \
  --display-name="DocuPost Application" \
  --project=docupost-recette

# Permissions minimales pour l'app
gcloud projects add-iam-policy-binding docupost-recette \
  --member="serviceAccount:docupost-app@docupost-recette.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding docupost-recette \
  --member="serviceAccount:docupost-app@docupost-recette.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud projects add-iam-policy-binding docupost-recette \
  --member="serviceAccount:docupost-app@docupost-recette.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

# Service account pour GitHub Actions (CI/CD)
gcloud iam service-accounts create github-actions-cicd \
  --display-name="GitHub Actions CI/CD" \
  --project=docupost-recette

gcloud projects add-iam-policy-binding docupost-recette \
  --member="serviceAccount:github-actions-cicd@docupost-recette.iam.gserviceaccount.com" \
  --role="roles/run.developer"

gcloud projects add-iam-policy-binding docupost-recette \
  --member="serviceAccount:github-actions-cicd@docupost-recette.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding docupost-recette \
  --member="serviceAccount:github-actions-cicd@docupost-recette.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Générer la clé JSON pour GitHub Actions
gcloud iam service-accounts keys create ./github-actions-key.json \
  --iam-account=github-actions-cicd@docupost-recette.iam.gserviceaccount.com

# IMPORTANT : Stocker le contenu de github-actions-key.json
# dans GitHub Secrets → GCP_SA_KEY (voir Étape 6 CI/CD)
# Supprimer le fichier local immédiatement après.
rm ./github-actions-key.json
```

---

### Étape 3 — Provisionnement de l'infrastructure avec Terraform

Créer la structure Terraform dans le dépôt :

```
infra/
├── environments/
│   ├── integration/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── terraform.tfvars
│   ├── recette/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── terraform.tfvars
│   └── staging/
│       ├── main.tf
│       ├── variables.tf
│       └── terraform.tfvars
└── modules/
    ├── cloud-sql/
    ├── cloud-run-service/
    ├── cloud-storage/
    └── vpc/
```

**Fichier `infra/environments/recette/main.tf` (exemple complet) :**

```hcl
terraform {
  required_version = ">= 1.7"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
  backend "gcs" {
    bucket = "docupost-tf-state-recette"
    prefix = "terraform/state"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# ─── VPC ──────────────────────────────────────────────────────────────────────
resource "google_compute_network" "docupost_vpc" {
  name                    = "docupost-vpc-${var.env}"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "docupost_subnet" {
  name          = "docupost-subnet-${var.env}"
  ip_cidr_range = "10.10.0.0/24"
  region        = var.region
  network       = google_compute_network.docupost_vpc.id
}

# ─── Cloud SQL ────────────────────────────────────────────────────────────────
resource "google_sql_database_instance" "postgres_tournee" {
  name             = "docupost-tournee-${var.env}"
  database_version = "POSTGRES_16"
  region           = var.region

  settings {
    tier              = "db-f1-micro"  # Coût minimal pour environnements de test
    availability_type = "ZONAL"        # Pas de HA pour les tests
    disk_size         = 10

    backup_configuration {
      enabled = false  # Désactiver pour les environnements de test
    }

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.docupost_vpc.id
    }
  }
  deletion_protection = false
}

resource "google_sql_database" "db_tournee" {
  name     = "docupost_tournee"
  instance = google_sql_database_instance.postgres_tournee.name
}

# Répéter pour db_preuves, db_supervision, db_events

# ─── Cloud Storage ────────────────────────────────────────────────────────────
resource "google_storage_bucket" "preuves" {
  name          = "docupost-preuves-${var.env}-${var.project_id}"
  location      = var.region
  force_destroy = true  # OK pour environnements de test uniquement

  lifecycle_rule {
    condition { age = 30 }  # Nettoyage auto après 30 jours
    action { type = "Delete" }
  }
}

# ─── Artifact Registry ────────────────────────────────────────────────────────
resource "google_artifact_registry_repository" "docupost" {
  location      = var.region
  repository_id = "docupost-${var.env}"
  format        = "DOCKER"
}

# ─── Secret Manager ───────────────────────────────────────────────────────────
resource "google_secret_manager_secret" "db_password_tournee" {
  secret_id = "db-password-tournee-${var.env}"
  replication {
    auto {}
  }
}
# Note : la valeur du secret est injectée manuellement ou via pipeline CI/CD
# Ne jamais mettre un mot de passe en clair dans un fichier Terraform.
```

**Fichier `infra/environments/recette/terraform.tfvars` :**

```hcl
project_id = "docupost-recette"
region     = "europe-west1"
env        = "recette"
```

**Initialisation et déploiement :**

```bash
# Créer le bucket de state Terraform
gsutil mb -l europe-west1 gs://docupost-tf-state-recette

# Initialisation
cd infra/environments/recette
terraform init

# Vérification
terraform plan

# Application
terraform apply -auto-approve
```

---

### Étape 4 — Déploiement des services applicatifs

#### 4.1 Build et push des images Docker

Chaque service Spring Boot doit avoir un `Dockerfile` à sa racine.

**Exemple `Dockerfile` pour un service Spring Boot :**

```dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Build et push :**

```bash
PROJECT_ID="docupost-recette"
REGION="europe-west1"
ENV="recette"
REGISTRY="${REGION}-docker.pkg.dev/${PROJECT_ID}/docupost-${ENV}"

# Authentification Docker → Artifact Registry
gcloud auth configure-docker ${REGION}-docker.pkg.dev

# Build et push de svc-tournee
cd src/backend/svc-tournee
mvn clean package -DskipTests
docker build -t ${REGISTRY}/svc-tournee:latest .
docker push ${REGISTRY}/svc-tournee:latest

# Répéter pour svc-supervision, svc-preuves, svc-notification,
# svc-integration-oms, api-gateway, svc-identite
```

#### 4.2 Déploiement Cloud Run des services backend

```bash
PROJECT_ID="docupost-recette"
REGION="europe-west1"
ENV="recette"
REGISTRY="${REGION}-docker.pkg.dev/${PROJECT_ID}/docupost-${ENV}"
SA="docupost-app@${PROJECT_ID}.iam.gserviceaccount.com"
VPC_CONNECTOR="docupost-vpc-connector-${ENV}"

# Créer le VPC connector pour accéder à Cloud SQL depuis Cloud Run
gcloud compute networks vpc-access connectors create ${VPC_CONNECTOR} \
  --region=${REGION} \
  --subnet=docupost-subnet-${ENV}

# Déploiement svc-tournee
gcloud run deploy svc-tournee \
  --image=${REGISTRY}/svc-tournee:latest \
  --region=${REGION} \
  --platform=managed \
  --no-allow-unauthenticated \
  --service-account=${SA} \
  --vpc-connector=${VPC_CONNECTOR} \
  --vpc-egress=private-ranges-only \
  --set-secrets="SPRING_DATASOURCE_PASSWORD=db-password-tournee-${ENV}:latest" \
  --set-env-vars="SPRING_PROFILES_ACTIVE=${ENV},SPRING_DATASOURCE_URL=jdbc:postgresql://10.10.0.X:5432/docupost_tournee" \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=3 \
  --port=8081

# Répéter pour chaque service en ajustant port, secrets et variables
```

#### 4.3 Déploiement du frontend supervision (React)

```bash
# Build de l'image React
cd src/web/supervision
docker build -t ${REGISTRY}/frontend-supervision:latest \
  --build-arg REACT_APP_API_URL=https://api-gateway-${ENV}-HASH-ew.a.run.app .
docker push ${REGISTRY}/frontend-supervision:latest

# Déploiement Cloud Run
gcloud run deploy frontend-supervision \
  --image=${REGISTRY}/frontend-supervision:latest \
  --region=${REGION} \
  --platform=managed \
  --allow-unauthenticated \
  --port=3000 \
  --memory=256Mi \
  --min-instances=0 \
  --max-instances=2
```

#### 4.4 Déploiement Keycloak (svc-identite)

Keycloak nécessite une configuration spécifique :

```bash
# Utiliser l'image officielle Keycloak
gcloud run deploy svc-identite \
  --image=quay.io/keycloak/keycloak:24.0 \
  --region=${REGION} \
  --no-allow-unauthenticated \
  --service-account=${SA} \
  --vpc-connector=${VPC_CONNECTOR} \
  --set-env-vars="KC_PROXY=edge,KC_DB=postgres,KC_DB_URL=jdbc:postgresql://10.10.0.X:5432/keycloak,KC_HOSTNAME_STRICT=false,KC_HTTP_ENABLED=true" \
  --set-secrets="KC_DB_PASSWORD=keycloak-db-password-${ENV}:latest,KEYCLOAK_ADMIN_PASSWORD=keycloak-admin-password-${ENV}:latest" \
  --args="start" \
  --memory=1Gi \
  --cpu=1 \
  --min-instances=1 \
  --max-instances=2 \
  --port=8080
```

> Keycloak doit avoir `min-instances=1` pour éviter les cold starts
> qui bloqueraient l'authentification de tous les autres services.

---

### Étape 5 — Configuration réseau, DNS et HTTPS

#### 5.1 DNS et certificats

```bash
# Créer une zone DNS Cloud DNS
gcloud dns managed-zones create docupost-test \
  --dns-name="test.docupost.docaposte.fr." \
  --description="DocuPost environnements de test"

# Sous-domaines par environnement
# recette.test.docupost.docaposte.fr → Load Balancer
# staging.test.docupost.docaposte.fr → Load Balancer
# api-recette.test.docupost.docaposte.fr → api-gateway Cloud Run

# Cloud Run génère des URLs automatiques pour les tests sans DNS personnalisé :
# https://[service]-[hash]-ew.a.run.app
# Ces URLs sont suffisantes pour les environnements integration et recette.
```

#### 5.2 Mapping de domaines personnalisés sur Cloud Run

```bash
# Ajouter un domaine personnalisé à Cloud Run
gcloud run domain-mappings create \
  --service=frontend-supervision \
  --domain=supervision-recette.test.docupost.docaposte.fr \
  --region=${REGION}

# Cloud Run fournit les enregistrements DNS à ajouter dans Cloud DNS
gcloud run domain-mappings describe \
  --domain=supervision-recette.test.docupost.docaposte.fr \
  --region=${REGION}
```

Les certificats TLS sont gérés automatiquement par Cloud Run via Google-managed certificates.

---

### Étape 6 — Gestion des secrets avec Secret Manager

#### 6.1 Créer les secrets

```bash
ENV="recette"

# Mot de passe base de données svc-tournee
echo -n "$(openssl rand -base64 32)" | \
  gcloud secrets create db-password-tournee-${ENV} \
  --data-file=- --replication-policy=automatic

# JWT signing key
echo -n "$(openssl rand -base64 64)" | \
  gcloud secrets create jwt-signing-key-${ENV} \
  --data-file=- --replication-policy=automatic

# Clé Firebase Cloud Messaging (copier depuis console Firebase)
gcloud secrets create fcm-server-key-${ENV} \
  --replication-policy=automatic
# Puis injecter la valeur :
# gcloud secrets versions add fcm-server-key-${ENV} --data-file=./fcm-key.json

# Identifiants OMS (clé API ou certificat mTLS)
gcloud secrets create oms-api-key-${ENV} \
  --replication-policy=automatic
```

#### 6.2 Référencer les secrets dans Cloud Run

```bash
# Les secrets sont montés via --set-secrets au déploiement :
# FORMAT : ENV_VAR_NAME=SECRET_NAME:VERSION

--set-secrets="\
  SPRING_DATASOURCE_PASSWORD=db-password-tournee-${ENV}:latest,\
  JWT_SECRET=jwt-signing-key-${ENV}:latest,\
  FCM_SERVER_KEY=fcm-server-key-${ENV}:latest"
```

---

### Étape 7 — Monitoring de base (Cloud Monitoring et Cloud Logging)

#### 7.1 Dashboards Cloud Monitoring

```bash
# Les métriques Cloud Run sont disponibles automatiquement :
# run.googleapis.com/request_count
# run.googleapis.com/request_latencies
# run.googleapis.com/container/instance_count

# Créer un dashboard JSON (exemple minimal) :
cat > dashboard-docupost.json << 'EOF'
{
  "displayName": "DocuPost — Recette",
  "mosaicLayout": {
    "columns": 12,
    "tiles": [
      {
        "xPos": 0, "yPos": 0, "width": 6, "height": 4,
        "widget": {
          "title": "Requêtes / minute — api-gateway",
          "xyChart": {
            "dataSets": [{
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"api-gateway\" AND metric.type=\"run.googleapis.com/request_count\""
                }
              }
            }]
          }
        }
      }
    ]
  }
}
EOF

gcloud monitoring dashboards create --config-from-file=dashboard-docupost.json
```

#### 7.2 Alertes critiques

```bash
# Alerte sur taux d'erreur 5xx > 5% sur api-gateway
# (configurer via la console Cloud Monitoring ou via Terraform)

# Alerte sur latence P99 > 3 secondes
# Alerte sur nombre d'instances svc-identite (Keycloak) = 0
#   → critique : blocage de toute authentification

# Alertes sur les Domain Events (via logs structurés) :
# Filtrer les logs JSON contenant "eventType": "IncidentDeclare"
# et déclencher une alerte si rate > seuil en 5 minutes
```

#### 7.3 Logging structuré depuis les services Spring Boot

Configurer chaque service Spring Boot pour émettre des logs JSON :

```yaml
# application-recette.yml (extrait)
logging:
  structured:
    format:
      console: json
  level:
    root: INFO
    fr.docaposte.docupost: DEBUG

# Chaque Domain Event publié DOIT inclure dans son log :
# - aggregateId
# - eventType
# - timestamp
# - userId (si applicable)
```

Cloud Run collecte automatiquement les logs JSON de stdout et les indexe dans Cloud Logging.

---

## 5. Environnements — Détail et différences

| Paramètre | `integration` | `recette` | `staging` |
|-----------|--------------|-----------|-----------|
| Cloud SQL tier | `db-f1-micro` | `db-g1-small` | `db-n1-standard-1` |
| Cloud Run min-instances | 0 (cold start ok) | 0 | 1 (warm) |
| Keycloak min-instances | 0 | 1 | 1 |
| Sauvegardes Cloud SQL | Non | Non | Oui (quotidien) |
| Données de test | Seed auto à chaque déploiement | Jeu de données QA fixe | Clone anonymisé recette |
| Accès réseau | Développeurs seulement | Développeurs + QA + PO | DevOps + PO (validation) |
| Nettoyage automatique | Après merge PR (cleanup job) | Hebdomadaire | Manuel |
| Coût estimé / mois | ~15 € | ~35 € | ~60 € |

### Gestion des données de test

```bash
# Script de seed pour l'environnement recette
# À lancer après chaque déploiement via GitHub Actions

# Connexion à Cloud SQL via Cloud SQL Auth Proxy
cloud-sql-proxy docupost-recette:europe-west1:docupost-tournee-recette &
PROXY_PID=$!

# Attendre que le proxy soit prêt
sleep 5

# Appliquer les migrations Flyway (incluses dans le démarrage Spring Boot)
# Puis insérer les données de seed :
psql -h 127.0.0.1 -U docupost_app -d docupost_tournee \
  -f src/backend/svc-tournee/src/test/resources/data-recette.sql

kill $PROXY_PID
```

---

## 6. Intégration CI/CD — GitHub Actions

### Workflow de déploiement vers recette

Créer `.github/workflows/deploy-recette.yml` :

```yaml
name: Deploy to Recette

on:
  push:
    branches: [release/**]
  workflow_dispatch:
    inputs:
      service:
        description: 'Service à déployer (all / svc-tournee / svc-supervision / ...)'
        required: false
        default: 'all'

env:
  PROJECT_ID: docupost-recette
  REGION: europe-west1
  ENV: recette

jobs:
  # ─── Tests avant déploiement ───────────────────────────────────────────────
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'

      - name: Run domain tests
        run: |
          # Tests domain layer en premier (rapides, sans dépendance externe)
          for service in svc-tournee svc-supervision svc-preuves svc-notification svc-integration-oms; do
            echo "=== Tests domain: $service ==="
            cd src/backend/$service
            mvn test -pl domain -Dtest="*DomainTest,*AggregateTest"
            cd ../../../
          done

      - name: Run integration tests
        run: |
          for service in svc-tournee svc-supervision svc-preuves; do
            echo "=== Tests intégration: $service ==="
            cd src/backend/$service
            mvn verify -Dspring.profiles.active=test
            cd ../../../
          done

  # ─── Build et push images ──────────────────────────────────────────────────
  build-and-push:
    runs-on: ubuntu-latest
    needs: test
    permissions:
      contents: read
      id-token: write

    steps:
      - uses: actions/checkout@v4

      - name: Authenticate to GCP
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY_RECETTE }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Configure Docker
        run: gcloud auth configure-docker ${{ env.REGION }}-docker.pkg.dev

      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'

      - name: Build and push all services
        run: |
          REGISTRY="${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/docupost-${{ env.ENV }}"
          SHORT_SHA="${GITHUB_SHA::8}"

          for service in svc-tournee svc-supervision svc-preuves svc-notification svc-integration-oms api-gateway; do
            echo "=== Build $service ==="
            cd src/backend/$service
            mvn clean package -DskipTests
            docker build -t ${REGISTRY}/${service}:${SHORT_SHA} \
                         -t ${REGISTRY}/${service}:latest .
            docker push ${REGISTRY}/${service}:${SHORT_SHA}
            docker push ${REGISTRY}/${service}:latest
            cd ../../../
          done

          # Build frontend
          cd src/web/supervision
          docker build -t ${REGISTRY}/frontend-supervision:${SHORT_SHA} \
                       -t ${REGISTRY}/frontend-supervision:latest \
                       --build-arg REACT_APP_API_URL=https://api-gateway-${{ env.ENV }}-HASH-ew.a.run.app .
          docker push ${REGISTRY}/frontend-supervision:${SHORT_SHA}
          docker push ${REGISTRY}/frontend-supervision:latest

  # ─── Déploiement Cloud Run ─────────────────────────────────────────────────
  deploy:
    runs-on: ubuntu-latest
    needs: build-and-push
    environment: recette

    steps:
      - uses: actions/checkout@v4

      - name: Authenticate to GCP
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY_RECETTE }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Deploy services to Cloud Run
        run: |
          REGISTRY="${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/docupost-${{ env.ENV }}"
          SA="docupost-app@${{ env.PROJECT_ID }}.iam.gserviceaccount.com"
          VPC="docupost-vpc-connector-${{ env.ENV }}"

          # Ordre de déploiement : identité d'abord, puis gateway, puis services
          DEPLOY_ORDER="svc-identite api-gateway svc-tournee svc-supervision svc-preuves svc-notification svc-integration-oms frontend-supervision"

          for service in $DEPLOY_ORDER; do
            echo "=== Déploiement $service ==="
            gcloud run deploy $service \
              --image=${REGISTRY}/${service}:latest \
              --region=${{ env.REGION }} \
              --platform=managed \
              --no-allow-unauthenticated \
              --service-account=${SA} \
              --vpc-connector=${VPC} \
              --project=${{ env.PROJECT_ID }}
          done

      - name: Health check post-déploiement
        run: |
          for service in svc-tournee svc-supervision api-gateway; do
            URL=$(gcloud run services describe $service \
              --region=${{ env.REGION }} \
              --format='value(status.url)' \
              --project=${{ env.PROJECT_ID }})
            echo "Health check $service: $URL/actuator/health"
            HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
              -H "Authorization: Bearer $(gcloud auth print-identity-token)" \
              "${URL}/actuator/health")
            if [ "$HTTP_STATUS" != "200" ]; then
              echo "ERREUR: $service health check failed (HTTP $HTTP_STATUS)"
              exit 1
            fi
            echo "$service OK"
          done

      - name: Notify on failure
        if: failure()
        run: |
          echo "Déploiement recette ÉCHOUÉ — déclencher rollback si nécessaire"
          # Intégrer une notification Slack/Teams ici
```

### Secrets GitHub à configurer

```
GCP_SA_KEY_RECETTE     → contenu JSON du service account github-actions-cicd (recette)
GCP_SA_KEY_STAGING     → contenu JSON du service account github-actions-cicd (staging)
GCP_SA_KEY_INTEGRATION → contenu JSON du service account github-actions-cicd (integration)
```

---

## 7. Checklist de mise en service

### Avant le premier déploiement

- [ ] Compte GCP créé et facturation activée
- [ ] Projets GCP créés (`docupost-integration`, `docupost-recette`, `docupost-staging`)
- [ ] APIs GCP activées sur chaque projet
- [ ] Service accounts créés et permissions attribuées
- [ ] Clés JSON des service accounts stockées dans GitHub Secrets
- [ ] Bucket Terraform state créé (`docupost-tf-state-[env]`)
- [ ] Terraform `init` et `plan` validés sans erreur
- [ ] Terraform `apply` exécuté avec succès

### Infrastructure

- [ ] VPC et sous-réseau créés
- [ ] VPC connector créé (Cloud Run → Cloud SQL)
- [ ] Instances Cloud SQL créées et accessibles depuis le VPC
- [ ] Bucket Cloud Storage créé (pour les preuves)
- [ ] Artifact Registry créé et accessible
- [ ] Secrets créés dans Secret Manager (DB passwords, JWT key, FCM key, OMS key)

### Services applicatifs

- [ ] Images Docker buildées et poussées dans Artifact Registry
- [ ] svc-identite (Keycloak) déployé et health check OK
- [ ] api-gateway déployé et health check OK
- [ ] svc-tournee déployé et health check OK (`/actuator/health`)
- [ ] svc-supervision déployé et health check OK (`/actuator/health`)
- [ ] svc-preuves déployé et health check OK
- [ ] svc-notification déployé et health check OK
- [ ] svc-integration-oms déployé et health check OK
- [ ] frontend-supervision déployé et accessible HTTPS

### Réseau et sécurité

- [ ] Tous les services backend configurés `--no-allow-unauthenticated`
- [ ] Seul api-gateway est accessible depuis Internet
- [ ] TLS actif sur tous les endpoints publics (certificat Google-managed)
- [ ] Sous-domaines DNS configurés (si domaine personnalisé)

### Monitoring

- [ ] Dashboard Cloud Monitoring créé
- [ ] Alertes email configurées pour taux d'erreur 5xx > 5%
- [ ] Alerte configurée si svc-identite instances = 0
- [ ] Logs structurés JSON visibles dans Cloud Logging

### Validation fonctionnelle

- [ ] Login OAuth2 via Keycloak fonctionnel (livreur + superviseur)
- [ ] API svc-tournee : GET /tournees renvoie HTTP 200
- [ ] Upload preuve (photo) vers Cloud Storage fonctionnel
- [ ] WebSocket supervision temps réel fonctionnel
- [ ] Données de seed chargées correctement

---

## 8. Coûts estimatifs et optimisation

### Estimation mensuelle par environnement (région europe-west1)

| Composant | Integration | Recette | Staging |
|-----------|------------|---------|---------|
| Cloud Run (8 services × usage modéré) | ~5 € | ~12 € | ~20 € |
| Cloud SQL db-f1-micro × 4 | ~25 € | — | — |
| Cloud SQL db-g1-small × 4 | — | ~55 € | — |
| Cloud SQL db-n1-standard-1 × 4 | — | — | ~120 € |
| Cloud Storage (preuves tests) | ~0,50 € | ~1 € | ~2 € |
| Artifact Registry (images Docker) | ~2 € (partagé) | | |
| Réseau sortant, Load Balancer | ~3 € | ~5 € | ~8 € |
| Secret Manager | < 1 € | < 1 € | < 1 € |
| **Total estimé / mois** | **~36 €** | **~74 €** | **~151 €** |

> Ces estimations supposent une utilisation modérée (heures ouvrées, pas de charge soutenue).
> Pour des environnements allumés en continu 24h/24, multiplier par 1,5.

### Optimisations pour réduire les coûts des environnements de test

1. **Extinction automatique la nuit et le week-end** : les instances Cloud Run descendent à 0 avec `min-instances=0`. Cloud SQL peut être arrêté via scheduler.

   ```bash
   # Arrêter Cloud SQL hors heures ouvrées (script à cron-iser)
   gcloud sql instances patch docupost-tournee-recette --activation-policy=NEVER
   # Redémarrer le matin
   gcloud sql instances patch docupost-tournee-recette --activation-policy=ALWAYS
   ```

2. **Cloud Scheduler pour l'extinction** :

   ```bash
   # Éteindre Cloud SQL recette à 20h00 du lundi au vendredi
   gcloud scheduler jobs create http stop-cloudsql-recette \
     --schedule="0 20 * * 1-5" \
     --uri="https://sqladmin.googleapis.com/sql/v1beta4/projects/docupost-recette/instances/docupost-tournee-recette" \
     --message-body='{"settings":{"activationPolicy":"NEVER"}}' \
     --oauth-service-account-email=docupost-app@docupost-recette.iam.gserviceaccount.com

   # Rallumer à 7h00
   gcloud scheduler jobs create http start-cloudsql-recette \
     --schedule="0 7 * * 1-5" \
     --uri="https://sqladmin.googleapis.com/sql/v1beta4/projects/docupost-recette/instances/docupost-tournee-recette" \
     --message-body='{"settings":{"activationPolicy":"ALWAYS"}}' \
     --oauth-service-account-email=docupost-app@docupost-recette.iam.gserviceaccount.com
   ```

3. **Tiers Cloud SQL** : utiliser `db-f1-micro` pour integration, ne monter en tier qu'en staging.
4. **Partager Artifact Registry** entre les environnements (une seule instance dans un projet central).
5. **Budget GCP** : configurer une alerte budget à 80 % du budget mensuel autorisé.

   ```bash
   # Via console GCP → Facturation → Budgets et alertes
   # Seuil recommandé : 80 % → alerte email
   # Seuil : 100 % → alerte email + Slack
   ```

---

## 9. Points d'attention et risques

### Risques identifiés

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Cold start Keycloak bloque l'authentification en recette | Haute | Bloquant | Forcer `min-instances=1` sur svc-identite, toujours. |
| Coût Cloud SQL sous-estimé si tests de charge | Moyenne | Moyen | Utiliser `db-f1-micro` uniquement, activer les alertes de budget. |
| Secrets exposés dans les logs Spring Boot au démarrage | Haute | Critique | Vérifier que `logging.level.org.springframework.boot.actuate=INFO` — ne jamais logger les `Environment`. |
| Connectivité VPC Cloud Run → Cloud SQL défaillante | Faible | Bloquant | Valider le VPC connector avec un test de connexion avant déploiement des services. |
| Images Docker de taille excessive (JAR + JRE complet) | Haute | Moyen | Utiliser `eclipse-temurin:21-jre-alpine` (JRE seul). Viser < 300 Mo par image. |
| OMS (système externe) inaccessible depuis GCP recette | Moyenne | Moyen | Configurer un mock OMS (WireMock) pour les environnements integration et recette. |
| Données personnelles dans les jeux de tests | Moyenne | Critique (RGPD) | Anonymiser tous les jeux de données avant import. Ne jamais utiliser de données prod réelles. |

### Contraintes spécifiques DocuPost rappelées

- **Fenêtre de maintenance interdite** : 05h45 → 07h15 (préparation tournées).
  Ne planifier aucun déploiement ou redémarrage Cloud SQL dans ce créneau,
  même en environnement de test (les QA peuvent tester dès 6h00).
- **svc-identite doit démarrer en premier** : l'ordre de déploiement dans le pipeline
  CI/CD doit respecter : `svc-identite → api-gateway → services métier`.
- **Rejeu offline** : les tests de synchronisation offline (US-056, US-060) nécessitent
  un environnement recette stable. Ne pas redéployer pendant une session de test QA
  sans prévenir l'équipe QA.

### Recommandations pour la suite

1. Une fois les environnements de test stables, documenter la procédure de déploiement
   en production dans `/livrables/08-devops/strategie-deploiement.md`.
2. Ajouter un workflow GitHub Actions de **rollback automatique** sur détection
   d'erreur health check post-déploiement.
3. Envisager **Workload Identity Federation** pour remplacer les clés JSON
   des service accounts dans GitHub Actions (plus sécurisé, sans clé à rotation).
4. Configurer un **mock OMS** (WireMock Cloud Run) pour l'environnement integration
   afin de tester svc-integration-oms sans dépendance au SI Docaposte.

---

## Annexe — Commandes de diagnostic rapide

```bash
# Lister les services Cloud Run déployés
gcloud run services list --region=europe-west1 --project=docupost-recette

# Voir les logs d'un service en temps réel
gcloud logging tail \
  "resource.type=cloud_run_revision AND resource.labels.service_name=svc-tournee" \
  --project=docupost-recette

# Vérifier le statut d'une instance Cloud SQL
gcloud sql instances describe docupost-tournee-recette --project=docupost-recette

# Se connecter à Cloud SQL via proxy pour débogage
cloud-sql-proxy docupost-recette:europe-west1:docupost-tournee-recette --port=5433 &
psql -h 127.0.0.1 -p 5433 -U docupost_app -d docupost_tournee

# Voir les secrets disponibles
gcloud secrets list --project=docupost-recette

# Consulter les métriques d'un service Cloud Run
gcloud monitoring metrics list \
  --filter="metric.type:run.googleapis.com" \
  --project=docupost-recette
```
