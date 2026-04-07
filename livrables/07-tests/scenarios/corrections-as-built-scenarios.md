# Scénarios de tests — Corrections As-Built (US-051 à US-059)

**Agent** : @qa
**Date** : 2026-04-04
**Périmètre** : 9 corrections as-built issues de l'analyse architecture (2026-04-04)
**Services concernés** : svc-supervision (port 8082), svc-tournee (port 8081), mobile (Expo Web port 8090)

---

## US-051 — Injecter le Bearer token dans supervisionApi.ts

### Contexte de la correction
`supervisionApi.ts` utilisait `fetch` brut sans Bearer token JWT. La correction introduit
`createHttpClient` avec injection automatique depuis `authStore` — alignement sur le pattern
de `tourneeApi.ts`.

### Verdict QA — Conformité implémentation

**Conforme aux critères d'acceptation.** Le code implémenté (`supervisionApi.ts`) utilise bien
`createHttpClient` avec `authStore` injecté. Les 3 endpoints sont couverts :
`getInstructionsEnAttente` (GET), `marquerInstructionExecutee` (PATCH /executer),
`prendreEnCompteInstruction` (PATCH /prendre-en-compte).

**Point d'attention** : le SC4 (refresh automatique token expiré) dépend de l'implémentation
interne de `createHttpClient/httpClient.ts` — non vérifiable sans lire ce fichier.
Le SC5 (erreur silencieuse 401) est implémenté via le bloc `try/catch` dans
`getInstructionsEnAttente` uniquement — les deux PATCH propagent l'erreur, ce qui est
cohérent avec la nature non-polling de ces appels.

---

### Scénarios nominaux

| ID | Scénario | Niveau | Préconditions | Étapes | Résultat attendu |
|----|----------|--------|---------------|--------|-----------------|
| TC-051-01 | Bearer token présent dans le GET instructions | L1 | `authStore` retourne un token valide via `getAuthHeader()` | Appeler `getInstructionsEnAttente('tournee-001')` avec mock httpClient qui capture les headers | Header `Authorization: Bearer <token>` présent dans la requête |
| TC-051-02 | Bearer token présent dans PATCH exécuter | L1 | `authStore` retourne un token valide | Appeler `marquerInstructionExecutee('instr-001')` | Header `Authorization: Bearer <token>` transmis au PATCH `/executer` |
| TC-051-03 | Bearer token présent dans PATCH prendre-en-compte | L1 | `authStore` retourne un token valide | Appeler `prendreEnCompteInstruction('instr-001')` | Header `Authorization: Bearer <token>` transmis au PATCH `/prendre-en-compte` |
| TC-051-04 | Réponse 200 sur les 3 endpoints avec MockJwtAuthFilter | L2 | svc-supervision démarré en profil `dev` (MockJwtAuthFilter actif) | `GET /api/supervision/instructions/en-attente?tourneeId=T-001`, `PATCH /api/supervision/instructions/instr-001/executer`, `PATCH /api/supervision/instructions/instr-001/prendre-en-compte` | Statut HTTP 200 (pas 403) sur les 3 appels |

### Scénarios d'erreur

| ID | Scénario | Niveau | Préconditions | Étapes | Résultat attendu |
|----|----------|--------|---------------|--------|-----------------|
| TC-051-05 | Erreur réseau silencieuse sur polling | L1 | Mock `apiFetch` lève une exception réseau | Appeler `getInstructionsEnAttente('tournee-001')` | Retourne `[]` sans propager l'exception |
| TC-051-06 | Réponse 401 silencieuse sur polling | L1 | Mock `apiFetch` retourne `{ ok: false, status: 401 }` | Appeler `getInstructionsEnAttente('tournee-001')` | Retourne `[]` sans lever d'exception |
| TC-051-07 | Réponse 409 idempotente sur PATCH exécuter | L1 | Mock `apiFetch` retourne `{ ok: false, status: 409 }` | Appeler `marquerInstructionExecutee('instr-001')` | Pas d'exception levée (409 est idempotent) |

```gherkin
# TC-051-01
Given l'authStore retourne un token JWT "token-livreur-001"
When getInstructionsEnAttente("tournee-001") est appelé
Then le header Authorization contient "Bearer token-livreur-001"

# TC-051-05
Given apiFetch lève une erreur réseau
When getInstructionsEnAttente("tournee-001") est appelé
Then la fonction retourne [] sans propager l'exception
```

**Statut initial** : À tester

---

## US-052 — Dépendances natives manquantes dans package.json

### Contexte de la correction
`react-native-app-auth` et `@react-native-community/netinfo` absents du `package.json`.
La correction les ajoute en `dependencies` avec leurs mocks Jest dans `moduleNameMapper`.

### Verdict QA — Conformité implémentation

