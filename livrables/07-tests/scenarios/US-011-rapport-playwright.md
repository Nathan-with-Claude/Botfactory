# Rapport de tests — US-011 : Tableau de bord de supervision

**Agent** : @qa
**Date d'exécution initiale** : 2026-03-25
**Date re-run (post-correction OBS-011-01)** : 2026-03-25
**Version** : 2.0
**US** : US-011 — Visualiser le tableau de bord des tournées en cours (superviseur)

## Synthèse globale

| Suite de tests | Outil | Tests | Résultat |
|---|---|---|---|
| Session 1 — GET /api/supervision/tableau-de-bord | Playwright/chromium | 3/5 | FAIL partiel |
| Session 2 (re-run post OBS-011-01) | Playwright/chromium | 4/5 | FAIL partiel |
| **TOTAL GÉNÉRAL (re-run)** | | **4/5** | **FAIL partiel** |

**Verdict US-011** : Partiellement validée — La correction OBS-011-01 a aligné la structure JSON (`body.bandeau` est maintenant présent). 4 tests sur 5 passent. Un test résiduel échoue (TC-011-04) car la spec attend `totalTournees` dans `bandeau` alors que l'API retourne `actives`.

## Résultats détaillés par TC

### TC-011-01 — GET /api/supervision/tableau-de-bord → HTTP 200 avec tournees

| Sous-test | Résultat | Durée |
|---|---|---|
| Endpoint accessible, HTTP 200, bandeau présent | PASS | ~114ms |

### TC-011-02 — GET ?statut=A_RISQUE filtre correctement

| Sous-test | Résultat | Durée |
|---|---|---|
| Toutes les tournées retournées sont A_RISQUE | PASS | ~39ms |

### TC-011-03 — GET ?statut=INVALIDE retourne HTTP 400

| Sous-test | Résultat | Durée |
|---|---|---|
| Validation statut invalide | PASS | ~32ms |

### TC-011-04 — Bandeau résumé contient les compteurs actives, aRisque, cloturees

| Sous-test | Résultat | Durée |
|---|---|---|
| body.bandeau.totalTournees présent | FAIL | ~32ms |

**Erreur** : `expect(body.bandeau).toHaveProperty('totalTournees')` — Le bandeau retourné est `{"actives":2,"aRisque":1,"cloturees":0}`. Le champ s'appelle `actives` et non `totalTournees`. La correction OBS-011-01 a bien introduit le wrapper `bandeau`, mais le nom du champ diffère de ce qu'attend la spec.

**Anomalie résiduelle OBS-011-02** : le champ comptant les tournées actives se nomme `actives` dans l'implémentation vs `totalTournees` attendu dans la spec TC-011-04. Les champs `aRisque` et `cloturees` sont corrects.

### TC-011-05 — DevDataSeeder : au moins une tournée EN_COURS

| Sous-test | Résultat | Durée |
|---|---|---|
| tournees EN_COURS ou A_RISQUE > 0 | PASS | ~111ms |

**Screenshot** : `livrables/07-tests/screenshots/US-011/TC-011-04-bandeau-structure-corrigee.png`

## Notes techniques

- La correction OBS-011-01 a bien encapsulé les compteurs dans un objet `bandeau`. La réponse réelle est maintenant `{"bandeau":{"actives":2,"aRisque":1,"cloturees":0},"tournees":[...]}`.
- Le champ `actives` correspond aux tournées en cours (EN_COURS + A_RISQUE). La spec l'appelait `totalTournees`.
- Le DevDataSeeder peuple correctement 2 tournées EN_COURS et 1 A_RISQUE.

## Anomalies détectées

OBS-011-01 : RESOLUE — Le wrapper `bandeau` est maintenant présent dans la réponse.

**OBS-011-02 (non bloquant)** : Le champ `actives` dans `bandeau` devrait s'appeler `totalTournees` selon la spec TC-011-04, ou la spec doit être mise à jour pour utiliser `actives`. Impact mineur : 1 test échoue sur le nom du champ.

## Recommandations

1. Renommer `actives` en `totalTournees` dans `TableauDeBordDTO.bandeau` ou mettre à jour la spec TC-011-04 pour tester `actives` à la place de `totalTournees`.
2. Ajouter un test sur `body.bandeau.actives >= 1` pour valider le compteur de tournées en cours.

## Rapport HTML Playwright
Disponible dans : `playwright-report-supervision/index.html`
Screenshots disponibles dans : `livrables/07-tests/screenshots/US-011/`
