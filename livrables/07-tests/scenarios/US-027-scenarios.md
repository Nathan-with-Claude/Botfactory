# Scénarios de tests US-027 — Refactoriser les écrans superviseur avec le nouveau design (MD3)

**Agent** : @qa
**Date de rédaction** : 2026-03-29
**US** : US-027 — Refactoriser les écrans superviseur (W-01 à W-05) avec tokens Material Design 3
**Prérequis** : US-025 (Design System), US-021/024 (pages fonctionnelles)

---

## Périmètre de test

US-027 est une refactorisation visuelle pure. Aucune logique métier n'est modifiée.
Aucun Domain Event nouveau n'est émis.

Fichiers impactés :
- `src/web/supervision/src/styles/tokens.css` — ajout tokens MD3 + rétrocompat
- `src/web/supervision/src/components/AppLayout.tsx` — NOUVEAU composant layout global
- `src/web/supervision/src/pages/PreparationPage.tsx` — refacto visuelle W-04
- `src/web/supervision/src/pages/TableauDeBordPage.tsx` — refacto visuelle W-01 (structure `bandeau` imbriqué)
- Tests adaptés : `TableauDeBordPage.test.tsx` (structure mockTableau corrigée pour `bandeau` imbriqué)

---

## Stratégie pyramide

- **L1 (priorité absolue)** : tests Jest/RTL sur les pages et composants refactorisés.
  Vérification de non-régression sur les 3 pages (PreparationPage, TableauDeBordPage, DetailTourneePlanifieePage).
- **L2** : non applicable — US-027 est une refactorisation de la couche présentation uniquement, aucun endpoint n'est modifié.
- **L3** : non requis — tous les critères d'acceptation sont couverts en L1. Les vérifications visuelles pures (couleurs exactes, layout) sont documentées dans OBS-027-01 (non bloquant).

---

## Anomalie connue en entrée

**OBS-025-02** : `TopAppBar.tsx` et `SideNavBar.tsx` absents de `src/web/supervision/src/components/layout/`.
Impact US-027 : le composant `AppLayout.tsx` (nouveau dans US-027) intègre le header et la sidebar directement sans dépendre de ces composants — **US-027 non bloquée par OBS-025-02**.

---

## TC-027-01 : Invariant structure — TableauDeBordDTO avec bandeau imbriqué

**US liée** : US-027
**Niveau** : L1
**Couche testée** : Interface Layer web
**Aggregate / Domain Event ciblé** : VueTournee / aucun
**Type** : Non-régression / Invariant domaine
**Préconditions** : Tests Jest pour TableauDeBordPage avec les données mockées
**Étapes** :
1. Monter `<TableauDeBordPage>` avec `mockTableau` ayant la structure `{ tournees, bandeau: { actives, aRisque, cloturees } }`
2. Attendre l'affichage du `bandeau-resume`
3. Vérifier les compteurs `compteur-actives`, `compteur-a-risque`, `compteur-cloturees`
**Résultat attendu** : Les 3 compteurs affichent les valeurs correctes issues du sous-objet `bandeau`
**Statut** : Passé

```gherkin
Given un TableauDeBordDTO avec bandeau: { actives: 2, aRisque: 1, cloturees: 0 }
When la page TableauDeBordPage est rendue
Then le compteur actives affiche "2"
And le compteur aRisque affiche "1"
And le compteur cloturees affiche "0"
```

---

## TC-027-02 : Non-régression — Tri A_RISQUE en tête du tableau

**US liée** : US-027
**Niveau** : L1
**Couche testée** : Interface Layer web
**Aggregate / Domain Event ciblé** : VueTournee / aucun
**Type** : Non-régression
**Préconditions** : 3 tournées mockées (t-001 EN_COURS, t-002 EN_COURS, t-003 A_RISQUE)
**Étapes** :
1. Monter `<TableauDeBordPage>` avec les 3 tournées
2. Attendre l'affichage du tableau
3. Lire l'ordre des lignes `<tr>`
**Résultat attendu** : La ligne `ligne-tournee-t-003` (A_RISQUE) est en première position du tableau
**Statut** : Passé

