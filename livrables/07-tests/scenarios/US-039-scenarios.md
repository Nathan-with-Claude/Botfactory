# Scénarios de tests US-039 — Télécharger le bilan CSV des tournées du jour

**Agent** : @qa
**Date de création** : 2026-04-03
**Dernière exécution** : 2026-04-03

---

## Synthèse d'exécution

| Suite | Niveau | Outil | Tests | Résultat |
|---|---|---|---|---|
| TableauDeBordPage.US039.test.tsx | L1 | Jest (React) | 13/13 | PASS |
| **TOTAL** | | | **13/13** | **PASS** |

**Verdict US-039** : Validée — 13/13 tests verts, aucune régression détectée.

---

### TC-039-01 : Bouton "Télécharger le bilan du jour" visible si au moins une tournée

**US liée** : US-039
**Niveau** : L1
**Couche testée** : UI / Application
**Aggregate / Domain Event ciblé** : VueTournee (Read Model) — aucun event
**Type** : Fonctionnel
**Préconditions** : Au moins une tournée du jour dans le tableau de bord
**Étapes** :
1. Afficher `TableauDeBordPage` avec une tournée dans `tableau.tournees`
2. Observer la présence du bouton `btn-telecharger-bilan`
**Résultat attendu** : Bouton avec `data-testid="btn-telecharger-bilan"` visible
**Statut** : Passé

```gherkin
Given le tableau de bord contient au moins une tournée du jour
When le superviseur consulte la page W-01
Then le bouton "Télécharger le bilan du jour" est visible
```

---

### TC-039-02 : Bouton absent si aucune tournée du jour

**US liée** : US-039
**Niveau** : L1
**Couche testée** : UI / Application
**Aggregate / Domain Event ciblé** : VueTournee (Read Model)
**Type** : Invariant domaine (SC4)
**Préconditions** : `tableau.tournees` est vide
**Étapes** :
1. Afficher `TableauDeBordPage` avec une liste de tournées vide
2. Observer l'absence du bouton
**Résultat attendu** : Aucun élément `btn-telecharger-bilan` dans le DOM
**Statut** : Passé

```gherkin
Given aucune tournée n'est enregistrée pour le jour courant
When le superviseur ouvre le tableau de bord
Then le bouton "Télécharger le bilan du jour" est absent
```

---

### TC-039-03 : Clic sur le bouton déclenche le callback onExporterBilan

**US liée** : US-039
**Niveau** : L1
**Couche testée** : UI / Application
**Aggregate / Domain Event ciblé** : VueTournee (Read Model)
**Type** : Fonctionnel (SC2)
**Préconditions** : Au moins une tournée, callback `onExporterBilan` injectable
**Étapes** :
1. Monter le composant avec un spy sur `onExporterBilan`
2. Cliquer sur `btn-telecharger-bilan`
**Résultat attendu** : `onExporterBilan` appelé exactement une fois
**Statut** : Passé

```gherkin
Given le tableau de bord affiche des tournées
When le superviseur clique sur "Télécharger le bilan du jour"
Then le callback onExporterBilan est déclenché
```

---

### TC-039-04 : Coexistence avec btn-exporter-bilan (US-028/US-011)

**US liée** : US-039
**Niveau** : L1
**Couche testée** : UI
**Aggregate / Domain Event ciblé** : aucun
**Type** : Non régression (SC5)
**Préconditions** : Tableau de bord avec tournées, bouton US-028 présent
**Étapes** :
1. Afficher la page avec tournées
2. Vérifier la présence des deux boutons simultanément
**Résultat attendu** : `btn-telecharger-bilan` ET `btn-exporter-bilan` tous deux présents sans conflit
**Statut** : Passé

```gherkin
Given la page tableau de bord affiche des tournées
When le superviseur observe les boutons d'export
Then le bouton US-039 et le bouton US-028 coexistent sans conflit visuel
```

---

### TC-039-05 : genererCSVBilanTournees — entête et BOM UTF-8

**US liée** : US-039
**Niveau** : L1
**Couche testée** : Domain (fonction pure)
**Aggregate / Domain Event ciblé** : aucun
**Type** : Invariant domaine
**Préconditions** : Fonction `genererCSVBilanTournees` importée depuis `exporterCSVBilan.ts`
**Étapes** :
1. Appeler `genererCSVBilanTournees([])` (liste vide)
2. Appeler avec une liste de tournées
3. Vérifier le BOM UTF-8 (`\uFEFF`) et les 6 colonnes en entête
**Résultat attendu** : BOM présent, entête `#Tournee,Livreur,NbColis,NbLivres,NbEchecs,StatutFinal`, CRLF
**Statut** : Passé

```gherkin
Given une liste de tournées avec données
When genererCSVBilanTournees est appelée
Then le CSV contient le BOM UTF-8, l'entête avec 6 colonnes, et utilise CRLF
```

---

### TC-039-06 : Escaping des valeurs avec virgule dans le CSV

**US liée** : US-039
**Niveau** : L1
**Couche testée** : Domain (fonction pure)
**Aggregate / Domain Event ciblé** : aucun
**Type** : Edge case
**Préconditions** : Tournée dont le libellé contient une virgule
**Étapes** :
1. Appeler `genererCSVBilanTournees` avec une tournée dont le champ contient une virgule
2. Vérifier que la valeur est entourée de guillemets doubles
**Résultat attendu** : La valeur avec virgule est encadrée par `"`
**Statut** : Passé

```gherkin
Given une tournée dont un champ contient une virgule
When le CSV est généré
Then la valeur avec virgule est protégée par des guillemets doubles
```

---

### TC-039-07 : construireNomFichierBilan — format AAAA-MM-JJ

**US liée** : US-039
**Niveau** : L1
**Couche testée** : Domain (fonction pure)
**Aggregate / Domain Event ciblé** : aucun
**Type** : Fonctionnel (SC3)
**Préconditions** : Date du jour au format ISO
**Étapes** :
1. Appeler `construireNomFichierBilan("2026-04-03")`
2. Vérifier le nom retourné
**Résultat attendu** : `"bilan-tournees-2026-04-03.csv"` avec préfixe `bilan-tournees-`
**Statut** : Passé

```gherkin
Given la date du jour est 2026-04-03
When construireNomFichierBilan est appelée
Then le nom retourné est "bilan-tournees-2026-04-03.csv"
```
