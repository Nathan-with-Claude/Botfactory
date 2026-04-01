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
| `expo-web` | App mobile livreur (Expo Web) | **8084** | `GET /` | `src/mobile` |

> Si un nouveau service est ajouté au projet, ajouter une ligne ici avant toute chose.

---

## Variables d'environnement requises

| Variable | Valeur | Scope |
|----------|--------|-------|
| `JAVA_HOME` | `C:/Program Files/Java/jdk-20` | Tous les services Java |
| `EXPO_PUBLIC_API_URL` | `http://localhost:8081` | App mobile (Expo) |
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

### Démarrer Expo Web — app mobile (port 8084)

```bash
cd c:/Github/Botfactory/src/mobile
EXPO_PUBLIC_API_URL=http://localhost:8081 \
  npx expo start --web --port 8084 \
  > /tmp/expo.log 2>&1 &
EXPO_PID=$!

for i in $(seq 1 20); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8084 2>/dev/null)
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

## Règle de mise à jour

Quand un port ou une commande de démarrage change :
1. Mettre à jour **ce fichier uniquement**.
2. Ajouter une entrée dans `/livrables/CHANGELOG-actions-agents.md`.
3. Ne rien modifier dans les fichiers d'agents — ils référencent ce fichier.