**Conforme aux critères d'acceptation.** Le `package.json` contient bien :
- `"react-native-app-auth": "^7.1.0"` dans `dependencies`
- `"@react-native-community/netinfo": "^11.3.1"` dans `dependencies`
- Entrées dans `jest.moduleNameMapper` pour les deux mocks

**Écart mineur** : la DoD mentionne `npx expo-doctor` sans avertissement — ce test ne peut être
exécuté en L2 sans environnement Expo complet. Classé "vérification manuelle".

**Écart non bloquant** : la DoD mentionne `.env.example` et `package-lock.json` mis à jour —
non vérifiable sans npm install sur la machine cible. Les dépendances sont correctement
déclarées.

---

### Scénarios nominaux

| ID | Scénario | Niveau | Préconditions | Étapes | Résultat attendu |
|----|----------|--------|---------------|--------|-----------------|
| TC-052-01 | react-native-app-auth dans package.json | L1 | Fichier `package.json` lu | Vérifier la clé `dependencies["react-native-app-auth"]` | Valeur `^7.1.0` présente |
| TC-052-02 | @react-native-community/netinfo dans package.json | L1 | Fichier `package.json` lu | Vérifier la clé `dependencies["@react-native-community/netinfo"]` | Valeur `^11.3.1` présente |
| TC-052-03 | Mocks Jest configurés pour react-native-app-auth | L1 | Fichier `package.json` + mock présent | Vérifier `jest.moduleNameMapper["react-native-app-auth"]` | Pointe vers `<rootDir>/src/__mocks__/react-native-app-auth.ts` |
| TC-052-04 | Mocks Jest configurés pour netinfo | L1 | Fichier `package.json` + mock présent | Vérifier `jest.moduleNameMapper["@react-native-community/netinfo"]` | Pointe vers `<rootDir>/src/__mocks__/netInfoMock.ts` |
| TC-052-05 | Suite Jest toujours verte après ajout dépendances | L1 | Mocks en place | Exécuter `jest --watchAll=false` dans `src/mobile/` | Tous les tests passants avant la correction restent PASS |

### Scénarios d'erreur

| ID | Scénario | Niveau | Préconditions | Étapes | Résultat attendu |
|----|----------|--------|---------------|--------|-----------------|
| TC-052-06 | Absence de doublon dans dependencies vs devDependencies | L1 | Fichier `package.json` | Vérifier que `react-native-app-auth` et `netinfo` ne sont pas dans `devDependencies` | Présents uniquement dans `dependencies` |

```gherkin
# TC-052-05
Given les mocks react-native-app-auth et netInfoMock sont en place
When on exécute la suite Jest complète
Then tous les tests précédemment verts restent PASS
And aucune erreur "Cannot find module" n'apparaît
```

**Statut initial** : À tester

---

## US-053 — Correction poidsEstimeKg dans TourneePlanifiee

### Contexte de la correction
Le constructeur 15-params (reconstruction depuis persistance) passait `null` pour `poidsEstimeKg`.
La correction marque ce constructeur `@Deprecated` et délègue au constructeur 16-params.

### Verdict QA — Conformité implémentation

**Conforme aux critères d'acceptation.** Le code implémenté montre :
- Constructeur 15-params annoté `@Deprecated` et délégant vers le 16-params avec `null` comme
  valeur de `poidsEstimeKg` explicite — correct (null = poids absent, cas légitime SC4).
- Constructeur 16-params (reconstruction complète) présent et utilisable par le mapper JPA.

**Écart identifié** : la correction ne porte que sur `TourneePlanifiee.java`. La DoD mentionne
aussi `TourneePlanifieeMapper.java` (appel du constructeur 16-params depuis la couche infra).
Ce fichier n'est pas listé dans les fichiers modifiés de `corrections-as-built-impl.md`.
**Si le mapper appelait le constructeur 15-params, le bug est partiellement corrigé.**
A vérifier en L2 (rechargement depuis BDD avec profil `local-postgres`).

**2 nouveaux tests ajoutés** dans `TourneePlanifieeTest.java` — conforme à la DoD.

---

### Scénarios nominaux

