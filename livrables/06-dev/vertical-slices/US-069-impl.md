# US-069 — Impl : Consulter les statuts de lecture des broadcasts envoyés

**Date** : 2026-04-22
**Statut** : Livré
**Branch** : feature/US-001

---

## Fichiers créés / modifiés

### Backend — svc-supervision (port 8082)

| Fichier | Action |
|---|---|
| `infrastructure/broadcast/BroadcastStatutLivraisonEntity.java` | Créé — read model table `broadcast_statut_livraison` |
| `infrastructure/broadcast/BroadcastStatutLivraisonJpaRepository.java` | Créé — requêtes findBy* + comptage |
| `application/broadcast/BroadcastEnvoyeEventHandler.java` | Créé — @EventListener BroadcastEnvoye → crée N lignes ENVOYE |
| `application/broadcast/BroadcastVuEventHandler.java` | Créé — @EventListener BroadcastVuEvent → transition VU + WebSocket |
| `application/broadcast/ConsulterBroadcastsDuJourHandler.java` | Créé — query GET /du-jour |
| `application/broadcast/ConsulterBroadcastsDuJourQuery.java` | Créé |
| `application/broadcast/ConsulterStatutsLectureHandler.java` | Créé — query GET /statuts |
| `application/broadcast/ConsulterStatutsLectureQuery.java` | Créé |
| `infrastructure/websocket/BroadcastStatutWebSocketPublisher.java` | Créé — publie sur /topic/supervision/broadcasts/{date} |
| `interfaces/rest/BroadcastController.java` | Modifié — ajout GET /du-jour + GET /{id}/statuts |
| `interfaces/dto/broadcast/BroadcastSummaryDTO.java` | Créé |
| `interfaces/dto/broadcast/BroadcastStatutLivraisonDTO.java` | Créé |
| `interfaces/dto/broadcast/BroadcastStatutUpdateDTO.java` | Créé — payload WebSocket |

**Nouveaux endpoints :**
- `GET /api/supervision/broadcasts/du-jour?date=YYYY-MM-DD` — SUPERVISEUR, liste BroadcastSummaryDTO avec compteurs
- `GET /api/supervision/broadcasts/{id}/statuts` — SUPERVISEUR, détail nominatif

### Frontend web — supervision (port 3000)

| Fichier | Action |
|---|---|
| `src/pages/PanneauBroadcastPage.tsx` | Créé — W-09 drawer : formulaire envoi + historique du jour |
| `src/components/layout/SideNavBar.tsx` | Modifié — entrée "Broadcast" avec icône campaign |
| `src/__tests__/PanneauBroadcastPage.test.tsx` | Créé — 3 tests |

---

## Architecture implémentée

```
[BroadcastEnvoye event]
  → BroadcastEnvoyeEventHandler
  → broadcast_statut_livraison (N lignes ENVOYE, une par livreur)

[BroadcastVuEvent event] ← émis par MarquerBroadcastVuHandler (US-068)
  → BroadcastVuEventHandler
  → broadcast_statut_livraison (mise à jour VU + horodatage)
  → BroadcastStatutWebSocketPublisher
  → /topic/supervision/broadcasts/{date}
  → PanneauBroadcastPage (React) : mise à jour compteur "Vu par N/M" sans rechargement
```

---

## Lancer et tester

```bash
# Backend
cd src/backend/svc-supervision
JAVA_HOME="C:/Program Files/Java/jdk-23" mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Frontend supervision
cd src/web/supervision
REACT_APP_API_URL=http://localhost:8082 npm start
```

**URLs à tester** :
- http://localhost:3000 → tableau de bord superviseur
- Clic "Broadcast" dans la SideNavBar → panneau W-09
- Envoyer un broadcast → apparaît dans l'historique
- Depuis mobile livreur → ouvrir M-08 → le compteur se met à jour en temps réel

**API directe** :
```bash
# Historique du jour
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8082/api/supervision/broadcasts/du-jour?date=2026-04-22"

# Statuts nominatifs
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8082/api/supervision/broadcasts/{id}/statuts"
```

---

## Tests

```
BroadcastEnvoyeEventHandlerTest — 2 scénarios (création N statuts ENVOYE, nomCompletLivreur)
BroadcastVuEventHandlerTest     — 4 scénarios (transition VU, WebSocket, idempotence, inconnu)
PanneauBroadcastPage.test.tsx   — 3 scénarios (formulaire, historique, état vide)
```

**Total suite svc-supervision** : 183 tests, 0 failures (BUILD SUCCESS)
