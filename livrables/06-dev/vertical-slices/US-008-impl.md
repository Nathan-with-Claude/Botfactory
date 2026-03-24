# Implémentation US-008 : Capturer la signature numérique du destinataire

## Contexte

**User Story** : En tant que Pierre Morel (livreur terrain), je veux capturer la signature numérique du destinataire sur mon écran M-04 ("Preuve de livraison"), afin de confirmer officiellement la livraison d'un colis.

**Lien US** : `/livrables/05-backlog/user-stories/US-008-capturer-signature.md`
**Sprint** : Sprint 1
**Priorité** : Must Have
**Branche git** : `feature/US-001`

### Dépendances

- US-004 (Détail colis) : le bouton "LIVRER CE COLIS" sur M-03 navigue vers M-04.
- US-005 (Déclarer échec) : architecture de navigation interne `ListeColisScreen` déjà établie.

---

## Bounded Context et couche ciblée

- **BC principal** : BC-02 — Gestion des Preuves de Livraison (collocalisé dans `svc-tournee` pour le MVP)
- **BC secondaire** : BC-01 — Orchestration Tournée (l'Aggregate `Tournee` est mis à jour)
- **Aggregate créé** : `PreuveLivraison` (BC-02)
- **Aggregate modifié** : `Tournee` (BC-01) — méthode `confirmerLivraison()`
- **Domain Events émis** :
  - `PreuveCapturee` (BC-02) — émis par `PreuveLivraison`
  - `LivraisonConfirmee` (BC-01) — émis par `Tournee`

---

## Décisions d'implémentation

### Domain Layer (BC-02)

**Nouveaux types et Value Objects** dans `domain/preuves/model/` :
- `TypePreuve` (enum) : SIGNATURE, PHOTO, TIERS_IDENTIFIE, DEPOT_SECURISE
- `PreuveLivraisonId` (record VO) : UUID immutable avec factory `generate()`
- `Coordonnees` (record VO) : latitude + longitude avec validation
- `SignatureNumerique` (record VO) : `byte[] donneesBase64` — throws `PreuveLivraisonInvariantException` si vide
- `PhotoPreuve` (record VO) : `urlPhoto` + `hashIntegrite` — throws si URL blank
- `TiersIdentifie` (record VO) : `nomTiers` requis
- `DepotSecurise` (record VO) : `description` requise
- `PreuveLivraisonInvariantException` : `RuntimeException` pour les violations d'invariants BC-02

**Aggregate Root** : `PreuveLivraison`
- Immuable après création (no setters, private constructor)
- 4 factory methods statiques : `captureSignature()`, `capturePhoto()`, `captureTiers()`, `captureDepotSecurise()`
- Chaque factory émet `PreuveCapturee` dans la liste interne des events
- `isModeDegradeGps()` : true si `coordonnees == null`
- `pullDomainEvents()` : retourne + vide la liste interne

**Domain Event** : `PreuveCapturee` dans `domain/preuves/events/`
- Champs : `preuveLivraisonId`, `colisId`, `tourneeId`, `type`, `coordonnees`, `modeDegradeGps`, `horodatage`

**Domain Event** : `LivraisonConfirmee` dans `domain/events/`
- Champs : `tourneeId`, `colisId`, `preuveLivraisonId`, `horodatage`

**Repository interface** : `PreuveLivraisonRepository` dans `domain/preuves/repository/`
- `save(PreuveLivraison)`, `findById(PreuveLivraisonId)`, `findByColisId(String)`

**Modification Aggregate `Tournee`** :
- Nouvelle méthode `confirmerLivraison(ColisId colisId, PreuveLivraisonId preuveLivraisonId)` :
  - Invariant : `preuveLivraisonId` non null
  - Invariant : le colis doit exister dans la tournée
  - Invariant : transition A_LIVRER → LIVRE seulement (throws `TourneeInvariantException` sinon)
  - Émet `LivraisonConfirmee`

### Application Layer

**Nouveau Command** : `ConfirmerLivraisonCommand`
- Champs : `tourneeId`, `livreurId`, `colisId`, `typePreuve`, `coordonnees`, `donneesSignature`, `urlPhoto`, `hashIntegrite`, `nomTiers`, `descriptionDepot`
- 4 factory methods : `pourSignature()`, `pourPhoto()`, `pourTiers()`, `pourDepotSecurise()`

**Nouveau Handler** : `ConfirmerLivraisonHandler`
- Orchestration :
  1. Charger la `Tournee` via `TourneeRepository` (404 si introuvable)
  2. Vérifier que le colis existe dans la tournée (404 si introuvable)
  3. Créer `PreuveLivraison` via la factory appropriée
  4. Appeler `tournee.confirmerLivraison(colisId, preuve.getId())`
  5. Sauvegarder `PreuveLivraison` via `PreuveLivraisonRepository`
  6. Sauvegarder `Tournee` via `TourneeRepository`
  7. Retourner `PreuveLivraisonDTO`

### Infrastructure Layer

**Nouvelle Entity JPA** : `PreuveLivraisonEntity`
- Table : `preuves_livraison`
- Colonnes : `id`, `colis_id`, `tournee_id`, `type_preuve`, `horodatage`, `latitude`, `longitude`, `mode_degrade_gps`, `donnees_signature` (BYTEA), `url_photo`, `hash_integrite`, `nom_tiers`, `description_depot`

**Nouveaux composants** :
- `PreuveLivraisonJpaRepository` (extends `JpaRepository<PreuveLivraisonEntity, String>`)
- `PreuveLivraisonMapper` : `toEntity()` + `toDomain()`
- `PreuveLivraisonRepositoryImpl` (`@Repository`)

### Interface Layer

**Nouveau DTO entrant** : `ConfirmerLivraisonRequest` (record)
- Champs : `typePreuve`, `coordonneesGps`, `donneesSignature`, `urlPhoto`, `hashIntegrite`, `nomTiers`, `descriptionDepot`

**Nouveau DTO sortant** : `PreuveLivraisonDTO` (record)
- Champs : `preuveLivraisonId`, `colisId`, `typePreuve`, `horodatage`, `modeDegradeGps`
- Factory : `from(PreuveLivraison)`

**Nouveau endpoint** : `POST /api/tournees/{tourneeId}/colis/{colisId}/livraison`
- 200 OK + `PreuveLivraisonDTO`
- 404 si tournée ou colis introuvable
- 409 si transition de statut interdite (`TourneeInvariantException`)
- 400 si données de preuve invalides (`PreuveLivraisonInvariantException` | `IllegalArgumentException`)

**Modification `TourneeController`** :
- `ConfirmerLivraisonHandler` injecté par constructeur
- Tout le bloc `switch typePreuve + handler call` dans un même `try/catch` unique

### Frontend (React Native / Expo)

**Nouveau type API** dans `tourneeTypes.ts` :
- `TypePreuve` (union : SIGNATURE | PHOTO | TIERS_IDENTIFIE | DEPOT_SECURISE)
- `TYPE_PREUVE_LABELS` (Record<TypePreuve, string>)
- `CoordonneesGPS` (interface : latitude, longitude)
- `ConfirmerLivraisonRequest` (interface)
- `PreuveLivraisonDTO` (interface)

**Nouveau client API** dans `tourneeApi.ts` :
- `confirmerLivraison(tourneeId, colisId, request)` → `Promise<PreuveLivraisonDTO>`
- `LivraisonDejaConfirmeeError` (409)
- `DonneesPreuveInvalidesError` (400)

**Nouvel écran** : `CapturePreuveScreen.tsx` (écran M-04)
- Props : `tourneeId`, `colisId`, `destinataireNom`, `onRetour`, `onLivraisonConfirmee`
- 4 sélecteurs de type de preuve (radio buttons) avec testID `type-preuve-{TYPE}`
- Zone de capture dynamique selon le type sélectionné (signature MVP = TouchableOpacity)
- Bouton CONFIRMER désactivé tant qu'aucune preuve n'est capturée
- testID : `capture-preuve-screen`, `contexte-colis`, `pad-signature`, `bouton-effacer-signature`, `bouton-confirmer-livraison`, `message-erreur`, `bouton-retour`
- Header vert (#2E7D32), titre "Preuve de livraison"

**Modification `ListeColisScreen.tsx`** :
- Import `CapturePreuveScreen`
- Ajout variant `preuve` dans `NavigationColis`
- Callbacks `ouvrirCapturePreuve()` et `revenirAuDetailDepuisPreuve()`
- Rendu `navigation.ecran === 'preuve'`
- `DetailColisScreen` reçoit `onLivrer={ouvrirCapturePreuve}`

### Invariants préservés

- `PreuveLivraison` immuable après création : aucun setter, constructor privé.
- Un colis ne peut passer à LIVRE que depuis A_LIVRER (`TourneeInvariantException` sinon).
- Une signature vide (`donneesBase64` nul ou vide) est rejetée à la création du VO (`PreuveLivraisonInvariantException`).
- GPS mode dégradé : `coordonnees == null` → `modeDegradeGps = true` dans `PreuveCapturee`.

---

## Tests

### Backend (JUnit 5 + Mockito)

| Fichier | Type | Tests |
|---|---|---|
| `PreuveLivraisonTest.java` | Unitaire (Domain) | 12 tests : factory signature, photo, tiers, depot, events, invariants GPS |
| `ConfirmerLivraisonHandlerTest.java` | Unitaire (Application) | 8 tests : signature, photo, tiers, depot, tournée introuvable, colis introuvable |
| `ConfirmerLivraisonControllerTest.java` | Intégration web (`@WebMvcTest`) | 8 tests : 200, 404 tournée, 404 colis, 409, 400 signature invalide |

**Résultats** : 97/97 tests backend verts (incl. toutes les suites existantes).

### Mobile (Jest + @testing-library/react-native)

| Fichier | Type | Tests |
|---|---|---|
| `CapturePreuveScreen.test.tsx` | Unitaire (React Native) | 19 tests : rendu initial, types de preuve, SIGNATURE (pad + effacer + confirmer), erreur API |

**Résultats** : 93/93 tests Jest verts.

---

## Décisions architecturales notables

| Décision | Justification |
|---|---|
| BC-02 collocalisé dans `svc-tournee` (package `preuves/`) | MVP : coût de déploiement d'un second service non justifié pour la taille. TODO : extraire vers `svc-gestion-preuves` quand BC-02 grandit. |
| Pad signature MVP = TouchableOpacity (simulé) | `react-native-signature-canvas` non installé. Le composant expose un event `onSignatureCapturee` pour la testabilité. Intégration réelle déférée à US-010. |
| Collect-and-publish pour les Domain Events BC-02 | Cohérence avec BC-01 — les events sont publiés par le Handler après sauvegarde, pas par l'Aggregate. |
| GPS mode dégradé explicitement modélisé | `Coordonnees` est nullable dans `PreuveLivraison` ; `isModeDegradeGps()` retourne vrai si null. Le DTO expose `modeDegradeGps: boolean` pour la traçabilité. |