| ID | Scénario | Niveau | Préconditions | Étapes | Résultat attendu |
|----|----------|--------|---------------|--------|-----------------|
| TC-053-01 | Reconstruction avec poids — getPoidsEstimeKg correct | L1 | Constructeur 16-params appelé avec `poidsEstimeKg = 320` | Créer une `TourneePlanifiee` via le constructeur 16-params | `getPoidsEstimeKg()` retourne `320` |
| TC-053-02 | Compatibilité COMPATIBLE après reconstruction | L1 | TourneePlanifiee avec poids 320 kg, véhicule capacité 400 kg | Appeler `verifierCompatibiliteVehicule(vehicule400kg)` | Résultat = `COMPATIBLE`, Domain Event `CompatibiliteVehiculeVerifiee` émis |
| TC-053-03 | Dépassement DEPASSEMENT après reconstruction | L1 | TourneePlanifiee avec poids 450 kg, véhicule capacité 400 kg | Appeler `verifierCompatibiliteVehicule(vehicule400kg)` | Résultat = `DEPASSEMENT`, Domain Event `CompatibiliteVehiculeEchouee` émis |
| TC-053-04 | POIDS_ABSENT uniquement si poids null à l'import TMS | L1 | TourneePlanifiee avec `poidsEstimeKg = null` | Appeler `verifierCompatibiliteVehicule(vehicule400kg)` | Résultat = `POIDS_ABSENT` |
| TC-053-05 | Tests TourneePlanifieeTest verts — 22 tests | L1 | `mvn test -pl svc-supervision` | Exécuter `TourneePlanifieeTest` | 22 tests (20 existants + 2 nouveaux) PASS |
| TC-053-06 | Rechargement BDD — compatibilité correcte (mapper) | L2 | svc-supervision en profil `local-postgres`, données seed insérées avec poids=320 | Appel `POST /api/planification/tournees/{id}/verifier-compatibilite-vehicule` après redémarrage | Retourne `COMPATIBLE` (pas `POIDS_ABSENT`) |

### Scénarios d'erreur

| ID | Scénario | Niveau | Préconditions | Étapes | Résultat attendu |
|----|----------|--------|---------------|--------|-----------------|
| TC-053-07 | Constructeur 15-params déprécié — warning à la compilation | L1 | Appel du constructeur 15-params dans un test ou le mapper | Compiler le module | Avertissement `@Deprecated` émis — pas d'erreur de compilation |

```gherkin
# TC-053-02
Given une TourneePlanifiee reconstructed via constructeur 16-params avec poidsEstimeKg = 320
And un véhicule avec capacité 400 kg
When verifierCompatibiliteVehicule(vehicule) est appelé
Then le résultat est COMPATIBLE
And l'event CompatibiliteVehiculeVerifiee est émis avec poidsEstimeKg = 320

# TC-053-06
Given svc-supervision est démarré en profil local-postgres
And le DevDataSeeder a inséré une tournée avec poids 320 kg
When le service est redémarré et que POST /verifier-compatibilite-vehicule est appelé
Then la réponse est 200 avec résultat COMPATIBLE
And le résultat n'est pas POIDS_ABSENT
```

**Statut initial** : À tester

---

## US-054 — Provisionnement PostgreSQL en développement local

### Contexte de la correction
Création du `docker-compose.yml` et du profil Spring `local-postgres` pour svc-supervision.
Profil `dev` (H2) inchangé.

### Verdict QA — Conformité implémentation

**Conforme aux critères d'acceptation.** Le `docker-compose.yml` est présent avec :
- Image `postgres:16-alpine`
- Port 5432:5432
- Base `docupost_supervision`, utilisateur `docupost`
- Volume nommé pour la persistance entre redémarrages
- Healthcheck configuré

**Écarts par rapport à la DoD** :
- `.env.example` non mentionné dans les fichiers créés de l'impl.md — à vérifier.
- Infrastructure-locale.md non mis à jour avec les commandes PostgreSQL — DoD non satisfaite
  sur ce point. A noter comme point d'attention.
- DevDataSeeder idempotent en profil `local-postgres` — non vérifié dans l'impl.md.

---

### Scénarios nominaux

| ID | Scénario | Niveau | Préconditions | Étapes | Résultat attendu |
|----|----------|--------|---------------|--------|-----------------|
| TC-054-01 | docker-compose.yml présent et syntaxe valide | L1 | Fichier `docker-compose.yml` dans `src/backend/svc-supervision/` | Lire et valider la syntaxe YAML | Fichier présent, service `postgres-supervision` défini, image `postgres:16-alpine` |
| TC-054-02 | Profil local-postgres — fichier application-local-postgres.yml présent | L1 | Fichier de configuration Spring | Vérifier la datasource dans `application-local-postgres.yml` | URL `jdbc:postgresql://localhost:5432/docupost_supervision` configurée |
| TC-054-03 | PostgreSQL démarre et est sain | L2 | Docker disponible | `docker compose -f src/backend/svc-supervision/docker-compose.yml up -d` puis `docker ps` | Container `docupost-supervision-db` en état `healthy` sur port 5432 |
| TC-054-04 | svc-supervision démarre en profil local-postgres | L2 | Docker PostgreSQL `healthy` | `SPRING_PROFILES_ACTIVE=local-postgres mvn spring-boot:run` dans `svc-supervision/` | Application démarre sans erreur de connexion BDD, tables créées par Hibernate |
| TC-054-05 | Profil dev H2 inchangé | L1 | Build Maven | Exécuter `mvn test` sans profil (profil dev) | Tous les @WebMvcTest passent (154 tests), H2 utilisé |
| TC-054-06 | Persistance entre redémarrages | L2 | svc-supervision en profil `local-postgres`, tournée créée | Arrêter et redémarrer le service (sans Docker stop) | La tournée créée est toujours présente via `GET /api/planification/tournees` |

