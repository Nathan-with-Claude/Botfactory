# Implémentation US-009 : Capturer la preuve alternative (photo, tiers, dépôt sécurisé)

## Contexte

**User Story** : En tant que Pierre Morel (livreur terrain), je veux pouvoir choisir une preuve de livraison alternative (photo du colis déposé, dépôt chez un tiers identifié, dépôt dans un endroit sécurisé) sur l'écran M-04, afin de confirmer la livraison même si le destinataire n'est pas présent pour signer.

**Lien US** : `/livrables/05-backlog/user-stories/US-009-capturer-preuve-alternative.md`
**Sprint** : Sprint 1
**Priorité** : Must Have
**Branche git** : `feature/US-001`

### Dépendances

- US-008 (Signature numérique) : implémentée en amont dans la même session — l'infrastructure BC-02 est partagée.
- US-004 (Détail colis) : le bouton "LIVRER CE COLIS" navigue vers M-04 (partagé avec US-008).

---

## Bounded Context et couche ciblée

- **BC principal** : BC-02 — Gestion des Preuves de Livraison
- **BC secondaire** : BC-01 — Orchestration Tournée
- **Aggregate modifié** : `PreuveLivraison` (BC-02) — factory methods pour PHOTO, TIERS_IDENTIFIE, DEPOT_SECURISE
- **Aggregate modifié** : `Tournee` (BC-01) — `confirmerLivraison()` déjà implémenté via US-008
- **Domain Events émis** : `PreuveCapturee` (BC-02), `LivraisonConfirmee` (BC-01) — mêmes que US-008

---

## Décisions d'implémentation

### Scénarios couverts

| SC | Type de preuve | Données requises | Invariant |
|---|---|---|---|
| SC1 | SIGNATURE | `donneesSignature` (base64 non vide) | VO `SignatureNumerique` — implémenté US-008 |
| SC2 | TIERS_IDENTIFIE | `nomTiers` (non vide) | VO `TiersIdentifie` — nom obligatoire |
| SC3 | DEPOT_SECURISE | `descriptionDepot` (non vide) | VO `DepotSecurise` — description obligatoire |
| SC4 | PHOTO | `urlPhoto` (non blank) + `hashIntegrite` optionnel | VO `PhotoPreuve` — URL obligatoire |

### Domain Layer (BC-02) — partagé avec US-008

Les 3 Value Objects spécifiques à US-009 :
- `TiersIdentifie` (record) : `nomTiers` requis — throws `PreuveLivraisonInvariantException` si blank
- `DepotSecurise` (record) : `description` requise — throws si blank
- `PhotoPreuve` (record) : `urlPhoto` non blank + `hashIntegrite` optionnel — throws si URL blank

Factory methods dans `PreuveLivraison` :
- `captureTiers(id, colisId, tourneeId, tiers, coordonnees, horodatage)` → émet `PreuveCapturee(TIERS_IDENTIFIE)`
- `captureDepotSecurise(id, colisId, tourneeId, depot, coordonnees, horodatage)` → émet `PreuveCapturee(DEPOT_SECURISE)`
- `capturePhoto(id, colisId, tourneeId, photo, coordonnees, horodatage)` → émet `PreuveCapturee(PHOTO)`

### Application Layer — partagé avec US-008

`ConfirmerLivraisonCommand` : factory methods `pourTiers()`, `pourDepotSecurise()`, `pourPhoto()`
`ConfirmerLivraisonHandler` : branche `switch typePreuve` appelle la factory appropriée

### Interface Layer — partagé avec US-008

Le même endpoint `POST /api/tournees/{tourneeId}/colis/{colisId}/livraison` accepte les 4 types.
Le `switch` dans `TourneeController` route vers la factory correcte.
Erreurs 400 si `nomTiers` absent pour TIERS_IDENTIFIE, `urlPhoto` absent pour PHOTO, etc.

