# Implémentation US-067 : Envoyer un broadcast à ses livreurs actifs

## Contexte

Le superviseur peut envoyer un message push (ALERTE, INFO, CONSIGNE) à tous ses livreurs en cours
ou à un sous-ensemble filtré par secteur géographique. Le message est transmis via FCM (Firebase
Cloud Messaging) aux appareils mobiles des livreurs.

Inputs : US-067, wireframes W-11, architecture-applicative.md (BC-03 Supervision).

## Bounded Context et couche ciblée

- **BC** : BC-03 Supervision
- **Aggregate(s) modifiés** : `BroadcastMessage` (nouveau)
- **Domain Events émis** : `BroadcastEnvoye`

## Décisions d'implémentation

### Domain Layer

- `BroadcastMessage` (Aggregate Root) : création uniquement via méthode factory statique
  `envoyer(id, type, texte, ciblage, superviseurId, livreurIds)`. Valide les invariants
  (texte non vide, ≤ 280 chars, livreurIds non vide) et collecte `BroadcastEnvoye`.
- `BroadcastSecteur` (Value Object record) : porte `codeSecteur`, `libelle`, `actif`,
  et `livreurIds` — les livreurs affectés à ce secteur. Choix délibéré de porter la liste
  dans le VO pour permettre le filtrage secteur sans requête supplémentaire.
- `BroadcastCiblage`, `TypeBroadcast`, `TypeCiblage`, `BroadcastStatut` : Value Objects / enums.
- `BroadcastEnvoye` (record event) dans `domain/broadcast/events/`.
- Repositories placés dans `domain/broadcast/repository/` (sous-package dédié) pour correspondre
  à la structure attendue par les tests TDD existants.

### Application Layer

- `EnvoyerBroadcastHandler` : résout les livreurs EN_COURS via `ConsulterEtatLivreursHandler`
  (réutilisation US-066), filtre par secteur si `TypeCiblage.SECTEUR` en intersectant avec
  `BroadcastSecteur.livreurIds`, lève `AucunLivreurActifException` si vide, délègue au domaine,
  persiste, publie les events, récupère les tokens FCM et appelle `FcmBroadcastAdapter.envoyerMulticast`.
- `ConsulterSecteursHandler` : retourne `BroadcastSecteurRepository.findAllActifs()`.

### Infrastructure Layer

- `BroadcastMessageEntity` / `BroadcastSecteurEntity` / `FcmTokenEntity` : entités JPA
  (tables `broadcast_message`, `broadcast_secteur`, `fcm_token`). Les collections `livreurIds`
  et `secteursCibles` sont stockées via `@ElementCollection`.
- `BroadcastMessageRepositoryImpl`, `BroadcastSecteurRepositoryImpl`, `FcmTokenRepositoryImpl` :
  implémentations des ports domaine avec mapping domain ↔ entity.
- `FcmBroadcastAdapter` : expose `envoyerMulticast(tokens, type, texte, broadcastMessageId)`.
  Si `FirebaseMessaging` est absent du contexte Spring (`@Autowired(required=false)`), log INFO
  et simule l'envoi (mode dev). Si présent, invoque via réflexion pour éviter la dépendance de
  compilation (SDK optionnel au runtime dev).
- `DevDataSeeder` enrichi : seed `broadcast_secteur` (3 secteurs IDF) et `fcm_token`
  (6 tokens fictifs `fake-fcm-token-{livreurId}`) si tables vides.

### Interface Layer

- `POST /api/supervision/broadcasts` → 201 `BroadcastCreeDTO` | 422 `AUCUN_LIVREUR_ACTIF`
- `GET /api/supervision/broadcast-secteurs` → 200 `List<BroadcastSecteurDTO>`
- DTOs dans `interfaces/dto/broadcast/` : `EnvoyerBroadcastRequest`, `BroadcastCiblageRequest`,
  `BroadcastCreeDTO`, `BroadcastSecteurDTO`.
- `superviseurId` extrait de `Authentication.getName()` (JWT Keycloak en prod, mock en dev).

### Erreurs / invariants préservés

- `BroadcastMessage.envoyer(...)` : `IllegalArgumentException` si texte vide ou > 280 chars,
  si livreurIds vide.
- `EnvoyerBroadcastHandler` : `AucunLivreurActifException` si aucun livreur EN_COURS après
  filtrage. Levée avant toute persistance.

### Dépendance ajoutée (pom.xml)

`com.google.firebase:firebase-admin:9.2.0` — optionnelle au runtime dev (aucun bean
`FirebaseMessaging` en profil dev, l'adapter se dégrade gracieusement).

## Tests

- **Type** : unitaires Mockito pur (pas de contexte Spring).
- **Fichier** : `src/test/java/com/docapost/supervision/application/broadcast/EnvoyerBroadcastHandlerTest.java`
- **Scénarios (5 tests, tous PASS)** :
  1. Nominal TOUS — 4 livreurs EN_COURS → BroadcastMessage créé, FCM appelé
  2. Nominal SECTEUR — 2 livreurs dans le secteur → 2 destinataires
  3. Rejet 0 livreurs EN_COURS → `AucunLivreurActifException`
  4. Rejet texte vide → `IllegalArgumentException`
  5. Rejet texte > 280 chars → `IllegalArgumentException`
- **Suite complète** : 176 tests, 0 failure (aucune régression).

## Commandes pour tester en local

```bash
# Démarrer svc-supervision (profil dev)
cd src/backend/svc-supervision
JAVA_HOME="C:/Program Files/Eclipse Adoptium/jdk-25.0.2.10-hotspot" \
  mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Envoyer un broadcast TOUS
curl -X POST http://localhost:8083/api/supervision/broadcasts \
  -H "Content-Type: application/json" \
  -H "X-Internal-Secret: dev-secret" \
  -d '{"type":"ALERTE","texte":"Route D7 barrée","ciblage":{"type":"TOUS","secteurs":[]}}'

# Consulter les secteurs
curl http://localhost:8083/api/supervision/broadcast-secteurs \
  -H "X-Internal-Secret: dev-secret"
```
