# Implémentation US-005 : Déclarer un échec de livraison

## Contexte

US-005 — "Déclarer un échec de livraison avec motif normalisé et disposition"
Spec : `/livrables/05-backlog/user-stories/US-005-declarer-echec-livraison.md`
Wireframe : `/livrables/02-ux/wireframes.md#écran-m-05--déclaration-dun-échec-de-livraison`
Architecture : `/livrables/04-architecture-technique/architecture-applicative.md`
Domain model : `/livrables/03-architecture-metier/domain-model.md`

Branche : `feature/US-001`

## Bounded Context et couche ciblée

- **BC** : BC-01 Orchestration de Tournée (Core Domain)
- **Aggregate modifié** : Tournée (Aggregate Root), Colis (Entity)
- **Domain Events émis** : `EchecLivraisonDeclare` (avec tourneeId, colisId, motif, disposition, noteLibre, horodatage)

## Décisions d'implémentation

### Domain Layer

**Value Objects créés :**
- `MotifNonLivraison` (enum) : ABSENT, ACCES_IMPOSSIBLE, REFUS_CLIENT, HORAIRE_DEPASSE
  — Ubiquitous Language exact du domain-model.md.
- `Disposition` (enum) : A_REPRESENTER, DEPOT_CHEZ_TIERS, RETOUR_DEPOT

**Domain Event créé :**
- `EchecLivraisonDeclare` (record immuable) :
  - Champs : tourneeId, colisId, motif, disposition, noteLibre (nullable, max 250 car.), horodatage
  - Factory method `EchecLivraisonDeclare.of(...)` pour horodatage automatique
  - Invariant : `noteLibre` > 250 caractères → `IllegalArgumentException` à la construction

**Aggregate Tournée enrichi :**
- Méthode `declarerEchecLivraison(ColisId, MotifNonLivraison, Disposition, noteLibre)` :
  - Invariants appliqués : motif obligatoire, disposition obligatoire, transition A_LIVRER → ECHEC uniquement
  - Lève `TourneeInvariantException` si colis inconnu, transition interdite (ECHEC→ECHEC, LIVRE→ECHEC), ou paramètre obligatoire null
  - Met à jour le statut, le motif et la disposition sur le `Colis`
  - Émet `EchecLivraisonDeclare` (pattern collect-and-publish)

**Entity Colis enrichie :**
- Nouveau constructeur étendu : `Colis(id, tourneeId, statut, adresse, destinataire, contraintes, motifNonLivraison, disposition)` — pour la reconstruction depuis la persistance
- Getters : `getMotifNonLivraison()`, `getDisposition()`
- Setters package-private : `setMotifNonLivraison()`, `setDisposition()` — accessibles uniquement par `Tournee`

### Application Layer

- `DeclarerEchecLivraisonCommand` (record) : tourneeId, colisId, motif, disposition, noteLibre
- `DeclarerEchecLivraisonHandler` (@Service @Transactional) :
  1. Charge la Tournée par ID (TourneeNotFoundException si absente)
  2. Vérifie l'existence du colis (ColisNotFoundException si absent)
  3. Délègue à `Tournee.declarerEchecLivraison()` (contient les invariants)
  4. Sauvegarde la Tournée
  5. Publie les Domain Events (`pullDomainEvents()`) — TODO US-017 : Kafka/OMS

### Infrastructure Layer

**`ColisEntity` enrichie :**
- Colonnes JPA ajoutées : `motif_non_livraison` (ENUM STRING, nullable), `disposition` (ENUM STRING, nullable)
- Ces colonnes sont null si statut != ECHEC

**`TourneeMapper` enrichi :**
- `colisToDomain()` : lit motifNonLivraison et disposition depuis ColisEntity → Colis étendu
- `colisToEntity()` : persiste motifNonLivraison et disposition
- `updateStatut()` : met à jour statut + motif + disposition pour chaque colis de la tournée (correctif important pour la sauvegarde partielle)

### Interface Layer

**DTO créés :**
- `DeclarerEchecRequest` (record) : motif, disposition, noteLibre
  — Reçu en body de la requête POST

**`ColisDTO` enrichi :**
- Champs ajoutés : `motifNonLivraison` (nullable), `disposition` (nullable)
- Serialisés dans le JSON de réponse uniquement si non-nuls (statut ECHEC)

**Endpoint ajouté dans `TourneeController` :**
- `POST /api/tournees/{tourneeId}/colis/{colisId}/echec`
  - 200 : ColisDTO avec statut ECHEC, motif, disposition
  - 404 : tournée ou colis introuvable
  - 409 : transition de statut interdite (TourneeInvariantException)
  - 401 : non authentifié

### Frontend Mobile

