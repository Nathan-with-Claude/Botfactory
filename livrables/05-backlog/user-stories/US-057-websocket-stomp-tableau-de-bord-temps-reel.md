# US-057 — Implémenter WebSocket STOMP pour le tableau de bord temps réel

> Feature : F-011 — Supervision temps réel des tournées (BC-03)
> Epic : EPIC-003 — Supervision et Pilotage Temps Réel
> Bounded Context : BC-03 — Supervision
> Aggregate(s) touchés : VueTournee, TableauDeBord
> Priorité : P1 — Important avant démo terrain
> Complexité estimée : L
> Statut : À faire

## En tant que…

Superviseur logistique consultant le tableau de bord des tournées,

## Je veux…

que le tableau de bord se mette à jour automatiquement sans recharger la page quand une tournée change de statut ou qu'un nouveau colis est traité,

## Afin de…

piloter les tournées en temps réel et détecter les incidents sans avoir à rafraîchir manuellement l'interface.

## Contexte

**Écart as-built identifié (rapport-as-built-supervision.md, §8, ligne WebSocket) :**

La dépendance `spring-boot-starter-websocket` est déclarée dans `pom.xml` de svc-supervision, mais aucun `WebSocketConfig`, `@MessageMapping`, ni `@SendTo` n'est implémenté. L'endpoint `/ws/**` est ouvert dans `SecurityConfig` mais ne sert aucun message STOMP.

US-011 (tableau de bord tournées) prévoyait une mise à jour temps réel — cette fonctionnalité n'est pas livrée.

**Ce qui est attendu (backend) :**
- Créer `WebSocketConfig.java` avec `@EnableWebSocketMessageBroker`, registering du broker `/topic` et du préfixe application `/app`.
- Ajouter un broadcast vers `/topic/tableau-de-bord` lorsque `VueTourneeEventHandler` traite un événement entrant (mise à jour de VueTournee).
- Ajouter un broadcast vers `/topic/tournee/{tourneeId}` pour les mises à jour de détail.

**Ce qui est attendu (frontend web supervision) :**
- Connecter `DetailTourneePage.tsx` et `DetailTourneePlanifieePage.tsx` au WebSocket STOMP via `@stomp/stompjs` ou `sockjs-client`.
- Mettre à jour l'état local React au fil des messages reçus sur `/topic/tableau-de-bord`.

**Invariants à respecter (BC-03) :**
- Le WebSocket ne fait que refléter l'état du read model — il ne modifie pas l'Aggregate.
- L'authentification STOMP (header Authorization dans la frame CONNECT) doit être ajoutée si le endpoint `/ws/**` est sécurisé.
- La connexion HTTP polling (GET `/api/supervision/tableau-de-bord`) reste disponible comme fallback.

## Critères d'acceptation

**Scénario 1 — Connexion WebSocket superviseur**
- Given le superviseur ouvre le tableau de bord
- When la page se charge
- Then une connexion WebSocket STOMP est établie sur `/ws`
- And le client est abonné à `/topic/tableau-de-bord`

**Scénario 2 — Mise à jour temps réel après événement tournée**
- Given le superviseur est connecté au tableau de bord
- When svc-tournee publie un événement de mise à jour (livraison confirmée, statut changé)
- And VueTourneeEventHandler traite l'événement et met à jour le read model
- Then l'événement `TourneeARisqueDetectee` ou la mise à jour de `VueTournee` est broadcasté sur `/topic/tableau-de-bord`
- And le tableau de bord se met à jour sans rechargement de page

**Scénario 3 — Reconnexion automatique**
- Given la connexion WebSocket est interrompue (réseau instable)
- When la connexion est rétablie
- Then le client se reconnecte automatiquement
- And le tableau de bord est rafraîchi avec l'état courant

**Scénario 4 — Fallback polling inchangé**
- Given un client ne supportant pas WebSocket
- When il accède au tableau de bord
- Then le polling HTTP sur `GET /api/supervision/tableau-de-bord` fonctionne toujours

**Scénario 5 — Indicateur de connexion WebSocket (US-044)**
- Given le superviseur est connecté
- When la connexion WebSocket est active
- Then un indicateur visuel "En direct" est affiché
- And si la connexion est perdue, l'indicateur passe en mode dégradé avec le compteur de durée (US-044)

## Définition of Done

- [ ] `WebSocketConfig.java` créé dans svc-supervision avec broker STOMP configuré
- [ ] `VueTourneeEventHandler` broadcasté vers `/topic/tableau-de-bord` après chaque mise à jour
- [ ] `SimpMessagingTemplate` injecté dans le handler pour l'envoi STOMP
- [ ] Frontend web : connexion STOMP dans `DetailTourneePage.tsx` (et/ou composant tableau de bord)
- [ ] Tests : `DevEventBridgeTest` mis à jour pour vérifier le broadcast STOMP
- [ ] `/ws/**` sécurisé avec vérification JWT STOMP (header Authorization dans frame CONNECT)
- [ ] Testé en intégration locale : déclenchement d'un événement depuis DevTmsController → mise à jour visible en temps réel dans le navigateur

## Liens

- Rapport as-built : /livrables/04-architecture-technique/rapport-as-built-supervision.md#8-écarts-avec-larchitecture-cible
- US liée : US-011 (tableau de bord tournées), US-044 (indicateur durée déconnexion WebSocket)
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md
