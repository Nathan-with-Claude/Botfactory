# Implémentation US-024 : Lancer une tournée pour la rendre visible au livreur

## Contexte

En tant que Laurent Renaud, je veux lancer une tournée affectée, afin de la rendre visible dans l'application mobile du livreur concerné et de déclencher le Parcours 1 (exécution livreur).

- Spec : `/livrables/05-backlog/user-stories/US-024-lancer-tournee.md`
- Wireframes : W-04 et W-05 — `/livrables/02-ux/wireframes.md`

## Bounded Context et couche ciblée

- **BC** : BC-07 Planification de Tournée → déclenche BC-01 Orchestration de Tournée
- **Aggregate(s) modifiés** : `TourneePlanifiee.lancer(superviseurId)`
- **Domain Events émis** : `TourneeLancee` (tourneePlanifieeId, codeTms, livreurId, livreurNom, superviseurId, lanceeLe)

## Décisions d'implémentation

### Domain Layer

- **`TourneePlanifiee.lancer()`** : transite AFFECTEE → LANCEE. Lève `PlanificationInvariantException` si statut ≠ AFFECTEE. Irréversible depuis l'interface.
- **`TourneeLancee`** : record Java immuable — événement inter-BC (BC-07 → BC-01).

### Application Layer

- **`LancerTourneeCommand`** / **`LancerTourneeHandler`** :
  - Lance une tournée individuelle → retourne `TourneeLancee`.
  - MVP : l'événement est loggué (`log.info("[BC-07→BC-01] TourneeLancee : ...")`) — simulation bus Kafka.
  - Production : publier sur Kafka → svc-tournee consomme et crée la tournée mobile.
- **`lancerToutesLesTourneesAffectees(String superviseurId)`** : US-024 SC3 (lancement groupé). Itère sur toutes les AFFECTEES du jour.

### Infrastructure Layer

- Partagée avec US-023 (même entity, même repository).
- Champ `lancee` (Instant) persisté dans `TourneePlanifieeEntity`.

### Interface Layer

- **`POST /api/planification/tournees/{id}/lancer`** → 200 + TourneePlanifieeDTO | 404 | 409.
- **`POST /api/planification/plans/{date}/lancer-toutes`** → 200 + `LancerToutesResponse` (nbTourneesLancees + message) | 400 (date invalide).
- Log `[BC-07→BC-01]` dans le controller pour tracer l'événement BC (simulation bus).

### Frontend

- **`PreparationPage.tsx`** (W-04) :
  - Bouton "Lancer" sur chaque ligne AFFECTEE → `POST /lancer` → message succès + rechargement.
  - Bouton "LANCER TOUTES LES TOURNÉES" (bandeau) → visible si affectees > 0 && lancees = 0 → confirmation modale → `POST /lancer-toutes`.
  - Bannière verte "Toutes les tournées ont été lancées" si lancees = totalTournees.
- **`DetailTourneePlanifieePage.tsx`** (W-05) : bouton "VALIDER ET LANCER" dans onglet Affectation (enchaîne POST /affecter + POST /lancer).

### Connexion BC-07 → BC-01 (simulation MVP)

Dans le MVP, `TourneeLancee` est seulement loggué. Le `DevDataSeeder` de `svc-tournee` crée les tournées de test en avance au démarrage. La vraie connexion (Kafka → `svc-tournee` → TourneeChargee) sera implémentée en Sprint 3 avec le bus d'événements.

### Erreurs / invariants préservés

- `PlanificationInvariantException` si statut ≠ AFFECTEE → HTTP 409.
- Idempotence : le bouton "Lancer" n'est plus affiché (remplacé par badge LANCÉE) après lancement.
- Lancement groupé : n'échoue pas si aucune tournée AFFECTEE (retourne 0 lancées).

## Tests

- **Domaine** : `TourneePlanifieeTest.java` — tests lancer() (event TourneeLancee, statut LANCEE, exception si NON_AFFECTEE, exception si LANCEE, clearEvenements).
- **Application** : `LancerTourneeHandlerTest.java` — 4 tests (tournée AFFECTEE → event, NON_AFFECTEE → exception, introuvable → 404, lancement groupé → count).
- **Interface** : `PlanificationControllerTest.java` — 3 tests (200 lancée, 409 non affectée, lancement groupé avec compteur).
- **Frontend** : `PreparationPage.test.tsx` — 2 tests US-024 (bouton LANCER TOUTES, lancement individuel + message succès).

## Commandes de lancement

```bash
# Lancer une tournée individuelle
curl -X POST http://localhost:8082/api/planification/tournees/tp-202/lancer \
  -H "Authorization: Bearer mock-superviseur"
# Réponse : TourneePlanifieeDTO avec statut=LANCEE

# Lancer toutes les tournées affectées
curl -X POST http://localhost:8082/api/planification/plans/$(date +%Y-%m-%d)/lancer-toutes \
  -H "Authorization: Bearer mock-superviseur"
# Réponse : {"nbTourneesLancees": 1, "message": "1 tournée(s) lancée(s) avec succès."}

# Vérifier le plan après lancement
curl http://localhost:8082/api/planification/plans/$(date +%Y-%m-%d) \
  -H "Authorization: Bearer mock-superviseur"
```
