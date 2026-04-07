# Infrastructure locale DocuPost — Référence partagée

> **Source de vérité unique** pour les ports, URLs et protocoles de démarrage.
> Tous les agents (dev, qa, devops, end-user…) doivent lire ce fichier
> avant de démarrer un service ou de référencer un port.
>
> **Quand un port change** : mettre à jour ce fichier uniquement.
> Ne jamais dupliquer ces informations dans un fichier d'agent.

---

## Registre des services

| Service | Rôle | Port local | Health check | Config |
|---------|------|-----------|-------------|--------|
| `svc-tournee` | Backend livreur (tournées, colis, livraisons) | **8081** | `GET /actuator/health` | `src/backend/svc-tournee` |
| `svc-supervision` | Backend superviseur (tableau de bord, planification) | **8082** | `GET /actuator/health` | `src/backend/svc-supervision` |
| `frontend-supervision` | Web React superviseur | **3000** | `GET /` | `src/web/supervision` |
| `expo-web` | App mobile livreur (Expo Web) | **8083** | `GET /` | `src/mobile` |

> Si un nouveau service est ajouté au projet, ajouter une ligne ici avant toute chose.

---

## Variables d'environnement requises

| Variable | Valeur | Scope |
|----------|--------|-------|
| `JAVA_HOME` | `C:/Program Files/Java/jdk-20` | Tous les services Java |
| `EXPO_PUBLIC_API_URL` | `http://localhost:8081` | App mobile (Expo) — svc-tournee |
| `EXPO_PUBLIC_SUPERVISION_URL` | `http://localhost:8082` | App mobile (Expo) — svc-supervision |
| `REACT_APP_API_URL` | `http://localhost:8082` | Frontend supervision |

---

## Protocoles de démarrage

### Démarrer un service Java (Spring Boot) — générique

```bash
SERVICE_DIR="c:/Github/Botfactory/src/backend/[svc-nom]"
SERVICE_PORT=[PORT]
LOG_FILE="/tmp/[svc-nom].log"

cd "$SERVICE_DIR"
JAVA_HOME="C:/Program Files/Java/jdk-20" \
  PATH="C:/Program Files/Java/jdk-20/bin:$PATH" \
  mvn spring-boot:run -Dspring-boot.run.profiles=dev \
  > "$LOG_FILE" 2>&1 &
SVC_PID=$!

# Health check (max 60s)
for i in $(seq 1 30); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    "http://localhost:${SERVICE_PORT}/actuator/health" 2>/dev/null)
  if [ "$STATUS" = "200" ]; then
    echo "[svc-nom] prêt sur le port ${SERVICE_PORT}"
    break
  fi
  sleep 2
done
```

### Démarrer le frontend supervision (port 3000)

```bash
cd c:/Github/Botfactory/src/web/supervision
REACT_APP_API_URL=http://localhost:8082 npm start > /tmp/supervision-front.log 2>&1 &
FRONT_PID=$!

for i in $(seq 1 15); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)
  if [ "$STATUS" = "200" ]; then echo "Frontend supervision prêt"; break; fi
  sleep 2
done
```

### Démarrer Expo Web — app mobile (port 8083)

```bash
cd c:/Github/Botfactory/src/mobile
EXPO_PUBLIC_API_URL=http://localhost:8081 \
  EXPO_PUBLIC_SUPERVISION_URL=http://localhost:8082 \
  npx expo start --web --port 8083 \
  > /tmp/expo.log 2>&1 &
EXPO_PID=$!

for i in $(seq 1 20); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8083 2>/dev/null)
  if [ "$STATUS" = "200" ]; then echo "Expo Web prêt"; break; fi
  sleep 3
done
```

### Arrêter proprement les services

```bash
# Tuer uniquement les PIDs démarrés dans la session courante
kill $SVC_PID $FRONT_PID $EXPO_PID 2>/dev/null || true
```

> **Ne jamais utiliser** `taskkill //F //IM java.exe` — cela tuerait tous les
> processus Java de la machine, pas seulement ceux du projet.
>
> Si un PID n'est plus disponible, libérer le port manuellement :
> ```bash
> # Trouver le PID occupant un port
> netstat -ano | findstr :[PORT]
> taskkill //PID [PID] //F
> ```

---

---

## Environnement recette GCP — État provisionné

> Provisionné le 2026-04-06. Projet GCP : **`docupost-recette-prod`** (europe-west1)

### Ressources créées

| Ressource | Nom / Identifiant | Statut |
|-----------|-------------------|--------|
| Projet GCP | `docupost-recette-prod` | ✓ actif |
| Artifact Registry | `docupost` (docker, europe-west1) | ✓ créé |
| Cloud SQL (PostgreSQL 15) | `docupost-db` (europe-west1) | ✓ créé |
| Base de données | `docupost_tournee` | ✓ créée |
| Base de données | `docupost_supervision` | ✓ créée |
| Utilisateur DB | `docupost` | ✓ créé |
| Secret Manager | `tournee-db-password` | ✓ créé |
| Secret Manager | `supervision-db-password` | ✓ créé |
| Secret Manager | `internal-secret` | ✓ créé |
| IAM Cloud Build | accès Cloud Run + Cloud SQL + Secrets | ✓ configuré |
| Dockerfiles | svc-tournee, svc-supervision, frontend-supervision | ✓ créés |
| cloudbuild.yaml | racine du projet | ✓ créé |

### Services Cloud Run (déployés le 2026-04-07)

| Service | URL Cloud Run | Health check |
|---------|---------------|-------------|
| `svc-tournee` | https://svc-tournee-llb4mq4zha-ew.a.run.app | `/actuator/health` → `{"status":"UP"}` ✓ |
| `svc-supervision` | https://svc-supervision-llb4mq4zha-ew.a.run.app | `/actuator/health` → `{"status":"UP"}` ✓ |
| `frontend-supervision` | https://frontend-supervision-llb4mq4zha-ew.a.run.app | HTTP 200 ✓ |

### Variables de configuration GCP

```bash
GCP_PROJECT_ID="docupost-recette-prod"
GCP_REGION="europe-west1"
GCP_REPO="docupost"
DB_INSTANCE="docupost-recette-prod:europe-west1:docupost-db"
```

### Protocole de déploiement manuel (sans GitHub)

```bash
TAG=$(git rev-parse --short HEAD)
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_TAG=${TAG} \
  --project=docupost-recette-prod
```

Détail complet : `/livrables/08-devops/deploiement-manuel-gcp.md`
As-built Cloud Run : `/livrables/08-devops/as-built-cloudrun-recette.md`

---

## Règle de mise à jour

Quand un port ou une commande de démarrage change :
1. Mettre à jour **ce fichier uniquement**.
2. Ajouter une entrée dans `/livrables/CHANGELOG-actions-agents.md`.
3. Ne rien modifier dans les fichiers d'agents — ils référencent ce fichier.
