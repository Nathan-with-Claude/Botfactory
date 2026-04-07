# Rapport de tests — US-048 : Synchronisation données tournée supervision ↔ app mobile

**Agent** : @qa
**Date d'exécution** : 2026-04-05
**US** : US-048 — Synchronisation données tournée supervision ↔ app mobile livreur

---

## Synthèse globale

| Suite | Niveau | Outil | Tests | Résultat |
|-------|--------|-------|-------|----------|
| Vérification manuelle L2 (22 colis livreur-002) | L2 | curl | 1/1 | PASS |
| Idempotence DevEventBridge | L2 | curl | 1/1 | PASS |
| Message vide ListeColisScreen | L1 | Jest | 1/1 | PASS |
| Profil prod — DevEventBridge absent | L2 | @Profile(dev) review | — | PASS |
| livreur-005 dans picker | L1 | Jest | 1/1 | PASS |
| **TOTAL** | | | **5/5** | **PASS** |

**Note** : Les seeders sont des composants d'infrastructure de développement non testés unitairement par convention (pattern établi pour tous les seeders existants). La validation est manuelle (L2) + revue de code.

**Verdict US-048** : Validée — Cohérence svc-supervision ↔ svc-tournee confirmée (T-204 = 22 colis dans les deux services). Message "Aucune tournée" conforme pour livreur-005.

---

## Résultats détaillés par TC

| TC | Description | Niveau | Résultat |
|----|-------------|--------|----------|
| TC-048-01 | 22 colis pour livreur-002 dans svc-tournee | L2 | PASS |
| TC-048-02 | Idempotence DevEventBridge | L2 | PASS |
| TC-048-03 | Message "Aucune tournée" livreur-005 | L1 | PASS |
| TC-048-04 | Endpoint dev absent en prod | L2 (review) | PASS |
| TC-048-05 | livreur-005 dans picker dev | L1 | PASS |

---

## Notes techniques

- Résilience : si svc-tournee est éteint lors du démarrage de svc-supervision, `propaguerVersBC01` log WARN sans propager l'exception — le seed ne bloque pas.
- L'ordre de démarrage (svc-supervision avant ou après svc-tournee) est géré par idempotence dans les deux cas.
- Message modifié dans ListeColisScreen : "Aucune tournée n'a encore été commandée pour vous.\nVeuillez vous rapprocher de votre superviseur." — test Jest mis à jour en conséquence (US-049 correctif).

## Recommandations

1. Documenter dans `infrastructure-locale.md` l'ordre recommandé de démarrage (svc-tournee d'abord, puis svc-supervision) pour maximiser la propagation DevEventBridge.
