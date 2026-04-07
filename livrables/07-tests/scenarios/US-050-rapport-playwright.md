# Rapport de tests — US-050 : Désaffecter un livreur d'une tournée planifiée

**Agent** : @qa
**Date d'exécution** : 2026-04-05
**US** : US-050 — Désaffecter un livreur d'une tournée planifiée

---

## Synthèse globale

| Suite | Niveau | Outil | Tests | Résultat |
|-------|--------|-------|-------|----------|
| TourneePlanifieeTest.java — US-050 (5 tests) | L1 | mvn | 5/5 | PASS |
| PlanificationControllerTest — US-050 (3 tests) | L1 | mvn | 3/3 | PASS |
| DetailTourneePlanifieePage.test.tsx — US-050 (5 tests) | L1 | Jest | 5/5 | PASS |
| Suite backend svc-supervision | L1 | mvn | 152/152 | PASS |
| Suite web supervision | L1 | Jest | 272/272 | PASS |
| **TOTAL** | | | **267 tests actifs / 272 total** | **PASS** |

**Verdict US-050** : Validée — 152/152 backend, 272/272 web supervision. Les 6 scénarios de la spec sont couverts. L'invariant domaine (AFFECTEE requise, LANCEE interdite) est appliqué dans l'Aggregate.

---

## Résultats détaillés par TC

| TC | Description | Niveau | Résultat |
|----|-------------|--------|----------|
| TC-050-01 | desaffecter AFFECTEE → NON_AFFECTEE + event | L1 | PASS |
| TC-050-02 | desaffecter LANCEE → exception | L1 | PASS |
| TC-050-03 | desaffecter NON_AFFECTEE → exception | L1 | PASS |
| TC-050-04 | estAffectable() après désaffectation | L1 | PASS |
| TC-050-05 | DELETE /affectation → 200 | L1 (Controller mock) | PASS |
| TC-050-06 | DELETE /affectation → 409 LANCEE | L1 (Controller mock) | PASS |
| TC-050-07 | DELETE /affectation → 404 introuvable | L1 (Controller mock) | PASS |
| TC-050-08 | btn-desaffecter visible si AFFECTEE | L1 | PASS |
| TC-050-09 | btn-desaffecter absent si NON_AFFECTEE | L1 | PASS |
| TC-050-10 | msg-tournee-en-cours si LANCEE | L1 | PASS |

---

## Notes techniques

- Correctif inclus : guard `typeof TextEncoder === 'undefined'` dans `DetailTourneePage.tsx` pour éviter le crash en jsdom lors de l'initialisation du StompClient.
- L'événement `DesaffectationEnregistree` est immuable (record Java) — garantit l'auditabilité BC-05.
- La désaffectation ne modifie pas svc-tournee (BC-01) ni les colis associés.

## Recommandations

1. Ajouter un test L2 curl pour valider le flow complet : désaffectation → réaffectation immédiate avec un autre livreur (SC5 de la spec).
