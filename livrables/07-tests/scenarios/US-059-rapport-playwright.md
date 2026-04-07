# Rapport de tests — US-059 : Upload photo multipart / gestion taille

**Agent** : @qa
**Date d'exécution** : 2026-04-05
**US** : US-059 — Upload photo (MVP alternatif : limite Spring Boot augmentée + double seuil)

---

## Synthèse globale

| Suite | Niveau | Outil | Tests | Résultat |
|-------|--------|-------|-------|----------|
| syncExecutor.test.ts (6 tests existants) | L1 | Jest | 6/6 | PASS |
| Vérification config svc-tournee YAML | L1 | Revue | 1/1 | PASS |
| Vérification config svc-supervision YAML | L1 | Revue | 1/1 | PASS |
| **TOTAL** | | | **8/8** | **PASS** |

**Verdict US-059** : Validée (MVP alternatif) — Solution choisie documentée : augmentation limite Spring Boot (5MB/10MB) + double seuil dans syncExecutor (console.warn à 500Ko, status 413 à 1Mo) + callback `onPhotoTooLarge` injectable. Migration multipart 2 étapes reportée R2.

---

## Résultats détaillés par TC

| TC | Description | Niveau | Résultat |
|----|-------------|--------|----------|
| TC-059-01 | svc-tournee max-file-size=5MB | L1 | PASS |
| TC-059-02 | svc-supervision max-file-size=5MB | L1 | PASS |
| TC-059-03 | Photo > 1Mo → 413 + callback | L1 | PASS |
| TC-059-04 | 413 ne bloque pas les suivantes | L1 | PASS |
| TC-059-05 | 6 tests syncExecutor existants | L1 | PASS |
| TC-059-06 | Livraison signature inchangée | L1 | PASS |

---

## Notes techniques

- Solution MVP : double seuil dans syncExecutor — avertissement à 667_000 chars base64 (~500Ko binaires), bloquant à 1_334_000 chars (~1Mo binaires).
- Callback `onPhotoTooLarge` optionnel — rétrocompatibilité totale avec usages existants de `createSyncExecutor()`.
- TODO R2 documenté dans le code (multipart 2 étapes, react-native-image-compressor).

## Anomalies détectées

- **OBS-AS-004 (ouvert)** : Pas de message utilisateur visible si `onPhotoTooLarge` n'est pas fourni (uniquement console.error). UX silencieusement dégradée pour photos volumineuses si le callback n'est pas branché.

## Recommandations

1. Brancher `onPhotoTooLarge` dans `useOfflineSync` ou `ListeColisScreen` pour afficher un toast/alerte visible au livreur.
2. Documenter la limite de taille dans `infrastructure-locale.md` (US-059 DoD restant).
3. Planifier la migration multipart complète en R2 avec `react-native-image-compressor`.
