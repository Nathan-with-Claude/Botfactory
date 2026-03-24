# Scénarios de tests US-007 — Clôturer la tournée

**US liée** : US-007 — Clôturer ma tournée et consulter le récapitulatif
**Bounded Context** : BC-01 Orchestration de Tournée
**Aggregate ciblé** : Tournée (Aggregate Root)
**Domain Event ciblé** : `TourneeCloturee`
**Numérotation** : TC-123 à TC-145 (continuation depuis TC-122 = fin US-005)

---

## Couverture

| Couche | TCs | Objets couverts |
|--------|-----|-----------------|
| Domain | TC-123 à TC-130 | Invariants `cloturerTournee()`, `TourneeCloturee`, idempotence |
| Application | TC-131 à TC-135 | `CloturerTourneeHandler`, orchestration |
| Infrastructure | TC-136 à TC-139 | Endpoint REST POST, codes HTTP |
| E2E | TC-140 à TC-145 | Parcours M-02 → M-07, bouton masqué, récapitulatif |

---

## TC-123 : `TourneeCloturee` est émis quand le livreur clôture une tournée sans colis restants

**US liée** : US-007
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Tournée / `TourneeCloturee`
**Type** : Fonctionnel
**Préconditions** : Tournée avec tous les colis en statut terminal (LIVRE, ECHEC, ou A_REPRESENTER) — aucun A_LIVRER
**Étapes** :
1. Construire une Tournée dont tous les Colis ont un statut terminal
2. Appeler `tournee.cloturerTournee()`
3. Appeler `tournee.pullDomainEvents()`

**Résultat attendu** : Un `TourneeCloturee` est émis avec `tourneeId`, `livreurId`, `recapitulatif` et `horodatage`
**Statut** : Passé

```gherkin
Given une Tournée dont tous les Colis ont un statut terminal
When tournee.cloturerTournee() est appelé
Then TourneeCloturee est émis
And TourneeCloturee.tourneeId est l'identifiant de la tournée
And TourneeCloturee.recapitulatif contient les compteurs corrects
```

---

## TC-124 : `cloturerTournee()` lève `TourneeInvariantException` si un colis est encore à livrer

**US liée** : US-007
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Invariant domaine
**Préconditions** : Tournée avec au moins un colis en statut `A_LIVRER`
**Étapes** :
1. Construire une Tournée avec un colis `A_LIVRER`
2. Appeler `tournee.cloturerTournee()`

**Résultat attendu** : `TourneeInvariantException` levée, aucun `TourneeCloturee` émis
**Statut** : Passé

```gherkin
Given la Tournée contient au moins un Colis au statut "A_LIVRER"
When tournee.cloturerTournee() est appelé
Then TourneeInvariantException est levée
And aucun TourneeCloturee n'est émis
```

---

## TC-125 : `RecapitulatifTournee` calcule correctement les compteurs

**US liée** : US-007
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Tournée / `TourneeCloturee`
**Type** : Fonctionnel
**Préconditions** : Tournée avec 3 LIVRE, 1 ECHEC, 1 A_REPRESENTER
**Étapes** :
1. Construire une Tournée avec 3 LIVRE + 1 ECHEC + 1 A_REPRESENTER
2. Appeler `cloturerTournee()`
3. Vérifier `RecapitulatifTournee`

**Résultat attendu** : `colisTotal=5`, `colisLivres=3`, `colisEchecs=1`, `colisARepresenter=1`
**Statut** : Passé

```gherkin
Given une Tournée avec 3 LIVRE, 1 ECHEC, 1 A_REPRESENTER
When cloturerTournee() est appelé
Then recapitulatif.colisTotal == 5
And recapitulatif.colisLivres == 3
And recapitulatif.colisEchecs == 1
And recapitulatif.colisARepresenter == 1
```

---

## TC-126 : Idempotence — double appel ne réémet pas `TourneeCloturee`

**US liée** : US-007
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Tournée / `TourneeCloturee`
**Type** : Invariant domaine (idempotence)
**Préconditions** : Tournée déjà en statut `CLOTUREE`
**Étapes** :
1. Appeler `cloturerTournee()` une première fois
2. Appeler `pullDomainEvents()` (vide la liste)
3. Appeler `cloturerTournee()` une seconde fois
4. Appeler `pullDomainEvents()` à nouveau

