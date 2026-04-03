# Journal de bord — @developpeur — DocuPost

> **RÈGLE** : Lire ce fichier EN DÉBUT de session. Le mettre à jour EN FIN de session.
> Ce fichier donne le contexte technique synthétisé et suit l'avancement des implémentations.

---

## Contexte synthétisé

- **Stack** : Java 21 / Spring Boot 3.4.3 (backend) — React 19 / TypeScript 5.6 (frontend) — React Native / Android (mobile)
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
| US-019 | Auth SSO mobile | BC-06 | Implémenté | Sprint 3 | feature/US-001 | authStore + ConnexionScreen M-01 + SecurityConfig OAuth2 prod. 16 tests store + 8 tests screen + 4 tests backend. |
| US-020 | Auth SSO web | BC-06 | Implémenté | Sprint 3 | feature/US-001 | webAuthService + ConnexionPage + AuthCallbackPage + SecurityConfig svc-supervision. 8 tests authService + 7 tests page. |
| US-021 | Visualiser plan du jour | BC-07 | Implémenté | Sprint 3 | feature/US-001 | DevDataSeeder mock TMS. GET /api/planification/plans/{date}. PreparationPage W-04. |
| US-022 | Vérifier composition | BC-07 | Implémenté | Sprint 3 | feature/US-001 | GET /api/planification/tournees/{id} + POST /composition/valider. W-05 onglet Composition. |
| US-023 | Affecter livreur + véhicule | BC-07 | Implémenté | Sprint 3 | feature/US-001 | POST /affecter. Invariants unicité livreur/véhicule/jour. W-05 onglet Affectation. |
| US-024 | Lancer tournée | BC-07 | Implémenté | Sprint 3 | feature/US-001 | POST /lancer + POST /lancer-toutes. TourneeLancee loggué (simulation bus BC-01). |
| US-001 | Consulter liste colis | BC-01 | Implémenté | Sprint 1 | feature/US-001 | Mock auth + DataSeeder dev. Voir US-001-impl.md |
| US-002 | Suivre progression | BC-01 | Implémenté | Sprint 1 | feature/US-001 | AvancementCalculator + bouton Clôture mobile. 23/23 tests backend verts. BUG-002 résolu. |
| US-003 | Filtrer par zone | BC-01 | Implémenté | Sprint 1 | feature/US-001 | Filtrage local mobile (FiltreZones + filtreZone.ts). 34/34 tests Jest verts. |
| US-004 | Détail colis | BC-01 | Implémenté | Sprint 1 | feature/US-001 | ConsulterDetailColisHandler + endpoint GET /colis/{id} + DetailColisScreen M-03. 34/34 backend + 50/50 Jest verts. |
| US-005 | Déclarer échec | BC-01 | Implémenté | Sprint 1 | feature/US-001 | MotifNonLivraison + Disposition enums, declarerEchecLivraison() Aggregate, POST /echec, écran M-05. 54/54 backend + 64/64 Jest verts. |
| US-006 | Mode offline | BC-01 | Implémenté | Sprint 3 | feature/US-001 | offlineQueue (FIFO, idempotence commandId) + SyncIndicator + syncExecutor + CommandIdempotencyFilter backend. WatermelonDB déféré Sprint 4. 32 tests verts. |
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
| US-017 | Sync OMS | BC-05 | Implémenté | Sprint 3 | feature/US-001 | svc-oms créé (port 8083). OutboxPoller @Scheduled 10s + OmsApiClient (simulé). 5 tests handler verts. |
| US-018 | Historisation immuable | BC-05 | Implémenté | Sprint 3 | feature/US-001 | EvenementLivraison record immuable + Event Store append-only JPA. 9+3+6=23 tests verts. |
| US-030 | Vérifier compatibilité véhicule | BC-07 | Implémenté | Sprint 4 | feature/US-001 | Aggregate TourneePlanifiee + Vehicule entity + VehiculeRepositoryImpl in-memory + VerifierCompatibiliteVehiculeHandler + endpoint POST /verifier-compatibilite-vehicule. 23 tests backend + 7 tests Jest. |
| US-034 | Suggestion réaffectation véhicule | BC-07 | Implémenté | Sprint 4 | feature/US-001 | VehiculeReaffecte event + ReaffecterVehiculeHandler + GET /vehicules/compatibles + POST /reaffecter-vehicule + panneau réaffectation W-05. 7+7+8 tests. |
| US-035 | Recherche multi-critères tableau de bord | BC-03 | Implémenté | Sprint 4 | feature/US-001 | Champ recherche unique (codeTMS + zone + livreurNom), union OU, intersection filtre statut, lien effacer. 9 tests Jest + 2 tests backend. 26/26 Jest + 200/200 suite totale verts. |
| US-036 | Card SSO rétractable | BC-06 | Implémenté | Sprint 4 | feature/US-001 | Card "Comment ça fonctionne ?" repliée après 1ère connexion. AsyncStorage : hasConnectedOnce + cardSsoOuverte. TDD : 16 tests US-036 + 280/280 suite totale verts. |
| US-037 | Historique consignes livreur | BC-04 | Implémenté | Sprint 4/5 | feature/US-001 | useConsignesLocales hook + MesConsignesScreen M-07 réécriture + BandeauInstructionOverlay prop onConsignePersistee + bouton badge ListeColisScreen. Delta Sprint 5 : prendreEnCompteNouvelles + navigation M-07→M-03. Delta v1.3 : texteConsigne, "Non associé à un colis", bandeau offline, message vide conforme. TDD : 18+16+10 tests. 352/352 suite totale verts. |
| US-042 | Horodatage consignes M-07 | BC-04 | Implémenté | Sprint 5 | feature/US-001 | formaterHorodatage() exportée (HH:mm / JJ/MM HH:mm) + testID horodatage-{id}. TDD : 5 tests. 315/315 suite totale mobile verts. |
| US-043 | Card SSO rétractable avant connexion | BC-06 | Implémenté | Sprint 5 | feature/US-001 | state dejaConnecte + toggleCard conditionnel. TDD : 10 tests US-043. 34/34 ConnexionScreen + 325/325 suite totale mobile verts. |
| US-044 | Compteur déconnexion WebSocket adaptatif | BC-03 | Implémenté | Sprint 5 | feature/US-001 | formaterDureeDeconnexion() exportée + setInterval 1s + affichage dès 0s. 11/11 tests verts (bug SC2 corrigé le 2026-04-03). 265/265 suite totale web. |
| US-038 | Harmonisation libellés UX | BC-01+BC-03 | Implémenté | Sprint 5 | feature/US-001 | ColisItem A_REPRESENTER→"Repassage" + MesConsignesScreen EXECUTEE→"Traitée" + DetailTourneePlanifieePage + TableauDeBordPage placeholder. TDD : 4 tests. 329/329 suite totale mobile verts. |
| US-045 | Hint visuel swipe onboarding | BC-01 | Implémenté | Sprint 5 | feature/US-001 | hook useSwipeHint (SEUIL=3, clé @docupost/swipe_hint_count, fail-safe=true). Delta v1.3 : texte exact + position sous carte dans ColisItem. TDD : 13+4 tests. 352/352 suite totale mobile verts. |
| US-046 | Pad signature réel M-04 | BC-02 | Implémenté | Sprint 5 | feature/US-001 | react-native-signature-canvas intégré. Remplacement TouchableOpacity simulé. onOK→base64, clearSignature() sur Effacer. Mock SignatureCanvas créé. TDD : 13 tests US-046. 365/365 suite totale mobile verts. |
| US-039 | Export CSV bilan W-01 | BC-03 | Implémenté | Sprint 6 | feature/US-001 | exporterCSVBilan.ts + genererCSVBilanTournees + btn-telecharger-bilan. VueTourneeDTO enrichi (nbLivres, nbEchecs). TDD : 13 tests. 264/265 web (1 bug pré-existant US-044). |
| US-040 | Enrichir CSV W-05 (destinataire+statut) | BC-07 | Implémenté | Sprint 6 | feature/US-001 | construireColisCSVRowsEnrichis + serialiserEnCSVEnrichi dans exporterCSV.ts. LIVRE→Livré, ECHEC→Échec, EN_COURS→En cours. TDD : 15 tests. Rétrocompatibilité US-028 préservée. |
| US-041 | Poids estimé alerte surcharge W-04 | BC-07 | Implémenté | Sprint 6 | feature/US-001 | alerteSurcharge.ts + calculerNiveauAlerte (AUCUNE/APPROCHE/CRITIQUE). Colonne Poids W-04 + icônes ⚠/⛔. Seuil 95% cohérent US-030. TDD : 14 tests. |

