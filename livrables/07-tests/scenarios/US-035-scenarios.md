# Scénarios de tests US-035 : Recherche multi-critères dans le tableau de bord

**Agent** : @qa
**Date** : 2026-04-05
**US** : US-035 — Rechercher une tournée dans le tableau de bord par nom de livreur, numéro TMS ou zone géographique
**Bounded Context** : BC-03 Supervision (Read Model VueTournee) — svc-supervision (port 8082)

---

## Récapitulatif des TC

| TC | Titre | Niveau | Statut |
|----|-------|--------|--------|
| TC-035-01 | Recherche exacte par codeTMS retourne une seule tournée | L1 | Passé |
| TC-035-02 | Recherche partielle insensible à la casse (t-20 → 3 résultats) | L1 | Passé |
| TC-035-03 | Recherche par zone géographique (correspondance partielle) | L1 | Passé |
| TC-035-04 | Recherche par nom de livreur (comportement existant préservé) | L1 | Passé |
| TC-035-05 | Intersection avec filtre de statut actif | L1 | Passé |
| TC-035-06 | Aucun résultat affiche message + lien "Effacer la recherche" | L1 | Passé |
| TC-035-07 | Effacement restaure toutes les tournées | L1 | Passé |
| TC-035-08 | Bandeau résumé non affecté par la recherche | L1 | Passé |
| TC-035-09 | API GET tableau-de-bord retourne codeTMS et zone | L2 | Passé |
| TC-035-10 | Pas de bouton "Rechercher" (comportement réactif) | L1 | Passé |

---

### TC-035-01 : Recherche exacte par codeTMS retourne une seule tournée

**US liée** : US-035
**Niveau** : L1
**Couche testée** : Interface Layer (frontend React — fonction correspondRecherche)
**Aggregate / Domain Event ciblé** : VueTournee (Read Model) — lecture seule
**Type** : Fonctionnel
**Préconditions** : 3 tournées mockées : T-201 (Lyon 3e), T-202 (Villeurbanne), T-203 (Lyon 3e)

**Étapes** :
1. Monter TableauDeBordPage avec 3 tournées
2. Saisir "T-202" dans champ-recherche
3. Vérifier qu'une seule ligne de tournée est affichée

**Résultat attendu** : Seule la tournée T-202 est visible. Les 2 autres sont masquées.

**Statut** : Passé

```gherkin
Given TableauDeBordPage affiche 3 VueTournee (T-201, T-202, T-203)
When le superviseur saisit "T-202" dans champ-recherche
Then seule la ligne correspondant à codeTMS="T-202" est affichée
And les 2 autres lignes sont masquées du DOM
And lien-effacer-recherche est visible
```

---

### TC-035-02 : Recherche partielle insensible à la casse

**US liée** : US-035
**Niveau** : L1
**Couche testée** : Interface Layer (React — correspondRecherche)
**Aggregate / Domain Event ciblé** : VueTournee (Read Model)
**Type** : Fonctionnel
**Préconditions** : 3 tournées avec codeTMS T-201, T-202, T-203

**Étapes** :
1. Saisir "t-20" dans champ-recherche (minuscules)
2. Vérifier que les 3 tournées sont affichées (correspondance partielle, insensible à la casse)

**Résultat attendu** : Les 3 tournées T-201, T-202, T-203 sont visibles.

**Statut** : Passé

```gherkin
Given 3 VueTournee avec codeTMS T-201, T-202, T-203
When le superviseur saisit "t-20" (minuscules)
Then les 3 lignes de tournée sont affichées (correspondance partielle + insensible casse)
```

---

### TC-035-03 : Recherche par zone géographique

**US liée** : US-035
**Niveau** : L1
**Couche testée** : Interface Layer (React — correspondRecherche)
**Aggregate / Domain Event ciblé** : VueTournee (Read Model)
**Type** : Fonctionnel
**Préconditions** : T-202 avec zone="Villeurbanne", les autres avec zone="Lyon 3e"

**Étapes** :
1. Saisir "Villeurb" dans champ-recherche
2. Vérifier que seule T-202 apparaît

**Résultat attendu** : Seule T-202 (zone Villeurbanne) est affichée.

**Statut** : Passé

```gherkin
Given VueTournee T-202 a zone="Villeurbanne", les autres ont zone="Lyon 3e"
When le superviseur saisit "Villeurb"
Then seule T-202 est affichée (correspondance partielle sur zone)
```

---

### TC-035-04 : Recherche par nom de livreur (comportement existant préservé)

**US liée** : US-035
**Niveau** : L1
**Couche testée** : Interface Layer (React — correspondRecherche)
**Aggregate / Domain Event ciblé** : VueTournee (Read Model)
**Type** : Non régression
**Préconditions** : T-202 avec livreurNom="Marie Dupont"

**Étapes** :
1. Saisir "Marie" dans champ-recherche
2. Vérifier que seule T-202 apparaît

**Résultat attendu** : Seule la tournée de Marie Dupont est affichée. Comportement pre-US-035 préservé.

**Statut** : Passé

```gherkin
Given VueTournee T-202 avec livreurNom="Marie Dupont"
When le superviseur saisit "Marie"
Then seule T-202 est affichée
And les autres VueTournee sont masquées
```

---

### TC-035-05 : Intersection avec filtre de statut actif

**US liée** : US-035
**Niveau** : L1
**Couche testée** : Interface Layer (React — correspondRecherche × filtre statut)
**Aggregate / Domain Event ciblé** : VueTournee (Read Model)
**Type** : Fonctionnel
**Préconditions** : T-203 A_RISQUE (Lyon 3e), T-201 EN_COURS (Lyon 3e). Filtre "A_RISQUE" actif.

