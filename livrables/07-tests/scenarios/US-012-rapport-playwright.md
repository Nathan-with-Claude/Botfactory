# Rapport de tests — US-012 : Consulter le détail d'une tournée

**Agent** : @qa
**Date d'exécution** : 2026-03-25
**Version** : 1.0
**US** : US-012 — Consulter le détail d'une tournée en cours (superviseur)

## Synthèse globale

| Suite de tests | Outil | Tests | Résultat |
|---|---|---|---|
| Application — GET /api/supervision/tournees/{id} | Playwright/chromium | 4/4 | PASS |
| **TOTAL GÉNÉRAL** | | **4/4** | **PASS** |

**Verdict US-012** : Validée — Les 4 tests passent. L'endpoint de détail tournée retourne correctement les informations détaillées, gère le 404, et est sécurisé (RBAC).

## Résultats détaillés par TC

### TC-310 — GET /api/supervision/tournees/{id} → HTTP 200 avec détails
| Sous-test | Résultat | Durée |
|---|---|---|
| Endpoint accessible, structure valide | PASS | ~34ms |

### TC-311 — Structure détail : colisTotal, colisTraites, statut, livreurNom
| Sous-test | Résultat | Durée |
|---|---|---|
| Champs obligatoires présents | PASS | ~37ms |

### TC-312 — GET tournée inexistante → 404
| Sous-test | Résultat | Durée |
|---|---|---|
| tournee-inexistante → 404 | PASS | ~24ms |

### TC-313 — RBAC : ROLE_LIVREUR → 403
| Sous-test | Résultat | Durée |
|---|---|---|
| Accès refusé au livreur | PASS | ~28ms |

**Screenshot** : `livrables/07-tests/screenshots/US-012/TC-012-01-detail-tournee.png`

## Notes techniques

- Le DevDataSeeder peuple `tournee-sup-001`, `tournee-sup-002`, `tournee-sup-003` dans svc-supervision.
- Le profil dev MockJwtAuthFilter injecte ROLE_SUPERVISEUR par défaut.

## Anomalies détectées

Aucune anomalie détectée.

## Recommandations

1. Ajouter les tests UI React de l'écran de détail tournée (interface web supervision).

## Rapport HTML Playwright
Disponible dans : `playwright-report-supervision/index.html`
Screenshots disponibles dans : `livrables/07-tests/screenshots/US-012/`
