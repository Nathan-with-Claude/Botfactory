# CHANGELOG-ARCHIVES — DocuPost

> Historique complet des actions agents (avant 2026-03-29T19:00Z).
> Entrées actives (20 dernières) : /livrables/CHANGELOG-actions-agents.md

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

