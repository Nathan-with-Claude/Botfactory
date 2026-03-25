# Scénarios de tests US-005 — Déclarer un échec de livraison

**US liée** : US-005 — Déclarer un échec de livraison avec motif normalisé et disposition
**Bounded Context** : BC-01 Orchestration de Tournée
**Aggregate ciblé** : Tournée (Aggregate Root), Colis (Entity)
**Domain Event ciblé** : `EchecLivraisonDeclare`
**Numérotation** : TC-098 à TC-122 (continuation depuis TC-097 = fin US-004)

---

## Couverture

| Couche | TCs | Objets couverts |
|--------|-----|-----------------|
| Domain | TC-098 à TC-107 | Invariants `declarerEchecLivraison()`, transitions, `EchecLivraisonDeclare` |
| Application | TC-108 à TC-112 | `DeclarerEchecLivraisonHandler`, orchestration |
| Infrastructure | TC-113 à TC-117 | Endpoint REST POST, codes HTTP, persistance |
| E2E | TC-118 à TC-122 | Parcours M-03 → M-05, bouton désactivé, note, 409 |

---

## TC-098 : `EchecLivraisonDeclare` est émis lors d'un échec standard (Absent)

**US liée** : US-005
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Tournée / `EchecLivraisonDeclare`
**Type** : Fonctionnel
**Préconditions** : Colis `colis-dev-001` en statut `A_LIVRER` dans la Tournée
**Étapes** :
1. Appeler `tournee.declarerEchecLivraison(colisId, ABSENT, A_REPRESENTER, null)`
2. Appeler `tournee.pullDomainEvents()`

**Résultat attendu** : Un `EchecLivraisonDeclare` est émis avec `motif=ABSENT`, `disposition=A_REPRESENTER`, `horodatage` non nul
**Statut** : Passé

```gherkin
Given la Tournée contient le colis "colis-dev-001" au statut "A_LIVRER"
When tournee.declarerEchecLivraison(colisId, ABSENT, A_REPRESENTER, null) est appelé
Then EchecLivraisonDeclare est émis
And motif = ABSENT
And disposition = A_REPRESENTER
And horodatage != null
```

---

## TC-099 : Le statut du Colis passe à `ECHEC` après déclaration

**US liée** : US-005
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Colis / `EchecLivraisonDeclare`
**Type** : Fonctionnel
**Préconditions** : Colis `A_LIVRER`
**Étapes** :
1. Appeler `tournee.declarerEchecLivraison(colisId, ABSENT, A_REPRESENTER, null)`
2. Vérifier `colis.getStatut()`

**Résultat attendu** : `colis.getStatut() == ECHEC`
**Statut** : Passé

```gherkin
Given le colis est au statut "A_LIVRER"
When declarerEchecLivraison() est appelé
Then colis.getStatut() == ECHEC
And colis.getMotifNonLivraison() == ABSENT
And colis.getDisposition() == A_REPRESENTER
```

---

## TC-100 : Invariant — motif obligatoire (null → `TourneeInvariantException`)

**US liée** : US-005
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Invariant domaine
**Préconditions** : Colis `A_LIVRER`
**Étapes** :
1. Appeler `tournee.declarerEchecLivraison(colisId, null, A_REPRESENTER, null)`

**Résultat attendu** : `TourneeInvariantException` levée, aucun Domain Event émis
**Statut** : Passé

```gherkin
Given le colis est au statut "A_LIVRER"
When declarerEchecLivraison() est appelé avec motif = null
Then TourneeInvariantException est levée
And aucun EchecLivraisonDeclare n'est émis
```

---

## TC-101 : Invariant — disposition obligatoire (null → `TourneeInvariantException`)

**US liée** : US-005
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Invariant domaine
**Étapes** :
1. Appeler `tournee.declarerEchecLivraison(colisId, ABSENT, null, null)`

**Résultat attendu** : `TourneeInvariantException` levée
**Statut** : Passé

```gherkin
Given le colis est au statut "A_LIVRER"
When declarerEchecLivraison() est appelé avec disposition = null
Then TourneeInvariantException est levée
```

---

## TC-102 : Invariant — transition ECHEC → ECHEC interdite

**US liée** : US-005
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Invariant domaine
**Préconditions** : Colis `colis-dev-005` avec statut `ECHEC`
**Étapes** :
1. Appeler `tournee.declarerEchecLivraison(colisId, REFUS_CLIENT, RETOUR_DEPOT, null)` sur un colis déjà en ECHEC

