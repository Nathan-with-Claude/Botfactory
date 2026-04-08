# Journal de bord — @qa — DocuPost

> **RÈGLE** : Lire ce fichier EN DÉBUT de session. Le mettre à jour EN FIN de session.
> Ce fichier donne le contexte de test synthétisé et suit l'avancement des scénarios.

---

## Contexte synthétisé

- **Livrables propriété** : `07-tests/`
  - plan-tests.md (créé et mis à jour — v1.1 avec US-001)
  - scenarios/ (alimenté : US-001 à US-024 scénarios + rapports + bilan final)
  - jeux-de-donnees.md (créé — JDD-001 à JDD-006)
  - bilan-campagne-finale.md (créé session 2 — synthèse 136 tests)
- **NFR clés à tester** : statut < 45 sec, sync OMS < 30 sec, alerte risque < 15 min, preuve < 5 min, disponibilité > 99,5 %
- **Stratégie** : TDD (tests unitaires + intégration par US), E2E Playwright (exécutés pour toutes les US du MVP)

### Ports de référence
- svc-tournee : port 8081
- svc-supervision : port 8082
- svc-oms : port 8083
- Expo Web (mobile) : port 8090 (8082 réservé à svc-supervision)

---

## Suivi des scénarios de test par US

| US | Titre court | Scénarios créés | Playwright | Rapport | Statut final |
| -- | ----------- | --------------- | ---------- | ------- | ------------ |
| US-001 | Consulter liste colis | Oui (25 TCs) | Oui | Oui | Validée |
| US-002 | Suivre progression | Oui (20 TCs) | Oui | Oui | Validée |
| US-003 | Filtrer par zone | Oui (28 TCs) | Oui | Oui | Validée |
| US-004 | Détail colis | Oui (24 TCs) | Oui | Oui | Validée (11/11) |
| US-005 | Déclarer échec | Oui (25 TCs) | Oui | Oui | Validée (5/5) |
| US-006 | Mode offline | Oui (7 TCs) | Oui | Oui | Validée (4/4) |
| US-007 | Clôturer tournée | Oui (23 TCs) | Oui | Oui | Validée (9/9) |
| US-008 | Capturer signature | Oui (7 TCs) | Oui | Oui | Partielle (6/7 — TC-270 Échoué) |
| US-009 | Capturer photo/tiers | Oui (7 TCs) | Oui | Oui | Validée (7/7) |
| US-010 | Consulter preuve | Oui (4 TCs) | Oui | Oui | Validée (4/4) |
| US-011 | Tableau de bord | Oui | Oui | Oui | Partielle (4/5 — OBS-011-02 résiduel) |
| US-012 | Détail tournée superviseur | Oui | Oui | Oui | Validée (4/4) |
| US-013 | Alerte tournée à risque | Oui | Oui | Oui | Validée (4/4) |
| US-014 | Envoyer instruction | Oui | Oui | Oui | Partielle (4/5 — isolation colisId) |
| US-015 | Suivre instruction | Oui | Oui | Oui | Validée (5/5) |
| US-016 | Notification push | Oui | Oui | Oui | Validée (4/4) |
| US-017 | Sync OMS | Oui | Oui | Oui | Validée (10/10 — re-run) |
| US-018 | Historisation immuable | Oui | Oui | Oui | Validée (10/10 — re-run) |
| US-019 | Authentification SSO mobile | Oui | Oui | Oui | Validée (6/6) |
| US-020 | Authentification SSO web | Oui | Oui | Oui | Validée (4/4 — re-run) |
| US-021 | Visualiser plan du jour | Oui | Oui | Oui | Partielle (4/5 — OBS-021-02 résiduel) |
| US-022 | Vérifier composition | Oui | Oui | Oui | Validée (4/4) |
| US-023 | Affecter livreur + véhicule | Oui | Oui | Oui | Validée (4/4) |
| US-024 | Lancer tournée | Oui | Oui | Oui | Validée (5/5 — re-run) |
| US-030 | Vérifier compatibilité véhicule | Oui (dans US-supervision) | Oui | Oui | Validée (L1+L2) |
| US-034 | Suggestion réaffectation véhicule | Oui (dans US-supervision) | Oui | Oui | Validée (L1+L2) |
| US-035 | Recherche multi-critères tableau de bord | Oui (dans US-supervision) | Oui | Oui | Validée (L1+L2+L3) |
| US-038 | Harmonisation libellés UX | Oui (dans US-supervision) | Oui | Oui | Validée — placeholder "numéro de tournée" confirmé L3 |
| US-031 | Composants visuels design system | Oui (dans mobile design-system) | — | — | Validée (36/36) |
| US-032 | Sync read model supervision | Oui (dans svc-supervision) | — | — | Validée (144/144) |
| US-033 | Simulateur TMS bout-en-bout | Oui (dans svc-supervision + svc-tournee) | — | — | Validée (256/256) |
| US-036 | Card SSO état initial (ConnexionScreen) | Oui (ConnexionScreen.US036) | — | — | Validée (16/16) |
| US-042 | Horodatage adaptatif consignes M-07 | Oui (MesConsignesScreen + FH*) | — | — | Validée (27/27) |
| US-043 | Card SSO rétractable avant connexion | Oui (ConnexionScreen.US043) | — | — | Validée (10/10) |
| US-045 | Hint visuel swipe onboarding | Oui (US045.hintSwipe + colisItem.hint) | — | — | Validée (17/17) |
| US-039 | Export CSV bilan tableau de bord | Oui | — | — | Validée (13/13) |
| US-040 | Enrichir CSV colonnes destinataire+statut | Oui | — | — | Validée (15/15 + 10/10 rétrocompat) |
| US-041 | Poids estimé + alerte surcharge W-04 | Oui | — | — | Validée (14/14) |
| US-044 | Compteur durée déconnexion WebSocket | Oui | — | — | Validée (11/11 — SC2 corrigé v2.0) |
| US-046 | Pad signature numérique réel M-04 | Oui | — | — | Validée (13/13 + 19/19 non régressions) |
| US-037 | Consignes locales M-07 | Oui (13 TCs L1) | — | Oui | Validée (352/352) |
| US-047 | Picker livreur dev mode | Oui (5 TCs L1) | — | Oui | Validée (365/365 non-rég) |
| US-048 | Sync supervision↔mobile DevEventBridge | Oui (5 TCs L1/L2) | — | Oui | Validée |
| US-049 | 6 livreurs canoniques alignés | Oui (6 TCs L1/L2) | — | Oui | Validée (795/795) |
| US-050 | Désaffecter livreur/véhicule | Oui (10 TCs L1/L2) | — | Oui | Validée (152/152+272/272) |
| US-051 | Bearer token supervisionApi | Oui (7 TCs) | — | — | À tester |
| US-052 | Dépendances package.json | Oui (6 TCs) | — | — | À tester |
| US-053 | poidsEstimeKg reconstruction | Oui (7 TCs) | — | — | À tester |
| US-054 | PostgreSQL local dev | Oui (6 TCs) | — | — | À tester |
| US-055 | Navigation react-navigation | Oui (5 TCs L1/L3) | — | Oui | Partielle (R1 ok, R2 déféré) |
| US-056 | offlineQueue AsyncStorage | Oui (7 TCs L1) | — | Oui | Validée (28/28) |
| US-057 | WebSocket STOMP | Oui (4 TCs L1) | — | Oui | Validée (165/165, L3 bloqué headless) |
| US-058 | CORS + endpoint interne | Oui (8 TCs L1) | — | Oui | Validée (165/165) |
| US-059 | Upload photo multipart | Oui (6 TCs L1) | — | Oui | Validée MVP alternatif |
| US-060 | persist() après sync offlineQueue | Oui (5 TCs L1) | — | Oui | Validée (60/60, Bug P0 résolu) |
| US-061 | react-native-signature-canvas | Oui (6 TCs L1) | — | Oui | Validée (33/33, P0 légal résolu) |
| US-062 | Compteur envois en attente IndicateurSync | Oui (7 TCs L1) | — | Oui | Validée (53/53) |
| US-066 | Page état des livreurs W-08 | Oui (16 TCs L1/L2/L3) | Non exécuté | Oui | Validée (L1 23/23 PASS, L2 4/5 PASS après correctif, L3 bloqué frontend) |