### Scénarios d'erreur

| ID | Scénario | Niveau | Préconditions | Étapes | Résultat attendu |
|----|----------|--------|---------------|--------|-----------------|
| TC-054-07 | Docker absent — message d'erreur clair | L2 | Docker non disponible | Tenter `docker compose up -d` | Erreur explicite "Docker not found" (hors scope Spring) |

```gherkin
# TC-054-03
Given Docker est disponible
When docker compose -f src/backend/svc-supervision/docker-compose.yml up -d est exécuté
Then le container docupost-supervision-db est running et healthy
And le port 5432 répond aux connexions PostgreSQL

# TC-054-06
Given svc-supervision tourne en profil local-postgres avec données seed
When le service est arrêté puis redémarré
Then GET /api/planification/tournees/{date} retourne les mêmes tournées qu'avant le redémarrage
```

**Statut initial** : À tester

---

## US-055 — Migration navigation vers react-navigation Stack

### Contexte de la correction
Migration partielle : `App.tsx` intègre `NavigationContainer` + `Stack.Navigator` pour les routes
`Connexion` et `ListeColis`. Les sous-écrans de `ListeColisScreen` restent en `useState` (R2).

### Verdict QA — Conformité implémentation

**Partiellement conforme.** La DoD requiert :
- [x] `@react-navigation/native` et `@react-navigation/stack` dans `package.json`
- [x] Stack Navigator avec routes `Connexion` + `ListeColis` dans `App.tsx`
- [ ] `ListeColisScreen.tsx` : état `currentScreen` supprimé, navigation via `navigation.navigate()`
      → **Non réalisé** (limitation documentée, prévu R2)
- [ ] Tous les sous-écrans avec routes react-navigation → **Non réalisé**
- [ ] Retour Android testé sur émulateur → **Non vérifiable en L1/L2**

**Écart SC1, SC2, SC3** : le bouton retour Android fonctionne uniquement entre `ConnexionScreen`
et `ListeColisScreen`. Il ne fonctionne pas encore depuis `DetailColisScreen`,
`CapturePreuveScreen`, `MesConsignesScreen` (gestion `useState` interne conservée).

**Écart SC4** : le mécanisme de redirection post-connexion s'appuie sur `initialRouteName`
dynamique (`ecranInitial`). Cela fonctionne pour le premier rendu, mais si l'authState change
après le montage, `initialRouteName` ne change pas. La navigation effective vers `ListeColis`
après login SSO doit être vérifiée.

---

### Scénarios nominaux

| ID | Scénario | Niveau | Préconditions | Étapes | Résultat attendu |
|----|----------|--------|---------------|--------|-----------------|
| TC-055-01 | NavigationContainer présent dans App.tsx | L1 | Fichier `App.tsx` | Vérifier l'import `NavigationContainer` et le rendu JSX | `<NavigationContainer>` wrappant le Stack.Navigator |
| TC-055-02 | Routes Connexion et ListeColis déclarées | L1 | Fichier `App.tsx` | Vérifier `Stack.Screen name="Connexion"` et `Stack.Screen name="ListeColis"` | Les 2 routes sont définies dans le Stack.Navigator |
| TC-055-03 | ecranInitial = "ListeColis" quand authentifié | L1 | `authState.status = 'authenticated'` | Lire la logique `ecranInitial` dans `App.tsx` | `ecranInitial === 'ListeColis'` |
| TC-055-04 | ecranInitial = "Connexion" quand non authentifié | L1 | `authState.status = 'idle'` ou `'error'` | Lire la logique `ecranInitial` dans `App.tsx` | `ecranInitial === 'Connexion'` |
| TC-055-05 | Tests Jest mobiles toujours verts | L1 | Mocks NavigationContainer configurés dans Jest | Exécuter la suite Jest mobile | Tous les tests existants passent |
| TC-055-06 | Retour Android Connexion → quitter (pas de pile) | L3 | App démarrée non authentifiée | Naviguer sur ConnexionScreen, appuyer sur retour Android | Comportement natif Android (exit ou NOP selon configuration) |

### Scénarios d'erreur

| ID | Scénario | Niveau | Préconditions | Étapes | Résultat attendu |
|----|----------|--------|---------------|--------|-----------------|
| TC-055-07 | Migration incomplète — sous-écrans encore en useState | L1 | `ListeColisScreen.tsx` | Vérifier la présence de l'état `currentScreen` ou équivalent dans `ListeColisScreen` | L'état de navigation interne est présent (migration R2 documentée) |

