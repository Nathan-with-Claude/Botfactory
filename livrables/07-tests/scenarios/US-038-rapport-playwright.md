# Rapport de tests — US-038 : Harmonisation des libellés UX

**Agent** : @qa
**Date d'exécution** : 2026-04-05
**US** : US-038 — Harmoniser les libellés de l'interface avec le langage naturel terrain

---

## Synthèse globale

| Suite | Niveau | Outil | Tests | Résultat |
|-------|--------|-------|-------|----------|
| US038.libelles.test.tsx (mobile) | L1 | Jest (RNTL) | 4/4 | PASS |
| MesConsignesScreen.test.tsx (descriptions) | L1 | Jest | 0 assertions modifiées | PASS |
| Validation web Node.js (fallback Babel bug) | L1 | Node.js | 3/3 checks | PASS |
| Suite mobile complète (non-régression) | L1 | Jest | 329/329 | PASS |
| **TOTAL** | | | **329/329 (+3 checks web)** | **PASS** |

**Note L3** : Non exécuté — les libellés sont validés en L1 (tests Jest RNTL + checks Node.js). L3 Playwright serait redondant pour des corrections purement visuelles.

**Note bug Babel web** : Les tests React Testing Library pour svc-supervision (web) ne s'exécutent pas en raison d'un bug Babel/TS pré-existant (identifié US-044). La validation web a été effectuée via checks Node.js (lecture du fichier TSX). Ce bug est antérieur à US-038.

**Verdict US-038** : Validée — Les 6 corrections de libellés sont confirmées. Aucun enum ni Domain Event modifié. 329/329 tests mobiles verts. Le placeholder "numéro de tournée" est conforme à l'Ubiquitous Language terrain.

---

## Résultats détaillés par TC

| TC | Description | Niveau | Résultat | Durée |
|----|-------------|--------|----------|-------|
| TC-038-01 | "Repassage" pour A_REPRESENTER dans M-02 | L1 | PASS | 11ms |
| TC-038-02 | Badge "Traitée" pour EXECUTEE dans M-07 | L1 | PASS | 9ms |
| TC-038-03 | Bouton action "Traitée" dans M-07 | L1 | PASS | 8ms |
| TC-038-04 | "Chargement trop lourd" dans W-05 | L1 (Node.js) | PASS | 5ms |
| TC-038-05 | "Télécharger la liste" + btn-telecharger-liste | L1 (Node.js) | PASS | 5ms |
| TC-038-06 | Placeholder "numéro de tournée" dans W-01 | L1 (Node.js) | PASS | 4ms |
| TC-038-07 | StatutInstruction.EXECUTEE inchangé | L1 | PASS | — |
| TC-038-08 | Non-régression recherche TMS US-035 | L1 | PASS | 11ms |

---

## Notes techniques

- Corrections purement visuelles — aucun enum, aucun Domain Event, aucune API modifiée.
- Bug Babel/TS sur svc-supervision web pré-existant : résoudre ce bug permettrait d'exécuter les tests React Testing Library web (DetailTourneePlanifieePage, TableauDeBordPage). TODO pour @developpeur.
- OBS-SUP-003 (résolu) : le placeholder "numéro de tournée" remplace bien l'ancien "code TMS".

## Anomalies détectées

- **Bug Babel/TS (non bloquant)** : tests React Testing Library web non exécutables. Workaround : validation via Node.js. Impact : faible (corrections visuelles sans logique complexe).

## Recommandations

1. Résoudre le bug Babel/TS de svc-supervision (pré-existant depuis US-044) pour rétablir l'exécutabilité des tests React Testing Library web.
2. Ajouter "Traitée" et "Repassage" dans le glossaire Ubiquitous Language (`domain-model.md`) comme synonymes d'affichage.
