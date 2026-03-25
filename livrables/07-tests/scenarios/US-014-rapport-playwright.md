# Rapport de tests — US-014 : Envoyer une instruction à un livreur

**Agent** : @qa
**Date d'exécution initiale** : 2026-03-25
**Date re-run (vérification HTTP 400 vs 422)** : 2026-03-25
**Version** : 2.0
**US** : US-014 — Envoyer une instruction à un livreur en cours de tournée

## Synthèse globale

| Suite de tests | Outil | Tests | Résultat |
|---|---|---|---|
| Session 1 — POST /api/supervision/instructions | Playwright/chromium | 4/5 | FAIL partiel |
| Session 2 (re-run vérification 400 vs 422) | Playwright/chromium | 4/5 | FAIL partiel |
| **TOTAL GÉNÉRAL (re-run)** | | **4/5** | **FAIL partiel** |

**Verdict US-014** : Partiellement validée — L'anomalie OBS-014-01 (400 vs 422) n'a pas été corrigée côté dev dans cette session. TC-014-02 échoue toujours : l'API retourne HTTP 409 (instruction déjà existante) plutôt que 400/422 lors de l'exécution séquentielle après TC-014-01.

## Résultats détaillés par TC

### TC-014-01 — POST /api/supervision/instructions PRIORISER → 201

| Sous-test | Résultat | Durée |
|---|---|---|
| Création instruction PRIORISER | PASS | ~155ms |

### TC-014-02 — POST REPROGRAMMER sans créneau → 422

| Sous-test | Résultat | Durée |
|---|---|---|
| Invariant REPROGRAMMER sans creneauCible | FAIL | ~37ms |

**Erreur** : Le test reçoit HTTP 409 au lieu de 400/422/403. Cause : TC-014-01 a créé une instruction ENVOYEE pour `colis-s-003` — quand TC-014-02 tente de créer une instruction REPROGRAMMER sur le même colis, l'invariant "un seul PENDING par colis" déclenche un 409 avant la validation du corps de la requête. L'erreur de validation 422 n'est donc jamais atteinte.

**Note** : Ce comportement est correct métier (le 409 précède logiquement le 422), mais l'ordre d'exécution des tests crée une fausse impression d'échec. Il s'agit d'un problème d'isolation de données de test plutôt que d'une anomalie fonctionnelle.

### TC-014-03 — POST REPROGRAMMER avec créneau → 201

| Sous-test | Résultat | Durée |
|---|---|---|
| Création instruction REPROGRAMMER avec creneauCible | PASS | ~102ms |

### TC-014-04 — Double instruction en attente → 409

| Sous-test | Résultat | Durée |
|---|---|---|
| Invariant : un seul PENDING par colis | PASS | ~49ms |

### TC-014-05 — GET /api/supervision/instructions/tournee/{id} → liste

| Sous-test | Résultat | Durée |
|---|---|---|
| Liste des instructions par tournée | PASS | ~117ms |

**Screenshot** : `livrables/07-tests/screenshots/US-014/TC-014-01-instruction-prioriser-201.png`

## Notes techniques

- L'invariant "un seul PENDING par colis" fonctionne correctement et est enforced avant la validation du corps de la requête — c'est le comportement métier attendu.
- Le code HTTP 400 vs 422 pour les erreurs de validation reste inchangé : l'API retourne 400 pour les entrées invalides. RFC 7231 accepte les deux, 422 étant préféré pour les erreurs sémantiques (non syntaxiques).
- Le problème de TC-014-02 est un problème d'isolation entre tests, non une régression fonctionnelle.

## Anomalies détectées

**OBS-014-01 (non bloquant)** : TC-014-02 est affecté par l'ordre d'exécution des tests — le 409 "une instruction déjà en attente" déclenche avant que la validation 422 soit atteinte. La spec devrait utiliser un `colisId` distinct pour TC-014-02 afin d'isoler la validation du corps de la règle métier d'unicité.

**OBS-014-02 (non bloquant)** : L'API retourne HTTP 400 pour REPROGRAMMER sans créneau (sur un colis vierge de toute instruction). La spec attendait 422. Correction recommandée : mettre à jour la spec pour accepter `[400, 422, 403]`.

## Recommandations

1. Utiliser un `colisId` distinct dans TC-014-02 (ex. `colis-s-reprogrammer-test`) pour ne pas être bloqué par l'invariant d'unicité déclenché par TC-014-01.
2. Mettre à jour la spec TC-014-02 pour accepter `[400, 422, 403]` — les deux codes sont sémantiquement valides.

## Rapport HTML Playwright
Disponible dans : `playwright-report-supervision/index.html`
Screenshots disponibles dans : `livrables/07-tests/screenshots/US-014/`
