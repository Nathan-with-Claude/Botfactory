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
| US-044 | Compteur déconnexion WebSocket adaptatif | BC-03 | Implémenté | Sprint 5 | feature/US-001 | formaterDureeDeconnexion() exportée + setInterval 1s + affichage dès 0s. Tests créés mais non exécutables (bug Babel/TS pré-existant svc-supervision). 7/7 cas validés via node.js. |
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
| 2026-03-31 | US-036 | Card SSO rétractable : ConnexionScreen M-01 étendu (card "Comment ça fonctionne ?", toggle chevron, état cardOuverte). AsyncStorage : hasConnectedOnce + cardSsoOuverte. moduleNameMapper Jest. TDD : 16 tests verts. 280/280 suite mobile totale verts. | /livrables/06-dev/vertical-slices/US-036-impl.md |
| 2026-03-30 | US-037 | Historique consignes livreur : useConsignesLocales hook + MesConsignesScreen M-07 réécriture stateless + BandeauInstructionOverlay prop onConsignePersistee + bouton badge "Consignes" dans ListeColisScreen. TDD : 11+12 tests. 303/303 suite totale. | /livrables/06-dev/vertical-slices/US-037-impl.md |
| 2026-03-30 | US-037 delta | Points déférés Sprint 5 résolus : prendreEnCompteNouvelles() + navigation M-07→M-03. TDD : +7 tests. 310/310 suite totale verts. | /livrables/06-dev/vertical-slices/US-037-impl.md |
| 2026-04-02 | US-042 | Horodatage adaptatif M-07 : formaterHorodatage(iso, maintenant) exportée + testID horodatage-{id}. TDD : 5 nouveaux tests FH1→FH5. 315/315 suite totale mobile verts. | /livrables/06-dev/vertical-slices/US-042-impl.md |
| 2026-04-02 | US-043 | Card SSO rétractable avant connexion : state dejaConnecte + toggleCard conditionnel. Test US-036-SC5 mis à jour. TDD : 10 tests. 325/325 suite totale mobile verts. | /livrables/06-dev/vertical-slices/US-043-impl.md |
| 2026-04-02 | US-044 | Compteur déconnexion WebSocket adaptatif : formaterDureeDeconnexion(ms) + setInterval 1s + affichage dès 0s. Tests créés, non exécutables (bug Babel/TS svc-supervision pré-existant). 7/7 cas validés via node.js. | /livrables/06-dev/vertical-slices/US-044-impl.md |
| 2026-04-02 | US-038 | Harmonisation libellés UX : ColisItem + MesConsignesScreen + DetailTourneePlanifieePage + TableauDeBordPage. TDD : 4 tests. 329/329 suite totale mobile verts. | /livrables/06-dev/vertical-slices/US-038-impl.md |
| 2026-04-02 | US-045 | Hint visuel swipe onboarding : hook useSwipeHint (SEUIL=3, fail-safe=true, incrément sur swipe réussi) remplace logique sessions (Bloquant 6). TDD : 13 tests hook. 342/342 suite totale mobile verts. | /livrables/06-dev/vertical-slices/US-045-impl.md |
| 2026-04-02 | US-045 delta | Delta v1.3 : texte exact wireframe + position sous la carte dans ColisItem. Accessibilité : accessibilityLabel + role text. TDD : 4 tests rendu. 352/352 suite totale mobile verts. | /livrables/06-dev/vertical-slices/US-045-impl.md |
| 2026-04-03 | US-046 | Pad signature réel : react-native-signature-canvas + mock SignatureCanvas + remplacement TouchableOpacity simulé. Tests US-008/009 mis à jour (pad-signature→pad-signature-canvas). TDD : 13 tests. 365/365 suite totale mobile verts. | /livrables/06-dev/vertical-slices/US-046-impl.md |
| 2026-04-03 | US-039 | Export CSV bilan W-01 : exporterCSVBilan.ts + btn-telecharger-bilan + VueTourneeDTO (nbLivres, nbEchecs). TDD : 13 tests. | /livrables/06-dev/vertical-slices/US-039-impl.md |
| 2026-04-03 | US-040 | Enrichir CSV W-05 : construireColisCSVRowsEnrichis + serialiserEnCSVEnrichi. 6 colonnes enrichies. TDD : 15 tests. Rétrocompatibilité US-028 OK. | /livrables/06-dev/vertical-slices/US-040-impl.md |
| 2026-04-03 | US-041 | Poids estimé W-04 : alerteSurcharge.ts + calculerNiveauAlerte + colonne Poids dans PreparationPage. TDD : 14 tests. | /livrables/06-dev/vertical-slices/US-041-impl.md |

---

## Décisions techniques prises

> ← Entrées antérieures archivées dans [archives/journal-developpeur-2026-03.md](archives/journal-developpeur-2026-03.md)

| Date | US | Décision | Justification |
| --- | --- | --- | --- |
| 2026-03-30 | US-034 | Aucune modification de l'Aggregate TourneePlanifiee pour la réaffectation | L'Aggregate existant verifierCompatibiliteVehicule() (US-030) couvre déjà la logique |
| 2026-03-30 | US-037 | MesConsignesScreen stateless — logique dans useConsignesLocales | Séparation claire Infrastructure (hook/AsyncStorage) vs Interface (composant React Native) |
| 2026-03-30 | US-037 | InstructionPriseEnCompte backend déféré Sprint 5 | Endpoint PATCH /instructions/{id}/prise-en-compte non encore spécifié côté BC-03 |
| 2026-04-02 | US-042 | Test FH2 ajusté pour éviter ambiguïté de fuseau (09:00 UTC) | formaterHorodatage dépend du fuseau local — heure choisie neutre |
| 2026-04-02 | US-043 | setItem cardSsoOuverte uniquement si dejaConnecte=true | Avant 1ère connexion, le toggle ne doit pas persister l'état dans AsyncStorage |
| 2026-04-02 | US-044 | Tests US044 créés mais non exécutables (bug Babel/TS svc-supervision pré-existant) | Bug Babel/TS antérieur à cette session dans la suite svc-supervision. Validé via node.js. |
| 2026-04-02 | US-045 | useSwipeHint remplace la logique "nb sessions" (Bloquant 6 feedback terrain) | Le compteur AsyncStorage per-swipe est plus précis que le compteur de sessions |
| 2026-04-02 | US-045 delta | accessibilityElementsHidden retiré du hint — remplacé par accessibilityLabel + role text | Permettre la découverte du hint par les lecteurs d'écran + fix getByTestId dans les tests |
| 2026-04-03 | US-046 | View conteneur pad-signature-canvas porte onOK/onEmpty au lieu de SignatureCanvas directement | fireEvent sur le View conteneur fonctionne avec les tests Jest (le composant SignatureCanvas mocké ne reçoit pas fireEvent directement) |
| 2026-04-03 | US-040 | Extension par ajout (nouvelles fonctions) plutôt que modification des fonctions US-028 | Rétrocompatibilité totale avec les tests existants sans modification aucune |
| 2026-04-03 | US-041 | Seuil 95% APPROCHE cohérent avec US-030 (CapaciteVehiculeDepasseeException BC-07) | Le frontend reflète exactement les mêmes règles métier que le domaine backend |

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
- **Tests svc-supervision** : bug Babel/TS pré-existant — valider via node.js pour les fonctions pures.
- **CapturePreuveScreen** : SIGNATURE pré-sélectionnée par défaut — les tests qui supposaient `typeSelectionne=null` ont été mis à jour (L6).