```gherkin
# TC-055-03
Given authState.status est 'authenticated'
When App.tsx calcule ecranInitial
Then ecranInitial === 'ListeColis'
And Stack.Navigator initialRouteName === 'ListeColis'

# TC-055-05
Given NavigationContainer est mocké dans les tests Jest
When la suite Jest complète est exécutée
Then tous les tests ListeColisScreen.test.tsx passent sans erreur
```

**Statut initial** : À tester

---

## US-056 — Persistance offlineQueue via AsyncStorage

### Contexte de la correction
`offlineQueue.ts` stocke désormais la file dans AsyncStorage via `initialize()` (chargement)
et `persist()` (sauvegarde après enqueue). Injection de dépendances pour les tests.

### Verdict QA — Conformité implémentation

**Conforme aux critères d'acceptation.** Le code implémenté satisfait :
- `initialize()` — charge depuis AsyncStorage, idempotente (déduplique par commandId)
- `persist()` — sérialise après chaque `enqueue()`
- `OfflineQueueOptions.storage` — injectable pour les tests
- Ordre FIFO conservé après rechargement
- 409 = succès conservé dans `sync()`

**Point d'attention** : la DoD mentionne "`dequeue()` met à jour AsyncStorage après chaque
synchronisation réussie". L'implémentation actuelle ne persiste pas après `sync()` — si l'app
est tuée pendant la synchronisation, les commandes en cours de traitement peuvent réapparaître
au prochain chargement. Comportement conservatif (pas de perte), mais potentiel de doublon
d'envoi au redémarrage. Le mécanisme d'idempotence serveur (409) mitigue ce risque.

**Écart DoD** : pas de tests unitaires `offlineQueue.test.ts` mentionnés dans les fichiers
créés/modifiés de l'impl.md — à vérifier si des tests ont été ajoutés.

---

### Scénarios nominaux

| ID | Scénario | Niveau | Préconditions | Étapes | Résultat attendu |
|----|----------|--------|---------------|--------|-----------------|
| TC-056-01 | initialize() charge la file depuis AsyncStorage | L1 | Mock AsyncStorage retourne `[{commandId:"cmd-001",...}]` | Appeler `initialize()` | La file contient "cmd-001" avec le bon type et payload |
| TC-056-02 | enqueue() déclenche persist() | L1 | Mock AsyncStorage avec `setItem` espionné | Enqueue une commande CONFIRMER_LIVRAISON | `AsyncStorage.setItem` appelé avec la clé `docupost_offline_queue` et la commande sérialisée |
| TC-056-03 | Idempotence rechargement — pas de doublon | L1 | File avec cmd-001 en mémoire, AsyncStorage retourne aussi cmd-001 | Appeler `initialize()` | La file contient toujours 1 occurrence de cmd-001 (pas 2) |
| TC-056-04 | Ordre FIFO conservé après rechargement | L1 | AsyncStorage contient [cmd-A, cmd-B, cmd-C] dans l'ordre | Appeler `initialize()` puis `toArray()` | L'ordre retourné est [cmd-A, cmd-B, cmd-C] |
| TC-056-05 | canCloseRoute() = false si file non vide | L1 | File contenant 1 commande persistée | Appeler `canCloseRoute()` | Retourne `false` |
| TC-056-06 | canCloseRoute() = true si file vide | L1 | AsyncStorage vide, file vide | Après sync complète, appeler `canCloseRoute()` | Retourne `true` |
| TC-056-07 | useOfflineSync appelle initialize() au montage | L1 | Mock de l'offlineQueue avec `initialize` espionné | Monter le hook `useOfflineSync` | `queue.initialize()` est appelé exactement 1 fois |

### Scénarios d'erreur

| ID | Scénario | Niveau | Préconditions | Étapes | Résultat attendu |
|----|----------|--------|---------------|--------|-----------------|
| TC-056-08 | AsyncStorage.getItem lève une exception | L1 | Mock `getItem` lève une erreur | Appeler `initialize()` | La file reste vide, aucune exception propagée |
| TC-056-09 | AsyncStorage.setItem lève une exception | L1 | Mock `setItem` lève une erreur | Enqueue une commande | La commande est en mémoire, aucune exception propagée (persistance silencieuse) |

```gherkin
# TC-056-01
Given AsyncStorage contient JSON avec 3 commandes offline
When initialize() est appelé
Then la file contient 3 commandes dans l'ordre FIFO

# TC-056-03
Given cmd-001 est déjà en mémoire dans la file
And AsyncStorage retourne un tableau contenant aussi cmd-001
When initialize() est appelé une seconde fois
Then la file contient toujours exactement 1 occurrence de cmd-001
```