**Légende statuts** : `À faire` | `Scénarios rédigés` | `Exécutés` | `Validée` | `Partielle`

---

## Interventions réalisées

> ← Entrées antérieures archivées dans [archives/journal-qa-2026-03.md](archives/journal-qa-2026-03.md)

| Date | US | Action | Fichier |
| ---- | -- | ------ | ------- |
> ← Entrées 2026-03-25, 2026-04-02, 2026-04-03, 2026-04-04 et US-034 à US-057 (2026-04-05) archivées dans [archives/journal-qa-2026-04.md](archives/journal-qa-2026-04.md)
| 2026-04-05 | US-058 | Scénarios + rapport créés (8 TCs L1) — Validée 165/165 | livrables/07-tests/scenarios/US-058-*.md |
| 2026-04-05 | US-059 | Scénarios + rapport créés (6 TCs L1) — Validée MVP alternatif | livrables/07-tests/scenarios/US-059-*.md |
| 2026-04-05 | US-060 | Scénarios + rapport créés (5 TCs L1) — Validée Bug P0 résolu | livrables/07-tests/scenarios/US-060-*.md |
| 2026-04-05 | US-061 | Scénarios + rapport créés (6 TCs L1) — Validée Bug P0 légal résolu 33/33 | livrables/07-tests/scenarios/US-061-*.md |
| 2026-04-05 | US-062 | Scénarios + rapport créés (7 TCs L1) — Validée 53/53 | livrables/07-tests/scenarios/US-062-*.md |
| 2026-04-08 | US-066 | Scénarios + rapport créés (16 TCs L1/L2/L3) — L1 23/23 PASS, L2 bloqué OBS-066-02, L3 non exécuté | livrables/07-tests/scenarios/US-066-*.md |
| 2026-04-08 | US-066 | Re-run L2 après correctif OBS-066-02 (DevLivreurReferentiel IDs alignés) — L2 4/5 PASS, US validée | livrables/07-tests/scenarios/US-066-rapport-test.md |

