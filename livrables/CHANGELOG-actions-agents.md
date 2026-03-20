# CHANGELOG des actions agents — DocuPost

> Format : [date ISO] [agent] [type d'action] → [fichier(s) impacté(s)]
> [résumé très court]

---

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