**Statut initial** : À tester

---

## US-057 — WebSocket STOMP tableau de bord temps réel

### Contexte de la correction
Marqué DEJA-IMPL dans l'impl.md. Les fichiers backend WebSocket existent déjà
(`SupervisionWebSocketConfig.java`, `TableauDeBordBroadcaster.java`).
Aucune modification réalisée dans cette session.

### Verdict QA — Conformité implémentation

**Non applicable (DEJA-IMPL).** L'US demande une vérification de l'existant.

**Points à vérifier** :
- L'implémentation existante couvre-t-elle les scénarios 1 à 5 de l'US ?
- US-044 (compteur durée déconnexion) est validée — le WebSocket backend était donc
  fonctionnel lors des tests précédents.
- Le SC3 (reconnexion automatique) et SC5 (indicateur visuel US-044) ont été validés
  en session précédente (OBS-SUP-001 résolu, 11/11 PASS).

**Décision QA** : US-057 est considérée couverte par la validation existante de US-044
(indicateur WebSocket, 11/11 PASS). Aucun nouveau scénario de test à créer.
Une validation L2 de connexion WebSocket est recommandée avant démo.

---

### Scénarios nominaux (vérification existant)

| ID | Scénario | Niveau | Préconditions | Étapes | Résultat attendu |
|----|----------|--------|---------------|--------|-----------------|
| TC-057-01 | WebSocketConfig présent et broker STOMP configuré | L1 | Fichier `SupervisionWebSocketConfig.java` | Vérifier l'annotation `@EnableWebSocketMessageBroker` et l'endpoint `/ws/supervision` | Configuration STOMP présente |
| TC-057-02 | TableauDeBordBroadcaster injecte SimpMessagingTemplate | L1 | Fichier `TableauDeBordBroadcaster.java` | Vérifier injection `SimpMessagingTemplate` et broadcast vers `/topic/tableau-de-bord` | Broadcast présent |
| TC-057-03 | Connexion WebSocket sur /ws/supervision | L2 | svc-supervision démarré en profil dev | Connexion WebSocket via client STOMP sur `ws://localhost:8082/ws/supervision` | Connexion CONNECTED reçue |

```gherkin
# TC-057-03
Given svc-supervision est démarré sur le port 8082
When un client STOMP se connecte à ws://localhost:8082/ws/supervision
Then le frame CONNECTED est reçu
And le client peut s'abonner à /topic/tableau-de-bord
```

**Statut initial** : À tester (vérification existant)

---

## US-058 — CORS et sécurité endpoint interne

### Contexte de la correction
CORS externalisé via `app.cors.allowed-origins`. Filtre `InternalSecretFilter` ajouté
sur `/api/supervision/internal/**`. Secret configurable via variable d'environnement.

### Verdict QA — Conformité implémentation

**Conforme aux critères d'acceptation.** Le code implémenté montre :
- `@Value("${app.cors.allowed-origins:*}")` — externalisé avec valeur par défaut `*` pour dev
- `corsConfigurationSource()` utilise les valeurs injectées
- `allowCredentials` désactivé si wildcard `"*"` — gestion correcte de la contrainte Spring
- `InternalSecretFilter` créé et ajouté à la chaîne de sécurité

**Point d'attention** : dans le code lu, la route `/api/supervision/internal/**` est toujours
`permitAll()` dans `authorizeHttpRequests`. La protection repose entièrement sur
`InternalSecretFilter`. En dev (secret = "dev-secret-ignored"), le filtre est no-op.
C'est cohérent avec les invariants de l'US, mais la DoD demande aussi des tests
`SecurityConfig` mis à jour — à vérifier.

**Écart DoD** : `infrastructure-locale.md` non mis à jour avec les variables d'environnement
`ALLOWED_ORIGINS` et `INTERNAL_SECRET` — point d'attention.

---

### Scénarios nominaux

| ID | Scénario | Niveau | Préconditions | Étapes | Résultat attendu |
|----|----------|--------|---------------|--------|-----------------|
| TC-058-01 | CORS — origines lues depuis la configuration | L1 | `SecurityConfig` compilé | Vérifier `@Value("${app.cors.allowed-origins:*}")` dans `SecurityConfig.java` | Annotation présente, valeur par défaut `*` |
| TC-058-02 | allowCredentials désactivé si wildcard | L1 | Config avec `allowedOriginsConfig = "*"` | Vérifier la logique dans `corsConfigurationSource()` | `config.setAllowCredentials(false)` pour la valeur `"*"` |
| TC-058-03 | InternalSecretFilter bean déclaré | L1 | `SecurityConfig.java` | Vérifier méthode `@Bean internalSecretFilter()` | Bean créé avec le secret configuré |
| TC-058-04 | CORS permissif en dev — toutes origines acceptées | L2 | svc-supervision en profil dev (secret=dev-secret-ignored) | `OPTIONS /api/supervision/tableau-de-bord` depuis `http://localhost:3000` | Header `Access-Control-Allow-Origin: *` dans la réponse (ou `http://localhost:3000`) |
| TC-058-05 | Endpoint interne accepté en dev sans secret | L2 | svc-supervision en profil dev | `POST /api/supervision/internal/vue-tournee/events` sans header `X-Internal-Secret` | Statut 200 ou 202 (bypass du filtre en dev) |
| TC-058-06 | Tests SecurityConfig / WebMvcTest toujours verts | L1 | `mvn test -pl svc-supervision` | Exécuter la suite complète | 154 tests PASS (BUILD SUCCESS) |