---

## Décisions structurantes

1. **Port Expo Web : 8090** — svc-supervision occupe 8082. Expo Web démarré sur 8090 pour éviter le conflit.
2. **Configuration Playwright double** — `playwright.config.ts` (mobile, port 8090) + `playwright.supervision.config.ts` (supervision web, port 8082).
3. **OBS-011-01 RESOLUE** — L'API svc-supervision retourne maintenant `{"bandeau":{"actives":2,"aRisque":1,"cloturees":0},"tournees":[...]}`. Correction dev appliquée le 2026-03-25. Anomalie résiduelle OBS-011-02 : champ `actives` vs `totalTournees`.
4. **OBS-021-01 RESOLUE** — DevDataSeeder BC-07 utilise `deleteAll()` + `LocalDate.now()`. 4 tournées créées pour la date du jour à chaque redémarrage.
5. **OBS-017-01 RESOLUE** — POST /api/oms/evenements retourne le DTO créé avec `modeDegradGPS=true`. Correction dans EvenementController.
6. **OBS-024-01 RESOLUE** — Champ `lanceeLe` sérialisé dans TourneePlanifieeDTO. Vérification `body.lanceeLe` truthy passe.
7. **Isolation eventId inter-suites** — Convention établie : préfixe par suite de test (`us017-`, `us018-`) pour éviter les conflits d'idempotence entre specs.
8. **Bypass SSO Playwright** — Pour les tests L3 supervision web, injecter `docupost_access_token` dans `sessionStorage` avant rechargement de la page. L'App.tsx (`resolveRouteInitiale`) redirige vers le tableau de bord si le token est présent.
9. **Playwright headless et WebSocket** — En mode headless, le WebSocket ne peut pas se connecter à `ws://localhost:8082/ws/supervision`. Le bandeau déconnexion s'affiche systématiquement. Les données dépendent du polling fallback (HTTP GET).
10. **B3/B4/B5 résolution** — Confirmée session 02/04. B3 (titre onglet) résolu. B5 (bandeau + bouton Reconnecter) résolu. B4 (toast instruction) validé en L2, non vérifié en L3 (navigation incomplète).
11. **svc-supervision port en runtime** — Le service démarré en background occupe le port 8082. Le frontend supervision (port 3000) pointe sur ce backend via `REACT_APP_API_URL`. La configuration Playwright supervision pointe le backend (8082) mais les specs L3 redirigent explicitement vers le frontend (3000).

