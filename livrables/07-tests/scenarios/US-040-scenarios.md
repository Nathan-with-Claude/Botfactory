# Scénarios de tests US-040 — Enrichir le CSV exporté avec nom destinataire et statut final

**Agent** : @qa
**Date de création** : 2026-04-03
**Dernière exécution** : 2026-04-03

---

## Synthèse d'exécution

| Suite | Niveau | Outil | Tests | Résultat |
|---|---|---|---|---|
| exporterCSV.US040.test.ts | L1 | Jest (TypeScript) | 15/15 | PASS |
| exporterCSV.test.ts (rétrocompatibilité US-028) | L1 | Jest | 10/10 | PASS |
| **TOTAL** | | | **25/25** | **PASS** |

**Verdict US-040** : Validée — 15/15 + 10/10 tests verts, aucune régression US-028 détectée.

---

### TC-040-01 : 6 champs dans chaque ligne CSV enrichie (SC1)

**US liée** : US-040
**Niveau** : L1
**Couche testée** : Domain (fonction pure)
**Aggregate / Domain Event ciblé** : aucun (enrichissement lecture)
**Type** : Fonctionnel
**Préconditions** : Liste de colis avec `destinataire` et `statut`
**Étapes** :
1. Appeler `construireColisCSVRowsEnrichis()` avec une liste de colis
2. Vérifier que chaque row contient exactement 6 champs
**Résultat attendu** : Chaque `ColisCSVRowEnrichi` contient `numeroColis, destinataire, adresse, zone, contrainte, statut`
**Statut** : Passé

```gherkin
Given une liste de colis avec données complètes
When construireColisCSVRowsEnrichis est appelée
Then chaque ligne CSV contient 6 champs dans le bon ordre
```

---

### TC-040-02 : Statut LIVRE traduit en "Livré" (SC2)

**US liée** : US-040
**Niveau** : L1
**Couche testée** : Domain (fonction pure)
**Aggregate / Domain Event ciblé** : aucun
**Type** : Invariant domaine
**Préconditions** : Colis avec `statut: 'LIVRE'`
**Étapes** :
1. Appeler `serialiserEnCSVEnrichi` avec un colis LIVRE
2. Vérifier que le CSV contient "Livré"
**Résultat attendu** : La valeur `'Livré'` apparaît dans le CSV
**Statut** : Passé

```gherkin
Given un colis avec statut LIVRE
When le CSV enrichi est sérialisé
Then la colonne Statut affiche "Livré"
```

---

### TC-040-03 : Statut ECHEC traduit en "Échec" (SC3)

**US liée** : US-040
**Niveau** : L1
**Couche testée** : Domain (fonction pure)
**Aggregate / Domain Event ciblé** : aucun
**Type** : Invariant domaine
**Préconditions** : Colis avec `statut: 'ECHEC'`
**Étapes** :
1. Appeler `serialiserEnCSVEnrichi` avec un colis ECHEC
2. Vérifier que le CSV contient "Échec"
**Résultat attendu** : La valeur `'Échec'` apparaît dans le CSV
**Statut** : Passé

```gherkin
Given un colis avec statut ECHEC
When le CSV enrichi est sérialisé
Then la colonne Statut affiche "Échec"
```

---

### TC-040-04 : Statut EN_COURS traduit en "En cours" (SC4)

**US liée** : US-040
**Niveau** : L1
**Couche testée** : Domain (fonction pure)
**Aggregate / Domain Event ciblé** : aucun
**Type** : Invariant domaine
**Préconditions** : Colis avec `statut: 'EN_COURS'`
**Étapes** :
1. Appeler `serialiserEnCSVEnrichi` avec un colis EN_COURS
2. Vérifier que le CSV contient "En cours"
**Résultat attendu** : La valeur `'En cours'` apparaît dans le CSV
**Statut** : Passé

```gherkin
Given un colis avec statut EN_COURS
When le CSV enrichi est sérialisé
Then la colonne Statut affiche "En cours"
```

---

### TC-040-05 : Destinataire absent → chaîne vide dans le CSV (SC6)

**US liée** : US-040
**Niveau** : L1
**Couche testée** : Domain (fonction pure)
**Aggregate / Domain Event ciblé** : aucun
**Type** : Edge case
**Préconditions** : Colis sans champ `destinataire`
**Étapes** :
1. Appeler `construireColisCSVRowsEnrichis` avec un colis sans `destinataire`
2. Vérifier que le champ `destinataire` dans la row est `""`
**Résultat attendu** : Chaîne vide (non null) dans le CSV
**Statut** : Passé

```gherkin
Given un colis sans destinataire renseigné
When le CSV enrichi est construit
Then la colonne Destinataire est vide (chaîne vide, non null)
```

---

### TC-040-06 : Virgule dans Destinataire → guillemets (SC7)

**US liée** : US-040
**Niveau** : L1
**Couche testée** : Domain (fonction pure)
**Aggregate / Domain Event ciblé** : aucun
**Type** : Edge case
**Préconditions** : Colis avec `destinataire: "Dupont, Jean"`
**Étapes** :
1. Appeler `serialiserEnCSVEnrichi` avec un colis dont le destinataire contient une virgule
2. Vérifier l'escaping dans le CSV
**Résultat attendu** : La valeur est encadrée de guillemets doubles dans le CSV
**Statut** : Passé

```gherkin
Given un colis dont le destinataire contient une virgule
When le CSV enrichi est sérialisé
Then le nom est protégé par des guillemets doubles
```

---

### TC-040-07 : BOM UTF-8 + CRLF + entête 6 colonnes (SC5/SC1)

**US liée** : US-040
**Niveau** : L1
**Couche testée** : Domain (fonction pure)
**Aggregate / Domain Event ciblé** : aucun
**Type** : Invariant domaine
**Préconditions** : Appel de `serialiserEnCSVEnrichi`
**Étapes** :
1. Vérifier la présence du BOM `\uFEFF`
2. Vérifier l'entête `#Colis,Destinataire,Adresse,Zone,Contrainte,Statut`
3. Vérifier l'utilisation de `\r\n` comme séparateur de lignes
**Résultat attendu** : BOM, entête 6 colonnes, CRLF conformes
**Statut** : Passé

```gherkin
Given une liste de colis enrichis
When serialiserEnCSVEnrichi est appelée
Then le CSV débute par le BOM UTF-8, contient l'entête avec 6 colonnes, et utilise CRLF
```

---

### TC-040-08 : Aucune régression sur les fonctions US-028

**US liée** : US-040 / US-028
**Niveau** : L1
**Couche testée** : Domain (fonctions pures)
**Aggregate / Domain Event ciblé** : aucun
**Type** : Non régression
**Préconditions** : `exporterCSV.test.ts` (suite US-028) intacte
**Étapes** :
1. Exécuter la suite `exporterCSV.test.ts` sans modification
2. Vérifier que tous les tests passent
**Résultat attendu** : 10/10 tests US-028 verts
**Statut** : Passé

```gherkin
Given les fonctions US-028 (construireColisCSVRows, serialiserEnCSV) non modifiées
When la suite exporterCSV.test.ts est exécutée
Then 10/10 tests passent sans régression
```
