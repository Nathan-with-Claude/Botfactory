# Rapport de tests — US-058 : CORS + sécurité endpoint interne

**Agent** : @qa
**Date d'exécution** : 2026-04-05
**US** : US-058 — Restreindre CORS et sécuriser l'endpoint interne en production

---

## Synthèse globale

| Suite | Niveau | Outil | Tests | Résultat |
|-------|--------|-------|-------|----------|
| InternalSecretFilterTest (7 tests) | L1 | mvn | 7/7 | PASS |
| Suite svc-supervision complète (165 tests) | L1 | mvn | 165/165 | PASS |
| **TOTAL** | | | **165/165** | **PASS** |

**Verdict US-058** : Validée — 7/7 tests InternalSecretFilter. CORS externalisé via `app.cors.allowed-origins`. Endpoint interne protégé par header `X-Internal-Secret` en prod. DevEventBridge inchangé en dev.

---

## Résultats détaillés par TC

| TC | Description | Niveau | Résultat | Durée |
|----|-------------|--------|----------|-------|
| TC-058-01 | Filtre transparent hors /internal/** | L1 | PASS | 18ms |
| TC-058-02 | Secret DEV bypass | L1 | PASS | 15ms |
| TC-058-03 | Secret vide bypass | L1 | PASS | 14ms |
| TC-058-04 | Prod + header correct → 200 | L1 | PASS | 16ms |
| TC-058-05 | Prod + header absent → 403 | L1 | PASS | 15ms |
| TC-058-06 | Prod + header incorrect → 403 | L1 | PASS | 15ms |
| TC-058-07 | Corps JSON erreur 403 | L1 | PASS | 14ms |

---

## Notes techniques

- CORS externalisé : `@Value("${app.cors.allowed-origins:*}")`. En dev : wildcard, credentials désactivés. En prod : origines explicites, credentials activés.
- Le bypass pour secret `isBlank()` a été ajouté lors de cette session (correction par rapport à la spec "Si la propriété est vide → bypass").
- Aucune modification du write model ni du domain.

## Anomalies détectées

- OBS (résolu) : le bypass pour secret vide (`isBlank()`) manquait dans la version initiale — corrigé dans cette session.

## Recommandations

1. Documenter dans `infrastructure-locale.md` les variables `ALLOWED_ORIGINS` et `INTERNAL_SECRET` pour le profil prod.
2. Ajouter un test L2 curl avec profil prod simulé (INTERNAL_SECRET injecté) pour valider le comportement de production sans déployer.
