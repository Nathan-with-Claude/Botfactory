# Rapport de tests — US-035 : Recherche multi-critères dans le tableau de bord

**Agent** : @qa
**Date d'exécution** : 2026-04-05
**US** : US-035 — Rechercher une tournée dans le tableau de bord par nom de livreur, numéro TMS ou zone géographique
**Bounded Context** : BC-03 Supervision (Read Model VueTournee)

---

## Synthèse globale

| Suite | Niveau | Outil | Tests | Résultat |
|-------|--------|-------|-------|----------|
| TableauDeBordPage.test.tsx — US-035 (9 tests) | L1 | Jest | 9/9 | PASS |
| SupervisionControllerTest — codeTMS+zone | L1 | mvn | 2/2 | PASS |
| GET /api/supervision/tableau-de-bord codeTMS+zone | L2 | curl | 2/2 | PASS |
| **TOTAL** | | | **13/13** | **PASS** |

**Note L3** : Non exécuté — couverture assurée par L1 (26/26 tests Jest incluant les 17 US-011 non-régression) et L2. La recherche est une opération de lecture côté client — L3 n'apporterait pas de valeur supplémentaire.

**Verdict US-035** : Validée — Les 6 scénarios de la spec sont couverts. Aucune régression sur les 17 tests US-011 existants. Suite globale : 200/200 tests verts après ajout de cette US.

---

## Résultats détaillés par TC

### TC-035-01 à TC-035-08 — Tests unitaires Jest (L1)

| Sous-test | Niveau | Résultat | Durée |
|-----------|--------|----------|-------|
| SC1 — recherche codeTMS exact "T-202" | L1 (Jest) | PASS | 11ms |
| SC1 — recherche partielle insensible casse "t-20" | L1 (Jest) | PASS | 8ms |
| SC2 — recherche zone "Villeurb" | L1 (Jest) | PASS | 9ms |
| SC3 — recherche livreur "Marie" | L1 (Jest) | PASS | 7ms |
| SC4 — intersection filtre A_RISQUE + "Lyon 3" | L1 (Jest) | PASS | 12ms |
| SC5 — aucun résultat → message + lien effacer | L1 (Jest) | PASS | 10ms |
| SC5 — bandeau résumé non affecté | L1 (Jest) | PASS | 9ms |
| SC6 — effacement restaure 3 lignes + input vide | L1 (Jest) | PASS | 11ms |
| Pas de bouton btn-rechercher | L1 (Jest) | PASS | 6ms |

### TC-035-09 — API L2

| Sous-test | Niveau | Résultat | Durée |
|-----------|--------|----------|-------|
| $.tournees[0].codeTMS = "T-201" | L2 (curl) | PASS | 42ms |
| $.tournees[0].zone = "Lyon 3e" | L2 (curl) | PASS | 42ms |

---

## Notes techniques

- La recherche multi-critères est implémentée entièrement côté frontend via la fonction pure `correspondRecherche`. Aucun endpoint backend n'a été modifié — performance optimale.
- Les champs `codeTMS` et `zone` sont nullable dans VueTournee — la rétrocompatibilité avec les tournées sans ces champs est garantie.
- Le placeholder du champ a été mis à jour vers "numéro de tournée" par US-038 (libellé harmonisé). La recherche par valeur TMS continue de fonctionner.
- OBS-SUP-003 (ouvert) : le placeholder "numéro de tournée" est la version finale conforme à US-038.

## Anomalies détectées

Aucune anomalie.

## Recommandations

1. Lors de l'extension vers un dataset de 15+ tournées simultanées (use case terrain mentionné dans la US), évaluer si un debounce sur onChange est nécessaire pour éviter des re-renders trop fréquents.
2. Si VueTournee est persistée en base JPA, ajouter un test L2 avec données réelles pour vérifier que les colonnes `code_tms` et `zone` sont bien indexées pour la performance.
