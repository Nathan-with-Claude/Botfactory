# Archive — Journal @developpeur — 2026-04

> Archivé le 2026-04-02. Source : journal-developpeur.md

## Interventions archivées

> Sections feedback terrain archivées pour réduire la taille du journal principal.

### Corrections post-QA 2026-04-02 (OBS-SUP-001 à OBS-SUP-004)

| Date | Anomalie | Action | Fichiers |
| --- | --- | --- | --- |
| 2026-04-02 | OBS-SUP-001 — compteur "-1 s" au premier rendu | Ajout `Math.max(0, maintenant - deconnecteDepuisMs)` sur `dureeDeconnexionMs` | TableauDeBordPage.tsx (ligne 413) |
| 2026-04-02 | OBS-SUP-002 — TC-044-SC2 Jest : commentaire clarifié | Commentaire SC2 enrichi pour expliciter que `creerMockWsFactory(true)` = WS OFFLINE requis | TableauDeBordPage.US044.test.tsx |
| 2026-04-02 | OBS-SUP-003 — doc US-035-impl.md obsolète | Remplacement placeholder "code TMS" par "numéro de tournée" section Frontend | /livrables/06-dev/vertical-slices/US-035-impl.md |
| 2026-04-02 | OBS-SUP-004 — Playwright manque waitForSelector | Ajout `page.waitForSelector('[data-testid="ligne-tournee"]', { timeout: 10000 })` TC1 et TC2 | src/web/supervision/e2e/US-supervision-campagne.spec.ts |

### Interventions feedback terrain 2026-04-01

| Date | Bloquant | Action | Fichiers |
| --- | --- | --- | --- |
| 2026-04-01 | B1 — livreurId hardcode | Injection SupervisionNotifier dans TourneeController + Authentication.getName() sur /echec, /livraison, /cloture | TourneeController.java + 6 suites @WebMvcTest |
| 2026-04-01 | B2 — useNetworkStatus non raccordé | useNetworkStatus() branché dans ListeColisScreen + bandeau hors-ligne conditionnel (IndicateurSync) | ListeColisScreen.tsx |
| 2026-04-01 | B4 — bouton ENVOYER rechargeable après succès | peutEnvoyer inclut envoi !== 'succes' + toast "Le livreur a été notifié" | PanneauInstructionPage.tsx + 2 tests |
| 2026-04-01 | B5 — WebSocket sans Reconnecter | reconnecterManuellement() + deconnecteDepuisMs state + bouton btn-reconnecter + compteur-deconnexion | TableauDeBordPage.tsx + 2 tests |
| 2026-04-01 | B6 — hint swipe toujours affiché | AsyncStorage compteur sessions (SWIPE_HINT_MAX_SESSIONS=5) + afficherHintSwipe state + PanResponder | ListeColisScreen.tsx + ColisItem.tsx + CarteColis.tsx |

**Bilan tests 2026-04-01 :** 32/32 backend svc-tournee verts, 18/18 tests mobiles concernés verts.

### Interventions feedback terrain 2026-03-30

| Date | Amélioration | Action | Fichiers |
| --- | --- | --- | --- |
| 2026-03-30 | S1 | livreurNom en donnée primaire, tourneeId grisé dans TableauDeBordPage | TableauDeBordPage.tsx + test |
| 2026-03-30 | S2 | Détail retard (minutes + nb colis) dans la ligne A_RISQUE — retardEstimeMinutes/colisEnRetard dans VueTourneeDTO | TableauDeBordPage.tsx + test |
| 2026-03-30 | S3 | Redirection auto PreparationPage → TableauDeBord après lancement (800ms) | PreparationPage.tsx + test |
| 2026-03-30 | S4 | Bandeau déconnexion WebSocket orange #b45309 (vs rouge métier) | TableauDeBordPage.tsx + test |
| 2026-03-30 | S5 | Bouton "Exporter le bilan" (prop onExporterBilan injectable) | TableauDeBordPage.tsx + test |
| 2026-03-30 | L2/L4/L6/L8 | Libellé SSO raccourci + toast échec + SIGNATURE pré-sélectionnée + texte aide disposition | Divers screens |

