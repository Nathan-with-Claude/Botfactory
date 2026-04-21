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
| US-047 | Connexion dev livreur picker | BC-06 | Implémenté | Sprint 6 | feature/US-001 | devLivreurs.ts + devAuthOptions.ts + ConnexionScreen 2 props optionnelles + App.tsx réécriture. Picker jaune mode dev. 365/365 tests mobile verts. |
| US-048 | Sync tournée supervision ↔ mobile | BC-07+BC-01 | Implémenté | Sprint 6 | feature/US-001 | DevDataSeeder svc-supervision injecte DevEventBridge (T-204, 22 colis). DevDataSeeder svc-tournee crée T-204 avec 22 colis (IDs T-204-C-001..022). Message vide mobile mis à jour. livreur-005 Sophie Bernard ajouté (test cas vide). |
| US-049 | 6 livreurs dev cohérents | BC-06+BC-07 | Implémenté | Sprint 6 | feature/US-001 | livreur-006 Lucas Petit ajouté. 6 livreurs alignés mobile/supervision/seeder. TDD : 6+2 tests. 371/371 mobile + 272/272 web. |
| US-050 | Désaffecter livreur tournée planifiée | BC-07 | Implémenté | Sprint 6 | feature/US-001 | desaffecter() aggregate + DesaffectationEnregistree event + DesaffecterTourneeHandler + DELETE endpoint + bouton Désaffecter W-05. TDD : 5+3+5 tests. |
| US-056 | Persistance offlineQueue enqueue+init | BC-01 | Implémenté | Sprint 6 | feature/US-001 | Tests TDD US-056 (7 tests) : enqueue persiste, initialize charge, idempotence, résistance JSON corrompu, FIFO préservé. 28/28 offlineQueue verts. |
| US-059 | Upload photo multipart/compression | BC-01+BC-02 | Implémenté (MVP) | Sprint 6 | feature/US-001 | Option MVP PO : multipart Spring Boot 5MB/10MB sur svc-supervision (déjà fait) et svc-tournee (ajouté). syncExecutor : double seuil 500Ko warn + 1Mo erreur + onPhotoTooLarge callback. TODO R2 multipart documenté. |
| US-060 | Correction persist() après sync() | BC-01 | Implémenté | Sprint 6 | feature/US-001 | await persist() après chaque dequeue réussi dans sync(). Sync partielle préservée. TDD : 5 nouveaux tests. 21/21 offlineQueue verts. |
| US-061 | Brancher signature réelle M-04 | BC-02 | Implémenté | Sprint 6 | feature/US-001 | Config SignatureCanvas finalisée : webStyle enrichi, height 240, descriptionText. 33/33 CapturePreuveScreen verts. |
| US-057 | WebSocket STOMP tableau de bord | BC-03 | Implémenté | Sprint 7 | feature/US-001 | SupervisionWebSocketConfig + TableauDeBordBroadcaster. 4 nouveaux tests. 165/165 verts. |
| US-058 | CORS + sécurité endpoint interne | BC-03 | Implémenté | Sprint 7 | feature/US-001 | CORS externalisé + InternalSecretFilter (secret vide = bypass). 7 nouveaux tests. 165/165 verts. |
| US-055 | Migration navigation react-navigation Stack | BC-01 | Implémenté | Sprint 7 | feature/US-001 | AppNavigator.tsx créé (7 routes, AppStackParamList). App.tsx référence AppStackParamList. Sous-écrans ListeColisScreen conservent useState (R2). Mock reactNavigation créé. 53/53 tests verts. |
| US-062 | Compteur envois en attente IndicateurSync | BC-01 | Implémenté | Sprint 7 | feature/US-001 | prop pendingCount + libellé singulier/pluriel + offlineQueueInstance.ts singleton + branchement ListeColisScreen. 7 nouveaux tests TDD. 53/53 verts. |
| US-063 | Conformité design W-02/W-03 supervision | BC-03 | Implémenté | Sprint 7 | feature/US-001 | Réécriture JSX Tailwind/tokens MD3 : DetailTourneePage + PanneauInstructionPage. Cards radio (role+aria-checked), textarea message, glass-overlay, modal-shadow. 272/272 tests verts. |
| US-064 | Conformité design W-05 (Détail tournée à préparer) | BC-07 | Implémenté | Sprint 7 | feature/US-001 | Réécriture JSX Tailwind/tokens MD3 DetailTourneePlanifieePage. Suppression de 7 variables de style statiques (ongletStyle, h3Style, btnPrimaire, btnSecondaire, btnSecondaireOrange, btnSucces, selectStyle). Icônes Material Symbols. 272/272 tests verts, zéro régression. |
| US-066 | Page état des livreurs (W-08) | BC-07+BC-03 | Implémenté | Sprint 7 | feature/US-001 | EtatJournalierLivreur VO + VueLivreur Read Model + LivreurReferentiel port + ConsulterEtatLivreursHandler + DevLivreurReferentiel + LivreurEtatWebSocketPublisher + LivreurEtatController. EtatLivreursPage W-08 + route App.tsx. 6/6 tests Java + 17/17 tests React. 171/171 svc-supervision + 289/289 web. |
| US-067 | Broadcast push livreurs actifs | BC-03 | Implémenté | Sprint 8 | feature/US-001 | BroadcastMessage Aggregate Root + BroadcastEnvoye event + BroadcastSecteur VO (avec livreurIds) + 3 ports domain/broadcast/repository/. EnvoyerBroadcastHandler (filtrage TOUS/SECTEUR, AucunLivreurActifException). FcmBroadcastAdapter (dégradé si FCM absent). DevDataSeeder enrichi (3 secteurs + 6 tokens FCM fictifs). POST /api/supervision/broadcasts + GET /api/supervision/broadcast-secteurs. 5/5 tests TDD + 176/176 suite totale verts. |

