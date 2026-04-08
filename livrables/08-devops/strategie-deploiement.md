# Stratégie de déploiement DocuPost

> Version 1.1 — 2026-04-08
> Source de vérité infra : `/livrables/00-contexte/infrastructure-locale.md`
> As-built recette : `/livrables/08-devops/as-built-cloudrun-recette.md`

---

## 1. Environnements

| Env | Branche | Infra | Déclenchement | Profils Spring |
|-----|---------|-------|---------------|---------------|
| **dev** | `feature/*` | Local (H2) | Manuel (`mvn spring-boot:run`) | `dev` |
| **recette** | `feature/*`, `release/*` | Cloud Run GCP | Manuel (`gcloud builds submit`) | `prod,recette` |
| **staging** | `main` | Cloud Run GCP (à créer) | Trigger GitHub Actions (à configurer) | `prod` |
| **prod** | tag `vX.Y.Z` | Cloud Run GCP (à créer) | Approbation manuelle | `prod` |

> Pour le MVP, seuls les environnements `dev` et `recette` sont opérationnels.

---

## 2. Environnement recette — État actuel

### Services déployés (depuis 2026-04-07)

| Service | URL | Health |
|---------|-----|--------|
| `svc-tournee` | https://svc-tournee-llb4mq4zha-ew.a.run.app | `GET /actuator/health` → `{"status":"UP"}` |
| `svc-supervision` | https://svc-supervision-llb4mq4zha-ew.a.run.app | `GET /actuator/health` → `{"status":"UP"}` |
| `frontend-supervision` | https://frontend-supervision-llb4mq4zha-ew.a.run.app | HTTP 200 |

### Infrastructure GCP

| Ressource | Identifiant |
|-----------|------------|
| Projet | `docupost-recette-prod` |
| Région | `europe-west1` |
| Artifact Registry | `docupost` |
| Cloud SQL | `docupost-db` (PostgreSQL 15, db-f1-micro) |
| Bases | `docupost_tournee`, `docupost_supervision` |
| Secrets | `tournee-db-password`, `supervision-db-password`, `internal-secret` |

---

## 3. Procédure de déploiement recette

### 3.1 Prérequis

```bash
gcloud auth list          # vérifier le compte actif
gcloud config get-value project   # doit retourner docupost-recette-prod
```

### 3.2 Déploiement complet (3 services)

```bash
cd /chemin/vers/botfactory
TAG=$(git rev-parse --short HEAD)
gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions=_TAG=${TAG} \
  --project=docupost-recette-prod
```

### 3.3 Déploiement d'un seul service (mise à jour ciblée)

```bash
# Rebuild et redéploiement svc-supervision uniquement
TAG=$(git rev-parse --short HEAD)
gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions=_TAG=${TAG} \
  --project=docupost-recette-prod 2>&1 | \
  grep -E "build-svc-supervision|push-svc-supervision|deploy-svc-supervision"
```

> Alternatively, builder l'image localement et pousser directement :
> ```bash
> docker build -t europe-west1-docker.pkg.dev/docupost-recette-prod/docupost/svc-supervision:${TAG} src/backend/svc-supervision
> docker push europe-west1-docker.pkg.dev/docupost-recette-prod/docupost/svc-supervision:${TAG}
> gcloud run deploy svc-supervision \
>   --image=europe-west1-docker.pkg.dev/docupost-recette-prod/docupost/svc-supervision:${TAG} \
>   --region=europe-west1 --project=docupost-recette-prod
> ```

---

## 4. Stratégie de rollback

Cloud Run conserve les révisions précédentes — le rollback est quasi-instantané.

### 4.1 Rollback vers la révision précédente

```bash
# Lister les révisions
gcloud run revisions list \
  --service=svc-supervision \
  --region=europe-west1 \
  --project=docupost-recette-prod

# Basculer 100% du trafic vers une révision précédente
gcloud run services update-traffic svc-supervision \
  --to-revisions=[NOM_REVISION_PRECEDENTE]=100 \
  --region=europe-west1 \
  --project=docupost-recette-prod
```

### 4.2 Rollback de tous les services

