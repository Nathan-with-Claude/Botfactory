# Archive — Journal @developpeur — 2026-03
> Archivé le 2026-04-02. Source : journal-developpeur.md

## Interventions archivées

| Date | US | Action | Fichier impl |
| --- | --- | --- | --- |
| 2026-03-20 | US-001 | Initialisation monorepo + implémentation complète (domain, application, infrastructure, interfaces, mobile) | /livrables/06-dev/vertical-slices/US-001-impl.md |
| 2026-03-20 | US-002 | Domain Service AvancementCalculator + bouton Clôture mobile (SC4) + bugfixes BUG-002 (tests) | /livrables/06-dev/vertical-slices/US-002-impl.md |
| 2026-03-20 | BUG-002 | Correction TourneeControllerTest rouge — diagnostic JAVA_HOME/PATH mismatch + Mockito subclass mock maker | /src/backend/svc-tournee/pom.xml, mockito-extensions/ |
| 2026-03-23 | US-002 | Ajout section "Commandes de lancement (tests manuels)" dans le vertical slice US-002 | /livrables/06-dev/vertical-slices/US-002-impl.md |
| 2026-03-23 | BUG-Playwright | Correction 3 bugs identifiés par tests Playwright : DevDataSeeder statuts (BUG-001), TourneeDTO.estTerminee manquant (BUG-002), ListeColisScreen testID estimation-fin conditionnel (BUG-003). 23/23 tests backend verts. API validée. | DevDataSeeder.java, TourneeDTO.java, ListeColisScreen.tsx |
| 2026-03-23 | US-003 | Implémentation filtrage par zone géographique : domain/filtreZone.ts + FiltreZones.tsx + ListeColisScreen mis à jour. TDD : 12 tests domaine + 9 tests composant + fix exclusion e2e dans Jest. 34/34 Jest verts + 23/23 backend verts. | /livrables/06-dev/vertical-slices/US-003-impl.md, src/mobile/src/domain/filtreZone.ts, src/mobile/src/components/FiltreZones.tsx, src/mobile/src/screens/ListeColisScreen.tsx |
| 2026-03-23 | US-004 | Implémentation détail colis : ConsulterDetailColisCommand/Handler + ColisNotFoundException (backend) + endpoint GET /api/tournees/{tourneeId}/colis/{colisId} + DetailColisScreen M-03 (mobile) + ColisItem navigable + navigation interne ListeColisScreen. TDD : 11 tests backend + 16 tests Jest. 34/34 backend verts + 50/50 Jest verts. | /livrables/06-dev/vertical-slices/US-004-impl.md |
| 2026-03-24 | US-005 | Implémentation déclaration d'échec : MotifNonLivraison + Disposition (enums domain), EchecLivraisonDeclare (Domain Event), Tournee.declarerEchecLivraison() (Aggregate, invariants), ColisEntity enrichie, POST /api/tournees/{tourneeId}/colis/{colisId}/echec (409 si transition interdite), écran M-05 DeclarerEchecScreen (motifs radio, dispositions radio, note optionnelle), navigation M-03→M-05→M-02. TDD : 20 tests backend + 14 tests Jest. 54/54 backend verts + 64/64 Jest verts. | /livrables/06-dev/vertical-slices/US-005-impl.md |
| 2026-03-24 | US-007 | Implémentation clôture de tournée : RecapitulatifTournee (Value Object domain), TourneeCloturee (Domain Event), Tournee.cloturerTournee() (idempotent, invariant A_LIVRER), CloturerTourneeHandler + POST /api/tournees/{id}/cloture (200/404/409), RecapitulatifTourneeScreen M-07. TDD : 13 tests backend + 10 tests Jest. 67/67 backend verts + 74/74 Jest verts. | /livrables/06-dev/vertical-slices/US-007-impl.md |
| 2026-03-24 | BUG-A/B/C | Corrections testID manquants (DetailColisScreen, DeclarerEchecScreen) + RecapitulatifTournee.calculer() filtre ECHEC+A_REPRESENTER (était StatutColis.A_REPRESENTER jamais émis). | .tsx, TourneeTest.java |
| 2026-03-24 | US-008 | Implémentation signature numérique : BC-02 collocalisé (domain/preuves/), PreuveLivraison Aggregate immuable + 4 factory methods, ConfirmerLivraisonHandler, POST /livraison. TDD : 97/97 backend verts + 93/93 Jest verts. | /livrables/06-dev/vertical-slices/US-008-impl.md |
| 2026-03-24 | US-009 | Preuves alternatives (PHOTO, TIERS_IDENTIFIE, DEPOT_SECURISE) + factory methods + CapturePreuveScreen. Caméra native déférée US-010. | /livrables/06-dev/vertical-slices/US-009-impl.md |
| 2026-03-24 | US-017 | Création svc-oms (BC-05, port 8083) : OmsApiPort + OmsApiClient (simulé MVP) + OutboxPoller @Scheduled 10s. 5 tests handler + 6 tests controller verts. | /livrables/06-dev/vertical-slices/US-017-impl.md |
| 2026-03-24 | US-018 | Event Store append-only : EvenementLivraison record immuable + EvenementStoreImpl JPA (updatable=false) + EnregistrerEvenementHandler (idempotence 409). 23 tests verts. | /livrables/06-dev/vertical-slices/US-018-impl.md |
| 2026-03-24 | US-010 | ConsulterPreuveLivraisonQuery/Handler + PreuveController GET /api/preuves/livraison/{colisId} (403/404/200) + ConsulterPreuvePage.tsx. 105/105 backend + 7/7 Jest verts. | /livrables/06-dev/vertical-slices/US-010-impl.md |
| 2026-03-24 | US-011 | Création svc-supervision (BC-03, port 8082) : VueTournee Read Model + TableauDeBordBroadcaster + TableauDeBordPage.tsx (W-01). 8/8 backend + 14/14 Jest verts. | /livrables/06-dev/vertical-slices/US-011-impl.md |
| 2026-03-24 | US-012 | Détail tournée superviseur : VueColis + VueTourneeDetail Read Models + GET /api/supervision/tournees/{id} + DetailTourneePage.tsx (W-02). | /livrables/06-dev/vertical-slices/US-012-impl.md |
| 2026-03-24 | US-013 | RisqueDetector domain service + DetecterTourneesARisqueHandler @Scheduled + alerte sonore + surbrillance frontend. 11 tests backend + 4 Jest. | /livrables/06-dev/vertical-slices/US-013-impl.md |
| 2026-03-24 | US-014 | Instruction Aggregate + InstructionEnvoyee event + EnvoyerInstructionHandler + POST /api/supervision/instructions + PanneauInstructionPage W-03. 12 tests backend + 6 Jest. | /livrables/06-dev/vertical-slices/US-014-impl.md |
| 2026-03-24 | US-015 | marquerExecutee() + 3 endpoints + onglet W-02 + auto-exec M-03. 50 tests backend + 3 web + 5 mobile verts. | /livrables/06-dev/vertical-slices/US-015-impl.md |
| 2026-03-24 | US-016 | BandeauInstructionOverlay M-06 + polling 10s + déduplication instructionsVues Set + supervisionApi.ts. FCM déféré Sprint 3. 5 tests Jest mobile. | /livrables/06-dev/vertical-slices/US-016-impl.md |
| 2026-03-24 | US-021 | BC-07 Planification dans svc-supervision : TourneePlanifiee Aggregate + GET /api/planification/plans/{date} + PreparationPage W-04. 83/83 backend + 11 Jest verts. | /livrables/06-dev/vertical-slices/US-021-impl.md |
| 2026-03-24 | US-022/023/024 | Vérification composition + Affectation livreur/véhicule (invariants unicité) + Lancement tournée. TourneeLancee loggué MVP. | /livrables/06-dev/vertical-slices/US-022/023/024-impl.md |
| 2026-03-24 | US-019 | Auth SSO mobile : authStore + ConnexionScreen M-01 + SecurityConfig OAuth2 conditionnel. 16+8+4 tests. 109/109 backend + 153/153 mobile verts. | /livrables/06-dev/vertical-slices/US-019-impl.md |
| 2026-03-24 | US-020 | Auth SSO web : webAuthService OAuth2 Auth Code + ConnexionPage + AuthCallbackPage. 15 tests web. 83/83 backend verts. | /livrables/06-dev/vertical-slices/US-020-impl.md |
| 2026-03-24 | US-006 | Mode offline MVP : offlineQueue FIFO + idempotence commandId + SyncIndicator + CommandIdempotencyFilter backend. WatermelonDB déféré Sprint 4. 32 tests mobiles. | /livrables/06-dev/vertical-slices/US-006-impl.md |
| 2026-03-25 | OBS post-QA | Corrections OBS-021-01 (DevDataSeeder deleteAll), OBS-011-01 (TableauDeBordDTO.bandeau), OBS-024-01 (lancee→lanceeLe), OBS-017-01 (EvenementController 201+body). | Divers |
| 2026-03-30 | US-034 | VehiculeReaffecte event + ReaffecterVehiculeHandler + GET /vehicules/compatibles + POST /reaffecter-vehicule + panneau réaffectation W-05. 7+7+8 tests. | /livrables/06-dev/vertical-slices/US-034-impl.md |
| 2026-03-30 | US-035 | Recherche multi-critères tableau de bord : champ unique (codeTMS/zone/livreurNom), intersection filtre statut, rétrocompat. 9 Jest + 2 backend. 200/200 suite totale verts. | /livrables/06-dev/vertical-slices/US-035-impl.md |

