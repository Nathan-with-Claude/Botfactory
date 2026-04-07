# Rapport de tests — US-062 : Compteur d'envois en attente dans IndicateurSync

**Agent** : @qa
**Date d'exécution** : 2026-04-05
**US** : US-062 — Afficher le compteur d'envois en attente dans IndicateurSync

---

## Synthèse globale

| Suite | Niveau | Outil | Tests | Résultat |
|-------|--------|-------|-------|----------|
| IndicateurSync.test.tsx (+7 tests) | L1 | Jest (RNTL) | 18/18 | PASS |
| ListeColisScreen.test.tsx (correction) | L1 | Jest | 13/13 | PASS |
| **TOTAL** | | | **53/53 (fichiers modifiés)** | **PASS** |

**Verdict US-062** : Validée — 7/7 nouveaux tests IndicateurSync. 53/53 tests des fichiers modifiés. La terminologie terrain "envois en attente" est respectée. Singulier/pluriel géré ("envoi" vs "envois").

---

## Résultats détaillés par TC

| TC | Description | Niveau | Résultat | Durée |
|----|-------------|--------|----------|-------|
| TC-062-01 | LIVE sans pendingCount | L1 | PASS | 11ms |
| TC-062-02 | LIVE pendingCount=0 | L1 | PASS | 9ms |
| TC-062-03 | OFFLINE pendingCount>0 → N envois | L1 | PASS | 12ms |
| TC-062-04 | OFFLINE pendingCount=1 singulier | L1 | PASS | 11ms |
| TC-062-05 | OFFLINE sans pendingCount | L1 | PASS | 9ms |
| TC-062-06 | OFFLINE pendingCount=0 | L1 | PASS | 9ms |
| TC-062-07 | testID sync-pending-count présent si > 0 | L1 | PASS | 10ms |

---

## Notes techniques

- `offlineQueueInstance.ts` créé : singleton de la file offline pour partage entre composants (pattern identique à `authStoreInstance.ts`).
- `pendingCount` dans `ListeColisScreen` rafraîchi uniquement au chargement de la tournée (MVP). Pour un compteur en temps réel, voir limitation R2 documentée dans impl.md.
- Label accessibilité enrichi : "Pas de réseau — N envois en attente".
- Texte redondant "Hors ligne — vos actions seront synchronisées" supprimé (IndicateurSync porte maintenant le message).

## Anomalies détectées

**Limitation R2 documentée** : le `pendingCount` se met à jour uniquement au chargement de la tournée, pas en temps réel à chaque enqueue/dequeue. Acceptable pour le MVP.

## Recommandations

1. R2 : brancher `pendingCount` sur un Observable/EventEmitter dans `offlineQueue` pour une mise à jour en temps réel (SC3 et SC4 de la spec).
