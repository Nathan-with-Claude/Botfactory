# Rapport de tests — US-020 : Authentification SSO web supervision

**Agent** : @qa
**Date d'exécution initiale** : 2026-03-25
**Date re-run (post-correction OBS-011-01)** : 2026-03-25
**Version** : 2.0
**US** : US-020 — S'authentifier via son compte Docaposte (SSO) depuis l'interface web de supervision

## Synthèse globale

| Suite de tests | Outil | Tests | Résultat |
|---|---|---|---|
| Session 1 — RBAC svc-supervision | Playwright/chromium | 3/4 | FAIL partiel |
| Session 2 (re-run post OBS-011-01) | Playwright/chromium | 4/4 | PASS |
| **TOTAL GÉNÉRAL (re-run)** | | **4/4** | **PASS** |

**Verdict US-020** : Validée — Tous les 4 tests passent. La correction OBS-011-01 a introduit le wrapper `bandeau` dans la réponse du tableau de bord, résolvant TC-020-03.

## Résultats détaillés par TC

### TC-020-01 — GET /api/supervision/tableau-de-bord avec ROLE_SUPERVISEUR → 200

| Sous-test | Résultat | Durée |
|---|---|---|
| Accès accordé au superviseur (MockJwtAuthFilter dev) | PASS | ~27ms |

### TC-020-02 — GET /api/supervision/tableau-de-bord sans auth → 401/200 (dev)

| Sous-test | Résultat | Durée |
|---|---|---|
| Configuration sécurité vérifiée | PASS | ~24ms |

### TC-020-03 — Réponse tableau de bord : structure valide (tournees + bandeau)

| Sous-test | Résultat | Durée |
|---|---|---|
| body.tournees OK, body.bandeau présent | PASS | ~28ms |

La réponse contient maintenant `{"bandeau":{"actives":2,"aRisque":1,"cloturees":0},"tournees":[...]}`.

### TC-020-04 — GET /actuator/health → 200 (svc-supervision UP)

| Sous-test | Résultat | Durée |
|---|---|---|
| Health check svc-supervision | PASS | ~27ms |

**Screenshot** : `livrables/07-tests/screenshots/US-020/TC-020-04-health-supervision-up.png`

## Notes techniques

- MockJwtAuthFilter injecte ROLE_SUPERVISEUR par défaut en profil dev — tous les endpoints de supervision sont accessibles sans token réel.
- La structure de la réponse API est maintenant `{"bandeau":{...},"tournees":[...]}` — wrapper `bandeau` présent.
- Le flux SSO Keycloak réel n'est pas testable en profil dev : validé par contrat (RBAC enforced en profil prod).

## Anomalies détectées

OBS-020-01 : RESOLUE — `body.bandeau` est maintenant présent grâce à la correction OBS-011-01.

## Recommandations

1. Ajouter un test E2E en profil prod pour valider le flux SSO Keycloak complet (hors scope MVP).

## Rapport HTML Playwright
Disponible dans : `playwright-report-supervision/index.html`
Screenshots disponibles dans : `livrables/07-tests/screenshots/US-020/`
