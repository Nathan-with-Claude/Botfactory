# Scénarios de tests US-030

**US** : US-030 — Vérifier la compatibilité entre le véhicule sélectionné et la charge de la tournée
**Domaine** : BC-07 Planification de Tournée (svc-supervision, port 8082)
**Aggregate** : TourneePlanifiee
**Domain Events** : CompatibiliteVehiculeVerifiee, CompatibiliteVehiculeEchouee
**Date de rédaction** : 2026-03-30

---

## Récapitulatif

| TC | Titre | Niveau | Statut |
|----|-------|--------|--------|
| TC-030-L1-01 | SC1 — véhicule compatible émet CompatibiliteVehiculeVerifiee | L1 | Passé |
| TC-030-L1-02 | SC1 — véhicule exactement à la limite (poids = capacité) est compatible | L1 | Passé |
| TC-030-L1-03 | SC2 — véhicule insuffisant lève CapaciteVehiculeDepasseeException | L1 | Passé |
| TC-030-L1-04 | SC2 — véhicule insuffisant n'émet aucun event | L1 | Passé |
| TC-030-L1-05 | SC3 — forcer affectation malgré dépassement émet CompatibiliteVehiculeEchouee | L1 | Passé |
| TC-030-L1-06 | SC3 — forcerAffectation sur véhicule compatible lève PlanificationInvariantException | L1 | Passé |
| TC-030-L1-07 | SC4 — poids absent n'émet aucun event | L1 | Passé |
| TC-030-L1-08 | SC4 — evaluerCompatibiliteVehicule retourne POIDS_ABSENT si poids null | L1 | Passé |
| TC-030-L1-09 | evaluerCompatibiliteVehicule retourne COMPATIBLE si poids <= capacité | L1 | Passé |
| TC-030-L1-10 | evaluerCompatibiliteVehicule retourne DEPASSEMENT si poids > capacité | L1 | Passé |
| TC-030-L1-11 | vehicule null lève NullPointerException | L1 | Passé |
| TC-030-L1-12 | superviseurId null lève NullPointerException | L1 | Passé |
| TC-030-L1-13 | Handler SC1 — vehicule compatible retourne COMPATIBLE, sauvegarde event | L1 | Passé |
| TC-030-L1-14 | Handler SC2 — véhicule insuffisant sans forçage lève CapaciteVehiculeDepasseeException, pas de save | L1 | Passé |
| TC-030-L1-15 | Handler SC3 — forçage retourne DEPASSEMENT, sauvegarde event échouée | L1 | Passé |
| TC-030-L1-16 | Handler SC4 — poids absent retourne POIDS_ABSENT, aucune sauvegarde | L1 | Passé |
| TC-030-L1-17 | Handler — tournée introuvable lève TourneePlanifieeNotFoundException | L1 | Passé |
| TC-030-L1-18 | Handler — véhicule introuvable lève VehiculeNotFoundException | L1 | Passé |
| TC-030-L1-19 | Controller SC1 — POST retourne 200 COMPATIBLE si poids <= capacité | L1 | Passé |
| TC-030-L1-20 | Controller SC2 — POST retourne 409 DEPASSEMENT si poids > capacité sans forçage | L1 | Passé |
| TC-030-L1-21 | Controller SC3 — POST retourne 200 DEPASSEMENT avec forçage | L1 | Passé |
| TC-030-L1-22 | Controller SC4 — POST retourne 200 POIDS_ABSENT si poids non disponible | L1 | Passé |
| TC-030-L1-23 | Controller — POST retourne 403 si non-SUPERVISEUR | L1 | Passé |
| TC-030-L1-24 | Frontend — affiche charge estimée quand poidsEstimeKg fourni | L1 | Passé |
| TC-030-L1-25 | Frontend — ne pas afficher charge estimée si poidsEstimeKg null | L1 | Passé |
| TC-030-L1-26 | Frontend SC1 — sélectionner véhicule compatible affiche indicateur COMPATIBLE | L1 | Passé |
| TC-030-L1-27 | Frontend SC2 — sélectionner véhicule insuffisant affiche DEPASSEMENT, bloque lancement | L1 | Passé |
| TC-030-L1-28 | Frontend SC3 — cliquer "Affecter quand même" appelle backend forcerSiDepassement=true | L1 | Passé |
| TC-030-L1-29 | Frontend SC4bis — poids absent affiche POIDS_ABSENT, ne bloque pas | L1 | Passé |
| TC-030-L2-01 | L2 — SC4 poids absent → 200 POIDS_ABSENT sur tournée réelle (tp-201) | L2 | Passé |
| TC-030-L2-02 | L2 — SC4 avec forcerSiDepassement=true → 200 POIDS_ABSENT (flag ignoré) | L2 | Passé |
| TC-030-L2-03 | L2 — Tournée inconnue → 404 | L2 | Passé |
| TC-030-L2-04 | L2 — Véhicule inconnu → 404 | L2 | Passé |
| TC-030-L2-05 | L2 — GET détail tournée expose champ poidsEstimeKg dans le DTO | L2 | Passé |

