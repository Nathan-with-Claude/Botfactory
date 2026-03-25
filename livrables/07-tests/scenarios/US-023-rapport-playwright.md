# Rapport de tests — US-023 : Affecter un livreur et un véhicule

**Agent** : @qa
**Date d'exécution** : 2026-03-25
**Version** : 1.0
**US** : US-023 — Affecter un livreur et un véhicule à une tournée planifiée

## Synthèse globale

| Suite de tests | Outil | Tests | Résultat |
|---|---|---|---|
| Application — POST /api/planification/tournees/{id}/affecter | Playwright/chromium | 4/4 | PASS |
| **TOTAL GÉNÉRAL** | | **4/4** | **PASS** |

**Verdict US-023** : Validée — Les 4 tests passent. L'affectation livreur+véhicule, les invariants d'atomicité (sans livreurId → 400) et d'unicité (livreur déjà affecté → 409), et le blocage de l'affectation sur tournée LANCEE (409) fonctionnent correctement.

## Résultats détaillés par TC

### TC-023-01 — POST /affecter avec livreurId + vehiculeId → HTTP 200
| Sous-test | Résultat | Durée |
|---|---|---|
| Affectation réussie → statut=AFFECTEE | PASS | ~50ms |

### TC-023-02 — Invariant atomicité : POST sans livreurId → 400
| Sous-test | Résultat | Durée |
|---|---|---|
| Affectation partielle rejetée | PASS | ~37ms |

### TC-023-03 — Invariant unicité : livreur déjà affecté sur autre tournée → 409
| Sous-test | Résultat | Durée |
|---|---|---|
| Double affectation même livreur rejetée | PASS | ~49ms |

### TC-023-04 — Invariant : POST /affecter sur tournée LANCEE → 409
| Sous-test | Résultat | Durée |
|---|---|---|
| Tournée tp-204 (LANCEE) → affectation impossible | PASS | ~40ms |

**Screenshot** : `livrables/07-tests/screenshots/US-023/TC-023-01-tournee-tp201-affectation.png`

## Notes techniques

- La tournée tp-204 est en statut LANCEE dans le DevDataSeeder — l'invariant de blocage d'affectation sur LANCEE fonctionne.
- L'atomicité de l'affectation (livreur ET véhicule ensemble) est bien enforced par le domaine.

## Anomalies détectées

Aucune anomalie détectée.

## Recommandations

1. Ajouter un test pour la réaffectation (changer de livreur sur une tournée déjà AFFECTEE) — vérifier si 200 ou 409.

## Rapport HTML Playwright
Disponible dans : `playwright-report-supervision/index.html`
Screenshots disponibles dans : `livrables/07-tests/screenshots/US-023/`