**Résultat attendu** : Aucun `TourneeCloturee` émis au second appel ; le récapitulatif est retourné sans ré-émission
**Statut** : Passé

```gherkin
Given la Tournée est déjà au statut "CLOTUREE"
When cloturerTournee() est appelé à nouveau
Then aucun TourneeCloturee n'est émis (idempotent)
And le récapitulatif existant est retourné
```

---

## TC-127 : Le statut de la Tournée passe à `CLOTUREE` après clôture

**US liée** : US-007
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Tournée / `TourneeCloturee`
**Type** : Fonctionnel
**Préconditions** : Tournée en statut `EN_COURS` avec tous les colis traités
**Étapes** :
1. Appeler `cloturerTournee()`
2. Vérifier `tournee.getStatut()`

**Résultat attendu** : `tournee.getStatut() == CLOTUREE`
**Statut** : Passé

```gherkin
Given la Tournée est au statut "EN_COURS"
When cloturerTournee() est appelé avec tous les colis traités
Then tournee.getStatut() == CLOTUREE
```

---

## TC-128 : L'identifiant livreur est présent dans `TourneeCloturee`

**US liée** : US-007
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Tournée / `TourneeCloturee`
**Type** : Fonctionnel
**Étapes** :
1. Appeler `cloturerTournee()` sur une Tournée avec `livreurId = "livreur-001"`
2. Récupérer l'événement

**Résultat attendu** : `TourneeCloturee.livreurId == "livreur-001"`
**Statut** : Passé

```gherkin
Given la Tournée appartient au livreur "livreur-001"
When cloturerTournee() est appelé
Then TourneeCloturee.livreurId == "livreur-001"
```

---

## TC-129 : Clôture bloquée — tournée vide (0 colis) avec statuts tous traités

**US liée** : US-007
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Tournée / `TourneeCloturee`
**Type** : Edge case
**Préconditions** : Tournée sans aucun colis
**Étapes** :
1. Construire une Tournée sans colis
2. Appeler `cloturerTournee()`

**Résultat attendu** : La clôture réussit (0 colis = 0 colis A_LIVRER) ; `recapitulatif.colisTotal == 0`
**Statut** : Passé

```gherkin
Given une Tournée sans aucun Colis
When cloturerTournee() est appelé
Then TourneeCloturee est émis
And recapitulatif.colisTotal == 0
```

---

## TC-130 : Non régression — `declarerEchecLivraison()` ne modifie pas le statut de clôture

**US liée** : US-007
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Non régression
**Préconditions** : Tournée en cours avec colis A_LIVRER
**Étapes** :
1. Appeler `declarerEchecLivraison()` sur un colis
2. Vérifier que `tournee.getStatut()` est toujours `EN_COURS`

**Résultat attendu** : Le statut de la Tournée reste `EN_COURS` après déclaration d'échec
**Statut** : Passé

```gherkin
Given la Tournée est au statut "EN_COURS"
When declarerEchecLivraison() est appelé sur un colis
Then tournee.getStatut() reste "EN_COURS"
```

---

## TC-131 : `CloturerTourneeHandler` orchestre le flux nominal complet

**US liée** : US-007
**Couche testée** : Application
**Aggregate / Domain Event ciblé** : Tournée / `TourneeCloturee`
**Type** : Fonctionnel
**Préconditions** : Mock repository retourne une tournée avec tous les colis traités
**Étapes** :
1. Créer `CloturerTourneeCommand(tourneeId="tournee-dev-001")`
2. Appeler `handler.handle(command)`

**Résultat attendu** : `repository.save()` appelé une fois ; `RecapitulatifTourneeResult` retourné avec les compteurs corrects
**Statut** : Passé

```gherkin
Given le repository (mock) retourne une tournée "tournee-dev-001" avec tous les colis traités
When CloturerTourneeHandler.handle() est appelé
Then repository.save() est appelé une fois
And le résultat contient les compteurs corrects (total, livrés, échecs, à représenter)
```

---

## TC-132 : Handler lève `TourneeNotFoundException` si tournée introuvable

**US liée** : US-007
**Couche testée** : Application
**Type** : Edge case
**Étapes** :
1. Repository retourne `Optional.empty()`
2. Appeler `handler.handle(command)`

**Résultat attendu** : `TourneeNotFoundException` levée, `save()` non appelé
**Statut** : Passé

