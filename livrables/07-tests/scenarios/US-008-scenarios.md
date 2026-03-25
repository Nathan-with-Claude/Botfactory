# Scénarios de tests US-008 — Capturer la signature numérique

**US liée** : US-008
**Titre** : Capturer la signature numérique du destinataire
**Bounded Context** : BC-02 Gestion des Preuves de Livraison
**Aggregate / Domain Event ciblé** : PreuveLivraison / PreuveCapturee + Tournee / LivraisonConfirmee
**Agent** : @qa
**Date** : 2026-03-24
**Version** : 1.1 (mis à jour 2026-03-25 après exécution)

---

### TC-270 : Affichage de l'écran M-04 (CapturePreuveScreen) depuis M-03

**US liée** : US-008
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : CapturePreuveScreen — testID="capture-preuve-screen"
**Type** : Fonctionnel (happy path)
**Préconditions** : Écran M-03 (DetailColisScreen) affiché pour un colis A_LIVRER
**Étapes** :
1. Charger l'application et naviguer vers le détail d'un colis A_LIVRER
2. Cliquer sur "LIVRER CE COLIS"
3. Observer l'écran M-04

**Résultat attendu** : L'écran M-04 (CapturePreuveScreen) est affiché avec les 4 types de preuve et le contexte du colis
**Statut** : Échoué

```gherkin
Given Pierre est sur l'écran M-03 (Detail du colis) pour un colis A_LIVRER
When Pierre clique sur "LIVRER CE COLIS"
Then l'écran M-04 (CapturePreuveScreen, testID="capture-preuve-screen") est affiché
And le contexte du colis (destinataireNom, testID="contexte-colis") est visible
And les 4 types de preuve sont disponibles (SIGNATURE, PHOTO, TIERS_IDENTIFIE, DEPOT_SECURISE)
```

**Cause d'échec** : Le testID `liste-colis-screen` n'est pas disponible dans le timeout de 5s — le SplashScreen Expo est affiché pendant 3-4s avant la liste de colis.

---

### TC-271 : Capture de signature — pad visible après sélection SIGNATURE

**US liée** : US-008
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : CapturePreuveScreen — testID="pad-signature"
**Type** : Fonctionnel
**Préconditions** : Écran M-04 affiché
**Étapes** :
1. Sélectionner le type de preuve "SIGNATURE" (testID="type-preuve-SIGNATURE")
2. Observer le pad de signature

**Résultat attendu** : Le pad de signature (testID="pad-signature") est affiché. Le bouton CONFIRMER est désactivé tant que la signature n'est pas capturée.
**Statut** : Passé

```gherkin
Given Pierre est sur l'écran M-04 (CapturePreuveScreen)
When Pierre sélectionne le type de preuve "SIGNATURE"
Then le pad de signature (testID="pad-signature") est affiché
And le bouton CONFIRMER (testID="bouton-confirmer-livraison") est désactivé
And le bouton "Effacer" (testID="bouton-effacer-signature") est visible
```

---

### TC-272 : Confirmation livraison par signature — émission de PreuveCapturee et LivraisonConfirmee

**US liée** : US-008
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : PreuveLivraison.captureSignature() / PreuveCapturee + Tournee.confirmerLivraison() / LivraisonConfirmee
**Type** : Fonctionnel / Domain Events
**Préconditions** : Backend svc-tournee en profil dev, colis A_LIVRER disponible
**Étapes** :
1. Appeler POST /api/tournees/{tourneeId}/colis/{colisId}/livraison avec typePreuve=SIGNATURE et donneesSignature valides
2. Vérifier la réponse

**Résultat attendu** : HTTP 200 avec PreuveLivraisonDTO (preuveLivraisonId, colisId, typePreuve=SIGNATURE, horodatage)
**Statut** : Passé