**Bilan tests 2026-03-30 :** 191 tests web verts, 264 tests mobiles verts.

### Interventions archivées 2026-04-02 / 2026-04-03 (depuis journal principal)

| Date | US | Action | Fichier impl |
| --- | --- | --- | --- |
| 2026-04-02 | US-045 | Hint visuel swipe onboarding : hook useSwipeHint (SEUIL=3, fail-safe=true, incrément sur swipe réussi) remplace logique sessions (Bloquant 6). TDD : 13 tests hook. 342/342 suite totale mobile verts. | /livrables/06-dev/vertical-slices/US-045-impl.md |
| 2026-04-02 | US-045 delta | Delta v1.3 : texte exact wireframe + position sous la carte dans ColisItem. Accessibilité : accessibilityLabel + role text. TDD : 4 tests rendu. 352/352 suite totale mobile verts. | /livrables/06-dev/vertical-slices/US-045-impl.md |
| 2026-04-03 | US-046 | Pad signature réel : react-native-signature-canvas + mock SignatureCanvas + remplacement TouchableOpacity simulé. Tests US-008/009 mis à jour. TDD : 13 tests. 365/365. | /livrables/06-dev/vertical-slices/US-046-impl.md |
| 2026-04-03 | US-039 | Export CSV bilan W-01 : exporterCSVBilan.ts + btn-telecharger-bilan + VueTourneeDTO (nbLivres, nbEchecs). TDD : 13 tests. | /livrables/06-dev/vertical-slices/US-039-impl.md |
| 2026-04-03 | US-044 bugfix | Bug SC2 corrigé : act(runAllTimers) ajouté avant advanceTimersByTime(90_000). 265/265 tests web verts. | — |
| 2026-04-03 | US-040 | Enrichir CSV W-05 : construireColisCSVRowsEnrichis + serialiserEnCSVEnrichi. TDD : 15 tests. | /livrables/06-dev/vertical-slices/US-040-impl.md |
| 2026-04-03 | US-041 | Poids estimé W-04 : alerteSurcharge.ts + calculerNiveauAlerte. TDD : 14 tests. | /livrables/06-dev/vertical-slices/US-041-impl.md |
| 2026-04-03 | OBS-011-02 | Correction Playwright TC-011-04 : totalTournees → actives. | — |
| 2026-04-03 | OBS-014-01 | Correction Playwright TC-014-02 : isolation colisId. | — |
| 2026-04-03 | OBS-008-01 | SplashScreen Expo Web : timeout 20s + waitForSelector + graceful degradation. | — |
| 2026-04-03 | US-027 session 2 | Tailwind CSS v3.4.19 + DaisyUI + refactorisation W-04/W-01. 265/265 verts. | /livrables/06-dev/vertical-slices/US-027-impl.md |
| 2026-04-03 | US-047 | Branchement ConnexionScreen intro + picker livreur dev. 365/365 mobile verts. | /livrables/06-dev/vertical-slices/US-047-impl.md |
| 2026-04-03 | US-048 | Sync tournée supervision ↔ mobile. T-204 22 colis. 371/371 mobile + 272/272 web. | /livrables/06-dev/vertical-slices/US-048-impl.md |
| 2026-04-03 | US-049 | 6 livreurs dev alignés. 371/371 mobile + 272/272 web verts. | /livrables/06-dev/vertical-slices/US-049-impl.md |
| 2026-04-03 | US-050 | Désaffecter livreur BC-07. 152/152 svc-supervision + 272/272 web verts. | /livrables/06-dev/vertical-slices/US-050-impl.md |
| 2026-04-03 | correctif | ListeColisScreen.test.tsx aligné + Guard TextEncoder DetailTourneePage. | — |
| 2026-04-03 | BUG-T204-01 | Fix désync compteur colis T-204-C-022. | — |
| 2026-04-03 | BUG-INSTR-01 | Fix supervisionApi.ts URL → localhost:8082. | — |