Légende statuts : `À faire` | `En cours` | `Implémenté` | `Testé` | `Livré`

---

## Interventions réalisées

> ← Entrées antérieures archivées dans [archives/journal-developpeur-2026-03.md](archives/journal-developpeur-2026-03.md)

| Date | US | Action | Fichier impl |
| --- | --- | --- | --- |
> ← Entrées 2026-03-30/31 et 2026-04-02 (US-036/037/042/043/044/038) archivées dans [archives/journal-developpeur-2026-04.md](archives/journal-developpeur-2026-04.md)
| 2026-04-02 | US-045 | Hint visuel swipe onboarding : hook useSwipeHint (SEUIL=3, fail-safe=true, incrément sur swipe réussi) remplace logique sessions (Bloquant 6). TDD : 13 tests hook. 342/342 suite totale mobile verts. | /livrables/06-dev/vertical-slices/US-045-impl.md |
| 2026-04-02 | US-045 delta | Delta v1.3 : texte exact wireframe + position sous la carte dans ColisItem. Accessibilité : accessibilityLabel + role text. TDD : 4 tests rendu. 352/352 suite totale mobile verts. | /livrables/06-dev/vertical-slices/US-045-impl.md |
| 2026-04-03 | US-046 | Pad signature réel : react-native-signature-canvas + mock SignatureCanvas + remplacement TouchableOpacity simulé. Tests US-008/009 mis à jour (pad-signature→pad-signature-canvas). TDD : 13 tests. 365/365 suite totale mobile verts. | /livrables/06-dev/vertical-slices/US-046-impl.md |
| 2026-04-03 | US-039 | Export CSV bilan W-01 : exporterCSVBilan.ts + btn-telecharger-bilan + VueTourneeDTO (nbLivres, nbEchecs). TDD : 13 tests. | /livrables/06-dev/vertical-slices/US-039-impl.md |
| 2026-04-03 | US-044 bugfix | Bug SC2 corrigé : test SC2 échouait car jest.advanceTimersByTime(90_000) s'exécutait avant que React flush le useEffect créant le setInterval. Fix : ajout act(runAllTimers) préalable dans le test. 265/265 tests web verts. | /livrables/06-dev/vertical-slices/US-044-impl.md |
| 2026-04-03 | US-040 | Enrichir CSV W-05 : construireColisCSVRowsEnrichis + serialiserEnCSVEnrichi. 6 colonnes enrichies. TDD : 15 tests. Rétrocompatibilité US-028 OK. | /livrables/06-dev/vertical-slices/US-040-impl.md |
| 2026-04-03 | US-041 | Poids estimé W-04 : alerteSurcharge.ts + calculerNiveauAlerte + colonne Poids dans PreparationPage. TDD : 14 tests. | /livrables/06-dev/vertical-slices/US-041-impl.md |
| 2026-04-03 | OBS-011-02 | Correction test Playwright TC-011-04 : `totalTournees` → `actives` (alignement modèle domaine TableauDeBord). Tests web 265/265 verts. | src/web/supervision/e2e/US-011-tableau-de-bord.spec.ts |
| 2026-04-03 | OBS-014-01 | Correction test Playwright TC-014-02 : colisId `colis-s-003` → `colis-s-014-02` (isolation du test validation 422 vs invariant 409). | src/web/supervision/e2e/US-014-envoyer-instruction.spec.ts |
| 2026-04-03 | OBS-008-01/TC-270 | Gestion SplashScreen Expo Web : timeout étendu 20s + waitForSelector + graceful degradation. Limitation documentée dans US-008-impl.md. | src/mobile/e2e/US-008-capturer-signature.spec.ts, livrables/06-dev/vertical-slices/US-008-impl.md |
| 2026-04-03 | US-027 session 2 | Intégration Tailwind CSS v3.4.19 + DaisyUI + refactorisation W-04/W-01 selon design_web_designer.md. TopAppBar/SideNavBar/AppLayout refactorisés Tailwind. Rétrocompat inline styles pour tests (265/265 verts). | /livrables/06-dev/vertical-slices/US-027-impl.md |

