# Implémentation US-022 : Vérifier la composition d'une tournée avant affectation

## Contexte

En tant que Laurent Renaud, je veux consulter le détail de la composition d'une tournée (liste des zones, contraintes horaires, anomalies détectées), afin de détecter les problèmes avant d'affecter un livreur.

- Spec : `/livrables/05-backlog/user-stories/US-022-verifier-composition-tournee.md`
- Wireframe : W-05 onglet Composition — `/livrables/02-ux/wireframes.md`

## Bounded Context et couche ciblée

- **BC** : BC-07 Planification de Tournée (collocalisé dans `svc-supervision`)
- **Aggregate(s) modifiés** : `TourneePlanifiee.verifierComposition()` (méthode de domaine)
- **Domain Events émis** : `CompositionVerifiee` (horodatage + superviseurId)

## Décisions d'implémentation

### Domain Layer

- **`TourneePlanifiee.verifierComposition(String superviseurId)`** : marque `compositionVerifiee = true` et émet `CompositionVerifiee`. Opération non bloquante : une anomalie ne bloque pas la validation (décision de conception délibérée — US-022 invariant).
- **`CompositionVerifiee`** : record Java (tourneePlanifieeId, codeTms, superviseurId, verifieeLe).

### Application Layer

- **`ConsulterDetailTourneePlanifieeQuery`** / **`ConsulterDetailTourneePlanifieeHandler`** : lecture pure, retourne l'Aggregate complet.
- **`ValiderCompositionCommand`** / **`ValiderCompositionHandler`** : orchestre verifierComposition() + save + clearEvenements.
- **`TourneePlanifieeNotFoundException`** : exception applicative → HTTP 404.

### Infrastructure Layer

- Partagée avec US-021 (même entité `TourneePlanifieeEntity`).
- `compositionVerifiee` (boolean) persisté dans la colonne `composition_verifiee`.

### Interface Layer

- **`GET /api/planification/tournees/{id}`** : retourne `TourneePlanifieeDetailDTO` avec zones + contraintes + anomalies.
- **`POST /api/planification/tournees/{id}/composition/valider`** : valide la composition, retourne le détail mis à jour.
- **`TourneePlanifieeDetailDTO`** : DTO enrichi avec contraintes (liste `ContrainteHoraireDTO`) et anomalies (liste `AnomalieDTO`).

### Frontend

- **`DetailTourneePlanifieePage.tsx`** (W-05) : onglet Composition avec zones, contraintes ⚑, bloc anomalies orange, bouton "Valider la vérification" (désactivé si déjà vérifié).
- Badge "✓" sur l'onglet Composition si `compositionVerifiee = true`.

### Erreurs / invariants préservés

- Une anomalie ne bloque pas la validation (choix de conception).
- Le bouton "Valider la vérification" est désactivé (grisé) si `compositionVerifiee` est déjà true.
- HTTP 404 si tournée introuvable.

## Tests

- **Domaine** : `TourneePlanifieeTest.java` — tests verifierComposition (event émis, marque vérifié, non-bloquant avec anomalie).
- **Application** : inclus dans `PlanificationControllerTest.java` (getDetailTourneePlanifiee_retourne_200, retourne_404).
- **Frontend** : `DetailTourneePlanifieePage.test.tsx` — 6 tests US-022 (zones, contraintes, anomalie, aucune anomalie, valider composition, indicateur header).