**Résultat attendu** : `TourneeInvariantException` levée avec message explicite
**Statut** : Passé

```gherkin
Given le colis a le statut "ECHEC"
When declarerEchecLivraison() est appelé
Then TourneeInvariantException est levée (transition interdite)
And aucun EchecLivraisonDeclare n'est émis
```

---

## TC-103 : Invariant — transition LIVRE → ECHEC interdite

**US liée** : US-005
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Invariant domaine
**Préconditions** : Colis `colis-dev-004` avec statut `LIVRE`
**Étapes** :
1. Appeler `tournee.declarerEchecLivraison(colisId, ABSENT, A_REPRESENTER, null)` sur un colis LIVRE

**Résultat attendu** : `TourneeInvariantException` levée
**Statut** : Passé

```gherkin
Given le colis a le statut "LIVRE"
When declarerEchecLivraison() est appelé
Then TourneeInvariantException est levée
```

---

## TC-104 : Note optionnelle incluse dans l'événement

**US liée** : US-005
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Tournée / `EchecLivraisonDeclare`
**Type** : Fonctionnel
**Étapes** :
1. Appeler `tournee.declarerEchecLivraison(colisId, ACCES_IMPOSSIBLE, RETOUR_DEPOT, "Portail code non fonctionnel")`
2. Récupérer l'événement émis

**Résultat attendu** : `EchecLivraisonDeclare.noteLibre == "Portail code non fonctionnel"`
**Statut** : Passé

```gherkin
Given le colis est au statut "A_LIVRER"
When declarerEchecLivraison() est appelé avec une note "Portail code non fonctionnel"
Then EchecLivraisonDeclare.noteLibre == "Portail code non fonctionnel"
```

---

## TC-105 : Note de plus de 250 caractères → `IllegalArgumentException`

**US liée** : US-005
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Edge case
**Étapes** :
1. Construire une note de 251 caractères
2. Appeler `declarerEchecLivraison(colisId, ABSENT, A_REPRESENTER, notesDe251Chars)`

**Résultat attendu** : `IllegalArgumentException` levée (invariant `EchecLivraisonDeclare`)
**Statut** : Passé

```gherkin
Given une note de 251 caractères
When declarerEchecLivraison() est appelé
Then IllegalArgumentException est levée
```

---

## TC-106 : Tous les motifs normalisés sont valides

**US liée** : US-005
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Tournée / `EchecLivraisonDeclare`
**Type** : Fonctionnel (pairwise)
**Préconditions** : Colis `A_LIVRER` (5 colis nécessaires pour tester les 4 motifs + réinitialisation)
**Étapes** :
1. Tester `ABSENT`, `ACCES_IMPOSSIBLE`, `REFUS_CLIENT`, `HORAIRE_DEPASSE` avec `A_REPRESENTER`

**Résultat attendu** : Chaque motif accepté, événement émis correctement
**Statut** : Passé

```gherkin
Given des colis au statut "A_LIVRER"
When declarerEchecLivraison() est appelé avec chaque motif valide
Then EchecLivraisonDeclare est émis pour chacun
```

---

## TC-107 : Toutes les dispositions normalisées sont valides

**US liée** : US-005
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Tournée / `EchecLivraisonDeclare`
**Type** : Fonctionnel (pairwise)
**Étapes** :
1. Tester `A_REPRESENTER`, `DEPOT_CHEZ_TIERS`, `RETOUR_DEPOT` avec motif `ABSENT`

**Résultat attendu** : Chaque disposition acceptée, événement émis
**Statut** : Passé

---

## TC-108 : `DeclarerEchecLivraisonHandler` orchestre le flux nominal complet

**US liée** : US-005
**Couche testée** : Application
**Aggregate / Domain Event ciblé** : Tournée / `EchecLivraisonDeclare`
**Type** : Fonctionnel
**Préconditions** : Mocks : repository retourne tournée avec colis `A_LIVRER`
**Étapes** :
1. Créer `DeclarerEchecLivraisonCommand(tourneeId, colisId, ABSENT, A_REPRESENTER, null)`
2. Appeler `handler.handle(command)`

**Résultat attendu** : Tournée sauvegardée, `EchecLivraisonDeclare` publié
**Statut** : Passé

```gherkin
Given le repository (mock) retourne la tournée "tournee-dev-001" avec le colis "A_LIVRER"
When DeclarerEchecLivraisonHandler.handle() est appelé
Then repository.save() est appelé une fois
And EchecLivraisonDeclare est collecté dans les domain events
```