### Frontend (React Native / Expo) — zone de capture par type

**TIERS_IDENTIFIE** dans `CapturePreuveScreen.tsx` :
- Sélection du type → affichage d'un `TextInput` (testID `champ-nom-tiers`)
- Bouton CONFIRMER activé quand `nomTiers.trim().length > 0`

**DEPOT_SECURISE** dans `CapturePreuveScreen.tsx` :
- Sélection du type → affichage d'un `TextInput` multiline (testID `champ-description-depot`)
- Bouton CONFIRMER activé quand `descriptionDepot.trim().length > 0`

**PHOTO** dans `CapturePreuveScreen.tsx` :
- Sélection du type → affichage d'un bouton "Ouvrir la caméra" (testID `bouton-ouvrir-camera`)
- MVP : la capture caméra native est non implémentée (accès caméra natif + expo-image-picker déféré)
- TODO : intégrer `expo-image-picker` + upload S3 lors de US-010

### Invariants préservés

- Chaque type de preuve nécessite ses données spécifiques — invariant vérifié dans le VO au moment de la construction.
- Aucune donnée croisée n'est obligatoire (ex. TIERS_IDENTIFIE ne nécessite pas de signature).
- Le mode GPS dégradé s'applique à tous les types (hérité de US-008).

---

## Tests

### Backend (JUnit 5 + Mockito)

Les tests US-009 sont inclus dans les mêmes fichiers que US-008 :

| Fichier | Tests US-009 |
|---|---|
| `PreuveLivraisonTest.java` | Factory PHOTO, TIERS_IDENTIFIE, DEPOT_SECURISE ; invariants nomTiers vide, description vide, URL photo vide |
| `ConfirmerLivraisonHandlerTest.java` | Handler pour PHOTO, TIERS_IDENTIFIE, DEPOT_SECURISE |
| `ConfirmerLivraisonControllerTest.java` | Endpoints 200 pour TIERS_IDENTIFIE et DEPOT_SECURISE |

### Mobile (Jest + @testing-library/react-native)

Les tests US-009 sont dans `CapturePreuveScreen.test.tsx` :

| Scénario | Test |
|---|---|
| Affichage champ nom tiers après sélection TIERS_IDENTIFIE | `getByTestId('champ-nom-tiers')` |
| Bouton désactivé si nom tiers vide | `accessibilityState.disabled === true` |
| Bouton actif quand nom tiers renseigné | `changeText` + `disabled === false` |
| Appel `confirmerLivraison` avec `nomTiers` | `expect.objectContaining({ nomTiers: 'Mme Leroy' })` |
| Affichage champ description dépôt après sélection DEPOT_SECURISE | `getByTestId('champ-description-depot')` |
| Bouton désactivé si description vide | `disabled === true` |
| Bouton actif quand description saisie | `changeText` + `disabled === false` |
| Bouton caméra visible après sélection PHOTO | `getByTestId('bouton-ouvrir-camera')` |

**Résultats** : 93/93 tests Jest verts (19 tests `CapturePreuveScreen` couvrant US-008 et US-009).

---

## Décisions architecturales notables

| Décision | Justification |
|---|---|
| US-008 et US-009 implémentées dans le même vertical slice technique | Partagent l'intégralité du stack BC-02 (Aggregate, Repository, Handler, Controller, écran M-04) — séparer en deux branches aurait créé des dépendances de merge complexes. |
| Capture photo MVP = bouton caméra non fonctionnel | `expo-image-picker` + upload S3 sont des dépendances infra non encore provisionnées. Le VO `PhotoPreuve` et la factory `capturePhoto()` sont prêts côté backend. Integration mobile déférée à US-010 (Consulter preuve). |
| Nom du tiers transmis en clair dans la preuve | Conformité RGPD déférée — le nom du tiers est nécessaire pour la traçabilité de livraison (contractuel). Revue lors de l'audit RGPD phase 2. |
