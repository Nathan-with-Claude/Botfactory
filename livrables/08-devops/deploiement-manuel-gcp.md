# Déploiement manuel sur GCP — DocuPost Recette

> Document opérationnel — Version 1.0 — 2026-04-07
> Source de vérité infrastructure : `/livrables/00-contexte/infrastructure-locale.md`
>
> Ce document décrit comment déclencher un déploiement sur GCP **sans connexion GitHub**.
> Le déploiement est lancé manuellement via `gcloud builds submit` depuis la machine locale.

---

## Variables de référence

```bash
GCP_PROJECT_ID="docupost-recette-prod"
GCP_REGION="europe-west1"
GCP_REPO="docupost"
```

---

## Prérequis

```bash
# Vérifier que gcloud est configuré sur le bon projet
gcloud config get-value project
# → doit afficher : docupost-recette-prod

# Si ce n'est pas le cas :
gcloud config set project docupost-recette-prod
gcloud auth login

# Configurer Docker vers Artifact Registry (une seule fois)
gcloud auth configure-docker europe-west1-docker.pkg.dev
```

---

## Déploiement complet (build + push + deploy)

Depuis la **racine du projet** (`/home/admin/Botfactory` ou `c:/Github/Botfactory`) :

```bash
TAG=$(git rev-parse --short HEAD)
/home/admin/google-cloud-sdk/bin/gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions=_TAG=${TAG} \
  --project=docupost-recette-prod
```

> **Note** : `gcloud` n'est pas dans le PATH par défaut — utiliser le chemin complet `/home/admin/google-cloud-sdk/bin/gcloud` ou sourcer le SDK avant (`source /home/admin/google-cloud-sdk/path.bash.inc`).
> `$_TAG` est la substitution utilisée pour tagger les images Docker. Sans `--substitutions`, le tag vaut `latest` (valeur par défaut dans `cloudbuild.yaml`).

Cela déclenche Cloud Build qui :
1. Build les images Docker des 3 services
2. Push les images dans Artifact Registry (`europe-west1-docker.pkg.dev/docupost-recette-prod/docupost/`)
3. Déploie chaque service sur Cloud Run

Durée estimée : 8–15 minutes.

---

## Déploiement d'un seul service (re-déploiement rapide)

Si tu veux redéployer uniquement un service sans rebuild :

```bash
# Récupérer le SHA de la dernière image buildée
LATEST_SHA=$(gcloud artifacts docker images list \
  europe-west1-docker.pkg.dev/docupost-recette-prod/docupost/svc-tournee \
  --sort-by="~UPDATE_TIME" --limit=1 --format="value(tags)" \
  --project=docupost-recette-prod)

# Redéployer svc-tournee
gcloud run deploy svc-tournee \
  --image=europe-west1-docker.pkg.dev/docupost-recette-prod/docupost/svc-tournee:${LATEST_SHA} \
  --region=europe-west1 \
  --project=docupost-recette-prod
```

Remplacer `svc-tournee` par `svc-supervision` ou `frontend-supervision` selon le besoin.

---

## Build local + push manuel (sans Cloud Build)

Si tu préfères builder en local et pousser directement :

```bash
PROJECT_ID="docupost-recette-prod"
REGION="europe-west1"
REPO="docupost"
TAG=$(git rev-parse --short HEAD)

# Authentification Docker
gcloud auth configure-docker ${REGION}-docker.pkg.dev

# Build + push svc-tournee
docker build -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/svc-tournee:${TAG} \
  src/backend/svc-tournee
docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/svc-tournee:${TAG}

# Deploy sur Cloud Run
gcloud run deploy svc-tournee \
  --image=${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/svc-tournee:${TAG} \
  --region=${REGION} \
  --platform=managed \
  --allow-unauthenticated \
  --port=8081 \
  --set-secrets=SPRING_DATASOURCE_PASSWORD=db-password:latest \
  --set-env-vars=SPRING_PROFILES_ACTIVE=recette \
  --project=${PROJECT_ID}
```

Répéter pour `svc-supervision` (port 8082) et `frontend-supervision` (port 80).

---

## Suivi d'un build en cours

```bash
# Lister les builds récents
gcloud builds list --limit=5 --project=docupost-recette-prod

# Suivre les logs d'un build en temps réel
gcloud builds log [BUILD_ID] --stream --project=docupost-recette-prod
```

---

## Vérification post-déploiement

```bash
# Lister les services Cloud Run déployés
gcloud run services list --region=europe-west1 --project=docupost-recette-prod

# Obtenir l'URL d'un service
gcloud run services describe svc-tournee \
  --region=europe-west1 \
  --project=docupost-recette-prod \
  --format='value(status.url)'

# Health checks
SVC_TOURNEE_URL=$(gcloud run services describe svc-tournee \
  --region=europe-west1 --project=docupost-recette-prod --format='value(status.url)')
SVC_SUPERVISION_URL=$(gcloud run services describe svc-supervision \
  --region=europe-west1 --project=docupost-recette-prod --format='value(status.url)')

curl ${SVC_TOURNEE_URL}/actuator/health
curl ${SVC_SUPERVISION_URL}/actuator/health
```

---

## Checklist de validation complète

- [ ] `gcloud run services list` → 3 services visibles (svc-tournee, svc-supervision, frontend-supervision)
- [ ] `GET [URL_SVC_TOURNEE]/actuator/health` → `{"status":"UP"}`
- [ ] `GET [URL_SVC_SUPERVISION]/actuator/health` → `{"status":"UP"}`
- [ ] Frontend supervision accessible via son URL Cloud Run
- [ ] Logs sans erreur : `gcloud logging read "resource.type=cloud_run_revision" --limit=50 --project=docupost-recette-prod`

---

## Rollback

```bash
# Lister les révisions d'un service
gcloud run revisions list --service=svc-tournee \
  --region=europe-west1 --project=docupost-recette-prod

# Router 100% du trafic vers une révision précédente
gcloud run services update-traffic svc-tournee \
  --to-revisions=[REVISION_ID]=100 \
  --region=europe-west1 \
  --project=docupost-recette-prod
```

---

## Consulter les logs

```bash
# Logs Cloud Run temps réel
gcloud logging read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=svc-tournee" \
  --limit=100 \
  --project=docupost-recette-prod \
  --format="value(timestamp, textPayload)"

# Erreurs uniquement
gcloud logging read \
  "resource.type=cloud_run_revision AND severity>=ERROR" \
  --limit=50 \
  --project=docupost-recette-prod
```

---

## État des déploiements (2026-04-07)

| Service | Dernier tag déployé | Statut |
|---------|--------------------|----|
| `svc-tournee` | `49eb425f` | ✅ UP |
| `svc-supervision` | `49eb425f` | ✅ UP |
| `frontend-supervision` | `49eb425f` | ✅ UP |

## Prochains sujets

- [ ] Déployer Keycloak sur Cloud Run et configurer `SSO_JWK_SET_URI`
- [ ] Passer `ddl-auto: update` → Flyway pour les migrations de schéma
- [ ] Réduire `roles/editor` (Compute SA) → rôles granulaires avant staging
- [ ] Optionnel : extinction automatique Cloud SQL la nuit (réduction des coûts)
- [ ] Tester les WebSocket STOMP (`/ws/**`) en recette Cloud Run
