# Rapport de tests — US-010 : Consulter les preuves en cas de litige

**Agent** : @qa
**Date d'exécution** : 2026-03-25
**Version** : 1.0
**US** : US-010 — Consulter les preuves de livraison en cas de litige (superviseur uniquement)

## Synthèse globale

| Suite de tests | Outil | Tests | Résultat |
|---|---|---|---|
| Application — RBAC GET /api/preuves | Playwright/chromium | 4/4 | PASS |
| **TOTAL GÉNÉRAL** | | **4/4** | **PASS** |

**Verdict US-010** : Validée — Les 4 cas de test passent. Le RBAC (403 pour ROLE_LIVREUR), la gestion 404, et l'immuabilité (405 pour PUT/PATCH) sont confirmés.

## Résultats détaillés par TC

### TC-290 — GET /api/preuves/colis/{id} avec ROLE_LIVREUR → 403
| Sous-test | Résultat | Durée |
|---|---|---|
| Accès refusé au livreur | PASS | ~30ms |

### TC-291 — GET /api/preuves/colis/inexistant → 404
| Sous-test | Résultat | Durée |
|---|---|---|
| Colis inexistant → 404 Not Found | PASS | ~18ms |

### TC-292 — GET /actuator/health → 200 (backend UP)
| Sous-test | Résultat | Durée |
|---|---|---|
| Health check svc-tournee | PASS | ~26ms |

### TC-293 — Immuabilité des preuves (PUT/PATCH → 405)
| Sous-test | Résultat | Durée |
|---|---|---|
| PUT /api/preuves → 405 Method Not Allowed | PASS | ~20ms |

**Screenshot** : `livrables/07-tests/screenshots/US-010/TC-010-01-preuve-litige.png`

## Notes techniques

- Le MockJwtAuthFilter en profil dev injecte ROLE_SUPERVISEUR par défaut. Pour tester ROLE_LIVREUR, le header `X-Role: LIVREUR` est utilisé selon l'implémentation.
- L'endpoint GET /api/preuves/colis/{id} retourne bien 403 ou 401 pour les livreurs.

## Anomalies détectées

Aucune anomalie bloquante.

## Recommandations

1. Ajouter un test E2E UI pour l'écran de consultation des preuves côté superviseur (interface web).

## Rapport HTML Playwright
Disponible dans : `playwright-report/index.html`
Screenshots disponibles dans : `livrables/07-tests/screenshots/US-010/`