---

## TC-109 : Handler lève `TourneeNotFoundException` si tournée introuvable

**US liée** : US-005
**Couche testée** : Application
**Type** : Edge case
**Étapes** :
1. Repository retourne `Optional.empty()`
2. Appeler `handler.handle(command)`

**Résultat attendu** : `TourneeNotFoundException` levée, `repository.save()` non appelé
**Statut** : Passé

---

## TC-110 : Handler lève `ColisNotFoundException` si colis absent de la tournée

**US liée** : US-005
**Couche testée** : Application
**Type** : Edge case
**Étapes** :
1. Tournée existe mais sans le `colisId`
2. Appeler `handler.handle(command)`

**Résultat attendu** : `ColisNotFoundException` levée
**Statut** : Passé

---

## TC-111 : Handler propage `TourneeInvariantException` si transition interdite

**US liée** : US-005
**Couche testée** : Application
**Type** : Invariant domaine
**Préconditions** : Colis en statut `ECHEC`
**Étapes** :
1. Appeler `handler.handle(command)` avec colis déjà en ECHEC

**Résultat attendu** : `TourneeInvariantException` propagée, tournée non sauvegardée
**Statut** : Passé

---

## TC-112 : Handler idempotence — double appel avec même commande lève exception

**US liée** : US-005
**Couche testée** : Application
**Type** : Non régression
**Étapes** :
1. Appeler `handler.handle(command)` une première fois (succès)
2. Recharger la tournée avec statut ECHEC
3. Appeler `handler.handle(command)` une seconde fois

**Résultat attendu** : `TourneeInvariantException` levée au second appel
**Statut** : Passé

---

## TC-113 : `POST /api/tournees/{tourneeId}/colis/{colisId}/echec` retourne 200

**US liée** : US-005
**Couche testée** : Infrastructure
**Type** : Fonctionnel
**Préconditions** : Backend démarré, `colis-dev-001` en `A_LIVRER`
**Étapes** :
1. `POST http://localhost:8081/api/tournees/tournee-dev-001/colis/colis-dev-001/echec`
   Body : `{"motif":"ABSENT","disposition":"A_REPRESENTER"}`

**Résultat attendu** : HTTP 200, body ColisDTO avec `statut: "ECHEC"`, `motifNonLivraison: "ABSENT"`, `disposition: "A_REPRESENTER"`
**Statut** : Passé

```gherkin
Given le colis "colis-dev-001" est au statut "A_LIVRER"
When POST /echec avec motif ABSENT et disposition A_REPRESENTER
Then HTTP 200
And body.statut == "ECHEC"
And body.motifNonLivraison == "ABSENT"
And body.disposition == "A_REPRESENTER"
```

---

## TC-114 : `POST /echec` retourne 409 si colis déjà en ECHEC

**US liée** : US-005
**Couche testée** : Infrastructure
**Type** : Invariant domaine
**Préconditions** : `colis-dev-005` déjà en `ECHEC`
**Étapes** :
1. `POST http://localhost:8081/api/tournees/tournee-dev-001/colis/colis-dev-005/echec`
   Body : `{"motif":"ABSENT","disposition":"A_REPRESENTER"}`

**Résultat attendu** : HTTP 409 Conflict
**Statut** : Passé

```gherkin
Given le colis "colis-dev-005" est déjà au statut "ECHEC"
When POST /echec
Then HTTP 409
```

---

## TC-115 : `POST /echec` retourne 409 si colis déjà LIVRE

**US liée** : US-005
**Couche testée** : Infrastructure
**Type** : Invariant domaine
**Préconditions** : `colis-dev-004` en `LIVRE`
**Étapes** :
1. `POST http://localhost:8081/api/tournees/tournee-dev-001/colis/colis-dev-004/echec`

**Résultat attendu** : HTTP 409
**Statut** : Passé

---

## TC-116 : `POST /echec` retourne 404 si tournée introuvable

**US liée** : US-005
**Couche testée** : Infrastructure
**Type** : Edge case
**Étapes** :
1. `POST http://localhost:8081/api/tournees/tournee-inexistante/colis/colis-dev-001/echec`

**Résultat attendu** : HTTP 404
**Statut** : Passé

---

## TC-117 : Les champs motif et disposition sont persistés après déclaration d'échec

**US liée** : US-005
**Couche testée** : Infrastructure
**Type** : Fonctionnel
**Préconditions** : Backend démarré avec base H2
**Étapes** :
1. `POST /echec` sur `colis-dev-002` avec `motif=REFUS_CLIENT`, `disposition=RETOUR_DEPOT`
2. `GET /api/tournees/tournee-dev-001/colis/colis-dev-002`

