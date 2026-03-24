# Journal de bord — @developpeur — DocuPost

> **RÈGLE** : Lire ce fichier EN DÉBUT de session. Le mettre à jour EN FIN de session.
> Ce fichier donne le contexte technique synthétisé et suit l'avancement des implémentations.

---

## Contexte synthétisé

- **Stack** : Java 21 / Spring Boot 4.0.3 (backend) — React 19 / TypeScript 5.6 (frontend) — React Native / Android (mobile)
- **Architecture** : DDD hexagonale, microservices, 1 service par Bounded Context
- **Pattern offline** : SQLite mobile + sync queue (app livreur uniquement)
- **Auth** : Spring Security + OAuth2 JWT (token validé à l'API Gateway)
- **Event bus** : Kafka (à confirmer) — Domain Events immuables
- **Fichiers d'archi à lire pour chaque US** :
  - BC concerné : `/livrables/03-architecture-metier/domain-model.md`
  - Endpoints + NFR : `/livrables/04-architecture-technique/architecture-applicative.md`
  - US specs : `/livrables/05-backlog/user-stories/US-[NNN]-*.md`
  - Wireframes : `/livrables/02-ux/wireframes.md`

### Ordre d'implémentation recommandé (dépendances)

```text
US-019/020 (SSO auth)
  → US-021/023/024 (planification — prérequis livreur)
    → US-001/002/003/004 (app livreur — consultation)
      → US-008/009 (preuves)
        → US-005/006/007 (échecs, offline, clôture)
          → US-011/012/013/014/015 (supervision)
            → US-016 (notifications push)
              → US-017/018 (OMS, historisation)
```

---

## Suivi des User Stories

| US | Titre court | BC | Statut | Sprint | Branche git | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| US-019 | Auth SSO mobile | BC-06 | À faire | — | — | Keycloak OAuth2 |
| US-020 | Auth SSO web | BC-06 | À faire | — | — | Keycloak OAuth2 |
| US-021 | Visualiser plan du jour | BC-07 | Implémenté | Sprint 3 | feature/US-001 | DevDataSeeder mock TMS. GET /api/planification/plans/{date}. PreparationPage W-04. |
| US-022 | Vérifier composition | BC-07 | Implémenté | Sprint 3 | feature/US-001 | GET /api/planification/tournees/{id} + POST /composition/valider. W-05 onglet Composition. |
| US-023 | Affecter livreur + véhicule | BC-07 | Implémenté | Sprint 3 | feature/US-001 | POST /affecter. Invariants unicité livreur/véhicule/jour. W-05 onglet Affectation. |
| US-024 | Lancer tournée | BC-07 | Implémenté | Sprint 3 | feature/US-001 | POST /lancer + POST /lancer-toutes. TourneeLancee loggué (simulation bus BC-01). |
| US-001 | Consulter liste colis | BC-01 | Implémenté | Sprint 1 | feature/US-001 | Mock auth + DataSeeder dev. Voir US-001-impl.md |
| US-002 | Suivre progression | BC-01 | Implémenté | Sprint 1 | feature/US-001 | AvancementCalculator + bouton Clôture mobile. 23/23 tests backend verts. BUG-002 résolu. |
| US-003 | Filtrer par zone | BC-01 | Implémenté | Sprint 1 | feature/US-001 | Filtrage local mobile (FiltreZones + filtreZone.ts). 34/34 tests Jest verts. |
| US-004 | Détail colis | BC-01 | Implémenté | Sprint 1 | feature/US-001 | ConsulterDetailColisHandler + endpoint GET /colis/{id} + DetailColisScreen M-03. 34/34 backend + 50/50 Jest verts. |
| US-005 | Déclarer échec | BC-01 | Implémenté | Sprint 1 | feature/US-001 | MotifNonLivraison + Disposition enums, declarerEchecLivraison() Aggregate, POST /echec, écran M-05. 54/54 backend + 64/64 Jest verts. |
| US-006 | Mode offline | BC-01 | À faire | — | — | SQLite + sync queue, taille L — reporté (dépend d'infra native WatermelonDB) |
| US-007 | Clôturer tournée | BC-01 | Implémenté | Sprint 1 | feature/US-001 | RecapitulatifTournee VO + TourneeCloturee event + CloturerTourneeHandler + POST /cloture + RecapitulatifTourneeScreen M-07. 67/67 backend + 74/74 Jest verts. |
| US-008 | Capturer signature | BC-02 | Implémenté | Sprint 1 | feature/US-001 | BC-02 collocalisé dans svc-tournee. PreuveLivraison Aggregate + 4 factory methods + LivraisonConfirmee event. 97/97 backend + 93/93 Jest verts. |
| US-009 | Capturer photo/tiers | BC-02 | Implémenté | Sprint 1 | feature/US-001 | Partagé avec US-008. TIERS_IDENTIFIE + DEPOT_SECURISE + PHOTO. Capture caméra native déférée (US-010). 93/93 Jest verts. |
| US-010 | Consulter preuve | BC-02 | Implémenté | Sprint 2 | feature/US-001 | PreuveController GET /api/preuves/livraison/{colisId}. 105/105 backend + 7/7 Jest verts. |
| US-011 | Tableau de bord | BC-03 | Implémenté | Sprint 2 | feature/US-001 | svc-supervision créé (port 8082). TableauDeBordPage + WebSocket. 8/8 backend + 14/14 Jest verts. |
| US-012 | Détail tournée superviseur | BC-03 | Implémenté | Sprint 2 | feature/US-001 | GET /api/supervision/tournees/{id}, DetailTourneePage W-02, onglets Colis/Incidents. Tests backend inclus. |
| US-013 | Alerte tournée à risque | BC-03 | Implémenté | Sprint 2 | feature/US-001 | RisqueDetector domain service + DetecterTourneesARisqueHandler + @Scheduled. Frontend : alerte sonore + point clignotant + surbrillance ligne. 11 tests backend + 4 tests Jest. |
| US-014 | Envoyer instruction | BC-03 | Implémenté | Sprint 2 | feature/US-001 | Instruction Aggregate + InstructionEnvoyee event + EnvoyerInstructionHandler + POST /api/supervision/instructions + PanneauInstructionPage W-03. 12 tests backend + 6 tests Jest. |
| US-015 | Suivre instruction | BC-03 | Implémenté | Sprint 2 | feature/US-001 | marquerExecutee() + 3 endpoints + onglet W-02 + auto-exec M-03. 50 tests backend + 3 web + 5 mobile verts. |
| US-016 | Notification push | BC-04 | Implémenté | Sprint 2 | feature/US-001 | Polling 10s + BandeauInstructionOverlay M-06 (FCM déféré Sprint 3). 5 tests Jest mobile verts. |
| US-017 | Sync OMS | BC-05 | À faire | — | — | < 30 sec, ACL |
| US-018 | Historisation immuable | BC-05 | À faire | — | — | Event store |

Légende statuts : `À faire` | `En cours` | `Implémenté` | `Testé` | `Livré`

---

## Interventions réalisées

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
| 2026-03-24 | US-007 | Implémentation clôture de tournée : RecapitulatifTournee (Value Object domain), TourneeCloturee (Domain Event), Tournee.cloturerTournee() (idempotent, invariant A_LIVRER), CloturerTourneeCommand + CloturerTourneeHandler + RecapitulatifTourneeResult (application), POST /api/tournees/{id}/cloture (200/404/409), RecapitulatifTourneeScreen M-07 (compteurs + satisfaction 1-5 + bouton Terminer), bouton Clôturer connecté dans ListeColisScreen. US-006 (offline, L) écartée — trop volumineuse. TDD : 13 tests backend + 10 tests Jest. 67/67 backend verts + 74/74 Jest verts. | /livrables/06-dev/vertical-slices/US-007-impl.md |
| 2026-03-24 | BUG-A | Correction testID manquant sur root View DetailColisScreen (état succes) — requis par QA Playwright | /src/mobile/src/screens/DetailColisScreen.tsx |
| 2026-03-24 | BUG-B | Correction testID manquant sur root View DeclarerEchecScreen — requis par QA Playwright | /src/mobile/src/screens/DeclarerEchecScreen.tsx |
| 2026-03-24 | BUG-C | Correction RecapitulatifTournee.calculer() : colisARepresenter filtre désormais statut=ECHEC+disposition=A_REPRESENTER (et non StatutColis.A_REPRESENTER jamais utilisé). Ajout 2 tests unitaires. | /src/backend/svc-tournee/src/main/java/com/docapost/tournee/domain/model/RecapitulatifTournee.java, TourneeTest.java |
| 2026-03-24 | US-008 | Implémentation signature numérique : BC-02 collocalisé (domain/preuves/), PreuveLivraison Aggregate immuable + 4 factory methods, ConfirmerLivraisonHandler, POST /livraison endpoint, CapturePreuveScreen M-04 (pad signature MVP). TDD : 12+8+8 tests backend + 19 tests Jest. 97/97 backend verts + 93/93 Jest verts. | /livrables/06-dev/vertical-slices/US-008-impl.md |
| 2026-03-24 | US-009 | Implémentation preuves alternatives (PHOTO, TIERS_IDENTIFIE, DEPOT_SECURISE) : VO TiersIdentifie + DepotSecurise + PhotoPreuve, factory methods, zones de capture dans CapturePreuveScreen. Capture caméra native déférée à US-010. Tests inclus dans les suites US-008. 93/93 Jest verts. | /livrables/06-dev/vertical-slices/US-009-impl.md |

---

## Décisions techniques prises

| Date | US | Décision | Justification |
| --- | --- | --- | --- |
| 2026-03-20 | US-001 | MockJwtAuthFilter (@Profile dev) injecte livreur-001/ROLE_LIVREUR | US-019 (SSO) non encore implémentée — TODO supprimer quand US-019 faite |
| 2026-03-20 | US-001 | DevDataSeeder (@Profile dev) crée la tournée de test avec 5 colis | BC-07 (Planification) non encore implémenté — TODO supprimer quand US-024 faite |
| 2026-03-20 | US-001 | Spring Boot 3.4.3 au lieu de 4.0.3 | Spring Boot 4.x non disponible en Q1 2026 — migrer dès disponibilité |
| 2026-03-20 | US-001 | H2 en mémoire (dev) + PostgreSQL (prod) dans application.yml | Pas de dépendance infra en développement local |
| 2026-03-20 | US-001 | Pattern collect-and-publish pour les Domain Events | Domaine pur sans dépendance Spring — Application Service orchestre la publication |
| 2026-03-20 | US-002 | AvancementCalculator créé en Domain Service (domain/service/) | Encapsule la logique de calcul d'avancement hors de l'Aggregate — séparation de responsabilité DDD |
| 2026-03-20 | US-002 | estimationFin = null dans le MVP | Cadence moyenne non disponible sans historique de livraison — fonctionnalité future US-XXX |
| 2026-03-20 | US-002 | BUG-002 : TourneeControllerTest non résolu (Spring ASM + Java 25) | Spring Boot 3.4.x + ASM 9.x incompatible avec .class Java 25 (format 69). Workaround partiel. Solution : JDK 21 ou Spring Boot 3.5+ |
| 2026-03-20 | BUG-002 | mock-maker-subclass (CGLIB proxy) dans mockito-extensions/ + JAVA_HOME JDK 25 pour Maven | Problème réel : JAVA_HOME=JDK20 / PATH=JDK25 — Maven forkait les tests avec JDK20 (class file 64.0 max) alors que les .class étaient compilés en JDK21 (65.0). Et Mockito inline-mock-maker ne peut pas transformer java.lang.Object sur Java 25. Solution : mock-maker-subclass évite toute instrumentation bytecode — compatible Java 25+. Lancer Maven avec JAVA_HOME=/c/Program Files/Eclipse Adoptium/jdk-25.0.2.10-hotspot. 23/23 tests verts. |
| 2026-03-23 | BUG-Playwright | DevDataSeeder : paramètre StatutColis ajouté à createColis() pour permettre des statuts variés | Le seeder passait StatutColis.A_LIVRER en dur — les tests Playwright attendaient LIVRE et ECHEC pour colis-004/005. |
| 2026-03-23 | BUG-Playwright | TourneeDTO : ajout champ estTerminee depuis Avancement.estTerminee() | Le champ était calculable mais non exposé dans le JSON — les tests Playwright le vérifiaient explicitement. |
| 2026-03-23 | BUG-Playwright | ListeColisScreen : testID="estimation-fin" toujours rendu, valeur "--" si null | Le rendu conditionnel empêchait Playwright de trouver l'élément quand estimationFin=null (MVP). |
| 2026-03-23 | US-003 | filtreZone.ts : fonctions pures dans domain/ — extraireZonesDisponibles + filtrerColisByZone | Logique métier (zone = attribut de l'Adresse VO) extraite hors composant pour testabilité et réutilisabilité |
| 2026-03-23 | US-003 | FlatList initialNumToRender=50 pour rendre tous les colis dans les tests Jest | FlatList virtualise par défaut (~10 items) — nécessaire pour les tests de filtrage avec 22 colis |
| 2026-03-23 | US-003 | Jest : exclusion du dossier e2e/ via testPathIgnorePatterns | Les specs Playwright dans e2e/ étaient ramassées par Jest et échouaient (fix collatéral) |
| 2026-03-23 | US-004 | Navigation interne ListeColisScreen sans React Navigation : état `NavigationColis` local | Stack technique actuel n'utilise pas React Navigation — cohérence avec l'archi existante. TODO : migrer vers React Navigation quand la stack navigation sera stabilisée (US-005+) |
| 2026-03-23 | US-004 | ColisDTO enrichi avec champ `estTraite` (côté backend) | US-004 requiert de savoir si le colis est terminal pour masquer les boutons — champ calculé depuis Colis.estTraite() transmis au frontend plutôt que recalculé côté client |
| 2026-03-23 | US-004 | Numéro de téléphone : transmis dans le DTO, masqué côté UI via `tel:` uniquement | Architecture RGPD : le backend transmet telephoneChiffre (nécessaire pour l'appel direct), le frontend ne l'affiche jamais en clair |
| 2026-03-24 | US-005 | HTTP 409 pour TourneeInvariantException (transition interdite) | 409 Conflict est plus sémantique que 400 pour un état incohérent côté domaine — cohérent avec les pratiques REST pour les conflits d'état métier |
| 2026-03-24 | US-005 | updateStatut() dans TourneeMapper étendu pour mettre à jour motif et disposition | La stratégie "find existing + update" dans le Repository nécessite une mise à jour explicite de chaque champ du colis — sans ça, motif et disposition ne seraient jamais persistés |
| 2026-03-24 | US-005 | Constructeur Colis étendu (8 params) pour reconstruction depuis persistance | Le mapper doit pouvoir reconstruire un Colis avec motif+disposition déjà renseignés (colis en ECHEC en base) — séparation construction initiale / reconstruction |
| 2026-03-24 | US-005 | Scénario offline (SC4) non implémenté dans ce vertical slice | SC4 (WatermelonDB + sync queue) dépend de US-006 (Mode offline) — TODO : implémenter quand US-006 sera traitée |
| 2026-03-24 | US-007 | RecapitulatifTourneeResult nommé avec suffixe "Result" (pas "Recap") | Collision de nom avec domain.model.RecapitulatifTournee — Java ne permet pas d'avoir le même nom simple dans application et domain dans le même contexte de compilation |
| 2026-03-24 | US-007 | US-006 (Mode offline) écartée de cette session | Taille L (8 points), nécessite WatermelonDB natif, sync queue, idempotence UUID v7 backend, store objet preuves — hors périmètre d'une seule session. Implémentation US-007 (S = 3 points) conforme à la note dans la mission |
| 2026-03-24 | US-007 | Scénario "clôture bloquée si sync offline en attente" non implémenté | Dépend de US-006 — invariant dans la spec mais non activé côté mobile (pas de sync queue existante) |
| 2026-03-24 | BUG-C | RecapitulatifTournee.calculer() filtrait sur StatutColis.A_REPRESENTER (enum jamais émis par declarerEchecLivraison) | Corriger pour filtrer statut=ECHEC && disposition=A_REPRESENTER. Fix + 2 nouveaux tests + fix test cloturerTournee_emet_event_avec_recap qui utilisait le mauvais statut. |
| 2026-03-24 | US-008/009 | BC-02 collocalisé dans svc-tournee (package domain/preuves/) pour le MVP | Coût de déploiement d'un second service non justifié au MVP. TODO : extraire vers svc-gestion-preuves quand BC-02 grandit. |
| 2026-03-24 | US-008/009 | Pad signature MVP = TouchableOpacity simulé + event onSignatureCapturee | react-native-signature-canvas non installé. Testable via fireEvent(pad, 'signatureCapturee', data). Intégration réelle déférée à US-010. |
| 2026-03-24 | US-008/009 | TourneeControllerTest / CloturerTourneeControllerTest / DetailColisControllerTest / EchecLivraisonControllerTest : ajout @MockBean ConfirmerLivraisonHandler | L'ajout de ConfirmerLivraisonHandler dans le constructeur TourneeController cassait toutes les suites @WebMvcTest existantes — le @MockBean est nécessaire pour que Spring crée le contexte. |
| 2026-03-24 | US-009 | Capture caméra native (expo-image-picker + upload S3) déférée à US-010 | expo-image-picker non encore provisionné. Le VO PhotoPreuve et la factory capturePhoto() sont prêts côté backend. |
| 2026-03-24 | US-013 | RisqueDetector : seuil d'inactivité configurable via `supervision.risque.seuil-inactivite-min` (default 30 min) dans application.yml — configurer à 5 min pour les tests manuels rapides | Seuil de 30 min trop long pour un test manuel. @Bean dans SupervisionConfig avec @Value. |
| 2026-03-24 | US-013 | scheduler initialDelay = 60s pour éviter l'évaluation du risque avant que DevDataSeeder soit terminé | Sans ce délai, les tournées seederées avec une derniereActivite ancienne seraient immédiatement passées A_RISQUE au démarrage. |
| 2026-03-24 | US-014 | FCM (notifications push livreur) déféré au Sprint 3 | FCM non provisionné. L'événement InstructionEnvoyee est collecté dans l'Aggregate mais clearEvenements() est appelé immédiatement (pattern collect-and-publish sans handler). TODO : KafkaProducer + micro-service notifications. |
| 2026-03-24 | US-021/024 | BC-07 Planification collocalisé dans svc-supervision (package domain/planification/) pour le MVP | Déploiement d'un 3e microservice non justifié au MVP. TODO : extraire vers svc-planification quand BC-07 grandit (Sprint 4+). |
| 2026-03-24 | US-021 | Zones, contraintes et anomalies sérialisées en JSON (colonne TEXT) dans TourneePlanifieeEntity | Évite une table de jointure complexe pour des listes immuables (importées depuis TMS). Acceptable pour le MVP. TODO : migrer vers @ElementCollection si filtrage sur zones devient nécessaire. |
| 2026-03-24 | US-024 | TourneeLancee loggué côté Controller (simulation bus Kafka) | Kafka non provisionné au MVP. Le log `[BC-07→BC-01]` permet de tracer l'événement. TODO Sprint 3 : KafkaProducer dans LancerTourneeHandler → svc-tournee consomme TourneeLancee → émet TourneeChargee. |
| 2026-03-24 | BUG-InstructionController | SecurityConfig globale prime sur @PreAuthorize — ajout de règles précises en amont de la règle catchall SUPERVISEUR | Spring Security évalue les règles dans l'ordre. La règle hasRole(SUPERVISEUR) sur /api/supervision/** bloquait les routes spécifiques LIVREUR. Fix : déplacer ces règles AVANT la catchall. |
| 2026-03-24 | BUG-EnvoyerInstruction | instructionRepository.save() retourne Instruction dans l'interface mais Mockito retourne null par défaut — NPE dans clearEvenements() | Pattern collect-and-publish corrigé : save() sans utiliser la valeur de retour, clearEvenements() sur l'objet original. |
| 2026-03-24 | US-015 | List<Object> pour les domain events de l'Aggregate Instruction | Instruction.getEvenements() retourne List<Object> (union InstructionEnvoyee | InstructionExecutee) — pas de sealed interface dans le MVP. Cast explicite dans les tests. |
| 2026-03-24 | US-015 | chargerInstructions() défensif avec Array.isArray guard | Les tests existants de DetailTourneePage utilisent un fetch mock qui retourne mockDetail (non-tableau) pour toutes les URLs. Le guard évite que l'état instructions soit corrompu. |
| 2026-03-24 | US-015 | Props injectables getInstructionsFn et marquerExecuteeFn dans DetailColisScreen | Permet de mocker les appels supervision dans les tests Jest sans modifier la logique de production. Pattern dependency injection via props. |
| 2026-03-24 | US-016 | Polling HTTP 10s au lieu de FCM | FCM non provisionné. Le polling depuis setInterval + getInstructionsEnAttente est une solution fonctionnelle pour le MVP. Déduplication via instructionsVues Set<string> pour éviter les doublons. TODO Sprint 3 : remplacer par Kafka Consumer → micro-service FCM. |
| 2026-03-24 | US-016 | supervisionApi.ts séparé du tourneeApi.ts | BC-04 (Notification) est un Bounded Context distinct de BC-01 (Tournée). URL de base différente (port 8082 vs 8081). Séparation maintenue même pour le MVP. |
| 2026-03-24 | US-016 | autoFermetureMs injectable dans BandeauInstructionOverlay | La prop permet de passer une durée courte (500ms) dans les tests Jest au lieu de 10 000ms, évitant l'usage de fake timers complexes. |
| 2026-03-24 | US-014 | HTTP 422 Unprocessable Entity pour REPROGRAMMER sans créneau cible | IllegalArgumentException du domaine → 422 (plus sémantique que 400 pour un invariant domaine sur un champ de validation métier). |
| 2026-03-24 | REPRISE | Vérification complète de l'état après interruption de session : tous les fichiers bien présents, 97/97 backend + 93/93 Jest verts confirmés. Commit 08e670c créé avec tous les fichiers non commités (Sprint 1 complet). | feature/US-001 |
| 2026-03-24 | US-010 | Implémentation consultation preuve litige : ConsulterPreuveLivraisonQuery/Handler + PreuveNotFoundException + PreuveController GET /api/preuves/livraison/{colisId} (403 LIVREUR, 404, 200 SUPERVISEUR/SUPPORT) + PreuveDetailDTO + SecurityConfig @EnableMethodSecurity + ConsulterPreuvePage.tsx supervision web. TDD : 8 tests backend + 7 tests Jest. 105/105 backend verts + 7/7 Jest verts. | /livrables/06-dev/vertical-slices/US-010-impl.md |
| 2026-03-24 | US-011 | Création svc-supervision (BC-03, port 8082) : VueTournee Read Model + TableauDeBord VO + VueTourneeRepository + ConsulterTableauDeBordHandler + VueTourneeEntity/JpaRepository/RepositoryImpl + SupervisionWebSocketConfig + SupervisionController GET /api/supervision/tableau-de-bord + TableauDeBordBroadcaster + MockJwtAuthFilter SUPERVISEUR + DevDataSeeder (3 tournées) + TableauDeBordPage.tsx (W-01, bandeau, filtre, WebSocket). TDD : 8 tests backend + 7 tests Jest. 8/8 backend + 14/14 Jest verts. | /livrables/06-dev/vertical-slices/US-011-impl.md |
| 2026-03-24 | US-012 | Implémentation détail tournée superviseur : VueColis + IncidentVue + VueTourneeDetail Read Models + ConsulterDetailTourneeHandler + VueTourneeDetailRepository + VueColisEntity/JpaRepository + IncidentVueEntity/JpaRepository + VueTourneeDetailRepositoryImpl + GET /api/supervision/tournees/{id} (200/404) + DTOs VueTourneeDetailDTO + DetailTourneePage.tsx (W-02, onglets Colis/Incidents, bouton Instructionner conditionnel, WebSocket refresh). DevDataSeeder enrichi (colis + incidents). TDD : 3 tests handler + 2 tests controller. Tests frontend : 6 tests Jest. | /livrables/06-dev/vertical-slices/US-012-impl.md |
| 2026-03-24 | US-013 | Implémentation détection alerte tournée à risque : TourneeARisqueDetectee domain event + RisqueDetector domain service (POJO, seuil configurable via application.yml) + DetecterTourneesARisqueHandler (EN_COURS→A_RISQUE, A_RISQUE→EN_COURS, broadcast 1× si changement) + SupervisionConfig @Bean + RisqueDetectorScheduler @Scheduled(60s). Frontend : jouerAlerteAudio() + prop alerteFn injectable + useRef alerte 1× + BandeauResume point clignotant + LigneTournee surbrillance orange. TDD : 6 tests RisqueDetector + 5 tests handler + 4 tests Jest. | /livrables/06-dev/vertical-slices/US-013-impl.md |
| 2026-03-24 | US-014 | Implémentation envoi instruction superviseur : TypeInstruction enum + StatutInstruction enum + InstructionEnvoyee domain event + Instruction Aggregate Root (factory envoyer(), reconstruire(), collect-and-publish) + InstructionRepository port + EnvoyerInstructionCommand + InstructionDejaEnAttenteException + EnvoyerInstructionHandler + InstructionEntity/JpaRepository/RepositoryImpl + InstructionController POST /api/supervision/instructions (201/409/422/403) + DTOs + PanneauInstructionPage.tsx W-03 (radio type, créneau conditionnel, bouton désactivé si REPROGRAMMER sans créneau, toast succès, erreur 409). TDD : 5 tests domaine + 3 tests handler + 4 tests controller + 6 tests Jest. Note : FCM déféré Sprint 3. | /livrables/06-dev/vertical-slices/US-014-impl.md |
| 2026-03-24 | US-015 | Implémentation suivi exécution instruction : InstructionExecutee domain event + Instruction.marquerExecutee() (ENVOYEE→EXECUTEE) + InstructionRepository étendu (findById, findByTourneeId, update, findEnAttenteParTournee) + MarquerInstructionExecuteeHandler + ConsulterInstructionsParTourneeHandler + ConsulterInstructionsEnAttenteHandler + 3 nouveaux endpoints (GET /tournee/{id}, PATCH /{id}/executer, GET /en-attente) + InstructionDTO + DevDataSeeder mis à jour + onglet "Instructions" dans DetailTourneePage W-02 (badge orange, statuts) + supervisionApi.ts mobile + auto-exec silencieuse depuis DetailColisScreen M-03. TDD : 8 tests domaine + 5 tests handler + 4 tests controller + 3 tests Jest web. 50 tests backend + 8 tests Jest web verts. | /livrables/06-dev/vertical-slices/US-015-impl.md |
| 2026-03-24 | US-016 | Implémentation notification instruction livreur (MVP polling) : BandeauInstructionOverlay.tsx M-06 (animation slide-down, auto-fermeture 10s, bouton VOIR) + polling toutes les 10s dans ListeColisScreen + déduplication instructionsVues Set + supervisionApi.ts (getInstructionsEnAttente + marquerInstructionExecutee, port 8082). FCM Android déféré Sprint 3. TDD : 5 tests Jest mobile. | /livrables/06-dev/vertical-slices/US-016-impl.md |
| 2026-03-24 | US-021 | Implémentation BC-07 Planification dans svc-supervision : TourneePlanifiee Aggregate Root + ZoneTournee + ContrainteHoraire + Anomalie VOs + StatutAffectation enum + TourneePlanifieeRepository interface + TourneePlanifieeEntity JPA + mapper JSON (zones/contraintes/anomalies sérialisées) + ConsulterPlanDuJourHandler + GET /api/planification/plans/{date} + PlanDuJourDTO + PreparationPage W-04 React. DevDataSeeder enrichi (4 tournées T-201/202/203/204). 83/83 backend verts + 11 Jest verts. | /livrables/06-dev/vertical-slices/US-021-impl.md |
| 2026-03-24 | US-022 | Implémentation vérification composition : TourneePlanifiee.verifierComposition() + CompositionVerifiee event + ConsulterDetailTourneePlanifieeHandler + ValiderCompositionHandler + GET /tournees/{id} + POST /tournees/{id}/composition/valider + TourneePlanifieeDetailDTO (zones+contraintes+anomalies) + DetailTourneePlanifieePage W-05 onglet Composition. 6 tests Jest. | /livrables/06-dev/vertical-slices/US-022-impl.md |
| 2026-03-24 | US-023 | Implémentation affectation livreur+véhicule : TourneePlanifiee.affecter() + AffectationEnregistree event + AffecterLivreurVehiculeHandler (invariants unicité livreur/véhicule/jour) + LivreurDejaAffecteException + VehiculeDejaAffecteException + POST /tournees/{id}/affecter (200/404/409) + AffecterRequest DTO + W-05 onglet Affectation (sélecteurs, boutons désactivés). 4 tests handler + 5 tests Jest. | /livrables/06-dev/vertical-slices/US-023-impl.md |
| 2026-03-24 | US-024 | Implémentation lancement tournée : TourneePlanifiee.lancer() + TourneeLancee event (inter-BC) + LancerTourneeHandler (individuel + groupé) + POST /tournees/{id}/lancer + POST /plans/{date}/lancer-toutes + LancerToutesResponse + bouton Lancer W-04 + bouton VALIDER ET LANCER W-05. TourneeLancee loggué MVP (bus Kafka Sprint 3). 4 tests handler + 3 tests controller + 2 tests Jest. | /livrables/06-dev/vertical-slices/US-024-impl.md |
| 2026-03-24 | BUG-InstructionController | Correction 3 tests InstructionControllerTest rouge : routes /en-attente et /{id}/executer accessibles LIVREUR bloquées par SecurityConfig globale (hasRole SUPERVISEUR prime sur @PreAuthorize). Ajout de règles précises pour ces 2 routes LIVREUR|SUPERVISEUR dans SecurityConfig. | /src/backend/svc-supervision/src/main/java/com/docapost/supervision/interfaces/security/SecurityConfig.java |
| 2026-03-24 | BUG-EnvoyerInstruction | Correction NPE dans EnvoyerInstructionHandler : instructionRepository.save() retournait null (Mockito), sauvegardee.clearEvenements() causait NPE. Pattern collect-and-publish corrigé : save(instruction) sans retour + instruction.clearEvenements(). | /src/backend/svc-supervision/src/main/java/com/docapost/supervision/application/EnvoyerInstructionHandler.java |

---

## Points d'attention

- Les **noms de classes et méthodes** DOIVENT correspondre à l'Ubiquitous Language (domain-model.md) — jamais d'abstraction technique (`DeliveryManager`, `ProcessingService` interdit)
- Tout changement de statut colis DOIT générer un Domain Event horodaté + géolocalisé
- Le **mode offline** (US-006) est transversal — à anticiper dès US-001 dans l'architecture mobile
- Documenter chaque implémentation dans `/livrables/06-dev/vertical-slices/US-[NNN]-impl.md`
- Mettre à jour ce journal après chaque US : statut → `Implémenté`, branche git, décisions prises
- **JAVA_HOME** : sur cette machine, `JAVA_HOME=JDK20` mais `PATH` contient JDK25. Lancer Maven avec `JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-25.0.2.10-hotspot"` pour que les tests s'exécutent avec le bon JDK.
- **BUG-002 résolu** : `TourneeControllerTest` passe avec mock-maker-subclass + JDK25. 23/23 tests verts.