```gherkin
Given une liste de tournées dont l'une est A_RISQUE
When le tableau de bord W-01 est rendu
Then la tournée A_RISQUE est affichée en tête de tableau (ligne index 1 après l'en-tête)
```

---

## TC-027-03 : Non-régression — Filtre par statut A_RISQUE

**US liée** : US-027
**Niveau** : L1
**Couche testée** : Interface Layer web
**Aggregate / Domain Event ciblé** : VueTournee / aucun
**Type** : Non-régression
**Préconditions** : TableauDeBordPage avec 2 tournées EN_COURS et 1 A_RISQUE
**Étapes** :
1. Cliquer sur le filtre `filtre-A_RISQUE`
2. Vérifier que seule la ligne A_RISQUE est visible
**Résultat attendu** : `ligne-tournee-t-003` visible, `ligne-tournee-t-001` et `t-002` absentes
**Statut** : Passé

```gherkin
Given le tableau de bord avec des tournées de statuts mixtes
When le superviseur clique sur l'onglet filtre "A_RISQUE"
Then seules les tournées A_RISQUE sont affichées dans le tableau
```

---

## TC-027-04 : Non-régression — Bandeau déconnexion WebSocket

**US liée** : US-027
**Niveau** : L1
**Couche testée** : Interface Layer web
**Aggregate / Domain Event ciblé** : VueTournee / aucun
**Type** : Non-régression
**Préconditions** : MockWebSocket dont `onopen` n'est jamais appelé
**Étapes** :
1. Monter `<TableauDeBordPage>` avec un MockWebSocket non connecté
2. Attendre la fin du chargement
3. Vérifier la présence du bandeau `bandeau-deconnexion`
**Résultat attendu** : Le bandeau déconnexion est visible (`!connecte && !chargement`)
**Statut** : Passé

```gherkin
Given un WebSocket non connecté (onopen jamais appelé)
When la page est chargée et le chargement initial est terminé
Then le bandeau "Connexion temps réel indisponible" est visible
```

---

## TC-027-05 : Non-régression — Mise à jour tableau via WebSocket (structure bandeau imbriqué)

**US liée** : US-027
**Niveau** : L1
**Couche testée** : Interface Layer web
**Aggregate / Domain Event ciblé** : VueTournee / aucun
**Type** : Non-régression
**Préconditions** : MockWebSocket contrôlable, données initiales avec `bandeau.actives=2, bandeau.aRisque=1`
**Étapes** :
1. Monter `<TableauDeBordPage>` avec données initiales
2. Simuler un message WebSocket avec `bandeau: { actives: 1, aRisque: 2 }`
3. Vérifier que les compteurs se mettent à jour
**Résultat attendu** : `compteur-actives` affiche "1", `compteur-a-risque` affiche "2"
**Statut** : Passé

```gherkin
Given le tableau de bord affiché avec actives=2 et aRisque=1
When un message WebSocket arrive avec bandeau.actives=1 et bandeau.aRisque=2
Then les compteurs du bandeau résumé se mettent à jour en temps réel
```

---

## TC-027-06 : Non-régression — Alerte sonore US-013 via WebSocket

**US liée** : US-027
**Niveau** : L1
**Couche testée** : Interface Layer web
**Aggregate / Domain Event ciblé** : VueTournee / aucun
**Type** : Non-régression
**Préconditions** : Tableau initial sans risque (`bandeau.aRisque=0`), alerteFn mockée
**Étapes** :
1. Monter `<TableauDeBordPage>` avec `bandeau.aRisque=0` et `alerteFn` injectée
2. Vérifier qu'`alerteFn` n'est pas appelée
3. Simuler un message WebSocket avec `bandeau.aRisque=1`
4. Vérifier qu'`alerteFn` est appelée une fois
**Résultat attendu** : L'alerte sonore se déclenche exactement une fois à l'apparition du premier risque
**Statut** : Passé

