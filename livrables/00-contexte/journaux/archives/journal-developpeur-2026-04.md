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
