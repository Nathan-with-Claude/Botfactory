# Rapport de tests — US-022 : Vérifier la composition d'une tournée

**Agent** : @qa
**Date d'exécution** : 2026-03-25
**Version** : 1.0
**US** : US-022 — Vérifier la composition d'une tournée planifiée (zones, contraintes, anomalies)

## Synthèse globale

| Suite de tests | Outil | Tests | Résultat |
|---|---|---|---|
| Application — GET/POST /api/planification/tournees | Playwright/chromium | 4/4 | PASS |
| **TOTAL GÉNÉRAL** | | **4/4** | **PASS** |

**Verdict US-022** : Validée — Les 4 tests passent. L'endpoint de composition retourne zones, contraintes et anomalies ; la validation de composition est opérationnelle ; le 404 est correctement géré.

## Résultats détaillés par TC

### TC-022-01 — GET /api/planification/tournees/{id} avec détail zones et contraintes
| Sous-test | Résultat | Durée |
|---|---|---|
| codeTms, zones[], contraintes, anomalies, compositionVerifiee présents | PASS | ~37ms |

### TC-022-02 — GET /api/planification/tournees/inexistante → 404
| Sous-test | Résultat | Durée |
|---|---|---|
| tournee-inexistante-xyz → 404 | PASS | ~40ms |

### TC-022-03 — POST /api/planification/tournees/{id}/composition/valider → compositionVerifiee=true
| Sous-test | Résultat | Durée |
|---|---|---|
| POST valider → body.compositionVerifiee=true | PASS | ~34ms |

### TC-022-04 — Tournée T-203 avec surcharge : anomalies structurées
| Sous-test | Résultat | Durée |
|---|---|---|
| anomalies[].code et anomalies[].description présents | PASS | ~28ms |

**Screenshot** : `livrables/07-tests/screenshots/US-022/TC-022-01-composition-tp201.png`

## Notes techniques

- Le DevDataSeeder BC-07 crée tp-201 (NON_AFFECTEE), tp-202 (AFFECTEE), tp-203 (NON_AFFECTEE+SURCHARGE), tp-204 (LANCEE).
- L'endpoint de détail `/api/planification/tournees/{id}` est distinct de `/api/planification/plans/{date}`.

## Anomalies détectées

Aucune anomalie détectée.

## Recommandations

1. Ajouter un test pour la validation de composition sur une tournée avec des anomalies bloquantes (vérifier que compositionVerifiee=false si anomalies bloquantes).

## Rapport HTML Playwright
Disponible dans : `playwright-report-supervision/index.html`
Screenshots disponibles dans : `livrables/07-tests/screenshots/US-022/`
