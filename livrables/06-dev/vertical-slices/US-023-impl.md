# Implémentation US-023 : Affecter un livreur et un véhicule à une tournée

## Contexte

En tant que Laurent Renaud, je veux sélectionner un livreur et un véhicule disponibles pour une tournée donnée, afin de tracer l'affectation dans le SI et de préparer le départ.

- Spec : `/livrables/05-backlog/user-stories/US-023-affecter-livreur-vehicule.md`
- Wireframe : W-05 onglet Affectation — `/livrables/02-ux/wireframes.md`

## Bounded Context et couche ciblée

- **BC** : BC-07 Planification de Tournée
- **Aggregate(s) modifiés** : `TourneePlanifiee.affecter(livreurId, livreurNom, vehiculeId, superviseurId)`
- **Domain Events émis** : `AffectationEnregistree` (tourneeId, livreurId, vehiculeId, superviseurId, horodatage)

## Décisions d'implémentation

### Domain Layer

- **`TourneePlanifiee.affecter()`** : transite NON_AFFECTEE/AFFECTEE → AFFECTEE. Lève `PlanificationInvariantException` si statut = LANCEE.
- Invariants NullPointerException si livreurId ou vehiculeId null.
- L'affectation est atomique : livreur ET véhicule ensemble (pas d'affectation partielle).
- **`AffectationEnregistree`** : record Java immuable.

### Application Layer

- **`AffecterLivreurVehiculeCommand`** : record Java (tourneePlanifieeId, livreurId, livreurNom, vehiculeId, superviseurId).
- **`AffecterLivreurVehiculeHandler`** : vérifie les invariants d'unicité via repository AVANT de déléguer au domaine.
  - `isLivreurDejaAffecte(livreurId, date)` — autorise la réaffectation du même livreur sur la même tournée (mise à jour).
  - `isVehiculeDejaAffecte(vehiculeId, date)` — idem pour le véhicule.
- **`LivreurDejaAffecteException`** → HTTP 409.
- **`VehiculeDejaAffecteException`** → HTTP 409.

### Infrastructure Layer

- `TourneePlanifieeJpaRepository.existsByLivreurIdAndDate()` et `existsByVehiculeIdAndDate()` : requêtes Spring Data pour vérifier l'unicité.
- Stratégie upsert dans `TourneePlanifieeRepositoryImpl` : mise à jour des champs livreurId, livreurNom, vehiculeId, affecteeLe, statut.

### Interface Layer

- **`POST /api/planification/tournees/{id}/affecter`** (body: `AffecterRequest`) → 200 OK + TourneePlanifieeDTO.
- Codes retour : 200, 404, 409 (livreur ou véhicule déjà affecté, ou tournée lancée).
- **`AffecterRequest`** : record DTO d'entrée (livreurId, livreurNom, vehiculeId).

### Frontend

- **`DetailTourneePlanifieePage.tsx`** — onglet Affectation :
  - Sélecteur livreur (options désactivées si non disponible, libellé "Indisponible — T-042").
  - Sélecteur véhicule (désactivé si pas de livreur sélectionné).
  - Bouton "VALIDER L'AFFECTATION" (désactivé tant que livreur + véhicule non sélectionnés).
  - Bouton "VALIDER ET LANCER" (enchaîne affectation + lancement en 2 appels POST).
  - Confirmation modale avant "VALIDER ET LANCER".
  - Tournée LANCEE : sélecteurs remplacés par affichage lecture seule.

### Erreurs / invariants préservés

- Affectation atomique : les deux champs doivent être sélectionnés pour que le bouton soit actif (UI).
- `PlanificationInvariantException` si statut = LANCEE → HTTP 409.
- Réaffectation d'un livreur sur la même tournée autorisée (remplacement).

## Tests

- **Domaine** : `TourneePlanifieeTest.java` — tests affecter() (statut AFFECTEE, event AffectationEnregistree, NPE si livreurId null, exception si LANCEE, estAffectable).
- **Application** : `AffecterLivreurVehiculeHandlerTest.java` — 4 tests (succès, livreur déjà affecté, véhicule déjà affecté, tournée introuvable).
- **Interface** : `PlanificationControllerTest.java` — 2 tests (200 affectation réussie, 409 livreur déjà affecté).
- **Frontend** : `DetailTourneePlanifieePage.test.tsx` — 5 tests US-023 (onglet, boutons désactivés, livreur indisponible, tournée LANCEE readonly, affectation réussie).