```gherkin
Given le tableau de bord sans tournée à risque
When un message WebSocket signale une nouvelle tournée A_RISQUE
Then la fonction d'alerte sonore est déclenchée exactement une fois
```

---

## TC-027-07 : Non-régression — Surbrillance orange ligne A_RISQUE

**US liée** : US-027
**Niveau** : L1
**Couche testée** : Interface Layer web
**Aggregate / Domain Event ciblé** : VueTournee / aucun
**Type** : Non-régression / Design MD3
**Préconditions** : Ligne `t-003` avec statut A_RISQUE
**Étapes** :
1. Monter `<TableauDeBordPage>` avec la tournée A_RISQUE
2. Attendre l'affichage de la ligne `ligne-tournee-t-003`
3. Vérifier que `backgroundColor` est non-vide et que `borderLeft` contient "orange"
**Résultat attendu** : La ligne A_RISQUE a un fond distinctif et une bordure gauche orange MD3
**Statut** : Passé

```gherkin
Given une tournée avec statut A_RISQUE dans le tableau W-01
When la ligne est rendue
Then elle a un fond coloré distinctif (backgroundColor non vide)
And une bordure gauche orange (bg-orange-50/50 border-l-4 border-orange-500 selon spec MD3)
```

---

## TC-027-08 : Non-régression — Badge NON AFFECTÉE couleur MD3

**US liée** : US-027
**Niveau** : L1
**Couche testée** : Interface Layer web (PreparationPage W-04)
**Aggregate / Domain Event ciblé** : TourneePlanifiee / aucun
**Type** : Non-régression / Design MD3
**Préconditions** : Tournée T-201 avec statut NON_AFFECTEE dans le plan du jour
**Étapes** :
1. Monter `<PreparationPage>` avec planMock()
2. Récupérer l'élément `badge-statut-tp-201`
3. Vérifier le texte "NON AFFECTÉE" et la couleur MD3 error-container
**Résultat attendu** : Badge affiche "NON AFFECTÉE" avec `backgroundColor: rgb(255, 218, 214)` (MD3 error-container)
**Statut** : Passé

```gherkin
Given une tournée NON AFFECTÉE dans le plan du jour W-04
When la ligne est affichée
Then le badge indique "NON AFFECTÉE"
And sa couleur de fond est la couleur MD3 error-container (rgb(255, 218, 214))
```

---

## TC-027-09 : Non-régression — Actions selon statut dans W-04

**US liée** : US-027
**Niveau** : L1
**Couche testée** : Interface Layer web (PreparationPage W-04)
**Aggregate / Domain Event ciblé** : TourneePlanifiee / TourneeLancee
**Type** : Non-régression
**Préconditions** : Plan du jour avec tournées de statuts mixtes
**Étapes** :
1. Monter `<PreparationPage>` avec planMock()
2. Vérifier `btn-affecter-tp-201` pour NON_AFFECTEE
3. Vérifier `btn-lancer-tp-202` pour AFFECTEE
4. Vérifier l'absence de btn-lancer pour LANCEE (tp-204)
**Résultat attendu** : Actions adaptées au statut de chaque tournée
**Statut** : Passé

```gherkin
Given le tableau W-04 avec tournées NON_AFFECTEE, AFFECTEE et LANCEE
When la page est rendue
Then chaque ligne affiche les actions adaptées à son statut
And une tournée LANCEE n'a pas de bouton [Lancer]
```

---

## TC-027-10 : Non-régression — Bouton "Lancer toutes" conditionnel W-04

**US liée** : US-027
**Niveau** : L1
**Couche testée** : Interface Layer web (PreparationPage W-04)
**Aggregate / Domain Event ciblé** : TourneePlanifiee / TourneeLancee
**Type** : Non-régression
**Préconditions** : Plan sans tournées LANCEE mais avec AFFECTEE
**Étapes** :
1. Monter `<PreparationPage>` avec planSansLancees
2. Vérifier la présence de `btn-lancer-toutes`
**Résultat attendu** : Le bouton "Lancer toutes" est visible et actif quand toutes les tournées éligibles sont affectées
**Statut** : Passé