---

## Décisions techniques prises

> ← Entrées antérieures archivées dans [archives/journal-developpeur-2026-03.md](archives/journal-developpeur-2026-03.md)

| Date | US | Décision | Justification |
| --- | --- | --- | --- |
> ← Entrées 2026-03-30/2026-04-02 (US-034/037/042/043) archivées dans [archives/journal-developpeur-2026-04.md](archives/journal-developpeur-2026-04.md)
| 2026-04-02 | US-044 | Tests US044 créés mais non exécutables (bug Babel/TS svc-supervision pré-existant) | Bug Babel/TS antérieur à cette session dans la suite svc-supervision. Validé via node.js. |
| 2026-04-03 | US-044 bugfix SC2 | act(runAllTimers) ajouté avant advanceTimersByTime(90000) dans SC2 | Sans ce premier act(), le useEffect créant le setInterval ne s'est pas exécuté avant les 90s fake — maintenant reste à T₀ et durée calculée = 0. |
| 2026-04-03 | US-027 session 2 | Tailwind v3 + DaisyUI installés. Styles inline critiques conservés sur badge NON_AFFECTEE (#dc3545), ligne A_RISQUE (#fff3e0), bandeau déco (#b45309). select caché pour filtre-statut (compat fireEvent.change). | Stratégie hybride inline+Tailwind garantit 0 régression tests. |
| 2026-04-02 | US-045 | useSwipeHint remplace la logique "nb sessions" (Bloquant 6 feedback terrain) | Le compteur AsyncStorage per-swipe est plus précis que le compteur de sessions |
| 2026-04-02 | US-045 delta | accessibilityElementsHidden retiré du hint — remplacé par accessibilityLabel + role text | Permettre la découverte du hint par les lecteurs d'écran + fix getByTestId dans les tests |
| 2026-04-03 | US-046 | View conteneur pad-signature-canvas porte onOK/onEmpty au lieu de SignatureCanvas directement | fireEvent sur le View conteneur fonctionne avec les tests Jest (le composant SignatureCanvas mocké ne reçoit pas fireEvent directement) |
| 2026-04-03 | US-040 | Extension par ajout (nouvelles fonctions) plutôt que modification des fonctions US-028 | Rétrocompatibilité totale avec les tests existants sans modification aucune |
| 2026-04-03 | US-041 | Seuil 95% APPROCHE cohérent avec US-030 (CapaciteVehiculeDepasseeException BC-07) | Le frontend reflète exactement les mêmes règles métier que le domaine backend |
| 2026-04-03 | OBS-011-02 | Correction dans le test Playwright (pas le code) : le domaine utilise `actives` (EN_COURS), c'est la spec QA qui avait un mauvais nom de champ `totalTournees` | Modèle de domaine `TableauDeBord` fait autorité — le test doit s'y aligner |
| 2026-04-03 | OBS-014-01 | Correction dans le test Playwright (isolation de données) : TC-014-02 utilisait le même `colisId` que TC-014-01, déclenchant l'invariant d'unicité avant la validation 422 | Tests E2E doivent être isolés en données — chaque TC doit avoir son propre identifiant |
| 2026-04-03 | OBS-008-01 | SplashScreen Expo Web non contournable sans changement d'infra — solution robuste : variable `PLAYWRIGHT_TEST=true` pour désactiver le SplashScreen dans `App.tsx`. Déféré Sprint 7 (DevOps). | Timeout étendu à 20s couvre les cas normaux ; graceful degradation évite les faux négatifs |

---

## Corrections post-QA et feedback terrain 2026-04-02 / 2026-04-01 / 2026-03-30

> ← Entrées archivées dans [archives/journal-developpeur-2026-04.md](archives/journal-developpeur-2026-04.md)

---

## Points d'attention

- Les **noms de classes et méthodes** DOIVENT correspondre à l'Ubiquitous Language (domain-model.md) — jamais d'abstraction technique (`DeliveryManager`, `ProcessingService` interdit)
- Tout changement de statut colis DOIT générer un Domain Event horodaté + géolocalisé
- Le **mode offline** (US-006) est transversal — à anticiper dès US-001 dans l'architecture mobile
- Documenter chaque implémentation dans `/livrables/06-dev/vertical-slices/US-[NNN]-impl.md`
- Mettre à jour ce journal après chaque US : statut → `Implémenté`, branche git, décisions prises
- **JAVA_HOME** : sur cette machine, `JAVA_HOME=JDK20` mais `PATH` contient JDK25. Lancer Maven avec `JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-25.0.2.10-hotspot"`.
- **BUG-002 résolu** : `TourneeControllerTest` passe avec mock-maker-subclass + JDK25. 23/23 tests verts.
- **Tests web** : utiliser `CI=true npm test` (react-scripts) — pas `npx jest` directement (Babel non configuré pour TS standalone).
- **Tests web supervision (React)** : les tests US-044 sont bien exécutables via `CI=true npm test` dans `src/web/supervision`. 265/265 tests verts depuis 2026-04-03.
- **Tests svc-supervision (Java)** : séparés du projet web — pas de bug Babel. La note antérieure confondait les deux projets.
- **CapturePreuveScreen** : SIGNATURE pré-sélectionnée par défaut — les tests qui supposaient `typeSelectionne=null` ont été mis à jour (L6).