## Décisions archivées

| Date | US | Décision | Justification |
| --- | --- | --- | --- |
| 2026-03-20 | US-001 | MockJwtAuthFilter (@Profile dev) injecte livreur-001/ROLE_LIVREUR | US-019 (SSO) non encore implémentée — TODO supprimer quand US-019 faite |
| 2026-03-20 | US-001 | DevDataSeeder (@Profile dev) crée la tournée de test avec 5 colis | BC-07 (Planification) non encore implémenté — TODO supprimer quand US-024 faite |
| 2026-03-20 | US-001 | Spring Boot 3.4.3 au lieu de 4.0.3 | Spring Boot 4.x non disponible en Q1 2026 — migrer dès disponibilité |
| 2026-03-20 | US-001 | H2 en mémoire (dev) + PostgreSQL (prod) dans application.yml | Pas de dépendance infra en développement local |
| 2026-03-20 | US-001 | Pattern collect-and-publish pour les Domain Events | Domaine pur sans dépendance Spring — Application Service orchestre la publication |
| 2026-03-20 | US-002 | AvancementCalculator créé en Domain Service (domain/service/) | Encapsule la logique de calcul d'avancement hors de l'Aggregate |
| 2026-03-20 | US-002 | estimationFin = null dans le MVP | Cadence moyenne non disponible sans historique — fonctionnalité future |
| 2026-03-20 | BUG-002 | mock-maker-subclass (CGLIB proxy) + JAVA_HOME JDK 25 pour Maven | JAVA_HOME=JDK20 vs PATH=JDK25 mismatch. mock-maker-subclass évite instrumentation bytecode Java 25+. |
| 2026-03-23 | BUG-Playwright | DevDataSeeder : paramètre StatutColis ajouté à createColis() | Le seeder passait A_LIVRER en dur — tests attendaient LIVRE/ECHEC. |
| 2026-03-23 | BUG-Playwright | ListeColisScreen : testID="estimation-fin" toujours rendu, valeur "--" si null | Rendu conditionnel empêchait Playwright de trouver l'élément. |
| 2026-03-23 | US-003 | filtreZone.ts : fonctions pures dans domain/ | Logique métier extraite hors composant pour testabilité |
| 2026-03-23 | US-003 | FlatList initialNumToRender=50 | FlatList virtualise ~10 items — nécessaire pour tests filtrage 22 colis |
| 2026-03-23 | US-003 | Jest : exclusion e2e/ via testPathIgnorePatterns | Specs Playwright ramassées par Jest sinon |
| 2026-03-23 | US-004 | Navigation interne ListeColisScreen sans React Navigation | Stack technique actuel sans React Navigation — TODO migrer |
| 2026-03-23 | US-004 | estTraite dans ColisDTO (backend) | US-004 requiert de savoir si le colis est terminal pour masquer les boutons |
| 2026-03-23 | US-004 | telephoneChiffre : transmis DTO, masqué UI via `tel:` | RGPD : jamais affiché en clair |
| 2026-03-24 | US-005 | HTTP 409 pour TourneeInvariantException | 409 Conflict plus sémantique que 400 pour conflit d'état métier |
| 2026-03-24 | US-005 | updateStatut() dans TourneeMapper étendu pour motif+disposition | Stratégie find+update nécessite mise à jour explicite de chaque champ |
| 2026-03-24 | US-007 | RecapitulatifTourneeResult suffixe "Result" | Collision de nom avec domain.model.RecapitulatifTournee |
| 2026-03-24 | US-008/009 | BC-02 collocalisé dans svc-tournee (package domain/preuves/) pour MVP | Coût déploiement 2e service non justifié — TODO extraire Sprint 4+ |
| 2026-03-24 | US-008/009 | Pad signature MVP = TouchableOpacity simulé | react-native-signature-canvas non installé — Déféré US-010 |
| 2026-03-24 | US-013 | RisqueDetector seuil configurable `supervision.risque.seuil-inactivite-min` (default 30 min) | Configurer à 5 min pour tests manuels rapides |
| 2026-03-24 | US-013 | scheduler initialDelay = 60s | Évite évaluation risque avant DevDataSeeder terminé |
| 2026-03-24 | US-014 | FCM déféré Sprint 3 | FCM non provisionné. KafkaProducer + micro-service notifications TODO. |
| 2026-03-24 | US-021/024 | BC-07 collocalisé dans svc-supervision | Déploiement 3e microservice non justifié MVP — TODO extraire Sprint 4+ |
| 2026-03-24 | US-021 | Zones/contraintes/anomalies sérialisées JSON (colonne TEXT) | Évite table jointure complexe pour listes immuables importées TMS |
| 2026-03-24 | US-024 | TourneeLancee loggué côté Controller (simulation bus Kafka) | Kafka non provisionné. TODO Sprint 3 : KafkaProducer. |
| 2026-03-24 | US-015 | List<Object> pour domain events Instruction | Union InstructionEnvoyee|InstructionExecutee sans sealed interface |
| 2026-03-24 | US-016 | Polling HTTP 10s au lieu de FCM | FCM non provisionné. TODO Sprint 3 : Kafka Consumer → FCM. |
| 2026-03-24 | US-016 | supervisionApi.ts séparé de tourneeApi.ts | BC-04 distinct de BC-01. URLs différentes (8082 vs 8081). |
| 2026-03-24 | BUG-InstructionController | SecurityConfig : règles précises LIVREUR avant catchall SUPERVISEUR | Spring Security évalue dans l'ordre — catchall bloquait les routes spécifiques LIVREUR |
| 2026-03-24 | BUG-EnvoyerInstruction | instructionRepository.save() sans retour + clearEvenements() sur objet original | Mockito retourne null par défaut → NPE corrigé |
| 2026-03-24 | US-019 | isProdProfile() dans SecurityConfig | Spring auto-configure JwtDecoder quand oauth2-resource-server sur classpath — sans garde @WebMvcTest échoue |
| 2026-03-24 | US-019 | authStore pattern factory (createAuthStore) sans Zustand | Store léger, pub/sub via Set<listeners>, testable par injection |
| 2026-03-24 | US-020 | Tokens en sessionStorage (scope session) | RGPD : effacés à fermeture onglet. Cookie HttpOnly recommandé prod. |
| 2026-03-24 | US-006 | offlineQueue en mémoire (Map+Array) — WatermelonDB déféré | WatermelonDB nécessite bindings natifs non provisionnés Expo |
| 2026-03-24 | US-006 | CommandIdempotencyFilter avec ConcurrentHashMap — Redis déféré Sprint 4 | Thread-safe mono-instance. TODO RedisTemplate pour multi-instance prod. |
| 2026-03-30 | US-037 | AsyncStorage clé `consignes_jour_YYYY-MM-DD` — TTL implicite par rotation de clé | Pas de logique d'expiration — changement de date produit nouvelle clé vide |
| 2026-03-30 | US-037 | onConsignePersistee optionnelle dans BandeauInstructionOverlay | Rétrocompatibilité max avec 5 tests US-016 existants sans modification |
| 2026-03-30 | US-037 | Navigation M-07→M-03 déféré Sprint 5 | Complexité navigation (remonter tourneeId). Noté dans vertical slice. |
| 2026-03-30 | US-034 | rechercherVehiculesCompatibles triés par capacité croissante | UX : montrer d'abord le véhicule le plus proche de la capacité requise |
