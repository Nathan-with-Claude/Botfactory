# Scénarios de tests US-022 — Vérifier la composition d'une tournée

**US liée** : US-022
**Titre** : Vérifier la composition d'une tournée avant affectation
**Bounded Context** : BC-07 Planification de Tournée
**Aggregate / Domain Event ciblé** : TourneePlanifiee / CompositionVerifiee
**Agent** : @qa
**Date** : 2026-03-24
**Version** : 1.0

---

### TC-230 : Affichage du détail d'une tournée avec zones, contraintes et anomalies

**US liée** : US-022
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : TourneePlanifiee / TourneePlanifieeDetailDTO
**Type** : Fonctionnel (happy path)
**Préconditions** : Backend svc-supervision en profil dev, tournée T-203 avec anomalie SURCHARGE disponible
**Étapes** :
1. Naviguer vers http://localhost:3000/preparation
2. Cliquer sur une tournée NON_AFFECTEE avec anomalie
3. Observer l'onglet Composition

**Résultat attendu** : Les zones, contraintes et le bloc anomalie orange sont affichés. Le badge "✓" est absent car non vérifiée.
**Statut** : Passé

```gherkin
Given Laurent est sur la page W-04 et sélectionne la tournée T-203 (avec anomalie SURCHARGE)
When la page de détail W-05 se charge sur l'onglet Composition
Then les zones de la tournée sont affichées
And les contraintes horaires sont affichées avec le symbole ⚑
And le bloc anomalie orange est visible
And le bouton "Valider la vérification" est actif (compositionVerifiee=false)
```

---

### TC-231 : API GET /api/planification/tournees/{id} retourne 200 avec détail complet

**US liée** : US-022
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : ConsulterDetailTourneePlanifieeHandler
**Type** : Fonctionnel
**Préconditions** : Backend svc-supervision en profil dev, tournée T-201 créée par DevDataSeeder
**Étapes** :
1. Appeler GET /api/planification/tournees/tp-201
2. Vérifier la structure

**Résultat attendu** : HTTP 200 avec zones, contraintes, anomalies, compositionVerifiee=false
**Statut** : Passé

```gherkin
Given la tournée tp-201 existe dans le DevDataSeeder
When GET /api/planification/tournees/tp-201 est appelé avec MockJwt SUPERVISEUR
Then la réponse est HTTP 200
And le corps contient "zones", "contraintes", "anomalies", "compositionVerifiee"
And "compositionVerifiee" = false
```

---

### TC-232 : Valider la composition émet CompositionVerifiee et marque compositionVerifiee=true

**US liée** : US-022
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : TourneePlanifiee.verifierComposition() / CompositionVerifiee
**Type** : Fonctionnel / Domain Event
**Préconditions** : Tournée tp-201 avec compositionVerifiee=false
**Étapes** :
1. Appeler POST /api/planification/tournees/tp-201/composition/valider
2. Vérifier la réponse
3. Rappeler GET /api/planification/tournees/tp-201 et vérifier compositionVerifiee=true

**Résultat attendu** : HTTP 200, compositionVerifiee=true dans la réponse et lors de la relecture
**Statut** : Passé

```gherkin
Given la tournée tp-201 existe avec compositionVerifiee=false
When POST /api/planification/tournees/tp-201/composition/valider est appelé
Then la réponse est HTTP 200
And "compositionVerifiee" = true dans la réponse
And un Domain Event CompositionVerifiee est collecté (superviseurId dans le payload)
```

---

### TC-233 : Invariant — une anomalie ne bloque pas la validation de composition

**US liée** : US-022
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : TourneePlanifiee.verifierComposition() — non bloquant
**Type** : Invariant domaine
**Préconditions** : Tournée T-203 avec anomalie SURCHARGE
**Étapes** :
1. Appeler POST /api/planification/tournees/tp-203/composition/valider (tournée avec anomalie)
2. Vérifier que la réponse est 200 (non bloquée par l'anomalie)

**Résultat attendu** : HTTP 200 — la validation réussit malgré la présence d'une anomalie
**Statut** : Passé

```gherkin
Given la tournée tp-203 a une anomalie SURCHARGE
When POST /api/planification/tournees/tp-203/composition/valider est appelé
Then la réponse est HTTP 200 (non bloquée par l'anomalie)
And "compositionVerifiee" = true
And l'anomalie est toujours visible dans le détail
```

---

### TC-234 : HTTP 404 si tournée introuvable

**US liée** : US-022
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : TourneePlanifieeNotFoundException → HTTP 404
**Type** : Edge case
**Préconditions** : Backend svc-supervision en profil dev
**Étapes** :
1. Appeler GET /api/planification/tournees/tp-INEXISTANT
2. Vérifier la réponse

**Résultat attendu** : HTTP 404 Not Found
**Statut** : Passé

```gherkin
Given aucune tournée avec l'id "tp-INEXISTANT" n'existe
When GET /api/planification/tournees/tp-INEXISTANT est appelé
Then la réponse est HTTP 404 Not Found
```

---

### TC-235 : Bouton "Valider la vérification" désactivé si compositionVerifiee=true

**US liée** : US-022
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : TourneePlanifiee — compositionVerifiee=true
**Type** : Edge case
**Préconditions** : Composition déjà validée via POST /composition/valider
**Étapes** :
1. Valider la composition d'une tournée via API
2. Recharger la page de détail W-05 onglet Composition
3. Observer l'état du bouton

**Résultat attendu** : Le bouton "Valider la vérification" est grisé (désactivé) et le badge "✓" est affiché
**Statut** : Passé

```gherkin
Given la composition de la tournée tp-201 a déjà été validée (compositionVerifiee=true)
When Laurent consulte l'onglet Composition de la tournée tp-201
Then le bouton "Valider la vérification" est désactivé (grisé)
And le badge "✓" est affiché sur l'onglet Composition
```
