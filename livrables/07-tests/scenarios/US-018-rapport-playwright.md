# Rapport de tests — US-018 : Historisation immuable des événements OMS

**Agent** : @qa
**Date d'exécution initiale** : 2026-03-25
**Date re-run (post-correction TC-018-01 isolation)** : 2026-03-25
**Version** : 2.0
**US** : US-018 — Garantir l'immuabilité de l'Event Store OMS

## Synthèse globale

| Suite de tests | Outil | Tests | Résultat |
|---|---|---|---|
| Session 1 — Immuabilité /api/oms/evenements | Playwright/chromium | 4/5 | FAIL partiel |
| Session 2 (re-run post isolation eventId) | Playwright/chromium+mobile | 10/10 | PASS |
| **TOTAL GÉNÉRAL (re-run)** | | **10/10** | **PASS** |

**Verdict US-018** : Validée — Tous les 5 tests passent sur les deux projets Playwright. La correction d'isolation (préfixe `us018-` pour les eventIds) évite tout conflit avec les tests US-017.

## Résultats détaillés par TC

### TC-018-01 — POST avec 4 attributs obligatoires → HTTP 201
| Sous-test | Résultat | Durée |
|---|---|---|
| Création événement avec eventId préfixé `us018-` | PASS | ~74ms |

Correction appliquée : le spec US-018 génère désormais des eventIds avec le préfixe `us018-` (ex. `us018-evt-1774422294`) pour éviter toute collision avec les eventIds de la spec US-017 (préfixe `evt-`).

### TC-018-02 — Immuabilité : PUT → 405 ou 403
| Sous-test | Résultat | Durée |
|---|---|---|
| PUT /api/oms/evenements → 405/403 | PASS | ~37ms |

### TC-018-03 — Immuabilité : DELETE → 405 ou 403
| Sous-test | Résultat | Durée |
|---|---|---|
| DELETE /api/oms/evenements → 405/403 | PASS | ~27ms |

### TC-018-04 — Reconstitution historique colis : ordre chronologique ASC
| Sous-test | Résultat | Durée |
|---|---|---|
| Timestamps croissants dans la liste | PASS | ~40ms |

### TC-018-05 — Mode dégradé GPS : modeDegradGPS=true
| Sous-test | Résultat | Durée |
|---|---|---|
| POST sans coordonnées → modeDegradGPS=true | PASS | ~30ms |

**Screenshot** : `livrables/07-tests/screenshots/US-018/TC-018-01-post-201-eventid-us018.png`
**Screenshot** : `livrables/07-tests/screenshots/US-018/TC-018-04-historique-immuable.png`

## Notes techniques

- Les tests US-017 et US-018 partagent le même endpoint POST /api/oms/evenements. La correction d'isolation par préfixe d'eventId (`us017-` / `us018-`) garantit l'absence de conflit même en exécution séquentielle.
- L'immuabilité du store (PUT 405, DELETE 405) est correctement enforced par l'implémentation.
- Les tests tournent sur deux projets : chromium + chromium-mobile — 5+5 = 10 tests au total.

## Anomalies détectées

OBS-018-01 : RESOLUE — Isolation des eventIds par préfixe de suite de test implémentée dans la spec.

## Recommandations

1. Documenter dans les guidelines de test la convention de préfixage des eventIds par suite.

## Rapport HTML Playwright
Disponible dans : `playwright-report/index.html`
Screenshots disponibles dans : `livrables/07-tests/screenshots/US-018/`
