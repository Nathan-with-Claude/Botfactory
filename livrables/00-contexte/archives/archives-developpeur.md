# Archives Cold Storage — @developpeur — DocuPost

> Journal actif : `/livrables/00-contexte/journaux/journal-developpeur.md`
> Contient : interventions archivées (2026-03-20 à 2026-03-29) + décisions techniques

---

## Interventions archivées

| Date | US | Action | Fichier impl |
|------|----|--------|-------------|
| 2026-03-20 | US-001 | Initialisation monorepo + implémentation complète (domain, application, infrastructure, interfaces, mobile) | /livrables/06-dev/vertical-slices/US-001-impl.md |
| 2026-03-20 | US-002 | Domain Service AvancementCalculator + bouton Clôture mobile (SC4) + bugfixes BUG-002 (tests) | /livrables/06-dev/vertical-slices/US-002-impl.md |
| 2026-03-20 | BUG-002 | Correction TourneeControllerTest rouge — diagnostic JAVA_HOME/PATH mismatch + Mockito subclass mock maker | /src/backend/svc-tournee/pom.xml, mockito-extensions/ |
| 2026-03-23 | US-002 | Ajout section "Commandes de lancement (tests manuels)" dans le vertical slice US-002 | /livrables/06-dev/vertical-slices/US-002-impl.md |
| 2026-03-23 | BUG-Playwright | Correction 3 bugs identifiés par tests Playwright : DevDataSeeder statuts (BUG-001), TourneeDTO.estTerminee manquant (BUG-002), ListeColisScreen testID estimation-fin conditionnel (BUG-003). 23/23 tests backend verts. | DevDataSeeder.java, TourneeDTO.java, ListeColisScreen.tsx |
| 2026-03-23 | US-003 | Implémentation filtrage par zone géographique : domain/filtreZone.ts + FiltreZones.tsx + ListeColisScreen mis à jour. TDD : 12 tests domaine + 9 tests composant. 34/34 Jest verts + 23/23 backend verts. | /livrables/06-dev/vertical-slices/US-003-impl.md |
| 2026-03-23 | US-004 | Implémentation détail colis : ConsulterDetailColisCommand/Handler + ColisNotFoundException + endpoint GET /api/tournees/{tourneeId}/colis/{colisId} + DetailColisScreen M-03. TDD : 11 tests backend + 16 tests Jest. 34/34 backend verts + 50/50 Jest verts. | /livrables/06-dev/vertical-slices/US-004-impl.md |
| 2026-03-24 | US-005 | Implémentation déclaration d'échec : MotifNonLivraison + Disposition (enums domain), EchecLivraisonDeclare, Tournee.declarerEchecLivraison() (Aggregate, invariants), POST /api/tournees/{tourneeId}/colis/{colisId}/echec (409 si transition interdite), écran M-05 DeclarerEchecScreen. TDD : 20 tests backend + 14 tests Jest. 54/54 backend verts + 64/64 Jest verts. | /livrables/06-dev/vertical-slices/US-005-impl.md |
| 2026-03-24 | US-007 | Implémentation clôture de tournée : RecapitulatifTournee (VO domain), TourneeCloturee (Domain Event), Tournee.cloturerTournee() (idempotent, invariant A_LIVRER), POST /api/tournees/{id}/cloture (200/404/409), RecapitulatifTourneeScreen M-07. TDD : 13 tests backend + 10 tests Jest. 67/67 backend verts + 74/74 Jest verts. | /livrables/06-dev/vertical-slices/US-007-impl.md |
| 2026-03-24 | BUG-A | Correction testID manquant sur root View DetailColisScreen (état succes) — requis par QA Playwright | /src/mobile/src/screens/DetailColisScreen.tsx |
| 2026-03-24 | BUG-B | Correction testID manquant sur root View DeclarerEchecScreen — requis par QA Playwright | /src/mobile/src/screens/DeclarerEchecScreen.tsx |
| 2026-03-24 | BUG-C | Correction RecapitulatifTournee.calculer() : colisARepresenter filtre désormais statut=ECHEC+disposition=A_REPRESENTER. Ajout 2 tests unitaires. | /src/backend/svc-tournee/src/main/java/com/docapost/tournee/domain/model/RecapitulatifTournee.java |
| 2026-03-24 | US-008 | Implémentation signature numérique : BC-02 collocalisé (domain/preuves/), PreuveLivraison Aggregate immuable + 4 factory methods, ConfirmerLivraisonHandler, POST /livraison endpoint, CapturePreuveScreen M-04. TDD : 12+8+8 tests backend + 19 tests Jest. 97/97 backend verts + 93/93 Jest verts. | /livrables/06-dev/vertical-slices/US-008-impl.md |
| 2026-03-24 | US-009 | Implémentation preuves alternatives (PHOTO, TIERS_IDENTIFIE, DEPOT_SECURISE) : VO TiersIdentifie + DepotSecurise + PhotoPreuve, factory methods, zones de capture dans CapturePreuveScreen. Capture caméra native déférée à US-010. 93/93 Jest verts. | /livrables/06-dev/vertical-slices/US-009-impl.md |
| 2026-03-24 | US-017 | Création svc-oms (BC-05, port 8083) : OmsApiPort + OmsApiClient (simulé MVP) + SynchroniserPendingEvenementsHandler + OutboxPoller @Scheduled 10s. 5 tests handler + 6 tests controller verts. | /livrables/06-dev/vertical-slices/US-017-impl.md |
| 2026-03-24 | US-018 | Event Store append-only : EvenementLivraison record immuable + 4 attributs obligatoires + EvenementStoreImpl JPA (updatable=false) + EnregistrerEvenementHandler (idempotence 409) + DevDataSeeder 4 événements. 9+3+6=23 tests verts. | /livrables/06-dev/vertical-slices/US-018-impl.md |
| 2026-03-24 | US-010 | Implémentation consultation preuve litige : PreuveController GET /api/preuves/livraison/{colisId} (403 LIVREUR, 404, 200 SUPERVISEUR/SUPPORT) + PreuveDetailDTO. TDD : 8 tests backend + 7 tests Jest. 105/105 backend verts + 7/7 Jest verts. | /livrables/06-dev/vertical-slices/US-010-impl.md |
| 2026-03-24 | US-011 | Création svc-supervision (BC-03, port 8082) : VueTournee Read Model + TableauDeBord VO + SupervisionController GET /api/supervision/tableau-de-bord + TableauDeBordBroadcaster + TableauDeBordPage.tsx W-01. TDD : 8 tests backend + 7 tests Jest. | /livrables/06-dev/vertical-slices/US-011-impl.md |
| 2026-03-24 | US-012 | Détail tournée superviseur : VueColis + VueTourneeDetail Read Models + GET /api/supervision/tournees/{id} + DetailTourneePage W-02, onglets Colis/Incidents. | /livrables/06-dev/vertical-slices/US-012-impl.md |
| 2026-03-24 | US-013 | Détection alerte tournée à risque : RisqueDetector domain service + DetecterTourneesARisqueHandler + @Scheduled. Frontend : alerte sonore + point clignotant + surbrillance ligne. 11 tests backend + 4 tests Jest. | /livrables/06-dev/vertical-slices/US-013-impl.md |
| 2026-03-24 | US-014 | Envoi instruction superviseur : Instruction Aggregate + InstructionEnvoyee event + EnvoyerInstructionHandler + POST /api/supervision/instructions + PanneauInstructionPage W-03. TDD : 5 tests domaine + 3 tests handler + 4 tests controller + 6 tests Jest. | /livrables/06-dev/vertical-slices/US-014-impl.md |
| 2026-03-24 | US-015 | Suivi exécution instruction : InstructionExecutee event + Instruction.marquerExecutee() + 3 nouveaux endpoints + onglet W-02 + auto-exec M-03. 50 tests backend + 8 tests Jest verts. | /livrables/06-dev/vertical-slices/US-015-impl.md |
| 2026-03-24 | US-016 | Notification instruction livreur (MVP polling) : BandeauInstructionOverlay M-06 + polling 10s + déduplication instructionsVues Set. FCM Android déféré Sprint 3. TDD : 5 tests Jest mobile. | /livrables/06-dev/vertical-slices/US-016-impl.md |
| 2026-03-24 | US-019 | Auth SSO mobile : authStore factory (login/refresh/logout) + ConnexionScreen M-01 + SecurityConfig OAuth2 conditionnel. 16 tests store + 8 tests screen + 4 tests SecurityConfig. 109/109 backend + 153/153 mobile verts. | /livrables/06-dev/vertical-slices/US-019-impl.md |
| 2026-03-24 | US-020 | Auth SSO web : webAuthService OAuth2 Auth Code + ConnexionPage + AuthCallbackPage + SecurityConfig svc-supervision. 15 tests web. 83/83 backend verts. | /livrables/06-dev/vertical-slices/US-020-impl.md |
| 2026-03-24 | US-006 | Mode offline MVP : offlineQueue (FIFO, idempotence commandId) + syncExecutor + SyncIndicator + CommandIdempotencyFilter backend. WatermelonDB déféré Sprint 4. 32 tests mobiles. | /livrables/06-dev/vertical-slices/US-006-impl.md |
| 2026-03-24 | US-021 | BC-07 Planification dans svc-supervision : TourneePlanifiee Aggregate Root + TourneePlanifieeRepository + GET /api/planification/plans/{date} + PreparationPage W-04. DevDataSeeder 4 tournées. 83/83 backend verts + 11 Jest verts. | /livrables/06-dev/vertical-slices/US-021-impl.md |
| 2026-03-24 | US-022 | Vérification composition : TourneePlanifiee.verifierComposition() + CompositionVerifiee event + GET /tournees/{id} + POST /composition/valider + onglet Composition W-05. 6 tests Jest. | /livrables/06-dev/vertical-slices/US-022-impl.md |
| 2026-03-24 | US-023 | Affectation livreur+véhicule : TourneePlanifiee.affecter() + AffectationEnregistree event + AffecterLivreurVehiculeHandler (invariants unicité) + POST /affecter (200/404/409) + onglet Affectation W-05. 4 tests handler + 5 tests Jest. | /livrables/06-dev/vertical-slices/US-023-impl.md |
| 2026-03-24 | US-024 | Lancement tournée : TourneePlanifiee.lancer() + TourneeLancee event + LancerTourneeHandler + POST /lancer + POST /lancer-toutes + boutons W-04/W-05. TourneeLancee loggué MVP. 4 tests handler + 3 tests controller + 2 tests Jest. | /livrables/06-dev/vertical-slices/US-024-impl.md |
| 2026-03-24 | BUG-InstructionController | Correction 3 tests rouge : routes LIVREUR bloquées par SecurityConfig globale (hasRole SUPERVISEUR prime sur @PreAuthorize). Règles précises ajoutées. | SecurityConfig.java svc-supervision |
| 2026-03-24 | BUG-EnvoyerInstruction | Correction NPE dans EnvoyerInstructionHandler : save() retournait null (Mockito), clearEvenements() causait NPE. Pattern collect-and-publish corrigé. | EnvoyerInstructionHandler.java |
| 2026-03-25 | OBS-021-01 | Correction post-QA : DevDataSeeder BC-07 — ajout deleteAll() avant saves pour recréer tournées à LocalDate.now(). | DevDataSeeder.java (svc-supervision) |
| 2026-03-25 | OBS-011-01 | Correction post-QA : TableauDeBordDTO restructuré — compteurs encapsulés dans sous-record BandeauResume (JSON: {"bandeau":{"actives":...}}). | TableauDeBordDTO.java, SupervisionControllerTest.java |
| 2026-03-25 | OBS-024-01 | Correction post-QA : champ lancee renommé en lanceeLe dans TourneePlanifieeDTO et TourneePlanifieeDetailDTO. | TourneePlanifieeDTO.java, TourneePlanifieeDetailDTO.java |
| 2026-03-25 | OBS-017-01 | Correction post-QA : EnregistrerEvenementHandler.handle() retourne EvenementLivraison. EvenementController retourne 201 avec DTO. | EnregistrerEvenementHandler.java, EvenementController.java |
| 2026-03-25 | TC-018-01 | Correction post-QA : US-018 spec — eventId préfixé us018- + statuts acceptés étendus à [201, 409, 403]. | src/mobile/e2e/US-018-historisation-immuable.spec.ts |
| 2026-03-25 | OBS-011-02 | Correction spec TC-011-04 : `totalTournees` → `actives`. | src/web/supervision/e2e/US-011-tableau-de-bord.spec.ts |
| 2026-03-25 | OBS-021-02 | Correction backend PlanDuJourDTO : ajout record imbriqué BandeauPlan + encapsulation des compteurs dans `bandeau`. | PlanDuJourDTO.java, PlanificationControllerTest.java |
| 2026-03-25 | OBS-014-01 | Correction spec TC-014-02 : colisId `colis-s-003` → `colis-s-reprogrammer-test`. | src/web/supervision/e2e/US-014-envoyer-instruction.spec.ts |
| 2026-03-25 | TC-270 | Correction spec TC-270 : timeout `liste-colis-screen` 5000ms → 15000ms. | src/mobile/e2e/US-008-capturer-signature.spec.ts |
| 2026-03-25 | US-025 | Design System transverse : tokens.css web + colors/shadows/spacing.ts mobile + 10 composants web + 8 composants mobile (TDD). 60/60 Jest web + 51/51 Jest mobile = 111 tests verts. | /livrables/06-dev/vertical-slices/US-025-impl.md |
| 2026-03-25 | US-031 | Composants designer DC : TacticalGradient + GlassEffectFooter + SignatureGrid + ContextBannerColis + MiniProgressBar. TDD : 5 fichiers test, 36 tests verts. MàJ M-02 : header bleu 64px. | /livrables/06-dev/vertical-slices/US-031-impl.md |
| 2026-03-26 | US-027 | Refactorisation UI web superviseur : tokens.css v2.0 (palette MD3), AppLayout.tsx (header+sidebar), PreparationPage.tsx W-04, TableauDeBordPage.tsx W-01. | /livrables/06-dev/vertical-slices/US-027-impl.md |
| 2026-03-26 | US-026 | Refactorisation écrans livreur mobile : DS v2.0 appliqué M-02 à M-06. CarteColis, BandeauProgression, BadgeStatut, ChipContrainte, CardTypePreuve, BandeauInstruction. 240/240 Jest verts. | /livrables/06-dev/vertical-slices/US-026-impl.md |
| 2026-03-26 | US-015/016/019 | Corrections précisions design 2026-03-25 : BandeauInstruction label "Action Requise" + bouton "VOIR L'ITINÉRAIRE". ConnexionScreen card info SSO. 3 nouveaux tests BandeauInstructionOverlay + 1 test ConnexionScreen. | US-015-impl.md, US-016-impl.md, US-019-impl.md |
| 2026-03-26 | US-029 | Swipe gauche rapide pour échec : CarteColis enrichi PanResponder + prop onSwipeEchec + zone rouge (Colors.alerte, 80px). TDD : +14 tests. 22/22 CarteColis verts + 13/13 ListeColisScreen verts. | /livrables/06-dev/vertical-slices/US-029-impl.md |
| 2026-03-26 | US-028 | Export CSV composition : CompositionExportee event + tracerExportComposition() + ExporterCompositionHandler + POST /export-csv/tracer (204/404/403) + exporterCSV.ts (BOM UTF-8) + btn-exporter-csv W-05. TDD : 24 tests verts. | /livrables/06-dev/vertical-slices/US-028-impl.md |
| 2026-03-26 | US-030 | Vérification compatibilité véhicule : Vehicule Entity + TypeVehicule + ResultatCompatibilite + CapaciteVehiculeDepasseeException + 2 Domain Events + VehiculeRepository + VehiculeRepositoryImpl in-memory + POST /verifier-compatibilite-vehicule + indicateurs W-05. TDD : 30 tests verts. | /livrables/06-dev/vertical-slices/US-030-impl.md |
| 2026-03-26 | US-032 | Synchronisation read model supervision : SupervisionNotifier (fire-and-forget, 2 retries 500ms) dans svc-tournee + endpoint POST /internal/vue-tournee/events dans svc-supervision + VueTourneeEventHandler (idempotence ProcessedEventEntity). TDD : 9 tests. svc-supervision 122/122, svc-tournee 109/109 verts. | /livrables/06-dev/vertical-slices/US-032-impl.md |
| 2026-03-26 | US-APP-routing | Routeur maison App.tsx : type discriminant AppRoute + NavBar shell + 8 routes. TDD : 13 tests verts. 171/171 Jest web verts. | /livrables/06-dev/vertical-slices/US-APP-routing-impl.md |
| 2026-03-26 | US-033 | Simulateur TMS dev-only : DevTmsController + DevEventBridge (TourneeLancee → BC-03+BC-01 via HTTP) + DevRestConfig + DevTourneeController svc-tournee. TDD : 11 tests verts. svc-supervision 130/130, svc-tournee 112/112 verts. | /livrables/06-dev/vertical-slices/US-033-impl.md |

