# Scénarios de tests US-009 — Capturer la preuve alternative

**US liée** : US-009
**Titre** : Capturer la preuve alternative (photo, tiers, dépôt sécurisé)
**Bounded Context** : BC-02 Gestion des Preuves de Livraison
**Aggregate / Domain Event ciblé** : PreuveLivraison / PreuveCapturee (TIERS_IDENTIFIE, DEPOT_SECURISE, PHOTO)
**Agent** : @qa
**Date** : 2026-03-24
**Version** : 1.0

---

### TC-280 : Sélection TIERS_IDENTIFIE — champ nom du tiers affiché

**US liée** : US-009
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : CapturePreuveScreen — testID="champ-nom-tiers"
**Type** : Fonctionnel
**Préconditions** : Écran M-04 affiché
**Étapes** :
1. Sur l'écran M-04, sélectionner le type "TIERS_IDENTIFIE" (testID="type-preuve-TIERS_IDENTIFIE")
2. Observer le champ affiché

**Résultat attendu** : Le champ de saisie du nom du tiers (testID="champ-nom-tiers") est affiché. Le bouton CONFIRMER est désactivé tant que le champ est vide.
**Statut** : Passé

```gherkin
Given Pierre est sur l'écran M-04 (CapturePreuveScreen)
When Pierre sélectionne le type "TIERS_IDENTIFIE"
Then le champ nom du tiers (testID="champ-nom-tiers") est affiché
And le bouton CONFIRMER est désactivé (nom vide)
```

---

### TC-281 : Confirmation livraison chez tiers — PreuveCapturee(TIERS_IDENTIFIE) émise

**US liée** : US-009
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : PreuveLivraison.captureTiers() / PreuveCapturee
**Type** : Fonctionnel / Domain Event
**Préconditions** : Backend svc-tournee en profil dev, colis A_LIVRER disponible
**Étapes** :
1. Appeler POST /livraison avec typePreuve=TIERS_IDENTIFIE et nomTiers="Mme Leroy"
2. Vérifier la réponse

**Résultat attendu** : HTTP 200, typePreuve=TIERS_IDENTIFIE dans le DTO
**Statut** : Passé

```gherkin
Given un colis A_LIVRER est disponible dans la tournée du DevDataSeeder
When POST /api/tournees/{tourneeId}/colis/{colisId}/livraison est appelé avec typePreuve=TIERS_IDENTIFIE et nomTiers="Mme Leroy"
Then la réponse est HTTP 200
And "typePreuve" = "TIERS_IDENTIFIE" dans le PreuveLivraisonDTO
And PreuveCapturee(TIERS_IDENTIFIE) est émis
```

---

### TC-282 : Invariant — nomTiers vide rejeté avec HTTP 400

**US liée** : US-009
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : TiersIdentifie VO — PreuveLivraisonInvariantException si nomTiers blank
**Type** : Invariant domaine
**Préconditions** : Backend svc-tournee en profil dev
**Étapes** :
1. Appeler POST /livraison avec typePreuve=TIERS_IDENTIFIE et nomTiers vide
2. Vérifier la réponse

**Résultat attendu** : HTTP 400 Bad Request — invariant nomTiers requis
**Statut** : Passé

```gherkin
Given un colis A_LIVRER est disponible
When POST /livraison est appelé avec typePreuve=TIERS_IDENTIFIE et nomTiers=""
Then la réponse est HTTP 400 Bad Request
And PreuveLivraisonInvariantException est levée (nomTiers obligatoire)
```

---

### TC-283 : Sélection DEPOT_SECURISE — champ description affiché et validé

**US liée** : US-009
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : CapturePreuveScreen — testID="champ-description-depot"
**Type** : Fonctionnel
**Préconditions** : Écran M-04 affiché
**Étapes** :
1. Sélectionner "DEPOT_SECURISE" sur l'écran M-04
2. Observer le champ de description
3. Saisir une description
4. Observer l'état du bouton CONFIRMER

**Résultat attendu** : Le champ description (testID="champ-description-depot") est affiché. Le bouton CONFIRMER s'active après saisie.
**Statut** : Passé

```gherkin
Given Pierre est sur l'écran M-04
When Pierre sélectionne "DEPOT_SECURISE"
Then le champ description (testID="champ-description-depot") est affiché
And le bouton CONFIRMER est désactivé (description vide)
When Pierre saisit "Devant la porte palière"
Then le bouton CONFIRMER est actif
```

---

### TC-284 : Confirmation livraison en dépôt sécurisé — PreuveCapturee(DEPOT_SECURISE) émise

**US liée** : US-009
**Couche testée** : Application (API directe)
**Aggregate / Domain Event ciblé** : PreuveLivraison.captureDepotSecurise() / PreuveCapturee
**Type** : Fonctionnel / Domain Event
**Préconditions** : Backend svc-tournee en profil dev, colis A_LIVRER disponible
**Étapes** :
1. Appeler POST /livraison avec typePreuve=DEPOT_SECURISE et descriptionDepot="Devant la porte palière"
2. Vérifier la réponse

**Résultat attendu** : HTTP 200, typePreuve=DEPOT_SECURISE dans le DTO
**Statut** : Passé

```gherkin
Given un colis A_LIVRER est disponible
When POST /livraison est appelé avec typePreuve=DEPOT_SECURISE et descriptionDepot="Devant la porte palière"
Then la réponse est HTTP 200
And "typePreuve" = "DEPOT_SECURISE" dans le PreuveLivraisonDTO
And LivraisonConfirmee est émis (statut colis → LIVRE)
```

---

### TC-285 : Sélection PHOTO — bouton "Ouvrir la caméra" affiché (MVP)

**US liée** : US-009
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : CapturePreuveScreen — testID="bouton-ouvrir-camera"
**Type** : Fonctionnel (MVP partiel — capture caméra déférée)
**Préconditions** : Écran M-04 affiché
**Étapes** :
1. Sélectionner "PHOTO" sur l'écran M-04
2. Observer l'interface affichée

**Résultat attendu** : Le bouton "Ouvrir la caméra" (testID="bouton-ouvrir-camera") est affiché. Note : la capture caméra native est déférée (expo-image-picker non installé).
**Statut** : Passé

```gherkin
Given Pierre est sur l'écran M-04
When Pierre sélectionne le type "PHOTO"
Then le bouton "Ouvrir la caméra" (testID="bouton-ouvrir-camera") est affiché
And une note indique que la fonctionnalité est en cours d'implémentation (MVP)
```

---

### TC-286 : Bouton CONFIRMER activé quand nom du tiers est renseigné

**US liée** : US-009
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : CapturePreuveScreen — validation UI TIERS_IDENTIFIE
**Type** : Fonctionnel
**Préconditions** : Écran M-04, type TIERS_IDENTIFIE sélectionné, champ vide
**Étapes** :
1. Sélectionner TIERS_IDENTIFIE
2. Vérifier que le bouton CONFIRMER est désactivé
3. Saisir "Mme Leroy" dans le champ nom du tiers
4. Vérifier que le bouton CONFIRMER est actif

**Résultat attendu** : Le bouton CONFIRMER s'active uniquement quand nomTiers.trim().length > 0
**Statut** : Passé

```gherkin
Given Pierre est sur l'écran M-04 avec le type TIERS_IDENTIFIE sélectionné
And le champ nom du tiers est vide
Then le bouton CONFIRMER est désactivé
When Pierre saisit "Mme Leroy" dans le champ nom du tiers
Then le bouton CONFIRMER est actif
```
