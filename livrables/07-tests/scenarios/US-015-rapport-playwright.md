# Rapport de tests — US-015 : Suivre l'exécution d'une instruction

**Agent** : @qa
**Date d'exécution** : 2026-03-25
**Version** : 1.0
**US** : US-015 — Suivre l'état d'exécution d'une instruction envoyée à un livreur

## Synthèse globale

| Suite de tests | Outil | Tests | Résultat |
|---|---|---|---|
| Application — GET/PATCH /api/supervision/instructions | Playwright/chromium | 5/5 | PASS |
| **TOTAL GÉNÉRAL** | | **5/5** | **PASS** |

**Verdict US-015** : Validée — Les 5 tests passent. La liste des instructions, les statuts, l'exécution (PATCH) et la vue livreur (en-attente) fonctionnent correctement.

## Résultats détaillés par TC

### TC-340 — GET /api/supervision/instructions retourne la liste avec statuts
| Sous-test | Résultat | Durée |
|---|---|---|
| Liste des instructions avec statut PENDING/EXECUTED | PASS | ~37ms |

### TC-341 — DevDataSeeder : ≥1 instruction PENDING
| Sous-test | Résultat | Durée |
|---|---|---|
| Compteur instructions > 0 | PASS | ~30ms |

### TC-342 — PATCH /api/supervision/instructions/{id}/executer → 200
| Sous-test | Résultat | Durée |
|---|---|---|
| Marquage instruction comme exécutée | PASS | ~29ms |

### TC-343 — PATCH /executer sur instruction inexistante → 404
| Sous-test | Résultat | Durée |
|---|---|---|
| 404 pour instruction-inexistante | PASS | ~26ms |

### TC-344 — GET /instructions/en-attente?tourneeId={id} → vue livreur
| Sous-test | Résultat | Durée |
|---|---|---|
| Endpoint en-attente filtré par tourneeId | PASS | ~28ms |

**Screenshot** : `livrables/07-tests/screenshots/US-015/TC-015-01-instructions-en-attente.png`

## Notes techniques

- L'endpoint `/instructions/en-attente?tourneeId=` est utilisé par le mobile pour le polling (BC-04).
- Le PATCH /executer est appelé par le mobile quand le livreur valide l'instruction.

## Anomalies détectées

Aucune anomalie détectée.

## Recommandations

1. Ajouter un test de transition complète : création instruction → polling → exécution → vérification statut EXECUTED.

## Rapport HTML Playwright
Disponible dans : `playwright-report-supervision/index.html`
Screenshots disponibles dans : `livrables/07-tests/screenshots/US-015/`