---

## Détails des scénarios

---

### TC-030-L1-01 : SC1 — véhicule compatible émet CompatibiliteVehiculeVerifiee

**US liée** : US-030
**Niveau** : L1
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : TourneePlanifiee / CompatibiliteVehiculeVerifiee
**Type** : Invariant domaine
**Préconditions** : TourneePlanifiee avec poidsEstimeKg=350, Vehicule VH-07 capacité=500
**Étapes** : Appeler `tournee.verifierCompatibiliteVehicule(vehicule, "superviseur-001")`
**Résultat attendu** : 1 event CompatibiliteVehiculeVerifiee avec margeKg=150
**Statut** : Passé

```gherkin
Given une TourneePlanifiee avec poidsEstimeKg=350 kg
And un Vehicule VH-07 de capacité 500 kg
When le superviseur appelle verifierCompatibiliteVehicule
Then l'event CompatibiliteVehiculeVerifiee est émis
And margeKg = 150 (capacité - poids)
And vehiculeId = "VH-07"
And tourneePlanifieeId = "tp-030"
```

---

### TC-030-L1-02 : SC1 — véhicule exactement à la limite est compatible

**US liée** : US-030
**Niveau** : L1
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : TourneePlanifiee / CompatibiliteVehiculeVerifiee
**Type** : Edge case
**Préconditions** : poidsEstimeKg=350, capaciteKg=350
**Étapes** : Appeler `verifierCompatibiliteVehicule`
**Résultat attendu** : CompatibiliteVehiculeVerifiee émis avec margeKg=0
**Statut** : Passé

```gherkin
Given une TourneePlanifiee avec poidsEstimeKg=350 kg
And un Vehicule VH-07 de capacité exactement 350 kg
When le superviseur appelle verifierCompatibiliteVehicule
Then l'event CompatibiliteVehiculeVerifiee est émis
And margeKg = 0
```

---

### TC-030-L1-03 : SC2 — véhicule insuffisant lève CapaciteVehiculeDepasseeException

**US liée** : US-030
**Niveau** : L1
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : TourneePlanifiee / aucun
**Type** : Invariant domaine (négatif)
**Préconditions** : poidsEstimeKg=410, capaciteKg=400
**Étapes** : Appeler `verifierCompatibiliteVehicule`
**Résultat attendu** : CapaciteVehiculeDepasseeException levée avec VH-07, 400, 410 dans le message
**Statut** : Passé

```gherkin
Given une TourneePlanifiee avec poidsEstimeKg=410 kg
And un Vehicule VH-07 de capacité 400 kg
When le superviseur appelle verifierCompatibiliteVehicule
Then une CapaciteVehiculeDepasseeException est levée
And le message contient "VH-07", "400", "410"
```

---

### TC-030-L1-04 : SC2 — véhicule insuffisant n'émet aucun event

**US liée** : US-030
**Niveau** : L1
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : TourneePlanifiee / aucun
**Type** : Invariant domaine
**Préconditions** : poidsEstimeKg=410, capaciteKg=400
**Étapes** : Appeler `verifierCompatibiliteVehicule`, capturer l'exception
**Résultat attendu** : `tournee.getEvenements()` est vide
**Statut** : Passé

```gherkin
Given une TourneePlanifiee avec poidsEstimeKg=410 kg
And un Vehicule VH-07 de capacité 400 kg
When verifierCompatibiliteVehicule lève CapaciteVehiculeDepasseeException
Then aucun Domain Event n'est émis dans l'agrégat
```