---

## TC-133 : Handler propage `TourneeInvariantException` si colis encore à livrer

**US liée** : US-007
**Couche testée** : Application
**Type** : Invariant domaine
**Préconditions** : Tournée avec un colis `A_LIVRER`
**Étapes** :
1. Repository retourne une tournée avec colis `A_LIVRER`
2. Appeler `handler.handle(command)`

**Résultat attendu** : `TourneeInvariantException` propagée, tournée non sauvegardée
**Statut** : Passé

---

## TC-134 : Handler retourne `RecapitulatifTourneeResult` avec les bons compteurs

**US liée** : US-007
**Couche testée** : Application
**Type** : Fonctionnel
**Préconditions** : Tournée avec 1 LIVRE + 1 ECHEC (2 colis, aucun A_LIVRER)
**Étapes** :
1. Appeler `handler.handle(command)` avec mock retournant la tournée
2. Vérifier les champs du résultat

**Résultat attendu** : `colisTotal=2, colisLivres=1, colisEchecs=1, colisARepresenter=0`
**Statut** : Passé

---

## TC-135 : Non régression — les handlers US-001/004/005 ne sont pas affectés par le 4e paramètre constructeur

**US liée** : US-007
**Couche testée** : Application
**Type** : Non régression
**Préconditions** : `TourneeController` enrichi avec `CloturerTourneeHandler` (4e paramètre)
**Étapes** :
1. Exécuter `TourneeControllerTest`, `DetailColisControllerTest`, `EchecLivraisonControllerTest`

**Résultat attendu** : Tous les tests existants restent verts
**Statut** : Passé

---

## TC-136 : `POST /api/tournees/{tourneeId}/cloture` retourne 200 et le récapitulatif

**US liée** : US-007
**Couche testée** : Infrastructure
**Type** : Fonctionnel
**Préconditions** : Backend démarré, tous les colis de `tournee-dev-001` traités (via API préalable)
**Étapes** :
1. S'assurer qu'aucun colis n'est en `A_LIVRER` (pré-condition API)
2. `POST http://localhost:8081/api/tournees/tournee-dev-001/cloture`

**Résultat attendu** : HTTP 200, body `RecapitulatifTourneeDTO` avec `colisTotal`, `colisLivres`, `colisEchecs`, `colisARepresenter`
**Statut** : Passé

```gherkin
Given la tournée "tournee-dev-001" n'a aucun colis au statut "A_LIVRER"
When POST /api/tournees/tournee-dev-001/cloture
Then HTTP 200
And body.colisTotal >= 0
And body.colisLivres + body.colisEchecs + body.colisARepresenter == body.colisTotal
```

---

## TC-137 : `POST /cloture` retourne 409 si des colis sont encore à livrer

**US liée** : US-007
**Couche testée** : Infrastructure
**Type** : Invariant domaine
**Préconditions** : Backend démarré avec DevDataSeeder (3 colis `A_LIVRER` au démarrage)
**Étapes** :
1. `POST http://localhost:8081/api/tournees/tournee-dev-001/cloture` (état initial = 3 colis A_LIVRER)

**Résultat attendu** : HTTP 409 Conflict
**Statut** : Passé

```gherkin
Given la tournée a des colis au statut "A_LIVRER"
When POST /api/tournees/tournee-dev-001/cloture
Then HTTP 409
```

---

## TC-138 : `POST /cloture` retourne 404 si tournée introuvable

**US liée** : US-007
**Couche testée** : Infrastructure
**Type** : Edge case
**Étapes** :
1. `POST http://localhost:8081/api/tournees/tournee-inexistante/cloture`

**Résultat attendu** : HTTP 404
**Statut** : Passé

---

## TC-139 : `POST /cloture` est idempotent — second appel ne casse pas le système

**US liée** : US-007
**Couche testée** : Infrastructure
**Type** : Non régression (idempotence)
**Préconditions** : Tournée déjà clôturée
**Étapes** :
1. Clôturer la tournée une première fois (200)
2. Clôturer la même tournée une seconde fois

**Résultat attendu** : HTTP 200 au second appel (idempotent), récapitulatif retourné
**Statut** : Passé

---

## TC-140 : E2E — Bouton "Clôturer la tournée" visible sur M-02 quand tous les colis sont traités

