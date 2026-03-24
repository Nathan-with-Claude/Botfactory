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
| US-021 | Visualiser plan du jour | BC-07 | À faire | — | — | Dépend de l'API TMS (H6) |
| US-022 | Vérifier composition | BC-07 | À faire | — | — | Should Have |
| US-023 | Affecter livreur + véhicule | BC-07 | À faire | — | — | Invariant : 1 livreur/tournée/jour |
| US-024 | Lancer tournée | BC-07 | À faire | — | — | Event TournéeLancée → BC-01 |
| US-001 | Consulter liste colis | BC-01 | Implémenté | Sprint 1 | feature/US-001 | Mock auth + DataSeeder dev. Voir US-001-impl.md |
| US-002 | Suivre progression | BC-01 | Implémenté | Sprint 1 | feature/US-001 | AvancementCalculator + bouton Clôture mobile. 23/23 tests backend verts. BUG-002 résolu. |
| US-003 | Filtrer par zone | BC-01 | Implémenté | Sprint 1 | feature/US-001 | Filtrage local mobile (FiltreZones + filtreZone.ts). 34/34 tests Jest verts. |
| US-004 | Détail colis | BC-01 | Implémenté | Sprint 1 | feature/US-001 | ConsulterDetailColisHandler + endpoint GET /colis/{id} + DetailColisScreen M-03. 34/34 backend + 50/50 Jest verts. |
| US-005 | Déclarer échec | BC-01 | Implémenté | Sprint 1 | feature/US-001 | MotifNonLivraison + Disposition enums, declarerEchecLivraison() Aggregate, POST /echec, écran M-05. 54/54 backend + 64/64 Jest verts. |
| US-006 | Mode offline | BC-01 | À faire | — | — | SQLite + sync queue, taille L — reporté (dépend d'infra native WatermelonDB) |
| US-007 | Clôturer tournée | BC-01 | Implémenté | Sprint 1 | feature/US-001 | RecapitulatifTournee VO + TourneeCloturee event + CloturerTourneeHandler + POST /cloture + RecapitulatifTourneeScreen M-07. 67/67 backend + 74/74 Jest verts. |
| US-008 | Capturer signature | BC-02 | À faire | — | — | Écran M-04 |
| US-009 | Capturer photo/tiers | BC-02 | À faire | — | — | Écran M-05 |
| US-010 | Consulter preuve | BC-02 | À faire | — | — | Should Have |
| US-011 | Tableau de bord | BC-03 | À faire | — | — | Écran W-01 |
| US-012 | Détail tournée superviseur | BC-03 | À faire | — | — | Écran W-02 |
| US-013 | Alerte tournée à risque | BC-03 | À faire | — | — | < 15 min |
| US-014 | Envoyer instruction | BC-03 | À faire | — | — | Écran W-03 |
| US-015 | Suivre instruction | BC-03 | À faire | — | — | |
| US-016 | Notification push | BC-04 | À faire | — | — | FCM |
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

---

## Points d'attention

- Les **noms de classes et méthodes** DOIVENT correspondre à l'Ubiquitous Language (domain-model.md) — jamais d'abstraction technique (`DeliveryManager`, `ProcessingService` interdit)
- Tout changement de statut colis DOIT générer un Domain Event horodaté + géolocalisé
- Le **mode offline** (US-006) est transversal — à anticiper dès US-001 dans l'architecture mobile
- Documenter chaque implémentation dans `/livrables/06-dev/vertical-slices/US-[NNN]-impl.md`
- Mettre à jour ce journal après chaque US : statut → `Implémenté`, branche git, décisions prises
- **JAVA_HOME** : sur cette machine, `JAVA_HOME=JDK20` mais `PATH` contient JDK25. Lancer Maven avec `JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-25.0.2.10-hotspot"` pour que les tests s'exécutent avec le bon JDK.
- **BUG-002 résolu** : `TourneeControllerTest` passe avec mock-maker-subclass + JDK25. 23/23 tests verts.
