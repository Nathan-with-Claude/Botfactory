# Scénarios de tests US-034 : Suggestion de réaffectation après échec de compatibilité véhicule

**Agent** : @qa
**Date** : 2026-04-05
**US** : US-034 — Afficher une suggestion de réaffectation après un échec de compatibilité véhicule
**Bounded Context** : BC-07 Planification de Tournée — svc-supervision (port 8082)

---

## Récapitulatif des TC

| TC | Titre | Niveau | Statut |
|----|-------|--------|--------|
| TC-034-01 | Bouton "Réaffecter à un véhicule plus grand" visible après dépassement | L1 | Passé |
| TC-034-02 | GET vehicules/compatibles retourne liste filtrée par capacité | L2 | Passé |
| TC-034-03 | GET vehicules/compatibles retourne liste vide si aucun compatible | L2 | Passé |
| TC-034-04 | POST reaffecter-vehicule → COMPATIBLE + VehiculeReaffecte émis | L1 | Passé |
| TC-034-05 | POST reaffecter-vehicule → 409 si nouveau véhicule encore insuffisant | L1 | Passé |
| TC-034-06 | Bouton "Réaffecter" absent après "Affecter quand même" | L1 | Passé |
| TC-034-07 | Panneau réaffectation visible avec liste filtrée (UI) | L3 | Passé |

---

### TC-034-01 : Bouton "Réaffecter à un véhicule plus grand" visible après dépassement

**US liée** : US-034
**Niveau** : L1
**Couche testée** : Application (ReaffecterVehiculeHandler) + Domain (TourneePlanifiee)
**Aggregate / Domain Event ciblé** : TourneePlanifiee / VehiculeReaffecte
**Type** : Invariant domaine
**Préconditions** : TourneePlanifiee tp-001 avec poids estimé 410 kg, vehicule VH-09 capacité 400 kg

**Étapes** :
1. Appeler POST `/api/planification/tournees/tp-001/verifier-compatibilite-vehicule` avec vehiculeId=VH-09, forcerSiDepassement=false
2. Vérifier que la réponse est 409 DEPASSEMENT
3. Vérifier que le composant frontend affiche `data-testid="btn-reaffecter-vehicule-plus-grand"`

**Résultat attendu** : Le handler lève CompatibiliteVehiculeEchouee, le composant React affiche le bouton de réaffectation uniquement si DEPASSEMENT && !depassementForce

**Statut** : Passé

```gherkin
Given la TourneePlanifiee tp-001 a un poidsEstimeKg de 410
And le véhicule VH-09 a une capacité de 400 kg
When POST /api/planification/tournees/tp-001/verifier-compatibilite-vehicule avec vehiculeId=VH-09
Then la réponse est HTTP 409 avec resultat=DEPASSEMENT
And le composant DetailTourneePlanifieePage affiche btn-reaffecter-vehicule-plus-grand
And btn-affecter-quand-meme est visuellement distinct (couleur secondaire)
```

---

### TC-034-02 : GET vehicules/compatibles retourne liste filtrée par capacité

**US liée** : US-034
**Niveau** : L2
**Couche testée** : Infrastructure + Interface REST
**Aggregate / Domain Event ciblé** : VueTournee (Read Model Vehicule)
**Type** : Fonctionnel cross-services
**Préconditions** : svc-supervision démarré (port 8082), VehiculeRepository initialisé avec 5 véhicules dont 3 >= 410 kg

**Étapes** :
1. `curl -s "http://localhost:8082/api/planification/vehicules/compatibles?poidsMinKg=410"`
2. Vérifier code HTTP 200
3. Vérifier que la liste retournée contient uniquement les véhicules >= 410 kg
4. Vérifier le tri croissant par capacité

**Résultat attendu** : JSON `[{vehiculeId: "...", capaciteKg: ..., disponible: true}, ...]` trié par capacité

**Statut** : Passé

```gherkin
Given svc-supervision est démarré en profil dev
And 5 véhicules sont disponibles dont 3 ont une capacité >= 410 kg
When GET /api/planification/vehicules/compatibles?poidsMinKg=410
Then HTTP 200 avec liste de 3 VehiculeCompatibleDTO
And la liste est triée par capaciteKg croissant
And chaque entrée contient vehiculeId, immatriculation, capaciteKg, disponible
```

---

### TC-034-03 : GET vehicules/compatibles retourne liste vide si aucun compatible

**US liée** : US-034
**Niveau** : L2
**Couche testée** : Infrastructure + Interface REST
**Aggregate / Domain Event ciblé** : VehiculeRepository
**Type** : Edge case
**Préconditions** : svc-supervision démarré, poidsMinKg supérieur à la capacité de tous les véhicules

**Étapes** :
1. `curl -s "http://localhost:8082/api/planification/vehicules/compatibles?poidsMinKg=99999"`
2. Vérifier code HTTP 200
3. Vérifier que la liste est vide

**Résultat attendu** : HTTP 200 avec `[]`

**Statut** : Passé

```gherkin
Given aucun véhicule disponible n'a une capacité >= 99999 kg
When GET /api/planification/vehicules/compatibles?poidsMinKg=99999
Then HTTP 200 avec liste vide []
And le panneau frontend affiche data-testid="aucun-vehicule-disponible"
```

---

### TC-034-04 : POST reaffecter-vehicule → COMPATIBLE + VehiculeReaffecte émis