```gherkin
Given un colis A_LIVRER existe dans la tournée du DevDataSeeder
When POST /api/tournees/{tourneeId}/colis/{colisId}/livraison est appelé avec typePreuve=SIGNATURE et donneesSignature (base64 non vide)
Then la réponse est HTTP 200
And le corps contient "preuveLivraisonId", "colisId", "typePreuve"="SIGNATURE", "horodatage"
And PreuveCapturee est émis par PreuveLivraison
And LivraisonConfirmee est émis par Tournee (statut colis → LIVRE)
```

---

### TC-273 : Invariant — signature vide rejetée avec HTTP 400

**US liée** : US-008
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : SignatureNumerique VO — PreuveLivraisonInvariantException
**Type** : Invariant domaine
**Préconditions** : Backend svc-tournee en profil dev
**Étapes** :
1. Appeler POST /api/tournees/{tourneeId}/colis/{colisId}/livraison avec typePreuve=SIGNATURE et donneesSignature vide/null
2. Vérifier la réponse

**Résultat attendu** : HTTP 400 Bad Request — la signature vide est rejetée par l'invariant du VO
**Statut** : Passé

```gherkin
Given un colis A_LIVRER existe dans la tournée du DevDataSeeder
When POST /livraison est appelé avec typePreuve=SIGNATURE et donneesSignature vide
Then la réponse est HTTP 400 Bad Request
And PreuveLivraisonInvariantException est levée par le domaine
And aucune PreuveLivraison n'est persistée
```

---

### TC-274 : Invariant — transition de statut illégale (colis LIVRE → LIVRE) rejetée HTTP 409

**US liée** : US-008
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : Tournee.confirmerLivraison() — TourneeInvariantException si statut ≠ A_LIVRER
**Type** : Invariant domaine
**Préconditions** : Colis déjà LIVRE dans le DevDataSeeder (colis-001)
**Étapes** :
1. Appeler POST /livraison sur un colis déjà LIVRE
2. Vérifier la réponse

**Résultat attendu** : HTTP 409 Conflict — la transition A_LIVRER → LIVRE est la seule autorisée
**Statut** : Passé

```gherkin
Given le colis colis-s-001 est en statut LIVRE
When POST /api/tournees/{tourneeId}/colis/colis-s-001/livraison est appelé
Then la réponse est HTTP 409 Conflict
And TourneeInvariantException est levée par le domaine
And le statut du colis reste LIVRE
```

---

### TC-275 : GPS mode dégradé — modeDegradeGps=true si coordonnées absentes

**US liée** : US-008
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : PreuveLivraison.isModeDegradeGps() / PreuveCapturee(modeDegradeGps=true)
**Type** : Edge case
**Préconditions** : Backend svc-tournee en profil dev, colis A_LIVRER disponible
**Étapes** :
1. Appeler POST /livraison sans coordonneesGps (null)
2. Vérifier modeDegradeGps dans la réponse

**Résultat attendu** : HTTP 200 avec modeDegradeGps=true dans le DTO
**Statut** : Passé

```gherkin
Given un colis A_LIVRER est disponible
When POST /livraison est appelé avec typePreuve=SIGNATURE et coordonneesGps absentes (null)
Then la réponse est HTTP 200
And "modeDegradeGps" = true dans le PreuveLivraisonDTO
And la preuve est persistée avec latitude=null et longitude=null
```

---

### TC-276 : Bouton CONFIRMER désactivé tant que signature non capturée (UI)

**US liée** : US-008
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : CapturePreuveScreen — validation UI
**Type** : Fonctionnel
**Préconditions** : Écran M-04 avec type SIGNATURE sélectionné
**Étapes** :
1. Sélectionner SIGNATURE sur l'écran M-04
2. Ne pas signer (pad vide)
3. Observer l'état du bouton CONFIRMER

**Résultat attendu** : Le bouton CONFIRMER est désactivé tant que le pad est vide
**Statut** : Passé

```gherkin
Given Pierre est sur l'écran M-04 avec le type SIGNATURE sélectionné
When le pad de signature est vide (aucune signature capturée)
Then le bouton "CONFIRMER" (testID="bouton-confirmer-livraison") est désactivé
```
