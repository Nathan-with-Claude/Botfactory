# US-068 — Impl : Recevoir et consulter les messages broadcast sur l'application mobile

**Date** : 2026-04-22
**Statut** : Livré
**Branch** : feature/US-001

---

## Fichiers créés / modifiés

### Backend — svc-supervision (port 8082)

| Fichier | Action |
|---|---|
| `application/broadcast/MarquerBroadcastVuCommand.java` | Créé — record command |
| `application/broadcast/MarquerBroadcastVuHandler.java` | Créé — publie BroadcastVuEvent via ApplicationEventPublisher |
| `application/broadcast/BroadcastMessageInconnuException.java` | Créé — 404 |
| `application/broadcast/LivreurNonDestinataireException.java` | Créé — 403 |
| `domain/broadcast/events/BroadcastVuEvent.java` | Créé — record event |
| `interfaces/rest/BroadcastController.java` | Modifié — ajout POST /vu + GET /recus |
| `interfaces/dto/broadcast/BroadcastRecuDTO.java` | Créé — DTO livreur |

**Nouveaux endpoints :**
- `POST /api/supervision/broadcasts/{broadcastMessageId}/vu` — LIVREUR, 204 | 404 | 403
- `GET /api/supervision/broadcasts/recus?date=YYYY-MM-DD` — LIVREUR, 200 liste BroadcastRecuDTO

### Mobile — src/mobile (port 8083)

| Fichier | Action |
|---|---|
| `src/components/BroadcastOverlay.tsx` | Créé — overlay M-06 étendu, 15s auto-fermeture, badge coloré par type |
| `src/screens/MessagesSuperviseursScreen.tsx` | Créé — écran M-08, liste broadcasts du jour, marquage auto VU |
| `src/screens/ListeColisScreen.tsx` | Modifié — icône + badge non-lus, navigation vers M-08 |

---

## Architecture implémentée

```
App mobile (foreground)
  ↓ FCM push (BroadcastMessage reçu)
BroadcastOverlay (overlay 15s) → onVoir → MessagesSuperviseursScreen
  ↓ ouverture M-08
POST /api/supervision/broadcasts/{id}/vu (pour chaque non lu)
  ↓ MarquerBroadcastVuHandler
ApplicationEventPublisher → BroadcastVuEvent
  → (US-069) BroadcastVuEventHandler → projection + WebSocket
```

---

## Lancer et tester

```bash
# Backend
cd src/backend/svc-supervision
JAVA_HOME="C:/Program Files/Java/jdk-23" mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Mobile
cd src/mobile
EXPO_PUBLIC_API_URL=http://localhost:8081 \
  EXPO_PUBLIC_SUPERVISION_URL=http://localhost:8082 \
  npx expo start --web --port 8083
```

**Scénario de test** :
1. Connecté comme livreur (Pierre Morel) sur http://localhost:8083
2. Ouvrir l'écran M-02 (Liste des colis)
3. Envoyer un broadcast depuis W-09 superviseur → observer l'overlay M-08
4. Cliquer "VOIR" → ouvrir MessagesSuperviseursScreen
5. Vérifier que les messages passent à l'état VU (badge icône = 0)

---

## Tests

- `BroadcastVuEventHandlerTest.java` — 4 scénarios (transition VU, WebSocket, idempotence, statut inconnu) — dans US-069
- `BroadcastOverlay.test.tsx` — 4 scénarios (null, badge coloré, VOIR, fermeture)
- `MessagesSuperviseursScreen.test.tsx` — 3 scénarios (vide, liste, marquage VU au mount)