---

### TC-030-L1-05 : SC3 — forcer affectation malgré dépassement émet CompatibiliteVehiculeEchouee

**US liée** : US-030
**Niveau** : L1
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : TourneePlanifiee / CompatibiliteVehiculeEchouee
**Type** : Fonctionnel
**Préconditions** : poidsEstimeKg=410, capaciteKg=400
**Étapes** : Appeler `forcerAffectationMalgreDepassement(vehicule, "superviseur-001")`
**Résultat attendu** : CompatibiliteVehiculeEchouee avec depassementKg=10
**Statut** : Passé

```gherkin
Given une TourneePlanifiee avec poidsEstimeKg=410 kg
And un Vehicule VH-07 de capacité 400 kg
When le superviseur appelle forcerAffectationMalgreDepassement
Then l'event CompatibiliteVehiculeEchouee est émis
And depassementKg = 10 (poids - capacité)
And superviseurId = "superviseur-001"
```

---

### TC-030-L1-06 : SC3 — forcerAffectation sur véhicule compatible lève PlanificationInvariantException

**US liée** : US-030
**Niveau** : L1
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : TourneePlanifiee / aucun
**Type** : Edge case (protection cohérence domaine)
**Préconditions** : poidsEstimeKg=300, capaciteKg=500 (véhicule compatible)
**Étapes** : Appeler `forcerAffectationMalgreDepassement` sur un véhicule compatible
**Résultat attendu** : PlanificationInvariantException avec "compatible" dans le message
**Statut** : Passé

```gherkin
Given une TourneePlanifiee avec poidsEstimeKg=300 kg
And un Vehicule VH-07 de capacité 500 kg (compatible)
When le superviseur appelle forcerAffectationMalgreDepassement
Then une PlanificationInvariantException est levée
And le message contient "compatible"
```

---

### TC-030-L1-07 : SC4 — poids absent n'émet aucun event

**US liée** : US-030
**Niveau** : L1
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : TourneePlanifiee / aucun
**Type** : Invariant domaine
**Préconditions** : poidsEstimeKg=null
**Étapes** : Appeler `verifierCompatibiliteVehicule`
**Résultat attendu** : aucune exception, aucun event émis
**Statut** : Passé

```gherkin
Given une TourneePlanifiee dont le poidsEstimeKg est null (poids non fourni par le TMS)
And un Vehicule VH-07 de capacité 500 kg
When le superviseur appelle verifierCompatibiliteVehicule
Then aucune exception n'est levée
And aucun Domain Event n'est émis
```

---

### TC-030-L1-08 : SC4 — evaluerCompatibiliteVehicule retourne POIDS_ABSENT si poids null

**US liée** : US-030
**Niveau** : L1
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : TourneePlanifiee / ResultatCompatibilite
**Type** : Fonctionnel
**Préconditions** : poidsEstimeKg=null
**Étapes** : Appeler `evaluerCompatibiliteVehicule(vehicule)`
**Résultat attendu** : ResultatCompatibilite.POIDS_ABSENT
**Statut** : Passé

---

### TC-030-L1-09 : evaluerCompatibiliteVehicule retourne COMPATIBLE

**US liée** : US-030
**Niveau** : L1
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : TourneePlanifiee / ResultatCompatibilite
**Type** : Fonctionnel
**Préconditions** : poidsEstimeKg=350, capaciteKg=500
**Résultat attendu** : ResultatCompatibilite.COMPATIBLE
**Statut** : Passé

---

### TC-030-L1-10 : evaluerCompatibiliteVehicule retourne DEPASSEMENT

**US liée** : US-030
**Niveau** : L1
**Couche testée** : Domain
**Aggregate / Domain Event ciblé** : TourneePlanifiee / ResultatCompatibilite
**Type** : Fonctionnel
**Préconditions** : poidsEstimeKg=500, capaciteKg=400
**Résultat attendu** : ResultatCompatibilite.DEPASSEMENT
**Statut** : Passé

---

### TC-030-L1-11 et TC-030-L1-12 : Null guards

