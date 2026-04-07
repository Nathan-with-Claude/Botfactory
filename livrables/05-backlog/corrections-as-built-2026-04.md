# Corrections As-Built — Décisions PO
> Date : 2026-04-04 | Auteur : @po
> Basé sur : rapport-as-built-supervision.md + rapport-as-built-mobile.md

---

## Synthèse des écarts

### Écarts BLOQUANTS pour la production (P0)

| # | Service | Écart | Pourquoi bloquant |
|---|---------|-------|-------------------|
| P0-01 | Mobile | `supervisionApi.ts` n'injecte pas le Bearer token → 403 en prod sur les endpoints instructions livreur | Le livreur ne peut pas recevoir ni acquitter ses instructions en production |
| P0-02 | Mobile | `react-native-app-auth` absent du `package.json` → SSO PKCE inopérant en prod | Aucun utilisateur réel ne peut se connecter |
| P0-03 | Mobile | `@react-native-community/netinfo` absent du `package.json` → build natif iOS/Android échoue | L'app ne peut pas être distribuée |
| P0-04 | Supervision | `poidsEstimeKg` non restitué lors de la reconstruction de `TourneePlanifiee` depuis la BDD → compatibilité véhicule silencieusement désactivée | La vérification véhicule (US-030, US-041) retourne `POIDS_ABSENT` pour toute tournée persistée, rendant le contrôle inopérant en production |
| P0-05 | Supervision | PostgreSQL non provisionné (H2 in-memory en dev) → aucune persistance possible en production | Le service redémarre avec une base vide |

### Écarts IMPORTANTS à corriger avant démo (P1)

| # | Service | Écart | Pourquoi important |
|---|---------|-------|-------------------|
| P1-01 | Mobile | Navigation par `useState` conditionnel — bouton retour Android ferme l'app | Régression UX critique terrain (livreur sur Android) |
| P1-02 | Mobile | Persistance offline entre sessions non assurée (offlineQueue en mémoire) — perte des commandes si l'app est tuée | Commandes offline (livraison, échec) perdues silencieusement |
| P1-03 | Supervision | WebSocket/STOMP déclaré mais aucun `@MessageMapping` implémenté — tableau de bord temps réel non livré (US-011) | L'écran superviseur ne se met pas à jour en temps réel |
| P1-04 | Supervision | CORS `allowedOriginPatterns("*")` + `allowCredentials(true)` acceptable en dev, bloquant en prod (politique de sécurité) | Risque sécurité moyen avant tout déploiement |
| P1-05 | Supervision | `/api/supervision/internal/**` sans authentification — injection d'événements possible si API Gateway mal configurée | Risque d'intégrité du read model BC-03 |
| P1-06 | Mobile | Photos transmises en base64 dans le payload JSON — surcharge > 1 Mo possible, erreur taille Spring Boot | Envoi de preuves photo peut échouer silencieusement |

### Écarts ACCEPTÉS / Décision de report (P2+)

