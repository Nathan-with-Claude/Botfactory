# Scénarios de tests US-023 — Affecter un livreur et un véhicule à une tournée

**US liée** : US-023
**Titre** : Affecter un livreur et un véhicule à une tournée
**Bounded Context** : BC-07 Planification de Tournée
**Aggregate / Domain Event ciblé** : TourneePlanifiee / AffectationEnregistree
**Agent** : @qa
**Date** : 2026-03-24
**Version** : 1.0

---

### TC-240 : Affectation réussie — tournée passe de NON_AFFECTEE à AFFECTEE

**US liée** : US-023
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : TourneePlanifiee.affecter() / AffectationEnregistree
**Type** : Fonctionnel (happy path)
**Préconditions** : Tournée tp-201 en statut NON_AFFECTEE, backend svc-supervision en profil dev
**Étapes** :
1. Appeler POST /api/planification/tournees/tp-201/affecter avec livreurId, livreurNom, vehiculeId
2. Vérifier la réponse et le statut

**Résultat attendu** : HTTP 200, statut=AFFECTEE, livreurId et vehiculeId dans la réponse
**Statut** : Passé

```gherkin
Given la tournée tp-201 est en statut NON_AFFECTEE
When POST /api/planification/tournees/tp-201/affecter est appelé avec { livreurId:"livreur-042", livreurNom:"Pierre Morel", vehiculeId:"VH-12" }
Then la réponse est HTTP 200
And "statut" = "AFFECTEE"
And "livreurId" = "livreur-042"
And le Domain Event AffectationEnregistree est collecté
```

---

### TC-241 : Invariant — affectation atomique livreur + véhicule ensemble

**US liée** : US-023
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : AffecterLivreurVehiculeHandler — validation atomique
**Type** : Invariant domaine
**Préconditions** : Backend svc-supervision en profil dev
**Étapes** :
1. Appeler POST /api/planification/tournees/tp-201/affecter sans vehiculeId
2. Vérifier la réponse

**Résultat attendu** : HTTP 400 Bad Request (body validation) — affectation partielle refusée
**Statut** : Passé

```gherkin
Given la tournée tp-201 est en statut NON_AFFECTEE
When POST /api/planification/tournees/tp-201/affecter est appelé sans vehiculeId
Then la réponse est HTTP 400 Bad Request
And aucune affectation partielle n'est enregistrée
```

---

### TC-242 : Invariant — livreur déjà affecté à une autre tournée → HTTP 409

**US liée** : US-023
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : LivreurDejaAffecteException → HTTP 409
**Type** : Invariant domaine
**Préconditions** : Livreur livreur-042 déjà affecté à tp-202 aujourd'hui
**Étapes** :
1. Affecter livreur-042 à tp-201
2. Tenter d'affecter livreur-042 à tp-203 (autre tournée le même jour)
3. Vérifier la réponse

**Résultat attendu** : HTTP 409 Conflict avec message livreur déjà affecté
**Statut** : Passé

```gherkin
Given le livreur "livreur-042" est déjà affecté à la tournée tp-202 aujourd'hui
When POST /api/planification/tournees/tp-201/affecter est appelé avec livreurId="livreur-042"
Then la réponse est HTTP 409 Conflict
And le message indique que le livreur est déjà affecté
And la tournée tp-201 reste en statut NON_AFFECTEE
```

---

### TC-243 : Invariant — tentative d'affectation sur une tournée LANCEE → HTTP 409

**US liée** : US-023
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : TourneePlanifiee.affecter() — PlanificationInvariantException si LANCEE
**Type** : Invariant domaine
**Préconditions** : Tournée tp-204 en statut LANCEE
**Étapes** :
1. Appeler POST /api/planification/tournees/tp-204/affecter
2. Vérifier la réponse

**Résultat attendu** : HTTP 409 Conflict — on ne peut pas ré-affecter une tournée déjà lancée
**Statut** : Passé

```gherkin
Given la tournée tp-204 est en statut LANCEE
When POST /api/planification/tournees/tp-204/affecter est appelé
Then la réponse est HTTP 409 Conflict
And PlanificationInvariantException est levée par le domaine
```

---

### TC-244 : Sélecteurs livreur et véhicule désactivés sur une tournée LANCEE (UI)

**US liée** : US-023
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : DetailTourneePlanifieePage — onglet Affectation readonly
**Type** : Edge case
**Préconditions** : Page W-05 pour une tournée LANCEE
**Étapes** :
1. Naviguer vers le détail de la tournée tp-204 (LANCEE) sur l'onglet Affectation
2. Observer les sélecteurs

**Résultat attendu** : Les sélecteurs livreur/véhicule sont remplacés par un affichage lecture seule. Le bouton "VALIDER L'AFFECTATION" est absent.
**Statut** : Passé

```gherkin
Given Laurent accède à la page de détail de la tournée tp-204 (LANCEE)
When Laurent ouvre l'onglet Affectation
Then les sélecteurs livreur et véhicule sont en mode lecture seule
And le bouton "VALIDER L'AFFECTATION" est absent ou désactivé
```

---

### TC-245 : Bouton "VALIDER L'AFFECTATION" désactivé tant que livreur + véhicule non sélectionnés

**US liée** : US-023
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : DetailTourneePlanifieePage — validation UI
**Type** : Fonctionnel
**Préconditions** : Page W-05 onglet Affectation pour une tournée NON_AFFECTEE
**Étapes** :
1. Naviguer vers l'onglet Affectation d'une tournée NON_AFFECTEE
2. Sélectionner uniquement un livreur (pas de véhicule)
3. Observer l'état du bouton

**Résultat attendu** : Le bouton "VALIDER L'AFFECTATION" est désactivé tant que les deux champs ne sont pas remplis
**Statut** : Passé

```gherkin
Given Laurent est sur l'onglet Affectation d'une tournée NON_AFFECTEE
When Laurent sélectionne uniquement un livreur sans sélectionner de véhicule
Then le bouton "VALIDER L'AFFECTATION" est désactivé
```