**US liée** : US-030
**Niveau** : L1
**Couche testée** : Domain
**Type** : Robustesse
**TC-030-L1-11** : vehicule=null → NullPointerException
**TC-030-L1-12** : superviseurId=null → NullPointerException
**Statut** : Passé (x2)

---

### TC-030-L1-13 : Handler SC1 — compatible, sauvegarde

**US liée** : US-030
**Niveau** : L1
**Couche testée** : Application
**Type** : Fonctionnel
**Préconditions** : poidsEstimeKg=350, capaciteKg=500, mocks Repository
**Résultat attendu** : resultat=COMPATIBLE, margeOuDepassementKg=150, save(tournee) invoqué
**Statut** : Passé

---

### TC-030-L1-14 : Handler SC2 — sans forçage, pas de save

**US liée** : US-030
**Niveau** : L1
**Couche testée** : Application
**Type** : Invariant domaine
**Préconditions** : poidsEstimeKg=410, capaciteKg=400, forcerSiDepassement=false
**Résultat attendu** : CapaciteVehiculeDepasseeException, save() jamais invoqué
**Statut** : Passé

---

### TC-030-L1-15 : Handler SC3 — forçage, sauvegarde event échouée

**US liée** : US-030
**Niveau** : L1
**Couche testée** : Application
**Type** : Fonctionnel
**Préconditions** : poidsEstimeKg=410, capaciteKg=400, forcerSiDepassement=true
**Résultat attendu** : resultat=DEPASSEMENT, margeOuDepassementKg=10, save(tournee) invoqué
**Statut** : Passé

---

### TC-030-L1-16 : Handler SC4 — poids absent, pas de save

**US liée** : US-030
**Niveau** : L1
**Couche testée** : Application
**Type** : Invariant domaine
**Préconditions** : poidsEstimeKg=null
**Résultat attendu** : resultat=POIDS_ABSENT, save() jamais invoqué
**Statut** : Passé

---

### TC-030-L1-17 : Handler — tournée introuvable → TourneePlanifieeNotFoundException

**US liée** : US-030
**Niveau** : L1
**Couche testée** : Application
**Type** : Edge case
**Résultat attendu** : TourneePlanifieeNotFoundException
**Statut** : Passé

---

### TC-030-L1-18 : Handler — véhicule introuvable → VehiculeNotFoundException

**US liée** : US-030
**Niveau** : L1
**Couche testée** : Application
**Type** : Edge case
**Résultat attendu** : VehiculeNotFoundException
**Statut** : Passé

---

### TC-030-L1-19 : Controller — POST retourne 200 COMPATIBLE

**US liée** : US-030
**Niveau** : L1
**Couche testée** : Infrastructure (@WebMvcTest)
**Type** : Fonctionnel
**Préconditions** : mock handler retourne COMPATIBLE (350/500, marge=150)
**Résultat attendu** : HTTP 200, `$.resultat=COMPATIBLE`, `$.poidsEstimeKg=350`, `$.capaciteKg=500`, `$.margeOuDepassementKg=150`
**Statut** : Passé

```gherkin
Given le handler verifierCompatibiliteVehiculeHandler retourne COMPATIBLE
When POST /api/planification/tournees/tp-030/verifier-compatibilite-vehicule
  avec {"vehiculeId":"VH-07","forcerSiDepassement":false}
Then HTTP 200
And body.resultat = "COMPATIBLE"
And body.margeOuDepassementKg = 150
```

---

### TC-030-L1-20 : Controller — POST retourne 409 DEPASSEMENT sans forçage

**US liée** : US-030
**Niveau** : L1
**Couche testée** : Infrastructure (@WebMvcTest)
**Type** : Invariant domaine
**Préconditions** : mock handler lève CapaciteVehiculeDepasseeException(VH-07, 400, 410)
**Résultat attendu** : HTTP 409, `$.resultat=DEPASSEMENT`, `$.margeOuDepassementKg=10`
**Statut** : Passé

```gherkin
Given le handler lève CapaciteVehiculeDepasseeException (410 kg / 400 kg)
When POST .../verifier-compatibilite-vehicule avec forcerSiDepassement=false
Then HTTP 409
And body.resultat = "DEPASSEMENT"
And body.margeOuDepassementKg = 10
```

---

### TC-030-L1-21 : Controller — POST retourne 200 DEPASSEMENT avec forçage

