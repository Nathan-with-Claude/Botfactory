# Rapport de tests — US-024 : Lancer une tournée

**Agent** : @qa
**Date d'exécution initiale** : 2026-03-25
**Date re-run (post-correction OBS-024-01)** : 2026-03-25
**Version** : 2.0
**US** : US-024 — Lancer une tournée pour la rendre visible au livreur

## Synthèse globale

| Suite de tests | Outil | Tests | Résultat |
|---|---|---|---|
| Session 1 — POST /api/planification/tournees/{id}/lancer | Playwright/chromium | 4/5 | FAIL partiel |
| Session 2 (re-run post OBS-024-01) | Playwright/chromium | 5/5 | PASS |
| **TOTAL GÉNÉRAL (re-run)** | | **5/5** | **PASS** |

**Verdict US-024** : Validée — Tous les 5 tests passent. La correction OBS-024-01 (champ `lanceeLe` ajouté dans le DTO de réponse) est confirmée. La vérification `body.lanceeLe` est bien truthy dans la réponse 200.

## Résultats détaillés par TC

### TC-024-01 — POST /api/planification/tournees/{id}/lancer sur AFFECTEE → 200 + TourneeLancee

| Sous-test | Résultat | Durée |
|---|---|---|
| Lancement tp-202 — statut=LANCEE, lanceeLe présent | PASS | ~25ms |

La réponse contient maintenant `"statut":"LANCEE"` et `"lanceeLe":"2026-03-25T..."` — le champ `lanceeLe` était absent avant correction (OBS-024-01).

### TC-024-02 — Invariant : POST /lancer sur NON_AFFECTEE → 409

| Sous-test | Résultat | Durée |
|---|---|---|
| Tournée tp-203 (NON_AFFECTEE) → 409 | PASS | ~25ms |

### TC-024-03 — Idempotence : POST /lancer sur LANCEE → 409 ou 200

| Sous-test | Résultat | Durée |
|---|---|---|
| Tournée tp-204 (déjà LANCEE) → 409/200 | PASS | ~31ms |

### TC-024-04 — POST /plans/{date}/lancer-toutes → nbTourneesLancees

| Sous-test | Résultat | Durée |
|---|---|---|
| Lancement en lot avec compteur | PASS | ~38ms |

### TC-024-05 — POST /plans/not-a-date/lancer-toutes → 400

| Sous-test | Résultat | Durée |
|---|---|---|
| Validation format date invalide | PASS | ~22ms |

**Screenshot** : `livrables/07-tests/screenshots/US-024/TC-024-01-lancer-lancee-le.png`
**Screenshot** : `livrables/07-tests/screenshots/US-024/TC-024-01-tournee-tp202.png`

## Notes techniques

- La correction OBS-024-01 a consisté à renommer le champ `lancee` en `lanceeLe` dans les DTOs de planification et à s'assurer de sa sérialisation JSON.
- tp-202 est passée en statut LANCEE lors de TC-024-01 — les tests TC-024-02/03 opèrent sur tp-203/tp-204 indépendamment.
- Le DevDataSeeder BC-07 (correction OBS-021-01) garantit que tp-202 repart en AFFECTEE à chaque redémarrage du service grâce au `deleteAll()`.
- L'événement domaine `TourneeLancee` est émis côté BC-07 → BC-01 (log visible dans svc-supervision).

## Anomalies détectées

OBS-024-01 : RESOLUE — Le champ `lanceeLe` est maintenant sérialisé dans le DTO de réponse POST /lancer.

## Recommandations

1. Ajouter un test vérifiant que `lanceeLe` est un timestamp ISO-8601 valide (format `yyyy-MM-ddTHH:mm:ssZ`).

## Rapport HTML Playwright
Disponible dans : `playwright-report-supervision/index.html`
Screenshots disponibles dans : `livrables/07-tests/screenshots/US-024/`
