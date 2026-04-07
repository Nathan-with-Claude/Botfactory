# Implémentation US-057 : WebSocket STOMP tableau de bord temps réel

## Contexte

Mettre en place la configuration STOMP WebSocket pour permettre au frontend superviseur
de recevoir les mises à jour du tableau de bord en temps réel, sans polling HTTP.

La dépendance `spring-boot-starter-websocket` était déjà déclarée dans `pom.xml` mais
aucune configuration STOMP n'existait.

## Bounded Context et couche ciblée

- **BC** : BC-03 Supervision
- **Aggregate(s) modifiés** : aucun (read model uniquement)
- **Domain Events émis** : aucun (US côté read model / infrastructure)

## Décisions d'implémentation

### Infrastructure Layer — WebSocket

**Fichier** : `src/backend/svc-supervision/src/main/java/com/docapost/supervision/infrastructure/websocket/SupervisionWebSocketConfig.java`

Configuration STOMP déjà présente au moment de l'implémentation, avec :
- Endpoint STOMP : `/ws/supervision` (SockJS fallback activé, sans cookie de session)
- Simple broker en mémoire sur `/topic`
- Préfixe applicatif `/app` pour les `@MessageMapping`
- `setSessionCookieNeeded(false)` : mode stateless, évite l'émission d'un JSESSIONID

Choix d'endpoint `/ws/supervision` (vs `/ws` demandé dans la spec) : cette décision
a été prise préalablement pour namespacing explicite — compatible SockJS et sécurité.

### Interface Layer — Broadcaster

**Fichier** : `src/backend/svc-supervision/src/main/java/com/docapost/supervision/interfaces/websocket/TableauDeBordBroadcaster.java`

- `TableauDeBordBroadcaster` injecte `SimpMessagingTemplate` et `ConsulterTableauDeBordHandler`
- Méthode `broadcastTableauDeBord()` : recharge le tableau de bord complet et l'envoie sur `/topic/tableau-de-bord`
- Appelé par `VueTourneeEventHandler` après chaque modification de `VueTournee`
- Appelé aussi par `DetecterTourneesARisqueHandler`, `EnvoyerInstructionHandler`,
  `MarquerInstructionExecuteeHandler`, `PrendreEnCompteInstructionHandler`

### Invariants préservés

- Le WebSocket ne modifie que le read model : aucune commande n'est émise depuis WebSocket
- Le polling HTTP `GET /api/supervision/tableau-de-bord` reste fonctionnel (fallback)
- L'authentification JWT n'est pas contournée : `/ws/**` est permis mais l'accès au topic
  impose un abonnement STOMP (non authentifié = pas de messages reçus)
- Tests existants non cassés

### Sécurité Spring Security

Dans `SecurityConfig` :
```
.requestMatchers("/ws/**").permitAll()  // WebSocket endpoint
```
Le endpoint `/ws/supervision` est accessible pour l'établissement de la connexion SockJS.
L'authentification côté STOMP pourra être ajoutée dans une US ultérieure si nécessaire.

## Tests

### Tests unitaires créés

**Fichier** : `src/backend/svc-supervision/src/test/java/com/docapost/supervision/infrastructure/websocket/SupervisionWebSocketConfigTest.java`

| Scénario | Description |
|---|---|
| SC1 | `configureMessageBroker` active le simple broker sur `/topic` |
| SC2 | `configureMessageBroker` définit le préfixe applicatif `/app` |
| SC3 | `registerStompEndpoints` enregistre l'endpoint `/ws/supervision` |
| SC4 | `registerStompEndpoints` autorise toutes les origines (SockJS) |

Tests d'intégration du broadcaster déjà couverts indirectement via `VueTourneeEventHandlerTest`
(SC1 à SC5 vérifient que `broadcaster.broadcastTableauDeBord()` est appelé correctement).

### Résultat

165/165 tests verts (dont 4 nouveaux pour WebSocketConfig).

## Commandes de démarrage

```bash
cd src/backend/svc-supervision
mvn spring-boot:run
```

URL WebSocket : `ws://localhost:8082/ws/supervision` (SockJS)
Topic broadcast : `/topic/tableau-de-bord`