**Étapes** :
1. Activer le filtre statut A_RISQUE
2. Saisir "Lyon 3" dans champ-recherche
3. Vérifier que seule T-203 (A_RISQUE + Lyon 3) apparaît

**Résultat attendu** : T-201 (EN_COURS, Lyon 3) est exclue par le filtre statut. T-203 seule visible.

**Statut** : Passé

```gherkin
Given filtre statut A_RISQUE actif
And T-203 est A_RISQUE zone="Lyon 3e", T-201 est EN_COURS zone="Lyon 3e"
When le superviseur saisit "Lyon 3"
Then seule T-203 est affichée (ET logique entre recherche et filtre statut)
And T-201 est exclue par le filtre statut
```

---

### TC-035-06 : Aucun résultat affiche message + lien effacer

**US liée** : US-035
**Niveau** : L1
**Couche testée** : Interface Layer (React)
**Aggregate / Domain Event ciblé** : VueTournee (Read Model)
**Type** : Edge case
**Préconditions** : 3 tournées dans le tableau

**Étapes** :
1. Saisir "XYZ999" dans champ-recherche
2. Vérifier l'affichage du message "Aucune tournée ne correspond à votre recherche"
3. Vérifier la présence du lien lien-effacer-recherche

**Résultat attendu** : message-aucun-resultat-recherche visible, lien-effacer-recherche visible.

**Statut** : Passé

```gherkin
Given aucune VueTournee ne correspond au terme "XYZ999"
When le superviseur saisit "XYZ999"
Then message-aucun-resultat-recherche est visible
And lien-effacer-recherche est visible
And les compteurs du bandeau résumé (actives, aRisque, cloturees) sont inchangés
```

---

### TC-035-07 : Effacement restaure toutes les tournées

**US liée** : US-035
**Niveau** : L1
**Couche testée** : Interface Layer (React)
**Aggregate / Domain Event ciblé** : VueTournee (Read Model)
**Type** : Fonctionnel
**Préconditions** : Recherche active "T-202" → 1 tournée visible

**Étapes** :
1. Cliquer sur lien-effacer-recherche
2. Vérifier que champ-recherche est vide
3. Vérifier que les 3 tournées sont à nouveau affichées

**Résultat attendu** : Toutes les tournées correspondant aux filtres de statut actifs sont rétablies.

**Statut** : Passé

```gherkin
Given champ-recherche contient "T-202" et seule T-202 est visible
When le superviseur clique sur lien-effacer-recherche
Then champ-recherche est vide
And les 3 VueTournee sont à nouveau affichées
```

---

### TC-035-08 : Bandeau résumé non affecté par la recherche

**US liée** : US-035
**Niveau** : L1
**Couche testée** : Interface Layer (React)
**Aggregate / Domain Event ciblé** : VueTournee (Read Model — compteurs tableau)
**Type** : Non régression
**Préconditions** : 3 tournées, bandeau résumé actives=2, aRisque=1, cloturees=0

**Étapes** :
1. Saisir "T-202" → 1 tournée visible
2. Vérifier que le bandeau résumé affiche encore actives=2, aRisque=1, cloturees=0

**Résultat attendu** : Les compteurs du bandeau restent sur les totaux du jour, non affectés par la recherche.

**Statut** : Passé

```gherkin
Given le bandeau résumé affiche actives=2, aRisque=1, cloturees=0
When le superviseur saisit "T-202" (1 tournée visible)
Then le bandeau résumé affiche toujours actives=2, aRisque=1, cloturees=0
```

---

### TC-035-09 : API GET tableau-de-bord retourne codeTMS et zone

**US liée** : US-035
**Niveau** : L2
**Couche testée** : Infrastructure + Interface REST
**Aggregate / Domain Event ciblé** : VueTournee (Read Model — champs étendus)
**Type** : Fonctionnel
**Préconditions** : svc-supervision démarré, DevDataSeeder actif (T-201=Lyon 3e, T-202=Villeurbanne)

**Étapes** :
1. `curl -s "http://localhost:8082/api/supervision/tableau-de-bord" | jq '.tournees[0].codeTMS'`
2. `curl -s "http://localhost:8082/api/supervision/tableau-de-bord" | jq '.tournees[0].zone'`

**Résultat attendu** : codeTMS="T-201" et zone="Lyon 3e" présents dans le JSON.

**Statut** : Passé

```gherkin
Given svc-supervision démarré en profil dev
When GET /api/supervision/tableau-de-bord
Then $.tournees[0].codeTMS = "T-201"
And $.tournees[0].zone = "Lyon 3e"
And $.tournees[1].codeTMS = "T-202"
And $.tournees[1].zone = "Villeurbanne"
```

---

### TC-035-10 : Pas de bouton "Rechercher" (comportement réactif)

**US liée** : US-035
**Niveau** : L1
**Couche testée** : Interface Layer (React)
**Aggregate / Domain Event ciblé** : VueTournee (Read Model)
**Type** : Invariant UI
**Préconditions** : TableauDeBordPage montée

**Étapes** :
1. Monter TableauDeBordPage
2. Vérifier l'absence d'un bouton "Rechercher" ou "btn-rechercher"

**Résultat attendu** : Aucun élément avec testID="btn-rechercher" dans le DOM.

**Statut** : Passé

```gherkin
Given TableauDeBordPage est affichée
When on inspecte le DOM
Then aucun bouton btn-rechercher n'est présent
And la recherche se déclenche en temps réel via onChange sur champ-recherche
```