**Types enrichis (`tourneeTypes.ts`) :**
- `MotifNonLivraison` (union type) + `MOTIF_LABELS` (labels UX)
- `Disposition` (union type) + `DISPOSITION_LABELS` (labels UX)
- `ColisDTO` : champs `motifNonLivraison` et `disposition` ajoutés (nullable)
- `DeclarerEchecRequest` (interface pour le body POST)

**API enrichie (`tourneeApi.ts`) :**
- `declarerEchecLivraison(tourneeId, colisId, request)` : POST vers le backend
- `EchecDejaDeClareError` : erreur métier pour le cas 409

**Écran M-05 créé (`DeclarerEchecScreen.tsx`) :**
- Header rouge + bouton retour
- Rappel du contexte (colis ID + destinataire)
- 4 boutons radio motif (obligatoire)
- 3 boutons radio disposition (obligatoire)
- Champ note optionnelle avec compteur (max 250)
- Bouton "ENREGISTRER L'ECHEC" : désactivé tant que motif + disposition non sélectionnés
- Après succès : `onEchecEnregistre()` → retour à la liste rechargée
- Cas erreur 409 : message "Échec déjà déclaré pour ce colis"

**Navigation enrichie (`ListeColisScreen.tsx`) :**
- `NavigationColis` étendue : nouvel état `{ ecran: 'echec', tourneeId, colisId, destinataireNom }`
- `ouvrirDeclarerEchec(colisId)` : navigue vers M-05
- `revenirAuDetailDepuisEchec()` : retour à la liste + rechargement
- `DetailColisScreen` reçoit maintenant `onEchec={ouvrirDeclarerEchec}` (bouton "DECLARER UN ECHEC" fonctionnel)

### Erreurs / invariants préservés

| Invariant | Où appliqué | Comportement |
|---|---|---|
| Motif obligatoire | `Tournee.declarerEchecLivraison()` | `TourneeInvariantException` → HTTP 409 |
| Disposition obligatoire | `Tournee.declarerEchecLivraison()` | `TourneeInvariantException` → HTTP 409 |
| Transition A_LIVRER → ECHEC uniquement | `Tournee.declarerEchecLivraison()` | `TourneeInvariantException` → HTTP 409 |
| Colis déjà ECHEC | `Tournee.declarerEchecLivraison()` | `TourneeInvariantException` → HTTP 409 |
| Colis LIVRE non modifiable | `Tournee.declarerEchecLivraison()` | `TourneeInvariantException` → HTTP 409 |
| Note max 250 car. | `EchecLivraisonDeclare` constructor | `IllegalArgumentException` |
| Bouton désactivé si motif/disposition manquant | `DeclarerEchecScreen` (frontend) | Bouton grisé, inaccessible |

## Commandes de lancement (tests manuels)

### Démarrer le backend

```bash
cd src/backend/svc-tournee
JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-25.0.2.10-hotspot" mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Backend accessible sur : `http://localhost:8081`

### Tester l'endpoint manuellement

```bash
# Déclarer un échec
curl -X POST http://localhost:8081/api/tournees/tournee-dev-001/colis/colis-dev-001/echec \
  -H "Content-Type: application/json" \
  -d '{"motif":"ABSENT","disposition":"A_REPRESENTER","noteLibre":"Portail fermé"}'

# Tenter un 2e échec sur le même colis (doit retourner 409)
curl -X POST http://localhost:8081/api/tournees/tournee-dev-001/colis/colis-dev-001/echec \
  -H "Content-Type: application/json" \
  -d '{"motif":"REFUS_CLIENT","disposition":"RETOUR_DEPOT"}'
```

### Démarrer le frontend mobile

```bash
cd src/mobile
npx expo start
```

Application accessible sur : `http://localhost:8082` (web) ou via l'émulateur Android.
Flux US-005 : Liste M-02 → Colis A_LIVRER → Détail M-03 → "DECLARER UN ECHEC" → Formulaire M-05 → Enregistrer → retour M-02 avec statut ECHEC.

## Tests

### Tests unitaires backend (20 tests ajoutés)

| Fichier | Tests | Description |
|---|---|---|
| `domain/DeclarerEchecLivraisonTest.java` | 10 | Tests domain : transitions, invariants, events |
| `application/DeclarerEchecLivraisonHandlerTest.java` | 5 | Tests application : orchestration, exceptions |
| `interfaces/EchecLivraisonControllerTest.java` | 5 | Tests REST : 200, 404, 409, 401 |

Tests backend totaux : **54** (34 existants + 20 nouveaux), tous verts.

### Tests Jest frontend (14 tests ajoutés)

| Fichier | Tests | Description |
|---|---|---|
| `__tests__/DeclarerEchecScreen.test.tsx` | 14 | Rendu, bouton désactivé, soumission, erreurs, note |

Tests Jest totaux : **64** (50 existants + 14 nouveaux), tous verts.
