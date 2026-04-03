# Scénarios de tests US-041 — Poids estimé et alerte surcharge dans le tableau de préparation

**Agent** : @qa
**Date de création** : 2026-04-03
**Dernière exécution** : 2026-04-03

---

## Synthèse d'exécution

| Suite | Niveau | Outil | Tests | Résultat |
|---|---|---|---|---|
| PreparationPage.US041.test.tsx | L1 | Jest (React) | 14/14 | PASS |
| **TOTAL** | | | **14/14** | **PASS** |

**Verdict US-041** : Validée — 14/14 tests verts, invariants de seuil confirmés.

---

### TC-041-01 : Colonne "Poids" visible dans l'entête + valeur en kg (SC1)

**US liée** : US-041
**Niveau** : L1
**Couche testée** : UI / Application
**Aggregate / Domain Event ciblé** : TourneePlanifiee (lecture) — aucun event
**Type** : Fonctionnel
**Préconditions** : `PreparationPage` montée avec une tournée ayant `poidsEstimeKg: 120`
**Étapes** :
1. Afficher `PreparationPage` avec une tournée
2. Vérifier la présence de `colonne-poids-entete`
3. Vérifier la présence de la cellule `poids-{id}` avec la valeur en kg
**Résultat attendu** : Entête "Poids" visible, cellule affiche "120 kg"
**Statut** : Passé

```gherkin
Given une tournée planifiée avec un poids estimé de 120 kg
When le superviseur consulte le tableau de préparation W-04
Then la colonne "Poids" est visible et affiche "120 kg" pour cette tournée
```

---

### TC-041-02 : Alerte CRITIQUE si poids > capacité véhicule (SC2)

**US liée** : US-041
**Niveau** : L1
**Couche testée** : Domain (fonction pure) + UI
**Aggregate / Domain Event ciblé** : Vehicule / calculerNiveauAlerte
**Type** : Invariant domaine
**Préconditions** : Tournée avec `poidsEstimeKg: 1010, capaciteVehiculeKg: 1000`
**Étapes** :
1. Appeler `calculerNiveauAlerte(1010, 1000)`
2. Vérifier retour `'CRITIQUE'`
3. Vérifier affichage de l'icône `data-niveau="CRITIQUE"` dans la page
**Résultat attendu** : `calculerNiveauAlerte` retourne `CRITIQUE`, icône rouge affichée
**Statut** : Passé

```gherkin
Given une tournée dont le poids estimé dépasse la capacité du véhicule
When le superviseur consulte W-04
Then une icône rouge (CRITIQUE) est affichée avec tooltip "Chargement trop lourd"
```

---

### TC-041-03 : Alerte APPROCHE si poids >= 95% de la capacité (SC3)

**US liée** : US-041
**Niveau** : L1
**Couche testée** : Domain (fonction pure) + UI
**Aggregate / Domain Event ciblé** : Vehicule / calculerNiveauAlerte
**Type** : Invariant domaine
**Préconditions** : Tournée avec `poidsEstimeKg: 950, capaciteVehiculeKg: 1000`
**Étapes** :
1. Appeler `calculerNiveauAlerte(950, 1000)` — 95% exact
2. Vérifier retour `'APPROCHE'`
3. Vérifier affichage de l'icône `data-niveau="APPROCHE"` dans la page
**Résultat attendu** : `calculerNiveauAlerte` retourne `APPROCHE`, icône orange affichée
**Statut** : Passé

```gherkin
Given une tournée dont le poids atteint 95% de la capacité du véhicule
When le superviseur consulte W-04
Then une icône orange (APPROCHE) est affichée avec tooltip "Charge élevée"
```

---

### TC-041-04 : Aucune alerte si charge normale (< 95%) (SC4)

**US liée** : US-041
**Niveau** : L1
**Couche testée** : Domain (fonction pure) + UI
**Aggregate / Domain Event ciblé** : Vehicule / calculerNiveauAlerte
**Type** : Invariant domaine
**Préconditions** : Tournée avec `poidsEstimeKg: 800, capaciteVehiculeKg: 1000`
**Étapes** :
1. Appeler `calculerNiveauAlerte(800, 1000)` — 80%
2. Vérifier retour `'AUCUNE'`
3. Vérifier absence d'icône d'alerte dans la page
**Résultat attendu** : Aucune icône d'alerte affichée
**Statut** : Passé

```gherkin
Given une tournée dont le poids est inférieur à 95% de la capacité
When le superviseur consulte W-04
Then aucune icône d'alerte n'est affichée
```

---

### TC-041-05 : Aucune alerte si véhicule non affecté (SC5)

**US liée** : US-041
**Niveau** : L1
**Couche testée** : Domain (fonction pure) + UI
**Aggregate / Domain Event ciblé** : Vehicule / calculerNiveauAlerte
**Type** : Edge case
**Préconditions** : Tournée avec `poidsEstimeKg: 1200, capaciteVehiculeKg: undefined`
**Étapes** :
1. Appeler `calculerNiveauAlerte(1200, undefined)`
2. Vérifier retour `'AUCUNE'`
3. Vérifier absence d'icône d'alerte dans la page
**Résultat attendu** : Aucune alerte même si poids élevé — véhicule inconnu
**Statut** : Passé

```gherkin
Given une tournée sans véhicule affecté
When le superviseur consulte W-04
Then aucune icône d'alerte n'est affichée même si le poids estimé est élevé
```

---

### TC-041-06 : Cas limites calculerNiveauAlerte (8 valeurs) (fonctions pures)

**US liée** : US-041
**Niveau** : L1
**Couche testée** : Domain (fonction pure)
**Aggregate / Domain Event ciblé** : calculerNiveauAlerte
**Type** : Invariant domaine / Edge case
**Préconditions** : Diverses combinaisons de poids/capacité
**Étapes** :
1. `calculerNiveauAlerte(0, 1000)` → `AUCUNE`
2. `calculerNiveauAlerte(null, 1000)` → `AUCUNE`
3. `calculerNiveauAlerte(950, 1000)` → `APPROCHE` (95% exact)
4. `calculerNiveauAlerte(949, 1000)` → `AUCUNE` (< 95%)
5. `calculerNiveauAlerte(1000, 1000)` → `AUCUNE` (100% exact = pas encore dépassé)
6. `calculerNiveauAlerte(1001, 1000)` → `CRITIQUE`
7. `calculerNiveauAlerte(999, 1000)` → `APPROCHE`
8. `calculerNiveauAlerte(1010, 1000)` → `CRITIQUE`
**Résultat attendu** : Chaque appel retourne le niveau correct
**Statut** : Passé

```gherkin
Given différentes combinaisons de poids et capacité
When calculerNiveauAlerte est appelée pour chaque combinaison
Then le niveau retourné respecte les seuils définis (95% APPROCHE, >100% CRITIQUE)
```