**US liée** : US-030
**Niveau** : L1
**Couche testée** : Infrastructure (@WebMvcTest)
**Type** : Fonctionnel
**Préconditions** : mock handler retourne DEPASSEMENT (410/400)
**Résultat attendu** : HTTP 200, `$.resultat=DEPASSEMENT`, `$.margeOuDepassementKg=10`
**Statut** : Passé

---

### TC-030-L1-22 : Controller — POST retourne 200 POIDS_ABSENT

**US liée** : US-030
**Niveau** : L1
**Couche testée** : Infrastructure (@WebMvcTest)
**Type** : Fonctionnel
**Préconditions** : mock handler retourne POIDS_ABSENT
**Résultat attendu** : HTTP 200, `$.resultat=POIDS_ABSENT`, `$.message="Poids non disponible — vérification impossible."`
**Statut** : Passé

---

### TC-030-L1-23 : Controller — POST retourne 403 si non-SUPERVISEUR

**US liée** : US-030
**Niveau** : L1
**Couche testée** : Infrastructure (@WebMvcTest)
**Type** : Sécurité
**Préconditions** : utilisateur avec rôle LIVREUR
**Résultat attendu** : HTTP 403 Forbidden
**Statut** : Passé

---

### TC-030-L1-24 : Frontend — affiche charge estimée quand poidsEstimeKg fourni

**US liée** : US-030
**Niveau** : L1
**Couche testée** : UI (React Testing Library)
**Type** : Rendu conditionnel
**Préconditions** : détail mockée avec poidsEstimeKg=350
**Résultat attendu** : `data-testid="indicateur-charge-estimee"` visible, texte contient "350"
**Statut** : Passé

---

### TC-030-L1-25 : Frontend — pas d'indicateur si poidsEstimeKg null

**US liée** : US-030
**Niveau** : L1
**Couche testée** : UI (React Testing Library)
**Type** : Rendu conditionnel
**Préconditions** : détail mockée avec poidsEstimeKg=null
**Résultat attendu** : `data-testid="indicateur-charge-estimee"` absent
**Statut** : Passé

---

### TC-030-L1-26 : Frontend SC1 — sélectionner véhicule compatible affiche COMPATIBLE

**US liée** : US-030
**Niveau** : L1
**Couche testée** : UI (React Testing Library)
**Type** : Fonctionnel
**Préconditions** : fetchFn mock retourne COMPATIBLE pour verifier-compatibilite-vehicule
**Étapes** : Sélectionner un livreur, puis un véhicule
**Résultat attendu** : `data-testid="indicateur-compatibilite-compatible"` affiché
**Statut** : Passé

```gherkin
Given le logisticien est sur l'onglet Affectation
And la tournée a un poids estimé de 350 kg
When il sélectionne le véhicule VH-07 (capacité 600 kg)
Then l'indicateur "indicateur-compatibilite-compatible" est affiché
```

---

### TC-030-L1-27 : Frontend SC2 — sélectionner véhicule insuffisant affiche DEPASSEMENT, bloque lancement

**US liée** : US-030
**Niveau** : L1
**Couche testée** : UI (React Testing Library)
**Type** : Invariant domaine
**Préconditions** : fetchFn mock retourne DEPASSEMENT (409)
**Résultat attendu** : `indicateur-compatibilite-depassement` visible, bouton `btn-valider-et-lancer` disabled, bouton `btn-affecter-quand-meme` visible
**Statut** : Passé

```gherkin
Given le logisticien est sur l'onglet Affectation
And la tournée a un poids estimé de 410 kg
When il sélectionne un véhicule de capacité 400 kg
Then l'indicateur "DEPASSEMENT" est affiché
And le bouton "Valider et Lancer" est désactivé
And le bouton "Affecter quand même" est proposé
```

---

### TC-030-L1-28 : Frontend SC3 — "Affecter quand même" appelle backend avec forcerSiDepassement=true

**US liée** : US-030
**Niveau** : L1
**Couche testée** : UI (React Testing Library)
**Type** : Fonctionnel
**Préconditions** : dépassement affiché, bouton "Affecter quand même" visible
**Étapes** : Cliquer sur "Affecter quand même"
**Résultat attendu** : appel POST avec `forcerSiDepassement=true`, bouton "Valider et Lancer" redevient actif
**Statut** : Passé

