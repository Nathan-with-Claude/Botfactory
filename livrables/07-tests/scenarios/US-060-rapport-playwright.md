# Rapport de tests — US-060 : Correction persist() manquant après sync()

**Agent** : @qa
**Date d'exécution** : 2026-04-05
**US** : US-060 — Corriger l'appel persist() manquant après sync() dans offlineQueue

---

## Synthèse globale

| Suite | Niveau | Outil | Tests | Résultat |
|-------|--------|-------|-------|----------|
| offlineQueue.test.ts — US-060 (5 tests) | L1 | Jest | 5/5 | PASS |
| offlineQueue.test.ts total (21 tests) | L1 | Jest | 21/21 | PASS |
| CapturePreuveScreen + useOfflineSync (non régression) | L1 | Jest | 60/60 | PASS |
| **TOTAL** | | | **60/60** | **PASS** |

**Verdict US-060** : Validée — Bug P0 corrigé. 5/5 nouveaux tests TDD. 60/60 tests verts sans régression. Le double envoi de commandes après redémarrage est éliminé.

---

## Résultats détaillés par TC

| TC | Description | Niveau | Résultat | Durée |
|----|-------------|--------|----------|-------|
| TC-060-01 | persist() après chaque dequeue réussi | L1 | PASS | 18ms |
| TC-060-02 | AsyncStorage vide après sync complète | L1 | PASS | 16ms |
| TC-060-03 | Sync partielle → commandes restantes préservées | L1 | PASS | 15ms |
| TC-060-04 | canCloseRoute() false après init avec commandes | L1 | PASS | 14ms |
| TC-060-05 | Pas de double envoi au redémarrage | L1 | PASS | 17ms |

---

## Notes techniques

- Fix dans `offlineQueue.ts` : `await persist()` appelé après chaque dequeue dans les 3 branches (succès, 409, erreur métier non récupérable). La branche `catch` (erreur réseau) ne persiste PAS intentionnellement — les commandes non traitées restent dans AsyncStorage pour le prochain redémarrage.
- OBS-AS-006 source du bug : identifié en session QA du 2026-04-04.
- L'idempotence backend (409) reste le filet de sécurité pour les cas exceptionnels (crash immédiat post-sync).

## Anomalies détectées

OBS-AS-006 : RÉSOLU par cette US.
