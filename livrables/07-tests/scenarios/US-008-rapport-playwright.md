# Rapport de tests — US-008 : Capturer la signature numérique

**Agent** : @qa
**Date d'exécution** : 2026-03-25
**Version** : 1.0
**US** : US-008 — Capturer la signature numérique du destinataire

## Synthèse globale

| Suite de tests | Outil | Tests | Résultat |
|---|---|---|---|
| Application — API /livraison (SIGNATURE) | Playwright/chromium | 4/4 | PASS |
| E2E UI — Navigation M-03 → M-04 | Playwright/chromium | 0/1 | FAIL |
| E2E UI — Pad signature et bouton CONFIRMER | Playwright/chromium | 2/2 | PASS |
| **TOTAL GÉNÉRAL** | | **6/7** | **FAIL partiel** |

**Verdict US-008** : Partiellement validée — 6 tests sur 7 passent. 1 échec E2E UI sur la navigation vers M-04 (testID `liste-colis-screen` absent au chargement initial).

## Résultats détaillés par TC

### TC-272 — Confirmation livraison SIGNATURE → HTTP 200
| Sous-test | Résultat | Durée |
|---|---|---|
| POST /livraison typePreuve=SIGNATURE | PASS | ~67ms |

### TC-273 — Signature vide → HTTP 400
| Sous-test | Résultat | Durée |
|---|---|---|
| POST /livraison donneesSignature="" → 400 | PASS | ~28ms |

### TC-274 — Colis déjà LIVRE → HTTP 409
| Sous-test | Résultat | Durée |
|---|---|---|
| POST /livraison sur colis LIVRE → 409 | PASS | ~26ms |

### TC-275 — GPS dégradé → modeDegradeGps=true
| Sous-test | Résultat | Durée |
|---|---|---|
| POST /livraison sans coordonneesGps | PASS | ~20ms |

### TC-270 — Navigation M-03 → M-04 (CapturePreuveScreen)
| Sous-test | Résultat | Durée |
|---|---|---|
| getByTestId('liste-colis-screen') visible | FAIL | ~5.8s |

**Erreur** : `Expected: visible — Locator: getByTestId('liste-colis-screen') — element(s) not found` — L'écran de démarrage Expo Web affiche un écran de chargement avant la liste de colis. Le testID `liste-colis-screen` n'est pas encore rendu.

### TC-271 / TC-276 — Pad signature visible et bouton CONFIRMER désactivé (UI)
| Sous-test | Résultat | Durée |
|---|---|---|
| Détection pad-signature dans le DOM | PASS | ~1.7s |
| Bouton CONFIRMER désactivé si pad vide | PASS | ~977ms |

**Screenshot** : `livrables/07-tests/screenshots/US-008/TC-270-liste-colis-avant-livraison.png` (screenshot on failure)

## Notes techniques

- L'échec TC-270 est lié au temps de chargement d'Expo Web : le SplashScreen masque l'écran `liste-colis-screen`. Augmenter le timeout ou attendre un élément de l'écran de démarrage résoudrait le problème.
- Les tests API (TC-272 à TC-275) contre svc-tournee (port 8081) fonctionnent parfaitement avec le profil dev et le DevDataSeeder.

## Anomalies détectées

**OBS-008-01 (non bloquant)** : Le testID `liste-colis-screen` n'est pas disponible immédiatement au démarrage Expo Web — le SplashScreen est affiché pendant ~3-4s. Impact : le test E2E de navigation ne peut pas démarrer directement sur la liste de colis.

## Recommandations

1. Ajouter un `waitForURL` ou attendre la disparition du SplashScreen avant de chercher `liste-colis-screen`.
2. Vérifier que le timeout de 5000ms est suffisant après le premier chargement (peut-être augmenter à 15000ms pour Expo Web).

## Rapport HTML Playwright
Disponible dans : `playwright-report/index.html`
Screenshots disponibles dans : `livrables/07-tests/screenshots/US-008/`