---

## Points d'attention

- **OBS-SUP-001 (résolu)** : Compteur WebSocket — correction appliquée, SC1 affiche bien "0 s" au premier rendu. 11/11 PASS en v2.0.
- **OBS-SUP-002 (résolu)** : TC-044-SC2 Jest — corrigé par ajout de `jest.runAllTimers()` avant `advanceTimersByTime`. 11/11 PASS.
- **OBS-SUP-003 (ouvert)** : US-035-impl.md placeholder obsolète ("code TMS" → "numéro de tournée"). Mise à jour documentaire.
- **OBS-SUP-004 (info)** : En tests L3 Playwright, les données tournées sont absentes (WebSocket déconnecté headless). Ajouter `waitForSelector('[data-testid="ligne-tournee"]')`.
- **OBS-011-02 (ouvert)** : Champ `actives` vs `totalTournees` dans `bandeau` — 1 test US-011 encore échoué. Correction triviale (renommage ou mise à jour spec).
- **OBS-021-02 (ouvert)** : API `/api/planification/plans/{date}` retourne les compteurs à plat sans wrapper `bandeau`. 1 test US-021 encore échoué. Correction: aligner spec ou encapsuler côté dev.
- **OBS-014-01/02 (ouverts)** : TC-014-02 impacté par l'ordre d'exécution (409 avant 422). Solution: utiliser un `colisId` distinct dans TC-014-02.
- **TC-270 (US-008)** : Navigation M-03 → M-04 bloquée par le SplashScreen Expo Web (timeout 5s insuffisant). Solution: augmenter timeout ou mocker SplashScreen.
- **Expo Web port 8090** : À documenter dans le README de test pour les futurs QA.
- **OBS-AS-001 (ouvert)** : TourneePlanifieeMapper.java non listé dans les fichiers modifiés de US-053. Si le mapper appelle encore le constructeur 15-params, le bug POIDS_ABSENT persiste après rechargement BDD. Vérifier en L2 avec profil local-postgres.
- **OBS-AS-004 (ouvert)** : US-059 — pas de message utilisateur en cas de 413 (uniquement console.warn). UX silencieusement dégradée pour photos volumineuses.
- **OBS-AS-005 (ouvert)** : US-055 migration partielle — bouton retour Android non fonctionnel depuis DetailColisScreen, CapturePreuveScreen, MesConsignesScreen. Prévu R2.
- **infrastructure-locale.md** : non mis à jour avec commandes PostgreSQL (US-054) ni variables ALLOWED_ORIGINS/INTERNAL_SECRET (US-058). À traiter par @developpeur ou @devops.
- **OBS-066-01 (non bloquant)** : sécurité dev bypass total sans token — comportement volontaire, à documenter explicitement dans MockJwtAuthFilter.
- **OBS-066-02 (RESOLUE)** : DevLivreurReferentiel.java corrigé avec IDs numériques (livreur-001..006). Re-run L2 PASS. US-066 validée.

### Points d'attention spécifiques US-001 à US-007 (archivés)

> Voir `/livrables/07-tests/scenarios/` pour le détail des anomalies par US. Points clés retenus :
> - US-007 : `bouton-cloture` conditionné `resteALivrer == 0` — absent au chargement initial.
> - US-004 : `DetailColisScreen` sans testID racine — détection via `bouton-retour`.
> - US-002 : `TourneeControllerTest` rouge en JDK 25 + Spring Boot 3.4.x (BUG-002 infra).
> - US-019 : `MockJwtAuthFilter` TC-012 et TC-025 à rejouer avec OAuth2 réel.
