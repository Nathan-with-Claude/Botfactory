# CHANGELOG des actions agents — DocuPost

> Format : [date ISO] [agent] [type d'action] → [fichier(s) impacté(s)]
> [résumé très court]

- 2026-04-07T10:30Z @devops CREATE → /livrables/08-devops/as-built-cloudrun-recette.md
  As-built complet Cloud Run : état réel des 3 services, env vars, secrets, IAM, 10 bugs corrigés, limitations connues.

- 2026-04-07T10:30Z @devops FIX → svc-supervision (Cloud Run) ALLOWED_ORIGINS=placeholder → URL réelle
  Bug : ALLOWED_ORIGINS pointait vers frontend-supervision-placeholder.a.run.app au lieu de l'URL réelle.

- 2026-04-07T10:30Z @devops UPDATE → /livrables/00-contexte/infrastructure-locale.md
  Correction noms des secrets (db-password → tournee-db-password + supervision-db-password) + commande deploy.

- 2026-04-07T09:00Z @devops CREATE → /livrables/08-devops/deploiement-manuel-gcp.md
  Procédure de déploiement manuel GCP sans connexion GitHub (gcloud builds submit, build local, rollback, logs).

- 2026-04-07T09:00Z @devops UPDATE → /livrables/00-contexte/infrastructure-locale.md
  Ajout section "Environnement recette GCP" : ressources provisionnées le 2026-04-06 (Artifact Registry, Cloud SQL, secrets, IAM, Dockerfiles).

- 2026-04-06T12:30Z @developpeur IMPL → US-066 Page état des livreurs (W-08)
  Backend svc-supervision : EtatJournalierLivreur, VueLivreur, LivreurReferentiel, ConsulterEtatLivreursHandler, DevLivreurReferentiel, LivreurEtatWebSocketPublisher, LivreurEtatController, LivreurEtatDTO. Frontend : EtatLivreursPage.tsx + App.tsx (route + nav). 6/6 tests Java + 17/17 tests React verts. 171/171 svc-supervision + 289/289 web.

- 2026-04-06T12:30Z @developpeur CREATE → /livrables/06-dev/vertical-slices/US-066-impl.md
  Livrable vertical slice US-066 : commandes, URLs, décisions d'implémentation.

- 2026-04-06T20:30Z @architecte-technique CREATE → /livrables/04-architecture-technique/specs-us066-etat-livreurs.md
  US-066 : Spécification technique complète "Page état des livreurs". Endpoint GET /api/supervision/livreurs/etat-du-jour, classes LivreurReferentiel/EtatJournalierLivreur/VueLivreur/ConsulterEtatLivreursHandler/LivreurEtatWebSocketPublisher/LivreurEtatController/LivreurEtatDTO. Stratégie agrégation à la volée (Option A MVP).

- 2026-04-06T20:30Z @architecte-technique UPDATE → /livrables/04-architecture-technique/architecture-applicative.md
  Ajout extension BC-07 dans la section BC-03 svc-supervision : EtatJournalierLivreur, VueLivreur, LivreurReferentiel, ConsulterEtatLivreursHandler, LivreurEtatWebSocketPublisher, LivreurEtatController, LivreurEtatDTO (US-066).

- 2026-04-06T20:30Z @architecte-technique UPDATE → /livrables/00-contexte/journaux/journal-architecte-technique.md
  Ajout intervention US-066, 3 nouvelles décisions structurantes, 3 nouveaux points d'attention (WebSocketConfig absent, DevDataSeeder à aligner, post-MVP CQRS).

- 2026-04-06T19:30Z @ux UPDATE → /livrables/02-ux/wireframes.md
  Ajout wireframe W-08 "Etat des livreurs" (US-066) : tableau VueLivreur temps reel, 3 tuiles KPI, filtres rapides, badges SANS_TOURNEE/AFFECTE/EN_COURS, navigation W-02/W-04/W-05, etats speciaux complets. Version 1.4.

- 2026-04-06T19:30Z @ux UPDATE → /livrables/02-ux/user-journeys.md
  Ajout Parcours 6 "Verifier la disponibilite des livreurs avant d'affecter une nouvelle tournee" (AS-IS + TO-BE, Domain Events, termes domaine, frontieres BC). Glossaire enrichi : 8 nouveaux termes UL.

- 2026-04-06T19:30Z @ux UPDATE → /livrables/00-contexte/journaux/journal-ux.md
  Mise a jour journal : intervention W-08/Parcours 6, 3 nouvelles decisions structurantes, points d'attention (SideNavBar, VueLivreur, signaux UL vers architecte-metier).

- 2026-04-06T18:00Z @po CREATE → /livrables/05-backlog/user-stories/US-066-page-etat-livreurs.md
  US-066 : Page etat des livreurs (W-08) — vue recapitulative SANS_TOURNEE / AFFECTE_NON_LANCE / EN_COURS pour superviseur. Agents a notifier : @ux, @architecte-metier, @architecte-technique, @developpeur.

- 2026-04-05T14:00Z @developpeur IMPLEMENT → src/web/supervision/src/pages/DetailTourneePage.tsx, src/web/supervision/src/pages/PanneauInstructionPage.tsx, src/web/supervision/src/styles/globals.css, /livrables/06-dev/vertical-slices/US-063-impl.md
  US-063 : Réécriture JSX Tailwind/tokens MD3 W-02+W-03. Cards radio, textarea message, glass-overlay. 272/272 tests verts.

- 2026-04-05T12:00Z @infra UPDATE → /livrables/00-contexte/infrastructure-locale.md
  Port app mobile (expo-web) changé de 8084 → 8083.

- 2026-04-05T10:00Z @devops CREATE → /livrables/08-devops/strategie-deploiement-gcp-test.md
  Livrable complet déploiement GCP : 3 environnements (integration/recette/staging), Cloud Run + Cloud SQL + Terraform + GitHub Actions, checklist, coûts estimatifs, risques.

- 2026-04-05T10:00Z @devops UPDATE → /livrables/00-contexte/journaux/journal-devops.md
  Ajout intervention GCP, décisions structurantes (Cloud Run vs GKE, Keycloak min-instances, Terraform), points d'attention enrichis.

- 2026-04-05T08:00Z @end-user CREATE → /livrables/09-feedback/feedback-mobile-livreur-2026-04-05.md
  Feedback terrain livreur (Pierre Morel) : US-046/055/056/062/038/043 — note 7/10, 1 bloquant (Retour Android R2), 4 améliorations importantes, signal Ubiquitous Language (9 termes)

- 2026-04-05T08:00Z @end-user CREATE → /livrables/09-feedback/feedback-supervision-superviseur-2026-04-05.md
  Feedback terrain superviseur (Laurent Renaud) : US-039/040/041/044 — note 7.5/10, 2 bloquants (lancement groupé tournées, reco véhicule W-04), 3 améliorations importantes, signal Ubiquitous Language (10 termes)

- 2026-04-05T08:00Z @end-user UPDATE → /livrables/00-contexte/journaux/journal-end-user.md
  Mise à jour journal : 2 feedbacks du 05/04 enregistrés, points d'attention mis à jour, nouvelles US à créer identifiées

- 2026-04-05T00:00Z @developpeur FIX → src/mobile/src/screens/DetailColisScreen.tsx, CapturePreuveScreen.tsx, DeclarerEchecScreen.tsx, RecapitulatifTourneeScreen.tsx, MesConsignesScreen.tsx
  US-055 R2 : BackHandler Android ajouté dans les 5 sous-écrans — bouton retour natif fonctionnel, 117/117 tests verts, OBS-AS-005 fermé
- 2026-04-05T00:00Z @qa UPDATE → livrables/07-tests/scenarios/US-055-scenarios.md, US-055-rapport-playwright.md
  TC-055-04 et TC-055-05 passés à Passé — US-055 entièrement validée

- 2026-04-04T23:59Z @developpeur CREATE → /src/mobile/src/navigation/AppNavigator.tsx
  US-055 : AppNavigator créé avec 7 routes (AppStackParamList). App.tsx référence AppStackParamList.

- 2026-04-04T23:59Z @developpeur UPDATE → /src/mobile/App.tsx
  US-055 : App.tsx migré vers RootStackParamList = AppStackParamList. Commentaires R2 ajoutés.

- 2026-04-04T23:59Z @developpeur CREATE → /src/mobile/src/__mocks__/reactNavigationMock.ts
  US-055 : mock useNavigation/useRoute pour tests Jest futurs.

- 2026-04-04T23:59Z @developpeur UPDATE → /src/mobile/src/components/design-system/IndicateurSync.tsx
  US-062 : prop pendingCount ajoutée + libellé "N envoi(s) en attente" + testID sync-pending-count.

- 2026-04-04T23:59Z @developpeur UPDATE → /src/mobile/src/components/design-system/__tests__/IndicateurSync.test.tsx
  US-062 : 7 nouveaux tests TDD couvrant les cas pendingCount (LIVE/OFFLINE, 0/1/N, singulier/pluriel).

- 2026-04-04T23:59Z @developpeur CREATE → /src/mobile/src/domain/offlineQueueInstance.ts
  US-062 : singleton offlineQueue partagé (pattern identique authStoreInstance).

- 2026-04-04T23:59Z @developpeur UPDATE → /src/mobile/src/screens/ListeColisScreen.tsx
  US-062 : import offlineQueueInstance + useState pendingCount + useEffect rafraîchissement + IndicateurSync pendingCount.

- 2026-04-04T23:59Z @developpeur FIX → /src/mobile/src/__tests__/ListeColisScreen.test.tsx
  Correction test pré-existant statut colis ("A livrer" → "A LIVRER", "Livre" → "LIVRÉ") aligné US-038.

- 2026-04-04T23:59Z @developpeur CREATE → /livrables/06-dev/vertical-slices/US-055-impl.md
  US-055 : vertical slice migration react-navigation Stack.

- 2026-04-04T23:59Z @developpeur CREATE → /livrables/06-dev/vertical-slices/US-062-impl.md
  US-062 : vertical slice compteur envois en attente IndicateurSync.

- 2026-04-04T23:59Z @developpeur UPDATE → /livrables/00-contexte/journaux/journal-developpeur.md
  Session US-055/062 : 2 US implémentées, 53/53 tests verts sur fichiers modifiés.

- 2026-04-04T22:15Z @developpeur CREATE → /livrables/06-dev/vertical-slices/US-057-impl.md
  US-057 : documentation vertical slice WebSocket STOMP (SupervisionWebSocketConfig + TableauDeBordBroadcaster).

- 2026-04-04T22:15Z @developpeur CREATE → /livrables/06-dev/vertical-slices/US-058-impl.md
  US-058 : documentation vertical slice CORS externalisé + InternalSecretFilter.

- 2026-04-04T22:15Z @developpeur UPDATE → /src/backend/svc-supervision/src/main/java/com/docapost/supervision/interfaces/security/InternalSecretFilter.java
  US-058 : ajout bypass secret vide (isBlank) en plus de "dev-secret-ignored".

- 2026-04-04T22:15Z @developpeur UPDATE → /src/backend/svc-supervision/src/main/java/com/docapost/supervision/interfaces/security/SecurityConfig.java
  US-058 : restauration CORS externalisé + InternalSecretFilter (linter avait simplifié le fichier).

- 2026-04-04T22:15Z @developpeur CREATE → /src/backend/svc-supervision/src/test/java/com/docapost/supervision/infrastructure/websocket/SupervisionWebSocketConfigTest.java
  US-057 : 4 tests TDD (broker /topic, préfixe /app, endpoint /ws/supervision, origines *).

- 2026-04-04T22:15Z @developpeur CREATE → /src/backend/svc-supervision/src/test/java/com/docapost/supervision/interfaces/security/InternalSecretFilterTest.java
  US-058 : 7 tests TDD (hors path, secret dev, secret vide, prod OK, 403 absent, 403 incorrect, corps JSON). 165/165 verts.

- 2026-04-04T22:15Z @developpeur UPDATE → /livrables/00-contexte/journaux/journal-developpeur.md
  Ajout US-057 et US-058 dans suivi + interventions + décisions techniques.

- 2026-04-04T23:45Z @developpeur UPDATE → /src/mobile/src/__tests__/offlineQueue.test.ts
  US-056 : 7 nouveaux tests TDD (enqueue persiste, initialize charge, idempotence x2, JSON corrompu, canCloseRoute post-init, FIFO préservé). 28/28 verts.

- 2026-04-04T23:45Z @developpeur UPDATE → /src/mobile/src/api/syncExecutor.ts
  US-059 : onPhotoTooLarge callback + double seuil 500Ko warn / 1Mo erreur (status 413) + TODO R2 multipart complet.

- 2026-04-04T23:45Z @developpeur UPDATE → /src/backend/svc-tournee/src/main/resources/application.yml
  US-059 : ajout config spring.servlet.multipart 5MB/10MB (manquant sur svc-tournee, déjà présent sur svc-supervision).

- 2026-04-04T23:45Z @developpeur CREATE → /livrables/06-dev/vertical-slices/US-056-impl.md
  US-056 : vertical slice persistance offlineQueue enqueue + initialize().

- 2026-04-04T23:45Z @developpeur CREATE → /livrables/06-dev/vertical-slices/US-059-impl.md
  US-059 : vertical slice upload photo — option MVP multipart Spring Boot + seuils erreur mobile.

- 2026-04-04T23:45Z @developpeur UPDATE → /livrables/00-contexte/journaux/journal-developpeur.md
  Session US-056/059 : 2 US P1 implémentées, 28 tests offlineQueue verts + 6 syncExecutor verts.

- 2026-04-04T23:30Z @developpeur FIX → /src/mobile/src/domain/offlineQueue.ts
  US-060 : correction persist() manquant après chaque dequeue réussi dans sync() — évite le double envoi au redémarrage post-sync partielle.

- 2026-04-04T23:30Z @developpeur UPDATE → /src/mobile/src/__tests__/offlineQueue.test.ts
  US-060 : 5 nouveaux tests TDD (persist après sync, AsyncStorage vide après sync complète, redémarrage après sync partielle, canCloseRoute depuis AsyncStorage, pas de double envoi).

- 2026-04-04T23:30Z @developpeur FIX → /src/mobile/src/screens/CapturePreuveScreen.tsx
  US-061 : finalisation config react-native-signature-canvas (webStyle enrichi border-radius 12px + footer masqué + fond transparent, descriptionText "Signez ici", height 240).

- 2026-04-04T23:30Z @developpeur CREATE → /livrables/06-dev/vertical-slices/US-060-impl.md
  US-060 : vertical slice — correction persist() après sync() dans offlineQueue.

- 2026-04-04T23:30Z @developpeur CREATE → /livrables/06-dev/vertical-slices/US-061-impl.md
  US-061 : vertical slice — brancher react-native-signature-canvas dans CapturePreuveScreen.

- 2026-04-04T23:30Z @developpeur UPDATE → /livrables/00-contexte/journaux/journal-developpeur.md
  Session US-060/061 : 2 US implémentées, 26 tests verts (21 offlineQueue + 5 nouveaux US-060 + 33 CapturePreuveScreen confirmés).

- 2026-04-04T22:30Z @po CREATE → /livrables/05-backlog/user-stories/US-060-correction-persist-apres-sync-offline-queue.md
  US-060 (P0/XS) : correction persist() manquant après sync() dans offlineQueue — risque double envoi de commandes au redémarrage (OBS-AS-006 QA).

- 2026-04-04T22:30Z @po CREATE → /livrables/05-backlog/user-stories/US-061-brancher-signature-reelle-capture-preuve.md
  US-061 (P0/S) : brancher react-native-signature-canvas dans CapturePreuveScreen — bloquant légal, 4e signal Pierre Morel. Relance US-046 non implémentée.

- 2026-04-04T22:30Z @po CREATE → /livrables/05-backlog/user-stories/US-062-compteur-envois-en-attente-indicateur-sync.md
  US-062 (P1/S) : afficher le compteur d'envois en attente dans IndicateurSync — signal terrain Pierre Morel #1 (badge OFFLINE sans quantification).

- 2026-04-04T22:30Z @po UPDATE → /livrables/05-backlog/corrections-as-built-2026-04.md
  Ajout section "Règles de libellé UX" (terminologie terrain vs jargon IT) + plan de corrections mis à jour avec US-060/061/062.

- 2026-04-04T22:30Z @po UPDATE → /livrables/00-contexte/journaux/journal-po.md
  Session 1.8 : état backlog → 62 US, archivage entrées US-048/053, décisions structurantes US-060/061/062.

- 2026-04-04T22:30Z @po UPDATE → /livrables/00-contexte/journaux/archives/journal-po-2026-04.md
  Archivage des interventions US-048, 049, 050, 051, 052, 053 (journal-po.md > 150 lignes).

- 2026-04-04T21:00Z @qa CREATE → /livrables/07-tests/scenarios/corrections-as-built-scenarios.md
  59 scénarios de test (L1/L2/L3) pour US-051 à US-059. 6 anomalies détectées dont OBS-AS-001 (mapper TourneePlanifiee non vérifié) et OBS-AS-004/005 (UX dégradée photo+navigation).

- 2026-04-04T21:00Z @qa UPDATE → /livrables/06-dev/poste-de-commande-tests.md
  Section "Corrections As-Built" ajoutée avec check-lists manuelles pour US-051 à US-059.

- 2026-04-04T20:00Z @end-user CREATE → /livrables/09-feedback/feedback-corrections-as-built-2026-04-04.md
  Feedback terrain Pierre Morel — corrections as-built du 04/04 (US-051/055/056) : 2 bloquants persistants (compteur offline invisible, signature simulée), 3 points importants, note 5.5/10.

- 2026-04-04T18:00Z @developpeur UPDATE → src/mobile/src/api/supervisionApi.ts
  US-051 : Bearer token injecté via createHttpClient sur les 3 endpoints supervision (getInstructionsEnAttente, marquerInstructionExecutee, prendreEnCompteInstruction).

- 2026-04-04T18:00Z @developpeur UPDATE → src/mobile/package.json, src/mobile/src/__mocks__/react-native-app-auth.ts (CREATE), src/mobile/src/__mocks__/netInfoMock.ts (CREATE)
  US-052 : Ajout react-native-app-auth@^7.1.0 et @react-native-community/netinfo@^11.3.1 + mocks Jest.

- 2026-04-04T18:00Z @developpeur UPDATE → src/backend/svc-supervision/.../TourneePlanifiee.java, TourneePlanifieeTest.java
  US-053 : Constructeur 15-params @Deprecated redirigé vers 16-params (correction poidsEstimeKg null). 2 nouveaux tests reconstruction. 22/22 tests verts.

- 2026-04-04T18:00Z @developpeur CREATE → src/backend/svc-supervision/docker-compose.yml, application-local-postgres.yml
  US-054 : Provisionnement PostgreSQL dev (profil local-postgres). Profil dev H2 inchangé.

- 2026-04-04T18:00Z @developpeur UPDATE → src/mobile/App.tsx, src/mobile/package.json
  US-055 : Migration partielle react-navigation — NavigationContainer+Stack au niveau App.tsx. Dépendances @react-navigation/native@^6.1.17, stack@^6.3.29, screens@~3.31.1, safe-area-context@4.10.5 ajoutées.

- 2026-04-04T18:00Z @developpeur UPDATE → src/mobile/src/domain/offlineQueue.ts, src/mobile/src/hooks/useOfflineSync.ts
  US-056 : Persistance offlineQueue via AsyncStorage. initialize() au montage + persist() après chaque enqueue(). Storage injectable pour les tests.

- 2026-04-04T18:00Z @developpeur UPDATE → src/backend/svc-supervision/.../SecurityConfig.java, src/backend/svc-supervision/src/main/resources/application.yml
  US-057 : WebSocket STOMP déjà implémenté — aucune modification nécessaire.

- 2026-04-04T18:00Z @developpeur UPDATE → src/backend/svc-supervision/.../SecurityConfig.java, application.yml + CREATE InternalSecretFilter.java
  US-058 : CORS externalisé via ${ALLOWED_ORIGINS}. InternalSecretFilter protège /api/supervision/internal/** en prod avec header X-Internal-Secret. 154/154 tests verts.

- 2026-04-04T18:00Z @developpeur UPDATE → src/mobile/src/api/syncExecutor.ts, application.yml
  US-059 : Limite multipart 5MB/10MB dans Spring Boot. Avertissement console photoData > 500 Ko. TODO R2 : react-native-image-compressor.

- 2026-04-04T18:00Z @developpeur CREATE → /livrables/06-dev/vertical-slices/corrections-as-built-impl.md
  Livrable vertical slice des corrections as-built US-051 à US-059.

- 2026-04-04T14:00Z @po CREATE → /livrables/05-backlog/corrections-as-built-2026-04.md
  Plan de corrections as-built priorisé : 5 écarts P0 bloquants production, 6 écarts P1 importants, 17 écarts P2 acceptés. 9 US créées (US-051→059).

- 2026-04-04T14:00Z @po CREATE → /livrables/05-backlog/user-stories/US-051-bearer-token-supervision-api.md
  P0/XS — Injection Bearer token dans supervisionApi.ts (3 endpoints instructions livreur sans auth → 403 en prod).

- 2026-04-04T14:00Z @po CREATE → /livrables/05-backlog/user-stories/US-052-dependances-package-json-manquantes.md
  P0/XS — react-native-app-auth et @react-native-community/netinfo absents du package.json → build natif échoue.

- 2026-04-04T14:00Z @po CREATE → /livrables/05-backlog/user-stories/US-053-correction-poids-estime-tournee-planifiee.md
  P0/S — poidsEstimeKg non restitué dans constructeur de reconstruction TourneePlanifiee → compatibilité véhicule désactivée silencieusement.

- 2026-04-04T14:00Z @po CREATE → /livrables/05-backlog/user-stories/US-054-provisionnement-postgresql-dev.md
  P0/S — PostgreSQL non provisionné, H2 in-memory uniquement → aucune persistance en production.

- 2026-04-04T14:00Z @po CREATE → /livrables/05-backlog/user-stories/US-055-migration-navigation-react-navigation.md
  P1/M — Navigation useState conditionnel → bouton retour Android ferme l'app (régression UX terrain majeure).

- 2026-04-04T14:00Z @po CREATE → /livrables/05-backlog/user-stories/US-056-persistance-offline-queue-async-storage.md
  P1/S — offlineQueue en mémoire vive → perte commandes offline si app fermée en zone blanche.

- 2026-04-04T14:00Z @po CREATE → /livrables/05-backlog/user-stories/US-057-websocket-stomp-tableau-de-bord-temps-reel.md
  P1/L — WebSocket STOMP déclaré mais non implémenté → tableau de bord temps réel (US-011) non livré.

- 2026-04-04T14:00Z @po CREATE → /livrables/05-backlog/user-stories/US-058-cors-securite-endpoint-interne.md
  P1/S — CORS trop permissif + endpoint interne sans auth → risque sécurité avant prod.

- 2026-04-04T14:00Z @po CREATE → /livrables/05-backlog/user-stories/US-059-upload-photo-multipart.md
  P1/M — Photos base64 dans payload JSON (> 1 Mo possible) → erreur 413 silencieuse sur upload preuve.

- 2026-04-04T14:00Z @po UPDATE → /livrables/00-contexte/journaux/journal-po.md
  Mise à jour journal : 9 nouvelles US, décisions as-built, prochaine US libre = US-060.

- 2026-04-04T12:00Z @architecte-technique CREATE → /livrables/04-architecture-technique/rapport-as-built-supervision.md, /livrables/04-architecture-technique/rapport-as-built-mobile.md
  Rapports as-built : analyse exhaustive du code réel de svc-supervision (Java 20, Spring Boot 3.4.3, BC-03+BC-07 fusionnés, 14 endpoints REST, 23 tests) et de l'app mobile (Expo 51, React 18, 7 écrans, offline-first). 10 écarts svc-supervision et 10 écarts mobile documentés avec recommandations.

- 2026-04-04T10:00Z @developpeur UPDATE → src/mobile/src/theme/colors.ts, src/mobile/src/theme/theme.ts (CRÉÉ), src/mobile/src/screens/ConnexionScreen.tsx, src/mobile/src/screens/ListeColisScreen.tsx, src/mobile/src/screens/CapturePreuveScreen.tsx, src/mobile/src/screens/DeclarerEchecScreen.tsx, src/mobile/src/components/BandeauInstructionOverlay.tsx, src/mobile/src/components/ColisItem.tsx, src/mobile/src/components/design-system/*.tsx, src/mobile/package.json
  US-025 palette MD3 : application design system Material Design 3 designer sur 5 écrans + 6 composants. 60+ tokens couleur, theme.ts central, expo-linear-gradient ajouté.

- 2026-04-03T23:00Z @developpeur FIX → src/backend/svc-tournee/.../DevDataSeeder.java, src/mobile/src/api/supervisionApi.ts, livrables/00-contexte/infrastructure-locale.md
  BUG-T204-01 : désync compteur colis (T-204-C-022 LIVRE→A_LIVRER). BUG-INSTR-01 : instructions invisibles mobile (10.0.2.2→localhost).

- 2026-04-03T22:30Z @developpeur CREATE → livrables/06-dev/vertical-slices/US-049-impl.md, livrables/06-dev/vertical-slices/US-050-impl.md
  US-049+050 : implémentation verticale complète. 152/152 backend + 272/272 web + 371/371 mobile verts.

- 2026-04-03T22:30Z @developpeur UPDATE → src/mobile/src/constants/devLivreurs.ts
  US-049 : ajout livreur-006 Lucas Petit (6ème livreur canonique).

- 2026-04-03T22:30Z @developpeur UPDATE → src/backend/svc-supervision/src/main/java/com/docapost/supervision/infrastructure/seeder/DevDataSeeder.java
  US-049 : VueTournee tournee-sup-005/006 + TourneePlanifiee T-205/T-206 (livreur-005 Sophie Bernard + livreur-006 Lucas Petit).

- 2026-04-03T22:30Z @developpeur UPDATE → src/web/supervision/src/pages/DetailTourneePlanifieePage.tsx
  US-049+050 : livreursMock aligné sur 6 livreurs canoniques + bouton Désaffecter + fonction desaffecterTournee().

- 2026-04-03T22:30Z @developpeur CREATE → src/backend/svc-supervision/src/main/java/com/docapost/supervision/domain/planification/model/TourneeDejaLanceeException.java, src/backend/svc-supervision/src/main/java/com/docapost/supervision/domain/planification/events/DesaffectationEnregistree.java
  US-050 : exception domaine + event immuable pour désaffectation.

- 2026-04-03T22:30Z @developpeur UPDATE → src/backend/svc-supervision/src/main/java/com/docapost/supervision/domain/planification/model/TourneePlanifiee.java
  US-050 : méthode desaffecter() ajoutée à l'agrégat TourneePlanifiee.

- 2026-04-03T22:30Z @developpeur CREATE → src/backend/svc-supervision/src/main/java/com/docapost/supervision/application/planification/DesaffecterTourneeHandler.java, DesaffecterTourneeCommand.java
  US-050 : application layer handler + command pour désaffectation.

- 2026-04-03T22:30Z @developpeur UPDATE → src/backend/svc-supervision/src/main/java/com/docapost/supervision/interfaces/planification/rest/PlanificationController.java
  US-050 : endpoint DELETE /api/planification/tournees/{id}/affectation ajouté.

- 2026-04-03T22:30Z @developpeur UPDATE → src/web/supervision/src/pages/DetailTourneePage.tsx
  Correctif : guard TextEncoder avant STOMP (jsdom fix, régression US-048).

- 2026-04-03T21:00Z @po CREATE → livrables/05-backlog/user-stories/US-049-6-livreurs-dev-coherents.md
  US-049 : 6 livreurs dev alignés (mobile + supervision + seeders). Must Have / S. Bloquant tests manuels.

- 2026-04-03T21:00Z @po CREATE → livrables/05-backlog/user-stories/US-050-desaffecter-livreur-tournee-planifiee.md
  US-050 : désaffectation livreur d'une TourneePlanifiee depuis W-05 supervision. Should Have / S. Complète F-020.

- 2026-04-03T21:00Z @po UPDATE → livrables/00-contexte/journaux/journal-po.md
  Ajout US-049 et US-050 dans suivi, décisions structurantes. Prochaine US libre : US-051.

- 2026-04-03T20:15Z @developpeur CREATE+FIX → svc-supervision/interfaces/rest/EvenementTourneeController.java, svc-supervision/interfaces/security/SecurityConfig.java
  US-032 bugfix : création du controller manquant POST /api/supervision/internal/vue-tournee/events + permitAll() sur /api/supervision/internal/** (appels inter-services sans JWT)

- 2026-04-03T19:30Z @developpeur UPDATE → svc-supervision/DevDataSeeder.java, svc-tournee/DevDataSeeder.java, ListeColisScreen.tsx, devLivreurs.ts, livrables/06-dev/vertical-slices/US-048-impl.md
  US-048 : injection DevEventBridge dans svc-supervision DevDataSeeder pour propager TourneeLancee T-204 vers svc-tournee. svc-tournee DevDataSeeder aligné sur T-204 avec 22 colis (IDs T-204-C-001..022). Message vide ListeColisScreen actualisé. livreur-005 Sophie Bernard ajouté.

- 2026-04-03T18:30Z @developpeur UPDATE → src/web/supervision/ (tailwind.config.js, postcss.config.js, globals.css, index.tsx, PreparationPage.tsx, TableauDeBordPage.tsx, TopAppBar.tsx, SideNavBar.tsx, AppLayout.tsx)
  US-027 session 2 : intégration Tailwind CSS v3 + DaisyUI + refactorisation visuelle W-04/W-01 selon design_web_designer.md. 265/265 tests verts. Rétrocompat tests inline styles assurée.

- 2026-04-03T17:00Z @developpeur FIX → src/web/supervision/e2e/US-011-tableau-de-bord.spec.ts
  OBS-011-02 : TC-011-04 corrigé — totalTournees → actives (alignement modèle domaine TableauDeBord). Tests web 265/265 verts.

- 2026-04-03T17:01Z @developpeur FIX → src/web/supervision/e2e/US-014-envoyer-instruction.spec.ts
  OBS-014-01 : TC-014-02 isolation données — colisId colis-s-003 → colis-s-014-02 pour éviter 409 avant validation 422.

- 2026-04-03T17:02Z @developpeur FIX → src/mobile/e2e/US-008-capturer-signature.spec.ts, livrables/06-dev/vertical-slices/US-008-impl.md
  OBS-008-01/TC-270 : timeout étendu 20s + waitForSelector SplashScreen Expo Web + graceful degradation. Limitation documentée dans US-008-impl.md.

- 2026-04-03T17:03Z @developpeur UPDATE → livrables/00-contexte/journaux/journal-developpeur.md, livrables/00-contexte/journaux/archives/journal-developpeur-2026-04.md
  Mise à jour journal post-session (3 corrections post-QA). Archivage entrées antérieures (journal 141 lignes).

- 2026-04-03T10:15Z @qa RUN → src/mobile, src/web/supervision, src/backend/svc-supervision, src/backend/svc-oms (US-016 à US-030)
  Campagne re-run US-016 à US-030 — 15 US, toutes PASS (0 FAIL). Détail : US-016 5/5, US-017 23/23, US-018 23/23, US-019 47/47, US-020 15/15, US-021 64/64, US-022 19/19, US-023 40/40, US-024 50/50, US-025 161/161, US-026 88/88, US-027 81/81, US-028 68/68, US-029 22/22, US-030 54/54.

- 2026-04-03T15:30Z @qa RUN → src/backend (svc-tournee/svc-supervision/svc-oms), src/mobile, src/web/supervision (US-001 à US-015)
  Campagne re-run US-001 à US-015 — L1 : 112/112 + 144/144 + 23/23 + 365/365 + 265/265 PASS (909 tests) — L3 BLOQUE (services DOWN).
  13 US validées, 2 partielles (US-011 OBS-011-02, US-014 OBS-014-01/02). Archive journal-qa-2026-04.md créée.

- 2026-04-03T14:00Z @qa RUN → src/mobile, src/web/supervision, src/backend (US-031 à US-045)
  Campagne re-run 11 US (US-031/032/033/034/035/036/037/038/042/043/045) — 532/532 PASS — 0 FAIL.
  US-031: 36/36, US-032: 144/144, US-033: 256/256, US-034: 43/43, US-035: 28/28,
  US-036: 16/16, US-037: 51/51, US-038: 4/4, US-042: 27/27, US-043: 10/10, US-045: 17/17.

- 2026-04-03T14:01Z @qa UPDATE → /livrables/00-contexte/journaux/journal-qa.md
  Ajout 11 lignes interventions re-run + 7 nouvelles US dans tableau de suivi.

- 2026-04-03T12:00Z @qa RUN → src/web/supervision (US-039/040/041/044), src/mobile (US-046)
  Campagne d'exécution 5 US Sprint 6 : US-039 13/13, US-040 15/15, US-041 14/14, US-044 11/11 (post-fix SC2), US-046 13/13. Total 66/66 PASS.

- 2026-04-03T12:01Z @qa CREATE → /livrables/07-tests/scenarios/US-039-scenarios.md
  Scénarios créés (7 TCs) — suite 13/13 PASS.

- 2026-04-03T12:02Z @qa CREATE → /livrables/07-tests/scenarios/US-040-scenarios.md
  Scénarios créés (8 TCs incluant non régression US-028) — suite 15/15 PASS.

- 2026-04-03T12:03Z @qa CREATE → /livrables/07-tests/scenarios/US-041-scenarios.md
  Scénarios créés (6 TCs incluant 8 cas limites calculerNiveauAlerte) — suite 14/14 PASS.

- 2026-04-03T12:04Z @qa CREATE → /livrables/07-tests/scenarios/US-044-scenarios.md
  Scénarios créés v2.0 (11 TCs : FD1-FD7 + SC1/SC2/SC3/SC5) — suite 11/11 PASS après correction SC2.

- 2026-04-03T12:05Z @qa CREATE → /livrables/07-tests/scenarios/US-046-scenarios.md
  Scénarios créés (13 TCs RNTL + 19 non régressions US-008/009) — suite 32/32 PASS.

- 2026-04-03T12:06Z @qa UPDATE → /livrables/00-contexte/journaux/journal-qa.md
  Suivi des 5 US validées, OBS-SUP-001/002 marquées résolues, interventions journalisées.

- 2026-04-03T09:00Z @developpeur FIX → /livrables/06-dev/vertical-slices/US-044-impl.md, src/web/supervision/src/__tests__/TableauDeBordPage.US044.test.tsx
  Bug SC2 corrigé : test "compteur 1 min 30 s" affichait "0 s". Cause : advanceTimersByTime(90000) s'exécutait avant le flush React du useEffect créant le setInterval. Fix : ajout d'un act(runAllTimers) préalable. 265/265 tests web verts.

- 2026-04-03T09:01Z @developpeur UPDATE → /livrables/00-contexte/journaux/journal-developpeur.md
  Mise à jour suivi US-044 (tests exécutables, 265/265), décisions et interventions bugfix SC2.

- 2026-04-02T16:00Z @po UPDATE → /livrables/05-backlog/user-stories/US-037-historique-consignes-livreur.md
  Enrichissement suite wireframes v1.3 : référence wireframe ajoutée, invariants badges statut colores, scenarios 5b/5c/5d/5e (navigation M-07→M-03, badge disparu au retour, liste vide, offline), scenario 7b (badge M-02 mis à jour), DoD complété.

- 2026-04-02T16:01Z @po UPDATE → /livrables/05-backlog/user-stories/US-043-card-sso-retractable-avant-connexion.md
  Enrichissement suite wireframes v1.3 : référence wireframe ajoutée, specs visuelles chevron [^]/[v] détaillées, scénarios 1/2/5 précisés avec texte exact et comportement des chevrons, scenario 6 (bouton connexion toujours accessible), DoD complété.

- 2026-04-02T16:02Z @po UPDATE → /livrables/05-backlog/user-stories/US-045-hint-visuel-swipe-onboarding.md
  Enrichissement suite wireframes v1.3 : référence wireframe ajoutée, texte exact du hint ("← Glissez vers la gauche pour déclarer un problème"), position sous la carte, micro-animation frémissement 8px documentée, DoD complété.

- 2026-04-02T16:03Z @po UPDATE → /livrables/05-backlog/features.md
  Résolution conflit git (marqueurs upstream/stashed supprimés), version 1.1, descriptions F-013/F-028/F-029 enrichies avec références wireframes v1.3 et précisions visuelles.

- 2026-04-02T16:04Z @po CREATE → /livrables/00-contexte/journaux/archives/journal-po-2026-04.md
  Archivage journal @po (seuil 150 lignes atteint) : interventions 2026-03-19 à 2026-04-02 et décisions structurantes archivées.

- 2026-04-02T16:05Z @po UPDATE → /livrables/00-contexte/journaux/journal-po.md
  Mise à jour journal de bord : nouvelles décisions session 2026-04-02, intervention 1.4 documentée, archive référencée.

- 2026-04-02T14:00Z @developpeur IMPLEMENT → src/mobile/src/screens/MesConsignesScreen.tsx, src/mobile/src/__tests__/MesConsignesScreen.test.tsx
  US-042 : formaterHorodatage() exportée (HH:mm / JJ/MM HH:mm) + testID horodatage-{id}. TDD : 5 tests FH1→FH5. 315/315 suite mobile verts.

- 2026-04-02T14:01Z @developpeur CREATE → /livrables/06-dev/vertical-slices/US-042-impl.md
  Vertical slice US-042 : horodatage adaptatif consignes M-07.

- 2026-04-02T14:10Z @developpeur IMPLEMENT → src/mobile/src/screens/ConnexionScreen.tsx, src/mobile/src/__tests__/ConnexionScreen.US036.test.tsx
  US-043 : state dejaConnecte + toggleCard conditionnel (pas de setItem avant connexion). Mise à jour SC5 US-036.

- 2026-04-02T14:11Z @developpeur CREATE → src/mobile/src/__tests__/ConnexionScreen.US043.test.tsx, /livrables/06-dev/vertical-slices/US-043-impl.md
  US-043 : 10 tests TDD (SC1→SC5). 325/325 suite mobile verts.

- 2026-04-02T14:20Z @developpeur IMPLEMENT → src/web/supervision/src/pages/TableauDeBordPage.tsx
  US-044 : formaterDureeDeconnexion() exportée + setInterval 1s + affichage dès 0s. Validé 7/7 via node.js.

- 2026-04-02T14:21Z @developpeur CREATE → src/web/supervision/src/__tests__/TableauDeBordPage.US044.test.tsx, /livrables/06-dev/vertical-slices/US-044-impl.md
  US-044 : tests créés (non exécutables — bug Babel/TS pré-existant svc-supervision documenté).

- 2026-04-02T14:25Z @developpeur UPDATE → /livrables/00-contexte/journaux/journal-developpeur.md
  Session 2026-04-02 : ajout US-042/043/044 (Suivi US + Interventions réalisées).

- 2026-04-02T16:00Z @developpeur IMPLEMENT → src/mobile/src/components/ColisItem.tsx, src/mobile/src/screens/MesConsignesScreen.tsx, src/web/supervision/src/pages/DetailTourneePlanifieePage.tsx, src/web/supervision/src/pages/TableauDeBordPage.tsx
  US-038 : Harmonisation libellés UX — "Repassage", "Traitée", "Chargement trop lourd", "Télécharger la liste", "numéro de tournée". TDD : 4 tests mobiles. 329/329 suite mobile verts.

- 2026-04-02T16:01Z @developpeur CREATE → src/mobile/src/__tests__/US038.libelles.test.tsx, /livrables/06-dev/vertical-slices/US-038-impl.md
  US-038 : vertical slice et tests TDD libellés UX.

- 2026-04-02T16:15Z @developpeur IMPLEMENT → src/mobile/src/hooks/useSwipeHint.ts, src/mobile/src/screens/ListeColisScreen.tsx
  US-045 : hook useSwipeHint (SEUIL=3, fail-safe=true, incrément sur swipe réussi). Remplacement logique sessions Bloquant 6. 342/342 suite mobile verts.

- 2026-04-02T16:16Z @developpeur CREATE → src/mobile/src/__tests__/US045.hintSwipe.test.tsx, /livrables/06-dev/vertical-slices/US-045-impl.md
  US-045 : 13 tests TDD hook useSwipeHint + vertical slice.

- 2026-04-02T16:17Z @developpeur UPDATE → /livrables/00-contexte/journaux/journal-developpeur.md
  Session 2026-04-02 : ajout US-038/045 (Suivi US + Interventions réalisées).

- 2026-04-02T18:00Z @developpeur FIX → src/web/supervision/src/pages/TableauDeBordPage.tsx
  OBS-SUP-001 : Math.max(0, maintenant - deconnecteDepuisMs) — empêche le compteur d'afficher "-1 s" au premier rendu.

- 2026-04-02T18:01Z @developpeur FIX → src/web/supervision/src/__tests__/TableauDeBordPage.US044.test.tsx
  OBS-SUP-002 : clarification commentaire SC2 — creerMockWsFactory(true) = OFFLINE requis pour que dureeDeconnexionMs soit calculé.

- 2026-04-02T18:02Z @developpeur FIX → /livrables/06-dev/vertical-slices/US-035-impl.md
  OBS-SUP-003 : placeholder documentation mis à jour "code TMS" → "numéro de tournée" (alignement avec US-038).

- 2026-04-02T18:03Z @developpeur FIX → src/web/supervision/e2e/US-supervision-campagne.spec.ts
  OBS-SUP-004 : ajout waitForSelector('[data-testid="ligne-tournee"]', timeout 10000ms) dans TC1 et TC2 pour attendre les données de tournées.

- 2026-04-02T18:04Z @developpeur UPDATE → /livrables/00-contexte/journaux/journal-developpeur.md
  Session 2026-04-02 : ajout section "Corrections post-QA OBS-SUP-001 à OBS-SUP-004".

- 2026-04-02T09:00Z @po CREATE → /livrables/05-backlog/user-stories/US-046-signature-numerique-pad-reel.md
  US-046 Must Have — bloquant légal : intégration react-native-signature-canvas pour pad de tracé réel dans M-04 (CapturePreuveScreen). Remplace la dette technique TouchableOpacity simulé de US-008-impl.md signalée 3x par Pierre Morel.

- 2026-04-02T09:01Z @po UPDATE → /livrables/05-backlog/features.md
  Rattachement de US-046 à F-007 (Capture de la preuve de livraison, EPIC-002).

- 2026-04-02T09:02Z @po UPDATE → /livrables/00-contexte/journaux/journal-po.md
  Session 2026-04-02 : ajout US-046, mise à jour prochaine US libre (US-047), décisions structurantes.

- 2026-04-02T19:00Z @developpeur IMPLEMENT → src/mobile/src/components/ColisItem.tsx
  US-045 delta v1.3 : texte exact hint wireframe ("← Glissez vers la gauche pour déclarer un problème") + position sous la carte (hors header) + accessibilityLabel/role. Correction accessibilityElementsHidden → accessible.

- 2026-04-02T19:01Z @developpeur CREATE → src/mobile/src/__tests__/US045.colisItem.hint.test.tsx
  US-045 delta v1.3 : 4 tests TDD rendu ColisItem (SC-RENDER-1 à SC-RENDER-4). 352/352 suite totale mobile verts.

- 2026-04-02T19:02Z @developpeur UPDATE → /livrables/06-dev/vertical-slices/US-045-impl.md
  Ajout section "Delta v1.3" : corrections rendu ColisItem + résultats 352/352 tests.

- 2026-04-02T19:03Z @developpeur CREATE → /livrables/00-contexte/journaux/archives/journal-developpeur-2026-04.md
  Archivage sections feedback terrain 2026-04-02/2026-04-01/2026-03-30 (journal > 150 lignes).

- 2026-04-02T19:04Z @developpeur UPDATE → /livrables/00-contexte/journaux/journal-developpeur.md
  Session US-045 delta : nouvelles entrées Suivi US/Interventions/Décisions + référence archive 2026-04.

- 2026-04-01T15:00Z @developpeur CREATE → /livrables/06-dev/processus-metiers-bout-en-bout.drawio
  Diagramme draw.io 4 pages (swimlane) : Parcours 0 Préparation Tournées, Parcours 1 Exécution Livreur, Parcours 2 Supervision Temps Réel, Parcours 3 Gestion Incidents. Tous les events domaine, décisions et acteurs représentés.

- 2026-04-01T15:05Z @architecte-metier CREATE → /livrables/06-dev/architecture-metier-bout-en-bout.drawio
  Diagramme draw.io XML complet de l'architecture metier bout en bout : 7 Bounded Contexts (BC-01 a BC-07), acteurs, systemes externes, domain events inter-BC, context map et regles metier cles.

- 2026-04-01T15:00Z @architecte-technique CREATE → /livrables/06-dev/architecture-technique-macro.drawio
  Diagramme C4 Container draw.io complet : 6 microservices, 6 BDs PostgreSQL, MinIO, API Gateway, SSO Keycloak, Mobile/Web, systèmes externes (TMS/OMS/SSO/FCM), infra K8s, légende protocoles.

- 2026-04-01T14:30Z @developpeur UPDATE → src/backend/svc-tournee/interfaces/rest/TourneeController.java
  Bloquant 1 : injection SupervisionNotifier + Authentication.getName() sur /echec /livraison /cloture — livreurId reel transmis a svc-supervision.

- 2026-04-01T14:31Z @developpeur UPDATE → 6x *ControllerTest.java (svc-tournee)
  Bloquant 1 : @MockBean SupervisionNotifier ajoute dans TourneeControllerTest + 5 autres suites @WebMvcTest. 32/32 tests verts.

- 2026-04-01T14:32Z @developpeur UPDATE → src/mobile/src/screens/ListeColisScreen.tsx
  Bloquant 2 : useNetworkStatus() branche + bandeau hors-ligne conditionnel (IndicateurSync). Bloquant 6 : AsyncStorage compteur sessions + afficherHintSwipe. 18/18 tests mobiles verts.

- 2026-04-01T14:33Z @developpeur UPDATE → src/mobile/src/components/ColisItem.tsx
  Bloquant 6 : PanResponder swipe (seuil 80px) + hint "← Glisser" conditionnel + zone rouge echec integres.

- 2026-04-01T14:34Z @developpeur UPDATE → src/mobile/src/components/design-system/CarteColis.tsx
  Bloquant 6 : prop afficherHintSwipe ajoutee (remplace valeur true en dur).

- 2026-04-01T14:35Z @developpeur UPDATE → src/web/supervision/src/pages/PanneauInstructionPage.tsx
  Bloquant 4 : peutEnvoyer inclut envoi !== 'succes' + toast enrichi "Le livreur a ete notifie" + aria.

- 2026-04-01T14:36Z @developpeur UPDATE → src/web/supervision/src/pages/TableauDeBordPage.tsx
  Bloquant 5 : reconnecterManuellement() + deconnecteDepuisMs + bouton Reconnecter + compteur-deconnexion.

- 2026-04-01T14:37Z @developpeur UPDATE → src/web/supervision/src/__tests__/PanneauInstructionPage.test.tsx, TableauDeBordPage.test.tsx
  Bloquant 4+5 : 4 nouveaux tests (2 par bloquant) documentes.

- 2026-04-01T14:38Z @developpeur CREATE → /livrables/06-dev/vertical-slices/FEEDBACK-2026-04-01-corrections-bloquants.md
  Documentation des 6 corrections bloquants feedback terrain 2026-04-01.

- 2026-04-01T14:39Z @developpeur UPDATE → /livrables/00-contexte/journaux/journal-developpeur.md
  Fin de session : ajout section "Interventions feedback terrain 2026-04-01" avec bilan des 6 bloquants.

- 2026-04-01T11:00Z @po CREATE → /livrables/05-backlog/user-stories/US-038-harmonisation-libelles-ux.md
  US-038 : harmonisation libelles UX (Should Have, S) — "A repr."→"Repassage", "Exécutée"→"Traitée", "Dépassement détecté"→"Chargement trop lourd", "Exporter CSV"→"Télécharger la liste", "code TMS"→"numéro de tournée". Rattachée à EPIC-008 / F-022.

- 2026-04-01T11:01Z @po CREATE → /livrables/05-backlog/user-stories/US-039-export-csv-tableau-de-bord.md
  US-039 : télécharger le bilan des tournées du jour depuis W-01 (Should Have, M). Nouveau bouton "Télécharger le bilan du jour" dans TableauDeBordPage. Distinct de US-028 (W-05). Rattachée à EPIC-003 / F-023.

- 2026-04-01T11:02Z @po CREATE → /livrables/05-backlog/user-stories/US-040-enrichir-colonnes-csv-export.md
  US-040 : enrichir le CSV exporté (W-05) avec colonnes Destinataire et Statut final (Should Have, S). Delta sur US-028 — colonnes "#Colis, Destinataire, Adresse, Zone, Contrainte, Statut". Rattachée à EPIC-007 / F-024.

- 2026-04-01T11:03Z @po CREATE → /livrables/05-backlog/user-stories/US-041-poids-estime-tableau-preparation.md
  US-041 : afficher le poids estimé et alerte surcharge dans le tableau de préparation W-04 (Should Have, M). Icône alerte orange (95%) et rouge (>100% capacité). Rattachée à EPIC-007 / F-025.

- 2026-04-01T11:04Z @po CREATE → /livrables/05-backlog/user-stories/US-042-horodatage-consignes-ecran-m07.md
  US-042 : afficher la date et l'heure d'émission de chaque consigne dans M-07 (Should Have, XS). Delta sur US-037 — champ horodatageReception déjà présent dans le Read Model, uniquement affichage. Rattachée à EPIC-004 / F-027.

- 2026-04-01T11:05Z @po CREATE → /livrables/05-backlog/user-stories/US-043-card-sso-retractable-avant-connexion.md
  US-043 : replier la card SSO dès la première ouverture avant toute connexion (Should Have, S). Comportement session uniquement (non AsyncStorage), distinct de US-036 (memorisé après connexion). Rattachée à EPIC-006 / F-028.

- 2026-04-01T11:06Z @po CREATE → /livrables/05-backlog/user-stories/US-044-indicateur-duree-deconnexion-websocket.md
  US-044 : compteur de durée de déconnexion WebSocket dans le bandeau superviseur (Should Have, S). Format adaptatif "X s / X min Y s / X h Y min". Rattachée à EPIC-003 / F-026.

- 2026-04-01T11:07Z @po CREATE → /livrables/05-backlog/user-stories/US-045-hint-visuel-swipe-onboarding.md
  US-045 : hint visuel de découverte du swipe pour les 3 premières utilisations (Could Have, S). Compteur AsyncStorage swipeHintCount. Fail-safe si AsyncStorage indisponible. Rattachée à EPIC-001 / F-029.

- 2026-04-01T11:08Z @po UPDATE → /livrables/05-backlog/features.md
  Ajout EPIC-008 "Qualite UX et Accessibilite" + features F-022 à F-029. Mise à jour du récapitulatif Features (28 features au total). Nouvelles features rattachées aux US-038 à US-045.

- 2026-04-01T11:09Z @po UPDATE → /livrables/00-contexte/journaux/journal-po.md
  Mise à jour journal : session 2026-04-01, US-038 à US-045, décisions structurantes, liste bugs à traiter par @developpeur, prochaine US libre = US-046.

- 2026-04-01T09:00Z @end-user CREATE → /livrables/09-feedback/feedback-livreur-2026-04-01.md
  Feedback terrain Pierre Morel : US-025/026/029/036/037. 3 bloquants persistants (signature simulée, offline silencieux, swipe invisible). Card SSO et historique consignes bien reçus. 7 améliorations identifiées dont onglet "A repr." et badge Consignes.

- 2026-04-01T09:05Z @end-user CREATE → /livrables/09-feedback/feedback-superviseur-2026-04-01.md
  Feedback terrain Laurent Renaud : US-027/028/030/031/032/034/035. 3 bloquants persistants (titre onglet, WebSocket sans bouton, confirmation instruction). Suggestion réaffectation véhicule et recherche multi-critères positivement accueillis. Signalement livreurId littéral US-032.

- 2026-04-01T09:10Z @end-user UPDATE → /livrables/00-contexte/journaux/journal-end-user.md
  Mise à jour journal : suivi feedbacks 2026-04-01, interventions réalisées, points d'attention bloquants persistants identifiés.

- 2026-03-30T23:30Z @developpeur IMPL (delta) → src/mobile/src/api/supervisionApi.ts, src/mobile/src/hooks/useConsignesLocales.ts, src/mobile/src/screens/MesConsignesScreen.tsx, src/mobile/src/screens/ListeColisScreen.tsx, src/mobile/src/__tests__/useConsignesLocales.test.ts, src/mobile/src/__tests__/MesConsignesScreen.test.tsx, livrables/06-dev/vertical-slices/US-037-impl.md
  US-037 delta Sprint 5 : (1) prendreEnCompteInstruction() + prendreEnCompteNouvelles() (Promise.allSettled, offline silencieux) + useEffect ListeColisScreen ; (2) onVoirColis + bouton "Voir le colis" M-07→M-03. TDD : +7 tests. 310/310 suite verts.

- 2026-03-30T23:00Z @developpeur IMPL → src/mobile/src/hooks/useConsignesLocales.ts, src/mobile/src/screens/MesConsignesScreen.tsx, src/mobile/src/components/BandeauInstructionOverlay.tsx, src/mobile/src/screens/ListeColisScreen.tsx, src/mobile/src/__tests__/useConsignesLocales.test.ts, src/mobile/src/__tests__/MesConsignesScreen.test.tsx, livrables/06-dev/vertical-slices/US-037-impl.md, livrables/00-contexte/journaux/journal-developpeur.md
  US-037 : historique consignes livreur. useConsignesLocales (AsyncStorage, idempotence, badge), MesConsignesScreen M-07 (bouton Exécutée, syncEnCours), BandeauInstructionOverlay prop onConsignePersistee, bouton "Consignes" + badge ListeColisScreen. TDD : 11+12=23 tests verts. 303/303 suite mobile totale verts.

- 2026-03-31T10:00Z @developpeur IMPL → src/mobile/src/screens/ConnexionScreen.tsx, src/mobile/src/__tests__/ConnexionScreen.US036.test.tsx, src/mobile/package.json, livrables/05-backlog/user-stories/US-036-card-sso-retractable-premiere-connexion.md, livrables/06-dev/vertical-slices/US-036-impl.md, livrables/00-contexte/journaux/journal-developpeur.md
  US-036 : card SSO rétractable après 1ère connexion. TDD : 16 tests verts (SC1-SC6 + non-régression US-019). moduleNameMapper AsyncStorage branché. 280/280 suite mobile totale verts.

- 2026-03-30T20:00Z @developpeur IMPL → src/backend/svc-supervision/.../events/VehiculeReaffecte.java, application/planification/ReaffecterVehiculeCommand.java, ReaffecterVehiculeHandler.java, interfaces/planification/dto/VehiculeCompatibleDTO.java, ReaffecterVehiculeRequest.java, rest/PlanificationController.java, src/web/supervision/src/pages/DetailTourneePlanifieePage.tsx, src/__tests__/DetailTourneePlanifieePage.test.tsx, tests/ReaffecterVehiculeHandlerTest.java, tests/PlanificationControllerTest.java, livrables/06-dev/vertical-slices/US-034-impl.md
  US-034 : suggeston réaffectation après échec compatibilité véhicule. TDD : 7 tests handler + 7 tests controller + 8 tests Jest (US-030/034). Panneau pré-filtré, bouton "Réaffecter" distinct de "Affecter quand même".

- 2026-03-30T18:00Z @developpeur IMPL → src/web/supervision/src/pages/TableauDeBordPage.tsx, src/__tests__/TableauDeBordPage.test.tsx, src/backend/svc-supervision/.../VueTournee.java, VueTourneeEntity.java, VueTourneeDTO.java, VueTourneeRepositoryImpl.java, DevDataSeeder.java, SupervisionControllerTest.java, livrables/06-dev/vertical-slices/US-035-impl.md
  US-035 : recherche multi-critères tableau de bord (codeTMS + zone + livreurNom). TDD : 9 tests Jest + 2 tests @WebMvcTest. 200/200 suite Jest totale verts. Backend rétrocompatible (constructeur 6-args conservé).

- 2026-03-30T12:00Z @po CREATE → livrables/05-backlog/user-stories/US-034-suggestion-reaffectation-apres-echec-compatibilite.md, US-035-recherche-multi-criteres-tableau-de-bord.md, US-036-card-sso-retractable-premiere-connexion.md, US-037-historique-consignes-livreur.md, features.md, journal-po.md
  4 nouvelles US (Should/Could Have) issues des feedbacks terrain du 2026-03-30 — amélioration réaffectation véhicule, recherche multi-critères, card SSO rétractable, historique consignes livreur.

- 2026-03-30T10:00Z @developpeur UPDATE → src/web/supervision/src/pages/TableauDeBordPage.tsx, src/__tests__/TableauDeBordPage.test.tsx
  Feedback terrain S1/S2/S4/S5 : livreurNom en donnée primaire, détail retard inline A_RISQUE, bandeau déconnexion orange (#b45309), bouton "Exporter le bilan". 6 nouveaux tests.

- 2026-03-30T10:01Z @developpeur UPDATE → src/web/supervision/src/pages/PreparationPage.tsx, src/__tests__/PreparationPage.test.tsx
  Feedback terrain S3 : redirection automatique vers tableau de bord après lancement tournée (onTourneeeLancee, 800ms). 1 nouveau test.

- 2026-03-30T10:02Z @developpeur UPDATE → src/mobile/src/screens/ConnexionScreen.tsx, src/__tests__/ConnexionScreen.test.tsx
  Feedback terrain L2 : libellé bouton SSO raccourci "Connexion Docaposte". Test mis à jour.

- 2026-03-30T10:03Z @developpeur UPDATE → src/mobile/src/screens/DeclarerEchecScreen.tsx, src/__tests__/DeclarerEchecScreen.test.tsx
  Feedback terrain L4/L8 : toast "Echec enregistre — superviseur notifié" (2.5s, injectable toastDureeMs), texte d'aide disposition grisée avant motif. 4 nouveaux tests.

- 2026-03-30T10:04Z @developpeur UPDATE → src/mobile/src/screens/CapturePreuveScreen.tsx, src/__tests__/CapturePreuveScreen.test.tsx
  Feedback terrain L6 : SIGNATURE pré-sélectionné par défaut. Test de rendu initial mis à jour.

- 2026-03-30T10:05Z @developpeur UPDATE → livrables/00-contexte/journaux/journal-developpeur.md, livrables/CHANGELOG-actions-agents.md
  Mise à jour journal + CHANGELOG. Bilan : 191 tests web verts, 264 tests mobiles verts.

- 2026-03-25T10:00Z @developpeur FIX → src/backend/svc-supervision/src/main/java/com/docapost/supervision/infrastructure/seeder/DevDataSeeder.java
  OBS-021-01 — deleteAll() BC-07 avant les saves : garantit LocalDate.now() même après redémarrage.

- 2026-03-25T14:00Z @qa RERUN → livrables/07-tests/scenarios/US-017-rapport-playwright.md
  Re-run post OBS-017-01 — US-017 : 10/10 PASS. modeDegradGPS=true confirmé dans body 201.

- 2026-03-25T14:01Z @qa RERUN → livrables/07-tests/scenarios/US-018-rapport-playwright.md
  Re-run post isolation eventId (préfixe us018-) — US-018 : 10/10 PASS. Immuabilité confirmée.

- 2026-03-25T14:02Z @qa RERUN → livrables/07-tests/scenarios/US-011-rapport-playwright.md
  Re-run post OBS-011-01 — US-011 : 4/5 (résiduel OBS-011-02 : actives vs totalTournees).

- 2026-03-25T14:03Z @qa RERUN → livrables/07-tests/scenarios/US-013-rapport-playwright.md
  Re-run post OBS-011-01 — US-013 : 4/4 PASS. body.bandeau.aRisque=1 confirmé.

- 2026-03-25T14:04Z @qa RERUN → livrables/07-tests/scenarios/US-020-rapport-playwright.md
  Re-run post OBS-011-01 — US-020 : 4/4 PASS. body.bandeau présent, health UP.

- 2026-03-25T14:05Z @qa RERUN → livrables/07-tests/scenarios/US-021-rapport-playwright.md
  Re-run post OBS-021-01 — US-021 : 4/5 (résiduel OBS-021-02 : bandeau absent dans planification).

- 2026-03-25T14:06Z @qa RERUN → livrables/07-tests/scenarios/US-024-rapport-playwright.md
  Re-run post OBS-024-01 — US-024 : 5/5 PASS. lanceeLe présent dans body 200.

- 2026-03-25T14:07Z @qa RERUN → livrables/07-tests/scenarios/US-014-rapport-playwright.md
  Re-run vérification 400 vs 422 — US-014 : 4/5 (OBS-014-01 non corrigé — isolation colisId).

- 2026-03-25T14:08Z @qa CREATE → livrables/07-tests/scenarios/bilan-campagne-finale.md
  Bilan consolidé final : 136 tests (sessions 1+2), 124 PASS, 12 FAIL, taux 91,2%. 20/24 US validées.

- 2026-03-25T14:09Z @qa UPDATE → livrables/00-contexte/journaux/journal-qa.md
  Mise à jour journal : statuts finaux US-013/017/018/020/024 → Validée. Anomalies résiduelles documentées.

- 2026-03-25T10:01Z @developpeur FIX → src/backend/svc-supervision/src/main/java/com/docapost/supervision/interfaces/dto/TableauDeBordDTO.java, src/backend/svc-supervision/src/test/java/com/docapost/supervision/interfaces/SupervisionControllerTest.java
  OBS-011-01 — Encapsulation des compteurs dans sous-record BandeauResume (body.bandeau.actives). Test mis à jour.

- 2026-03-25T10:02Z @developpeur FIX → src/backend/svc-supervision/src/main/java/com/docapost/supervision/interfaces/planification/dto/TourneePlanifieeDTO.java, TourneePlanifieeDetailDTO.java
  OBS-024-01 — Champ "lancee" renommé "lanceeLe" dans les DTOs Interface Layer (domaine inchangé).

- 2026-03-25T10:03Z @developpeur FIX → src/backend/svc-oms/src/main/java/com/docapost/oms/application/EnregistrerEvenementHandler.java, src/backend/svc-oms/src/main/java/com/docapost/oms/interfaces/rest/EvenementController.java, src/backend/svc-oms/src/test/java/com/docapost/oms/interfaces/EvenementControllerTest.java
  OBS-017-01 — POST /api/oms/evenements retourne désormais le DTO créé (201 avec body JSON). Handler retourne EvenementLivraison.

- 2026-03-25T10:04Z @developpeur FIX → src/mobile/e2e/US-018-historisation-immuable.spec.ts
  TC-018-01 bonus — Préfixe us018- pour isolation eventId inter-suites. Statuts acceptés : [201, 409, 403].

- 2026-03-25T10:05Z @developpeur UPDATE → livrables/06-dev/vertical-slices/US-021-impl.md, US-011-impl.md, US-024-impl.md, US-017-impl.md
  Ajout section "Corrections post-QA" dans les 4 vertical slices impactés.

---

- 2026-03-24T23:30Z @developpeur CREATE → src/mobile/src/store/authStore.ts, src/mobile/src/screens/ConnexionScreen.tsx, src/mobile/src/api/httpClient.ts
  US-019 — Store d'authentification OAuth2 PKCE mobile + écran M-01 ConnexionScreen + intercepteur HTTP Bearer.

- 2026-03-24T23:31Z @developpeur UPDATE → src/backend/svc-tournee/src/main/java/com/docapost/tournee/interfaces/security/SecurityConfig.java, pom.xml, application.yml
  US-019 — SecurityConfig OAuth2 Resource Server conditionnel (isProdProfile) + oauth2-resource-server + issuer-uri prod.

- 2026-03-24T23:32Z @developpeur CREATE → src/web/supervision/src/auth/webAuthService.ts, src/web/supervision/src/pages/ConnexionPage.tsx, src/web/supervision/src/pages/AuthCallbackPage.tsx
  US-020 — Service OAuth2 Auth Code web + ConnexionPage + AuthCallbackPage.

- 2026-03-24T23:33Z @developpeur UPDATE → src/backend/svc-supervision/src/main/java/com/docapost/supervision/interfaces/security/SecurityConfig.java, pom.xml, application.yml
  US-020 — SecurityConfig svc-supervision OAuth2 Resource Server conditionnel + ROLE_DSI sur preuves.

- 2026-03-24T23:34Z @developpeur CREATE → src/mobile/src/domain/offlineQueue.ts, src/mobile/src/hooks/useOfflineSync.ts, src/mobile/src/hooks/useOfflineSyncState.ts, src/mobile/src/api/syncExecutor.ts, src/mobile/src/components/SyncIndicator.tsx
  US-006 — File offline FIFO + indicateur sync + exécuteur de commandes offline.

- 2026-03-24T23:35Z @developpeur CREATE → src/backend/svc-tournee/src/main/java/com/docapost/tournee/interfaces/rest/CommandIdempotencyFilter.java
  US-006 — Filtre d'idempotence backend (X-Command-Id, ConcurrentHashMap MVP).

- 2026-03-24T23:36Z @developpeur CREATE → livrables/06-dev/vertical-slices/US-019-impl.md, US-020-impl.md, US-006-impl.md
  Documentation des 3 vertical slices (US-019, US-020, US-006).

- 2026-03-24T23:37Z @developpeur UPDATE → livrables/00-contexte/journaux/journal-developpeur.md
  Mise à jour du journal : US-019/020/006 marquées Implémenté, décisions techniques, interventions.

---

- 2026-03-24T20:30Z @developpeur CREATE → src/backend/svc-oms/ (nouveau microservice BC-05)
  Création svc-oms (port 8083) : pom.xml, SvcOmsApplication, application.properties, mockito-extensions.

- 2026-03-24T20:31Z @developpeur CREATE → src/backend/svc-oms/src/main/java/com/docapost/oms/domain/
  Domain layer BC-05 : EvenementLivraison (record immuable), TypeEvenement, StatutSynchronisation, Coordonnees, EvenementStore (port).

- 2026-03-24T20:32Z @developpeur CREATE → src/backend/svc-oms/src/main/java/com/docapost/oms/application/
  Application layer US-018 : EnregistrerEvenementHandler + ConsulterHistoriqueColisHandler + ConsulterHistoriqueTourneeHandler.

- 2026-03-24T20:33Z @developpeur CREATE → src/backend/svc-oms/src/main/java/com/docapost/oms/application/SynchroniserPendingEvenementsHandler.java + OmsApiPort.java
  Application layer US-017 : handler outbox + port ACL vers OMS externe.

- 2026-03-24T20:34Z @developpeur CREATE → src/backend/svc-oms/src/main/java/com/docapost/oms/infrastructure/
  Infrastructure BC-05 : EvenementEntity (append-only JPA), EvenementJpaRepository, EvenementStoreImpl, OmsApiClient (simulé), OutboxPoller (@Scheduled 10s), DevDataSeeder (4 événements test).

- 2026-03-24T20:35Z @developpeur CREATE → src/backend/svc-oms/src/main/java/com/docapost/oms/interfaces/
  Interface layer BC-05 : EvenementController (POST /evenements + GET /colis/{id} + GET /tournee/{id}), MockJwtAuthFilter, SecurityConfig.

- 2026-03-24T20:36Z @developpeur CREATE → src/backend/svc-oms/src/test/java/com/docapost/oms/
  Tests TDD : EvenementLivraisonTest (9), EnregistrerEvenementHandlerTest (3), SynchroniserPendingEvenementsHandlerTest (5), EvenementControllerTest (6) — 23/23 verts.

- 2026-03-24T20:37Z @developpeur CREATE → /livrables/06-dev/vertical-slices/US-017-impl.md
  Documentation vertical slice US-017 (sync OMS, outbox, ACL, limitations MVP).

- 2026-03-24T20:38Z @developpeur CREATE → /livrables/06-dev/vertical-slices/US-018-impl.md
  Documentation vertical slice US-018 (Event Store append-only, immuabilité, mode dégradé GPS, audit).

- 2026-03-24T20:39Z @developpeur UPDATE → /livrables/00-contexte/journaux/journal-developpeur.md
  Statuts US-017 et US-018 → Implémenté. Interventions + décisions techniques ajoutées.

- 2026-03-24T08:30Z @qa CREATE → /livrables/07-tests/scenarios/US-004-scenarios.md
  Rédaction 24 scénarios de test TC-074 à TC-097 (Domain/Application/Infrastructure/E2E) pour US-004 Détail Colis.

- 2026-03-24T08:30Z @qa CREATE → /livrables/07-tests/scenarios/US-005-scenarios.md
  Rédaction 25 scénarios de test TC-098 à TC-122 pour US-005 Déclarer Échec (invariants EchecLivraisonDeclare).

- 2026-03-24T08:30Z @qa CREATE → /livrables/07-tests/scenarios/US-007-scenarios.md
  Rédaction 23 scénarios de test TC-123 à TC-145 pour US-007 Clôture Tournée (invariants TourneeCloturee).

- 2026-03-24T09:00Z @qa CREATE → /src/mobile/e2e/US-004-detail-colis.spec.ts
  Spec Playwright E2E US-004 : 11 tests (navigation M-02→M-03, boutons, RGPD, API GET).

- 2026-03-24T09:00Z @qa CREATE → /src/mobile/e2e/US-005-declarer-echec.spec.ts
  Spec Playwright E2E US-005 : 5 tests (M-05, bouton désactivé, déclaration nominale, API POST /echec).

- 2026-03-24T09:00Z @qa CREATE → /src/mobile/e2e/US-007-cloture-tournee.spec.ts
  Spec Playwright E2E US-007 : 9 tests (API POST /cloture 409/200/404, bouton clôture UI, idempotence).

- 2026-03-24T09:30Z @qa EXECUTE → /livrables/07-tests/scenarios/US-004-rapport-playwright.md
  Exécution Playwright US-004 : 11/11 PASSÉ. Invariant RGPD validé, navigation sans rechargement confirmée.

- 2026-03-24T09:30Z @qa EXECUTE → /livrables/07-tests/scenarios/US-005-rapport-playwright.md
  Exécution Playwright US-005 : 5/5 PASSÉ. Bouton désactivé validé, déclaration nominale E2E complète.

- 2026-03-24T09:30Z @qa EXECUTE → /livrables/07-tests/scenarios/US-007-rapport-playwright.md
  Exécution Playwright US-007 : 9/9 PASSÉ. Invariant 409 validé, idempotence confirmée. Point d'attention : cohérence compteurs RecapitulatifTournee à vérifier.

- 2026-03-24T09:35Z @qa CREATE → /livrables/07-tests/screenshots/US-004/, /US-005/, /US-007/
  17 screenshots E2E capturés pour les 3 US (TC-087 à TC-145).

- 2026-03-24T09:40Z @qa UPDATE → /livrables/00-contexte/journaux/journal-qa.md
  Mise à jour journal QA : statuts US-004/005/007 → Exécutés. Points d'attention ajoutés (testIDs manquants, idempotence, RGPD).

- 2026-03-24T14:00Z @developpeur FIX → /src/mobile/src/screens/DetailColisScreen.tsx
  BUG-A : ajout testID="detail-colis-screen" sur le root View de l'état succès (requis par QA Playwright).

- 2026-03-24T14:00Z @developpeur FIX → /src/mobile/src/screens/DeclarerEchecScreen.tsx
  BUG-B : ajout testID="declarer-echec-screen" sur le root View (requis par QA Playwright).

- 2026-03-24T14:00Z @developpeur FIX → /src/backend/svc-tournee/src/main/java/com/docapost/tournee/domain/model/RecapitulatifTournee.java, TourneeTest.java
  BUG-C : correction RecapitulatifTournee.calculer() — colisARepresenter filtre désormais ECHEC+disposition=A_REPRESENTER au lieu de StatutColis.A_REPRESENTER (jamais émis). Ajout 2 tests unitaires. Fix test existant cloturerTournee_emet_event_avec_recap.

- 2026-03-24T14:30Z @developpeur CREATE → /src/backend/svc-tournee/src/main/java/com/docapost/tournee/domain/preuves/
  US-008/009 : BC-02 domain layer — TypePreuve, PreuveLivraisonId, Coordonnees, SignatureNumerique, PhotoPreuve, TiersIdentifie, DepotSecurise, PreuveLivraisonInvariantException, PreuveLivraison (Aggregate), PreuveCapturee (Domain Event), LivraisonConfirmee (Domain Event BC-01), PreuveLivraisonRepository (interface).

- 2026-03-24T14:30Z @developpeur UPDATE → /src/backend/svc-tournee/src/main/java/com/docapost/tournee/domain/model/Tournee.java
  US-008 : ajout méthode confirmerLivraison(ColisId, PreuveLivraisonId) + LivraisonConfirmee event.

- 2026-03-24T14:30Z @developpeur CREATE → /src/backend/svc-tournee/src/main/java/com/docapost/tournee/application/ConfirmerLivraisonCommand.java, ConfirmerLivraisonHandler.java
  US-008/009 : application layer — Command (4 factory methods) + Handler (orchestration create→save→confirm).

- 2026-03-24T14:30Z @developpeur CREATE → /src/backend/svc-tournee/src/main/java/com/docapost/tournee/infrastructure/persistence/PreuveLivraisonEntity.java, PreuveLivraisonJpaRepository.java, PreuveLivraisonMapper.java, PreuveLivraisonRepositoryImpl.java
  US-008/009 : infrastructure layer — JPA entity table preuves_livraison + mapper + repository impl.

- 2026-03-24T14:30Z @developpeur UPDATE → /src/backend/svc-tournee/src/main/java/com/docapost/tournee/interfaces/rest/TourneeController.java
  US-008/009 : ajout endpoint POST /livraison + injection ConfirmerLivraisonHandler.

- 2026-03-24T14:30Z @developpeur CREATE → /src/backend/svc-tournee/src/test/java/com/docapost/tournee/domain/PreuveLivraisonTest.java, application/ConfirmerLivraisonHandlerTest.java, interfaces/ConfirmerLivraisonControllerTest.java
  US-008/009 : 28 tests TDD backend (12 domain + 8 application + 8 intégration web). 97/97 tests verts.

- 2026-03-24T14:30Z @developpeur CREATE → /src/mobile/src/screens/CapturePreuveScreen.tsx
  US-008/009 : écran M-04 — sélection type preuve, pad signature MVP, champs TIERS/DEPOT, bouton caméra.

- 2026-03-24T14:30Z @developpeur UPDATE → /src/mobile/src/api/tourneeTypes.ts, tourneeApi.ts
  US-008/009 : types TypePreuve, ConfirmerLivraisonRequest, PreuveLivraisonDTO + fonction confirmerLivraison() + erreurs LivraisonDejaConfirmeeError/DonneesPreuveInvalidesError.

- 2026-03-24T14:30Z @developpeur UPDATE → /src/mobile/src/screens/ListeColisScreen.tsx
  US-008/009 : import CapturePreuveScreen, navigation 'preuve', ouvrirCapturePreuve, onLivrer connecté dans DetailColisScreen.

- 2026-03-24T14:30Z @developpeur CREATE → /src/mobile/src/__tests__/CapturePreuveScreen.test.tsx
  US-008/009 : 19 tests Jest TDD (rendu, types, signature, tiers, depot, photo, erreur). 93/93 tests verts.

- 2026-03-24T14:30Z @developpeur CREATE → /livrables/06-dev/vertical-slices/US-008-impl.md
  Documentation vertical slice US-008 : signature numérique, BC-02 collocalisé, decisions architecturales.

- 2026-03-24T14:30Z @developpeur CREATE → /livrables/06-dev/vertical-slices/US-009-impl.md
  Documentation vertical slice US-009 : preuves alternatives (PHOTO, TIERS_IDENTIFIE, DEPOT_SECURISE).

- 2026-03-24T14:30Z @developpeur UPDATE → /livrables/00-contexte/journaux/journal-developpeur.md
  Mise à jour journal dev : US-008/009 → Implémenté, BUG-A/B/C → Résolus, décisions architecturales BC-02 ajoutées.

- 2026-03-24T17:00Z @developpeur UPDATE → /livrables/00-contexte/journaux/journal-developpeur.md
  Reprise de session : US-010/011/012 → Implémenté (rétroactivement), démarrage US-013/014.

- 2026-03-24T17:00Z @developpeur CREATE → /livrables/06-dev/vertical-slices/US-012-impl.md
  Documentation vertical slice US-012 : détail tournée superviseur, VueTourneeDetail Read Model, DetailTourneePage W-02.

- 2026-03-24T17:00Z @developpeur CREATE → /src/web/supervision/src/__tests__/DetailTourneePage.test.tsx
  US-012 : 6 tests Jest TDD (bandeau, badges, onglet incidents, 404, clôturée, WebSocket refresh).

- 2026-03-24T17:30Z @developpeur CREATE → /src/backend/svc-supervision/src/main/java/com/docapost/supervision/domain/events/TourneeARisqueDetectee.java
  US-013 : domain event TourneeARisqueDetectee (record immuable).

- 2026-03-24T17:30Z @developpeur CREATE → /src/backend/svc-supervision/src/main/java/com/docapost/supervision/domain/service/RisqueDetector.java
  US-013 : RisqueDetector domain service (seuil inactivité configurable).

- 2026-03-24T17:30Z @developpeur CREATE → /src/backend/svc-supervision/src/main/java/com/docapost/supervision/application/DetecterTourneesARisqueHandler.java
  US-013 : Application service de détection — EN_COURS→A_RISQUE, A_RISQUE→EN_COURS, broadcast 1×.

- 2026-03-24T17:30Z @developpeur CREATE → /src/backend/svc-supervision/src/main/java/com/docapost/supervision/infrastructure/scheduler/RisqueDetectorScheduler.java, infrastructure/config/SupervisionConfig.java
  US-013 : scheduler @Scheduled(60s) + @Bean RisqueDetector avec seuil configurable.

- 2026-03-24T17:30Z @developpeur CREATE → /src/backend/svc-supervision/src/test/java/com/docapost/supervision/application/RisqueDetectorTest.java, DetecterTourneesARisqueHandlerTest.java
  US-013 : 6 tests RisqueDetector + 5 tests handler. TDD.

- 2026-03-24T17:30Z @developpeur UPDATE → /src/web/supervision/src/pages/TableauDeBordPage.tsx, __tests__/TableauDeBordPage.test.tsx
  US-013 frontend : jouerAlerteAudio + alerte 1× useRef + point clignotant BandeauResume + surbrillance ligne A_RISQUE. 4 nouveaux tests Jest.

- 2026-03-24T17:30Z @developpeur CREATE → /livrables/06-dev/vertical-slices/US-013-impl.md
  Documentation vertical slice US-013 : RisqueDetector, scheduler, frontend alertes.

- 2026-03-24T18:00Z @developpeur CREATE → /src/backend/svc-supervision/src/main/java/com/docapost/supervision/domain/model/Instruction.java, TypeInstruction.java, StatutInstruction.java
  US-014 : Instruction Aggregate Root + enums domaine.

- 2026-03-24T18:00Z @developpeur CREATE → /src/backend/svc-supervision/src/main/java/com/docapost/supervision/domain/events/InstructionEnvoyee.java, domain/repository/InstructionRepository.java
  US-014 : domain event + port repository.

- 2026-03-24T18:00Z @developpeur CREATE → /src/backend/svc-supervision/src/main/java/com/docapost/supervision/application/EnvoyerInstructionCommand.java, EnvoyerInstructionHandler.java, InstructionDejaEnAttenteException.java
  US-014 : application layer — commande, handler, exception métier.

- 2026-03-24T18:00Z @developpeur CREATE → /src/backend/svc-supervision/src/main/java/com/docapost/supervision/infrastructure/persistence/InstructionEntity.java, InstructionJpaRepository.java, InstructionRepositoryImpl.java
  US-014 : infrastructure JPA — entité table instructions + repository impl.

- 2026-03-24T18:00Z @developpeur CREATE → /src/backend/svc-supervision/src/main/java/com/docapost/supervision/interfaces/rest/InstructionController.java, interfaces/dto/EnvoyerInstructionRequest.java, InstructionCreeDTO.java
  US-014 : POST /api/supervision/instructions (201/409/422/403).

- 2026-03-24T18:00Z @developpeur CREATE → /src/backend/svc-supervision/src/test/java/com/docapost/supervision/domain/InstructionTest.java, application/EnvoyerInstructionHandlerTest.java, interfaces/InstructionControllerTest.java
  US-014 : 5 tests domaine + 3 tests handler + 4 tests controller. TDD.

- 2026-03-24T18:00Z @developpeur CREATE → /src/web/supervision/src/pages/PanneauInstructionPage.tsx, __tests__/PanneauInstructionPage.test.tsx
  US-014 frontend : panneau W-03 modal + 6 tests Jest TDD.

- 2026-03-24T18:00Z @developpeur CREATE → /livrables/06-dev/vertical-slices/US-014-impl.md
  Documentation vertical slice US-014 : Instruction aggregate, endpoint, W-03, note FCM déféré Sprint 3.

- 2026-03-19T00:00Z @sponsor CREATE → /livrables/01-vision/vision-produit.md
  Création de la vision produit DocuPost à partir des entretiens terrain (Pierre, Mme Dubois, M. Garnier, M. Renaud).

- 2026-03-19T00:00Z @sponsor CREATE → /livrables/01-vision/kpis.md
  Création des KPIs DocuPost alignés sur les pain points terrain et les objectifs business.

- 2026-03-19T00:00Z @sponsor CREATE → /livrables/01-vision/perimetre-mvp.md
  Création du périmètre MVP avec les 3 parcours inclus, les exclusions et la classification DDD.

- 2026-03-19T00:00Z @ux CREATE → /livrables/02-ux/personas.md
  Création des 4 personas (Pierre livreur, Laurent superviseur, Sophie DSI, Éric architecte technique).

- 2026-03-19T00:00Z @ux CREATE → /livrables/02-ux/user-journeys.md
  Création des 5 parcours utilisateurs AS-IS et TO-BE MVP avec Domain Events identifiés.

- 2026-03-19T00:00Z @ux CREATE → /livrables/02-ux/wireframes.md
  Création des wireframes textuels pour les 9 écrans MVP (M-01 à M-06, W-01 à W-03).

- 2026-03-19T00:00Z @architecte-metier CREATE → /livrables/03-architecture-metier/domain-model.md
  Création du domain model avec Ubiquitous Language, Bounded Contexts, agrégats, Domain Events et invariants.

- 2026-03-19T00:00Z @architecte-metier CREATE → /livrables/03-architecture-metier/capability-map.md
  Création de la capability map avec 8 domaines et classification Core/Supporting/Generic.

- 2026-03-19T00:00Z @architecte-metier CREATE → /livrables/03-architecture-metier/modules-fonctionnels.md
  Création des 7 modules fonctionnels alignés sur les Bounded Contexts.

- 2026-03-19T00:00Z @architecte-technique CREATE → /livrables/04-architecture-technique/architecture-applicative.md
  Création de l'architecture applicative C4 (contexte + conteneurs), stack technique, stratégie offline-first.

- 2026-03-19T00:00Z @architecte-technique CREATE → /livrables/04-architecture-technique/design-decisions.md
  Création des décisions d'architecture (ADRs) techniques.

- 2026-03-19T00:00Z @architecte-technique CREATE → /livrables/04-architecture-technique/exigences-non-fonctionnelles.md
  Création des exigences non fonctionnelles (disponibilité, performance, sécurité, RGPD).

- 2026-03-19T00:00Z @architecte-technique CREATE → /livrables/04-architecture-technique/schemas-integration.md
  Création des schémas d'intégration OMS, SSO, FCM.

- 2026-03-19T00:00Z @po CREATE → /livrables/05-backlog/epics.md
  Création des 6 Epics MVP alignées sur les Bounded Contexts DDD.

- 2026-03-19T00:00Z @po CREATE → /livrables/05-backlog/features.md
  Création des 17 Features MVP avec priorités MoSCoW et Domain Events associés.

- 2026-03-19T00:00Z @po CREATE → /livrables/05-backlog/user-stories/US-001-consulter-liste-colis-tournee.md
  US-001 : Consulter la liste des colis assignés à ma tournée (F-001, Must Have, M).

- 2026-03-19T00:00Z @po CREATE → /livrables/05-backlog/user-stories/US-002-suivre-progression-tournee.md
  US-002 : Suivre ma progression en temps réel (F-001, Must Have, S).

- 2026-03-19T00:00Z @po CREATE → /livrables/05-backlog/user-stories/US-003-filtrer-colis-par-zone.md
  US-003 : Filtrer et organiser mes colis par zone géographique (F-002, Must Have, S).

- 2026-03-19T00:00Z @po CREATE → /livrables/05-backlog/user-stories/US-004-acceder-detail-colis.md
  US-004 : Accéder au détail d'un colis et déclencher une action (F-003, Must Have, S).

- 2026-03-19T22:00Z @po CREATE → /livrables/05-backlog/user-stories/US-005-declarer-echec-livraison.md
  US-005 : Déclarer un échec de livraison avec motif normalisé et disposition (F-004, Must Have, M).

- 2026-03-19T22:00Z @po CREATE → /livrables/05-backlog/user-stories/US-006-mode-offline-synchronisation.md
  US-006 : Continuer à livrer en zone blanche et synchroniser dès le retour de connexion (F-005, Must Have, L).

- 2026-03-19T22:00Z @po CREATE → /livrables/05-backlog/user-stories/US-007-cloture-tournee.md
  US-007 : Clôturer ma tournée et consulter le récapitulatif (F-006, Must Have, S).

- 2026-03-19T22:00Z @po CREATE → /livrables/05-backlog/user-stories/US-008-capturer-signature-numerique.md
  US-008 : Capturer une signature numérique comme preuve de livraison (F-007, Must Have, M).

- 2026-03-19T22:00Z @po CREATE → /livrables/05-backlog/user-stories/US-009-capturer-photo-ou-tiers.md
  US-009 : Capturer une photo ou identifier un tiers comme preuve de livraison (F-007, Must Have, M).

- 2026-03-19T22:00Z @po CREATE → /livrables/05-backlog/user-stories/US-010-consulter-preuve-litige.md
  US-010 : Consulter la preuve d'une livraison pour traiter un litige (F-008, Should Have, S).

- 2026-03-19T22:00Z @po CREATE → /livrables/05-backlog/user-stories/US-011-tableau-de-bord-tournees.md
  US-011 : Visualiser l'avancement de toutes les tournées du jour en temps réel (F-009, Must Have, L).

- 2026-03-19T22:00Z @po CREATE → /livrables/05-backlog/user-stories/US-012-detail-tournee-superviseur.md
  US-012 : Consulter le détail d'une tournée avec statuts des colis et incidents (F-010, Must Have, M).

- 2026-03-19T22:00Z @po CREATE → /livrables/05-backlog/user-stories/US-013-alerte-tournee-risque.md
  US-013 : Recevoir une alerte automatique dès qu'une tournée est à risque de retard (F-011, Must Have, L).

- 2026-03-19T22:00Z @po CREATE → /livrables/05-backlog/user-stories/US-014-envoyer-instruction-livreur.md
  US-014 : Envoyer une instruction structurée à un livreur depuis le tableau de bord (F-012, Must Have, M).

- 2026-03-19T22:00Z @po CREATE → /livrables/05-backlog/user-stories/US-015-suivre-execution-instruction.md
  US-015 : Suivre l'état d'exécution d'une instruction envoyée à un livreur (F-012, Must Have, S).

- 2026-03-19T22:00Z @po CREATE → /livrables/05-backlog/user-stories/US-016-notification-push-instruction.md
  US-016 : Recevoir une notification push quand le superviseur modifie ma tournée (F-013, Must Have, M).

- 2026-03-19T22:00Z @po CREATE → /livrables/05-backlog/user-stories/US-017-synchronisation-oms.md
  US-017 : Synchroniser automatiquement les événements de livraison vers l'OMS (F-015, Must Have, L).

- 2026-03-19T22:00Z @po CREATE → /livrables/05-backlog/user-stories/US-018-historisation-immuable-evenements.md
  US-018 : Garantir l'historisation immuable de chaque événement de livraison (F-016, Must Have, M).

- 2026-03-19T22:00Z @po CREATE → /livrables/05-backlog/user-stories/US-019-authentification-sso-mobile.md
  US-019 : M'authentifier via SSO depuis l'application mobile (F-017, Must Have, S).

- 2026-03-19T22:00Z @po CREATE → /livrables/05-backlog/user-stories/US-020-authentification-sso-web.md
  US-020 : M'authentifier via SSO depuis l'interface web de supervision (F-017, Must Have, S).

- 2026-03-19T22:00Z @po CREATE → /livrables/05-backlog/definition-mvp.md
  Création de la définition MVP avec 20 US, 17 Features, 6 Epics, KPIs cibles et DoD.

- 2026-03-19T22:00Z @po CREATE → /livrables/CHANGELOG-actions-agents.md
  Création du CHANGELOG des actions agents DocuPost.

- 2026-03-20T12:00Z @orchestrateur CREATE → /livrables/00-contexte/journaux/ (x9 fichiers)
  Création des journaux de bord des 9 agents avec contextes synthétisés, décisions et suivi d'interventions.

- 2026-03-20T12:00Z @orchestrateur UPDATE → /CLAUDE.md
  Ajout protocole journaux de bord (lecture début de session, mise à jour fin de session). Arborescence mise à jour.

- 2026-03-20T00:00Z @orchestrateur CREATE → /livrables/00-Entretiens métier/synthese-entretiens.md
  Création de la synthèse des entretiens : ajout du besoin "Gestion en amont des tournées TMS" (Parcours 0, responsable logistique, bloquant pour le MVP).

- 2026-03-20T00:00Z @sponsor UPDATE → /livrables/01-vision/vision-produit.md
  Ajout du bloc "Côté Responsable logistique (gestion TMS)" dans la Problématique métier ; enrichissement de la Vision cible avec l'écran de préparation des tournées ; ajout du Parcours 0 dans le Périmètre MVP ; enrichissement du profil M. Renaud avec son rôle de préparation matinale. Version 1.0 → 1.1.

- 2026-03-20T00:00Z @sponsor UPDATE → /livrables/01-vision/perimetre-mvp.md
  Ajout du Parcours 0 (Préparation des tournées TMS) avant le Parcours 1 ; remplacement de "Redistribution automatique de colis entre livreurs" par "Affectation automatique optimisée (algorithme de dispatch)" dans les exclusions ; ajout de l'hypothèse H6 (API TMS) ; mise à jour de la classification DDD avec "Préparation et affectation des tournées" comme second Core Domain. Version 1.0 → 1.1.

- 2026-03-20T00:00Z @sponsor UPDATE → /livrables/01-vision/kpis.md
  Ajout de la section "KPIs responsable logistique — Préparation des tournées (Parcours 0)" avec 4 nouveaux KPIs (temps de préparation, taux d'affectation, réduction erreurs, import TMS) ; mise à jour des Modalités de mesure. Version 1.0 → 1.1.

- 2026-03-20T00:00Z @ux UPDATE → /livrables/02-ux/personas.md
  Enrichissement du Persona 2 (Laurent Renaud) : ajout du rôle de préparation matinale (Parcours 0), heure d'arrivée au dépôt, volume de tournées, frustrations liées à l'affectation manuelle et termes terrain (tournée TMS, plan du jour, affectation, vérification de composition, lancement de tournée, véhicule). Mise à jour du glossaire. Version 1.0 → 1.1.

- 2026-03-20T00:00Z @ux UPDATE → /livrables/02-ux/user-journeys.md
  Ajout du Parcours 0 "Responsable logistique : Préparer les tournées du jour" (AS-IS et TO-BE MVP) avec Domain Events TournéeImportéeTMS, TournéeVérifiée, AffectationEnregistrée, TournéeLancée. Enrichissement du glossaire terrain. Version 1.0 → 1.1.

- 2026-03-20T00:00Z @ux UPDATE → /livrables/02-ux/wireframes.md
  Ajout des wireframes W-04 (Vue liste des tournées du matin) et W-05 (Détail d'une tournée à préparer) pour l'interface web du responsable logistique (Parcours 0). Mise à jour du tableau récapitulatif (11 écrans). Version 1.0 → 1.1.

- 2026-03-20T09:30Z @architecte-metier UPDATE → /livrables/03-architecture-metier/domain-model.md
  Ajout BC-07 Planification de Tournée : ubiquitous language (6 nouveaux termes : Plan du jour, TournéeTMS, Affectation, Véhicule, Composition de tournée, Lancement de tournée), modèle détaillé (PlanDuJour, TournéeTMS, Affectation, Véhicule), 5 invariants, domain events (TournéeImportéeTMS, CompositionVérifiée, AffectationEnregistrée, TournéeLancée), mise à jour context map (2 nouvelles relations : TMS_Externe ACL BC_Planification, BC_Planification C/S BC_Orchestration), 2 nouvelles règles métier transversales. Version 1.0 → 1.1.

- 2026-03-20T09:30Z @architecte-metier UPDATE → /livrables/03-architecture-metier/capability-map.md
  Ajout du Domaine 0 "Planification et préparation des tournées" (Core Domain, 4 sous-capabilities : Import TMS, Vérification de composition, Affectation livreur/véhicule, Lancement des tournées) ; ajout sous-capability 5.3 "Intégration TMS" (Generic Subdomain, 2 sous-capacités : Import API TMS, Normalisation modèle TMS) ; mise à jour synthèse stratégique (Core Domain étendu à 3 domaines). Version 1.0 → 1.1.

- 2026-03-20T09:30Z @architecte-metier UPDATE → /livrables/03-architecture-metier/modules-fonctionnels.md
  Ajout Module 8 — Planification de Tournée (Core Domain, BC-07) : composants (ImporteurTMS, VérificateurComposition, GestionnaireAffectation, LanceurTournée), API REST (GET /plans/{date}, GET /plans/{date}/tournees, POST /affectations, POST /tournees/{id}/lancer), dépendances (Module 1, Module 6, TMS externe), events publiés (TournéeImportéeTMS, AffectationEnregistrée, TournéeLancée), 6 règles métier ; mise à jour matrice de dépendances inter-modules ; ajout principe d'architecture n°7 (chaîne M8 → M1). Version 1.0 → 1.1.

- 2026-03-20T10:00Z @architecte-technique UPDATE → /livrables/04-architecture-technique/architecture-applicative.md
  Ajout TMS externe (C4 contexte), conteneur ImporteurTMS (scheduled 6h00), enrichissement backend et frontend pour le Module 8 Planification (BC-07, 4 endpoints REST, écrans W-04/W-05), structure de couches BC-07, stratégie offline (note Parcours 0 web uniquement). Version 1.1 → 1.2.

- 2026-03-20T10:00Z @architecte-technique UPDATE → /livrables/04-architecture-technique/schemas-integration.md
  Ajout schéma "Intégration TMS — Import des tournées du matin" avec flux complet (ImporteurTMSScheduler → ACL TmsResponseTranslator → BC-07 → TourneeLancee → BC-01), ACL TMS détaillée (TournéeTMS TMS → PlanDuJour/TourneeTMS DocuPost), mode dégradé TMS indisponible (alerte + retries + saisie manuelle), stratégie de rejeu import TMS, mise à jour Context Map et tableau SLA. Version 1.0 → 1.1.

- 2026-03-20T10:00Z @architecte-technique UPDATE → /livrables/04-architecture-technique/design-decisions.md
  Ajout DD-010 "Stratégie d'import TMS" (API REST pull + fallback batch fichier, ACL DocuPost-side, configuration YAML externalisée, condition H6) et DD-011 "Fenêtre de planification matinale" (cron 6h00 import, alerte 6h45 tournées non affectées, AlertePlanificationScheduler). Version 1.1 → 1.2.

- 2026-03-20T10:00Z @architecte-technique UPDATE → /livrables/04-architecture-technique/exigences-non-fonctionnelles.md
  Ajout NFR Parcours 0 : ENF-DISP-004 (disponibilité interface web planification dès 6h00), ENF-PERF-010 (import TMS < 5 min), ENF-RESIL-005 (résilience TMS indisponible : alerte < 2 min + 3 retries + saisie manuelle), ENF-SEC-008 (endpoints planification réservés SUPERVISOR via @PreAuthorize) ; mise à jour matrice de criticité et alertes ENF-OBS-005. Version 1.1 → 1.2.

- 2026-03-20T11:00Z @po UPDATE → /livrables/05-backlog/epics.md
  Ajout EPIC-007 Planification et Préparation des Tournées (BC-07, Core Domain, MVP). Version 1.0 → 1.1.

- 2026-03-20T11:00Z @po UPDATE → /livrables/05-backlog/features.md
  Ajout F-018 (Import TMS), F-019 (Vérification composition), F-020 (Affectation livreur/véhicule), F-021 (Lancement tournées) pour EPIC-007. Version 1.0 → 1.1.

- 2026-03-20T11:00Z @po CREATE → /livrables/05-backlog/user-stories/US-021-visualiser-plan-du-jour.md
  US-021 : Visualiser le plan du jour importé depuis le TMS (F-018, Must Have, M).

- 2026-03-20T11:00Z @po CREATE → /livrables/05-backlog/user-stories/US-022-verifier-composition-tournee.md
  US-022 : Vérifier la composition d'une tournée avant affectation (F-019, Should Have, S).

- 2026-03-20T11:00Z @po CREATE → /livrables/05-backlog/user-stories/US-023-affecter-livreur-vehicule.md
  US-023 : Affecter un livreur et un véhicule à une tournée (F-020, Must Have, M).

- 2026-03-20T11:00Z @po CREATE → /livrables/05-backlog/user-stories/US-024-lancer-tournee.md
  US-024 : Lancer une tournée pour la rendre visible au livreur (F-021, Must Have, S).

- 2026-03-20T11:00Z @po UPDATE → /livrables/05-backlog/definition-mvp.md
  Mise à jour definition-mvp : 24 US, 21 Features, 7 Epics — ajout Parcours 0 Planification, 3 KPIs logisticien, hypothèse H6 TMS, note intégration Parcours 0 au périmètre MVP. Version 1.0 → 1.1.

- 2026-03-20T14:00Z @developpeur CREATE → /src/ (init monorepo)
  Initialisation du monorepo DocuPost : structure svc-tournee (BC-01), mobile partiel (api + screens + components), stubs web et shared/domain-events.

- 2026-03-20T14:00Z @developpeur CREATE → /src/backend/svc-tournee/ (US-001)
  Implémentation US-001 backend : domain (Tournee, Colis, VOs, events, repository), application (ConsulterListeColisHandler, command, exception), infrastructure (JPA entities, mapper, TourneeRepositoryImpl, DevDataSeeder dev), interfaces (GET /api/tournees/today, DTOs, MockJwtAuthFilter dev, SecurityConfig). Tests TDD : TourneeTest, ConsulterListeColisHandler Test, TourneeControllerTest.

- 2026-03-20T14:00Z @developpeur CREATE → /src/mobile/src/ (US-001)
  Implémentation US-001 mobile : tourneeTypes.ts, tourneeApi.ts, ListeColisScreen.tsx (états chargement/succès/vide/erreur, FlatList, bandeau progression), ColisItem.tsx (statut badge, contraintes mises en évidence), test Jest ListeColisScreen.test.tsx (8 scénarios).

- 2026-03-20T14:00Z @developpeur CREATE → /livrables/06-dev/vertical-slices/US-001-impl.md
  Documentation du vertical slice US-001 : décisions (mock auth, seeder, Spring Boot 3.4.3, collect-and-publish), liste des fichiers, tests, limitations et roadmap de remplacement.

- 2026-03-20T14:00Z @developpeur UPDATE → /livrables/00-contexte/journaux/journal-developpeur.md
  Mise à jour journal développeur : US-001 → statut Implémenté, 5 décisions techniques enregistrées (DT-001 à DT-005), interventions et TODOs actifs.

- 2026-03-20T15:00Z @qa CREATE → /livrables/07-tests/scenarios/US-001-scenarios.md
  25 scénarios de test US-001 : invariants domaine (TC-001 à TC-005), application (TC-006 à TC-009), interface API (TC-010 à TC-014), mobile (TC-015 à TC-019), edge cases et non-régression (TC-020 à TC-023), performance (TC-024), sécurité (TC-025).

- 2026-03-20T15:00Z @qa CREATE → /livrables/07-tests/jeux-de-donnees.md
  Jeux de données US-001 : JDD-001 (5 colis standard Pierre Morel), JDD-002 (livreur sans tournée), JDD-003 (120 colis performance), JDD-004 (colis multi-contraintes), JDD-005 (tournée 1 colis), JDD-006 (colis traités LIVRE+ECHEC).

- 2026-03-20T15:00Z @qa UPDATE → /livrables/07-tests/plan-tests.md
  Mise à jour plan-tests.md v1.1 : ajout section US-001 (25 TCs, couverture par couche, mapping tests automatisés existants JUnit/Jest, TCs à implémenter perf/sécurité, TCs manuels).

- 2026-03-20T15:00Z @qa UPDATE → /livrables/00-contexte/journaux/journal-qa.md
  US-001 → statut "Scénarios rédigés + Jeux de données prêts". Mise à jour tableau suivi, interventions et points d'attention.

- 2026-03-20T16:00Z @end-user CREATE → /livrables/09-feedback/feedback-US001-liste-colis-2026-03-20.md
  Feedback terrain Pierre Morel (livreur) sur US-001 liste des colis — 3 bloquants, 5 améliorations importantes, note 3/5.

- 2026-03-20T18:00Z @developpeur CREATE → /src/backend/svc-tournee/src/main/java/com/docapost/tournee/domain/service/AvancementCalculator.java
  US-002 : Domain Service AvancementCalculator (calcul avancement + estimationFin null MVP).

- 2026-03-20T18:00Z @developpeur CREATE → /src/backend/svc-tournee/src/test/java/com/docapost/tournee/domain/AvancementCalculatorTest.java
  US-002 : 6 tests TDD pour AvancementCalculator (SC1 reste à livrer, SC3 A_REPRESENTER exclu, SC4 estTerminee, cohérence).

- 2026-03-20T18:00Z @developpeur UPDATE → /src/backend/svc-tournee/src/test/java/com/docapost/tournee/domain/TourneeTest.java
  US-002 : +3 tests invariants US-002 (resteALivrer, estTerminee true/false).

- 2026-03-20T18:00Z @developpeur UPDATE → /src/backend/svc-tournee/src/main/java/com/docapost/tournee/infrastructure/seeder/DevDataSeeder.java
  US-002 : Données de test enrichies avec mix statuts réalistes (3 A_LIVRER, 1 LIVRE, 1 ECHEC).

- 2026-03-20T18:00Z @developpeur UPDATE → /src/mobile/src/screens/ListeColisScreen.tsx
  US-002 : Bouton "Clôturer la tournée" conditionnel (visible si resteALivrer === 0, SC4).

- 2026-03-20T18:00Z @developpeur UPDATE → /src/mobile/src/__tests__/ListeColisScreen.test.tsx
  US-002 : +4 tests mobiles (bouton clôture SC4, bandeau progression, estimation null).

- 2026-03-20T18:00Z @developpeur UPDATE → /src/mobile/package.json
  Bugfix : setupFilesAfterFramework → setupFilesAfterEnv (matchers @testing-library/jest-native non appliqués).

- 2026-03-20T18:00Z @developpeur UPDATE → /src/backend/svc-tournee/src/test/java/com/docapost/tournee/application/ConsulterListeColisHandlerTest.java
  BUG-002 : Ajout @Mock ApplicationEventPublisher + stub save() + correction assertion events.

- 2026-03-20T18:00Z @developpeur UPDATE → /src/backend/svc-tournee/pom.xml
  BUG-002 : Ajout maven-surefire-plugin avec spring.classformat.ignore=true pour Java 25 + Spring ASM.

- 2026-03-20T18:00Z @developpeur CREATE → /livrables/06-dev/vertical-slices/US-002-impl.md
  Documentation vertical slice US-002 : AvancementCalculator, bouton clôture, bugfixes BUG-002, bilan tests 13 verts mobiles + 18 verts backend.

- 2026-03-20T18:00Z @developpeur UPDATE → /livrables/00-contexte/journaux/journal-developpeur.md
  US-002 → statut Implémenté. 3 nouvelles décisions techniques (AvancementCalculator, estimationFin null MVP, BUG-002).

- 2026-03-20T19:00Z @developpeur FIX → /src/backend/svc-tournee/pom.xml, /src/backend/svc-tournee/src/test/resources/mockito-extensions/org.mockito.plugins.MockMaker
  BUG-002 corrigé : 23/23 tests verts. Diagnostic complet (JAVA_HOME=JDK20 vs PATH=JDK25 vs classes compilées JDK21). Solution : mock-maker-subclass (CGLIB proxy, évite instrumentation bytecode incompatible Java 25) + spring.classformat.ignore=true. Lancer Maven avec JAVA_HOME JDK 25.

- 2026-03-20T19:00Z @developpeur UPDATE → /livrables/00-contexte/journaux/journal-developpeur.md
  BUG-002 → statut résolu. Décision technique DT-009 enregistrée (mock-maker-subclass + JAVA_HOME JDK 25).

- 2026-03-23T00:00Z @developpeur UPDATE → /livrables/06-dev/vertical-slices/US-002-impl.md
  Ajout section "Commandes de lancement (tests manuels)" : backend Maven (options A/B + note JAVA_HOME JDK 25), mobile npm start/Expo, URLs de test avec données DevDataSeeder attendues, commandes tests unitaires backend et mobile.

- 2026-03-23T00:00Z @developpeur UPDATE → /livrables/00-contexte/journaux/journal-developpeur.md
  Nouvelle intervention 2026-03-23 enregistrée. Correction avertissements Markdown préexistants (MD040 bloc code sans langage, MD060 séparateurs tableaux, MD036 emphase utilisée comme titre).

- 2026-03-23T12:00Z @qa CREATE → /livrables/06-dev/poste-de-commande-tests.md
  Création du poste de commande tests manuels — section US-002 : 10 lignes de check-list (bandeau progression, bouton clôture, invariants, API brute, accessibilité), limitations connues BUG-002, feedback structuré.

- 2026-03-23T12:00Z @qa CREATE → /livrables/07-tests/scenarios/US-002-scenarios.md
  20 scénarios de test US-002 en Ubiquitous Language : invariants domaine TC-026 à TC-033 (AvancementCalculator + Tournee), application TC-034 à TC-037, interface mobile TC-038 à TC-041, edge cases TC-042 à TC-044, non-régression TC-045. 5 jeux de données JDD-US002-01 à JDD-US002-05.

- 2026-03-23T12:00Z @qa UPDATE → /livrables/00-contexte/journaux/journal-qa.md
  US-002 → statut "Scénarios rédigés + check-list tests manuels". Ajout section points d'attention US-002, mise à jour tableau suivi et interventions.

- 2026-03-23T14:00Z @qa CREATE → /src/mobile/e2e/US-002-progression-tournee.spec.ts
  Spec Playwright E2E US-002 : 13 tests couvrant SC1 (bandeau 3/5), SC2 (bouton clôture absent), SC3 (estimation fin / "--"), SC4 (mock resteALivrer=0 → bouton visible), API backend directs (resteALivrer, colisTotal, estimationFin null, statuts DevDataSeeder).

- 2026-03-23T14:00Z @qa CREATE → /livrables/07-tests/scenarios/US-002-rapport-playwright.md
  Rapport Playwright US-002 : 13/13 FAIL infrastructurels (ERR_CONNECTION_REFUSED — serveurs non démarrés). Analyse statique du spec : cohérence 100 % avec l'implémentation, couverture 4/4 scénarios Gherkin. Commandes de relance documentées.

- 2026-03-23T19:55Z @developpeur FIX → /src/backend/svc-tournee/src/main/java/com/docapost/tournee/infrastructure/seeder/DevDataSeeder.java
  BUG-001 : DevDataSeeder — ajout paramètre StatutColis à createColis() + appel explicite LIVRE/ECHEC pour colis-dev-004/005. colis-dev-001/002/003 → A_LIVRER, colis-dev-004 → LIVRE, colis-dev-005 → ECHEC.

- 2026-03-23T19:55Z @developpeur FIX → /src/backend/svc-tournee/src/main/java/com/docapost/tournee/interfaces/dto/TourneeDTO.java
  BUG-002 : TourneeDTO — ajout champ estTerminee (boolean) calculé depuis Avancement.estTerminee(). Champ désormais présent dans la réponse JSON GET /api/tournees/today.

- 2026-03-23T19:55Z @developpeur FIX → /src/mobile/src/screens/ListeColisScreen.tsx
  BUG-003 : ListeColisScreen — testID="estimation-fin" toujours rendu (même si estimationFin=null). Affiche "--" si null, sinon "Fin estimee : {valeur}". Suppression du rendu conditionnel {estimationFin && ...}.

- 2026-03-23T19:55Z @developpeur UPDATE → /livrables/00-contexte/journaux/journal-developpeur.md
  Bilan post-bugfixes Playwright US-002 : 3 bugs réels corrigés. API validée : resteALivrer=3, estTerminee=false, 3 A_LIVRER + 1 LIVRE + 1 ECHEC. Tests backend : 23/23 verts.

- 2026-03-23T14:00Z @qa UPDATE → /livrables/00-contexte/journaux/journal-qa.md
  US-002 → statut mis à jour : "Scénarios rédigés + spec Playwright créé (13 tests) + rapport statique". Interventions de session ajoutées. Séparateurs MD060 corrigés (lignes 22 et 55).

- 2026-03-23T21:05Z @developpeur CREATE → /livrables/06-dev/vertical-slices/US-003-impl.md
  Implémentation US-003 : filtrage par zone géographique (mobile). domain/filtreZone.ts + FiltreZones.tsx + ListeColisScreen mis à jour. TDD appliqué. 34/34 tests Jest verts.

- 2026-03-23T21:05Z @developpeur CREATE → /C/Github/Botfactory/src/mobile/src/domain/filtreZone.ts
  Nouveau : logique de domaine pure pour filtrage par zone (extraireZonesDisponibles, filtrerColisByZone, ZONE_TOUS).

- 2026-03-23T21:05Z @developpeur CREATE → /C/Github/Botfactory/src/mobile/src/components/FiltreZones.tsx
  Nouveau : composant barre d'onglets zones géographiques pour écran M-02.

- 2026-03-23T21:05Z @developpeur UPDATE → /C/Github/Botfactory/src/mobile/src/screens/ListeColisScreen.tsx
  Intégration FiltreZones + logique de filtrage locale (useMemo). Estimation fin : rendu conditionnel restauré.

- 2026-03-23T21:05Z @developpeur UPDATE → /C/Github/Botfactory/src/mobile/package.json
  Fix Jest : exclusion du dossier e2e/ (specs Playwright) via testPathIgnorePatterns.

- 2026-03-23T21:05Z @developpeur UPDATE → /livrables/06-dev/poste-de-commande-tests.md
  Ajout section US-003 : check-list 11 scénarios manuels pour PO / expert métier.

- 2026-03-23T21:05Z @developpeur UPDATE → /livrables/00-contexte/journaux/journal-developpeur.md
  US-003 → statut "Implémenté". Décisions et interventions ajoutées.

- 2026-03-23T21:15Z @qa CREATE → /livrables/07-tests/scenarios/US-003-scenarios.md
  Rédaction 28 scénarios de tests US-003 (TC-046 à TC-073) : Domain (11), Interface (14), Non régression (3), E2E à tester (4).

- 2026-03-23T21:15Z @qa UPDATE → /livrables/07-tests/jeux-de-donnees.md
  Ajout JDD-US003-01 à JDD-US003-05 (tournée 3 zones, zone traitée, sans zones, DevDataSeeder, logique pure).

- 2026-03-23T21:15Z @qa CREATE → /livrables/07-tests/scenarios/US-003-rapport-playwright.md
  Rapport de tests US-003 : 57/57 Jest+mvn PASS, 4 scénarios E2E documentés (infrastructure non disponible en session).

- 2026-03-23T21:15Z @qa UPDATE → /livrables/00-contexte/journaux/journal-qa.md
  Mise à jour statut US-003 "Exécutés", ajout interventions et points d'attention spécifiques US-003.

- 2026-03-23T23:10Z @developpeur CREATE → /src/backend/svc-tournee/src/main/java/com/docapost/tournee/application/ConsulterDetailColisCommand.java
  US-004 : Command immuable (record) portant TourneeId + ColisId pour le use case détail colis.

- 2026-03-23T23:10Z @developpeur CREATE → /src/backend/svc-tournee/src/main/java/com/docapost/tournee/application/ConsulterDetailColisHandler.java
  US-004 : Application Service lecture seule — charge la Tournée, cherche le Colis, lève ColisNotFoundException si absent.

- 2026-03-23T23:10Z @developpeur CREATE → /src/backend/svc-tournee/src/main/java/com/docapost/tournee/application/ColisNotFoundException.java
  US-004 : Exception applicative levée quand le colisId ne correspond à aucun colis de la tournée.

- 2026-03-23T23:10Z @developpeur UPDATE → /src/backend/svc-tournee/src/main/java/com/docapost/tournee/interfaces/rest/TourneeController.java
  US-004 : Ajout endpoint GET /api/tournees/{tourneeId}/colis/{colisId} — retourne ColisDTO ou 404.

- 2026-03-23T23:10Z @developpeur UPDATE → /src/backend/svc-tournee/src/main/java/com/docapost/tournee/interfaces/dto/ColisDTO.java
  US-004 : Ajout champ estTraite (boolean) dans ColisDTO pour permettre le masquage des boutons côté frontend.

- 2026-03-23T23:10Z @developpeur CREATE → /src/mobile/src/screens/DetailColisScreen.tsx
  US-004 : Écran M-03 — détail d'un colis avec destinataire, adresse, contraintes, boutons d'action masqués si statut terminal, numéro téléphone masqué (RGPD).

- 2026-03-23T23:10Z @developpeur UPDATE → /src/mobile/src/components/ColisItem.tsx
  US-004 : Item de liste rendu navigable (TouchableOpacity + onPress) pour accéder au détail.

- 2026-03-23T23:10Z @developpeur UPDATE → /src/mobile/src/screens/ListeColisScreen.tsx
  US-004 : Navigation interne vers DetailColisScreen via état NavigationColis.

- 2026-03-23T23:10Z @developpeur UPDATE → /src/mobile/src/api/tourneeApi.ts
  US-004 : Ajout getDetailColis() + ColisNonTrouveError.

- 2026-03-23T23:10Z @developpeur UPDATE → /src/mobile/src/api/tourneeTypes.ts
  US-004 : Ajout champ estTraite dans ColisDTO TypeScript.

- 2026-03-23T23:10Z @developpeur CREATE → /src/backend/svc-tournee/src/test/java/com/docapost/tournee/application/ConsulterDetailColisHandlerTest.java
  US-004 TDD : 5 tests unitaires ConsulterDetailColisHandler (verts).

- 2026-03-23T23:10Z @developpeur CREATE → /src/backend/svc-tournee/src/test/java/com/docapost/tournee/interfaces/DetailColisControllerTest.java
  US-004 TDD : 6 tests d'intégration controller (verts). Total backend : 34/34.

- 2026-03-23T23:10Z @developpeur CREATE → /src/mobile/src/__tests__/DetailColisScreen.test.tsx
  US-004 TDD : 16 tests Jest DetailColisScreen (verts). Total Jest : 50/50.

- 2026-03-23T23:10Z @developpeur CREATE → /livrables/06-dev/vertical-slices/US-004-impl.md
  Documentation du vertical slice US-004 avec décisions d'implémentation et scénarios de tests manuels.

- 2026-03-23T23:10Z @developpeur UPDATE → /livrables/00-contexte/journaux/journal-developpeur.md
  US-004 → statut "Implémenté". Décisions et interventions ajoutées.

- 2026-03-24T09:00Z @developpeur CREATE → /src/backend/svc-tournee/src/main/java/com/docapost/tournee/domain/model/MotifNonLivraison.java
  US-005 TDD Domain : Value Object MotifNonLivraison (ABSENT, ACCES_IMPOSSIBLE, REFUS_CLIENT, HORAIRE_DEPASSE).

- 2026-03-24T09:00Z @developpeur CREATE → /src/backend/svc-tournee/src/main/java/com/docapost/tournee/domain/model/Disposition.java
  US-005 TDD Domain : Value Object Disposition (A_REPRESENTER, DEPOT_CHEZ_TIERS, RETOUR_DEPOT).

- 2026-03-24T09:00Z @developpeur CREATE → /src/backend/svc-tournee/src/main/java/com/docapost/tournee/domain/events/EchecLivraisonDeclare.java
  US-005 TDD Domain : Domain Event EchecLivraisonDeclare (immuable, horodaté, note max 250 car.).

- 2026-03-24T09:00Z @developpeur UPDATE → /src/backend/svc-tournee/src/main/java/com/docapost/tournee/domain/model/Colis.java
  US-005 : ajout champs motifNonLivraison, disposition + constructeur étendu + setters package-private.

- 2026-03-24T09:00Z @developpeur UPDATE → /src/backend/svc-tournee/src/main/java/com/docapost/tournee/domain/model/Tournee.java
  US-005 : ajout méthode declarerEchecLivraison() avec invariants et emission EchecLivraisonDeclare.

- 2026-03-24T09:00Z @developpeur CREATE → /src/backend/svc-tournee/src/main/java/com/docapost/tournee/application/DeclarerEchecLivraisonCommand.java
  US-005 : Command record pour la déclaration d'échec.

- 2026-03-24T09:00Z @developpeur CREATE → /src/backend/svc-tournee/src/main/java/com/docapost/tournee/application/DeclarerEchecLivraisonHandler.java
  US-005 : Application Service orchestrant la déclaration d'échec (@Transactional).

- 2026-03-24T09:00Z @developpeur UPDATE → /src/backend/svc-tournee/src/main/java/com/docapost/tournee/infrastructure/persistence/ColisEntity.java
  US-005 : colonnes JPA motif_non_livraison et disposition ajoutées (nullable).

- 2026-03-24T09:00Z @developpeur UPDATE → /src/backend/svc-tournee/src/main/java/com/docapost/tournee/infrastructure/persistence/TourneeMapper.java
  US-005 : mapping motif/disposition dans colisToDomain, colisToEntity, updateStatut.

- 2026-03-24T09:00Z @developpeur CREATE → /src/backend/svc-tournee/src/main/java/com/docapost/tournee/interfaces/dto/DeclarerEchecRequest.java
  US-005 : DTO de requête POST pour la déclaration d'échec.

- 2026-03-24T09:00Z @developpeur UPDATE → /src/backend/svc-tournee/src/main/java/com/docapost/tournee/interfaces/dto/ColisDTO.java
  US-005 : champs motifNonLivraison et disposition ajoutés dans le DTO de réponse.

- 2026-03-24T09:00Z @developpeur UPDATE → /src/backend/svc-tournee/src/main/java/com/docapost/tournee/interfaces/rest/TourneeController.java
  US-005 : endpoint POST /{tourneeId}/colis/{colisId}/echec avec gestion 200/404/409/401.

- 2026-03-24T09:00Z @developpeur CREATE → /src/backend/svc-tournee/src/test/java/com/docapost/tournee/domain/DeclarerEchecLivraisonTest.java
  US-005 TDD : 10 tests domain (transitions, invariants, events). Total backend : 54/54 verts.

- 2026-03-24T09:00Z @developpeur CREATE → /src/backend/svc-tournee/src/test/java/com/docapost/tournee/application/DeclarerEchecLivraisonHandlerTest.java
  US-005 TDD : 5 tests application (orchestration, exceptions). Total backend : 54/54 verts.

- 2026-03-24T09:00Z @developpeur CREATE → /src/backend/svc-tournee/src/test/java/com/docapost/tournee/interfaces/EchecLivraisonControllerTest.java
  US-005 TDD : 5 tests REST (200/404/409/401). Total backend : 54/54 verts.

- 2026-03-24T09:00Z @developpeur UPDATE → /src/mobile/src/api/tourneeTypes.ts
  US-005 : types MotifNonLivraison, Disposition, MOTIF_LABELS, DISPOSITION_LABELS, DeclarerEchecRequest.

- 2026-03-24T09:00Z @developpeur UPDATE → /src/mobile/src/api/tourneeApi.ts
  US-005 : fonction declarerEchecLivraison() + EchecDejaDeClareError.

- 2026-03-24T09:00Z @developpeur CREATE → /src/mobile/src/screens/DeclarerEchecScreen.tsx
  US-005 : écran M-05 (motifs radio, dispositions radio, note optionnelle, bouton désactivé, erreurs).

- 2026-03-24T09:00Z @developpeur UPDATE → /src/mobile/src/screens/ListeColisScreen.tsx
  US-005 : navigation vers DeclarerEchecScreen (état echec), rechargement après enregistrement.

- 2026-03-24T09:00Z @developpeur CREATE → /src/mobile/src/__tests__/DeclarerEchecScreen.test.tsx
  US-005 TDD : 14 tests Jest écran M-05. Total Jest : 64/64 verts.

- 2026-03-24T09:00Z @developpeur CREATE → /livrables/06-dev/vertical-slices/US-005-impl.md
  Documentation du vertical slice US-005 avec décisions d'implémentation et commandes de tests manuels.

- 2026-03-24T09:00Z @developpeur UPDATE → /livrables/00-contexte/journaux/journal-developpeur.md
  US-005 → statut "Implémenté". Décisions et interventions ajoutées.

- 2026-03-24T10:00Z @developpeur CREATE → /src/backend/svc-tournee/src/main/java/com/docapost/tournee/domain/model/RecapitulatifTournee.java
  US-007 : Value Object RecapitulatifTournee (colisTotal, colisLivres, colisEchecs, colisARepresenter) avec méthode factory calculer(List<Colis>).

- 2026-03-24T10:00Z @developpeur CREATE → /src/backend/svc-tournee/src/main/java/com/docapost/tournee/domain/events/TourneeCloturee.java
  US-007 : Domain Event TourneeCloturee immuable + horodaté (tourneeId, livreurId, recap, horodatage).

- 2026-03-24T10:00Z @developpeur UPDATE → /src/backend/svc-tournee/src/main/java/com/docapost/tournee/domain/model/Tournee.java
  US-007 : ajout Tournee.cloturerTournee() — invariant A_LIVRER + idempotence + émission TourneeCloturee.

- 2026-03-24T10:00Z @developpeur CREATE → /src/backend/svc-tournee/src/main/java/com/docapost/tournee/application/CloturerTourneeCommand.java
  US-007 : Command CloturerTourneeCommand (TourneeId).

- 2026-03-24T10:00Z @developpeur CREATE → /src/backend/svc-tournee/src/main/java/com/docapost/tournee/application/RecapitulatifTourneeResult.java
  US-007 : DTO Application RecapitulatifTourneeResult (résultat handler → interface layer).

- 2026-03-24T10:00Z @developpeur CREATE → /src/backend/svc-tournee/src/main/java/com/docapost/tournee/application/CloturerTourneeHandler.java
  US-007 : Application Service CloturerTourneeHandler (charger → cloturerTournee → sauvegarder → publier events → retourner recap).

- 2026-03-24T10:00Z @developpeur CREATE → /src/backend/svc-tournee/src/main/java/com/docapost/tournee/interfaces/dto/RecapitulatifTourneeDTO.java
  US-007 : DTO Interface RecapitulatifTourneeDTO (réponse JSON POST /cloture).

- 2026-03-24T10:00Z @developpeur UPDATE → /src/backend/svc-tournee/src/main/java/com/docapost/tournee/interfaces/rest/TourneeController.java
  US-007 : ajout endpoint POST /api/tournees/{tourneeId}/cloture (200/404/409/401) + injection CloturerTourneeHandler.

- 2026-03-24T10:00Z @developpeur UPDATE → /src/backend/svc-tournee/src/test/java/com/docapost/tournee/domain/TourneeTest.java
  US-007 TDD : +4 tests cloturerTournee() (succès, event recap, invariant A_LIVRER, idempotence).

- 2026-03-24T10:00Z @developpeur CREATE → /src/backend/svc-tournee/src/test/java/com/docapost/tournee/application/CloturerTourneeHandlerTest.java
  US-007 TDD : 5 tests handler (clôture OK, sauvegarde, event publié, tournée introuvable, invariant).

- 2026-03-24T10:00Z @developpeur CREATE → /src/backend/svc-tournee/src/test/java/com/docapost/tournee/interfaces/CloturerTourneeControllerTest.java
  US-007 TDD : 4 tests controller (200/404/409/401). Total backend : 67/67 verts.

- 2026-03-24T10:00Z @developpeur UPDATE → /src/mobile/src/api/tourneeTypes.ts
  US-007 : ajout type RecapitulatifTourneeDTO.

- 2026-03-24T10:00Z @developpeur UPDATE → /src/mobile/src/api/tourneeApi.ts
  US-007 : fonction cloturerTournee() + ColisEncoreALivrerError.

- 2026-03-24T10:00Z @developpeur CREATE → /src/mobile/src/screens/RecapitulatifTourneeScreen.tsx
  US-007 : écran M-07 (compteurs livrés/échecs/à représenter, enquête satisfaction 1-5, bouton Terminer).

- 2026-03-24T10:00Z @developpeur UPDATE → /src/mobile/src/screens/ListeColisScreen.tsx
  US-007 : bouton Clôturer connecté → navigation RecapitulatifTourneeScreen, masqué si statut CLOTUREE.

- 2026-03-24T10:00Z @developpeur CREATE → /src/mobile/src/__tests__/RecapitulatifTourneeScreen.test.tsx
  US-007 TDD : 10 tests Jest écran M-07. Total Jest : 74/74 verts.

- 2026-03-24T10:00Z @developpeur CREATE → /livrables/06-dev/vertical-slices/US-007-impl.md
  Documentation vertical slice US-007 avec décisions, endpoints, commandes de tests manuels.

- 2026-03-24T10:00Z @developpeur UPDATE → /livrables/00-contexte/journaux/journal-developpeur.md
  US-007 → statut "Implémenté". US-006 → reporté (taille L). Décisions et interventions ajoutées.

- 2026-03-24T14:30Z @developpeur FIX → /src/mobile/src/screens/DetailColisScreen.tsx
  BUG-A : ajout testID="detail-colis-screen" sur la View racine de l'état succès (requis par QA Playwright).

- 2026-03-24T14:30Z @developpeur FIX → /src/mobile/src/screens/DeclarerEchecScreen.tsx
  BUG-B : ajout testID="declarer-echec-screen" sur la View racine (requis par QA Playwright).

- 2026-03-24T14:30Z @developpeur FIX → /src/backend/svc-tournee/src/main/java/com/docapost/tournee/domain/model/RecapitulatifTournee.java
  BUG-C : colisARepresenter filtre désormais statut=ECHEC && disposition=A_REPRESENTER. Ajout 2 tests unitaires.

- 2026-03-24T14:45Z @developpeur CREATE → /src/backend/svc-tournee/src/main/java/com/docapost/tournee/domain/preuves/
  US-008/009 : BC-02 Preuves de Livraison collocalisé. PreuveLivraison Aggregate + 4 factory methods + VOs SignatureNumerique, TiersIdentifie, DepotSecurise, PhotoPreuve. PreuveCapturee event.

- 2026-03-24T14:45Z @developpeur CREATE → /src/backend/svc-tournee/src/main/java/com/docapost/tournee/application/ConfirmerLivraisonHandler.java
  US-008 : application handler orchestrant la capture de preuve et la confirmation de livraison.

- 2026-03-24T14:45Z @developpeur UPDATE → /src/backend/svc-tournee/src/main/java/com/docapost/tournee/interfaces/rest/TourneeController.java
  US-008/009 : ajout endpoint POST /api/tournees/{tourneeId}/colis/{colisId}/livraison.

- 2026-03-24T14:45Z @developpeur CREATE → /src/mobile/src/screens/CapturePreuveScreen.tsx
  US-008/009 : écran M-04 avec pad signature MVP, options TIERS_IDENTIFIE, DEPOT_SECURISE, PHOTO.

- 2026-03-24T14:45Z @developpeur CREATE → /livrables/06-dev/vertical-slices/US-008-impl.md
  Documentation vertical slice US-008. 97/97 tests backend verts + 93/93 Jest verts.

- 2026-03-24T14:45Z @developpeur CREATE → /livrables/06-dev/vertical-slices/US-009-impl.md
  Documentation vertical slice US-009 (partagé avec US-008, preuves alternatives).

- 2026-03-24T15:00Z @developpeur COMMIT → feature/US-001
  Commit 08e670c : regroupement Sprint 1 — US-003 à US-009 + BUG-A/B/C. 104 fichiers, 97/97 backend + 93/93 Jest verts.

- 2026-03-24T16:00Z @developpeur CREATE → /src/backend/svc-supervision/src/main/java/com/docapost/supervision/domain/events/InstructionExecutee.java
  US-015 : nouveau domain event InstructionExecutee (transition ENVOYEE → EXECUTEE).

- 2026-03-24T16:00Z @developpeur UPDATE → /src/backend/svc-supervision/src/main/java/com/docapost/supervision/domain/model/Instruction.java
  US-015 : ajout Instruction.marquerExecutee(livreurId) + List<Object> evenements.

- 2026-03-24T16:00Z @developpeur UPDATE → /src/backend/svc-supervision/src/main/java/com/docapost/supervision/domain/repository/InstructionRepository.java
  US-015/016 : ajout findById, findByTourneeId, update, findEnAttenteParTournee.

- 2026-03-24T16:00Z @developpeur UPDATE → /src/backend/svc-supervision/src/main/java/com/docapost/supervision/infrastructure/persistence/InstructionJpaRepository.java, InstructionRepositoryImpl.java, InstructionEntity.java
  US-015 : findByTourneeIdOrderByHorodatageDesc, findByTourneeIdAndStatut, update(), setStatut(), toInstruction().

- 2026-03-24T16:00Z @developpeur CREATE → /src/backend/svc-supervision/src/main/java/com/docapost/supervision/application/MarquerInstructionExecuteeCommand.java, MarquerInstructionExecuteeHandler.java, InstructionNotFoundException.java, ConsulterInstructionsParTourneeQuery.java, ConsulterInstructionsParTourneeHandler.java, ConsulterInstructionsEnAttenteQuery.java, ConsulterInstructionsEnAttenteHandler.java
  US-015/016 : application layer — command, handlers, exception.

- 2026-03-24T16:00Z @developpeur CREATE → /src/backend/svc-supervision/src/main/java/com/docapost/supervision/interfaces/dto/InstructionDTO.java
  US-015 : DTO réponse pour les instructions (GET tournee + GET en-attente + PATCH executer).

- 2026-03-24T16:00Z @developpeur UPDATE → /src/backend/svc-supervision/src/main/java/com/docapost/supervision/interfaces/rest/InstructionController.java
  US-015/016 : 3 nouveaux endpoints (GET /tournee/{id}, PATCH /{id}/executer, GET /en-attente).

- 2026-03-24T16:00Z @developpeur UPDATE → /src/backend/svc-supervision/src/main/java/com/docapost/supervision/infrastructure/seeder/DevDataSeeder.java
  US-015 : ajout 2 instructions de test pour tournee-sup-001 (1 ENVOYEE, 1 EXECUTEE).

- 2026-03-24T16:00Z @developpeur UPDATE → /src/backend/svc-supervision/src/test/java/com/docapost/supervision/domain/InstructionTest.java, interfaces/InstructionControllerTest.java
  US-015 : +3 tests domaine marquerExecutee, +4 tests controller nouveaux endpoints.

- 2026-03-24T16:00Z @developpeur CREATE → /src/backend/svc-supervision/src/test/java/com/docapost/supervision/application/MarquerInstructionExecuteeHandlerTest.java, ConsulterInstructionsParTourneeHandlerTest.java
  US-015 : 3 + 2 tests handler (TDD).

- 2026-03-24T16:00Z @developpeur UPDATE → /src/web/supervision/src/pages/DetailTourneePage.tsx, __tests__/DetailTourneePage.test.tsx
  US-015 : onglet Instructions (badge orange, statuts En attente / Exécutée) + 3 nouveaux tests Jest.

- 2026-03-24T16:00Z @developpeur CREATE → /src/mobile/src/api/supervisionApi.ts
  US-015/016 : client API svc-supervision — getInstructionsEnAttente + marquerInstructionExecutee.

- 2026-03-24T16:00Z @developpeur UPDATE → /src/mobile/src/screens/DetailColisScreen.tsx
  US-015 : auto-marquer instruction ENVOYEE comme exécutée au chargement M-03 (transparent, silencieux).

- 2026-03-24T16:00Z @developpeur CREATE → /src/mobile/src/components/BandeauInstructionOverlay.tsx
  US-016 : composant M-06 — bandeau overlay orange, slide-down animation, auto-fermeture 10s, bouton VOIR.

- 2026-03-24T16:00Z @developpeur UPDATE → /src/mobile/src/screens/ListeColisScreen.tsx
  US-016 : polling toutes les 10s + affichage BandeauInstructionOverlay si nouvelle instruction détectée.

- 2026-03-24T16:00Z @developpeur CREATE → /src/mobile/src/__tests__/BandeauInstructionOverlay.test.tsx
  US-016 : 5 tests Jest (rendu, onVoir, onFermer, auto-fermeture timer, bouton VOIR).

- 2026-03-24T16:00Z @developpeur CREATE → /livrables/06-dev/vertical-slices/US-015-impl.md
  Documentation vertical slice US-015. 50 tests backend + 3 tests web Jest verts.

- 2026-03-24T16:00Z @developpeur CREATE → /livrables/06-dev/vertical-slices/US-016-impl.md
  Documentation vertical slice US-016. 5 tests Jest mobile verts. FCM déféré Sprint 3.

- 2026-03-24T19:30Z @developpeur CREATE → /src/backend/svc-supervision/src/main/java/com/docapost/supervision/domain/planification/
  BC-07 Planification Domain Layer : TourneePlanifiee Aggregate Root + ZoneTournee + ContrainteHoraire + Anomalie VOs + StatutAffectation + PlanificationInvariantException + 4 Domain Events + TourneePlanifieeRepository interface.

- 2026-03-24T19:30Z @developpeur CREATE → /src/backend/svc-supervision/src/main/java/com/docapost/supervision/application/planification/
  BC-07 Application Layer : ConsulterPlanDuJourHandler/Query + ConsulterDetailHandler + ValiderCompositionHandler + AffecterLivreurVehiculeHandler + LancerTourneeHandler + exceptions métier (LivreurDejaAffecte, VehiculeDejaAffecte, TourneePlanifieeNotFound).

- 2026-03-24T19:30Z @developpeur CREATE → /src/backend/svc-supervision/src/main/java/com/docapost/supervision/infrastructure/planification/
  BC-07 Infrastructure Layer : TourneePlanifieeEntity JPA + TourneePlanifieeJpaRepository + TourneePlanifieeMapper (JSON) + TourneePlanifieeRepositoryImpl (upsert).

- 2026-03-24T19:30Z @developpeur CREATE → /src/backend/svc-supervision/src/main/java/com/docapost/supervision/interfaces/planification/
  BC-07 Interface Layer : PlanificationController (7 endpoints) + DTOs (PlanDuJourDTO, TourneePlanifieeDTO, TourneePlanifieeDetailDTO, ZoneTourneeDTO, ContrainteHoraireDTO, AnomalieDTO, AffecterRequest, LancerToutesResponse).

- 2026-03-24T19:30Z @developpeur UPDATE → /src/backend/svc-supervision/src/main/java/com/docapost/supervision/infrastructure/seeder/DevDataSeeder.java
  Enrichissement DevDataSeeder BC-07 : 4 TourneePlanifiee seederées (T-201 NON_AFFECTEE, T-202 AFFECTEE, T-203 SURCHARGE, T-204 LANCEE).

- 2026-03-24T19:30Z @developpeur UPDATE → /src/backend/svc-supervision/src/main/java/com/docapost/supervision/interfaces/security/SecurityConfig.java
  Ajout routes /api/planification/** (SUPERVISEUR) + correction SecurityConfig pour routes LIVREUR (en-attente + executer).

- 2026-03-24T19:30Z @developpeur UPDATE → /src/backend/svc-supervision/src/main/java/com/docapost/supervision/application/EnvoyerInstructionHandler.java
  Correction BUG NPE : pattern collect-and-publish corrigé (save sans retour, clearEvenements sur l'objet domaine).

- 2026-03-24T19:30Z @developpeur CREATE → /src/backend/svc-supervision/src/test/java/com/docapost/supervision/domain/planification/TourneePlanifieeTest.java
  15 tests domaine BC-07 (TDD) : statut initial, VOs, verifierComposition, affecter, lancer, invariants.

- 2026-03-24T19:30Z @developpeur CREATE → /src/backend/svc-supervision/src/test/java/com/docapost/supervision/application/planification/
  11 tests Application Layer BC-07 (TDD) : ConsulterPlanDuJour (3), AffecterLivreurVehicule (4), LancerTournee (4).

- 2026-03-24T19:30Z @developpeur CREATE → /src/backend/svc-supervision/src/test/java/com/docapost/supervision/interfaces/planification/PlanificationControllerTest.java
  10 tests @WebMvcTest BC-07 : plan du jour, composition, affectation, lancement, lancement groupé, 403.

- 2026-03-24T19:30Z @developpeur CREATE → /src/web/supervision/src/pages/PreparationPage.tsx
  W-04 React : bandeau résumé, filtres statut, tableau tournées (badges colorés, anomalies, actions contextuelles).

- 2026-03-24T19:30Z @developpeur CREATE → /src/web/supervision/src/pages/DetailTourneePlanifieePage.tsx
  W-05 React : onglets Composition (zones/contraintes/anomalies) + Affectation (sélecteurs livreur/véhicule, boutons).

- 2026-03-24T19:30Z @developpeur CREATE → /src/web/supervision/src/__tests__/PreparationPage.test.tsx
  11 tests Jest W-04 (bandeau, badges statut, anomalie, actions, erreur réseau, lancement).

- 2026-03-24T19:30Z @developpeur CREATE → /src/web/supervision/src/__tests__/DetailTourneePlanifieePage.test.tsx
  14 tests Jest W-05 (composition, anomalies, validation, affectation, readonly LANCEE).

- 2026-03-24T19:30Z @developpeur CREATE → /livrables/06-dev/vertical-slices/US-021-impl.md
  Documentation vertical slice US-021. 83/83 tests backend verts + 25/25 tests Jest verts.

- 2026-03-24T19:30Z @developpeur CREATE → /livrables/06-dev/vertical-slices/US-022-impl.md
  Documentation vertical slice US-022. BC-07 composition vérification.

- 2026-03-24T19:30Z @developpeur CREATE → /livrables/06-dev/vertical-slices/US-023-impl.md
  Documentation vertical slice US-023. BC-07 affectation livreur+véhicule, invariants unicité.

- 2026-03-24T19:30Z @developpeur CREATE → /livrables/06-dev/vertical-slices/US-024-impl.md
  Documentation vertical slice US-024. BC-07 lancement tournée + TourneeLancee event BC inter.

- 2026-03-24T19:30Z @developpeur UPDATE → /livrables/00-contexte/journaux/journal-developpeur.md
  Mise à jour statuts US-021/022/023/024 → Implémenté. Nouvelles décisions BC-07 et bugfixes.

- 2026-03-24T19:45Z @developpeur CREATE → /livrables/06-dev/vertical-slices/US-015-impl.md
  Documentation vertical slice US-015 — suivi exécution instruction, endpoints GET/PATCH, onglet W-02.

- 2026-03-24T19:45Z @developpeur CREATE → /livrables/06-dev/vertical-slices/US-016-impl.md
  Documentation vertical slice US-016 — BandeauInstructionOverlay M-06 + polling 10s + déduplication.

- 2026-03-24T19:45Z @developpeur CREATE → /src/mobile/src/api/supervisionApi.ts
  US-015/016 : getInstructionsEnAttente + marquerInstructionExecutee (BC-04 port 8082, défensif).

- 2026-03-24T19:45Z @developpeur CREATE → /src/mobile/src/components/BandeauInstructionOverlay.tsx
  US-016 : bandeau slide-down M-06, auto-fermeture 10s, bouton VOIR → M-03, prop autoFermetureMs injectable.

- 2026-03-24T19:45Z @developpeur UPDATE → /src/mobile/src/screens/ListeColisScreen.tsx
  US-016 : polling 10s + instructionsVues Set (déduplication) + affichage BandeauInstructionOverlay.

- 2026-03-24T19:45Z @developpeur UPDATE → /src/mobile/src/screens/DetailColisScreen.tsx
  US-015 : auto-exécution silencieuse si instruction ENVOYEE trouvée pour ce colis (props injectables).

- 2026-03-24T19:45Z @developpeur UPDATE → /src/web/supervision/src/pages/DetailTourneePage.tsx
  US-015 : onglet Instructions — badge orange ENVOYEE, liste statuts, rechargement WS, Array.isArray guard.

- 2026-03-24T19:45Z @developpeur CREATE → /src/mobile/src/__tests__/BandeauInstructionOverlay.test.tsx
  5 tests Jest US-016 (rendu, onVoir, onFermer, auto-fermeture). 98/98 mobile tests verts.

- 2026-03-24T19:45Z @developpeur UPDATE → /src/web/supervision/src/__tests__/DetailTourneePage.test.tsx
  +3 tests Jest US-015 (onglet Instructions, badge, liste vide). 60/60 web tests verts.

- 2026-03-24T19:45Z @developpeur COMMIT → feat(US-015/US-016) 943297c
  Commit feature/US-001 : 83 backend + 98 mobile + 60 web = 241 tests verts.
- 2026-03-25T10:00Z @qa CREATE → src/mobile/e2e/US-008-capturer-signature.spec.ts, src/mobile/e2e/US-009-capturer-preuve-alternative.spec.ts, src/mobile/e2e/US-010-consulter-preuve-litige.spec.ts, src/mobile/e2e/US-006-mode-offline.spec.ts
  Specs Playwright BC-02 (preuves) et BC-01 offline — 4 fichiers créés.

- 2026-03-25T10:05Z @qa CREATE → src/mobile/e2e/US-016-notification-push.spec.ts, src/mobile/e2e/US-017-synchronisation-oms.spec.ts, src/mobile/e2e/US-018-historisation-immuable.spec.ts, src/mobile/e2e/US-019-authentification-sso-mobile.spec.ts
  Specs Playwright BC-04 (notification), BC-05 (OMS event store), BC-06 (SSO mobile) — 4 fichiers créés.

- 2026-03-25T10:10Z @qa CREATE → src/web/supervision/e2e/US-011 à US-015 + US-020 à US-024 (10 fichiers)
  Specs Playwright BC-03 (supervision) et BC-07 (planification) — 10 fichiers créés dans src/web/supervision/e2e/.

- 2026-03-25T10:15Z @qa CREATE → playwright.supervision.config.ts
  Configuration Playwright dédiée pour les tests web supervision (port 8082).

- 2026-03-25T10:30Z @qa EXEC → src/mobile/e2e/ (US-006, US-008 à US-010, US-016 à US-019)
  Exécution Playwright mobile — 40/43 PASS (3 echecs : TC-270 SplashScreen, TC-017-05 body vide, TC-018-01 eventId).

- 2026-03-25T10:45Z @qa EXEC → src/web/supervision/e2e/ (US-011 à US-015, US-020 à US-024)
  Exécution Playwright supervision — 37/45 PASS (8 echecs : bandeau structure, seeder date, lanceeLe, 400 vs 422).

- 2026-03-25T11:00Z @qa CREATE → livrables/07-tests/scenarios/US-006-rapport-playwright.md à US-024-rapport-playwright.md (18 fichiers)
  Rapports Playwright pour 18 US avec statuts PASS/FAIL, anomalies et recommandations.

- 2026-03-25T11:10Z @qa UPDATE → livrables/07-tests/scenarios/US-006 à US-024 -scenarios.md (18 fichiers)
  Mise à jour des statuts des scénarios : Passé / Echoué apres execution reelle Playwright.

- 2026-03-25T11:15Z @qa UPDATE → livrables/06-dev/poste-de-commande-tests.md
  Ajout check-lists tests manuels US-010 a US-024 avec statuts PASS/PARTIEL/FAIL.

- 2026-03-25T11:20Z @qa CREATE → livrables/07-tests/screenshots/US-006 a US-024/ (18 dossiers, 19 screenshots)
  Screenshots E2E Playwright pour tous les TC critiques des 18 US.

- 2026-03-25T11:25Z @qa UPDATE → livrables/00-contexte/journaux/journal-qa.md
  Mise a jour journal QA : suivi US-006 a US-024 avec resultats reels, decisions structurantes, anomalies detectees.

- 2026-04-02T10:30Z @qa CREATE → livrables/07-tests/scenarios/US-supervision-scenarios.md
  Rédaction des scénarios de tests campagne supervision : L1 (144 Java, 223 Jest), L2 (11 curl), L3 (3 Playwright). Couverture US-011/030/034/035/038/044.

- 2026-04-02T10:30Z @qa CREATE → livrables/07-tests/scenarios/US-supervision-rapport-test.md
  Rapport d'exécution campagne supervision. Bilan 379/381 tests (99.5%). 4 anomalies non bloquantes. Bloquants B3/B5 confirmés résolus.

- 2026-04-02T10:30Z @qa CREATE → src/web/supervision/e2e/US-supervision-campagne.spec.ts
  Spec Playwright L3 supervision : TC1 (tableau de bord bypass SSO), TC2 (placeholder US-038), TC3 (bouton ENVOYER). 2/3 PASS.

- 2026-04-02T10:30Z @qa UPDATE → livrables/00-contexte/journaux/journal-qa.md
  Mise à jour journal : interventions session 02/04, décisions 8-11, points d'attention OBS-SUP-001 à 004.

- 2026-04-02T14:00Z @ux UPDATE → livrables/02-ux/wireframes.md (v1.2 → v1.3)
  M-01 : card SSO rétractable avant connexion (US-043). M-02 : hint visuel swipe onboarding (US-045). M-04 : pad signature réel react-native-signature-canvas avec invariants légaux (US-046). M-07 NOUVEAU : écran "Mes consignes" avec statuts et horodatage réception (US-037, US-042). W-01 : compteur durée déconnexion WebSocket (US-044). Récapitulatif écrans MVP mis à jour (12 écrans).

- 2026-04-02T14:00Z @ux UPDATE → livrables/00-contexte/journaux/journal-ux.md
  Ajout intervention v1.3, 3 décisions structurantes (US-043, US-042, US-044), mise à jour points d'attention.

- 2026-04-03T10:00Z @developpeur IMPLEMENT → src/mobile/src/screens/CapturePreuveScreen.tsx, src/mobile/src/__mocks__/react-native-signature-canvas.tsx, src/mobile/package.json
  US-046 : remplacement TouchableOpacity simulé par react-native-signature-canvas réel. onOK→base64, clearSignature(). Mock SignatureCanvas créé. TDD : 13 tests. 365/365 suite mobile verts.

- 2026-04-03T10:01Z @developpeur CREATE → /livrables/06-dev/vertical-slices/US-046-impl.md
  Vertical slice US-046 : pad signature réel M-04 (bloquant légal résolu).

- 2026-04-03T10:30Z @developpeur IMPLEMENT → src/web/supervision/src/utils/exporterCSVBilan.ts, src/web/supervision/src/pages/TableauDeBordPage.tsx
  US-039 : export CSV bilan du jour W-01. Bouton btn-telecharger-bilan + genererCSVBilanTournees. TDD : 13 tests. 264/265 web.

- 2026-04-03T10:31Z @developpeur CREATE → /livrables/06-dev/vertical-slices/US-039-impl.md
  Vertical slice US-039 : export CSV bilan tournées du jour W-01.

- 2026-04-03T11:00Z @developpeur IMPLEMENT → src/web/supervision/src/utils/exporterCSV.ts
  US-040 : enrichissement CSV W-05 avec Destinataire et Statut (6 colonnes). Nouvelles fonctions construireColisCSVRowsEnrichis + serialiserEnCSVEnrichi. TDD : 15 tests. Rétrocompatibilité US-028 OK.

- 2026-04-03T11:01Z @developpeur CREATE → /livrables/06-dev/vertical-slices/US-040-impl.md
  Vertical slice US-040 : enrichissement CSV composition W-05.

- 2026-04-03T11:30Z @developpeur IMPLEMENT → src/web/supervision/src/utils/alerteSurcharge.ts, src/web/supervision/src/pages/PreparationPage.tsx
  US-041 : poids estimé + alerte surcharge W-04. calculerNiveauAlerte (AUCUNE/APPROCHE/CRITIQUE), seuil 95% cohérent US-030. TDD : 14 tests.

- 2026-04-03T11:31Z @developpeur CREATE → /livrables/06-dev/vertical-slices/US-041-impl.md
  Vertical slice US-041 : poids estimé et alerte surcharge W-04.

- 2026-04-03T11:32Z @developpeur UPDATE → /livrables/00-contexte/journaux/journal-developpeur.md
  Journal @developpeur : US-046, US-039, US-040, US-041 ajoutées au suivi. 4 décisions techniques documentées.

- 2026-04-03T12:00Z @developpeur CREATE → /home/admin/Botfactory/src/mobile/src/constants/devLivreurs.ts
  US-047 : constante DEV_LIVREURS avec les 4 comptes livreurs du seed supervision.

- 2026-04-03T12:00Z @developpeur CREATE → /home/admin/Botfactory/src/mobile/src/store/devAuthOptions.ts
  US-047 : options mock authStore (faux JWT base64, expiration 8h, closure mutable setDevLivreurId).

- 2026-04-03T12:00Z @developpeur UPDATE → /home/admin/Botfactory/src/mobile/src/screens/ConnexionScreen.tsx
  US-047 : 2 props optionnelles devLivreurs/onDevLivreurSelected + bloc picker dev-mode + styles fond jaune.

- 2026-04-03T12:00Z @developpeur UPDATE → /home/admin/Botfactory/src/mobile/App.tsx
  US-047 : réécriture complète — ConnexionScreen comme écran intro, authStore.subscribe, guard __DEV__.

- 2026-04-03T12:00Z @developpeur CREATE → /livrables/05-backlog/user-stories/US-047-connexion-dev-livreur-picker.md
  US-047 : User Story complète avec 5 scénarios Gherkin.

- 2026-04-03T12:00Z @developpeur CREATE → /livrables/06-dev/vertical-slices/US-047-impl.md
  US-047 : vertical slice — décisions implémentation, tests 365/365 verts.

- 2026-04-03T12:00Z @developpeur UPDATE → /livrables/00-contexte/journaux/journal-developpeur.md
  Journal @developpeur : US-047 ajoutée au suivi + décision technique closure devAuthOptions.

- 2026-04-03T14:00Z @po CREATE → /livrables/05-backlog/user-stories/US-048-sync-supervision-mobile.md
  US-048 : sync données tournée supervision ↔ app mobile livreur — DevEventBridge au démarrage, correction seeders, message "sans tournée", livreur-005 dans picker dev.

- 2026-04-03T14:00Z @po UPDATE → /livrables/00-contexte/journaux/journal-po.md
  Journal @po v1.5 : US-048 ajoutée au suivi, prochaine US libre US-049.

- 2026-04-05T10:00Z @qa CREATE → /livrables/07-tests/scenarios/US-034-scenarios.md
  US-034 : 7 scénarios TCs L1/L2/L3 — ReaffecterVehiculeHandler, GET /vehicules/compatibles, POST /reaffecter-vehicule.

- 2026-04-05T10:00Z @qa CREATE → /livrables/07-tests/scenarios/US-034-rapport-playwright.md
  US-034 : rapport d'exécution — Validée 24/24. Couverture L1 domaine + L2 API + L3 panneau UI.

- 2026-04-05T10:10Z @qa CREATE → /livrables/07-tests/scenarios/US-035-scenarios.md
  US-035 : 10 scénarios TCs L1/L2 — correspondRecherche OU logic, intersection filtre statut, no bouton-rechercher.

- 2026-04-05T10:10Z @qa CREATE → /livrables/07-tests/scenarios/US-035-rapport-playwright.md
  US-035 : rapport d'exécution — Validée 13/13.

- 2026-04-05T10:20Z @qa CREATE → /livrables/07-tests/scenarios/US-036-scenarios.md
  US-036 : 7 scénarios TCs L1 RNTL — AsyncStorage hasConnectedOnce, cardSsoOuverte, priorité logique.

- 2026-04-05T10:20Z @qa CREATE → /livrables/07-tests/scenarios/US-036-rapport-playwright.md
  US-036 : rapport d'exécution — Validée 16/16.

- 2026-04-05T10:30Z @qa CREATE → /livrables/07-tests/scenarios/US-037-scenarios.md
  US-037 : 13 scénarios TCs L1 — useConsignesLocales hook, MesConsignesScreen, idempotence, offline bandeau, clé consignes_jour_YYYY-MM-DD.

- 2026-04-05T10:30Z @qa CREATE → /livrables/07-tests/scenarios/US-037-rapport-playwright.md
  US-037 : rapport d'exécution — Validée 352/352.

- 2026-04-05T10:40Z @qa CREATE → /livrables/07-tests/scenarios/US-038-scenarios.md
  US-038 : 8 scénarios TCs L1 — 6 corrections libellés UX (Repassage, Traitée, Chargement trop lourd, Télécharger la liste, numéro de tournée).

- 2026-04-05T10:40Z @qa CREATE → /livrables/07-tests/scenarios/US-038-rapport-playwright.md
  US-038 : rapport d'exécution — Validée 329/329 mobile. Bug Babel/TS pré-existant documenté non bloquant.

- 2026-04-05T10:50Z @qa CREATE → /livrables/07-tests/scenarios/US-042-scenarios.md
  US-042 : 4 scénarios TCs L1 — HH:mm pour aujourd'hui, JJ/MM HH:mm pour autres jours, ordre chronologique inverse.

- 2026-04-05T10:50Z @qa CREATE → /livrables/07-tests/scenarios/US-042-rapport-playwright.md
  US-042 : rapport d'exécution — Validée 27/27.

- 2026-04-05T11:00Z @qa CREATE → /livrables/07-tests/scenarios/US-043-scenarios.md
  US-043 : 6 scénarios TCs L1 RNTL — pas d'écriture AsyncStorage en première session, état étendu restauré à réouverture (distinct US-036).

- 2026-04-05T11:00Z @qa CREATE → /livrables/07-tests/scenarios/US-043-rapport-playwright.md
  US-043 : rapport d'exécution — Validée 10/10.

- 2026-04-05T11:10Z @qa CREATE → /livrables/07-tests/scenarios/US-045-scenarios.md
  US-045 : 7 scénarios TCs L1 — SEUIL_HINT=3, fail-safe AsyncStorage, texte exact swipe hint.

- 2026-04-05T11:10Z @qa CREATE → /livrables/07-tests/scenarios/US-045-rapport-playwright.md
  US-045 : rapport d'exécution — Validée 17/17.

- 2026-04-05T11:20Z @qa CREATE → /livrables/07-tests/scenarios/US-047-scenarios.md
  US-047 : 5 scénarios TCs L1 RNTL — section-dev-mode, devLivreurs prop, faux JWT sub/roles, accessibilityLabel.

- 2026-04-05T11:20Z @qa CREATE → /livrables/07-tests/scenarios/US-047-rapport-playwright.md
  US-047 : rapport d'exécution — Validée 365/365 non-régression.

- 2026-04-05T11:30Z @qa CREATE → /livrables/07-tests/scenarios/US-048-scenarios.md
  US-048 : 5 scénarios TCs L1/L2 — DevEventBridge T-204→22 colis, idempotence, livreur-005 message vide, @Profile("dev").

- 2026-04-05T11:30Z @qa CREATE → /livrables/07-tests/scenarios/US-048-rapport-playwright.md
  US-048 : rapport d'exécution — Validée.

- 2026-04-05T11:40Z @qa CREATE → /livrables/07-tests/scenarios/US-049-scenarios.md
  US-049 : 6 scénarios TCs L1/L2 — 6 livreurs canoniques alignés mobile picker + svc-supervision + svc-tournee seeders.

- 2026-04-05T11:40Z @qa CREATE → /livrables/07-tests/scenarios/US-049-rapport-playwright.md
  US-049 : rapport d'exécution — Validée 795/795 (371+272+152).

- 2026-04-05T11:50Z @qa CREATE → /livrables/07-tests/scenarios/US-050-scenarios.md
  US-050 : 10 scénarios TCs L1/L2 — TourneePlanifiee.desaffecter() invariants domaine, DELETE /affectation endpoints, btn-desaffecter conditionnel.

- 2026-04-05T11:50Z @qa CREATE → /livrables/07-tests/scenarios/US-050-rapport-playwright.md
  US-050 : rapport d'exécution — Validée 152/152+272/272.

- 2026-04-05T12:00Z @qa CREATE → /livrables/07-tests/scenarios/US-055-scenarios.md
  US-055 : 5 scénarios TCs L1/L3 — AppNavigator 7 routes, non-régression, bouton retour Android R1 partiel/R2 déféré.

- 2026-04-05T12:00Z @qa CREATE → /livrables/07-tests/scenarios/US-055-rapport-playwright.md
  US-055 : rapport d'exécution — Partielle (R1 L1 ok, TC-055-05 Bloqué R2).

- 2026-04-05T12:10Z @qa CREATE → /livrables/07-tests/scenarios/US-056-scenarios.md
  US-056 : 7 scénarios TCs L1 — offlineQueue enqueue→persist, initialize idempotent, résistance corruption JSON, FIFO.

- 2026-04-05T12:10Z @qa CREATE → /livrables/07-tests/scenarios/US-056-rapport-playwright.md
  US-056 : rapport d'exécution — Validée 28/28.

- 2026-04-05T12:20Z @qa CREATE → /livrables/07-tests/scenarios/US-057-scenarios.md
  US-057 : 4 scénarios TCs L1 — SupervisionWebSocketConfig: /topic broker, /app prefix, /ws/supervision endpoint, SockJS origins.

- 2026-04-05T12:20Z @qa CREATE → /livrables/07-tests/scenarios/US-057-rapport-playwright.md
  US-057 : rapport d'exécution — Validée 165/165. L3 bloqué (WebSocket headless Playwright).

- 2026-04-05T12:30Z @qa CREATE → /livrables/07-tests/scenarios/US-058-scenarios.md
  US-058 : 8 scénarios TCs L1 — InternalSecretFilter 7 scénarios, CORS * en dev.

- 2026-04-05T12:30Z @qa CREATE → /livrables/07-tests/scenarios/US-058-rapport-playwright.md
  US-058 : rapport d'exécution — Validée 165/165.

- 2026-04-05T12:40Z @qa CREATE → /livrables/07-tests/scenarios/US-059-scenarios.md
  US-059 : 6 scénarios TCs L1 — MVP alternatif Spring Boot 5MB/10MB + syncExecutor double seuil (500Ko warn, 1Mo error), onPhotoTooLarge callback.

- 2026-04-05T12:40Z @qa CREATE → /livrables/07-tests/scenarios/US-059-rapport-playwright.md
  US-059 : rapport d'exécution — Validée MVP alternatif. OBS-AS-004 ouvert (pas de message UI sur 413).

- 2026-04-05T12:50Z @qa CREATE → /livrables/07-tests/scenarios/US-060-scenarios.md
  US-060 : 5 scénarios TCs L1 TDD — persist() après chaque dequeue, AsyncStorage vide après sync complète, sync partielle préserve commandes restantes, pas de double envoi.

- 2026-04-05T12:50Z @qa CREATE → /livrables/07-tests/scenarios/US-060-rapport-playwright.md
  US-060 : rapport d'exécution — Validée 60/60. OBS-AS-006 RÉSOLU (Bug P0 persist manquant).

- 2026-04-05T13:00Z @qa CREATE → /livrables/07-tests/scenarios/US-061-scenarios.md
  US-061 : 6 scénarios TCs L1 RNTL — SignatureCanvas remplace TouchableOpacity simulé, onOK/onEmpty callbacks, clearSignature ref, transmission base64.

- 2026-04-05T13:00Z @qa CREATE → /livrables/07-tests/scenarios/US-061-rapport-playwright.md
  US-061 : rapport d'exécution — Validée 33/33. Bug P0 légal résolu (react-native-signature-canvas branché).

- 2026-04-05T13:10Z @qa CREATE → /livrables/07-tests/scenarios/US-062-scenarios.md
  US-062 : 7 scénarios TCs L1 RNTL — pendingCount prop IndicateurSync, singulier/pluriel "envoi(s) en attente", testID sync-pending-count.

- 2026-04-05T13:10Z @qa CREATE → /livrables/07-tests/scenarios/US-062-rapport-playwright.md
  US-062 : rapport d'exécution — Validée 53/53. Terminologie terrain "envois en attente" respectée.

- 2026-04-05T13:20Z @qa UPDATE → /livrables/00-contexte/journaux/journal-qa.md
  Session 2026-04-05 : 20 interventions US-034 à US-062 ajoutées. Tableau suivi mis à jour (US-037, 047-062 Validées/Partielle). Archivage 2026-04-03 vers journal-qa-2026-04.md.

- 2026-04-05T14:00Z @developpeur UPDATE → /home/admin/Botfactory/src/web/supervision/src/pages/DetailTourneePlanifieePage.tsx
  US-064 : réécriture JSX Tailwind/tokens MD3. Suppression 7 variables de style statiques. 272/272 tests verts.

- 2026-04-05T14:00Z @developpeur CREATE → /livrables/06-dev/vertical-slices/US-064-impl.md
  US-064 : vertical slice — conformité design W-05 DetailTourneePlanifieePage.

- 2026-04-05T14:00Z @developpeur UPDATE → /livrables/00-contexte/journaux/journal-developpeur.md
  Ajout US-064 (Interventions + Décisions), archivage décisions 2026-04-04 vers journal-developpeur-2026-04.md.

- 2026-04-05T14:00Z @developpeur UPDATE → /livrables/00-contexte/journaux/archives/journal-developpeur-2026-04.md
  Archivage des décisions techniques US-055 à US-062 depuis le journal principal.

- 2026-04-06T10:00Z @po CREATE → /livrables/05-backlog/user-stories/US-065-correction-coherence-supervision-donnees.md
  US-065 : traçabilité backlog des 4 anomalies de cohérence supervision (codeTMS affiché, double affectation livreur, VueTournees fantômes, blocage UI avant 409). Corrections déjà appliquées en code. 7 critères Gherkin + règles de non-régression.

- 2026-04-06T10:00Z @po UPDATE → /livrables/00-contexte/journaux/journal-po.md
  Session 2026-04-06 : création US-065, prochaine US libre = US-066, compteur total 65 US. Décision structurante ajoutée.

- 2026-04-06T11:00Z @architecte-metier UPDATE → /livrables/03-architecture-metier/domain-model.md
  US-066 : ajout section BC-07 complète (TourneePlanifiee, PlanDuJour, Affectation, Vehicule, EtatJournalierLivreur, VueLivreur), 10 nouveaux termes Ubiquitous Language, règle de dérivation états livreurs, source de vérité BC-07 confirmée. v1.0→v1.2.

- 2026-04-06T11:00Z @architecte-metier UPDATE → /livrables/03-architecture-metier/capability-map.md
  US-066 : ajout capability 3.4 "État des livreurs du jour" avec 3 sous-capacités (3.4.1, 3.4.2, 3.4.3), mise à jour arbre des domaines. v1.0→v1.2.

- 2026-04-06T11:00Z @architecte-metier UPDATE → /livrables/00-contexte/journaux/journal-architecte-metier.md
  Session 2026-04-06 : validation modélisation US-066, 4 décisions structurantes ajoutées, points d'attention mis à jour.

- 2026-04-08T00:00Z @developpeur UPDATE → /livrables/00-contexte/infrastructure-locale.md
  Ajout section "Endpoints dev" : DELETE /dev/tms/reset, POST /dev/tms/full-reset, POST /internal/dev/reseed.

- 2026-04-08T00:00Z @developpeur UPDATE → /livrables/06-dev/vertical-slices/US-032-impl.md
  Mise à jour : TOURNEE_DEMARREE ajouté (Interface Layer svc-tournee + svc-supervision), colisTotal dans DTO, limites 2 et 5 marquées RÉSOLU.

- 2026-04-08T00:00Z @developpeur CREATE → /livrables/06-dev/vertical-slices/corrections-sync-cqrs-2026-04-08.md
  4 corrections sync CQRS : seeder idempotent, IDs alignés, TOURNEE_DEMARREE avec colisTotal, full-reset endpoint + bouton frontend.

- 2026-04-08T00:00Z @developpeur UPDATE → /livrables/00-contexte/journaux/journal-developpeur.md
  Ajout intervention Sync CQRS 2026-04-08 + 3 décisions techniques (eventId stable, suppression sup-xxx, reset auto-reseed).