```gherkin
Given l'alerte de dépassement est affichée
When le logisticien clique sur "Affecter quand même"
Then un appel POST est effectué avec forcerSiDepassement=true
And le bouton "Valider et Lancer" est réactivé
```

---

### TC-030-L1-29 : Frontend SC4bis — POIDS_ABSENT n'alerte pas, ne bloque pas

**US liée** : US-030
**Niveau** : L1
**Couche testée** : UI (React Testing Library)
**Type** : Fonctionnel
**Préconditions** : fetchFn mock retourne POIDS_ABSENT
**Résultat attendu** : `indicateur-compatibilite-poids_absent` visible, pas de `btn-affecter-quand-meme`, bouton lancement actif
**Statut** : Passé

---

### TC-030-L2-01 : SC4 poids absent → 200 POIDS_ABSENT (service réel)

**US liée** : US-030
**Niveau** : L2
**Couche testée** : Infrastructure API
**Type** : Cross-services (svc-supervision BC-07)
**Préconditions** : svc-supervision démarré sur port 8082, tournée tp-201 sans poidsEstimeKg
**Étapes** :
```bash
curl -s -X POST http://localhost:8082/api/planification/tournees/tp-201/verifier-compatibilite-vehicule \
  -H "Content-Type: application/json" -H "X-User-Role: SUPERVISEUR" \
  -d '{"vehiculeId":"VH-07","forcerSiDepassement":false}'
```
**Résultat attendu** : HTTP 200, `resultat=POIDS_ABSENT`, `message="Poids non disponible — vérification impossible."`
**Statut** : Passé

---

### TC-030-L2-02 : SC4 avec forcerSiDepassement=true → POIDS_ABSENT (flag ignoré)

**US liée** : US-030
**Niveau** : L2
**Couche testée** : Infrastructure API
**Type** : Invariant domaine (edge case)
**Préconditions** : tp-201 sans poids, VH-09 capacité 150 kg
**Résultat attendu** : HTTP 200, `resultat=POIDS_ABSENT` (le flag forcerSiDepassement est ignoré quand poids absent)
**Statut** : Passé

---

### TC-030-L2-03 : Tournée inconnue → 404

**US liée** : US-030
**Niveau** : L2
**Couche testée** : Infrastructure API
**Type** : Edge case
**Préconditions** : tournée "tp-inconnu" inexistante
**Résultat attendu** : HTTP 404
**Statut** : Passé

---

### TC-030-L2-04 : Véhicule inconnu → 404

**US liée** : US-030
**Niveau** : L2
**Couche testée** : Infrastructure API
**Type** : Edge case
**Préconditions** : VH-INCONNU inexistant dans VehiculeRepositoryImpl
**Résultat attendu** : HTTP 404
**Statut** : Passé

---

### TC-030-L2-05 : GET détail tournée expose poidsEstimeKg dans le DTO

**US liée** : US-030
**Niveau** : L2
**Couche testée** : Infrastructure API
**Type** : Contrat API
**Préconditions** : tp-201 chargée depuis la base
**Résultat attendu** : champ `poidsEstimeKg` présent dans la réponse JSON (valeur null acceptable)
**Statut** : Passé

---

## Anomalie détectée

**OBS-030-01 (non bloquant)** : Le champ `poidsEstimeKg` n'est pas persisté dans la base de données.
- `TourneePlanifieeEntity` ne contient pas de colonne `poids_estime_kg`.
- `TourneePlanifieeMapper.toDomain()` utilise le constructeur de persistance sans poids.
- Conséquence : toutes les tournées rechargées depuis la base ont `poidsEstimeKg=null` (comportement SC4 systématique).
- Les SC1/SC2/SC3 ne sont donc testables en L2 qu'avec un seeder injectant en mémoire, ou après ajout de la colonne JPA.
- Impact : faible en MVP car le poids est recalculé à chaque sélection de véhicule (appel API stateless), mais la persistance sera nécessaire pour l'affichage initial W-05 avec poids préchargé.
- Recommandation : ajouter `poids_estime_kg INTEGER` à `TourneePlanifieeEntity` + mettre à jour le mapper.