### Scénarios d'erreur

| ID | Scénario | Niveau | Préconditions | Étapes | Résultat attendu |
|----|----------|--------|---------------|--------|-----------------|
| TC-058-07 | Endpoint interne rejeté sans secret (simulation prod) | L2 | svc-supervision démarré avec `-Dapp.internal.secret=secret-test-123` | `POST /api/supervision/internal/vue-tournee/events` sans `X-Internal-Secret` | Statut 403 retourné |
| TC-058-08 | Endpoint interne accepté avec bon secret (simulation prod) | L2 | svc-supervision avec secret `secret-test-123` | Requête avec `X-Internal-Secret: secret-test-123` | Statut 200 ou 202 |

```gherkin
# TC-058-05
Given svc-supervision est démarré avec app.internal.secret=dev-secret-ignored
When POST /api/supervision/internal/vue-tournee/events est appelé sans X-Internal-Secret
Then le filtre est no-op et la requête est traitée normalement (200 ou 4xx métier)

# TC-058-07
Given svc-supervision est démarré avec app.internal.secret=secret-test-123
When POST /api/supervision/internal/** est appelé sans X-Internal-Secret
Then la réponse est 403 avec body JSON d'erreur
```

**Statut initial** : À tester

---

## US-059 — Upload photo multipart

### Contexte de la correction
Solution MVP choisie : augmenter la limite Spring Boot à 5MB + avertissement console côté
mobile si `photoData` dépasse ~500 Ko. La migration multipart 2 étapes est reportée en R2.

### Verdict QA — Conformité implémentation

**Partiellement conforme — solution alternative MVP acceptée.**

La DoD acceptait explicitement l'alternative "compression + limite Spring Boot augmentée".
Le développeur a choisi cette voie avec :
- Limite configurée (`5MB` / `10MB`) dans `application.yml`
- Avertissement console dans `syncExecutor.ts`

**Écarts par rapport à la DoD complète** :
- [ ] Photo stockée localement (AsyncStorage / Expo FileSystem) en mode offline entre sessions
      → **Non implémenté** : `photoData` reste en base64 dans le payload JSON de la commande
      offline. Si la commande est en attente dans AsyncStorage, la photo base64 est stockée
      avec elle — acceptable pour le MVP si la taille reste raisonnable.
- [ ] Cas d'erreur 413 traité côté mobile (message utilisateur) → **Non implémenté** : uniquement
      `console.warn`. L'US prévoit un message utilisateur en cas d'erreur.
- [ ] Tests `syncExecutor.test.ts` mis à jour → à vérifier.

**Point d'attention** : l'avertissement console ne bloque pas l'envoi. Une photo > 500 Ko sera
quand même envoyée avec risque de 413. Mitigation : la limite Spring est à 5MB — une photo
de 1 Mo base64 (≈ 750 Ko binaires) passera. Risque résiduel documenté comme TODO R2.

---

### Scénarios nominaux

| ID | Scénario | Niveau | Préconditions | Étapes | Résultat attendu |
|----|----------|--------|---------------|--------|-----------------|
| TC-059-01 | Limite multipart Spring configurée à 5MB | L1 | Fichier `application.yml` de svc-supervision | Vérifier `spring.servlet.multipart.max-file-size: 5MB` | Valeur 5MB présente dans la config globale |
| TC-059-02 | Limite multipart request configurée à 10MB | L1 | Fichier `application.yml` de svc-supervision | Vérifier `spring.servlet.multipart.max-request-size: 10MB` | Valeur 10MB présente |
| TC-059-03 | Avertissement console si photoData > 500 Ko | L1 | Mock `console.warn` espionné, payload avec `photoData` de 668 000 chars | Appeler `execute(cmd)` avec payload volumineux | `console.warn` appelé avec le message "[syncExecutor] US-059 : photoData dépasse 500 Ko" |
| TC-059-04 | Pas d'avertissement si photoData < 500 Ko | L1 | Mock `console.warn` espionné, `photoData` de 100 000 chars | Appeler `execute(cmd)` avec petite photo | `console.warn` non appelé |
| TC-059-05 | Livraison sans photo — flux inchangé | L1 | Commande CONFIRMER_LIVRAISON sans `photoData` | Appeler `execute(cmd)` | Payload JSON envoyé sans `photoData`, pas d'avertissement |
| TC-059-06 | Upload livraison < 5MB accepté | L2 | svc-supervision et svc-tournee démarrés | `POST /api/tournees/{id}/colis/{id}/livraison` avec photo base64 < 5MB | Statut 200 ou 201, LivraisonConfirmee émis |