```gherkin
Given un plan du jour avec toutes les tournées affectées mais aucune lancée
When la page W-04 est affichée
Then le bouton "Lancer toutes les tournées" est visible et actif
```

---

## TC-027-11 : Non-régression — Régression globale suite DetailTourneePlanifieePage

**US liée** : US-027
**Niveau** : L1
**Couche testée** : Interface Layer web (DetailTourneePlanifieePage W-05)
**Aggregate / Domain Event ciblé** : TourneePlanifiee / aucun
**Type** : Non-régression complète (US-022, US-023, US-028, US-030)
**Préconditions** : Suite de tests DetailTourneePlanifieePage (21 tests)
**Étapes** :
1. Exécuter la suite complète `DetailTourneePlanifieePage.test.tsx`
2. Vérifier que les 21 assertions passent (US-022, US-023, US-028, US-030)
**Résultat attendu** : 21/21 tests PASS — aucune régression sur W-05
**Statut** : Passé

```gherkin
Given la page DetailTourneePlanifieePage refactorisée visuellement par US-027
When la suite de tests L1 complète est exécutée
Then tous les tests de non-régression passent sans exception
```

---

## TC-027-12 : Non-régression globale — Suite complète web supervision (171 tests)

**US liée** : US-027
**Niveau** : L1
**Couche testée** : Interface Layer web (toutes les pages)
**Aggregate / Domain Event ciblé** : Tous
**Type** : Non-régression globale
**Préconditions** : Toutes les suites de tests web supervision
**Étapes** :
1. Exécuter `CI=true npm test` dans `src/web/supervision`
2. Vérifier que 171/171 tests passent sur les 17 suites
**Résultat attendu** : 171/171 PASS — aucune régression détectée sur l'ensemble du projet supervision
**Statut** : Passé

```gherkin
Given la codebase web supervision après refactorisation US-027
When la suite complète de 171 tests est exécutée
Then tous les tests passent — aucune régression introduite
```

---

## Anomalies identifiées

### OBS-027-01 (non bloquant) — Structure TableauDeBordDTO cassait les tests existants

**Contexte** : La refactorisation US-027 a imbriqué les champs `actives`, `aRisque`, `cloturees` dans un sous-objet `bandeau: BandeauResumeDTO`. Les tests de `TableauDeBordPage.test.tsx` utilisaient l'ancienne structure plate.

**Impact** : 11/11 tests TableauDeBordPage en FAIL avant correction.

**Correction appliquée** : Mise à jour de `mockTableau` et des variantes dérivées dans `TableauDeBordPage.test.tsx` pour refléter la structure `bandeau` imbriquée.

**Statut** : Corrigé — 11/11 tests PASS après correction.

### OBS-027-02 (non bloquant) — W-02, W-03, W-05 non couverts par tests L1

**Contexte** : Les pages W-02 (DetailTourneePage), W-03 (PanneauInstructionPage) et W-05 (DetailTourneePlanifieePage) ont été testées par leurs suites respectives mais les éléments visuels spécifiques à US-027 (DrawerDetail 480px, CardTypeInstruction, dialog confirmation abandon) ne disposent pas de TC dédiés.

**Impact** : Non bloquant — la logique métier est inchangée, seule la présentation est modifiée. Les suites de non-régression valident que rien n'est cassé.

**Recommandation** : Ajouter des TC ciblés L1 pour le DrawerDetail et les CardTypeInstruction dans une prochaine session si ces composants ont été implémentés.

### OBS-025-02 (hérité, non bloquant pour US-027) — TopAppBar et SideNavBar absents

**Contexte** : Les composants `TopAppBar.tsx` et `SideNavBar.tsx` sont absents de `src/web/supervision/src/components/layout/`. US-027 a contourné cette dépendance en créant `AppLayout.tsx` autonome.

**Impact sur US-027** : Nul — `AppLayout.tsx` ne dépend pas de `TopAppBar`/`SideNavBar`.