### Décisions archivées 2026-04-02 / 2026-04-03 (depuis journal principal)

| Date | US | Décision | Justification |
| --- | --- | --- | --- |
| 2026-04-02 | US-044 | Tests US044 créés mais non exécutables (bug Babel/TS svc-supervision pré-existant) | Bug Babel/TS antérieur à cette session dans la suite svc-supervision. Validé via node.js. |
| 2026-04-03 | US-044 bugfix SC2 | act(runAllTimers) ajouté avant advanceTimersByTime(90000) dans SC2 | Sans ce premier act(), le useEffect créant le setInterval ne s'est pas exécuté avant les 90s fake. |
| 2026-04-03 | US-027 session 2 | Tailwind v3 + DaisyUI installés. Styles inline critiques conservés. select caché pour filtre-statut. | Stratégie hybride inline+Tailwind garantit 0 régression tests. |

### Interventions archivées 2026-03-30 / 2026-03-31 (depuis journal principal)

| Date | US | Action | Fichier impl |
| --- | --- | --- | --- |
| 2026-03-31 | US-036 | Card SSO rétractable : ConnexionScreen M-01 étendu (card "Comment ça fonctionne ?", toggle chevron, état cardOuverte). AsyncStorage : hasConnectedOnce + cardSsoOuverte. TDD : 16 tests verts. 280/280. | /livrables/06-dev/vertical-slices/US-036-impl.md |
| 2026-03-30 | US-037 | Historique consignes livreur : useConsignesLocales hook + MesConsignesScreen M-07 réécriture stateless + BandeauInstructionOverlay. TDD : 11+12 tests. 303/303. | /livrables/06-dev/vertical-slices/US-037-impl.md |
| 2026-03-30 | US-037 delta | prendreEnCompteNouvelles() + navigation M-07→M-03. TDD : +7 tests. 310/310. | /livrables/06-dev/vertical-slices/US-037-impl.md |
| 2026-04-02 | US-042 | Horodatage adaptatif M-07 : formaterHorodatage(iso, maintenant) exportée + testID horodatage-{id}. TDD : 5 tests. 315/315. | /livrables/06-dev/vertical-slices/US-042-impl.md |
| 2026-04-02 | US-043 | Card SSO rétractable avant connexion : state dejaConnecte + toggleCard conditionnel. TDD : 10 tests. 325/325. | /livrables/06-dev/vertical-slices/US-043-impl.md |
| 2026-04-02 | US-044 | Compteur déconnexion WebSocket adaptatif : formaterDureeDeconnexion(ms). TDD : 7/7. | /livrables/06-dev/vertical-slices/US-044-impl.md |
| 2026-04-02 | US-038 | Harmonisation libellés UX. TDD : 4 tests. 329/329. | /livrables/06-dev/vertical-slices/US-038-impl.md |

### Décisions archivées (depuis journal principal)

