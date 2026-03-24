# Implémentation US-007 : Clôturer ma tournée et consulter le récapitulatif

## Contexte

En tant que Pierre Morel (livreur terrain), je veux clôturer ma tournée une fois tous mes colis traités et voir immédiatement un récapitulatif de ma journée (livrés, échecs, incidents), afin de confirmer officiellement la fin de ma tournée dans le SI.

- US source : /livrables/05-backlog/user-stories/US-007-cloture-tournee.md
- Wireframe : /livrables/02-ux/wireframes.md (écran M-02 bouton "Clôturer", écran M-07 récapitulatif)
- Architecture : /livrables/04-architecture-technique/architecture-applicative.md

Note de session : US-006 (Mode offline, taille L = 8 points) a été écartée de cette session car trop volumineuse (WatermelonDB, sync queue, idempotence backend, store objet). US-007 (taille S = 3 points) a été implémentée à la place, conformément à la note dans la mission.

## Bounded Context et couche ciblée

- **BC** : BC-01 Orchestration de Tournée (Core Domain)
- **Aggregate(s) modifiés** : Tournée (ajout de `cloturerTournee()`)
- **Value Objects ajoutés** : `RecapitulatifTournee` (domain)
- **Domain Events émis** : `TourneeCloturee`

## Décisions d'implémentation

### Domain Layer

- **`RecapitulatifTournee`** (Value Object, `domain/model/`) : encapsule les compteurs de clôture (colisTotal, colisLivres, colisEchecs, colisARepresenter). Méthode factory statique `calculer(List<Colis>)`.
- **`TourneeCloturee`** (Domain Event, `domain/events/`) : immuable, horodaté, porte tourneeId + livreurId + RecapitulatifTournee.
- **`Tournee.cloturerTournee()`** : méthode ajoutée à l'Aggregate Root. Invariants préservés :
  - Lève `TourneeInvariantException` si au moins un colis est en statut `A_LIVRER`.
  - Idempotent : si la tournée est déjà en statut `CLOTUREE`, retourne le récapitulatif sans ré-émettre l'événement.
  - Émet `TourneeCloturee` avec le recap calculé.

### Application Layer

- **`CloturerTourneeCommand`** : transporte `TourneeId`.
- **`CloturerTourneeResult`** (renommé `RecapitulatifTourneeResult` pour éviter la collision avec `domain.model.RecapitulatifTournee`) : DTO de résultat retourné par le handler, traduit depuis `Tournee` + `domain.RecapitulatifTournee`.
- **`CloturerTourneeHandler`** : orchestre chargement → `cloturerTournee()` → sauvegarde → publication events → retour DTO.

### Infrastructure Layer

- Pas de modification : la méthode `TourneeRepositoryImpl.save()` met déjà à jour le statut de la tournée via `TourneeMapper.updateStatut()` — compatible avec `CLOTUREE`.

### Interface Layer (backend)

- **Nouvel endpoint** : `POST /api/tournees/{tourneeId}/cloture`
  - 200 : `RecapitulatifTourneeDTO` (JSON) si clôture réussie
  - 404 : tournée introuvable
  - 409 : au moins un colis en statut A_LIVRER (invariant violé)
  - 401 : non authentifié
- **`RecapitulatifTourneeDTO`** (interface/dto/) : DTO de réponse, traduit depuis `RecapitulatifTourneeResult`.
- `TourneeController` enrichi avec `CloturerTourneeHandler` (4e paramètre constructeur).
- Tests controllers existants (`TourneeControllerTest`, `DetailColisControllerTest`, `EchecLivraisonControllerTest`) mis à jour avec `@MockBean CloturerTourneeHandler`.

### Frontend Mobile

- **`RecapitulatifTourneeDTO`** ajouté dans `tourneeTypes.ts`.
- **`cloturerTournee(tourneeId)`** ajouté dans `tourneeApi.ts` (POST /cloture). Erreurs spécifiques : `ColisEncoreALivrerError` (409).
- **`RecapitulatifTourneeScreen`** (nouvel écran M-07) :
  - Appelle `cloturerTournee()` au montage.
  - Affiche : bandeau "Tournée clôturée !", compteurs (total/livrés/échecs/à représenter), micro-enquête satisfaction (notes 1-5), bouton "Terminer".
  - États : chargement (spinner), succès (recap), erreur (message).
- **`ListeColisScreen`** mis à jour :
  - `NavigationColis` étendu avec `{ ecran: 'recapitulatif'; tourneeId: string }`.
  - Bouton "Clôturer" connecté : navigue vers `RecapitulatifTourneeScreen`.
  - Bouton masqué si `tournee.statut === 'CLOTUREE'`.
  - Après "Terminer" : retour à la liste + rechargement.

### Erreurs / invariants préservés

- Invariant domain : impossible de clôturer si colis encore A_LIVRER → HTTP 409 → message mobile.
- Idempotence domain : `cloturerTournee()` sur une tournée déjà CLOTUREE retourne le recap sans événement.
- US-006 (offline) : le scénario "clôture bloquée si file de sync non vide" n'est pas implémenté — dépend de US-006. Un TODO est laissé dans le code.

## Commandes pour tester manuellement

```bash
# 1. Lancer le backend
JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-25.0.2.10-hotspot" \
  mvn -f src/backend/svc-tournee/pom.xml spring-boot:run -Dspring-boot.run.profiles=dev

# 2. Lancer l'app mobile (Android émulateur)
cd src/mobile && npx expo start

# 3. Appeler directement l'endpoint de clôture (curl)
# D'abord récupérer le tourneeId via GET /api/tournees/today
curl -s http://localhost:8081/api/tournees/today | python -m json.tool | grep tourneeId

# Clôturer (remplacer {tourneeId})
curl -s -X POST http://localhost:8081/api/tournees/{tourneeId}/cloture \
  -H "Content-Type: application/json" | python -m json.tool

# Résultat attendu (si colis encore A_LIVRER en dev) : 409 Conflict
# Résultat attendu (si tous traités) : 200 avec recap JSON
```

## Tests

### Backend — 13 nouveaux tests (TDD)

| Fichier | Tests | Type |
|---|---|---|
| `domain/TourneeTest.java` | 4 tests `cloturerTournee()` | Unitaire domain |
| `application/CloturerTourneeHandlerTest.java` | 5 tests | Unitaire application |
| `interfaces/CloturerTourneeControllerTest.java` | 4 tests (200/404/409/401) | Intégration Web MVC |

**Total backend : 67 tests verts (54 existants + 13 nouveaux)**

### Mobile — 10 nouveaux tests (TDD)

| Fichier | Tests | Type |
|---|---|---|
| `src/__tests__/RecapitulatifTourneeScreen.test.tsx` | 10 tests | Unitaire Jest/RNTL |

**Total mobile : 74 tests verts (64 existants + 10 nouveaux)**