| # | Service | Écart | Justification du report |
|---|---------|-------|------------------------|
| P2-01 | Supervision | Java 20 au lieu de Java 21 | Aucun impact fonctionnel MVP. Report R1.1 — mettre à jour pom.xml après validation de la compatibilité |
| P2-02 | Supervision | Spring Boot 3.4.3 au lieu de 4.0.3 | Spring Boot 4 n'existe pas encore en GA. Décision correcte de l'équipe. Mettre à jour ADR DD-001 |
| P2-03 | Supervision | Event bus Kafka absent — HTTP direct (DevEventBridge) | Acceptable pour MVP. Planifier Kafka pour R2. Documenter le contrat `/internal/vue-tournee/events` |
| P2-04 | Supervision | BC-07 fusionné dans svc-supervision | Acceptable pour MVP. Dette technique documentée. Split prévu en R2 |
| P2-05 | Supervision | Outbox pattern absent | Risque at-least-once delivery. Acceptable pour MVP si volume faible. Planifier R2 |
| P2-06 | Supervision | Tests d'intégration @SpringBootTest absents | Couverture Domain + Application dense. Ajouter en R1.1 |
| P2-07 | Supervision | UUID v7 non utilisé (identifiants fournis par l'extérieur) | Comportement correct en pratique. Post-MVP |
| P2-08 | Supervision | `/api/preuves/**` route déclarée sans service | Placeholder proactif. Supprimer ou documenter |
| P2-09 | Mobile | React 18.2 au lieu de React 19 | Fonctionnel. Mettre à jour quand Expo 52+ supporté |
| P2-10 | Mobile | Offline storage AsyncStorage au lieu de WatermelonDB | Perte queue si app tuée couverte par P1-02. WatermelonDB en R2 |
| P2-11 | Mobile | react-native-vision-camera absent (US-009 photo) | US-009 non couverte nativement mais flux de signature implémenté. Report R1.1 |
| P2-12 | Mobile | react-native-firebase/FCM absent (push notifications) | US-016 non implémentée — budget sprint. Report R1.1 |
| P2-13 | Mobile | Monorepo Nx/Turborepo absent | Non critique MVP |
| P2-14 | Mobile | Keycloak non provisionné en dev | Acceptable avec MockJwt. Provisionner avant R1 prod |
| P2-15 | Mobile | Background sync iOS (BGTaskScheduler) absent | Sync uniquement au premier plan. Acceptable MVP |
| P2-16 | Mobile | Tests E2E Playwright absents | Non configuré. Planifier sprint dédié |
| P2-17 | Mobile | useSwipeHint dépendant du modèle de navigation actuel | À réévaluer après P1-01 (react-navigation) |

---

## Plan de corrections

### Corrections immédiates — Sprint actuel

| ID | Titre | Écart corrigé | Complexité | Priorité |
|----|-------|---------------|------------|----------|
| US-051 | Injecter Bearer token dans supervisionApi.ts | P0-01 | XS | P0 |
| US-052 | Ajouter react-native-app-auth et netinfo au package.json | P0-02 + P0-03 | XS | P0 |
| US-053 | Corriger reconstruction TourneePlanifiee — poidsEstimeKg persisté | P0-04 | S | P0 |
| US-054 | Provisionner PostgreSQL dev (docker-compose) | P0-05 | S | P0 |
| US-055 | Migrer navigation mobile vers react-navigation Stack | P1-01 | M | P1 |
| US-056 | Persister offlineQueue dans AsyncStorage entre sessions | P1-02 | S | P1 |
| US-057 | Implémenter WebSocket STOMP pour tableau de bord temps réel | P1-03 | L | P1 |
| US-058 | Restreindre CORS et sécuriser endpoint internal en prod | P1-04 + P1-05 | S | P1 |
| US-059 | Migrer upload photo vers multipart (hors payload JSON) | P1-06 | M | P1 |

### Nouvelles User Stories créées

Voir fichiers `US-051` à `US-059` dans `/livrables/05-backlog/user-stories/`.

- **US-051** (P0/XS) : Bearer token supervisionApi — correction immédiate, développeur en < 1h
- **US-052** (P0/XS) : Dépendances package.json manquantes — correction immédiate, 30 min
- **US-053** (P0/S) : Reconstruction TourneePlanifiee — bug domaine silencieux, 2-4h dev
- **US-054** (P0/S) : PostgreSQL dev provisionné — prérequis tout déploiement
- **US-055** (P1/M) : react-navigation — refactoring navigation, 1-2 jours
- **US-056** (P1/S) : Persistance offlineQueue — sécurité données terrain, 0.5j
- **US-057** (P1/L) : WebSocket temps réel — fonctionnalité US-011 non livrée, 2-3j
- **US-058** (P1/S) : CORS + sécurité interne — configuration prod, 0.5j
- **US-059** (P1/M) : Upload photo multipart — robustesse preuves, 1-2j

### Décisions d'architecture acceptées (P2 — dette technique documentée)

| Décision | Référence ADR | Action requise |
|----------|---------------|----------------|
| Spring Boot 3.4.3 conservé (4.x non GA) | Mettre à jour ADR DD-001 | @architecte-technique |
| BC-07 fusionné dans svc-supervision pour MVP | Documenter comme dette technique | @architecte-technique |
| Kafka reporté en R2 — HTTP direct en prod via `/internal/vue-tournee/events` | Documenter le contrat inter-services | @architecte-technique |
| Outbox pattern reporté R2 | Risque faible pour volumes MVP | @architecte-technique |
| WatermelonDB reporté R2 — AsyncStorage conservé | Acceptable si P1-02 corrigé | @po |
| react-navigation obligatoire avant mise en prod (pas R2) | Dépendance de livraison R1 | @po |

---

## Ordre de développement recommandé

```
P0 : US-051 → US-052 → US-053 → US-054  (par ordre de rapidité)
P1 : US-058 → US-056 → US-055 → US-059 → US-057 (du plus rapide au plus long)
```

Les US P0 peuvent être traitées dans un seul "bug sprint" de 1-2 jours.
Les US P1 constituent un sprint de stabilisation avant toute démo terrain.

---

## Nouvelles corrections post-feedback 2026-04-04

Suite au feedback terrain Pierre Morel du 2026-04-04 (4e cycle), 3 nouvelles US ont été créées :

| US | Titre | Écart source | Priorité | Complexité |
|----|-------|--------------|----------|------------|
| US-060 | Corriger persist() manquant après sync() dans offlineQueue | OBS-AS-006 (QA) — double envoi risque | P0 | XS |
| US-061 | Brancher react-native-signature-canvas dans CapturePreuveScreen | Feedback Pierre Morel #4 — bloquant légal | P0 | S |
| US-062 | Afficher le compteur d'envois en attente dans IndicateurSync | Feedback Pierre Morel #1 — lisibilité offline | P1 | S |

**Note sur US-061 :** US-046 couvre le même périmètre fonctionnel ("Prête" mais non implémentée). US-061 est créée en urgence P0 pour forcer la priorisation. L'implémentation peut s'appuyer directement sur US-046.

**Ordre de développement mis à jour :**

```
P0 : US-051 → US-052 → US-053 → US-054 → US-060 → US-061
P1 : US-058 → US-056 → US-062 → US-055 → US-059 → US-057
```

---

## Règles de libellé UX (décision PO — 2026-04-04)

Signal terrain Pierre Morel : le terme "synchronisation" est du jargon IT incompris des livreurs.
Ces règles s'appliquent à tous les libellés UI visibles par les livreurs terrain.

| Terme IT à éviter | Terme terrain à utiliser |
|-------------------|--------------------------|
| Synchronisation | Envoyé au bureau |
| En attente de sync | Envois en attente |
| Mode offline | Pas de réseau |
| File de commandes | Envois en attente |
| Synchroniser | Envoyer au bureau |
| Synchronized / Synced | Envoyé |

**Portée :** composants `IndicateurSync`, messages de statut dans `ListeColisScreen`, `DetailColisScreen`, toasts et alertes liés au mode offline.
**Référence US :** US-038 — Harmonisation libellés UX (Should Have, À faire).