### Scénarios d'erreur

| ID | Scénario | Niveau | Préconditions | Étapes | Résultat attendu |
|----|----------|--------|---------------|--------|-----------------|
| TC-059-07 | Upload > 10MB rejeté avec 413 | L2 | svc-tournee démarré, limite Spring 5MB | `POST /api/tournees/{id}/colis/{id}/livraison` avec photo > 10MB | Statut 413 Request Entity Too Large |

```gherkin
# TC-059-03
Given une commande CONFIRMER_LIVRAISON avec photoData.length > 667 000
When execute(cmd) est appelé dans syncExecutor
Then console.warn est appelé avec "[syncExecutor] US-059 : photoData dépasse 500 Ko"

# TC-059-06
Given svc-tournee est démarré avec limite multipart 5MB
When POST /api/tournees/T-001/colis/COLIS-001/livraison est appelé avec photo < 5MB
Then la réponse est 200 ou 201
And l'événement LivraisonConfirmee est émis
```

**Statut initial** : À tester

---

## Récapitulatif

| US | Titre court | Niveaux | Nb TCs | Conformité impl. | Points d'attention |
|----|-------------|---------|--------|------------------|--------------------|
| US-051 | Bearer token supervisionApi | L1 (5) + L2 (2) | 7 | Conforme | SC4 refresh token dépend httpClient |
| US-052 | Dépendances package.json | L1 (6) | 6 | Conforme | expo-doctor non testable en CI |
| US-053 | poidsEstimeKg reconstruction | L1 (6) + L2 (1) | 7 | Conforme | Mapper non vérifié dans impl.md |
| US-054 | PostgreSQL dev | L1 (2) + L2 (4) | 6 | Conforme (écarts DoD mineurs) | infrastructure-locale.md non mis à jour |
| US-055 | Navigation react-navigation | L1 (5) + L3 (1) | 6 | Partielle (migration R2) | Sous-écrans toujours en useState |
| US-056 | offlineQueue AsyncStorage | L1 (9) | 9 | Conforme | persist() non appelé après sync() |
| US-057 | WebSocket STOMP | L1 (2) + L2 (1) | 3 | DEJA-IMPL — couvert US-044 | Validation avant démo recommandée |
| US-058 | CORS + endpoint interne | L1 (3) + L2 (5) | 8 | Conforme | infrastructure-locale.md non mis à jour |
| US-059 | Upload photo multipart | L1 (5) + L2 (2) | 7 | Partielle (MVP alternatif) | Pas de message utilisateur 413, TODO R2 |
| **TOTAL** | | | **59** | | |

---

## Anomalies détectées

| ID | Sévérité | US | Description | Impact |
|----|----------|----|-------------|--------|
| OBS-AS-001 | Non bloquant | US-053 | `TourneePlanifieeMapper.java` non listé dans les fichiers modifiés. Si le mapper appelait encore le constructeur 15-params, la correction est incomplète. | POIDS_ABSENT résiduel après rechargement BDD |
| OBS-AS-002 | Non bloquant | US-054 | `infrastructure-locale.md` non mis à jour avec les commandes PostgreSQL local. DoD partiellement non satisfaite. | Documentation incomplète pour les nouveaux développeurs |
| OBS-AS-003 | Non bloquant | US-058 | `infrastructure-locale.md` non mis à jour avec `ALLOWED_ORIGINS` / `INTERNAL_SECRET`. | Variables d'environnement non documentées pour DevOps |
| OBS-AS-004 | Non bloquant | US-059 | Pas de message utilisateur en cas de 413 — uniquement `console.warn`. Le livreur ne voit pas l'erreur. | UX dégradée silencieuse pour photos volumineuses |
| OBS-AS-005 | Non bloquant | US-055 | Navigation incomplète — sous-écrans (DetailColis, CapturePreuve, MesConsignes) en `useState`. Bouton retour Android non fonctionnel depuis ces sous-écrans. | UX Android dégradée jusqu'à R2 |
| OBS-AS-006 | Non bloquant | US-056 | `persist()` non appelé après `sync()`. Commandes traitées mais non retirées d'AsyncStorage jusqu'à la prochaine écriture. | Commandes pouvant réapparaître au redémarrage — idempotence serveur protège via 409 |