| Date | US | Décision | Justification |
| --- | --- | --- | --- |
| 2026-03-30 | US-034 | Aucune modification de l'Aggregate TourneePlanifiee pour la réaffectation | Aggregate existant couvre déjà la logique |
| 2026-03-30 | US-037 | MesConsignesScreen stateless — logique dans useConsignesLocales | Séparation claire Infrastructure vs Interface |
| 2026-03-30 | US-037 | InstructionPriseEnCompte backend déféré Sprint 5 | Endpoint non encore spécifié côté BC-03 |
| 2026-04-02 | US-042 | Test FH2 ajusté pour éviter ambiguïté de fuseau (09:00 UTC) | formaterHorodatage dépend du fuseau local |
| 2026-04-02 | US-043 | setItem cardSsoOuverte uniquement si dejaConnecte=true | Avant 1ère connexion, pas de persistance toggle |
| 2026-04-04 | US-051 | supervisionApi.ts migré vers createHttpClient (pattern httpClient centralisé) | Cohérence avec tourneeApi.ts, moins de code dupliqué |
| 2026-04-04 | US-053 | Constructeur 15-params @Deprecated → 16-params | Rétrocompatibilité binaire |
| 2026-04-04 | US-056 | AsyncStorage injectable via OfflineQueueOptions.storage | Pattern DI cohérent |
| 2026-04-04 | US-055 | Migration react-navigation partielle (App.tsx + AppNavigator.tsx). Sous-écrans ListeColisScreen conservent useState — migration R2 | Casser 300+ tests existants non justifié pour le MVP |
| 2026-04-04 | US-058 | InternalSecretFilter comme OncePerRequestFilter | Plus lisible, pas de conflit avec règles Spring Security |
| 2026-04-04 | US-060 | persist() appelé après chaque dequeue dans sync() — pas appelé en cas d'erreur réseau (break) | TDD first, bug détecté OBS-AS-006 |
| 2026-04-04 | US-061 | Config SignatureCanvas finalisée : webStyle border-radius 12px + footer masqué, descriptionText "Signez ici" | Bloquant légal |
| 2026-04-04 | US-062 | offlineQueueInstance.ts singleton partagé — pendingCount synchrone O(1) | Pattern identique authStoreInstance, pas de complexité Observable pour MVP |
| 2026-04-04 | US-056 | Tests uniquement (code déjà présent) : makeMockStorage() extrait en helper global pour réutilisation US-060/US-056. Doublon de helper inline retiré. | Fichier de test maintenable — helper partagé entre les deux suites |
| 2026-04-04 | US-059 | onPhotoTooLarge callback optionnel dans SyncExecutorOptions plutôt que d'exposer un état React — découple syncExecutor de l'UI, testable unitairement. Retour { success: false, status: 413 } plutôt que throw pour ne pas stopper les autres commandes de la file. | Cohérence avec la gestion des erreurs métier non récupérables dans sync() |
| 2026-04-04 | US-057 | Endpoint STOMP nommé `/ws/supervision` (vs `/ws` spécifié) pour namespacing explicite — décision prise lors d'une session antérieure, préservée. setSessionCookieNeeded(false) pour mode stateless. | Cohérence avec l'architecture sans session |
| 2026-04-04 | US-058 | Bypass InternalSecretFilter étendu au secret vide (isBlank) en plus de "dev-secret-ignored" — correction d'un cas non couvert initialement. Secret vide = INTERNAL_SECRET non configuré = pas de prod réel. | Spec US-058 : "Si la propriété est vide (profil dev) → bypass" |
| 2026-04-04 | US-055 | AppNavigator.tsx comme documentation des routes + typage AppStackParamList. Sous-écrans ListeColisScreen non migrés vers useNavigation() pour éviter 300+ régressions de tests Jest | Migration complète R2 quand AuthProvider sera en place |
| 2026-04-04 | US-062 | offlineQueueInstance.ts singleton partagé — pendingCount synchrone O(1), rafraîchi via useEffect([etat]) | Pattern DI identique authStoreInstance, simplicité MVP suffisante |

### Interventions archivées 2026-04-04 (depuis journal principal)

| Date | US | Action | Fichier impl |
| --- | --- | --- | --- |
| 2026-04-04 | US-025 palette | Application palette MD3 designer (M-01 à M-06). 60+ tokens colors.ts, theme.ts créé, 5 écrans + 6 composants. | /livrables/06-dev/vertical-slices/US-025-impl.md |
| 2026-04-04 | US-051/052/053/054/055/056/058/059 | Corrections as-built P0+P1. 154/154 tests svc-supervision. | /livrables/06-dev/vertical-slices/corrections-as-built-impl.md |
| 2026-04-04 | US-060 | Correction persist() manquant dans sync(). 5 nouveaux tests TDD. 21/21 verts. | /livrables/06-dev/vertical-slices/US-060-impl.md |
| 2026-04-04 | US-061 | Finalisation react-native-signature-canvas dans CapturePreuveScreen. 33/33 verts. | /livrables/06-dev/vertical-slices/US-061-impl.md |