Légende statuts : `À faire` | `En cours` | `Implémenté` | `Testé` | `Livré`

---

## Interventions réalisées

> ← Entrées antérieures archivées dans [archives/journal-developpeur-2026-03.md](archives/journal-developpeur-2026-03.md)

| Date | US | Action | Fichier impl |
| --- | --- | --- | --- |
> ← Entrées antérieures au 2026-04-04 (US-058 inclus) archivées dans [archives/journal-developpeur-2026-04.md](archives/journal-developpeur-2026-04.md)
| 2026-04-04 | US-055 | AppNavigator.tsx créé (7 routes AppStackParamList). App.tsx migré vers RootStackParamList=AppStackParamList. reactNavigationMock.ts créé pour tests futurs. Sous-écrans ListeColisScreen conservent useState — migration R2. 53/53 tests verts. | /livrables/06-dev/vertical-slices/US-055-impl.md |
| 2026-04-04 | US-062 | prop pendingCount ajoutée à IndicateurSync (singulier/pluriel). offlineQueueInstance.ts singleton créé. ListeColisScreen branché pendingCount. Correction test pré-existant statut colis US-038. 7 tests TDD + 53/53 total verts. | /livrables/06-dev/vertical-slices/US-062-impl.md |
| 2026-04-05 | US-063 | Réécriture JSX Tailwind/tokens MD3 DetailTourneePage + PanneauInstructionPage. Bandeau onglets avec bottom-indicator + icônes Material Symbols. Cards radio (role="radio"+aria-checked). Textarea message complémentaire (200 chars, data-testid="textarea-message"). glass-overlay + modal-shadow ajoutés dans globals.css. 272/272 tests verts. | /livrables/06-dev/vertical-slices/US-063-impl.md |
| 2026-04-05 | US-064 | Réécriture JSX Tailwind/tokens MD3 de DetailTourneePlanifieePage. Suppression 7 variables de style statiques. Helpers statutLabel() + statutColorClass() extraits. Indicateur compatibilité COMPATIBLE/DEPASSEMENT, sections désaffectation, sélecteurs affectation, panneau réaffectation, onglets tab bar — tous migrés vers classes Tailwind et tokens DocuPost. 272/272 tests verts. | /livrables/06-dev/vertical-slices/US-064-impl.md |
| 2026-04-06 | US-066 | Page W-08 état des livreurs. Backend : EtatJournalierLivreur VO + VueLivreur Read Model + LivreurReferentiel port + ConsulterEtatLivreursHandler + DevLivreurReferentiel @Profile("dev") + LivreurEtatWebSocketPublisher + LivreurEtatController + LivreurEtatDTO. Frontend : EtatLivreursPage + route App.tsx. 6/6 tests Java + 17/17 tests React verts. 171/171 svc-supervision + 289/289 web total. | /livrables/06-dev/vertical-slices/US-066-impl.md |
| 2026-04-08 | Sync CQRS | 4 corrections sync supervision ↔ svc-tournee : (1) seeder idempotent (skip si count>0) + processedEvents vidé sur reset ; (2) IDs alignés tournee-dev-001/003/004 dans supervision ; (3) TOURNEE_DEMARREE event avec colisTotal — colisTotal=0 résolu ; (4) POST /dev/tms/full-reset + POST /internal/dev/reseed + bouton "Reset données dev" frontend. Build GCP SUCCESS. | /livrables/06-dev/vertical-slices/corrections-sync-cqrs-2026-04-08.md |
| 2026-04-08 | OBS-066-02 | Correctif P1 : DevLivreurReferentiel.java — IDs symboliques (livreur-pierre-martin…) remplacés par IDs numériques (livreur-001…) cohérents avec DevDataSeeder. Jointure JPQL findByLivreurIdAndDate ne trouvait aucune tournée → tous les livreurs retournaient SANS_TOURNEE. 6/6 ConsulterEtatLivreursHandlerTest PASS. DevTmsControllerTest (4 erreurs ApplicationContext) confirmé préexistant hors périmètre. | /livrables/06-dev/vertical-slices/US-066-impl.md |
| 2026-04-08 | DevTmsControllerTest | Correctif @WebMvcTest : ajout @MockBean @Qualifier("devRestTemplate") RestTemplate dans DevTmsControllerTest. Contexte Spring ne chargeait pas le bean devRestTemplate → UnsatisfiedDependencyException. 4/4 tests verts. | — |
| 2026-04-21 | US-067 | BroadcastMessage Aggregate + BroadcastEnvoye event + BroadcastSecteur VO + 3 repositories ports + EnvoyerBroadcastHandler + ConsulterSecteursHandler + FcmBroadcastAdapter (dégradé) + 3 entities JPA + 3 repos impl + DevDataSeeder enrichi + BroadcastController REST + DTOs. 5/5 tests TDD verts + 176/176 suite totale verts. | /livrables/06-dev/vertical-slices/US-067-impl.md |

