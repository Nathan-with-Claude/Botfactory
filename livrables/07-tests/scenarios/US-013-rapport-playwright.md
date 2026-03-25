# Rapport de tests — US-013 : Alertes tournées à risque

**Agent** : @qa
**Date d'exécution initiale** : 2026-03-25
**Date re-run (post-correction OBS-011-01)** : 2026-03-25
**Version** : 2.0
**US** : US-013 — Être alerté des tournées à risque (retard, incident)

## Synthèse globale

| Suite de tests | Outil | Tests | Résultat |
|---|---|---|---|
| Session 1 — Détection A_RISQUE | Playwright/chromium | 3/4 | FAIL partiel |
| Session 2 (re-run post OBS-011-01) | Playwright/chromium | 4/4 | PASS |
| **TOTAL GÉNÉRAL (re-run)** | | **4/4** | **PASS** |

**Verdict US-013** : Validée — Tous les 4 tests passent. La correction OBS-011-01 (introduction du wrapper `bandeau`) a résolu l'accès à `body.bandeau.aRisque` qui était auparavant undefined.

## Résultats détaillés par TC

### TC-013-01 — GET tableau-de-bord retourne >= 1 tournée A_RISQUE (DevDataSeeder)

| Sous-test | Résultat | Durée |
|---|---|---|
| tournees avec statut=A_RISQUE dans la liste | PASS | ~37ms |

### TC-013-02 — Bandeau résumé contient aRisque >= 1

| Sous-test | Résultat | Durée |
|---|---|---|
| body.bandeau.aRisque >= 1 | PASS | ~40ms |

Valeur retournée : `body.bandeau.aRisque = 1` (tournee-sup-003 est A_RISQUE dans le DevDataSeeder).

### TC-013-03 — Invariant : une tournée CLOTUREE ne passe jamais en A_RISQUE

| Sous-test | Résultat | Durée |
|---|---|---|
| Toutes les tournées CLOTUREES restent CLOTUREES | PASS | ~26ms |

### TC-013-04 — GET ?statut=A_RISQUE ne retourne que les tournées à risque

| Sous-test | Résultat | Durée |
|---|---|---|
| Filtre A_RISQUE exclusif | PASS | ~34ms |

**Screenshot** : `livrables/07-tests/screenshots/US-013/TC-013-02-bandeau-arisque.png`

## Notes techniques

- La tournée `tournee-sup-003` est bien en statut `A_RISQUE` dans le DevDataSeeder BC-03.
- `body.bandeau.aRisque = 1` confirme l'émission correcte de l'événement `TourneeARisqueDetectee`.
- La correction OBS-011-01 bénéficie à US-013 : le wrapper `bandeau` est maintenant présent.

## Anomalies détectées

OBS-013-01 : RESOLUE — `body.bandeau.aRisque` est maintenant accessible grâce à la correction OBS-011-01.

## Recommandations

1. Aucune action corrective nécessaire — US-013 est pleinement validée.

## Rapport HTML Playwright
Disponible dans : `playwright-report-supervision/index.html`
Screenshots disponibles dans : `livrables/07-tests/screenshots/US-013/`