**US liée** : US-007
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : Tournée / `TourneeCloturee`
**Type** : Fonctionnel
**Préconditions** : Backend et Expo Web démarrés ; aucun colis `A_LIVRER` (via API préalable)
**Étapes** :
1. Traiter tous les colis via API (`POST /echec` ou équivalent)
2. Ouvrir `http://localhost:8082`
3. Vérifier `testID="btn-cloture"`

**Résultat attendu** : Le bouton "Clôturer la tournée" est visible
**Statut** : Passé

```gherkin
Given aucun colis n'est au statut "A_LIVRER"
When Pierre est sur l'écran M-02
Then le bouton "Clôturer la tournée" est visible
```

---

## TC-141 : E2E — Bouton "Clôturer la tournée" absent sur M-02 tant que des colis sont à livrer

**US liée** : US-007
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Invariant domaine en E2E
**Préconditions** : DevDataSeeder initial — 3 colis en `A_LIVRER`
**Étapes** :
1. Ouvrir `http://localhost:8082` sans traiter les colis
2. Vérifier absence de `testID="btn-cloture"` ou présence désactivée

**Résultat attendu** : Le bouton est absent ou désactivé quand des colis sont encore `A_LIVRER`
**Statut** : Passé

```gherkin
Given des colis sont au statut "A_LIVRER"
When Pierre est sur l'écran M-02
Then le bouton "Clôturer la tournée" est absent ou désactivé
```

---

## TC-142 : E2E — Navigation vers M-07 (récapitulatif) après clôture

**US liée** : US-007
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : Tournée / `TourneeCloturee`
**Type** : Fonctionnel (parcours complet)
**Préconditions** : Tous les colis traités via API
**Étapes** :
1. Appuyer sur "Clôturer la tournée" (btn-cloture)
2. Attendre la navigation vers M-07

**Résultat attendu** : L'écran M-07 (`recapitulatif-screen`) s'affiche avec le bandeau de succès
**Statut** : Passé

```gherkin
Given tous les colis sont traités et Pierre est sur M-02
When Pierre appuie sur "Clôturer la tournée"
Then l'écran M-07 (recapitulatif-screen) s'affiche
And le bandeau "Tournée clôturée !" est visible
```

---

## TC-143 : E2E — Récapitulatif M-07 affiche les compteurs corrects

**US liée** : US-007
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : Tournée / `TourneeCloturee`
**Type** : Fonctionnel
**Préconditions** : M-07 affiché après clôture
**Étapes** :
1. Lire les valeurs de `testID="recap-total"`, `testID="recap-livres"`, `testID="recap-echecs"`, `testID="recap-a-representer"`

**Résultat attendu** : Les compteurs sont non négatifs et cohérents (total = livrés + échecs + à représenter)
**Statut** : Passé

```gherkin
Given Pierre est sur l'écran M-07 après clôture
When les compteurs sont lus
Then recap.colisTotal >= 0
And recap.colisLivres + recap.colisEchecs + recap.colisARepresenter == recap.colisTotal
```

---

## TC-144 : E2E — API POST /cloture retourne 409 si colis encore à livrer (état initial)

**US liée** : US-007
**Couche testée** : E2E (API directe)
**Type** : Invariant domaine
**Préconditions** : Backend démarré avec DevDataSeeder, 3 colis en `A_LIVRER`
**Étapes** :
1. `POST http://localhost:8081/api/tournees/tournee-dev-001/cloture`

**Résultat attendu** : HTTP 409
**Statut** : Passé

---

## TC-145 : E2E — Bouton "Clôturer la tournée" absent après clôture réussie (non ré-affichable)

**US liée** : US-007
**Couche testée** : E2E
**Aggregate / Domain Event ciblé** : Tournée / aucun
**Type** : Invariant domaine (idempotence UI)
**Préconditions** : Clôture déjà effectuée, retour sur M-02
**Étapes** :
1. Après clôture, appuyer sur "Terminer" (retour M-02)
2. Vérifier `testID="btn-cloture"`

**Résultat attendu** : Le bouton "Clôturer la tournée" est absent sur M-02 (tournée déjà `CLOTUREE`)
**Statut** : Passé

```gherkin
Given la Tournée est au statut "CLOTUREE"
When Pierre est sur l'écran M-02
Then le bouton "Clôturer la tournée" est absent
```