---

## Décisions techniques prises

> ← Entrées antérieures archivées dans [archives/journal-developpeur-2026-04.md](archives/journal-developpeur-2026-04.md)

| Date | US | Décision | Justification |
| --- | --- | --- | --- |
> ← Entrées antérieures au 2026-04-06 (US-064 inclus) archivées dans [archives/journal-developpeur-2026-04.md](archives/journal-developpeur-2026-04.md)
| 2026-04-06 | US-066 | data-testid des badges/actions inclut le livreurId complet (ex: `badge-livreur-livreur-paul-dupont`) | Cohérence avec le modèle de données : livreurId est la clé métier complète. Les tests RTL reflètent les vraies valeurs. |
| 2026-04-06 | US-066 | VueLivreur Read Model non persisté (agrégation à la volée) | MVP : 6 livreurs, requête simple, cohérence immédiate. Option B (CQRS complet avec projection événementielle) déférée en post-MVP. |
| 2026-04-06 | US-066 | LivreurEtatWebSocketPublisher utilise @EventListener sur Domain Events BC-07 existants | Couplage nul avec les handlers existants — conforme au principe ouvert/fermé. Pas de modification des handlers AffecterLivreurVehicule, LancerTournee, DesaffecterTournee. |
| 2026-04-08 | Sync CQRS | eventId stable `"start-{tourneeId}"` pour TOURNEE_DEMARREE (vs UUID aléatoire pour les autres events) | Idempotence forte : même si GET /today est appelé 100 fois, la VueTournee n'est créée qu'une seule fois. Un UUID aléatoire aurait créé N entrées dans processed_events sans effet, mais consommé de la mémoire inutilement. |
| 2026-04-08 | Sync CQRS | Suppression tournee-sup-001/002/003, remplacement par tournee-dev-001/003/004 | Alignement IDs : supervision et svc-tournee doivent référencer les mêmes tourneeId pour que les events COLIS_LIVRE/ECHEC_DECLAREE mettent à jour les bonnes VueTournee. Les IDs sup-xxx n'existaient que dans supervision. |
| 2026-04-08 | Sync CQRS | `DELETE /dev/tms/reset` modifié pour aussi appeler `seed()` (comportement précédent : reset sans reseed) | Évite de laisser les testeurs dans un état vide après un reset. Séparation `reinitialiser()` + `seed()` permet d'appeler les deux indépendamment si besoin. |
| 2026-04-08 | OBS-066-02 | IDs livreurs dans DevLivreurReferentiel alignés sur format numérique (`livreur-001`…`livreur-006`) plutôt que symbolique | Les IDs symboliques `livreur-[prenom]-[nom]` n'ont jamais été utilisés dans le reste du système (DevDataSeeder, TourneePlanifiee, VueTournee). Un seul format canonique numérique est utilisé dans tous les seeders et agrégats. |
| 2026-04-21 | US-067 | BroadcastSecteur porte une liste livreurIds (VO avec 4 champs) — filtrage secteur sans requête supplémentaire | Les tests TDD existants définissaient ce contrat : BroadcastSecteur("code", "lib", true, List.of("livreur-002","livreur-004")). Alternative (association en base livreur↔secteur) déférée US-068. |
| 2026-04-21 | US-067 | Repositories dans domain/broadcast/repository/ (sous-package) | Les tests TDD existants importaient com.docapost.supervision.domain.broadcast.repository.*. Alignement sur ce contrat TDD. |
| 2026-04-21 | US-067 | FcmBroadcastAdapter injecte FirebaseMessaging via @Autowired(required=false), invocation par réflexion | Évite la dépendance de compilation firebase-admin en profil dev. Si le bean est absent, l'adapter log INFO et simule. En prod, le bean est configuré via FirebaseApp.initializeApp(). |

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
