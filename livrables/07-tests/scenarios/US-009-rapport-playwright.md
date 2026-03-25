# Rapport de tests — US-009 : Capturer une preuve alternative

**Agent** : @qa
**Date d'exécution** : 2026-03-25
**Version** : 1.0
**US** : US-009 — Capturer une preuve alternative (photo, tiers identifié, dépôt sécurisé)

## Synthèse globale

| Suite de tests | Outil | Tests | Résultat |
|---|---|---|---|
| Application — API /livraison (types alternatifs) | Playwright/chromium | 4/4 | PASS |
| E2E UI — Champs conditionnels TIERS_IDENTIFIE / DEPOT_SECURISE | Playwright/chromium | 2/2 | PASS |
| E2E UI — Bouton caméra PHOTO | Playwright/chromium | 1/1 | PASS |
| **TOTAL GÉNÉRAL** | | **7/7** | **PASS** |

**Verdict US-009** : Validée — Les 7 tests passent. Les 4 types de preuve sont correctement gérés par l'API et l'UI.

## Résultats détaillés par TC

### TC-280 — Sélection TIERS_IDENTIFIE → champ nomTiers affiché
| Sous-test | Résultat | Durée |
|---|---|---|
| getByTestId('champ-nom-tiers') visible après sélection | PASS | ~906ms |

### TC-281 — POST TIERS_IDENTIFIE avec nomTiers → HTTP 200
| Sous-test | Résultat | Durée |
|---|---|---|
| POST /livraison typePreuve=TIERS_IDENTIFIE + nomTiers | PASS | ~25ms |

### TC-282 — Invariant TIERS_IDENTIFIE sans nomTiers → HTTP 400
| Sous-test | Résultat | Durée |
|---|---|---|
| POST TIERS_IDENTIFIE sans nomTiers → 400/422 | PASS | ~20ms |

### TC-283 — Sélection DEPOT_SECURISE → champ description affiché
| Sous-test | Résultat | Durée |
|---|---|---|
| getByTestId('champ-description-depot') visible | PASS | ~935ms |

### TC-284 — POST DEPOT_SECURISE avec description → HTTP 200
| Sous-test | Résultat | Durée |
|---|---|---|
| POST /livraison typePreuve=DEPOT_SECURISE + descriptionDepot | PASS | ~29ms |

### TC-285 — POST PHOTO → HTTP 200
| Sous-test | Résultat | Durée |
|---|---|---|
| POST /livraison typePreuve=PHOTO + donneesPhoto (base64) | PASS | ~26ms |

### TC-286 — Bouton caméra PHOTO visible
| Sous-test | Résultat | Durée |
|---|---|---|
| getByTestId('bouton-ouvrir-camera') visible sur Expo Web | PASS | ~939ms |

## Notes techniques

- L'UI Expo Web rend correctement les champs conditionnels selon le type de preuve sélectionné.
- Les 4 types de preuve (SIGNATURE, PHOTO, TIERS_IDENTIFIE, DEPOT_SECURISE) sont tous validés côté API.
- Le DevDataSeeder fournit les colis A_LIVRER nécessaires aux tests API.

## Anomalies détectées

Aucune anomalie détectée.

## Recommandations

1. Ajouter un test de la caméra réelle (expo-camera) — non testable sur Expo Web, nécessite un device natif ou Detox.

## Rapport HTML Playwright
Disponible dans : `playwright-report/index.html`
Screenshots disponibles dans : `livrables/07-tests/screenshots/US-009/`
