# Rapport de tests — US-017 : Synchronisation des événements vers l'OMS

**Agent** : @qa
**Date d'exécution initiale** : 2026-03-25
**Date re-run (post-correction OBS-017-01)** : 2026-03-25
**Version** : 2.0
**US** : US-017 — Synchroniser les événements de livraison vers le système OMS

## Synthèse globale

| Suite de tests | Outil | Tests | Résultat |
|---|---|---|---|
| Session 1 — Application /api/oms/evenements | Playwright/chromium | 4/5 | FAIL partiel |
| Session 2 (re-run post OBS-017-01) | Playwright/chromium+mobile | 10/10 | PASS |
| **TOTAL GÉNÉRAL (re-run)** | | **10/10** | **PASS** |

**Verdict US-017** : Validée — Toutes les 5 variantes de test passent sur les deux projets Playwright (chromium + chromium-mobile). La correction OBS-017-01 (retour DTO avec `modeDegradGPS`) est confirmée.

## Résultats détaillés par TC

### TC-017-01 — POST /api/oms/evenements → HTTP 201
| Sous-test | Résultat | Durée |
|---|---|---|
| Création événement OMS | PASS | ~115ms |

### TC-017-02 — Idempotence : POST avec même eventId → HTTP 409
| Sous-test | Résultat | Durée |
|---|---|---|
| Doublon rejeté (eventId unique) | PASS | ~66ms |

### TC-017-03 — GET /api/oms/evenements/colis/{id} → historique
| Sous-test | Résultat | Durée |
|---|---|---|
| Historique des événements d'un colis | PASS | ~65ms |

### TC-017-04 — GET /api/oms/evenements/tournee/{id} → historique tournée
| Sous-test | Résultat | Durée |
|---|---|---|
| Historique des événements d'une tournée | PASS | ~36ms |

### TC-017-05 — Mode dégradé GPS → modeDegradGPS=true dans le body
| Sous-test | Résultat | Durée |
|---|---|---|
| POST sans lat/long → body.modeDegradGPS=true | PASS | ~37ms |

Correction appliquée : le contrôleur `EvenementController` retourne désormais `ResponseEntity.status(201).body(dto)` avec le champ `modeDegradGPS=true` dans le DTO.

**Screenshot** : `livrables/07-tests/screenshots/US-017/TC-017-05-mode-degrade-gps-201.png`
**Screenshot** : `livrables/07-tests/screenshots/US-017/TC-017-03-oms-evenements-colis.png`

## Notes techniques

- svc-oms tourne sur port 8083 avec le DevDataSeeder BC-05.
- L'idempotence (eventId unique) fonctionne correctement.
- La correction OBS-017-01 a consisté à retourner le DTO créé dans la réponse 201 (`ResponseEntity<EvenementOmsDTO>`).
- Les tests tournent sur deux projets : chromium (desktop) et chromium-mobile — 5+5 = 10 tests au total.

## Anomalies détectées

OBS-017-01 : RESOLUE — Correction dev appliquée le 2026-03-25. Le body de la réponse 201 contient maintenant le DTO avec `modeDegradGPS=true`.

## Recommandations

1. Ajouter un test de non-régression sur la présence systématique du body dans les réponses 201 de svc-oms.

## Rapport HTML Playwright
Disponible dans : `playwright-report/index.html`
Screenshots disponibles dans : `livrables/07-tests/screenshots/US-017/`
