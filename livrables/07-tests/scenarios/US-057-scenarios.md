# Scénarios de tests US-057 : WebSocket STOMP tableau de bord temps réel

**Agent** : @qa
**Date** : 2026-04-05
**US** : US-057 — Implémenter WebSocket STOMP pour le tableau de bord temps réel
**Bounded Context** : BC-03 Supervision (svc-supervision, port 8082)

---

## Récapitulatif des TC

| TC | Titre | Niveau | Statut |
|----|-------|--------|--------|
| TC-057-01 | Broker STOMP activé sur /topic | L1 | Passé |
| TC-057-02 | Préfixe applicatif /app configuré | L1 | Passé |
| TC-057-03 | Endpoint /ws/supervision enregistré | L1 | Passé |
| TC-057-04 | SockJS autorise toutes les origines | L1 | Passé |

---

### TC-057-01 : Broker STOMP activé sur /topic

**Niveau** : L1 | **Type** : Fonctionnel (SC1)
**Couche** : Infrastructure (SupervisionWebSocketConfig)

```gherkin
Given SupervisionWebSocketConfig est instanciée
When configureMessageBroker est appelé
Then un simple broker en mémoire est activé sur "/topic"
```

**Statut** : Passé

---

### TC-057-02 : Préfixe applicatif /app configuré

**Niveau** : L1 | **Type** : Fonctionnel

```gherkin
Given SupervisionWebSocketConfig est instanciée
When configureMessageBroker est appelé
Then le préfixe applicatif "/app" est configuré
```

**Statut** : Passé

---

### TC-057-03 : Endpoint /ws/supervision enregistré

**Niveau** : L1 | **Type** : Fonctionnel (SC1)

```gherkin
Given SupervisionWebSocketConfig est instanciée
When registerStompEndpoints est appelé
Then l'endpoint "/ws/supervision" est enregistré
And SockJS fallback est activé
```

**Statut** : Passé

---

### TC-057-04 : SockJS autorise toutes les origines

**Niveau** : L1 | **Type** : Configuration

```gherkin
Given registerStompEndpoints configuré
When on vérifie les origines autorisées
Then setAllowedOriginPatterns("*") est configuré (mode dev)
```

**Statut** : Passé

---

**Note L2** : Le broadcast `/topic/tableau-de-bord` est testé indirectement via `VueTourneeEventHandlerTest` (SC1 à SC5 vérifient que `broadcaster.broadcastTableauDeBord()` est appelé). En mode Playwright headless, la connexion WebSocket échoue (OBS headless WebSocket documenté dans le journal QA).
