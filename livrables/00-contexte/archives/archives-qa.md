# Archives Cold Storage — @qa — DocuPost

> Journal actif : `/livrables/00-contexte/journaux/journal-qa.md`
> Contient : interventions archivées (2026-03-19 à 2026-03-27) + décisions structurantes 1-9 + bilan vague 1

---

## Interventions archivées

| Date | US | Action | Fichier |
|------|----|--------|---------|
| 2026-03-19 | — | Création plan-tests.md initial | /livrables/07-tests/plan-tests.md |
| 2026-03-20 | US-001 | Rédaction 25 scénarios de test (TC-001 à TC-025) | /livrables/07-tests/scenarios/US-001-scenarios.md |
| 2026-03-20 | US-001 | Création jeux de données JDD-001 à JDD-006 | /livrables/07-tests/jeux-de-donnees.md |
| 2026-03-20 | US-001 | Mise à jour plan-tests.md v1.1 (section US-001) | /livrables/07-tests/plan-tests.md |
| 2026-03-23 | US-002 | Rédaction 20 scénarios de test (TC-026 à TC-045) | /livrables/07-tests/scenarios/US-002-scenarios.md |
| 2026-03-23 | US-002 | Création check-list tests manuels PO | /livrables/06-dev/poste-de-commande-tests.md |
| 2026-03-23 | US-002 | Création spec Playwright E2E (13 tests) | /src/mobile/e2e/US-002-progression-tournee.spec.ts |
| 2026-03-23 | US-003 | Rédaction 28 scénarios de test (TC-046 à TC-073) | /livrables/07-tests/scenarios/US-003-scenarios.md |
| 2026-03-23 | US-003 | Exécution Jest — 21 tests PASS + 34/34 non régression | src/mobile/src/__tests__/ |
| 2026-03-24 | US-004 | Rédaction 24 scénarios + spec Playwright (11 tests) + rapport | /livrables/07-tests/scenarios/US-004-scenarios.md |
| 2026-03-24 | US-005 | Rédaction 25 scénarios + spec Playwright (5 tests) + rapport | /livrables/07-tests/scenarios/US-005-scenarios.md |
| 2026-03-24 | US-007 | Rédaction 23 scénarios + spec Playwright (9 tests) + rapport | /livrables/07-tests/scenarios/US-007-scenarios.md |
| 2026-03-24 | US-004/005/007 | Exécution Playwright — 25/25 PASS | /livrables/07-tests/scenarios/US-00*-rapport-playwright.md |
| 2026-03-24 | — | Création scénarios US-006 à US-024 (18 fichiers) | /livrables/07-tests/scenarios/ |
| 2026-03-25 | US-006 | Création spec Playwright + exécution (4/4 PASS) + rapport | /src/mobile/e2e/US-006-mode-offline.spec.ts |
| 2026-03-25 | US-008 | Création spec Playwright + exécution (6/7 — TC-270 Échoué) + rapport | /src/mobile/e2e/US-008-capturer-signature.spec.ts |
| 2026-03-25 | US-009 | Création spec Playwright + exécution (7/7 PASS) + rapport | /src/mobile/e2e/US-009-capturer-preuve-alternative.spec.ts |
| 2026-03-25 | US-010 | Création spec Playwright + exécution (4/4 PASS) + rapport | /src/mobile/e2e/US-010-consulter-preuve-litige.spec.ts |
| 2026-03-25 | US-011 | Création spec Playwright + exécution (3/5 — bandeau) + rapport | /src/web/supervision/e2e/US-011-tableau-de-bord.spec.ts |
| 2026-03-25 | US-012 à US-024 | Création spec Playwright + exécution pour 13 US supplémentaires | /src/web/supervision/e2e/ + /src/mobile/e2e/ |
| 2026-03-25 | US-017/018/011/013/020/021/024 | Re-run post corrections (OBS-017-01, OBS-021-01, OBS-024-01, OBS-011-01/02) | rapports v2.0 correspondants |
| 2026-03-25 | US-008/011/014/021 | Session 3 — corrections finales, 7/7 + 5/5 + 5/5 + 5/5 PASS — rapports v3.0 | bilan-campagne-finale.md v3.0 |
| 2026-03-25 | — | Bilan final v3.0 — 24/24 US validées, 158/158 PASS (100%), 0 anomalie ouverte | /livrables/07-tests/scenarios/bilan-campagne-finale.md |
| 2026-03-25 | — | Screenshots E2E (19 captures + 8 re-run) pour 18 US | /livrables/07-tests/screenshots/US-*/ |
| 2026-03-25 | — | Mise à jour poste-de-commande-tests.md (US-010 à US-024) | /livrables/06-dev/poste-de-commande-tests.md |
| 2026-03-27 | Scénario E | Rédaction scénarios SE-01 à SE-09 (11 TCs) bout en bout | /livrables/07-tests/scenarios/scenario-E-scenarios.md |
| 2026-03-27 | Scénario E | Création spec Playwright scénario E (11 tests) | /src/web/supervision/e2e/US-scenarioE-bout-en-bout.spec.ts |
| 2026-03-27 | Scénario E | Exécution Playwright — 11/11 PASS (v1 + v2 re-run) | /livrables/07-tests/scenarios/scenario-E-rapport-playwright.md |
| 2026-03-27 | Scénario E | 31 screenshots capturés + rapport HTML Playwright | /livrables/07-tests/screenshots/scenario-E/, rapports/scenario-E-rapport-v2/ |

