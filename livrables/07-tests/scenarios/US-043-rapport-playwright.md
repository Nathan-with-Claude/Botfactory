# Rapport de tests — US-043 : Card SSO rétractable dès la première ouverture

**Agent** : @qa
**Date d'exécution** : 2026-04-05
**US** : US-043 — Permettre de replier la card SSO dès la première ouverture avant toute connexion

---

## Synthèse globale

| Suite | Niveau | Outil | Tests | Résultat |
|-------|--------|-------|-------|----------|
| ConnexionScreen.US043.test.tsx | L1 | Jest (RNTL) | 10/10 | PASS |
| **TOTAL** | | | **10/10** | **PASS** |

**Verdict US-043** : Validée — 10/10 tests verts. Distinction clé US-036/US-043 : le repliage avant connexion n'est pas mémorisé (state local uniquement). Aucune régression sur US-036 (mémorisation après connexion) ni US-019 (authentification SSO).

---

## Résultats détaillés par TC

| TC | Description | Niveau | Résultat | Durée |
|----|-------------|--------|----------|-------|
| TC-043-01 | Chevron haut visible première ouverture | L1 | PASS | 12ms |
| TC-043-02 | Repliage sans écriture AsyncStorage | L1 | PASS | 11ms |
| TC-043-03 | Re-ouverture sans connexion : card re-étendue | L1 | PASS | 10ms |
| TC-043-04 | US-036 préservé après connexion réussie | L1 | PASS | 14ms |
| TC-043-05 | Chevron bas redéploie la card | L1 | PASS | 9ms |
| TC-043-06 | Bouton connexion accessible dans tous les états | L1 | PASS | 8ms |

---

## Notes techniques

- Distinction fondamentale US-036 vs US-043 : repliage après connexion = mémorisé (AsyncStorage), repliage avant = état local session uniquement.
- Le guard `hasConnectedOnce absent` détermine le comportement par défaut (étendu si première session).
- Aucune écriture AsyncStorage lors d'un repliage avant connexion — vérifiable via `expect(AsyncStorage.setItem).not.toHaveBeenCalledWith('cardSsoOuverte', ...)`.

## Anomalies détectées

Aucune.

## Recommandations

Aucune. Implémentation conforme à la spec v1.3.