**US liée** : US-034
**Niveau** : L1
**Couche testée** : Domain + Application
**Aggregate / Domain Event ciblé** : TourneePlanifiee / VehiculeReaffecte + CompatibiliteVehiculeVerifiee
**Type** : Invariant domaine
**Préconditions** : TourneePlanifiee tp-001 (poids 410 kg), VH-02 capacité 600 kg

**Étapes** :
1. Instancier ReaffecterVehiculeCommand(tourneePlanifieeId="tp-001", nouveauVehiculeId="VH-02", superviseurId="sup-01")
2. Appeler ReaffecterVehiculeHandler.handle(command)
3. Vérifier les Domain Events émis

**Résultat attendu** : VehiculeReaffecte émis avec ancienVehiculeId, nouveauVehiculeId="VH-02", margeKg=190. CompatibiliteVehiculeVerifiee réémis avec COMPATIBLE.

**Statut** : Passé

```gherkin
Given TourneePlanifiee tp-001 avec poidsEstimeKg=410 et vehicule actuel VH-09 (400 kg)
And VH-02 a une capaciteKg de 600
When ReaffecterVehiculeHandler.handle(command avec nouveauVehiculeId=VH-02)
Then VehiculeReaffecte est émis avec nouveauVehiculeId=VH-02 et margeKg=190
And CompatibiliteVehiculeVerifiee est réémis avec resultat=COMPATIBLE
And la TourneePlanifiee est sauvegardée avec le nouveau vehiculeId
```

---

### TC-034-05 : POST reaffecter-vehicule → 409 si nouveau véhicule encore insuffisant

**US liée** : US-034
**Niveau** : L1
**Couche testée** : Domain + Application
**Aggregate / Domain Event ciblé** : TourneePlanifiee / CapaciteVehiculeDepasseeException
**Type** : Non régression / Edge case
**Préconditions** : TourneePlanifiee tp-001 (poids 410 kg), VH-03 capacité 350 kg

**Étapes** :
1. Appeler ReaffecterVehiculeHandler.handle avec nouveauVehiculeId=VH-03 (350 kg)
2. Vérifier l'exception levée
3. Vérifier qu'aucune sauvegarde n'a eu lieu

**Résultat attendu** : CapaciteVehiculeDepasseeException levée, TourneePlanifiee non modifiée

**Statut** : Passé

```gherkin
Given TourneePlanifiee tp-001 avec poidsEstimeKg=410
And VH-03 a une capaciteKg de 350 (insuffisante)
When POST /api/planification/tournees/tp-001/reaffecter-vehicule avec nouveauVehiculeId=VH-03
Then HTTP 409 avec resultat=DEPASSEMENT
And la TourneePlanifiee n'est pas modifiée
And CapaciteVehiculeDepasseeException est levée dans le handler
```

---

### TC-034-06 : Bouton "Réaffecter" absent après "Affecter quand même"

**US liée** : US-034
**Niveau** : L1
**Couche testée** : Interface Layer (React) — état local depassementForce
**Aggregate / Domain Event ciblé** : TourneePlanifiee / CompatibiliteVehiculeEchouee
**Type** : Invariant UI
**Préconditions** : Composant DetailTourneePlanifieePage avec dépassement actif

**Étapes** :
1. Monter le composant avec état DEPASSEMENT
2. Déclencher forcerAffectationMalgreDepassement()
3. Vérifier que depassementForce=true masque le bouton de réaffectation

**Résultat attendu** : btn-reaffecter-vehicule-plus-grand absent du DOM. Alerte en mode avertissement non bloquant.

**Statut** : Passé

```gherkin
Given le composant DetailTourneePlanifieePage est en état DEPASSEMENT
When le superviseur clique sur btn-affecter-quand-meme
Then depassementForce passe à true
And btn-reaffecter-vehicule-plus-grand disparaît du DOM
And l'alerte passe en mode non-bloquant
```

---

### TC-034-07 : Panneau réaffectation visible avec liste filtrée (UI)

**US liée** : US-034
**Niveau** : L3
**Couche testée** : UI (Playwright — W-05 supervision)
**Aggregate / Domain Event ciblé** : VueTournee (Read Model Vehicule)
**Type** : Fonctionnel UI
**Préconditions** : svc-supervision + frontend-supervision démarrés. TourneePlanifiee tp-001 avec dépassement.

**Étapes** :
1. Naviguer vers W-05 (onglet Affectation) de la tournée T-001
2. Sélectionner VH-09 (400 kg) → déclenchement auto verifierCompatibiliteVehicule
3. Vérifier l'indicateur DEPASSEMENT
4. Cliquer sur btn-reaffecter-vehicule-plus-grand
5. Vérifier l'ouverture du panneau et la liste filtrée

**Résultat attendu** : panneau-reaffectation visible, liste contient uniquement les véhicules >= 410 kg

**Statut** : Passé

```gherkin
Given svc-supervision démarré, tournée tp-001 avec poids=410 kg visible sur W-05
When le superviseur sélectionne VH-09 (400 kg) dans le picker
Then indicateur-compatibilite-DEPASSEMENT est visible
When le superviseur clique sur btn-reaffecter-vehicule-plus-grand
Then panneau-reaffectation est affiché
And la liste contient uniquement des véhicules de capacité >= 410 kg
```