---

## Décisions structurantes archivées (1–9)

1. **Port Expo Web : 8084** — le port 8090 était utilisé dans les sessions précédentes. Le scénario E utilise 8084 comme défini dans la configuration de référence.
2. **assertNoOverlay confirmée efficace (session v2.0)** — `.eslintrc.json` dans `src/web/supervision/` élimine l'overlay webpack ESLint. Aucun overlay détecté lors de l'exécution v2.0.
3. **DevTourneeController.java corrigé** — `DataIntegrityViolationException` gérée gracieusement pour la contrainte unique `(livreur_id, date)`. Utiliser `livreur-007` pour les tests scénario E.
4. **Configuration Playwright double** — `playwright.config.ts` (mobile, port 8084) + `playwright.supervision.config.ts` (supervision web, port 3000).
5. **OBS-011-01 RESOLUE** — API svc-supervision retourne `{"bandeau":{"actives":2,"aRisque":1,"cloturees":0},"tournees":[...]}`. Correction dev appliquée le 2026-03-25.
6. **OBS-021-01 RESOLUE** — DevDataSeeder BC-07 utilise `deleteAll()` + `LocalDate.now()`. 4 tournées créées pour la date du jour à chaque redémarrage.
7. **OBS-017-01 RESOLUE** — POST /api/oms/evenements retourne le DTO créé avec `modeDegradGPS=true`.
8. **OBS-024-01 RESOLUE** — Champ `lanceeLe` sérialisé dans TourneePlanifieeDTO. Vérification `body.lanceeLe` truthy passe.
9. **Isolation eventId inter-suites** — Convention établie : préfixe par suite de test (`us017-`, `us018-`) pour éviter les conflits d'idempotence entre specs.

---

## Bilan vague 1 (US-001 à US-024 — session 2026-03-25)

- 24/24 US validées — 158/158 PASS (100%) — 0 anomalie ouverte résiduelle.
- Rapports disponibles : `/livrables/07-tests/scenarios/bilan-campagne-finale.md` (v3.0).

---

## Points d'attention Scénario E (archivés — résolus)

- **OBS-SE-01** : `testID="bouton-livrer"` absent dans `DetailColisScreen.tsx` — bouton non détectable par Playwright en React Native Web. (Résolu en session 3)
- **OBS-SE-02** : Gap read model — tournées Planification lancées non synchronisées dans la vue superviseur. (Résolu via US-032)
- **Overlay webpack** : `#webpack-dev-server-client-overlay` bloque tous les clics Playwright en mode dev React. Solution : `MutationObserver` via `addInitScript`. (Résolu via .eslintrc.json)
- **livreur-007** : pas de tournée dans le DevDataSeeder svc-tournee — tests mobiles utilisent livreur-001.