```bash
for svc in svc-tournee svc-supervision frontend-supervision; do
  PREV=$(gcloud run revisions list \
    --service=$svc --region=europe-west1 \
    --project=docupost-recette-prod \
    --format="value(metadata.name)" \
    --sort-by="~metadata.creationTimestamp" \
    --limit=2 | tail -1)
  echo "Rollback $svc → $PREV"
  gcloud run services update-traffic $svc \
    --to-revisions=${PREV}=100 \
    --region=europe-west1 --project=docupost-recette-prod
done
```

### 4.3 Critères de déclenchement du rollback

| Signal | Action |
|--------|--------|
| `/actuator/health` retourne un statut autre que `UP` | Rollback immédiat |
| Taux d'erreur 5xx > 5% sur 5 minutes | Rollback immédiat |
| Cold start > 30s | Rollback + investigation |
| Perte de connectivité Cloud SQL | Rollback + investigation |

---

## 5. Fenêtre de maintenance interdite

> Aucun déploiement entre **05h45 et 07h15** (préparation tournées + départ livreurs).

---

## 6. Contraintes opérationnelles

| Contrainte | Impact |
|-----------|--------|
| `REACT_APP_API_URL` baked à la compilation | Changement URL backend = rebuild complet frontend |
| `ddl-auto: update` (Hibernate) | Migrations automatiques — risque si entité modifiée |
| `db-f1-micro` max 25 connexions | HikariCP limité à 3/service ; surveiller si > 3 instances |
| Cold start Spring Boot (~12s) | Ajouter `--min-instances=1` si cold starts fréquents |
| WebSocket STOMP non testé sur Cloud Run | Tester avant mise en production |

---

## 7. Provisionnement initial (premier déploiement)

Ces commandes ne sont à exécuter qu'une seule fois. L'environnement recette est déjà provisionné.

```bash
# Artifact Registry
gcloud artifacts repositories create docupost \
  --repository-format=docker \
  --location=europe-west1 \
  --project=docupost-recette-prod

# Cloud SQL
gcloud sql instances create docupost-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=europe-west1 \
  --project=docupost-recette-prod

# Bases de données
gcloud sql databases create docupost_tournee --instance=docupost-db --project=docupost-recette-prod
gcloud sql databases create docupost_supervision --instance=docupost-db --project=docupost-recette-prod

# Utilisateur DB
gcloud sql users create docupost \
  --instance=docupost-db \
  --password=[PASSWORD] \
  --project=docupost-recette-prod

# Secrets
echo -n "[TOURNEE_DB_PASSWORD]" | gcloud secrets create tournee-db-password --data-file=- --project=docupost-recette-prod
echo -n "[SUPERVISION_DB_PASSWORD]" | gcloud secrets create supervision-db-password --data-file=- --project=docupost-recette-prod
echo -n "[INTERNAL_SECRET]" | gcloud secrets create internal-secret --data-file=- --project=docupost-recette-prod

# IAM Cloud Build
CB_SA="830746169662@cloudbuild.gserviceaccount.com"
gcloud projects add-iam-policy-binding docupost-recette-prod --member="serviceAccount:${CB_SA}" --role="roles/run.admin"
gcloud projects add-iam-policy-binding docupost-recette-prod --member="serviceAccount:${CB_SA}" --role="roles/cloudsql.client"
gcloud projects add-iam-policy-binding docupost-recette-prod --member="serviceAccount:${CB_SA}" --role="roles/secretmanager.secretAccessor"
```

---

## 8. Évolutions prévues

- [ ] Trigger GitHub Actions sur `release/*` pour déploiement recette automatique
- [ ] Workload Identity Federation (supprimer les clés JSON SA)
- [ ] Environnement staging sur `main` avec tests smoke post-déploiement
- [ ] Blue/green deployment pour la prod
- [ ] Flyway pour les migrations de schéma (remplacer `ddl-auto: update`)
- [ ] Extinction automatique Cloud SQL la nuit et le week-end (réduction coûts)
- [ ] Déploiement APK Android (canal séparé, distribution interne Docaposte)