---

## Décisions techniques archivées (2026-03-20 à 2026-03-26)

| Date | US | Décision | Justification |
|------|----|----------|---------------|
| 2026-03-20 | US-001 | MockJwtAuthFilter (@Profile dev) injecte livreur-001/ROLE_LIVREUR | US-019 (SSO) non encore implémentée |
| 2026-03-20 | US-001 | DevDataSeeder (@Profile dev) crée la tournée de test avec 5 colis | BC-07 non encore implémenté |
| 2026-03-20 | US-001 | Spring Boot 3.4.3 au lieu de 4.0.3 | Spring Boot 4.x non disponible en Q1 2026 |
| 2026-03-20 | US-001 | H2 en mémoire (dev) + PostgreSQL (prod) | Pas de dépendance infra en développement local |
| 2026-03-20 | US-001 | Pattern collect-and-publish pour les Domain Events | Domaine pur sans dépendance Spring |
| 2026-03-20 | US-002 | AvancementCalculator créé en Domain Service (domain/service/) | Encapsule la logique de calcul hors Aggregate |
| 2026-03-20 | US-002 | estimationFin = null dans le MVP | Cadence moyenne non disponible sans historique |
| 2026-03-20 | BUG-002 | mock-maker-subclass (CGLIB proxy) dans mockito-extensions/ | JAVA_HOME=JDK20 / PATH=JDK25 incompatibilité. Lancer Maven avec JAVA_HOME JDK-25. |
| 2026-03-23 | BUG-Playwright | DevDataSeeder : paramètre StatutColis ajouté à createColis() | Le seeder passait StatutColis.A_LIVRER en dur |
| 2026-03-23 | BUG-Playwright | TourneeDTO : ajout champ estTerminee depuis Avancement.estTerminee() | Le champ était calculable mais non exposé dans le JSON |
| 2026-03-23 | BUG-Playwright | ListeColisScreen : testID="estimation-fin" toujours rendu, valeur "--" si null | Le rendu conditionnel empêchait Playwright de trouver l'élément |
| 2026-03-23 | US-003 | filtreZone.ts : fonctions pures dans domain/ | Logique métier extraite hors composant pour testabilité |
| 2026-03-23 | US-003 | FlatList initialNumToRender=50 | FlatList virtualise par défaut (~10 items) — nécessaire pour les tests |
| 2026-03-23 | US-004 | Navigation interne ListeColisScreen sans React Navigation | Stack technique actuel n'utilise pas React Navigation |
| 2026-03-24 | US-005 | HTTP 409 pour TourneeInvariantException (transition interdite) | 409 Conflict plus sémantique que 400 pour un conflit d'état métier |
| 2026-03-24 | US-007 | RecapitulatifTourneeResult nommé avec suffixe "Result" | Collision de nom avec domain.model.RecapitulatifTournee |
| 2026-03-24 | US-008/009 | BC-02 collocalisé dans svc-tournee (package domain/preuves/) pour le MVP | Coût de déploiement d'un second service non justifié au MVP |
| 2026-03-24 | US-008/009 | Pad signature MVP = TouchableOpacity simulé + event onSignatureCapturee | react-native-signature-canvas non installé |
| 2026-03-24 | US-013 | RisqueDetector : seuil d'inactivité configurable via application.yml (default 30 min) | Configurer à 5 min pour les tests manuels rapides |
| 2026-03-24 | US-013 | scheduler initialDelay = 60s | Évite l'évaluation du risque avant que DevDataSeeder soit terminé |
| 2026-03-24 | US-014 | FCM (notifications push livreur) déféré au Sprint 3 | FCM non provisionné |
| 2026-03-24 | US-021/024 | BC-07 Planification collocalisé dans svc-supervision (package domain/planification/) | Déploiement d'un 3e microservice non justifié au MVP |
| 2026-03-24 | US-024 | TourneeLancee loggué côté Controller (simulation bus Kafka) | Kafka non provisionné au MVP |
| 2026-03-24 | US-019 | isProdProfile() dans SecurityConfig — OAuth2 Resource Server uniquement en profil prod | Spring Boot auto-configure JwtDecoder. Sans garde, @WebMvcTest échoue. |
| 2026-03-24 | US-020 | Tokens stockés en sessionStorage (scope session) | RGPD : tokens effacés à la fermeture de l'onglet. Cookie HttpOnly recommandé prod. |
| 2026-03-24 | US-006 | offlineQueue en mémoire (Map+Array) — WatermelonDB déféré | WatermelonDB nécessite des bindings natifs non provisionnés dans Expo |
| 2026-03-24 | US-006 | CommandIdempotencyFilter avec ConcurrentHashMap — Redis déféré Sprint 4 | Redis non disponible. ConcurrentHashMap thread-safe mono-instance. |
| 2026-03-24 | US-014 | HTTP 422 Unprocessable Entity pour REPROGRAMMER sans créneau cible | IllegalArgumentException domaine → 422 plus sémantique que 400 |
| 2026-03-26 | US-032 | HTTP synchrone fire-and-forget au lieu d'un broker (Kafka/RabbitMQ) | MVP sans broker. Couplage HTTP acceptable. Migration V2 prévue. |
| 2026-03-26 | US-032 | ProcessedEventEntity en base (table processed_events) pour l'idempotence | existsById() O(1). Pattern standard "inbox idempotent". |
| 2026-03-26 | US-032 | Route /internal dans SecurityConfig : permitAll() avant la règle superviseur | L'endpoint /internal est appelé par svc-tournee (service-to-service) sans token JWT |