**Résultat attendu** : Le GET retourne `motifNonLivraison: "REFUS_CLIENT"`, `disposition: "RETOUR_DEPOT"` persistés
**Statut** : Passé

```gherkin
Given un POST /echec avec motif REFUS_CLIENT et disposition RETOUR_DEPOT a réussi
When GET /api/tournees/tournee-dev-001/colis/colis-dev-002
Then body.motifNonLivraison == "REFUS_CLIENT"
And body.disposition == "RETOUR_DEPOT"
And body.statut == "ECHEC"
```

---

## TC-118 : E2E — Navigation vers M-05 depuis le bouton "DECLARER UN ECHEC"

**US liée** : US-005
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : Tournée / `EchecLivraisonDeclare`
**Type** : Fonctionnel
**Préconditions** : Backend et Expo Web démarrés
**Étapes** :
1. Ouvrir M-02, naviguer vers M-03 (colis-dev-001)
2. Appuyer sur `testID="btn-echec"`

**Résultat attendu** : L'écran M-05 (`declarer-echec-screen`) s'affiche
**Statut** : Passé

```gherkin
Given Pierre est sur M-03 du colis "colis-dev-001" (A_LIVRER)
When Pierre appuie sur "DECLARER UN ECHEC"
Then l'écran M-05 (declarer-echec-screen) s'affiche
```

---

## TC-119 : E2E — Bouton "ENREGISTRER L'ECHEC" désactivé si motif/disposition non sélectionnés

**US liée** : US-005
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : aucun
**Type** : Invariant domaine en E2E
**Préconditions** : M-05 affiché
**Étapes** :
1. Naviguer vers M-05
2. Ne rien sélectionner
3. Vérifier l'état de `testID="btn-enregistrer-echec"`

**Résultat attendu** : Le bouton est désactivé (disabled)
**Statut** : Passé

```gherkin
Given Pierre est sur M-05 (formulaire déclaration échec)
When aucun motif ni disposition n'est sélectionné
Then le bouton "ENREGISTRER L'ECHEC" est désactivé
```

---

## TC-120 : E2E — Déclaration d'échec nominal (Absent / À représenter)

**US liée** : US-005
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : Tournée / `EchecLivraisonDeclare`
**Type** : Fonctionnel (parcours complet)
**Préconditions** : `colis-dev-002` en `A_LIVRER` (en supposant que colis-dev-001 a été utilisé pour TC-117)
**Étapes** :
1. Naviguer vers M-03 (colis-dev-001 ou colis-dev-002 suivant état base)
2. Appuyer sur "DECLARER UN ECHEC"
3. Sélectionner motif "ABSENT"
4. Sélectionner disposition "A_REPRESENTER"
5. Appuyer sur "ENREGISTRER L'ECHEC"

**Résultat attendu** : Retour sur M-02, le colis affiche le statut `ECHEC`
**Statut** : Passé

```gherkin
Given Pierre est sur M-05 avec motif "Absent" et disposition "À représenter" sélectionnés
When Pierre appuie sur "ENREGISTRER L'ECHEC"
Then POST /echec retourne 200
And Pierre est redirigé vers M-02
And le colis affiche le statut "ECHEC" dans la liste
```

---

## TC-121 : E2E — API POST /echec retourne 200 (appel direct)

**US liée** : US-005
**Couche testée** : E2E (API directe)
**Type** : Fonctionnel
**Préconditions** : Backend démarré, `colis-dev-001` en `A_LIVRER` (ou un autre colis A_LIVRER selon les tests précédents)
**Étapes** :
1. POST `http://localhost:8081/api/tournees/tournee-dev-001/colis/colis-dev-001/echec`
   Body : `{"motif":"ABSENT","disposition":"A_REPRESENTER"}`

**Résultat attendu** : HTTP 200, `statut: "ECHEC"`
**Statut** : Passé

---

## TC-122 : E2E — API POST /echec 409 si colis déjà en ECHEC (appel direct)

**US liée** : US-005
**Couche testée** : E2E (API directe)
**Type** : Invariant domaine
**Préconditions** : `colis-dev-005` en `ECHEC` (DevDataSeeder)
**Étapes** :
1. POST `http://localhost:8081/api/tournees/tournee-dev-001/colis/colis-dev-005/echec`

**Résultat attendu** : HTTP 409
**Statut** : Passé
